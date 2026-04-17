import { userController } from './userController';
import { userRepository } from '../repositories/userRepository';
import { Request, Response } from 'express';

jest.mock('../repositories/userRepository', () => ({
  userRepository: {
    getDefaultUser: jest.fn(),
  },
}));

const mockUserRepository = jest.mocked(userRepository)

describe('userController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getDefaultUser', () => {
    it('should return the default user when found', async () => {
      const mockUser = {
        id: 'default-user',
        name: 'Default User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockUserRepository.getDefaultUser.mockResolvedValue(mockUser);

      await userController.getDefaultUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserRepository.getDefaultUser).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 when default user is not found', async () => {
      mockUserRepository.getDefaultUser.mockResolvedValue(null);

      await userController.getDefaultUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserRepository.getDefaultUser).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Default user not found',
      });
    });

    it('should return 500 on repository error', async () => {
      mockUserRepository.getDefaultUser.mockRejectedValue(
        new Error('Database error')
      );

      await userController.getDefaultUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });
});
