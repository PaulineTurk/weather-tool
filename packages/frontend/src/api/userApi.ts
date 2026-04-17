export type User = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  async getDefaultUser(): Promise<User> {
    const response = await fetch('/api/users/default');

    if (!response.ok) {
      throw new Error('Failed to fetch default user');
    }

    return response.json();
  },
};