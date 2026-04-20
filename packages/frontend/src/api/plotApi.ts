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
  location: {
    latitude: number;
    longitude: number;
  } | null;
  days: WeatherDay[];
};

export type Plot = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  weather?: PlotWeather;
};

export type PlotPayload = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

export const plotApi = {
  async getPlotsForUser(userId: string): Promise<Plot[]> {
    const response = await fetch(`/api/plots/users/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch plots');
    }

    return response.json();
  },

  async createPlot(userId: string, payload: PlotPayload): Promise<Plot[]> {
    const response = await fetch(`/api/plots/users/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create plot');
    }

    return response.json();
  },

  async updatePlot(userId: string, plotId: string, payload: PlotPayload): Promise<Plot[]> {
    const response = await fetch(`/api/plots/users/${userId}/${plotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update plot');
    }

    return response.json();
  },

  async deletePlot(userId: string, plotId: string): Promise<Plot[]> {
    const response = await fetch(`/api/plots/users/${userId}/${plotId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete plot');
    }

    return response.json();
  },

  async setPlotDefault(userId: string, plotId: string, isDefault: boolean): Promise<Plot[]> {
    const response = await fetch(`/api/plots/users/${userId}/${plotId}/default`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault }),
    });

    if (!response.ok) {
      throw new Error('Failed to update default plot');
    }

    return response.json();
  },
};
