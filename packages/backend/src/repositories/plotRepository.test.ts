import { plotRepository, Plot, PlotPayload } from './plotRepository';
import prisma from '../db';

jest.mock('../db', () => ({
  $transaction: jest.fn(),
  plot: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('plotRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns plots for a given user sorted by name', async () => {
    const plots: Plot[] = [
      {
        id: 'f1',
        name: 'Alpha',
        latitude: 10,
        longitude: 20,
        address: 'Paris',
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    mockPrisma.plot.findMany.mockResolvedValue(plots);

    const result = await plotRepository.getPlotsForUser('user-1');

    expect(result).toEqual(plots);
    expect(mockPrisma.plot.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    });
  });

  it('creates a plot for the given user', async () => {
    const payload: PlotPayload = {
      name: 'Beta',
      latitude: null,
      longitude: null,
      address: null,
    };

    const createdPlot: Plot = {
      id: 'f2',
      name: 'Beta',
      latitude: null,
      longitude: null,
      address: null,
      isDefault: false,
      userId: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    mockPrisma.plot.create.mockResolvedValue(createdPlot);

    const result = await plotRepository.createPlotForUser('user-1', payload);

    expect(result).toEqual(createdPlot);
    expect(mockPrisma.plot.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  });

  it('updates a plot only when it belongs to user', async () => {
    const payload: PlotPayload = {
      name: 'Gamma',
      latitude: 1,
      longitude: 2,
      address: 'Lyon',
    };

    const existingPlot: Plot = {
      id: 'f3',
      name: 'Old',
      latitude: null,
      longitude: null,
      address: null,
      isDefault: false,
      userId: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const updatedPlot: Plot = {
      ...existingPlot,
      name: payload.name,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address,
    };

    mockPrisma.plot.findFirst.mockResolvedValue(existingPlot);
    mockPrisma.plot.update.mockResolvedValue(updatedPlot);

    const result = await plotRepository.updatePlotForUser('user-1', 'f3', payload);

    expect(result).toEqual(updatedPlot);
    expect(mockPrisma.plot.findFirst).toHaveBeenCalledWith({
      where: { id: 'f3', userId: 'user-1' },
    });
    expect(mockPrisma.plot.update).toHaveBeenCalledWith({
      where: { id: 'f3' },
      data: {
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  });

  it('returns null when updating unknown plot', async () => {
    const payload: PlotPayload = {
      name: 'Gamma',
      latitude: null,
      longitude: null,
      address: null,
    };

    mockPrisma.plot.findFirst.mockResolvedValue(null);

    const result = await plotRepository.updatePlotForUser('user-1', 'missing', payload);

    expect(result).toBeNull();
    expect(mockPrisma.plot.update).not.toHaveBeenCalled();
  });

  it('deletes a plot only for current user', async () => {
    mockPrisma.plot.deleteMany.mockResolvedValue({ count: 1 });

    const result = await plotRepository.deletePlotForUser('user-1', 'f4');

    expect(result).toBe(true);
    expect(mockPrisma.plot.deleteMany).toHaveBeenCalledWith({
      where: { id: 'f4', userId: 'user-1' },
    });
  });

  it('sets the selected plot as default and clears previous default', async () => {
    const existingPlot: Plot = {
      id: 'f1',
      name: 'Alpha',
      latitude: null,
      longitude: null,
      address: null,
      isDefault: false,
      userId: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    mockPrisma.plot.findFirst.mockResolvedValue(existingPlot);
    mockPrisma.$transaction.mockResolvedValue([]);

    const result = await plotRepository.setDefaultPlotForUser('user-1', 'f1');

    expect(result).toBe(true);
    expect(mockPrisma.plot.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isDefault: true },
      data: { isDefault: false },
    });
    expect(mockPrisma.plot.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { isDefault: true },
    });
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('returns false when setting default on unknown plot', async () => {
    mockPrisma.plot.findFirst.mockResolvedValue(null);

    const result = await plotRepository.setDefaultPlotForUser('user-1', 'missing');

    expect(result).toBe(false);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('clears default status on a plot', async () => {
    mockPrisma.plot.updateMany.mockResolvedValue({ count: 1 });

    const result = await plotRepository.clearDefaultPlotForUser('user-1', 'f1');

    expect(result).toBe(true);
    expect(mockPrisma.plot.updateMany).toHaveBeenCalledWith({
      where: { id: 'f1', userId: 'user-1' },
      data: { isDefault: false },
    });
  });
});
