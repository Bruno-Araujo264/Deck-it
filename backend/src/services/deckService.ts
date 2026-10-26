import prisma from '../db/client.js';

export class DeckService {
  public async createDeck(userId: number, gameId: number, name: string) {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      throw new Error('Jogo não encontrado.');
    }

    return await prisma.userDeck.create({
      data: { userId, gameId, name },
      include: { game: { select: { name: true, slug: true } } },
    });
  }

  public async getUserDecks(userId: number, gameId?: number) {
    return await prisma.userDeck.findMany({
      where: {
        userId,
        ...(gameId ? { gameId } : {}),
      },
      include: {
        game: { select: { name: true, slug: true } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async updateDeck(userId: number, deckId: number, name: string) {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      throw new Error('Deck não encontrado ou acesso negado.');
    }

    return await prisma.userDeck.update({
      where: { id: deckId },
      data: { name },
    });
  }

  public async deleteDeck(userId: number, deckId: number) {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      throw new Error('Deck não encontrado ou acesso negado.');
    }

    await prisma.userDeck.delete({
      where: { id: deckId },
    });

    return { message: 'Deck deletado com sucesso!' };
  }

  public async addCardToDeck(
    userId: number,
    deckId: number,
    cardExternalId: string,
    quantity: number = 1,
    variant: string = 'normal',
    condition: string = 'near_mint'
  ) {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      throw new Error('Deck não encontrado ou acesso negado.');
    }

    // --- VALIDAÇÃO: Garante que a carta existe no catálogo para este jogo ---
    const cardExists = await prisma.card.findFirst({
      where: {
        externalId: cardExternalId,
        gameId: deck.gameId,
      },
    });

    if (!cardExists) {
      throw new Error('Carta não encontrada no catálogo para este jogo.');
    }

    return await prisma.userDeckItem.upsert({
      where: {
        deckId_cardExternalId_variant: {
          deckId,
          cardExternalId,
          variant,
        },
      },
      update: {
        quantity: { increment: quantity },
        condition,
      },
      create: {
        deckId,
        cardExternalId,
        quantity,
        variant,
        condition,
      },
    });
  }

  public async getDeckItems(userId: number, deckId: number) {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
      include: {
        items: true,
        game: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!deck) {
      throw new Error('Deck não encontrado ou acesso negado.');
    }

    if (deck.items.length === 0) {
      return { ...deck, items: [] };
    }

    // --- ENRIQUECIMENTO: Busca os dados da view Card em lote ---
    const externalIds = deck.items.map((item) => item.cardExternalId);

    const cards = await prisma.card.findMany({
      where: {
        gameId: deck.gameId,
        externalId: { in: externalIds },
      },
    });

    const cardMap = new Map(cards.map((card) => [card.externalId, card]));

    const itemsWithCardData = deck.items.map((item) => ({
      ...item,
      cardDetails: cardMap.get(item.cardExternalId) || null,
    }));

    return {
      ...deck,
      items: itemsWithCardData,
    };
  }

  public async removeCardFromDeck(userId: number, deckId: number, itemId: number) {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      throw new Error('Deck não encontrado ou acesso negado.');
    }

    const item = await prisma.userDeckItem.findFirst({
      where: { id: itemId, deckId },
    });

    if (!item) {
      throw new Error('Carta não encontrada neste deck.');
    }

    await prisma.userDeckItem.delete({
      where: { id: itemId },
    });

    return { message: 'Carta removida do deck com sucesso!' };
  }
}