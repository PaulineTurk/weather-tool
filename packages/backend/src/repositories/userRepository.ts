import prisma from '../db';

export type User = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const userRepository = {
  async getDefaultUser(): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id: 'default-user' },
    });
  },
};
