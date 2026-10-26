import type { Response } from 'express';
import { DeckService } from '../services/deckService.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

const deckService = new DeckService();

export class DeckController {
  public async createDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const { gameId, name } = req.body;
      if (!gameId || !name) {
        return res.status(400).json({ error: 'gameId e name são obrigatórios.' });
      }

      const deck = await deckService.createDeck(userId, Number(gameId), name);
      return res.status(201).json({ message: 'Deck criado com sucesso!', deck });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao criar deck.' });
    }
  }

  public async getUserDecks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const gameId = req.query.gameId ? Number(req.query.gameId) : undefined;
      const decks = await deckService.getUserDecks(userId, gameId);

      return res.status(200).json(decks);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao listar decks.' });
    }
  }

  public async updateDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const deckId = Number(req.params.deckId);
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'O novo nome do deck é obrigatório.' });
      }

      const updated = await deckService.updateDeck(userId, deckId, name);
      return res.status(200).json({ message: 'Deck atualizado com sucesso!', deck: updated });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao atualizar deck.' });
    }
  }

  public async deleteDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const deckId = Number(req.params.deckId);
      const result = await deckService.deleteDeck(userId, deckId);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao deletar deck.' });
    }
  }

  public async addCardToDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const deckId = Number(req.params.deckId);
      const { cardExternalId, quantity, variant, condition } = req.body;

      if (!cardExternalId) {
        return res.status(400).json({ error: 'cardExternalId é obrigatório.' });
      }

      const item = await deckService.addCardToDeck(
        userId,
        deckId,
        cardExternalId,
        quantity,
        variant,
        condition
      );

      return res.status(200).json({ message: 'Carta adicionada/atualizada com sucesso!', item });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao adicionar carta ao deck.' });
    }
  }

  public async getDeckItems(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const deckId = Number(req.params.deckId);
      const deckWithItems = await deckService.getDeckItems(userId, deckId);

      return res.status(200).json(deckWithItems);
    } catch (error: any) {
      return res.status(404).json({ error: error.message || 'Erro ao buscar itens do deck.' });
    }
  }

  public async removeCardFromDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const deckId = Number(req.params.deckId);
      const itemId = Number(req.params.itemId);

      const result = await deckService.removeCardFromDeck(userId, deckId, itemId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao remover carta do deck.' });
    }
  }
}