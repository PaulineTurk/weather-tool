import { z } from 'zod';

const idParamSchema = z.string().trim().min(1);

export const userIdParamsSchema = z.object({
  userId: idParamSchema,
});

export const userIdFieldIdParamsSchema = z.object({
  userId: idParamSchema,
  fieldId: idParamSchema,
});

export const fieldPayloadSchema = z.object({
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

export const defaultFieldPayloadSchema = z
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

export type FieldPayloadInput = z.infer<typeof fieldPayloadSchema>;
export type DefaultFieldPayloadInput = z.infer<typeof defaultFieldPayloadSchema>;
export type UserPreferencesPayloadInput = z.infer<typeof userPreferencesPayloadSchema>;
