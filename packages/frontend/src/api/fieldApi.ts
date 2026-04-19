export type WeatherDay = {
  date: string;
  temperatureC: number | null;
  precipitationMm: number | null;
  windSpeedMs: number | null;
  confidenceLevel: 'high' | 'medium' | 'low' | 'unknown';
}

export type FieldWeather = {
  status: 'ok' | 'not_found' | 'unavailable';
  message: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  days: WeatherDay[];
}

export type Field = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  weather?: FieldWeather;
}

export type FieldPayload = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

export const fieldApi = {
  async getFieldsForUser(userId: string): Promise<Field[]> {
    const response = await fetch(`/api/fields/users/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch fields');
    }

    return response.json();
  },

  async createField(userId: string, payload: FieldPayload): Promise<Field[]> {
    const response = await fetch(`/api/fields/users/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create field');
    }

    return response.json();
  },

  async updateField(userId: string, fieldId: string, payload: FieldPayload): Promise<Field[]> {
    const response = await fetch(`/api/fields/users/${userId}/${fieldId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update field');
    }

    return response.json();
  },

  async deleteField(userId: string, fieldId: string): Promise<Field[]> {
    const response = await fetch(`/api/fields/users/${userId}/${fieldId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete field');
    }

    return response.json();
  },

  async setFieldDefault(userId: string, fieldId: string, isDefault: boolean): Promise<Field[]> {
    const response = await fetch(`/api/fields/users/${userId}/${fieldId}/default`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault }),
    });

    if (!response.ok) {
      throw new Error('Failed to update default field');
    }

    return response.json();
  },
};
