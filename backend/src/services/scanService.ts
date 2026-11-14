import prisma from '../db/client.js';
import { AiService, AiServiceError } from './aiService.js';

/** O que a IA consegue ler da foto da carta. */
export interface CardReading {
  isCard: boolean;
  game: 'mtg' | 'pokemon' | 'yugioh' | 'lorcana' | 'other' | 'unknown';
  name: string | null;
  englishName: string | null;
  setCode: string | null;
  collectorNumber: string | null;
  language: string | null;
  confidence: number;
}

export type MatchType = 'set_number' | 'name_number' | 'name_exact' | 'name_partial' | 'none';

const SCAN_PROMPT = `Você analisa fotos de cartas de Trading Card Games (Magic: The Gathering, Pokémon TCG, Yu-Gi-Oh!, Lorcana etc).
Leia a carta da foto e devolva SOMENTE o JSON pedido.
- game: "mtg", "pokemon", "yugioh", "lorcana", "other" ou "unknown".
- name: o nome exatamente como impresso na carta.
- englishName: o nome oficial da carta em inglês (se a carta já estiver em inglês, repita o nome). Vazio se não souber.
- setCode: o código da coleção impresso na carta. Em Magic fica no canto inferior esquerdo (ex.: "MKM").
  Em Pokémon são as 2-4 letras no rodapé, perto do número (ex.: "SVI", "PAL", "MEW"); cartas antigas não têm, então deixe vazio.
  Deixe vazio se não estiver legível. Nunca descreva o símbolo da coleção em palavras.
- collectorNumber: o número de colecionador sem zeros à esquerda e sem o total (ex.: "0123/0286" → "123", "025/198" → "25"; promos como "SWSH050" ficam como impressos). Deixe vazio se não estiver legível.
- language: código ISO 639-1 do idioma impresso (ex.: "pt", "en").
- confidence: de 0 a 1, o quanto você tem certeza do nome.
- isCard: false se a foto não for de uma carta de TCG.
Não invente: se algo não estiver legível, use string vazia "".`;

const READING_SCHEMA = {
  type: 'object',
  properties: {
    isCard: { type: 'boolean' },
    game: { type: 'string', enum: ['mtg', 'pokemon', 'yugioh', 'lorcana', 'other', 'unknown'] },
    name: { type: 'string' },
    englishName: { type: 'string' },
    setCode: { type: 'string' },
    collectorNumber: { type: 'string' },
    language: { type: 'string' },
    confidence: { type: 'number' },
  },
  required: ['isCard', 'game', 'name', 'englishName', 'setCode', 'collectorNumber', 'language', 'confidence'],
};

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const MAX_IMAGE_BASE64 = 7 * 1024 * 1024; // ~5 MB de imagem
const CANDIDATE_LIMIT = 6;

export class ScanService {
  constructor(private readonly ai = new AiService()) {}

  public async identifyCard(imageBase64: string, mimeType = 'image/jpeg', gameId?: number) {
    const data = imageBase64.replace(/^data:[^;]+;base64,/, '');
    if (!data) {
      throw new AiServiceError('Imagem não enviada.', 400);
    }
    if (data.length > MAX_IMAGE_BASE64) {
      throw new AiServiceError('Imagem muito grande. Tire a foto novamente.', 413);
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new AiServiceError('Formato de imagem não suportado.', 400);
    }

    const raw = await this.ai.generateJson<Record<string, unknown>>({
      input: [
        { type: 'text', text: SCAN_PROMPT },
        { type: 'image', data, mime_type: mimeType },
      ],
      jsonSchema: READING_SCHEMA,
      maxOutputTokens: 400,
    });
    const reading = normalizeReading(raw);

    if (!reading.isCard || !reading.name) {
      return { reading, game: null, supported: false, matchType: 'none' as MatchType, match: null, candidates: [] };
    }

    // Descobre o jogo no catálogo: pelo gameId do deck (se veio) ou pelo slug lido pela IA.
    const game = gameId
      ? await prisma.game.findUnique({ where: { id: gameId } })
      : await prisma.game.findUnique({ where: { slug: reading.game } });

    if (!game) {
      return { reading, game: null, supported: false, matchType: 'none' as MatchType, match: null, candidates: [] };
    }

    const { matchType, cards } = await this.findInCatalog(game.id, reading);

    return {
      reading,
      game: { id: game.id, slug: game.slug, name: game.name },
      supported: true,
      matchType,
      // Só considera "certeza" quando número + coleção (ou número + nome, com resultado único) batem.
      match: matchType === 'set_number' || matchType === 'name_number' ? cards[0] ?? null : null,
      candidates: cards,
    };
  }

  /**
   * Cruza a leitura com a view `cards`, do mais preciso para o menos preciso:
   * 1. coleção + número de colecionador (identifica a impressão exata), conferindo o nome
   * 2. nome + número (cartas sem código de coleção impresso)
   * 3. nome exato (em inglês ou como impresso)
   * 4. nome parcial
   */
  private async findInCatalog(gameId: number, reading: CardReading): Promise<{ matchType: MatchType; cards: any[] }> {
    const setCode = reading.setCode?.trim();
    const collectorNumber = reading.collectorNumber?.trim().replace(/^0+(?=\d)/, '');

    const names = [...new Set([reading.englishName, reading.name].map((n) => n?.trim()).filter(Boolean))] as string[];

    if (setCode && collectorNumber) {
      const cards = await prisma.card.findMany({
        where: { gameId, setCode: setCode.toLowerCase(), collectorNumber },
        orderBy: { externalId: 'asc' },
        take: CANDIDATE_LIMIT,
      });
      // Confere o nome para não registrar a carta errada se a IA leu o código/número errado.
      const confirmed = cards.filter((card) => sameName(card.name, names));
      if (confirmed.length > 0) return { matchType: 'set_number', cards: confirmed };
    }

    // Sem código de coleção (ex.: Pokémon antigo): nome + número costuma bastar.
    if (collectorNumber) {
      for (const name of names) {
        const cards = await prisma.card.findMany({
          where: { gameId, name, collectorNumber },
          orderBy: { releasedAt: 'desc' },
          take: CANDIDATE_LIMIT,
        });
        if (cards.length === 1) return { matchType: 'name_number', cards };
        if (cards.length > 1) return { matchType: 'name_exact', cards };
      }
    }

    if (setCode) {
      for (const name of names) {
        const cards = await prisma.card.findMany({
          where: { gameId, name, setCode: setCode.toLowerCase() },
          orderBy: { externalId: 'asc' },
          take: CANDIDATE_LIMIT,
        });
        if (cards.length > 0) return { matchType: 'name_exact', cards };
      }
    }

    for (const name of names) {
      const cards = await prisma.card.findMany({
        where: { gameId, name },
        orderBy: { releasedAt: 'desc' },
        take: CANDIDATE_LIMIT,
      });
      if (cards.length > 0) return { matchType: 'name_exact', cards };
    }

    for (const name of names) {
      const cards = await prisma.card.findMany({
        where: { gameId, name: { contains: name } },
        orderBy: { releasedAt: 'desc' },
        take: CANDIDATE_LIMIT,
      });
      if (cards.length > 0) return { matchType: 'name_partial', cards };
    }

    return { matchType: 'none', cards: [] };
  }
}

/** Compara nomes ignorando acentos/maiúsculas; aceita "Fire // Ice" contra "Fire". */
function sameName(cardName: string, names: string[]) {
  const norm = (v: string) => v.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
  const target = norm(cardName);
  return names.length === 0 || names.some((n) => {
    const name = norm(n);
    return target.includes(name) || name.includes(target);
  });
}

/** Garante o formato esperado mesmo se a IA devolver campos vazios ou fora do schema. */
function normalizeReading(raw: Record<string, unknown>): CardReading {
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
  const games: CardReading['game'][] = ['mtg', 'pokemon', 'yugioh', 'lorcana', 'other', 'unknown'];
  const game = games.includes(raw.game as CardReading['game']) ? (raw.game as CardReading['game']) : 'unknown';
  const confidence = typeof raw.confidence === 'number' ? Math.min(Math.max(raw.confidence, 0), 1) : 0;

  return {
    isCard: raw.isCard === true,
    game,
    name: text(raw.name),
    englishName: text(raw.englishName),
    setCode: text(raw.setCode),
    collectorNumber: text(raw.collectorNumber),
    language: text(raw.language),
    confidence,
  };
}
