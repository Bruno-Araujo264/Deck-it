import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    game: {
      findUnique: jest.fn(),
    },
    userDeck: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userDeckItem: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    card: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { DeckService } = await import('../../src/services/deckService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('DeckService - Testes Unitários Completo', () => {
  let deckService: InstanceType<typeof DeckService>;

  beforeEach(() => {
    deckService = new DeckService();
    jest.clearAllMocks();
  });

  describe('createDeck', () => {
    it('[Caminho Feliz] deve criar um deck com sucesso', async () => {
      mockedPrisma.game.findUnique.mockResolvedValue({ id: 1, name: 'Magic: The Gathering' });
      mockedPrisma.userDeck.create.mockResolvedValue({ id: 10, userId: 1, gameId: 1, name: 'Deck Commander' });

      const result = await deckService.createDeck(1, 1, 'Deck Commander');

      expect(mockedPrisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockedPrisma.userDeck.create).toHaveBeenCalledWith({
        data: { userId: 1, gameId: 1, name: 'Deck Commander' },
        include: { game: { select: { name: true, slug: true } } },
      });
      expect(result).toHaveProperty('id', 10);
    });

    it('[Caminho de Erro] deve lançar erro se o jogo não existir', async () => {
      mockedPrisma.game.findUnique.mockResolvedValue(null);

      await expect(deckService.createDeck(1, 999, 'Deck')).rejects.toThrow('Jogo não encontrado.');
      expect(mockedPrisma.userDeck.create).not.toHaveBeenCalled();
    });
  });

  describe('updateDeck', () => {
    it('[Caminho Feliz] deve atualizar o nome do deck pertencente ao usuário', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue({ id: 10, userId: 1, name: 'Antigo Nome' });
      mockedPrisma.userDeck.update.mockResolvedValue({ id: 10, userId: 1, name: 'Novo Nome' });

      const result = await deckService.updateDeck(1, 10, 'Novo Nome');

      expect(mockedPrisma.userDeck.findFirst).toHaveBeenCalledWith({ where: { id: 10, userId: 1 } });
      expect(mockedPrisma.userDeck.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { name: 'Novo Nome' },
      });
      expect(result).toHaveProperty('name', 'Novo Nome');
    });

    it('[Caminho de Erro] deve lançar erro ao tentar atualizar deck inexistente ou de outro usuário', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue(null);

      await expect(deckService.updateDeck(1, 99, 'Novo Nome')).rejects.toThrow(
        'Deck não encontrado ou acesso negado.'
      );
      expect(mockedPrisma.userDeck.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteDeck', () => {
    it('[Caminho Feliz] deve deletar o deck pertencente ao usuário', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue({ id: 10, userId: 1 });
      mockedPrisma.userDeck.delete.mockResolvedValue({});

      const result = await deckService.deleteDeck(1, 10);

      expect(mockedPrisma.userDeck.findFirst).toHaveBeenCalledWith({ where: { id: 10, userId: 1 } });
      expect(mockedPrisma.userDeck.delete).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(result).toEqual({ message: 'Deck deletado com sucesso!' });
    });

    it('[Caminho de Erro] deve lançar erro ao tentar deletar deck inexistente', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue(null);

      await expect(deckService.deleteDeck(1, 99)).rejects.toThrow('Deck não encontrado ou acesso negado.');
      expect(mockedPrisma.userDeck.delete).not.toHaveBeenCalled();
    });
  });

  describe('addCardToDeck', () => {
    it('[Caminho Feliz] deve fazer upsert da carta no deck se a carta existir no catálogo', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue({ id: 10, userId: 1, gameId: 1 });
      mockedPrisma.card.findFirst.mockResolvedValue({ externalId: 'card-abc', gameId: 1 });
      mockedPrisma.userDeckItem.upsert.mockResolvedValue({ id: 100, deckId: 10, cardExternalId: 'card-abc', quantity: 4 });

      const result = await deckService.addCardToDeck(1, 10, 'card-abc', 4);

      expect(mockedPrisma.card.findFirst).toHaveBeenCalledWith({
        where: { externalId: 'card-abc', gameId: 1 },
      });
      expect(mockedPrisma.userDeckItem.upsert).toHaveBeenCalled();
      expect(result).toHaveProperty('quantity', 4);
    });

    it('[Caminho de Erro] deve lançar erro se a carta não existir no catálogo', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue({ id: 10, userId: 1, gameId: 1 });
      mockedPrisma.card.findFirst.mockResolvedValue(null); // Carta não encontrada

      await expect(deckService.addCardToDeck(1, 10, 'carta-falsa')).rejects.toThrow(
        'Carta não encontrada no catálogo para este jogo.'
      );
      expect(mockedPrisma.userDeckItem.upsert).not.toHaveBeenCalled();
    });

    it('[Caminho de Erro] deve recusar inserção se o deck não pertencer ao usuário', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue(null);

      await expect(deckService.addCardToDeck(1, 99, 'card-abc')).rejects.toThrow(
        'Deck não encontrado ou acesso negado.'
      );
      expect(mockedPrisma.userDeckItem.upsert).not.toHaveBeenCalled();
    });
  });

  describe('removeCardFromDeck', () => {
    it('[Caminho Feliz] deve remover o item do deck com sucesso', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue({ id: 10, userId: 1 });
      mockedPrisma.userDeckItem.findFirst.mockResolvedValue({ id: 50, deckId: 10 });
      mockedPrisma.userDeckItem.delete.mockResolvedValue({});

      const result = await deckService.removeCardFromDeck(1, 10, 50);

      expect(mockedPrisma.userDeckItem.delete).toHaveBeenCalledWith({ where: { id: 50 } });
      expect(result).toEqual({ message: 'Carta removida do deck com sucesso!' });
    });

    it('[Caminho de Erro] deve lançar erro se a carta não pertencer ao deck informado', async () => {
      mockedPrisma.userDeck.findFirst.mockResolvedValue({ id: 10, userId: 1 });
      mockedPrisma.userDeckItem.findFirst.mockResolvedValue(null);

      await expect(deckService.removeCardFromDeck(1, 10, 999)).rejects.toThrow(
        'Carta não encontrada neste deck.'
      );
      expect(mockedPrisma.userDeckItem.delete).not.toHaveBeenCalled();
    });
  });
});