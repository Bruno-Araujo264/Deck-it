import prisma from '../db/client.js';
import { getBrlRates } from './exchangeService.js';

/**
 * Tipos de preço gravados pelo ETL, na ordem de preferência para o "valor estimado".
 * Magic (Scryfall): usd, usd_foil, usd_etched, eur, eur_foil, tix.
 * Pokémon (TCGdex): usd (TCGplayer normal), usd_holo, usd_reverse, eur (Cardmarket trend), eur_holo.
 */
const PRICE_PRIORITY = ['usd', 'usd_holo', 'usd_reverse', 'usd_foil', 'usd_etched', 'eur', 'eur_holo', 'eur_foil'];

function currencyOf(priceType: string): 'USD' | 'EUR' | 'TIX' {
  if (priceType.startsWith('eur')) return 'EUR';
  if (priceType === 'tix') return 'TIX';
  return 'USD';
}

export class PriceService {
  // Buscar histórico ou preços atuais de uma carta pelo externalId
  public async getCardPrices(externalId: string, priceType?: string) {
    const prices = await prisma.cardPrice.findMany({
      where: {
        externalId,
        ...(priceType ? { priceType } : {}),
      },
      orderBy: { priceDate: 'desc' },
      take: 30, // Limita aos últimos 30 registros de preço
    });

    if (!prices || prices.length === 0) {
      throw new Error('Nenhum registro de preço encontrado para esta carta.');
    }

    return prices;
  }

  // Calcular o valor total de mercado de um deck do usuário
  public async getDeckValuation(userId: number, deckId: number, priceType: string = 'normal') {
    // 1. Validar se o deck pertence ao usuário e buscar os itens
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
      include: { items: true },
    });

    if (!deck) {
      throw new Error('Deck não encontrado ou acesso negado.');
    }

    if (deck.items.length === 0) {
      return {
        deckId,
        deckName: deck.name,
        totalEstimatedValue: 0,
        itemsValuation: [],
      };
    }

    const externalIds = deck.items.map((item) => item.cardExternalId);

    // 2. Buscar os preços mais recentes para as cartas do deck considerando o tipo de preço (ex: normal, foil)
    // Para simplificar e pegar o mais recente por externalId, buscamos os preços filtrados
    const prices = await prisma.cardPrice.findMany({
      where: {
        externalId: { in: externalIds },
        priceType,
      },
      orderBy: { priceDate: 'desc' },
    });

    // Mapeia o preço mais recente por externalId
    const latestPriceMap = new Map<string, number>();
    for (const p of prices) {
      if (!latestPriceMap.has(p.externalId)) {
        latestPriceMap.set(p.externalId, Number(p.price));
      }
    }

    // 3. Calcular o valor total multiplicando pela quantidade de cada carta no deck
    let totalEstimatedValue = 0;
    const itemsValuation = deck.items.map((item) => {
      const unitPrice = latestPriceMap.get(item.cardExternalId) || 0;
      const subtotal = unitPrice * item.quantity;
      totalEstimatedValue += subtotal;

      return {
        cardExternalId: item.cardExternalId,
        quantity: item.quantity,
        variant: item.variant,
        unitPrice,
        subtotal,
      };
    });

    return {
      deckId,
      deckName: deck.name,
      currency: 'BRL', 
      totalEstimatedValue: Number(totalEstimatedValue.toFixed(2)),
      itemsValuation,
    };
  }

  /**
   * Preço de mercado atual da carta: o registro mais recente de cada tipo de preço,
   * convertido para reais pela cotação do dia. Não lança erro se a carta não tiver preço.
   */
  public async getCardMarket(externalId: string, gameId?: number) {
    const rows = await prisma.cardPrice.findMany({
      where: { externalId, ...(gameId !== undefined ? { gameId } : {}) },
      orderBy: { priceDate: 'desc' },
      take: 60,
    });

    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!latest.has(row.priceType)) latest.set(row.priceType, row);
    }

    const rates = await getBrlRates();
    const toBrl = (value: number, currency: string) => {
      const rate = currency === 'USD' ? rates?.USD : currency === 'EUR' ? rates?.EUR : undefined;
      return rate ? Number((value * rate).toFixed(2)) : null;
    };

    const prices = [...latest.values()]
      .map((row) => {
        const currency = currencyOf(row.priceType);
        const value = Number(row.price);
        return {
          priceType: row.priceType,
          currency,
          value,
          valueBrl: toBrl(value, currency),
          priceDate: row.priceDate,
        };
      })
      .sort((a, b) => {
        const ia = PRICE_PRIORITY.indexOf(a.priceType);
        const ib = PRICE_PRIORITY.indexOf(b.priceType);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });

    const main = prices.find((p) => PRICE_PRIORITY.includes(p.priceType) && p.value > 0) ?? null;

    return {
      externalId,
      estimated: main
        ? { priceType: main.priceType, currency: main.currency, value: main.value, valueBrl: main.valueBrl }
        : null,
      prices,
      rates,
    };
  }
}
