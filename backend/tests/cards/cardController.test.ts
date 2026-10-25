import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { CardController } from '../../src/controllers/cardController.js';
import { CardService } from '../../src/services/cardService.js';

describe('CardController - Testes Unitários', () => {
  let cardController: CardController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    cardController = new CardController();
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

  describe('getCards', () => {
    it('[Caminho Feliz] deve retornar 200 e a lista paginada de cartas', async () => {
      mockRequest.query = { gameId: '1', name: 'Lotus', page: '1', limit: '10' };

      const mockResult = {
        data: [{ externalId: 'card-1', name: 'Black Lotus' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      jest.spyOn(CardService.prototype, 'getCards').mockResolvedValue(mockResult as any);

      await cardController.getCards(mockRequest as Request, mockResponse as Response);

      expect(CardService.prototype.getCards).toHaveBeenCalledWith({
        gameId: 1,
        name: 'Lotus',
        rarity: undefined,
        setCode: undefined,
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockResult);
    });

    it('[Caminho de Erro] deve retornar 400 se ocorrer um erro no service', async () => {
      mockRequest.query = {};

      jest.spyOn(CardService.prototype, 'getCards').mockRejectedValue(new Error('Erro interno'));

      await cardController.getCards(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toEqual({ error: 'Erro interno' });
    });
  });

  describe('getCardByExternalId', () => {
    it('[Caminho Feliz] deve retornar 200 e os detalhes da carta', async () => {
      mockRequest.params = { externalId: 'card-1' };
      mockRequest.query = {};

      const mockCard = { externalId: 'card-1', name: 'Black Lotus' };
      jest.spyOn(CardService.prototype, 'getCardByExternalId').mockResolvedValue(mockCard as any);

      await cardController.getCardByExternalId(mockRequest as Request, mockResponse as Response);

      expect(CardService.prototype.getCardByExternalId).toHaveBeenCalledWith('card-1', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockCard);
    });

    it('[Caminho de Erro] deve retornar 404 se a carta não for encontrada', async () => {
      mockRequest.params = { externalId: 'fake-id' };
      mockRequest.query = {};

      jest.spyOn(CardService.prototype, 'getCardByExternalId').mockRejectedValue(new Error('Carta não encontrada no catálogo.'));

      await cardController.getCardByExternalId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.body).toEqual({ error: 'Carta não encontrada no catálogo.' });
    });
  });
});