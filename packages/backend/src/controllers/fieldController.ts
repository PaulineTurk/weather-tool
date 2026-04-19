import { Request, Response } from 'express';
import { FieldPayload, fieldRepository } from '../repositories/fieldRepository';
import { weatherService } from '../services/weatherService';

const isValidOptionalNumber = (value: unknown): value is number | null | undefined => {
  return value === null || value === undefined || (typeof value === 'number' && Number.isFinite(value));
};

const getProperty = (source: object, key: string): unknown => {
  return Reflect.get(source, key);
};

const parseCoordinateQuery = (value: unknown): number | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
};

const normalizeFieldPayload = (body: unknown): FieldPayload | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const rawName = getProperty(body, 'name');
  const rawAddress = getProperty(body, 'address');
  const rawLatitude = getProperty(body, 'latitude');
  const rawLongitude = getProperty(body, 'longitude');

  if (typeof rawName !== 'string') {
    return null;
  }

  const name = rawName.trim();
  if (name.length === 0) {
    return null;
  }

  if (typeof rawAddress !== 'undefined' && rawAddress !== null && typeof rawAddress !== 'string') {
    return null;
  }

  if (!isValidOptionalNumber(rawLatitude) || !isValidOptionalNumber(rawLongitude)) {
    return null;
  }

  return {
    name,
    address: typeof rawAddress === 'string' && rawAddress.trim().length > 0 ? rawAddress.trim() : null,
    latitude: typeof rawLatitude === 'number' ? rawLatitude : null,
    longitude: typeof rawLongitude === 'number' ? rawLongitude : null,
  };
};

const normalizeDefaultPayload = (body: unknown): boolean | null => {
  if (typeof body !== 'object' || body === null) {
    return true;
  }

  const rawIsDefault = getProperty(body, 'isDefault');
  if (typeof rawIsDefault === 'undefined') {
    return true;
  }

  if (typeof rawIsDefault !== 'boolean') {
    return null;
  }

  return rawIsDefault;
};

export const fieldController = {
  async enrichFieldsWithWeather(userId: string) {
    const fields = await fieldRepository.getFieldsForUser(userId);
    const enriched = await Promise.all(
      fields.map(async (field) => ({
        ...field,
        weather: await weatherService.getWeatherForField(field),
      }))
    );

    return enriched;
  },

  async getFieldsForUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getWeatherByCoordinates(req: Request, res: Response): Promise<void> {
    try {
      const latitude = parseCoordinateQuery(req.query.latitude);
      const longitude = parseCoordinateQuery(req.query.longitude);

      if (latitude === null || longitude === null) {
        res.status(400).json({ error: 'latitude and longitude query params are required numbers' });
        return;
      }

      const weather = await weatherService.getWeatherForCoordinates({ latitude, longitude });
      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createFieldForUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const payload = normalizeFieldPayload(req.body);

      if (!payload) {
        res.status(400).json({ error: 'Invalid field payload' });
        return;
      }

      await fieldRepository.createFieldForUser(userId, payload);
      const fields = await fieldController.enrichFieldsWithWeather(userId);
      res.status(201).json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateFieldForUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const fieldId = req.params.fieldId;
      const payload = normalizeFieldPayload(req.body);

      if (!payload) {
        res.status(400).json({ error: 'Invalid field payload' });
        return;
      }

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
      const userId = req.params.userId;
      const fieldId = req.params.fieldId;
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
      const userId = req.params.userId;
      const fieldId = req.params.fieldId;
      const shouldSetDefault = normalizeDefaultPayload(req.body);

      if (shouldSetDefault === null) {
        res.status(400).json({ error: 'Invalid default payload' });
        return;
      }

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
