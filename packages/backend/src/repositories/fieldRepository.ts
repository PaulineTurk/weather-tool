import prisma from '../db';

export type Field = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FieldPayload = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

export const fieldRepository = {
  async getFieldsForUser(userId: string): Promise<Field[]> {
    return prisma.field.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  },

  async createFieldForUser(userId: string, payload: FieldPayload): Promise<Field> {
    return prisma.field.create({
      data: {
        userId,
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  },

  async updateFieldForUser(userId: string, fieldId: string, payload: FieldPayload): Promise<Field | null> {
    const field = await prisma.field.findFirst({
      where: {
        id: fieldId,
        userId,
      },
    });

    if (!field) {
      return null;
    }

    return prisma.field.update({
      where: { id: fieldId },
      data: {
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  },

  async deleteFieldForUser(userId: string, fieldId: string): Promise<boolean> {
    const result = await prisma.field.deleteMany({
      where: {
        id: fieldId,
        userId,
      },
    });

    return result.count === 1;
  },

  async setDefaultFieldForUser(userId: string, fieldId: string): Promise<boolean> {
    const field = await prisma.field.findFirst({
      where: {
        id: fieldId,
        userId,
      },
    });

    if (!field) {
      return false;
    }

    await prisma.$transaction([
      prisma.field.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.field.update({
        where: {
          id: fieldId,
        },
        data: {
          isDefault: true,
        },
      }),
    ]);

    return true;
  },

  async clearDefaultFieldForUser(userId: string, fieldId: string): Promise<boolean> {
    const result = await prisma.field.updateMany({
      where: {
        id: fieldId,
        userId,
      },
      data: {
        isDefault: false,
      },
    });

    return result.count === 1;
  },
};
