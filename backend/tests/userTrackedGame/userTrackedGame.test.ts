import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    userTrackedGame: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    game: {
      findUnique: jest.fn(),
    },
  },
}));

const { UserTrackedGameService } = await import('../../src/services/userTrackedGameService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('UserTrackedGameService - Testes Unitários', () => {
  let trackedGameService: InstanceType<typeof UserTrackedGameService>;

  beforeEach(() => {
    trackedGameService = new UserTrackedGameService();
    jest.clearAllMocks();
  });

  describe('getTrackedGames', () => {
    it('[Caminho Feliz] deve retornar a lista de jogos monitorados pelo usuário', async () => {
      const userId = 1;
      const mockTrackedGames = [
        {
          userId: 1,
          gameId: 1,
          game: { id: 1, slug: 'mtg', name: 'Magic: The Gathering' },
        },
      ];

      mockedPrisma.userTrackedGame.findMany.mockResolvedValue(mockTrackedGames);

      const result = await trackedGameService.getTrackedGames(userId);

      expect(mockedPrisma.userTrackedGame.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { game: true },
      });
      expect(result).toEqual([{ id: 1, slug: 'mtg', name: 'Magic: The Gathering' }]);
    });
  });

  describe('trackGame', () => {
    it('[Caminho Feliz] deve adicionar ou atualizar o jogo monitorado com sucesso', async () => {
      const userId = 1;
      const gameId = 1;
      const mockGame = { id: 1, slug: 'mtg', name: 'Magic: The Gathering' };
      const mockUpsertResult = { userId, gameId, game: mockGame };

      mockedPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockedPrisma.userTrackedGame.upsert.mockResolvedValue(mockUpsertResult);

      const result = await trackedGameService.trackGame(userId, gameId);

      expect(mockedPrisma.game.findUnique).toHaveBeenCalledWith({ where: { id: gameId } });
      expect(mockedPrisma.userTrackedGame.upsert).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId, gameId },
        },
        update: {},
        create: { userId, gameId },
        include: { game: true },
      });
      expect(result).toEqual(mockGame);
    });

    it('[Caminho de Erro] deve lançar erro se o jogo não for encontrado', async () => {
      mockedPrisma.game.findUnique.mockResolvedValue(null);

      await expect(trackedGameService.trackGame(1, 999)).rejects.toThrow('Jogo não encontrado.');
      expect(mockedPrisma.userTrackedGame.upsert).not.toHaveBeenCalled();
    });
  });

  describe('untrackGame', () => {
    it('[Caminho Feliz] deve deixar de acompanhar o jogo com sucesso', async () => {
      const userId = 1;
      const gameId = 1;

      mockedPrisma.userTrackedGame.findUnique.mockResolvedValue({ userId, gameId });
      mockedPrisma.userTrackedGame.delete.mockResolvedValue({});

      const result = await trackedGameService.untrackGame(userId, gameId);

      expect(mockedPrisma.userTrackedGame.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId, gameId },
        },
      });
      expect(mockedPrisma.userTrackedGame.delete).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId, gameId },
        },
      });
      expect(result).toEqual({ message: 'Jogo removido dos acompanhados com sucesso.' });
    });

    it('[Caminho de Erro] deve lançar erro se o usuário não estiver acompanhando o jogo', async () => {
      mockedPrisma.userTrackedGame.findUnique.mockResolvedValue(null);

      await expect(trackedGameService.untrackGame(1, 1)).rejects.toThrow(
        'O usuário não está acompanhando este jogo.'
      );
      expect(mockedPrisma.userTrackedGame.delete).not.toHaveBeenCalled();
    });
  });
});