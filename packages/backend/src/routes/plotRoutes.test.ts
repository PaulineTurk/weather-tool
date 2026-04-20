import request from 'supertest';
import express from 'express';
import plotRoutes from './plotRoutes';
import { plotController } from '../controllers/plotController';

jest.mock('../controllers/plotController', () => ({
  plotController: {
    getPlotsForUser: jest.fn((_req, res) => {
      res.json([{ id: 'f1', name: 'Alpha' }]);
      return Promise.resolve();
    }),
    createPlotForUser: jest.fn((_req, res) => {
      res.status(201).json([{ id: 'f2', name: 'Beta' }]);
      return Promise.resolve();
    }),
    updatePlotForUser: jest.fn((_req, res) => {
      res.json([{ id: 'f1', name: 'Edited' }]);
      return Promise.resolve();
    }),
    setDefaultPlotForUser: jest.fn((_req, res) => {
      res.json([{ id: 'f1', name: 'Alpha', isDefault: true }]);
      return Promise.resolve();
    }),
    deletePlotForUser: jest.fn((_req, res) => {
      res.json([]);
      return Promise.resolve();
    }),
  },
}));

const mockPlotController = jest.mocked(plotController);

describe('plotRoutes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/plots', plotRoutes);
    jest.clearAllMocks();
  });

  it('routes GET /users/:userId to getPlotsForUser', async () => {
    await request(app).get('/api/plots/users/user-1').expect(200);
    expect(mockPlotController.getPlotsForUser).toHaveBeenCalled();
  });

  it('routes POST /users/:userId to createPlotForUser', async () => {
    await request(app)
      .post('/api/plots/users/user-1')
      .send({ name: 'Beta', latitude: null, longitude: null, address: null })
      .expect(201);

    expect(mockPlotController.createPlotForUser).toHaveBeenCalled();
  });

  it('routes PUT /users/:userId/:plotId to updatePlotForUser', async () => {
    await request(app)
      .put('/api/plots/users/user-1/plot-1')
      .send({ name: 'Edited', latitude: null, longitude: null, address: null })
      .expect(200);

    expect(mockPlotController.updatePlotForUser).toHaveBeenCalled();
  });

  it('routes DELETE /users/:userId/:plotId to deletePlotForUser', async () => {
    await request(app).delete('/api/plots/users/user-1/plot-1').expect(200);
    expect(mockPlotController.deletePlotForUser).toHaveBeenCalled();
  });

  it('routes PATCH /users/:userId/:plotId/default to setDefaultPlotForUser', async () => {
    await request(app).patch('/api/plots/users/user-1/plot-1/default').send({ isDefault: true }).expect(200);
    expect(mockPlotController.setDefaultPlotForUser).toHaveBeenCalled();
  });
});
