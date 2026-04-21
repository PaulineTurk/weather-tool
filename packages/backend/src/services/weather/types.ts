export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherDay = {
  date: string;
  temperatureC: number | null;
  temperatureMin: number | null;
  temperatureMax: number | null;
  precipitationMm: number | null;
  windSpeedMs: number | null;
  windGustMs: number | null;
  confidenceLevel: 'high' | 'medium' | 'low' | 'unknown';
};

export type PlotWeather = {
  status: 'ok' | 'not_found' | 'unavailable';
  message: string | null;
  location: Coordinates | null;
  days: WeatherDay[];
};

export interface WeatherProvider {
  fetchWeather(coordinates: Coordinates): Promise<WeatherDay[] | null>;
  isConfigured(): boolean;
}

export interface Geocoder {
  geocode(address: string): Promise<Coordinates | null>;
}
