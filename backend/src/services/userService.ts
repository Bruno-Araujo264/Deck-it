import prisma from '../db/client.js';
import bcrypt from 'bcrypt';

export class UserService {
  // Buscar perfil completo por ID
  public async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        cpf: true,
        avatarUrl: true,
        acceptedTerms: true,
        termsAcceptedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return user;
  }

  // Atualizar dados do perfil (nickname, avatarUrl, email)
  public async updateProfile(
    userId: number,
    data: { nickname?: string; avatarUrl?: string; email?: string }
  ) {
    if (data.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists && emailExists.id !== userId) {
        throw new Error('Este e-mail já está em uso por outro usuário.');
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        cpf: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  // Trocar senha de acesso
  public async changePassword(
    userId: number,
    currentPasswordPlain: string,
    newPasswordPlain: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      throw new Error('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(currentPasswordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('A senha atual está incorreta.');
    }

    const newPasswordHash = await bcrypt.hash(newPasswordPlain, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Senha alterada com sucesso!' };
  }
}