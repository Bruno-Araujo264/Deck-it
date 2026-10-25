import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const { email, password, acceptedTerms, nickname, cpf } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      if (acceptedTerms !== true) {
        return res.status(400).json({ error: 'Você deve aceitar os termos de uso para se cadastrar.' });
      }

      const result = await authService.register(email, password, acceptedTerms, nickname, cpf);
      return res.status(201).json({
        message: 'Usuário registrado com sucesso!',
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erro ao registrar usuário.' });
    }
  }

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