import type { Request, Response } from 'express';
import { GameService } from '../services/gameService.js'; // Ajuste o caminho do import do service conforme a sua estrutura

const gameService = new GameService();

export class GameController {
  
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { slug, name, sourceApi } = req.body;

      // Validação básica para garantir que sourceApi veio como um array de strings válido
      if (!Array.isArray(sourceApi) || sourceApi.length === 0) {
        return res.status(400).json({ 
          error: "O campo 'sourceApi' é obrigatório e deve ser uma lista (array) contendo ao menos um link." 
        });
      }

      const newGame = await gameService.createGame({ slug, name, sourceApi });
      return res.status(201).json(newGame);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro ao criar jogo." });
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const games = await gameService.getAllGames();
      return res.status(200).json(games);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro ao listar jogos." });
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const game = await gameService.getGameById(id);

      if (!game) {
        return res.status(404).json({ error: "Jogo não encontrado." });
      }

      return res.status(200).json(game);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro ao buscar jogo." });
    }
  }

  // 🔍 Novo método de busca integrado para o endpoint /search?q=...
  public async search(req: Request, res: Response): Promise<Response> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ 
          error: "O parâmetro de busca 'q' é obrigatório e deve ser uma string." 
        });
      }

      const games = await gameService.searchGames(q);
      return res.status(200).json(games);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro ao realizar busca de jogos." });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { slug, name, sourceApi } = req.body;

      const updatedGame = await gameService.updateGame(id, {
        slug,
        name,
        sourceApi, // O Prisma aceita o array diretamente aqui
      });

      return res.status(200).json(updatedGame);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro ao atualizar jogo." });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      await gameService.deleteGame(id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro ao deletar jogo." });
    }
  }
}