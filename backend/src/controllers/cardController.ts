import type { Request, Response } from 'express';
import { CardService } from '../services/cardService.js';

const cardService = new CardService();

export class CardController {
    public async getCards(req: Request, res: Response) {
        try {
            const gameId = req.query.gameId ? Number(req.query.gameId) : undefined;
            const name = req.query.name ? String(req.query.name) : undefined;
            const rarity = req.query.rarity ? String(req.query.rarity) : undefined;
            const setCode = req.query.setCode ? String(req.query.setCode) : undefined;
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;

            const result = await cardService.getCards({
                gameId,
                name,
                rarity,
                setCode,
                page,
                limit,
            });

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Erro ao listar cartas.' });
        }
    }

    public async getCardByExternalId(req: Request, res: Response) {
        try {
            const rawExternalId = req.params.externalId;
            const externalId = typeof rawExternalId === 'string' ? rawExternalId : rawExternalId?.[0];
            const gameId = req.query.gameId ? Number(req.query.gameId) : undefined;

            if (!externalId) {
                return res.status(400).json({ error: 'externalId é obrigatório.' });
            }

            const card = await cardService.getCardByExternalId(externalId, gameId);
            return res.status(200).json(card);
        } catch (error: any) {
            return res.status(404).json({ error: error.message || 'Carta não encontrada.' });
        }
    }
}