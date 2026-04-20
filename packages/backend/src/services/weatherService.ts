import { Plot } from '../repositories/plotRepository';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherDay = {
  date: string;
  temperatureC: number | null;
  precipitationMm: number | null;
  windSpeedMs: number | null;
  confidenceLevel: 'high' | 'medium' | 'low' | 'unknown';
};

export type PlotWeather = {
  status: 'ok' | 'not_found' | 'unavailable';
  message: string | null;
  location: Coordinates | null;
  days: WeatherDay[];
};

const frogcastBaseUrl = 'https://api.frogcast.com/api/v1/forecast/';
const geocodeBaseUrl = 'https://nominatim.openstreetmap.org/search';
const maxDays = 11;
const readApiToken = (): string | null => {
  const token = process.env.FROGCAST_API_TOKEN;
  if (typeof token !== 'string') {
    return null;
  }

  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : null;
};
const isConfigured = (): boolean => readApiToken() !== null;

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const readString = (source: object, key: string): string | null => {
  const value = Reflect.get(source, key);
  return typeof value === 'string' ? value : null;
};

const toRounded = (value: number | null): number | null => {
  if (value === null) {
    return null;
  }

  return Math.round(value * 10) / 10;
};

const average = (values: Array<number | null>): number | null => {
  const filteredValues = values.filter((value): value is number => value !== null);
  if (filteredValues.length === 0) {
    return null;
  }

  const total = filteredValues.reduce((sum, value) => sum + value, 0);
  return total / filteredValues.length;
};

const sum = (values: Array<number | null>): number | null => {
  const filteredValues = values.filter((value): value is number => value !== null);
  if (filteredValues.length === 0) {
    return null;
  }

  return filteredValues.reduce((accumulator, value) => accumulator + value, 0);
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
    .slice(0, maxDays)
    .map(([date, values]) => {
      const spreadAverage = average(values.spread);
      return {
        date,
        temperatureC: toRounded(average(values.temp)),
        precipitationMm: toRounded(sum(values.rain)),
        windSpeedMs: toRounded(average(values.wind)),
        confidenceLevel: confidenceFromSpread(spreadAverage),
      };
    });
};

const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
  });

  const response = await fetch(`${geocodeBaseUrl}?${params.toString()}`, {
    headers: {
      'User-Agent': 'weather-tool/1.0',
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const first = payload[0];
  if (!isObject(first)) {
    return null;
  }

  const lat = readString(first, 'lat');
  const lon = readString(first, 'lon');

  if (!lat || !lon) {
    return null;
  }

  const latitude = Number.parseFloat(lat);
  const longitude = Number.parseFloat(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

const resolveCoordinates = async (plot: Plot): Promise<Coordinates | null> => {
  if (plot.address) {
    const fromAddress = await geocodeAddress(plot.address);
    if (fromAddress) {
      return fromAddress;
    }
  }

  if (plot.latitude !== null && plot.longitude !== null) {
    const isLatitudeValid = plot.latitude >= -90 && plot.latitude <= 90;
    const isLongitudeValid = plot.longitude >= -180 && plot.longitude <= 180;
    if (isLatitudeValid && isLongitudeValid) {
      return { latitude: plot.latitude, longitude: plot.longitude };
    }
  }

  return null;
};

const fetchFrogcastWeather = async (coordinates: Coordinates): Promise<WeatherDay[] | null> => {
  const apiToken = readApiToken();
  if (!apiToken) {
    return null;
  }

  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    horizon: '15840',
    time_step: '60',
    fields: 't2m,mtpr,10m_wind_speed,t2m_p10,t2m_p90',
    format: 'json',
  });

  const response = await fetch(`${frogcastBaseUrl}?${params.toString()}`, {
    headers: {
      Authorization: `Token ${apiToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  if (!isObject(payload)) {
    return null;
  }

  const indexValue = Reflect.get(payload, 'index');
  const columnsValue = Reflect.get(payload, 'columns');
  const dataValue = Reflect.get(payload, 'data');

  if (!Array.isArray(indexValue) || !Array.isArray(columnsValue) || !Array.isArray(dataValue)) {
    return null;
  }

  const indexes = indexValue.filter((value): value is string => typeof value === 'string');
  const columns = columnsValue.filter((value): value is string => typeof value === 'string');

  if (indexes.length === 0 || columns.length === 0) {
    return null;
  }

  const columnPosition = (names: string[]): number => {
    for (const name of names) {
      const position = columns.indexOf(name);
      if (position >= 0) {
        return position;
      }
    }

    return -1;
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

  const weather = buildDailyWeather({
    index: indexes,
    t2m: rows.map((row) => readCell(row, t2mIndex)),
    mtpr: rows.map((row) => readCell(row, mtprIndex)),
    wind: rows.map((row) => readCell(row, windIndex)),
    t2mP10: rows.map((row) => (t2mP10Index >= 0 ? readCell(row, t2mP10Index) : null)),
    t2mP90: rows.map((row) => (t2mP90Index >= 0 ? readCell(row, t2mP90Index) : null)),
  });

  return weather;
};

export const weatherService = {
  async getWeatherForCoordinates(coordinates: Coordinates): Promise<PlotWeather> {
    try {
      if (!isConfigured()) {
        return {
          status: 'unavailable',
          message: 'Weather provider token is missing. Configure FROGCAST_API_TOKEN.',
          location: null,
          days: [],
        };
      }

      const isLatitudeValid = coordinates.latitude >= -90 && coordinates.latitude <= 90;
      const isLongitudeValid = coordinates.longitude >= -180 && coordinates.longitude <= 180;
      if (!isLatitudeValid || !isLongitudeValid) {
        return {
          status: 'not_found',
          message: 'Coordinates are out of range.',
          location: null,
          days: [],
        };
      }

      const days = await fetchFrogcastWeather(coordinates);

      if (!days || days.length === 0) {
        return {
          status: 'not_found',
          message: 'Weather forecast not found for this location.',
          location: coordinates,
          days: [],
        };
      }

      return {
        status: 'ok',
        message: null,
        location: coordinates,
        days,
      };
    } catch (_error) {
      return {
        status: 'unavailable',
        message: 'Weather service is temporarily unavailable.',
        location: null,
        days: [],
      };
    }
  },

  async getWeatherForPlot(plot: Plot): Promise<PlotWeather> {
    try {
      if (!isConfigured()) {
        return {
          status: 'unavailable',
          message: 'Weather provider token is missing. Configure FROGCAST_API_TOKEN.',
          location: null,
          days: [],
        };
      }

      const coordinates = await resolveCoordinates(plot);

      if (!coordinates) {
        return {
          status: 'not_found',
          message: 'No usable address or coordinates for this plot.',
          location: null,
          days: [],
        };
      }

      return weatherService.getWeatherForCoordinates(coordinates);
    } catch (_error) {
      return {
        status: 'unavailable',
        message: 'Weather service is temporarily unavailable.',
        location: null,
        days: [],
      };
    }
  },
};
