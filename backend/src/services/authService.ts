import prisma from '../db/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private static generateToken(userId: number, email: string): string {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign({ userId, email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  public async register(
    email: string, 
    passwordPlain: string, 
    acceptedTerms: boolean, 
    nickname?: string, 
    cpf?: string
  ) {
    if (!acceptedTerms) {
      throw new Error('Você deve aceitar os termos de uso para se cadastrar.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    if (cpf) {
      const existingCpf = await prisma.user.findUnique({
        where: { cpf },
      });
      if (existingCpf) {
        throw new Error('Este CPF já está cadastrado em outra conta.');
      }
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        acceptedTerms: true,
        termsAcceptedAt: new Date(),
        ...(nickname ? { nickname } : {}),
        ...(cpf ? { cpf } : {}),
      },
    });

    const token = AuthService.generateToken(user.id, user.email);

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        nickname: user.nickname,
        cpf: user.cpf,
        acceptedTerms: user.acceptedTerms,
        termsAcceptedAt: user.termsAcceptedAt
      },
      token,
    };
  }

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
      user: { 
        id: user.id, 
        email: user.email, 
        nickname: user.nickname,
        cpf: user.cpf,
        acceptedTerms: user.acceptedTerms
      },
      token,
    };
  }
}