import express from 'express';
import request from 'supertest';
import { fieldController } from './fieldController';
import { fieldRepository } from '../repositories/fieldRepository';
import { Field } from '../repositories/fieldRepository';
import { weatherService } from '../services/weatherService';
import { userRepository } from '../repositories/userRepository';

jest.mock('../repositories/fieldRepository', () => ({
  fieldRepository: {
    getFieldsForUser: jest.fn(),
    createFieldForUser: jest.fn(),
    updateFieldForUser: jest.fn(),
    deleteFieldForUser: jest.fn(),
    setDefaultFieldForUser: jest.fn(),
    clearDefaultFieldForUser: jest.fn(),
  },
}));

jest.mock('../services/weatherService', () => ({
  weatherService: {
    getWeatherForField: jest.fn(),
  },
}));

jest.mock('../repositories/userRepository', () => ({
  userRepository: {
    getUserById: jest.fn(),
  },
}));

const mockFieldRepository = jest.mocked(fieldRepository);
const mockWeatherService = jest.mocked(weatherService);
const mockUserRepository = jest.mocked(userRepository);

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/fields/:userId', (req, res) => fieldController.getFieldsForUser(req, res));
  app.post('/fields/:userId', (req, res) => fieldController.createFieldForUser(req, res));
  app.put('/fields/:userId/:fieldId', (req, res) => fieldController.updateFieldForUser(req, res));
  app.patch('/fields/:userId/:fieldId/default', (req, res) => fieldController.setDefaultFieldForUser(req, res));
  app.delete('/fields/:userId/:fieldId', (req, res) => fieldController.deleteFieldForUser(req, res));
  return app;
};

describe('fieldController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository.getUserById.mockResolvedValue({
      id: 'user-1',
      name: 'Default User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    mockWeatherService.getWeatherForField.mockResolvedValue({
      status: 'not_found',
      message: 'Weather forecast not found for this location.',
      location: null,
      days: [],
    });
  });

  it('returns fields for the requested user', async () => {
    const app = createApp();
    const fields: Field[] = [
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];
    mockFieldRepository.getFieldsForUser.mockResolvedValue(fields);

    const response = await request(app).get('/fields/user-1').expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f1',
        name: 'Alpha',
        userId: 'user-1',
      }),
    ]);
    expect(mockFieldRepository.getFieldsForUser).toHaveBeenCalledWith('user-1');
  });

  it('creates a field and returns refreshed list', async () => {
    const app = createApp();
    const payload = { name: 'Beta', latitude: null, longitude: null, address: null };
    const refreshedFields: Field[] = [
      {
        id: 'f2',
        name: 'Beta',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    mockFieldRepository.createFieldForUser.mockResolvedValue({
      id: 'f2',
      name: 'Beta',
      latitude: null,
      longitude: null,
      address: null,
      isDefault: false,
      userId: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    mockFieldRepository.getFieldsForUser.mockResolvedValue(refreshedFields);

    const response = await request(app).post('/fields/user-1').send(payload).expect(201);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f2',
        name: 'Beta',
        userId: 'user-1',
      }),
    ]);
    expect(mockFieldRepository.createFieldForUser).toHaveBeenCalledWith('user-1', payload);
  });

  it('rejects invalid create payload', async () => {
    const app = createApp();
    const response = await request(app).post('/fields/user-1').send({ name: '' }).expect(400);

    expect(response.body).toEqual({ error: 'Invalid field payload' });
    expect(mockFieldRepository.createFieldForUser).not.toHaveBeenCalled();
  });

  it('returns 404 when updated field does not belong to user', async () => {
    const app = createApp();
    mockFieldRepository.updateFieldForUser.mockResolvedValue(null);

    const response = await request(app)
      .put('/fields/user-1/missing')
      .send({ name: 'Alpha', latitude: null, longitude: null, address: null })
      .expect(404);

    expect(response.body).toEqual({ error: 'Field not found' });
  });

  it('deletes field and returns refreshed list', async () => {
    const app = createApp();
    const refreshedFields: Field[] = [
      {
        id: 'f9',
        name: 'Zulu',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    mockFieldRepository.deleteFieldForUser.mockResolvedValue(true);
    mockFieldRepository.getFieldsForUser.mockResolvedValue(refreshedFields);

    const response = await request(app).delete('/fields/user-1/f9').expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f9',
        name: 'Zulu',
        userId: 'user-1',
      }),
    ]);
    expect(mockFieldRepository.deleteFieldForUser).toHaveBeenCalledWith('user-1', 'f9');
  });

  it('sets default field and returns refreshed list', async () => {
    const app = createApp();
    const refreshedFields: Field[] = [
      {
        id: 'f2',
        name: 'Beta',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: true,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    mockFieldRepository.setDefaultFieldForUser.mockResolvedValue(true);
    mockFieldRepository.getFieldsForUser.mockResolvedValue(refreshedFields);

    const response = await request(app).patch('/fields/user-1/f2/default').send({ isDefault: true }).expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f2',
        isDefault: true,
      }),
    ]);
    expect(mockFieldRepository.setDefaultFieldForUser).toHaveBeenCalledWith('user-1', 'f2');
  });
});
