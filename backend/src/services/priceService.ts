import prisma from '../db/client.js';

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
}