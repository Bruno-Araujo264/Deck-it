import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    card: { findMany: jest.fn() },
    game: { findUnique: jest.fn() },
  },
}));

const { ScanService } = await import('../../src/services/scanService.js');
const { AiServiceError } = await import('../../src/services/aiService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;
const fetchMock = jest.fn<typeof fetch>();
const IMAGE = 'aGVsbG8='; // base64 qualquer

/** Simula a resposta da Interactions API do Gemini com o JSON lido da carta. */
function geminiReturns(reading: Record<string, unknown>) {
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        status: 'completed',
        steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify(reading) }] }],
      }),
      { status: 200 },
    ),
  );
}

const MTG = { id: 1, slug: 'mtg', name: 'Magic: The Gathering' };
const reading = {
  isCard: true,
  game: 'mtg',
  name: 'Relâmpago',
  englishName: 'Lightning Bolt',
  setCode: 'M10',
  collectorNumber: '0146',
  language: 'pt',
  confidence: 0.95,
};

describe('ScanService - Testes Unitários', () => {
  let scanService: InstanceType<typeof ScanService>;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    global.fetch = fetchMock as any;
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_FALLBACK_MODELS;
    jest.restoreAllMocks();
    scanService = new ScanService();
  });

  it('[Caminho Feliz] identifica a impressão exata por coleção + número', async () => {
    geminiReturns(reading);
    mockedPrisma.game.findUnique.mockResolvedValue(MTG);
    const card = { externalId: 'abc', name: 'Lightning Bolt', setCode: 'm10', collectorNumber: '146' };
    mockedPrisma.card.findMany.mockResolvedValueOnce([card]);

    const result = await scanService.identifyCard(IMAGE, 'image/jpeg');

    expect(result.matchType).toBe('set_number');
    expect(result.match).toEqual(card);
    expect(result.supported).toBe(true);
    // zeros à esquerda removidos e código da coleção em minúsculas
    expect(mockedPrisma.card.findMany.mock.calls[0][0].where).toEqual({
      gameId: 1,
      setCode: 'm10',
      collectorNumber: '146',
    });

    // a requisição ao Gemini leva a chave no header e a imagem inline
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/v1beta/interactions');
    expect((init!.headers as any)['x-goog-api-key']).toBe('test-key');
    const body = JSON.parse(String(init!.body));
    expect(body.model).toBe('gemini-3.5-flash-lite');
    expect(body.input[1]).toEqual({ type: 'image', data: IMAGE, mime_type: 'image/jpeg' });
    expect(body.response_format.mime_type).toBe('application/json');
  });

  it('cai para o nome em inglês e devolve candidatos sem registrar automaticamente', async () => {
    geminiReturns({ ...reading, setCode: '', collectorNumber: '' });
    mockedPrisma.game.findUnique.mockResolvedValue(MTG);
    const printings = [{ externalId: 'p1' }, { externalId: 'p2' }];
    mockedPrisma.card.findMany.mockResolvedValueOnce(printings);

    const result = await scanService.identifyCard(IMAGE);

    expect(result.matchType).toBe('name_exact');
    expect(result.match).toBeNull();
    expect(result.candidates).toEqual(printings);
    expect(mockedPrisma.card.findMany.mock.calls[0][0].where).toEqual({ gameId: 1, name: 'Lightning Bolt' });
  });

  it('ignora coleção + número quando o nome não confere (evita registrar a carta errada)', async () => {
    geminiReturns(reading);
    mockedPrisma.game.findUnique.mockResolvedValue(MTG);
    mockedPrisma.card.findMany
      .mockResolvedValueOnce([{ externalId: 'x', name: 'Giant Growth' }]) // coleção + número
      .mockResolvedValueOnce([]) // nome + número (Lightning Bolt)
      .mockResolvedValueOnce([]) // nome + número (Relâmpago)
      .mockResolvedValueOnce([{ externalId: 'abc', name: 'Lightning Bolt' }]); // nome + coleção

    const result = await scanService.identifyCard(IMAGE);

    expect(result.match).toBeNull();
    expect(result.matchType).toBe('name_exact');
    expect(result.candidates).toEqual([{ externalId: 'abc', name: 'Lightning Bolt' }]);
  });

  it('[Pokémon] identifica carta antiga sem código de coleção por nome + número', async () => {
    const POKEMON = { id: 2, slug: 'pokemon', name: 'Pokémon TCG' };
    geminiReturns({ ...reading, game: 'pokemon', name: 'Charizard', englishName: 'Charizard', setCode: '', collectorNumber: '4' });
    mockedPrisma.game.findUnique.mockResolvedValue(POKEMON);
    const card = { externalId: 'base1-4', name: 'Charizard', collectorNumber: '4' };
    mockedPrisma.card.findMany.mockResolvedValueOnce([card]);

    const result = await scanService.identifyCard(IMAGE);

    expect(mockedPrisma.game.findUnique).toHaveBeenCalledWith({ where: { slug: 'pokemon' } });
    expect(mockedPrisma.card.findMany.mock.calls[0][0].where).toEqual({ gameId: 2, name: 'Charizard', collectorNumber: '4' });
    expect(result.matchType).toBe('name_number');
    expect(result.match).toEqual(card);
  });

  it('usa o gameId do deck quando informado', async () => {
    geminiReturns(reading);
    mockedPrisma.game.findUnique.mockResolvedValue(MTG);
    mockedPrisma.card.findMany.mockResolvedValue([]);

    const result = await scanService.identifyCard(IMAGE, 'image/jpeg', 1);

    expect(mockedPrisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result.matchType).toBe('none');
    expect(result.candidates).toEqual([]);
  });

  it('marca como não suportado quando o jogo não está no catálogo (ex.: Pokémon)', async () => {
    geminiReturns({ ...reading, game: 'pokemon', name: 'Pikachu', englishName: 'Pikachu' });
    mockedPrisma.game.findUnique.mockResolvedValue(null);

    const result = await scanService.identifyCard(IMAGE);

    expect(result.supported).toBe(false);
    expect(result.reading.game).toBe('pokemon');
    expect(mockedPrisma.card.findMany).not.toHaveBeenCalled();
  });

  it('não consulta o catálogo quando a foto não é de uma carta', async () => {
    geminiReturns({ ...reading, isCard: false, name: '' });

    const result = await scanService.identifyCard(IMAGE);

    expect(result.reading.isCard).toBe(false);
    expect(result.reading.name).toBeNull();
    expect(mockedPrisma.game.findUnique).not.toHaveBeenCalled();
  });

  it('[Erro] rejeita formato de imagem não suportado sem chamar a IA', async () => {
    await expect(scanService.identifyCard(IMAGE, 'application/pdf')).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('[Erro] retorna 503 quando a GEMINI_API_KEY não está configurada', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(scanService.identifyCard(IMAGE)).rejects.toBeInstanceOf(AiServiceError);
    await expect(scanService.identifyCard(IMAGE)).rejects.toMatchObject({ status: 503 });
  });

  it('[Erro] traduz limite de uso (429) quando todos os modelos estão sem cota', async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ error: { message: 'quota' } }), { status: 429 }));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(scanService.identifyCard(IMAGE)).rejects.toMatchObject({ status: 429 });
    // um modelo sem cota não é repetido: passa direto para o de reserva
    const models = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init!.body)).model);
    expect(models).toEqual(['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']);
  });

  it('tenta de novo e usa o modelo de reserva quando o Gemini está sobrecarregado (503)', async () => {
    const overloaded = () => new Response(JSON.stringify({ error: { message: 'high demand' } }), { status: 503 });
    fetchMock.mockResolvedValueOnce(overloaded()).mockResolvedValueOnce(overloaded());
    geminiReturns({ ...reading, isCard: false, name: '' });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await scanService.identifyCard(IMAGE);

    expect(result.reading.isCard).toBe(false);
    const models = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init!.body)).model);
    expect(models).toEqual(['gemini-3.5-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']);
  }, 10_000);
});
