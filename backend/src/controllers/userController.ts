import type { Response } from 'express';
import { UserService } from '../services/userService.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
const userService = new UserService();

export class UserController {
  // Rota para buscar o perfil logado
  public async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const profile = await userService.getProfile(userId);
      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(404).json({ error: error.message || 'Erro ao buscar perfil.' });
    }
  }

  // Rota para atualizar informações cadastrais
  public async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const { nickname, avatarUrl, email } = req.body;
      const updatedUser = await userService.updateProfile(userId, { nickname, avatarUrl, email });

      return res.status(200).json({
        message: 'Perfil atualizado com sucesso!',
        user: updatedUser,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao atualizar perfil.' });
    }
  }

  // Rota para troca de senha
  public async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'A senha atual e a nova senha são obrigatórias.' });
      }

      const result = await userService.changePassword(userId, currentPassword, newPassword);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao alterar senha.' });
    }
  }
}