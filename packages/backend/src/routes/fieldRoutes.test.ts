import request from 'supertest';
import express from 'express';
import fieldRoutes from './fieldRoutes';
import { fieldController } from '../controllers/fieldController';

jest.mock('../controllers/fieldController', () => ({
  fieldController: {
    getFieldsForUser: jest.fn((req, res) => {
      res.json([{ id: 'f1', name: 'Alpha' }]);
      return Promise.resolve();
    }),
    createFieldForUser: jest.fn((req, res) => {
      res.status(201).json([{ id: 'f2', name: 'Beta' }]);
      return Promise.resolve();
    }),
    updateFieldForUser: jest.fn((req, res) => {
      res.json([{ id: 'f1', name: 'Edited' }]);
      return Promise.resolve();
    }),
    deleteFieldForUser: jest.fn((req, res) => {
      res.json([]);
      return Promise.resolve();
    }),
  },
}));

const mockFieldController = jest.mocked(fieldController);

describe('fieldRoutes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/fields', fieldRoutes);
    jest.clearAllMocks();
  });

  it('routes GET /users/:userId to getFieldsForUser', async () => {
    await request(app).get('/api/fields/users/user-1').expect(200);
    expect(mockFieldController.getFieldsForUser).toHaveBeenCalled();
  });

  it('routes POST /users/:userId to createFieldForUser', async () => {
    await request(app)
      .post('/api/fields/users/user-1')
      .send({ name: 'Beta', latitude: null, longitude: null, address: null })
      .expect(201);

    expect(mockFieldController.createFieldForUser).toHaveBeenCalled();
  });

  it('routes PUT /users/:userId/:fieldId to updateFieldForUser', async () => {
    await request(app)
      .put('/api/fields/users/user-1/field-1')
      .send({ name: 'Edited', latitude: null, longitude: null, address: null })
      .expect(200);

    expect(mockFieldController.updateFieldForUser).toHaveBeenCalled();
  });

  it('routes DELETE /users/:userId/:fieldId to deleteFieldForUser', async () => {
    await request(app).delete('/api/fields/users/user-1/field-1').expect(200);
    expect(mockFieldController.deleteFieldForUser).toHaveBeenCalled();
  });
});
