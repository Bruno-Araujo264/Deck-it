import { jest } from '@jest/globals';
import type { Response } from 'express';
import { PriceController } from '../../src/controllers/priceController.js';
import { PriceService } from '../../src/services/priceService.js';
import type { AuthRequest } from '../../src/middlewares/authMiddleware.js';

describe('PriceController - Testes Unitários', () => {
  let priceController: PriceController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    priceController = new PriceController();
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

  describe('getCardPrices', () => {
    it('[Caminho Feliz] deve retornar 200 e o histórico de preços da carta', async () => {
      mockRequest.params = { externalId: 'card-1' };
      mockRequest.query = {};

      const mockPrices = [{ externalId: 'card-1', price: 50.00 }];
      jest.spyOn(PriceService.prototype, 'getCardPrices').mockResolvedValue(mockPrices as any);

      await priceController.getCardPrices(mockRequest as AuthRequest, mockResponse as Response);

      expect(PriceService.prototype.getCardPrices).toHaveBeenCalledWith('card-1', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockPrices);
    });

    it('[Caminho de Erro] deve retornar 404 se ocorrer erro no service', async () => {
      mockRequest.params = { externalId: 'fake-id' };
      mockRequest.query = {};

      jest.spyOn(PriceService.prototype, 'getCardPrices').mockRejectedValue(new Error('Nenhum registro encontrado.'));

      await priceController.getCardPrices(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.body).toEqual({ error: 'Nenhum registro encontrado.' });
    });
  });

  describe('getDeckValuation', () => {
    it('[Caminho Feliz] deve retornar 200 e a valoração do deck', async () => {
      mockRequest.user = { userId: 1, email: 'test@test.com' };
      mockRequest.params = { deckId: '1' };
      mockRequest.query = {};

      const mockValuation = { deckId: 1, totalEstimatedValue: 100.00, itemsValuation: [] };
      jest.spyOn(PriceService.prototype, 'getDeckValuation').mockResolvedValue(mockValuation as any);

      await priceController.getDeckValuation(mockRequest as AuthRequest, mockResponse as Response);

      expect(PriceService.prototype.getDeckValuation).toHaveBeenCalledWith(1, 1, 'normal');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockValuation);
    });

    it('[Caminho de Erro] deve retornar 401 se o usuário não estiver autenticado', async () => {
      delete mockRequest.user; // Usa delete para satisfazer o exactOptionalPropertyTypes
      mockRequest.params = { deckId: '1' };

      await priceController.getDeckValuation(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.body).toEqual({ error: 'Não autorizado.' });
    });
  });
});