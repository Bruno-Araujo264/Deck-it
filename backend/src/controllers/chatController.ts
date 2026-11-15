import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { AiServiceError } from '../services/aiService.js';
import { ChatService } from '../services/chatService.js';

const chatService = new ChatService();

export class ChatController {
  /** POST /api/chat  { messages: [{ role: 'user' | 'assistant', text: string }] } */
  public async reply(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const result = await chatService.reply(userId, req.body?.messages);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof AiServiceError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[chatController]', error);
      return res.status(500).json({ error: 'Erro ao falar com o assistente.' });
    }
  }
}
