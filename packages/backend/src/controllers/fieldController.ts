import { Request, Response } from 'express';
import { FieldPayload, fieldRepository } from '../repositories/fieldRepository';
import { weatherService } from '../services/weatherService';
import { userRepository } from '../repositories/userRepository';
import {
  defaultFieldPayloadSchema,
  fieldPayloadSchema,
  userIdFieldIdParamsSchema,
  userIdParamsSchema,
} from '../validation/schemas';

export const fieldController = {
  async enrichFieldsWithWeather(userId: string) {
    const user = await userRepository.getUserById(userId);
    const forecastDays = user ? user.forecastDays : 1;
    const fields = await fieldRepository.getFieldsForUser(userId);
    const enriched = await Promise.all(
      fields.map(async (field) => {
        const weather = await weatherService.getWeatherForField(field);
        return {
          ...field,
          weather: {
            ...weather,
            days: weather.days.slice(0, forecastDays),
          },
        };
      })
    );

    return enriched;
  },

  async getFieldsForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid userId param' });
        return;
      }

      const userId = params.data.userId;
      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createFieldForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid userId param' });
        return;
      }

      const parsed = fieldPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid field payload' });
        return;
      }

      const userId = params.data.userId;
      const payload: FieldPayload = parsed.data;
      await fieldRepository.createFieldForUser(userId, payload);
      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.status(201).json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateFieldForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdFieldIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid params' });
        return;
      }

      const parsed = fieldPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid field payload' });
        return;
      }

      const { userId, fieldId } = params.data;
      const payload: FieldPayload = parsed.data;
      const updated = await fieldRepository.updateFieldForUser(userId, fieldId, payload);

      if (!updated) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteFieldForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdFieldIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid params' });
        return;
      }

      const { userId, fieldId } = params.data;
      const deleted = await fieldRepository.deleteFieldForUser(userId, fieldId);

      if (!deleted) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async setDefaultFieldForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdFieldIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid params' });
        return;
      }

      const parsed = defaultFieldPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid default payload' });
        return;
      }

      const { userId, fieldId } = params.data;
      const shouldSetDefault = parsed.data.isDefault ?? true;
      const updated = shouldSetDefault
        ? await fieldRepository.setDefaultFieldForUser(userId, fieldId)
        : await fieldRepository.clearDefaultFieldForUser(userId, fieldId);

      if (!updated) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
