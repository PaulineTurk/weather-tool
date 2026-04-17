import { userRepository, User } from './userRepository';
import prisma from '../db';

jest.mock('../db', () => ({
  user: {
    findFirst: jest.fn(),
  },
}));

const mockPrisma = jest.mocked(prisma)

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultUser', () => {
    const expectedUser: User = {
      id: 'default-user',
      name: 'Default User',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should return the default user when found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(expectedUser);

      const result = await userRepository.getDefaultUser();

      expect(result).toEqual(expectedUser);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'default-user' },
      });
    });

    it('should return null when default user is not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await userRepository.getDefaultUser();

      expect(result).toBeNull();
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'default-user' },
      });
    });
  });
});
