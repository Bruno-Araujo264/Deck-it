import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    cardPrice: {
      findMany: jest.fn(),
    },
    userDeck: {
      findFirst: jest.fn(),
    },
  },
}));

const { PriceService } = await import('../../src/services/priceService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('PriceService - Testes Unitários', () => {
  let priceService: InstanceType<typeof PriceService>;

  beforeEach(() => {
    priceService = new PriceService();
    jest.clearAllMocks();
  });

  describe('getCardPrices', () => {
    it('[Caminho Feliz] deve retornar o histórico de preços da carta', async () => {
      const mockPrices = [
        { externalId: 'card-1', price: 150.00, priceType: 'normal', priceDate: new Date() },
      ];

      mockedPrisma.cardPrice.findMany.mockResolvedValue(mockPrices);

      const result = await priceService.getCardPrices('card-1');

      expect(mockedPrisma.cardPrice.findMany).toHaveBeenCalledWith({
        where: { externalId: 'card-1' },
        orderBy: { priceDate: 'desc' },
        take: 30,
      });
      expect(result).toEqual(mockPrices);
    });

    it('[Caminho de Erro] deve lançar erro se não houver preços', async () => {
      mockedPrisma.cardPrice.findMany.mockResolvedValue([]);

      await expect(priceService.getCardPrices('fake-id')).rejects.toThrow(
        'Nenhum registro de preço encontrado para esta carta.'
      );
    });
  });

  describe('getDeckValuation', () => {
    it('[Caminho Feliz] deve calcular o valor total do deck corretamente', async () => {
      const mockDeck = {
        id: 1,
        name: 'Deck Pauper',
        userId: 1,
        items: [
          { cardExternalId: 'card-1', quantity: 4, variant: 'normal' },
        ],
      };

      const mockPrices = [
        { externalId: 'card-1', price: 10.00, priceType: 'normal', priceDate: new Date() },
      ];

      mockedPrisma.userDeck.findFirst.mockResolvedValue(mockDeck);
      mockedPrisma.cardPrice.findMany.mockResolvedValue(mockPrices);

      const result = await priceService.getDeckValuation(1, 1, 'normal');

      expect(result).toHaveProperty('totalEstimatedValue', 40.00);
      expect(result.itemsValuation[0]).toHaveProperty('subtotal', 40.00);
    });

    it('[Caminho de Erro] deve lançar erro se o deck não for encontrado', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue(null);

      await expect(priceService.getDeckValuation(1, 99)).rejects.toThrow(
        'Deck não encontrado ou acesso negado.'
      );
    });
  });
});