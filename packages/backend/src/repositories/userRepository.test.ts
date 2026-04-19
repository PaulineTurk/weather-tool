import { userRepository, User } from './userRepository';
import prisma from '../db';

jest.mock('../db', () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
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
      temperatureUnit: 'C',
      forecastDays: 1,
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

  describe('updateUserPreferences', () => {
    it('updates existing user preferences', async () => {
      const existingUser: User = {
        id: 'default-user',
        name: 'Default User',
        temperatureUnit: 'C',
        forecastDays: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const updatedUser: User = {
        ...existingUser,
        temperatureUnit: 'F',
        forecastDays: 5,
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await userRepository.updateUserPreferences('default-user', {
        temperatureUnit: 'F',
        forecastDays: 5,
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'default-user' },
        data: { temperatureUnit: 'F', forecastDays: 5 },
      });
    });
  });
});
