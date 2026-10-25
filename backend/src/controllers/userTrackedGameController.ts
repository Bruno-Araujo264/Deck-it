import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { UserTrackedGameService } from '../services/userTrackedGameService.js';

const trackedGameService = new UserTrackedGameService();

export class UserTrackedGameController {
  public async getTrackedGames(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const games = await trackedGameService.getTrackedGames(userId);
      return res.status(200).json(games);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao listar jogos acompanhados.' });
    }
  }

  public async trackGame(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const gameId = Number(req.params.gameId || req.body.gameId);
      if (!gameId || isNaN(gameId)) {
        return res.status(400).json({ error: 'gameId é obrigatório e deve ser um número.' });
      }

      const game = await trackedGameService.trackGame(userId, gameId);
      return res.status(201).json(game);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao acompanhar o jogo.' });
    }
  }

  public async untrackGame(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const gameId = Number(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        return res.status(400).json({ error: 'gameId inválido na URL.' });
      }

      const result = await trackedGameService.untrackGame(userId, gameId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: error.message || 'Erro ao deixar de acompanhar o jogo.' });
    }
  }
}