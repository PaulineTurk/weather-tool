import { fieldRepository, Field, FieldPayload } from './fieldRepository';
import prisma from '../db';

jest.mock('../db', () => ({
  $transaction: jest.fn(),
  field: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('fieldRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fields for a given user sorted by name', async () => {
    const fields: Field[] = [
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

    mockPrisma.field.findMany.mockResolvedValue(fields);

    const result = await fieldRepository.getFieldsForUser('user-1');

    expect(result).toEqual(fields);
    expect(mockPrisma.field.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    });
  });

  it('creates a field for the given user', async () => {
    const payload: FieldPayload = {
      name: 'Beta',
      latitude: null,
      longitude: null,
      address: null,
    };

    const createdField: Field = {
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

    mockPrisma.field.create.mockResolvedValue(createdField);

    const result = await fieldRepository.createFieldForUser('user-1', payload);

    expect(result).toEqual(createdField);
    expect(mockPrisma.field.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  });

  it('updates a field only when it belongs to user', async () => {
    const payload: FieldPayload = {
      name: 'Gamma',
      latitude: 1,
      longitude: 2,
      address: 'Lyon',
    };

    const existingField: Field = {
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

    const updatedField: Field = {
      ...existingField,
      name: payload.name,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address,
    };

    mockPrisma.field.findFirst.mockResolvedValue(existingField);
    mockPrisma.field.update.mockResolvedValue(updatedField);

    const result = await fieldRepository.updateFieldForUser('user-1', 'f3', payload);

    expect(result).toEqual(updatedField);
    expect(mockPrisma.field.findFirst).toHaveBeenCalledWith({
      where: { id: 'f3', userId: 'user-1' },
    });
    expect(mockPrisma.field.update).toHaveBeenCalledWith({
      where: { id: 'f3' },
      data: {
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
      },
    });
  });

  it('returns null when updating unknown field', async () => {
    const payload: FieldPayload = {
      name: 'Gamma',
      latitude: null,
      longitude: null,
      address: null,
    };

    mockPrisma.field.findFirst.mockResolvedValue(null);

    const result = await fieldRepository.updateFieldForUser('user-1', 'missing', payload);

    expect(result).toBeNull();
    expect(mockPrisma.field.update).not.toHaveBeenCalled();
  });

  it('deletes a field only for current user', async () => {
    mockPrisma.field.deleteMany.mockResolvedValue({ count: 1 });

    const result = await fieldRepository.deleteFieldForUser('user-1', 'f4');

    expect(result).toBe(true);
    expect(mockPrisma.field.deleteMany).toHaveBeenCalledWith({
      where: { id: 'f4', userId: 'user-1' },
    });
  });

  it('sets the selected field as default and clears previous default', async () => {
    const existingField: Field = {
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

    mockPrisma.field.findFirst.mockResolvedValue(existingField);
    mockPrisma.$transaction.mockResolvedValue([]);

    const result = await fieldRepository.setDefaultFieldForUser('user-1', 'f1');

    expect(result).toBe(true);
    expect(mockPrisma.field.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isDefault: true },
      data: { isDefault: false },
    });
    expect(mockPrisma.field.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { isDefault: true },
    });
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('returns false when setting default on unknown field', async () => {
    mockPrisma.field.findFirst.mockResolvedValue(null);

    const result = await fieldRepository.setDefaultFieldForUser('user-1', 'missing');

    expect(result).toBe(false);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('clears default status on a field', async () => {
    mockPrisma.field.updateMany.mockResolvedValue({ count: 1 });

    const result = await fieldRepository.clearDefaultFieldForUser('user-1', 'f1');

    expect(result).toBe(true);
    expect(mockPrisma.field.updateMany).toHaveBeenCalledWith({
      where: { id: 'f1', userId: 'user-1' },
      data: { isDefault: false },
    });
  });
});
