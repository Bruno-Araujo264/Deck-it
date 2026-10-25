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
    it('[Caminho Feliz] deve criar um novo usuário com sucesso (com nickname) e retornar o token e dados', async () => {
      const email = 'novo@deckit.com';
      const password = 'SenhaForte123!';
      const nickname = 'PlayerOne';

      const mockCreatedUser = {
        id: 1,
        email: email,
        nickname: nickname,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await authService.register(email, password, nickname);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          passwordHash: expect.any(String),
          nickname,
        },
      });
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual(mockCreatedUser);
    });

    it('[Caminho Feliz] deve criar um novo usuário com sucesso (sem nickname) tratando o opcional', async () => {
      const email = 'novo2@deckit.com';
      const password = 'SenhaForte123!';

      const mockCreatedUser = {
        id: 2,
        email: email,
        nickname: null,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await authService.register(email, password);

      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          passwordHash: expect.any(String),
          // Sem a propriedade nickname pois foi omitida pelo spread condicional
        },
      });
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
    it('[Caminho Feliz] deve retornar um token JWT e os dados do usuário (incluindo nickname) quando as credenciais forem válidas', async () => {
      const email = 'login@deckit.com';
      const password = 'SenhaForte123!';

      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUserFromDb = {
        id: 1,
        email: email,
        nickname: 'MasterPlayer',
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
        nickname: mockUserFromDb.nickname,
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
        nickname: 'MasterPlayer',
        passwordHash: hashedPassword,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);

      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas.');
    });
  });
});