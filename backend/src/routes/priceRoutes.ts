import { Router } from 'express';
import { PriceController } from '../controllers/priceController.js';

const router = Router();
const priceController = new PriceController();

// Histórico de preços da carta
router.get('/cards/:externalId/prices', (req, res) => priceController.getCardPrices(req, res));

// Validação / Preço do deck (protegido pelo middleware centralizado no app.ts)
router.get('/decks/:deckId/valuation', (req, res) => priceController.getDeckValuation(req, res));

export default router;