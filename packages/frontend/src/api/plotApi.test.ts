import { plotApi, Plot } from './plotApi';

describe('plotApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets user plots', async () => {
    const plots: Plot[] = [
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

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(plots)));

    const result = await plotApi.getPlotsForUser('user-1');

    expect(result).toEqual(plots);
    expect(fetch).toHaveBeenCalledWith('/api/plots/users/user-1');
  });

  it('creates a plot', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), { status: 201 }));

    await plotApi.createPlot('user-1', {
      name: 'Beta',
      latitude: 1,
      longitude: 2,
      address: 'Lyon',
    });

    expect(fetch).toHaveBeenCalledWith('/api/plots/users/user-1', expect.objectContaining({ method: 'POST' }));
  });

  it('updates a plot', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([])));

    await plotApi.updatePlot('user-1', 'plot-1', {
      name: 'Edited',
      latitude: null,
      longitude: null,
      address: null,
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/plots/users/user-1/plot-1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('deletes a plot', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([])));

    await plotApi.deletePlot('user-1', 'plot-1');

    expect(fetch).toHaveBeenCalledWith(
      '/api/plots/users/user-1/plot-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('updates default plot selection', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([])));

    await plotApi.setPlotDefault('user-1', 'plot-1', true);

    expect(fetch).toHaveBeenCalledWith(
      '/api/plots/users/user-1/plot-1/default',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
