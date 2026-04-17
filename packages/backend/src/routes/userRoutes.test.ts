import request from 'supertest';
import express from 'express';
import userRoutes from './userRoutes';
import { userController } from '../controllers/userController';

// Mock the userController
jest.mock('../controllers/userController', () => ({
  userController: {
    getDefaultUser: jest.fn((req, res) => {
      res.json({ id: 'default-user', name: 'Default User' });
      return Promise.resolve();
    }),
  },
}));

const mockUserController = userController as jest.Mocked<typeof userController>;

describe('userRoutes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/users/default', () => {
    it('should call the getDefaultUser controller', async () => {
      await request(app).get('/api/users/default').expect(200);

      expect(mockUserController.getDefaultUser).toHaveBeenCalled();
    });

    it('should return the default user data', async () => {
      mockUserController.getDefaultUser.mockImplementation((req, res) => {
        res.json({
          id: 'default-user',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        });
        return Promise.resolve();
      });

      const response = await request(app)
        .get('/api/users/default')
        .expect(200);

      expect(response.body).toEqual({
        id: 'default-user',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle controller errors', async () => {
      mockUserController.getDefaultUser.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
        return Promise.resolve();
      });

      const response = await request(app)
        .get('/api/users/default')
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
