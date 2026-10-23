import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/authController.js';
import { AuthService } from '../../src/services/authService.js';

describe('AuthController - Testes Unitários', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    authController = new AuthController();
    responseObject = {};
    mockRequest = {};
    
    mockResponse = {
      status: jest.fn().mockImplementation((status) => {
        responseObject.status = status;
        return mockResponse as Response;
      }),
      json: jest.fn().mockImplementation((data) => {
        responseObject.body = data;
        return mockResponse as Response;
      }),
    } as unknown as Response;

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('[Caminho Feliz] deve retornar 201 e o token/dados quando o registro for bem-sucedido', async () => {
      mockRequest.body = { email: 'novo@deckit.com', password: 'Senha123!' };
      
      const mockResult = { 
        message: 'Usuário registrado com sucesso!',
        token: 'jwt-token', 
        user: { id: 1, email: 'novo@deckit.com' } 
      };

      jest.spyOn(AuthService.prototype, 'register').mockResolvedValue(mockResult as any);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(AuthService.prototype.register).toHaveBeenCalledWith('novo@deckit.com', 'Senha123!');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.body).toEqual(mockResult);
    });

    it('[Caminho de Erro] deve retornar 400 se e-mail ou senha estiverem ausentes', async () => {
      mockRequest.body = { email: 'novo@deckit.com' }; // sem senha

      const registerSpy = jest.spyOn(AuthService.prototype, 'register');

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error');
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it('[Caminho de Erro] deve retornar 400 se o service lançar erro (ex: email duplicado)', async () => {
      mockRequest.body = { email: 'duplicado@deckit.com', password: 'Senha123!' };
      
      jest.spyOn(AuthService.prototype, 'register').mockRejectedValue(new Error('E-mail já cadastrado.'));

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error', 'E-mail já cadastrado.');
    });
  });

  describe('login', () => {
    it('[Caminho Feliz] deve retornar 200 e o token JWT no login válido', async () => {
      mockRequest.body = { email: 'login@deckit.com', password: 'Senha123!' };
      
      const mockResult = { 
        message: 'Login realizado com sucesso!',
        token: 'jwt-token', 
        user: { id: 1, email: 'login@deckit.com' } 
      };

      jest.spyOn(AuthService.prototype, 'login').mockResolvedValue(mockResult as any);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(AuthService.prototype.login).toHaveBeenCalledWith('login@deckit.com', 'Senha123!');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockResult);
    });

    it('[Caminho de Erro] deve retornar 400 se faltar campos no body', async () => {
      mockRequest.body = { password: 'Senha123!' }; // sem email

      const loginSpy = jest.spyOn(AuthService.prototype, 'login');

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error');
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it('[Caminho de Erro] deve retornar 401 se as credenciais forem inválidas', async () => {
      mockRequest.body = { email: 'login@deckit.com', password: 'Errada' };
      
      jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(new Error('Credenciais inválidas.'));

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.body).toHaveProperty('error', 'Credenciais inválidas.');
    });
  });
});