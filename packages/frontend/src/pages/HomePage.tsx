import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PlotFormModal } from './home/PlotFormModal';
import { PlotWeatherPanel } from './home/PlotWeatherPanel';
import { usePlots } from './home/usePlots';

export function HomePage() {
  const { user, isLoading, error, fetchUser, cacheDefaultPlot, getCachedDefaultPlot } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const {
    plots,
    defaultPlot,
    arePlotsLoading,
    plotLoadError,
    isFormOpen,
    editingPlot,
    formError,
    isSubmitting,
    openCreateForm,
    openEditForm,
    closeForm,
    createOrUpdate,
    onDelete,
    onToggleDefault,
  } = usePlots({
    userId: user?.id ?? null,
    cacheDefaultPlot,
    getCachedDefaultPlot,
  });

  const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLocaleLowerCase(), [searchQuery]);
  const filteredPlots = useMemo(() => {
    if (normalizedSearchQuery.length === 0) {
      return plots;
    }

    return plots.filter((plot) => plot.name.toLocaleLowerCase().includes(normalizedSearchQuery));
  }, [plots, normalizedSearchQuery]);
  const filteredDefaultPlot = useMemo(
    () => filteredPlots.find((plot) => plot.isDefault) ?? null,
    [filteredPlots],
  );

  const sortedNonDefaultPlots = useMemo(() => {
    return filteredPlots
      .filter((plot) => !plot.isDefault)
      .sort((firstPlot, secondPlot) =>
        firstPlot.name.localeCompare(secondPlot.name, undefined, { sensitivity: 'base' }),
      );
  }, [filteredPlots]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchUser()} />;
  }

  if (!user) {
    return <ErrorMessage message="No user found" onRetry={() => fetchUser()} />;
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden pt-20">
      <section className="flex min-h-0 flex-1 flex-col space-y-4 bg-white p-4 sm:p-6 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <h2 className="text-xl font-semibold text-gray-800">
              Your plots ({filteredPlots.length}/{plots.length})
            </h2>
            <label className="relative w-full sm:w-auto">
              <span className="sr-only">Search plots</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                placeholder="Search by plot name..."
                aria-label="Search plots by name"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 sm:w-64"
              />
            </label>
          </div>

          <button
            type="button"
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={openCreateForm}
            disabled={isSubmitting}
          >
            Add plot
          </button>
        </div>

        <div className="rounded-md border border-gray-200 flex flex-col flex-1 min-h-0">
          <div className="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            {plotLoadError ? <p className="text-red-600 text-sm mb-2">{plotLoadError}</p> : null}
            {filteredDefaultPlot ? (
              <article className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Default plot
                    </p>
                    <p className="font-semibold text-gray-900">{filteredDefaultPlot.name}</p>
                    {filteredDefaultPlot.address ? (
                      <p className="text-gray-600">{filteredDefaultPlot.address}</p>
                    ) : null}
                    <p className="text-sm text-gray-500">
                      Lat: {filteredDefaultPlot.latitude ?? '-'} | Lng: {filteredDefaultPlot.longitude ?? '-'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-label={`Remove ${filteredDefaultPlot.name} as default plot`}
                      title="Unset default plot"
                      className="rounded p-1 text-red-500 hover:bg-gray-100 disabled:opacity-60"
                      onClick={() => onToggleDefault(filteredDefaultPlot.id, true)}
                      disabled={isSubmitting}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => openEditForm(filteredDefaultPlot.id)}
                      disabled={isSubmitting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(filteredDefaultPlot.id)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 border-t border-blue-100 pt-3">
                  <PlotWeatherPanel
                    weather={filteredDefaultPlot.weather}
                    unit={user.temperatureUnit}
                    dayCardClassName="w-44 shrink-0 rounded-md border border-blue-200 bg-white p-2"
                    emptyClassName="text-sm text-gray-500"
                  />
                </div>
              </article>
            ) : null}
            {arePlotsLoading ? (
              <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : sortedNonDefaultPlots.length === 0 ? (
              <p className="text-gray-600">
                {defaultPlot ? 'No other plots yet.' : 'No plots yet. Add your first one.'}
              </p>
            ) : (
              <ul className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                {sortedNonDefaultPlots.map((plot) => (
                  <li key={plot.id} className="rounded-md border border-gray-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{plot.name}</p>
                        {plot.address ? <p className="text-gray-600">{plot.address}</p> : null}
                        <p className="text-sm text-gray-500">
                          Lat: {plot.latitude ?? '-'} | Lng: {plot.longitude ?? '-'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          aria-label={`Set ${plot.name} as default plot`}
                          title="Set as default plot"
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-500 disabled:opacity-60"
                          onClick={() => onToggleDefault(plot.id, false)}
                          disabled={isSubmitting}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M16.5 3A5.99 5.99 0 0 0 12 5.09 5.99 5.99 0 0 0 7.5 3C4.42 3 2 5.42 2 8.5c0 3.77 3.4 6.86 8.55 11.54L12 21.35l1.45-1.31C18.6 15.36 22 12.27 22 8.5 22 5.42 19.58 3 16.5 3Zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87A3.96 3.96 0 0 1 16.5 5C18.5 5 20 6.5 20 8.5c0 2.89-3.14 5.74-7.9 10.05Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => openEditForm(plot.id)}
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(plot.id)}
                          disabled={isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <PlotWeatherPanel
                        weather={plot.weather}
                        unit={user.temperatureUnit}
                        dayCardClassName="w-44 shrink-0 rounded-md border border-gray-200 bg-gray-50 p-2"
                        emptyClassName="text-sm text-gray-500"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <PlotFormModal
        isOpen={isFormOpen}
        editingPlot={editingPlot}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={closeForm}
        onSubmit={createOrUpdate}
      />
    </main>
  );
}
