import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository';

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
};
