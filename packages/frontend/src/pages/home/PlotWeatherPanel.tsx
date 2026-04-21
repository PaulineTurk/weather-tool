import type { PlotWeather } from '../../api/plotApi';
import { confidenceLabel, displayTemperature } from './plotFormatters';

type Props = {
  weather: PlotWeather | undefined;
  unit: 'C' | 'F';
  dayCardClassName: string;
  emptyClassName: string;
};

export function PlotWeatherPanel({ weather, unit, dayCardClassName, emptyClassName }: Props) {
  if (weather?.status === 'ok' && weather.days.length > 0) {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-2">
          {weather.days.map((dayWeather) => (
            <article key={dayWeather.date} className={`${dayCardClassName} whitespace-nowrap w-fit shrink-0`}>
              <p className="text-xs font-semibold text-gray-700">{dayWeather.date}</p>
              <p className="text-xs text-gray-600">
                Temp: {displayTemperature(dayWeather.temperatureC, unit)}
                {dayWeather.temperatureMin !== null && dayWeather.temperatureMax !== null && (
                  <span>
                    {' '}
                    ({displayTemperature(dayWeather.temperatureMin, unit)} -{' '}
                    {displayTemperature(dayWeather.temperatureMax, unit)})
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-600">
                Rain: {dayWeather.precipitationMm !== null ? `${dayWeather.precipitationMm} mm` : '-'}
              </p>
              <p className="text-xs text-gray-600">
                Wind: {dayWeather.windSpeedMs !== null ? `${dayWeather.windSpeedMs} m/s` : '-'}
                {dayWeather.windGustMs !== null && <span> (max: {dayWeather.windGustMs} m/s)</span>}
              </p>
              <p className="text-xs text-gray-600">
                Confidence: {confidenceLabel(dayWeather.confidenceLevel)}
              </p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <p className={emptyClassName}>{weather?.message ?? 'Weather forecast unavailable for this plot.'}</p>
  );
}
