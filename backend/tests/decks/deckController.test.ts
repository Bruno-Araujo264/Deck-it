import { jest } from '@jest/globals';
import type { Response } from 'express';
import { DeckController } from '../../src/controllers/deckController.js';
import { DeckService } from '../../src/services/deckService.js';
import type { AuthRequest } from '../../src/middlewares/authMiddleware.js';

describe('DeckController - Testes Unitários Completo', () => {
  let deckController: DeckController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    deckController = new DeckController();
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

  describe('createDeck', () => {
    it('[Caminho Feliz] deve retornar 201 e criar o deck', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.body = { gameId: 1, name: 'Deck Commander' };

      const mockDeck = { id: 10, name: 'Deck Commander' };
      jest.spyOn(DeckService.prototype, 'createDeck').mockResolvedValue(mockDeck as any);

      await deckController.createDeck(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.body).toHaveProperty('message', 'Deck criado com sucesso!');
    });

    it('[Caminho de Erro] deve retornar 401 se não houver usuário autenticado', async () => {
      delete mockRequest.user;

      await deckController.createDeck(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.body).toEqual({ error: 'Não autorizado.' });
    });
  });

  describe('updateDeck', () => {
    it('[Caminho Feliz] deve retornar 200 ao atualizar o deck', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { deckId: '10' };
      mockRequest.body = { name: 'Novo Nome' };

      jest.spyOn(DeckService.prototype, 'updateDeck').mockResolvedValue({ id: 10, name: 'Novo Nome' } as any);

      await deckController.updateDeck(mockRequest as AuthRequest, mockResponse as Response);

      expect(DeckService.prototype.updateDeck).toHaveBeenCalledWith(1, 10, 'Novo Nome');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toHaveProperty('message', 'Deck atualizado com sucesso!');
    });

    it('[Caminho de Erro] deve retornar 400 se o nome não for informado', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { deckId: '10' };
      mockRequest.body = {};

      await deckController.updateDeck(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toEqual({ error: 'O novo nome do deck é obrigatório.' });
    });
  });

  describe('deleteDeck', () => {
    it('[Caminho Feliz] deve retornar 200 ao deletar o deck', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { deckId: '10' };

      jest.spyOn(DeckService.prototype, 'deleteDeck').mockResolvedValue({ message: 'Deck deletado com sucesso!' });

      await deckController.deleteDeck(mockRequest as AuthRequest, mockResponse as Response);

      expect(DeckService.prototype.deleteDeck).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual({ message: 'Deck deletado com sucesso!' });
    });
  });

  describe('removeCardFromDeck', () => {
    it('[Caminho Feliz] deve retornar 200 ao remover a carta do deck', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.params = { deckId: '10', itemId: '50' };

      jest.spyOn(DeckService.prototype, 'removeCardFromDeck').mockResolvedValue({ message: 'Carta removida do deck com sucesso!' });

      await deckController.removeCardFromDeck(mockRequest as AuthRequest, mockResponse as Response);

      expect(DeckService.prototype.removeCardFromDeck).toHaveBeenCalledWith(1, 10, 50);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual({ message: 'Carta removida do deck com sucesso!' });
    });
  });
});