import type { Coordinates, WeatherDay, WeatherProvider } from './types';
import { frogcastResponseSchema } from '../../validation/schemas';

const FROGCAST_BASE_URL = 'https://api.frogcast.com/api/v1/forecast/';
const MAX_DAYS = 11;
const MAX_HORIZON_IN_MINUTES = '15840';
const TIME_STEP_IN_MINUTES = '60';

const readApiToken = (): string | null => {
  const token = process.env.FROGCAST_API_TOKEN;
  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toRounded = (value: number | null): number | null => {
  if (value === null) {
    return null;
  }
  return Math.round(value * 10) / 10;
};

const filterNulls = (values: Array<number | null>): number[] =>
  values.filter((value): value is number => value !== null);

const average = (values: Array<number | null>): number | null => {
  const filtered = filterNulls(values);
  if (filtered.length === 0) return null;
  return filtered.reduce((accumulator, value) => accumulator + value, 0) / filtered.length;
};

const sum = (values: Array<number | null>): number | null => {
  const filtered = filterNulls(values);
  if (filtered.length === 0) return null;
  return filtered.reduce((accumulator, value) => accumulator + value, 0);
};

const min = (values: Array<number | null>): number | null => {
  const filtered = filterNulls(values);
  if (filtered.length === 0) return null;
  return Math.min(...filtered);
};

const max = (values: Array<number | null>): number | null => {
  const filtered = filterNulls(values);
  if (filtered.length === 0) return null;
  return Math.max(...filtered);
};

const confidenceFromSpread = (spread: number | null): 'high' | 'medium' | 'low' | 'unknown' => {
  if (spread === null) {
    return 'unknown';
  }
  if (spread <= 2) {
    return 'high';
  }
  if (spread <= 5) {
    return 'medium';
  }
  return 'low';
};

const buildDailyWeather = (raw: {
  index: string[];
  t2m: Array<number | null>;
  mtpr: Array<number | null>;
  wind: Array<number | null>;
  t2mP10: Array<number | null>;
  t2mP90: Array<number | null>;
}): WeatherDay[] => {
  const grouped = new Map<
    string,
    {
      temp: Array<number | null>;
      rain: Array<number | null>;
      wind: Array<number | null>;
      spread: Array<number | null>;
    }
  >();

  raw.index.forEach((timestamp, index) => {
    const date = timestamp.slice(0, 10);
    const existing = grouped.get(date) ?? { temp: [], rain: [], wind: [], spread: [] };
    const spread =
      raw.t2mP10[index] !== null && raw.t2mP90[index] !== null
        ? Math.abs((raw.t2mP90[index] ?? 0) - (raw.t2mP10[index] ?? 0))
        : null;

    existing.temp.push(raw.t2m[index] ?? null);
    existing.rain.push(raw.mtpr[index] ?? null);
    existing.wind.push(raw.wind[index] ?? null);
    existing.spread.push(spread);
    grouped.set(date, existing);
  });

  return Array.from(grouped.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .slice(0, MAX_DAYS)
    .map(([date, values]) => ({
      date,
      temperatureC: toRounded(average(values.temp)),
      temperatureMin: toRounded(min(values.temp)),
      temperatureMax: toRounded(max(values.temp)),
      precipitationMm: toRounded(sum(values.rain)),
      windSpeedMs: toRounded(average(values.wind)),
      windGustMs: toRounded(max(values.wind)),
      confidenceLevel: confidenceFromSpread(average(values.spread)),
    }));
};

export class FrogcastProvider implements WeatherProvider {
  isConfigured(): boolean {
    return readApiToken() !== null;
  }

  async fetchWeather(coordinates: Coordinates): Promise<WeatherDay[] | null> {
    const apiToken = readApiToken();
    if (!apiToken) {
      return null;
    }

    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      horizon: MAX_HORIZON_IN_MINUTES,
      time_step: TIME_STEP_IN_MINUTES,
      fields: 't2m,mtpr,10m_wind_speed,t2m_p10,t2m_p90',
      format: 'json',
    });

    const response = await fetch(`${FROGCAST_BASE_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Token ${apiToken}`,
      },
    });

    if (!response.ok) return null;

    const parsed = frogcastResponseSchema.safeParse(await response.json());
    if (!parsed.success) return null;

    const { index: indexes, columns, data: dataValue } = parsed.data;

    if (indexes.length === 0 || columns.length === 0) {
      return null;
    }

    const columnPosition = (names: string[]): number => {
      const found = names.map((name) => columns.indexOf(name)).find((position) => position >= 0);
      return found ?? -1;
    };

    const t2mIndex = columnPosition(['t2m', '2m_temperature']);
    const mtprIndex = columnPosition(['mtpr', 'mean_total_precipitation_rate']);
    const windIndex = columnPosition(['10m_wind_speed']);
    const t2mP10Index = columnPosition(['t2m_p10', '2m_temperature_p10']);
    const t2mP90Index = columnPosition(['t2m_p90', '2m_temperature_p90']);

    if (t2mIndex < 0 || mtprIndex < 0 || windIndex < 0) {
      return null;
    }

    const readCell = (row: unknown, index: number): number | null => {
      if (!Array.isArray(row)) {
        return null;
      }
      const value = row[index];
      return typeof value === 'number' && Number.isFinite(value) ? value : null;
    };

    const rows = dataValue.slice(0, indexes.length);

    return buildDailyWeather({
      index: indexes,
      t2m: rows.map((row) => readCell(row, t2mIndex)),
      mtpr: rows.map((row) => readCell(row, mtprIndex)),
      wind: rows.map((row) => readCell(row, windIndex)),
      t2mP10: rows.map((row) => (t2mP10Index >= 0 ? readCell(row, t2mP10Index) : null)),
      t2mP90: rows.map((row) => (t2mP90Index >= 0 ? readCell(row, t2mP90Index) : null)),
    });
  }
}

export { buildDailyWeather, confidenceFromSpread, average, sum, min, max, toRounded };
