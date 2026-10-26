import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

jest.unstable_mockModule('../../src/db/client.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const { AuthService } = await import('../../src/services/authService.js');
const { default: prisma } = await import('../../src/db/client.js');

const mockedPrisma = prisma as any;

describe('AuthService - Testes Unitários Completos', () => {
  let authService: InstanceType<typeof AuthService>;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('[Caminho Feliz] deve criar usuário com sucesso se aceitar os termos', async () => {
      const email = 'novo@deckit.com';
      const password = 'SenhaForte123!';
      const acceptedTerms = true;

      const mockCreatedUser = {
        id: 1,
        email,
        acceptedTerms: true,
        termsAcceptedAt: new Date(),
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await authService.register(email, password, acceptedTerms);

      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email,
          acceptedTerms: true,
          termsAcceptedAt: expect.any(Date),
        }),
      });
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual(mockCreatedUser);
    });

    it('[Caminho de Erro] deve lançar erro se acceptedTerms for falso', async () => {
      await expect(
        authService.register('teste@deckit.com', 'Senha123!', false)
      ).rejects.toThrow('Você deve aceitar os termos de uso para se cadastrar.');
      
      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });
  });
});