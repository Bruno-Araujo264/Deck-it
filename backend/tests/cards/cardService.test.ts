import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    card: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const { CardService } = await import('../../src/services/cardService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('CardService - Testes Unitários', () => {
  let cardService: InstanceType<typeof CardService>;

  beforeEach(() => {
    cardService = new CardService();
    jest.clearAllMocks();
  });

  describe('getCards', () => {
    it('[Caminho Feliz] deve retornar a lista paginada de cartas com metadados', async () => {
      const mockCards = [
        { externalId: 'card-1', name: 'Black Lotus', gameId: 1 },
        { externalId: 'card-2', name: 'Lightning Bolt', gameId: 1 },
      ];

      mockedPrisma.card.findMany.mockResolvedValue(mockCards);
      mockedPrisma.card.count.mockResolvedValue(2);

      const result = await cardService.getCards({ page: 1, limit: 10 });

      expect(mockedPrisma.card.findMany).toHaveBeenCalled();
      expect(mockedPrisma.card.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockCards,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('getCardByExternalId', () => {
    it('[Caminho Feliz] deve retornar os detalhes da carta quando encontrada', async () => {
      const mockCard = { externalId: 'card-1', name: 'Black Lotus', gameId: 1 };
      mockedPrisma.card.findFirst.mockResolvedValue(mockCard);

      const result = await cardService.getCardByExternalId('card-1');

      expect(mockedPrisma.card.findFirst).toHaveBeenCalledWith({
        where: { externalId: 'card-1' },
      });
      expect(result).toEqual(mockCard);
    });

    it('[Caminho de Erro] deve lançar erro se a carta não for encontrada', async () => {
      mockedPrisma.card.findFirst.mockResolvedValue(null);

      await expect(cardService.getCardByExternalId('fake-id')).rejects.toThrow(
        'Carta não encontrada no catálogo.'
      );
    });
  });
});