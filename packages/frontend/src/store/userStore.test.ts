import { act } from '@testing-library/react';
import { useUserStore } from './userStore';
import { userApi } from '../api/userApi';

vi.mock('../api/userApi', () => ({
  userApi: {
    getDefaultUser: vi.fn(),
  },
}));

const mockUserApi = vi.mocked(userApi)

describe('userStore', () => {
  afterEach(() => {
    useUserStore.setState({
      user: null,
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
      const { isLoading } = useUserStore.getState()
      expect(isLoading).toEqual(false)
    });

    it('should start with null error', () => {
      const { error } = useUserStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('fetchUser', () => {
    it('should set isLoading to true while fetching', async () => {
      mockUserApi.getDefaultUser.mockImplementation(
        () => new Promise(() => { }) // Never resolves
      );

      await act(async () => {
        useUserStore.getState().fetchUser();
      });

      const { isLoading } = useUserStore.getState();
      expect(isLoading).toBe(true);
    });

    it('should set user state on successful fetch', async () => {
      const mockUser = {
        id: 'default-user',
        name: 'Default User',
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

    it('should set error state on failed fetch', async () => {
      mockUserApi.getDefaultUser.mockRejectedValue(
        new Error('Failed to fetch')
      );

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
        () => new Promise(() => { }) // Never resolves
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
});
