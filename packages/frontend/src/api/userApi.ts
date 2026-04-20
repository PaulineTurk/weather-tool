export type User = {
  id: string;
  name: string;
  temperatureUnit: 'C' | 'F';
  forecastDays: number;
  createdAt: string;
  updatedAt: string;
};

export type UserPreferencesPayload = {
  temperatureUnit: 'C' | 'F';
  forecastDays: number;
};

export const userApi = {
  async getDefaultUser(): Promise<User> {
    const response = await fetch('/api/users/default');

    if (!response.ok) {
      throw new Error('Failed to fetch default user');
    }

    return response.json();
  },

  async updateUserPreferences(userId: string, payload: UserPreferencesPayload): Promise<User> {
    const response = await fetch(`/api/users/${userId}/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update user preferences');
    }

    return response.json();
  },
};
