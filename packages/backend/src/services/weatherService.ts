import { Plot } from '../repositories/plotRepository';
import { FrogcastProvider } from './weather/FrogcastProvider';
import { NominatimGeocoder } from './weather/NominatimGeocoder';
import type { Coordinates, PlotWeather } from './weather/types';
import { WeatherProvider, Geocoder } from './weather/types';

const isValidCoordinates = (coordinates: Coordinates): boolean =>
  coordinates.latitude >= -90 &&
  coordinates.latitude <= 90 &&
  coordinates.longitude >= -180 &&
  coordinates.longitude <= 180;

const resolveCoordinates = async (
  plot: Plot,
  geocoder: Geocoder,
): Promise<Coordinates | null> => {
  if (plot.latitude !== null && plot.longitude !== null) {
    return { latitude: plot.latitude, longitude: plot.longitude };
  }
  if (plot.address) {
    return await geocoder.geocode(plot.address);
  }
  return null;
};

const createWeatherService = (weatherProvider: WeatherProvider, geocoder: Geocoder): {
  getWeatherForCoordinates(coordinates: Coordinates): Promise<PlotWeather>;
  getWeatherForPlot(plot: Plot): Promise<PlotWeather>;
} => {

  const fetchWeather = async (coordinates: Coordinates): Promise<PlotWeather> => {
    if (!weatherProvider.isConfigured()) {
      return { status: 'unavailable', message: 'Weather provider token is missing. Configure FROGCAST_API_TOKEN.', location: null, days: [] };
    }

    if (!isValidCoordinates(coordinates)) {
      return { status: 'not_found', message: 'Coordinates are out of range.', location: null, days: [] };
    }

    const weatherDays = await weatherProvider.fetchWeather(coordinates);
    if (!weatherDays || weatherDays.length === 0) {
      return { status: 'not_found', message: 'Weather forecast not found for this location.', location: coordinates, days: [] };
    }

    return { status: 'ok', message: null, location: coordinates, days: weatherDays };
  };

  return {
    async getWeatherForCoordinates(coordinates: Coordinates): Promise<PlotWeather> {
      try {
        return await fetchWeather(coordinates);
      } catch {
        return { status: 'unavailable', message: 'Weather service is temporarily unavailable.', location: null, days: [] };
      }
    },

    async getWeatherForPlot(plot: Plot): Promise<PlotWeather> {
      try {
        const coordinates = await resolveCoordinates(plot, geocoder);
        if (!coordinates) {
          return { status: 'not_found', message: 'No usable address or coordinates for this plot.', location: null, days: [] };
        }
        return await fetchWeather(coordinates);
      } catch {
        return { status: 'unavailable', message: 'Weather service is temporarily unavailable.', location: null, days: [] };
      }
    },
  };
};

const frogcastProvider = new FrogcastProvider();
const nominatimGeocoder = new NominatimGeocoder();

export const weatherService = createWeatherService(frogcastProvider, nominatimGeocoder);

export { createWeatherService };