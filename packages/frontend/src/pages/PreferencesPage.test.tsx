import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import { PreferencesPage } from './PreferencesPage';
import { useUserStore } from '../store/userStore';
import { userApi } from '../api/userApi';

describe('PreferencesPage', () => {
  beforeEach(() => {
    useUserStore.setState(useUserStore.getInitialState());
    vi.clearAllMocks();
  });

  it('loads user on direct navigation and renders preferences form', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 3,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    render(
      <MemoryRouter initialEntries={['/preferences']}>
        <Routes>
          <Route path="/preferences" element={<PreferencesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /user preferences/i })).toBeVisible();
    expect(screen.getByText(/configure how weather data is displayed/i)).toBeVisible();
  });

  it('shows loading spinner while fetching user', () => {
    vi.spyOn(userApi, 'getDefaultUser').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/preferences']}>
        <Routes>
          <Route path="/preferences" element={<PreferencesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
