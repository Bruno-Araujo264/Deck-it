import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { UserService } = await import('../../src/services/userService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('UserService - Testes Unitários', () => {
  let userService: InstanceType<typeof UserService>;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('[Caminho Feliz] deve retornar o perfil do usuário quando encontrado', async () => {
      const mockUser = {
        id: 1,
        email: 'gabriel@deckit.com',
        nickname: 'GabrielSilva',
        cpf: '123.456.789-00',
        avatarUrl: null,
        acceptedTerms: true,
        termsAcceptedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getProfile(1);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('[Caminho de Erro] deve lançar erro se o usuário não for encontrado', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getProfile(999)).rejects.toThrow('Usuário não encontrado.');
    });
  });

  describe('updateProfile', () => {
    it('[Caminho Feliz] deve atualizar o perfil com sucesso', async () => {
      const userId = 1;
      const updateData = { nickname: 'GabrielDev' };
      const updatedMockUser = {
        id: userId,
        email: 'gabriel@deckit.com',
        nickname: 'GabrielDev',
        cpf: '123.456.789-00',
        avatarUrl: null,
        updatedAt: new Date(),
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null); // Nenhum conflito de email
      mockedPrisma.user.update.mockResolvedValue(updatedMockUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { nickname: 'GabrielDev' },
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedMockUser);
    });

    it('[Caminho de Erro] deve lançar erro se o novo e-mail já estiver em uso por outro usuário', async () => {
      const userId = 1;
      const updateData = { email: 'outro@deckit.com' };

      mockedPrisma.user.findUnique.mockResolvedValue({ id: 2, email: 'outro@deckit.com' });

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'Este e-mail já está em uso por outro usuário.'
      );
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('[Caminho Feliz] deve alterar a senha com sucesso quando a senha atual estiver correta', async () => {
      const userId = 1;
      const currentPassword = 'SenhaAntiga123!';
      const newPassword = 'SenhaNova456!';
      const hashedCurrentPassword = await bcrypt.hash(currentPassword, 10);

      mockedPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        passwordHash: hashedCurrentPassword,
      });
      mockedPrisma.user.update.mockResolvedValue({});

      const result = await userService.changePassword(userId, currentPassword, newPassword);

      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: expect.any(String) },
      });
      expect(result).toEqual({ message: 'Senha alterada com sucesso!' });
    });

    it('[Caminho de Erro] deve lançar erro se a senha atual estiver incorreta', async () => {
      const userId = 1;
      const hashedCurrentPassword = await bcrypt.hash('SenhaCorreta123!', 10);

      mockedPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        passwordHash: hashedCurrentPassword,
      });

      await expect(
        userService.changePassword(userId, 'SenhaErrada999!', 'NovaSenha123!')
      ).rejects.toThrow('A senha atual está incorreta.');
      
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});