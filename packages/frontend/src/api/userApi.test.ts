import { userApi, User } from './userApi';

describe('userApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDefaultUser', () => {
    it('should return user data when fetch is successful', async () => {
      const mockUser: User = {
        id: 'default-user',
        name: 'Default User',
        temperatureUnit: 'C',
        forecastDays: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse = new Response(JSON.stringify(mockUser))

      vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

      const result = await userApi.getDefaultUser();

      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith('/api/users/default');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when response is not ok', async () => {
      const mockResponseWithError = new Response(
        null,
        {
          status: 500,
        });

      vi.spyOn(global, "fetch").mockResolvedValue(mockResponseWithError);

      await expect(userApi.getDefaultUser()).rejects.toThrow(
        'Failed to fetch default user'
      );
    });

    it('should throw an error on network failure', async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(
        new Error('Network error')
      );

      await expect(userApi.getDefaultUser()).rejects.toThrow('Network error');
    });
  });

  describe('updateUserPreferences', () => {
    it('updates preferences for a user', async () => {
      const updatedUser: User = {
        id: 'default-user',
        name: 'Default User',
        temperatureUnit: 'F',
        forecastDays: 7,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(updatedUser)));

      const result = await userApi.updateUserPreferences('default-user', { temperatureUnit: 'F', forecastDays: 7 });

      expect(result).toEqual(updatedUser);
      expect(fetch).toHaveBeenCalledWith(
        '/api/users/default-user/preferences',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
