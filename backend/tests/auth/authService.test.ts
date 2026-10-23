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
    it('[Caminho Feliz] deve criar um novo usuário com sucesso e retornar o token e dados', async () => {
      const email = 'novo@deckit.com';
      const password = 'SenhaForte123!';

      const mockCreatedUser = {
        id: 1,
        email: email,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await authService.register(email, password);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual(mockCreatedUser);
    });

    it('[Caminho de Erro] deve lançar erro se o e-mail já estiver em uso', async () => {
      const email = 'existente@deckit.com';
      const password = 'SenhaForte123!';

      mockedPrisma.user.findUnique.mockResolvedValue({ id: 1, email: email });

      await expect(authService.register(email, password)).rejects.toThrow('E-mail já cadastrado.');
      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('[Caminho Feliz] deve retornar um token JWT e os dados do usuário quando as credenciais forem válidas', async () => {
      const email = 'login@deckit.com';
      const password = 'SenhaForte123!';

      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUserFromDb = {
        id: 1,
        email: email,
        passwordHash: hashedPassword,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);

      const result = await authService.login(email, password);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({
        id: mockUserFromDb.id,
        email: mockUserFromDb.email,
      });
    });

    it('[Caminho de Erro] deve lançar erro se o usuário não for encontrado', async () => {
      const email = 'naocaixadagua@deckit.com';
      const password = 'Senha123!';

      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas.');
    });

    it('[Caminho de Erro] deve lançar erro se a senha estiver incorreta', async () => {
      const email = 'login@deckit.com';
      const password = 'SenhaErrada!';

      const hashedPassword = await bcrypt.hash('SenhaCorreta123!', 10);
      const mockUserFromDb = {
        id: 1,
        email: email,
        passwordHash: hashedPassword,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);

      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas.');
    });
  });
});