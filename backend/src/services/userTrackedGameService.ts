import prisma from '../db/client.js';

export class UserTrackedGameService {
  public async getTrackedGames(userId: number) {
    const trackedGames = await prisma.userTrackedGame.findMany({
      where: { userId },
      include: {
        game: true,
      },
    });

    return trackedGames.map((item) => item.game);
  }

  public async trackGame(userId: number, gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Jogo não encontrado.');
    }

    const tracked = await prisma.userTrackedGame.upsert({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      update: {},
      create: {
        userId,
        gameId,
      },
      include: {
        game: true,
      },
    });

    return tracked.game;
  }

  public async untrackGame(userId: number, gameId: number) {
    const existing = await prisma.userTrackedGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (!existing) {
      throw new Error('O usuário não está acompanhando este jogo.');
    }

    await prisma.userTrackedGame.delete({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    return { message: 'Jogo removido dos acompanhados com sucesso.' };
  }
}