import type { Response } from 'express';
import { PriceService } from '../services/priceService.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

const priceService = new PriceService();

export class PriceController {
  public async getCardPrices(req: AuthRequest, res: Response) {
    try {
      const rawExternalId = req.params.externalId;
      const externalId = typeof rawExternalId === 'string' ? rawExternalId : rawExternalId?.[0];
      const priceType = req.query.priceType ? String(req.query.priceType) : undefined;

      if (!externalId) {
        return res.status(400).json({ error: 'externalId é obrigatório.' });
      }

      const prices = await priceService.getCardPrices(externalId, priceType);
      return res.status(200).json(prices);
    } catch (error: any) {
      return res.status(404).json({ error: error.message || 'Erro ao buscar preços da carta.' });
    }
  }

  public async getDeckValuation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const deckId = Number(req.params.deckId);
      const priceType = req.query.priceType ? String(req.query.priceType) : 'normal';

      const valuation = await priceService.getDeckValuation(userId, deckId, priceType);
      return res.status(200).json(valuation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao calcular valor do deck.' });
    }
  }
}