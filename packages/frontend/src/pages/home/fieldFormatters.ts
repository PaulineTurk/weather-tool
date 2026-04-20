import type { WeatherDay } from '../../api/fieldApi';

export const confidenceLabel = (level: WeatherDay['confidenceLevel']): string => {
  if (level === 'high') return 'High';
  if (level === 'medium') return 'Medium';
  if (level === 'low') return 'Low';
  return 'Unknown';
};

export const displayTemperature = (temperatureC: number | null, unit: 'C' | 'F'): string => {
  if (temperatureC === null) {
    return '-';
  }

  if (unit === 'F') {
    return `${Math.round((temperatureC * 9) / 5 + 32)} °F`;
  }

  return `${temperatureC} °C`;
};
