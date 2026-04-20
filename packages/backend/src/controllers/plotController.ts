import { Request, Response } from 'express';
import { PlotPayload, plotRepository } from '../repositories/plotRepository';
import { weatherService } from '../services/weatherService';
import { userRepository } from '../repositories/userRepository';
import {
  defaultPlotPayloadSchema,
  plotPayloadSchema,
  userIdPlotIdParamsSchema,
  userIdParamsSchema,
} from '../validation/schemas';

export const plotController = {
  async enrichPlotsWithWeather(userId: string) {
    const user = await userRepository.getUserById(userId);
    const forecastDays = user ? user.forecastDays : 1;
    const plots = await plotRepository.getPlotsForUser(userId);
    const enriched = await Promise.all(
      plots.map(async (plot) => {
        const weather = await weatherService.getWeatherForPlot(plot);
        return {
          ...plot,
          weather: {
            ...weather,
            days: weather.days.slice(0, forecastDays),
          },
        };
      }),
    );

    return enriched;
  },

  async getPlotsForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid userId param' });
        return;
      }

      const userId = params.data.userId;
      const plots = await plotController.enrichPlotsWithWeather(userId);
      res.json(plots);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createPlotForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid userId param' });
        return;
      }

      const parsed = plotPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid plot payload' });
        return;
      }

      const userId = params.data.userId;
      const payload: PlotPayload = parsed.data;
      await plotRepository.createPlotForUser(userId, payload);
      const plots = await plotController.enrichPlotsWithWeather(userId);
      res.status(201).json(plots);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updatePlotForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdPlotIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid params' });
        return;
      }

      const parsed = plotPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid plot payload' });
        return;
      }

      const { userId, plotId } = params.data;
      const payload: PlotPayload = parsed.data;
      const updated = await plotRepository.updatePlotForUser(userId, plotId, payload);

      if (!updated) {
        res.status(404).json({ error: 'Plot not found' });
        return;
      }

      const plots = await plotController.enrichPlotsWithWeather(userId);
      res.json(plots);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deletePlotForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdPlotIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid params' });
        return;
      }

      const { userId, plotId } = params.data;
      const deleted = await plotRepository.deletePlotForUser(userId, plotId);

      if (!deleted) {
        res.status(404).json({ error: 'Plot not found' });
        return;
      }

      const plots = await plotController.enrichPlotsWithWeather(userId);
      res.json(plots);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async setDefaultPlotForUser(req: Request, res: Response): Promise<void> {
    try {
      const params = userIdPlotIdParamsSchema.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid params' });
        return;
      }

      const parsed = defaultPlotPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid default payload' });
        return;
      }

      const { userId, plotId } = params.data;
      const shouldSetDefault = parsed.data.isDefault ?? true;
      const updated = shouldSetDefault
        ? await plotRepository.setDefaultPlotForUser(userId, plotId)
        : await plotRepository.clearDefaultPlotForUser(userId, plotId);

      if (!updated) {
        res.status(404).json({ error: 'Plot not found' });
        return;
      }

      const plots = await plotController.enrichPlotsWithWeather(userId);
      res.json(plots);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
