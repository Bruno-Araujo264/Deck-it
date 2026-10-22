import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    game: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const { GameService } = await import('../../src/services/gameService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('GameService - Testes Unitários Completos', () => {
  let gameService: InstanceType<typeof GameService>;

  beforeEach(() => {
    gameService = new GameService();
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('[Caminho Feliz] deve criar um novo jogo com sucesso aceitando a lista sourceApi', async () => {
      const inputData = {
        slug: 'zelda-botw',
        name: 'The Legend of Zelda: Breath of the Wild',
        sourceApi: ['https://api.rawg.io/api/games/zelda'],
      };
      const mockResult = { id: 1, ...inputData, createdAt: new Date() };

      mockedPrisma.game.create.mockResolvedValue(mockResult);

      const result = await gameService.createGame(inputData);

      expect(mockedPrisma.game.create).toHaveBeenCalledWith({ data: inputData });
      expect(result).toEqual(mockResult);
      expect(result.sourceApi).toHaveLength(1);
    });

    it('[Caminho de Erro] deve propagar erro caso a criação no banco falhe', async () => {
      const inputData = { slug: 'erro', name: 'Erro', sourceApi: ['url'] };
      mockedPrisma.game.create.mockRejectedValue(new Error('Erro de conexão com o banco'));

      await expect(gameService.createGame(inputData)).rejects.toThrow('Erro de conexão com o banco');
    });
  });

  describe('getAllGames', () => {
    it('[Caminho Feliz] deve retornar todos os jogos cadastrados', async () => {
      const mockGames = [
        { id: 1, slug: 'game-1', name: 'Game 1', sourceApi: ['url1'] },
        { id: 2, slug: 'game-2', name: 'Game 2', sourceApi: ['url2'] },
      ];

      mockedPrisma.game.findMany.mockResolvedValue(mockGames);

      const result = await gameService.getAllGames();

      expect(mockedPrisma.game.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockGames);
    });

    it('[Caminho Feliz] deve retornar array vazio se não houver jogos', async () => {
      mockedPrisma.game.findMany.mockResolvedValue([]);

      const result = await gameService.getAllGames();

      expect(result).toEqual([]);
    });
  });

  describe('getGameById', () => {
    it('[Caminho Feliz] deve retornar um jogo específico pelo ID', async () => {
      const mockGame = { id: 1, slug: 'game-1', name: 'Game 1', sourceApi: ['url1'] };
      mockedPrisma.game.findUnique.mockResolvedValue(mockGame);

      const result = await gameService.getGameById(1);

      expect(mockedPrisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockGame);
    });

    it('[Caminho Feliz] deve retornar null se o ID não existir', async () => {
      mockedPrisma.game.findUnique.mockResolvedValue(null);

      const result = await gameService.getGameById(999);

      expect(result).toBeNull();
    });
  });

  describe('searchGames', () => {
    it('[Caminho Feliz] deve buscar jogos de forma case-insensitive usando o operador contains', async () => {
      const query = 'zelda';
      const mockGames = [{ id: 1, slug: 'zelda-botw', name: 'Zelda', sourceApi: ['url'] }];

      mockedPrisma.game.findMany.mockResolvedValue(mockGames);

      const result = await gameService.searchGames(query);

      expect(mockedPrisma.game.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
      expect(result).toEqual(mockGames);
    });
  });

  describe('updateGame', () => {
    it('[Caminho Feliz] deve atualizar os dados do jogo e a lista sourceApi', async () => {
      const updateData = { name: 'Novo Nome', sourceApi: ['new-url'] };
      const mockUpdated = { id: 1, slug: 'game-1', ...updateData };

      mockedPrisma.game.update.mockResolvedValue(mockUpdated);

      const result = await gameService.updateGame(1, updateData);

      expect(mockedPrisma.game.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteGame', () => {
    it('[Caminho Feliz] deve deletar um jogo pelo ID com sucesso', async () => {
      mockedPrisma.game.delete.mockResolvedValue({ id: 1 });

      await gameService.deleteGame(1);

      expect(mockedPrisma.game.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});