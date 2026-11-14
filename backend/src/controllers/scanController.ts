import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { AiServiceError } from '../services/aiService.js';
import { ScanService } from '../services/scanService.js';

const scanService = new ScanService();

export class ScanController {
  /** POST /api/scan  { image: base64, mimeType?: string, gameId?: number } */
  public async identify(req: AuthRequest, res: Response) {
    try {
      const { image, mimeType, gameId } = req.body ?? {};
      if (typeof image !== 'string' || image.length === 0) {
        return res.status(400).json({ error: 'Envie a imagem da carta em base64 no campo "image".' });
      }

      const result = await scanService.identifyCard(
        image,
        typeof mimeType === 'string' ? mimeType : undefined,
        gameId ? Number(gameId) : undefined,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof AiServiceError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[scanController]', error);
      return res.status(500).json({ error: 'Erro ao identificar a carta.' });
    }
  }
}
