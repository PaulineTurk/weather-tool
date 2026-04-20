import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository';
import { userIdParamsSchema, userPreferencesPayloadSchema } from '../validation/schemas';

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
      const params = userIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid userId param' });
        return;
      }

      const parsed = userPreferencesPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid preferences payload' });
        return;
      }

      const userId = params.data.userId;
      const preferences = parsed.data;
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
