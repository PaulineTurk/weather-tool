import { create } from 'zustand';
import { User, userApi } from '../api/userApi';
import { Plot } from '../api/plotApi';

const defaultPlotCacheKey = 'user-default-plot-cache';

type CachedDefaultPlot = {
  userId: string;
  plot: Plot;
};

const isPlot = (value: unknown): value is Plot => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const id = Reflect.get(value, 'id');
  const name = Reflect.get(value, 'name');
  const userId = Reflect.get(value, 'userId');
  const isDefault = Reflect.get(value, 'isDefault');

  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    typeof userId === 'string' &&
    typeof isDefault === 'boolean'
  );
};

const isCachedDefaultPlot = (value: unknown): value is CachedDefaultPlot => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const userId = Reflect.get(value, 'userId');
  const plot = Reflect.get(value, 'plot');

  return typeof userId === 'string' && isPlot(plot);
};

type UserState = {
  user: User | null;
  defaultPlot: Plot | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  getCachedDefaultPlot: (userId: string) => Plot | null;
  cacheDefaultPlot: (userId: string, plot: Plot | null) => void;
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  defaultPlot: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = await userApi.getDefaultUser();
      const cachedDefaultPlot = get().getCachedDefaultPlot(user.id);
      set({ user, defaultPlot: cachedDefaultPlot, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  getCachedDefaultPlot: (userId: string) => {
    const cached = localStorage.getItem(defaultPlotCacheKey);
    if (!cached) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(cached);
      if (!isCachedDefaultPlot(parsed) || parsed.userId !== userId) {
        return null;
      }

      return parsed.plot;
    } catch {
      return null;
    }
  },

  cacheDefaultPlot: (userId: string, plot: Plot | null) => {
    if (plot === null) {
      localStorage.removeItem(defaultPlotCacheKey);
      set({ defaultPlot: null });
      return;
    }

    localStorage.setItem(defaultPlotCacheKey, JSON.stringify({ userId, plot }));
    set({ defaultPlot: plot });
  },
}));
