import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const readProperty = (source: object, key: string): unknown => Reflect.get(source, key);

const normalizePreferencesPayload = (body: unknown): { temperatureUnit: 'C' | 'F'; forecastDays: number } | null => {
  if (!isObject(body)) {
    return null;
  }

  const temperatureUnit = readProperty(body, 'temperatureUnit');
  const forecastDays = readProperty(body, 'forecastDays');

  if ((temperatureUnit !== 'C' && temperatureUnit !== 'F') || typeof forecastDays !== 'number') {
    return null;
  }

  if (!Number.isInteger(forecastDays) || forecastDays < 1 || forecastDays > 10) {
    return null;
  }

  return { temperatureUnit, forecastDays };
};

export const userController = {
  async getDefaultUser(_req: Request, res: Response): Promise<void> {
    try {
      const user = await userRepository.getDefaultUser();

      if (!user) {
        res.status(404).json({ error: 'Default user not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const preferences = normalizePreferencesPayload(req.body);

      if (!preferences) {
        res.status(400).json({ error: 'Invalid preferences payload' });
        return;
      }

      const updatedUser = await userRepository.updateUserPreferences(userId, preferences);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
