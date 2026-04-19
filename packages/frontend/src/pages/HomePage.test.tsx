import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HomePage } from './HomePage';
import { useUserStore } from '../store/userStore';
import { userApi } from '../api/userApi';
import { fieldApi } from '../api/fieldApi';


describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState(useUserStore.getInitialState());
    vi.clearAllMocks();
    vi.spyOn(fieldApi, 'getFieldsForUser').mockResolvedValue([]);
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

  it('creates a field from the modal form', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(fieldApi, 'createField').mockResolvedValue([
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
    await user.click(await screen.findByRole('button', { name: /add field/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Beta');
    await user.type(screen.getByRole('textbox', { name: /address/i }), 'Annecy');
    await user.click(screen.getByRole('button', { name: /create field/i }));

    expect(await screen.findByText('Beta')).toBeVisible();
  });

  it('edits then deletes a field from the list', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(fieldApi, 'getFieldsForUser').mockResolvedValue([
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

    vi.spyOn(fieldApi, 'updateField').mockResolvedValue([
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

    vi.spyOn(fieldApi, 'deleteField').mockResolvedValue([]);

    render(<HomePage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /edit/i }));
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Zulu');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Zulu')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(await screen.findByText(/no fields yet/i)).toBeVisible();
  });

  it('moves selected default field to dedicated top section', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(fieldApi, 'getFieldsForUser').mockResolvedValue([
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

    vi.spyOn(fieldApi, 'setFieldDefault').mockResolvedValue([
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
    await user.click(await screen.findByRole('button', { name: /set alpha as default field/i }));

    expect(await screen.findByText('Default field')).toBeVisible();
    expect(screen.getByRole('button', { name: /remove alpha as default field/i })).toBeVisible();
    expect(fieldApi.setFieldDefault).toHaveBeenCalledWith('1', 'f1', true);
    expect(screen.getByRole('heading', { name: /your fields \(2\)/i })).toBeVisible();
  });

  it('allows editing and deleting the default field', async () => {
    vi.spyOn(userApi, 'getDefaultUser').mockResolvedValue({
      id: '1',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    vi.spyOn(fieldApi, 'getFieldsForUser').mockResolvedValue([
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

    vi.spyOn(fieldApi, 'updateField').mockResolvedValue([
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

    vi.spyOn(fieldApi, 'deleteField').mockResolvedValue([]);

    render(<HomePage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^edit$/i }));
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Alpha Prime');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Alpha Prime')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(await screen.findByText(/no fields yet/i)).toBeVisible();
  });
});