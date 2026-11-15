import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';

const router = Router();
const chatController = new ChatController();

router.post('/', (req, res) => chatController.reply(req, res));

export default router;
