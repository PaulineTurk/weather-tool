import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HomePage } from './HomePage';
import { useUserStore } from '../store/userStore';
import { userApi } from '../api/userApi';
import { plotApi } from '../api/plotApi';

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState(useUserStore.getInitialState());
    vi.clearAllMocks();
    vi.spyOn(plotApi, 'getPlotsForUser').mockResolvedValue([]);
  });

  it('should display "No user found" when user is null', () => {
    useUserStore.setState({
      user: null,
      isLoading: false,
      error: null,
      fetchUser: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText('No user found')).toBeVisible();
  });

  it('should display loading spinner', () => {
    vi.spyOn(userApi, 'getDefaultUser').mockImplementation(() => new Promise(() => {}));

    render(<HomePage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error message', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockRejectedValue(new Error('Failed to load user'));

    render(<HomePage />);

    expect(await screen.findByText('Failed to load user')).toBeVisible();
  });

  it('should display greeting when user is loaded', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    render(<HomePage />);

    expect(await screen.findByText(/your plots/i)).toBeVisible();
  });

  it('should show greeting after retry succeeds', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockRejectedValueOnce(new Error('Failed')).mockResolvedValueOnce({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    render(<HomePage />);

    const retryButton = await screen.findByRole('button', { name: /retry/i });
    const user = userEvent.setup();
    user.click(retryButton);

    expect(await screen.findByText(/your plots/i)).toBeInTheDocument();
  });

  it('creates a plot from the modal form', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(plotApi, 'createPlot').mockResolvedValue([
      {
        id: 'f1',
        name: 'Beta',
        latitude: 45,
        longitude: 6,
        address: 'Annecy',
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    render(<HomePage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /add plot/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Beta');
    await user.type(screen.getByRole('textbox', { name: /address/i }), 'Annecy');
    await user.click(screen.getByRole('button', { name: /create plot/i }));

    expect(await screen.findByText('Beta')).toBeVisible();
  });

  it('edits then deletes a plot from the list', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(plotApi, 'getPlotsForUser').mockResolvedValue([
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    vi.spyOn(plotApi, 'updatePlot').mockResolvedValue([
      {
        id: 'f1',
        name: 'Zulu',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    vi.spyOn(plotApi, 'deletePlot').mockResolvedValue([]);

    render(<HomePage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /edit/i }));
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Zulu');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Zulu')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(await screen.findByText(/no plots yet/i)).toBeVisible();
  });

  it('moves selected default plot to dedicated top section', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(plotApi, 'getPlotsForUser').mockResolvedValue([
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 'f2',
        name: 'Beta',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    vi.spyOn(plotApi, 'setPlotDefault').mockResolvedValue([
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: true,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 'f2',
        name: 'Beta',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    render(<HomePage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /set alpha as default plot/i }));

    expect(await screen.findByText('Default plot')).toBeVisible();
    expect(screen.getByRole('button', { name: /remove alpha as default plot/i })).toBeVisible();
    expect(plotApi.setPlotDefault).toHaveBeenCalledWith('1', 'f1', true);
    expect(screen.getByRole('heading', { name: /your plots \(2\/2\)/i })).toBeVisible();
  });

  it('filters plots by name from the search bar', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(plotApi, 'getPlotsForUser').mockResolvedValue([
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 'f2',
        name: 'Beta',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    render(<HomePage />);

    expect(await screen.findByText('Alpha')).toBeVisible();
    expect(screen.getByText('Beta')).toBeVisible();

    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox', { name: /search plots by name/i }), 'be');

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeVisible();
  });

  it('allows editing and deleting the default plot', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      temperatureUnit: 'C',
      forecastDays: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(plotApi, 'getPlotsForUser').mockResolvedValue([
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: true,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    vi.spyOn(plotApi, 'updatePlot').mockResolvedValue([
      {
        id: 'f1',
        name: 'Alpha Prime',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: true,
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]);

    vi.spyOn(plotApi, 'deletePlot').mockResolvedValue([]);

    render(<HomePage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^edit$/i }));
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Alpha Prime');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Alpha Prime')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(await screen.findByText(/no plots yet/i)).toBeVisible();
  });
});
