import { Router } from 'express';
import { DeckController } from '../controllers/deckController.js';

const router = Router();
const deckController = new DeckController();

router.post('/', (req, res) => deckController.createDeck(req, res));
router.get('/', (req, res) => deckController.getUserDecks(req, res));
router.patch('/:deckId', (req, res) => deckController.updateDeck(req, res));
router.delete('/:deckId', (req, res) => deckController.deleteDeck(req, res));

router.post('/:deckId/items', (req, res) => deckController.addCardToDeck(req, res));
router.get('/:deckId/items', (req, res) => deckController.getDeckItems(req, res));
router.delete('/:deckId/items/:itemId', (req, res) => deckController.removeCardFromDeck(req, res));

export default router;