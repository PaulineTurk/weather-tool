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
});
