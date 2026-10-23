import prisma from '../db/client.js';
import { Prisma } from '../generated/prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  // Auxiliar privado para gerar o Token JWT
  private static generateToken(userId: number, email: string): string {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign({ userId, email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  // Cadastro de novo usuário (Tradicional)
  public async register(email: string, passwordPlain: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const token = AuthService.generateToken(user.id, user.email);

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }

  // Login tradicional
  public async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new Error('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas.');
    }

    const token = AuthService.generateToken(user.id, user.email);

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }

  // Buscar usuário por ID (Seguindo o padrão do GameService)
  public async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }
}