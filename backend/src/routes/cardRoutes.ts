import { Router } from 'express';
import { CardController } from '../controllers/cardController.js';

const router = Router();
const cardController = new CardController();

router.get('/', (req, res) => cardController.getCards(req, res));
router.get('/:externalId', (req, res) => cardController.getCardByExternalId(req, res));

export default router;