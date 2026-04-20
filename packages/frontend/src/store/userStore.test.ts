import { act } from '@testing-library/react';
import { useUserStore } from './userStore';
import { User, userApi } from '../api/userApi';

vi.mock('../api/userApi', () => ({
  userApi: {
    getDefaultUser: vi.fn(),
  },
}));

const mockUserApi = vi.mocked(userApi);

describe('userStore', () => {
  afterEach(() => {
    localStorage.clear();
    useUserStore.setState({
      user: null,
      defaultPlot: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with null user', () => {
      const { user } = useUserStore.getState();
      expect(user).toBeNull();
    });

    it('should start with isLoading false', () => {
      const { isLoading } = useUserStore.getState();
      expect(isLoading).toEqual(false);
    });

    it('should start with null error', () => {
      const { error } = useUserStore.getState();
      expect(error).toBeNull();
    });

    it('should start with null default plot', () => {
      const { defaultPlot } = useUserStore.getState();
      expect(defaultPlot).toBeNull();
    });
  });

  describe('fetchUser', () => {
    it('should set isLoading to true while fetching', async () => {
      mockUserApi.getDefaultUser.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      await act(async () => {
        useUserStore.getState().fetchUser();
      });

      const { isLoading } = useUserStore.getState();
      expect(isLoading).toBe(true);
    });

    it('should set user state on successful fetch', async () => {
      const mockUser: User = {
        id: 'default-user',
        name: 'Default User',
        temperatureUnit: 'C',
        forecastDays: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockUserApi.getDefaultUser.mockResolvedValue(mockUser);

      await act(async () => {
        await useUserStore.getState().fetchUser();
      });

      const { user, isLoading, error } = useUserStore.getState();
      expect(user).toEqual(mockUser);
      expect(isLoading).toBe(false);
      expect(error).toBeNull();
    });

    it('should load cached default plot on successful fetch', async () => {
      const mockUser: User = {
        id: 'default-user',
        name: 'Default User',
        temperatureUnit: 'C',
        forecastDays: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      localStorage.setItem(
        'user-default-plot-cache',
        JSON.stringify({
          userId: 'default-user',
          plot: {
            id: 'f1',
            name: 'Alpha',
            latitude: null,
            longitude: null,
            address: null,
            isDefault: true,
            userId: 'default-user',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        }),
      );

      mockUserApi.getDefaultUser.mockResolvedValue(mockUser);

      await act(async () => {
        await useUserStore.getState().fetchUser();
      });

      const { defaultPlot } = useUserStore.getState();
      expect(defaultPlot).not.toBeNull();
      expect(defaultPlot?.id).toBe('f1');
    });

    it('should set error state on failed fetch', async () => {
      mockUserApi.getDefaultUser.mockRejectedValue(new Error('Failed to fetch'));

      await act(async () => {
        await useUserStore.getState().fetchUser();
      });

      const { user, isLoading, error } = useUserStore.getState();
      expect(user).toBeNull();
      expect(isLoading).toBe(false);
      expect(error).toBe('Failed to fetch');
    });

    it('should clear previous error before fetching', async () => {
      // Set initial error
      useUserStore.setState({ error: 'Previous error' });

      mockUserApi.getDefaultUser.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      await act(async () => {
        useUserStore.getState().fetchUser();
      });

      const { error } = useUserStore.getState();
      expect(error).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      mockUserApi.getDefaultUser.mockRejectedValue('String error');

      await act(async () => {
        await useUserStore.getState().fetchUser();
      });

      const { error } = useUserStore.getState();
      expect(error).toBe('Unknown error');
    });
  });

  describe('default plot cache', () => {
    it('should cache default plot in localStorage', () => {
      useUserStore.getState().cacheDefaultPlot('user-1', {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: true,
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const { defaultPlot } = useUserStore.getState();
      expect(defaultPlot?.id).toBe('f1');
      expect(localStorage.getItem('user-default-plot-cache')).not.toBeNull();
    });

    it('should clear cached default plot', () => {
      useUserStore.getState().cacheDefaultPlot('user-1', {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: true,
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      useUserStore.getState().cacheDefaultPlot('user-1', null);

      const { defaultPlot } = useUserStore.getState();
      expect(defaultPlot).toBeNull();
      expect(localStorage.getItem('user-default-plot-cache')).toBeNull();
    });
  });
});
