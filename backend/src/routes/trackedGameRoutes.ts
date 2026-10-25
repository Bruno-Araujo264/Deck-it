import { Router } from 'express';
import { UserTrackedGameController } from '../controllers/userTrackedGameController.js';

const router = Router();
const trackedGameController = new UserTrackedGameController();

router.get('/tracked-games', (req, res) => trackedGameController.getTrackedGames(req, res));
router.post('/tracked-games', (req, res) => trackedGameController.trackGame(req, res));
router.delete('/tracked-games/:gameId', (req, res) => trackedGameController.untrackGame(req, res));

export default router;