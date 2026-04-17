import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HomePage } from './HomePage';
import { useUserStore } from '../store/userStore';
import { userApi } from '../api/userApi';


describe('HomePage', () => {
  beforeEach(() => {
    useUserStore.setState(useUserStore.getInitialState());
    vi.clearAllMocks();
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
    vi.spyOn(userApi, 'getDefaultUser').mockImplementation(
      () => new Promise(() => { })
    );

    render(<HomePage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error message', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockRejectedValue(
      new Error('Failed to load user')
    );

    render(<HomePage />);

    expect(await screen.findByText('Failed to load user')).toBeVisible();
  });

  it('should display greeting when user is loaded', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    render(<HomePage />);

    expect(await screen.findByText(/welcome, test user/i)).toBeVisible();
  });

  it('should show greeting after retry succeeds', async () => {
    vi.spyOn(userApi, 'getDefaultUser')
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

    render(<HomePage />);

    const retryButton = await screen.findByRole('button', { name: /retry/i });
    const user = userEvent.setup()
    user.click(retryButton);

    expect(await screen.findByText(/welcome, test user/i)).toBeInTheDocument();
  });
});