import { z } from 'zod';

const idParamSchema = z.string().trim().min(1);

export const userIdParamsSchema = z.object({
  userId: idParamSchema,
});

export const userIdPlotIdParamsSchema = z.object({
  userId: idParamSchema,
  plotId: idParamSchema,
});

export const plotPayloadSchema = z.object({
  name: z.string().trim().min(1),
  address: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => {
      if (value === null || typeof value === 'undefined') return null;
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }),
  latitude: z
    .number()
    .optional()
    .nullable()
    .transform((value) => (typeof value === 'undefined' ? null : value)),
  longitude: z
    .number()
    .optional()
    .nullable()
    .transform((value) => (typeof value === 'undefined' ? null : value)),
});

export const defaultPlotPayloadSchema = z
  .object({
    isDefault: z.boolean().optional(),
  })
  .strict();

export const userPreferencesPayloadSchema = z
  .object({
    temperatureUnit: z.enum(['C', 'F']),
    forecastDays: z.number().int().min(1).max(10),
  })
  .strict();

export const frogcastResponseSchema = z.object({
  index: z.array(z.string()),
  columns: z.array(z.string()),
  data: z.array(z.array(z.unknown())),
});

const coordinateStringSchema = z.string()
  .transform(Number.parseFloat)
  .pipe(z.number());

export const nominatimResponseSchema = z.array(
  z.object({
    lat: coordinateStringSchema,
    lon: coordinateStringSchema,
  })
).min(1);

export type PlotPayloadInput = z.infer<typeof plotPayloadSchema>;
export type DefaultPlotPayloadInput = z.infer<typeof defaultPlotPayloadSchema>;
export type UserPreferencesPayloadInput = z.infer<typeof userPreferencesPayloadSchema>;
export type FrogcastResponseSchema = z.infer<typeof frogcastResponseSchema>;
export type NominatimResponseSchema = z.infer<typeof nominatimResponseSchema>;