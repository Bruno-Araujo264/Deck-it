import { jest } from '@jest/globals';
import type { Response } from 'express';
import { UserTrackedGameController } from '../../src/controllers/userTrackedGameController.js';
import { UserTrackedGameService } from '../../src/services/userTrackedGameService.js';
import type { AuthRequest } from '../../src/middlewares/authMiddleware.js';

describe('UserTrackedGameController - Testes Unitários', () => {
  let trackedGameController: UserTrackedGameController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    trackedGameController = new UserTrackedGameController();
    responseObject = {};
    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockImplementation((status) => {
        responseObject.status = status;
        return mockResponse as Response;
      }),
      json: jest.fn().mockImplementation((data) => {
        responseObject.body = data;
        return mockResponse as Response;
      }),
    } as unknown as Response;

    jest.clearAllMocks();
  });

  describe('getTrackedGames', () => {
    it('[Caminho Feliz] deve retornar 200 e a lista de jogos monitorados', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };

      const mockGames = [{ id: 1, slug: 'mtg', name: 'Magic: The Gathering' }];
      jest.spyOn(UserTrackedGameService.prototype, 'getTrackedGames').mockResolvedValue(mockGames as any);

      await trackedGameController.getTrackedGames(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserTrackedGameService.prototype.getTrackedGames).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockGames);
    });

    it('[Caminho de Erro] deve retornar 401 se o usuário não estiver autenticado no request', async () => {
      delete mockRequest.user;

      await trackedGameController.getTrackedGames(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.body).toHaveProperty('error', 'Usuário não autenticado.');
    });
  });

  describe('trackGame', () => {
    it('[Caminho Feliz] deve retornar 201 ao acompanhar o jogo com sucesso', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { gameId: '1' };

      const mockGame = { id: 1, slug: 'mtg', name: 'Magic: The Gathering' };
      jest.spyOn(UserTrackedGameService.prototype, 'trackGame').mockResolvedValue(mockGame as any);

      await trackedGameController.trackGame(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserTrackedGameService.prototype.trackGame).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.body).toEqual(mockGame);
    });

    it('[Caminho de Erro] deve retornar 400 se o gameId for inválido', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { gameId: 'abc' };

      const trackSpy = jest.spyOn(UserTrackedGameService.prototype, 'trackGame');

      await trackedGameController.trackGame(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error', 'gameId é obrigatório e deve ser um número.');
      expect(trackSpy).not.toHaveBeenCalled();
    });
  });

  describe('untrackGame', () => {
    it('[Caminho Feliz] deve retornar 200 ao deixar de acompanhar o jogo com sucesso', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { gameId: '1' };

      const mockResult = { message: 'Jogo removido dos acompanhados com sucesso.' };
      jest.spyOn(UserTrackedGameService.prototype, 'untrackGame').mockResolvedValue(mockResult);

      await trackedGameController.untrackGame(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserTrackedGameService.prototype.untrackGame).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockResult);
    });

    it('[Caminho de Erro] deve retornar 400 se o gameId na URL for inválido', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { gameId: 'invalido' };

      const untrackSpy = jest.spyOn(UserTrackedGameService.prototype, 'untrackGame');

      await trackedGameController.untrackGame(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error', 'gameId inválido na URL.');
      expect(untrackSpy).not.toHaveBeenCalled();
    });
  });
});