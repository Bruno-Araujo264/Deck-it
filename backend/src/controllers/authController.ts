import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export class AuthController {
  // Rota de Registro
  public async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      const result = await authService.register(email, password);
      return res.status(201).json({
        message: 'Usuário registrado com sucesso!',
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao registrar usuário.' });
    }
  }

  // Rota de Login
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      const result = await authService.login(email, password);
      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        ...result,
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Erro na autenticação.' });
    }
  }
}