import { create } from 'zustand';
import { User, userApi } from '../api/userApi';
import { Field } from '../api/fieldApi';

const defaultFieldCacheKey = 'user-default-field-cache';

type CachedDefaultField = {
  userId: string;
  field: Field;
};

const isField = (value: unknown): value is Field => {
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

const isCachedDefaultField = (value: unknown): value is CachedDefaultField => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const userId = Reflect.get(value, 'userId');
  const field = Reflect.get(value, 'field');

  return typeof userId === 'string' && isField(field);
};

type UserState = {
  user: User | null;
  defaultField: Field | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  getCachedDefaultField: (userId: string) => Field | null;
  cacheDefaultField: (userId: string, field: Field | null) => void;
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  defaultField: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = await userApi.getDefaultUser();
      const cachedDefaultField = get().getCachedDefaultField(user.id);
      set({ user, defaultField: cachedDefaultField, isLoading: false });
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

  getCachedDefaultField: (userId: string) => {
    const cached = localStorage.getItem(defaultFieldCacheKey);
    if (!cached) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(cached);
      if (!isCachedDefaultField(parsed) || parsed.userId !== userId) {
        return null;
      }

      return parsed.field;
    } catch {
      return null;
    }
  },

  cacheDefaultField: (userId: string, field: Field | null) => {
    if (field === null) {
      localStorage.removeItem(defaultFieldCacheKey);
      set({ defaultField: null });
      return;
    }

    localStorage.setItem(defaultFieldCacheKey, JSON.stringify({ userId, field }));
    set({ defaultField: field });
  },
}));
