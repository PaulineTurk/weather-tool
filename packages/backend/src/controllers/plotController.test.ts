import express from 'express';
import request from 'supertest';
import { plotController } from './plotController';
import { plotRepository } from '../repositories/plotRepository';
import { Plot } from '../repositories/plotRepository';
import { weatherService } from '../services/weatherService';
import { userRepository } from '../repositories/userRepository';

jest.mock('../repositories/plotRepository', () => ({
  plotRepository: {
    getPlotsForUser: jest.fn(),
    createPlotForUser: jest.fn(),
    updatePlotForUser: jest.fn(),
    deletePlotForUser: jest.fn(),
    setDefaultPlotForUser: jest.fn(),
    clearDefaultPlotForUser: jest.fn(),
  },
}));

jest.mock('../services/weatherService', () => ({
  weatherService: {
    getWeatherForPlot: jest.fn(),
  },
}));

jest.mock('../repositories/userRepository', () => ({
  userRepository: {
    getUserById: jest.fn(),
  },
}));

const mockPlotRepository = jest.mocked(plotRepository);
const mockWeatherService = jest.mocked(weatherService);
const mockUserRepository = jest.mocked(userRepository);

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/plots/:userId', (req, res) => plotController.getPlotsForUser(req, res));
  app.post('/plots/:userId', (req, res) => plotController.createPlotForUser(req, res));
  app.put('/plots/:userId/:plotId', (req, res) => plotController.updatePlotForUser(req, res));
  app.patch('/plots/:userId/:plotId/default', (req, res) => plotController.setDefaultPlotForUser(req, res));
  app.delete('/plots/:userId/:plotId', (req, res) => plotController.deletePlotForUser(req, res));
  return app;
};

describe('plotController', () => {
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
    mockWeatherService.getWeatherForPlot.mockResolvedValue({
      status: 'not_found',
      message: 'Weather forecast not found for this location.',
      location: null,
      days: [],
    });
  });

  it('returns plots for the requested user', async () => {
    const app = createApp();
    const plots: Plot[] = [
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
    mockPlotRepository.getPlotsForUser.mockResolvedValue(plots);

    const response = await request(app).get('/plots/user-1').expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f1',
        name: 'Alpha',
        userId: 'user-1',
      }),
    ]);
    expect(mockPlotRepository.getPlotsForUser).toHaveBeenCalledWith('user-1');
  });

  it('creates a plot and returns refreshed list', async () => {
    const app = createApp();
    const payload = { name: 'Beta', latitude: null, longitude: null, address: null };
    const refreshedPlots: Plot[] = [
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

    mockPlotRepository.createPlotForUser.mockResolvedValue({
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
    mockPlotRepository.getPlotsForUser.mockResolvedValue(refreshedPlots);

    const response = await request(app).post('/plots/user-1').send(payload).expect(201);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f2',
        name: 'Beta',
        userId: 'user-1',
      }),
    ]);
    expect(mockPlotRepository.createPlotForUser).toHaveBeenCalledWith('user-1', payload);
  });

  it('rejects invalid create payload', async () => {
    const app = createApp();
    const response = await request(app).post('/plots/user-1').send({ name: '' }).expect(400);

    expect(response.body).toEqual({ error: 'Invalid plot payload' });
    expect(mockPlotRepository.createPlotForUser).not.toHaveBeenCalled();
  });

  it('returns 404 when updated plot does not belong to user', async () => {
    const app = createApp();
    mockPlotRepository.updatePlotForUser.mockResolvedValue(null);

    const response = await request(app)
      .put('/plots/user-1/missing')
      .send({ name: 'Alpha', latitude: null, longitude: null, address: null })
      .expect(404);

    expect(response.body).toEqual({ error: 'Plot not found' });
  });

  it('deletes plot and returns refreshed list', async () => {
    const app = createApp();
    const refreshedPlots: Plot[] = [
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

    mockPlotRepository.deletePlotForUser.mockResolvedValue(true);
    mockPlotRepository.getPlotsForUser.mockResolvedValue(refreshedPlots);

    const response = await request(app).delete('/plots/user-1/f9').expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f9',
        name: 'Zulu',
        userId: 'user-1',
      }),
    ]);
    expect(mockPlotRepository.deletePlotForUser).toHaveBeenCalledWith('user-1', 'f9');
  });

  it('sets default plot and returns refreshed list', async () => {
    const app = createApp();
    const refreshedPlots: Plot[] = [
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

    mockPlotRepository.setDefaultPlotForUser.mockResolvedValue(true);
    mockPlotRepository.getPlotsForUser.mockResolvedValue(refreshedPlots);

    const response = await request(app)
      .patch('/plots/user-1/f2/default')
      .send({ isDefault: true })
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'f2',
        isDefault: true,
      }),
    ]);
    expect(mockPlotRepository.setDefaultPlotForUser).toHaveBeenCalledWith('user-1', 'f2');
  });

  it('defaults to setting default plot when body is empty', async () => {
    const app = createApp();
    mockPlotRepository.setDefaultPlotForUser.mockResolvedValue(true);
    mockPlotRepository.getPlotsForUser.mockResolvedValue([]);

    await request(app).patch('/plots/user-1/f2/default').send({}).expect(200);

    expect(mockPlotRepository.setDefaultPlotForUser).toHaveBeenCalledWith('user-1', 'f2');
    expect(mockPlotRepository.clearDefaultPlotForUser).not.toHaveBeenCalled();
  });

  it('rejects invalid default payload', async () => {
    const app = createApp();
    const response = await request(app)
      .patch('/plots/user-1/f2/default')
      .send({ isDefault: 'yes' })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid default payload' });
    expect(mockPlotRepository.setDefaultPlotForUser).not.toHaveBeenCalled();
    expect(mockPlotRepository.clearDefaultPlotForUser).not.toHaveBeenCalled();
  });
});
