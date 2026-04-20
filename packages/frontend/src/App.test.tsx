import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { AppLayout } from './App';
import { useUserStore } from './store/userStore';
import { userApi } from './api/userApi';
import { plotApi } from './api/plotApi';

describe('App premium access route', () => {
  const testUser = {
    id: '1',
    name: 'Test User',
    temperatureUnit: 'C' as const,
    forecastDays: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState(useUserStore.getInitialState());
    useUserStore.setState({ user: testUser, isLoading: false, error: null });
    vi.clearAllMocks();
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue(testUser);
    vi.spyOn(plotApi, 'getPlotsForUser').mockResolvedValue([]);
  });

  it('hides the header on /premium-access', () => {
    render(
      <MemoryRouter initialEntries={['/premium-access']}>
        <AppLayout />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /under construction/i })).toBeVisible();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /premium access/i })).not.toBeInTheDocument();
  });

  it('navigates to /premium-access from the header button and hides header after navigation', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppLayout />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/your plots/i)).toBeVisible();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /premium access/i }));

    expect(await screen.findByRole('heading', { name: /under construction/i })).toBeVisible();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /premium access/i })).not.toBeInTheDocument();
  });
});

