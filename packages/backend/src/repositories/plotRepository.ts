import prisma from '../db';

export type Plot = {
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

export type PlotPayload = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

export const plotRepository = {
  async getPlotsForUser(userId: string): Promise<Plot[]> {
    return prisma.plot.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  },

  async createPlotForUser(userId: string, payload: PlotPayload): Promise<Plot> {
    return prisma.plot.create({
      data: {
        userId,
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  },

  async updatePlotForUser(userId: string, plotId: string, payload: PlotPayload): Promise<Plot | null> {
    const plot = await prisma.plot.findFirst({
      where: {
        id: plotId,
        userId,
      },
    });

    if (!plot) {
      return null;
    }

    return prisma.plot.update({
      where: { id: plotId },
      data: {
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  },

  async deletePlotForUser(userId: string, plotId: string): Promise<boolean> {
    const result = await prisma.plot.deleteMany({
      where: {
        id: plotId,
        userId,
      },
    });

    return result.count === 1;
  },

  async setDefaultPlotForUser(userId: string, plotId: string): Promise<boolean> {
    const plot = await prisma.plot.findFirst({
      where: {
        id: plotId,
        userId,
      },
    });

    if (!plot) {
      return false;
    }

    await prisma.$transaction([
      prisma.plot.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.plot.update({
        where: {
          id: plotId,
        },
        data: {
          isDefault: true,
        },
      }),
    ]);

    return true;
  },

  async clearDefaultPlotForUser(userId: string, plotId: string): Promise<boolean> {
    const result = await prisma.plot.updateMany({
      where: {
        id: plotId,
        userId,
      },
      data: {
        isDefault: false,
      },
    });

    return result.count === 1;
  },
};
