import prisma from '../db/client.js';
import { Prisma } from '../generated/prisma/client.js'; // Importa os tipos do Prisma

export class GameService {
  public async createGame(data: { slug: string; name: string; sourceApi: string[] }) {
    return await prisma.game.create({ data });
  }

  public async getAllGames() {
    return await prisma.game.findMany();
  }

  public async getGameById(id: number) {
    return await prisma.game.findUnique({ where: { id } });
  }

  public async getGameByName(name: string) {
    return await prisma.game.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  public async searchGames(query: string) {
    return await prisma.game.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }

  // 👇 Usamos o tipo nativo do Prisma para o update, resolvendo qualquer conflito de array/string
  public async updateGame(id: number, data: Prisma.GameUpdateInput) {
    return await prisma.game.update({
      where: { id },
      data,
    });
  }

  public async deleteGame(id: number) {
    return await prisma.game.delete({ where: { id } });
  }
}