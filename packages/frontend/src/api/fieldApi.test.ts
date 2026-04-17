import { fieldApi, Field } from './fieldApi';

describe('fieldApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets user fields', async () => {
    const fields: Field[] = [
      {
        id: 'f1',
        name: 'Alpha',
        latitude: null,
        longitude: null,
        address: null,
        isDefault: false,
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(fields)));

    const result = await fieldApi.getFieldsForUser('user-1');

    expect(result).toEqual(fields);
    expect(fetch).toHaveBeenCalledWith('/api/fields/users/user-1');
  });

  it('creates a field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), { status: 201 }));

    await fieldApi.createField('user-1', {
      name: 'Beta',
      latitude: 1,
      longitude: 2,
      address: 'Lyon',
    });

    expect(fetch).toHaveBeenCalledWith('/api/fields/users/user-1', expect.objectContaining({ method: 'POST' }));
  });

  it('updates a field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([])));

    await fieldApi.updateField('user-1', 'field-1', {
      name: 'Edited',
      latitude: null,
      longitude: null,
      address: null,
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/fields/users/user-1/field-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('deletes a field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([])));

    await fieldApi.deleteField('user-1', 'field-1');

    expect(fetch).toHaveBeenCalledWith(
      '/api/fields/users/user-1/field-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
