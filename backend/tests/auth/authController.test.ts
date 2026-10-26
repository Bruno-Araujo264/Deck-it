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
    it('[Caminho Feliz] deve retornar 201 quando o registro for bem-sucedido com termos aceitos', async () => {
      mockRequest.body = { 
        email: 'novo@deckit.com', 
        password: 'Senha123!', 
        acceptedTerms: true,
        nickname: 'PlayerOne',
        cpf: '123.456.789-00'
      };
      
      const mockResult = { 
        message: 'Usuário registrado com sucesso!',
        token: 'jwt-token', 
        user: { id: 1, email: 'novo@deckit.com', acceptedTerms: true } 
      };

      jest.spyOn(AuthService.prototype, 'register').mockResolvedValue(mockResult as any);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(AuthService.prototype.register).toHaveBeenCalledWith(
        'novo@deckit.com', 
        'Senha123!', 
        true,
        'PlayerOne',
        '123.456.789-00'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.body).toEqual(mockResult);
    });

    it('[Caminho de Erro] deve retornar 400 se os termos não forem aceitos', async () => {
      mockRequest.body = { 
        email: 'novo@deckit.com', 
        password: 'Senha123!', 
        acceptedTerms: false 
      };

      const registerSpy = jest.spyOn(AuthService.prototype, 'register');

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error', 'Você deve aceitar os termos de uso para se cadastrar.');
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it('[Caminho de Erro] deve retornar 400 se e-mail ou senha estiverem ausentes', async () => {
      mockRequest.body = { email: 'novo@deckit.com', acceptedTerms: true }; // sem senha

      const registerSpy = jest.spyOn(AuthService.prototype, 'register');

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error', 'E-mail e senha são obrigatórios.');
      expect(registerSpy).not.toHaveBeenCalled();
    });
  });
});