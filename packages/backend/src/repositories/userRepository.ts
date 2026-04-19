import prisma from '../db';

export type User = {
  id: string;
  name: string;
  temperatureUnit: string;
  forecastDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPreferencesPayload = {
  temperatureUnit: 'C' | 'F';
  forecastDays: number;
};

export const userRepository = {
  async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  },

  async getDefaultUser(): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id: 'default-user' },
    });
  },

  async updateUserPreferences(userId: string, preferences: UserPreferencesPayload): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        temperatureUnit: preferences.temperatureUnit,
        forecastDays: preferences.forecastDays,
      },
    });
  },
};
