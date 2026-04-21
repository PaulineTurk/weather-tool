import type { Coordinates, Geocoder } from './types';
import { nominatimResponseSchema } from '../../validation/schemas';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'weather-tool/1.0';

export class NominatimGeocoder implements Geocoder {
  async geocode(address: string): Promise<Coordinates | null> {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) return null;

    const parsed = nominatimResponseSchema.safeParse(await response.json());
    if (!parsed.success) return null;

    const { lat: latitude, lon: longitude } = parsed.data[0];

    return { latitude, longitude };
  }
}
