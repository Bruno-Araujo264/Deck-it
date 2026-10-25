import prisma from '../db/client.js';

export interface CardFilterParams {
  gameId?: number | undefined;
  name?: string | undefined;
  rarity?: string | undefined;
  setCode?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export class CardService {
  public async getCards(filters: CardFilterParams) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.gameId !== undefined) {
      whereClause.gameId = filters.gameId;
    }

    if (filters.name) {
      whereClause.name = {
        contains: filters.name,
      };
    }

    if (filters.rarity) {
      whereClause.rarity = filters.rarity;
    }

    if (filters.setCode) {
      whereClause.setCode = filters.setCode;
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: { name: 'asc' },
      }),
      prisma.card.count({ where: whereClause }),
    ]);

    return {
      data: cards,
      meta: {
        total,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  public async getCardByExternalId(externalId: string, gameId?: number) {
    const card = await prisma.card.findFirst({
      where: {
        externalId,
        ...(gameId !== undefined ? { gameId } : {}),
      },
    });

    if (!card) {
      throw new Error('Carta não encontrada no catálogo.');
    }

    return card;
  }
}