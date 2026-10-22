import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import gameRoutes from '../../src/routes/gameRoutes.js';
import { GameService } from '../../src/services/gameService.js';

// Mock do GameService para isolar o Controller e as Rotas
jest.mock('../../src/services/gameService.js');

const app = express();
app.use(express.json());
app.use('/games', gameRoutes); // Configura o roteador de jogos na aplicação de teste

describe('GameController & Routes - Testes de Integração/HTTP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /games', () => {
    it('[Caminho Feliz] deve retornar 201 e criar o jogo quando o payload for válido', async () => {
      const payload = {
        slug: 'mario-odyssey',
        name: 'Super Mario Odyssey',
        sourceApi: ['https://api.rawg.io/mario'],
      };

      jest.spyOn(GameService.prototype, 'createGame').mockResolvedValue({
        id: 1,
        ...payload,
        createdAt: new Date(),
      } as any);

      const response = await request(app).post('/games').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.sourceApi).toEqual(payload.sourceApi);
    });

    it('[Caminho de Erro] deve retornar 400 se sourceApi não for um array', async () => {
      const payload = {
        slug: 'mario-odyssey',
        name: 'Super Mario Odyssey',
        sourceApi: 'nao-sou-um-array', // Inválido
      };

      const response = await request(app).post('/games').send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /games', () => {
    it('[Caminho Feliz] deve retornar 200 e a lista de jogos', async () => {
      const mockGames = [{ id: 1, slug: 'game-1', name: 'Game 1', sourceApi: ['url'] }];
      jest.spyOn(GameService.prototype, 'getAllGames').mockResolvedValue(mockGames as any);

      const response = await request(app).get('/games');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGames);
    });
  });

  describe('GET /games/search', () => {
    it('[Caminho Feliz] deve retornar 200 e os jogos encontrados usando o query parameter q', async () => {
      const mockGames = [{ id: 1, slug: 'mario', name: 'Mario', sourceApi: ['url'] }];
      jest.spyOn(GameService.prototype, 'searchGames').mockResolvedValue(mockGames as any);

      // Chamada utilizando query parameter conforme ajustamos no route
      const response = await request(app).get('/games/search?q=Mario');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGames);
    });

    it('[Caminho de Erro] deve retornar 400 se o parâmetro q estiver ausente', async () => {
      const response = await request(app).get('/games/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /games/:id', () => {
    it('[Caminho Feliz] deve retornar 200 e o jogo quando o ID existir', async () => {
      const mockGame = { id: 1, slug: 'game-1', name: 'Game 1', sourceApi: ['url'] };
      jest.spyOn(GameService.prototype, 'getGameById').mockResolvedValue(mockGame as any);

      const response = await request(app).get('/games/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGame);
    });

    it('[Caminho de Erro] deve retornar 404 se o jogo não for encontrado', async () => {
      jest.spyOn(GameService.prototype, 'getGameById').mockResolvedValue(null);

      const response = await request(app).get('/games/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /games/:id', () => {
    it('[Caminho Feliz] deve retornar 204 ao deletar um jogo com sucesso', async () => {
      jest.spyOn(GameService.prototype, 'deleteGame').mockResolvedValue({} as any);

      const response = await request(app).delete('/games/1');

      expect(response.status).toBe(204);
    });
  });
});