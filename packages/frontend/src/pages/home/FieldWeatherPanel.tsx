import type { FieldWeather } from '../../api/fieldApi';
import { confidenceLabel, displayTemperature } from './fieldFormatters';

type Props = {
  weather: FieldWeather | undefined;
  unit: 'C' | 'F';
  dayCardClassName: string;
  emptyClassName: string;
};

export function FieldWeatherPanel({ weather, unit, dayCardClassName, emptyClassName }: Props) {
  if (weather?.status === 'ok' && weather.days.length > 0) {
    return (
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {weather.days.map((dayWeather) => (
            <article key={dayWeather.date} className={dayCardClassName}>
              <p className="text-xs font-semibold text-gray-700">{dayWeather.date}</p>
              <p className="text-xs text-gray-600">Temp: {displayTemperature(dayWeather.temperatureC, unit)}</p>
              <p className="text-xs text-gray-600">
                Rain: {dayWeather.precipitationMm !== null ? `${dayWeather.precipitationMm} mm` : '-'}
              </p>
              <p className="text-xs text-gray-600">
                Wind: {dayWeather.windSpeedMs !== null ? `${dayWeather.windSpeedMs} m/s` : '-'}
              </p>
              <p className="text-xs text-gray-600">Confidence: {confidenceLabel(dayWeather.confidenceLevel)}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return <p className={emptyClassName}>{weather?.message ?? 'Weather forecast unavailable for this field.'}</p>;
}

