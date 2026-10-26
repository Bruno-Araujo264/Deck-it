import { jest } from '@jest/globals';
import type { Response } from 'express';
import { UserController } from '../../src/controllers/userController.js';
import { UserService } from '../../src/services/userService.js';
import type { AuthRequest } from '../../src/middlewares/authMiddleware.js';

describe('UserController - Testes Unitários', () => {
  let userController: UserController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    userController = new UserController();
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

  describe('getProfile', () => {
    it('[Caminho Feliz] deve retornar 200 e os dados do perfil', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };

      const mockProfile = { id: 1, email: 'gabriel@deckit.com', nickname: 'GabrielSilva' };
      jest.spyOn(UserService.prototype, 'getProfile').mockResolvedValue(mockProfile as any);

      await userController.getProfile(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserService.prototype.getProfile).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockProfile);
    });

    it('[Caminho de Erro] deve retornar 401 se o usuário não estiver autenticado no request', async () => {
      delete mockRequest.user; // Remove a propriedade em vez de atribuir undefined

      await userController.getProfile(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.body).toHaveProperty('error', 'Não autorizado.');
    });
  });

  describe('updateProfile', () => {
    it('[Caminho Feliz] deve retornar 200 ao atualizar o perfil com sucesso', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.body = { nickname: 'NovoNick' };

      const mockUpdated = { id: 1, nickname: 'NovoNick' };
      jest.spyOn(UserService.prototype, 'updateProfile').mockResolvedValue(mockUpdated as any);

      await userController.updateProfile(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserService.prototype.updateProfile).toHaveBeenCalledWith(1, { nickname: 'NovoNick', avatarUrl: undefined, email: undefined });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toHaveProperty('message', 'Perfil atualizado com sucesso!');
    });
  });

  describe('changePassword', () => {
    it('[Caminho Feliz] deve retornar 200 ao alterar a senha com sucesso', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.body = { currentPassword: 'Old@123', newPassword: 'New@456' };

      const mockResult = { message: 'Senha alterada com sucesso!' };
      jest.spyOn(UserService.prototype, 'changePassword').mockResolvedValue(mockResult);

      await userController.changePassword(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserService.prototype.changePassword).toHaveBeenCalledWith(1, 'Old@123', 'New@456');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toEqual(mockResult);
    });

    it('[Caminho de Erro] deve retornar 400 se faltar a senha atual ou nova', async () => {
      mockRequest.user = { userId: 1, email: 'gabriel@deckit.com' };
      mockRequest.body = { currentPassword: 'Old@123' }; // faltando newPassword

      const changePasswordSpy = jest.spyOn(UserService.prototype, 'changePassword');

      await userController.changePassword(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.body).toHaveProperty('error', 'A senha atual e a nova senha são obrigatórias.');
      expect(changePasswordSpy).not.toHaveBeenCalled();
    });
  });
});