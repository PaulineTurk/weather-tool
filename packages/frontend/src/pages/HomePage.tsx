import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FieldFormModal } from './home/FieldFormModal';
import { FieldWeatherPanel } from './home/FieldWeatherPanel';
import { useFields } from './home/useFields';

export function HomePage() {
  const { user, isLoading, error, fetchUser, cacheDefaultField, getCachedDefaultField } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const {
    fields,
    defaultField,
    areFieldsLoading,
    fieldLoadError,
    isFormOpen,
    editingField,
    formError,
    isSubmitting,
    openCreateForm,
    openEditForm,
    closeForm,
    createOrUpdate,
    onDelete,
    onToggleDefault,
  } = useFields({
    userId: user?.id ?? null,
    cacheDefaultField,
    getCachedDefaultField,
  });

  const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLocaleLowerCase(), [searchQuery]);
  const filteredFields = useMemo(() => {
    if (normalizedSearchQuery.length === 0) {
      return fields;
    }

    return fields.filter((field) => field.name.toLocaleLowerCase().includes(normalizedSearchQuery));
  }, [fields, normalizedSearchQuery]);
  const filteredDefaultField = useMemo(
    () => filteredFields.find((field) => field.isDefault) ?? null,
    [filteredFields],
  );

  const sortedNonDefaultFields = useMemo(() => {
    return filteredFields
      .filter((field) => !field.isDefault)
      .sort((firstField, secondField) =>
        firstField.name.localeCompare(secondField.name, undefined, { sensitivity: 'base' }),
      );
  }, [filteredFields]);

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
    <main className="mx-auto space-y-4 pt-20 h-screen overflow-hidden flex flex-col">
      <section className="bg-white rounded-lg shadow-md p-10 space-y-4 flex flex-col flex-1 min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              Your fields ({filteredFields.length}/{fields.length})
            </h2>
            <label className="relative">
              <span className="sr-only">Search fields</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                placeholder="Search by field name..."
                aria-label="Search fields by name"
                className="w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </label>
          </div>

          <button
            type="button"
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={openCreateForm}
            disabled={isSubmitting}
          >
            Add field
          </button>
        </div>

        <div className="rounded-md border border-gray-200 flex flex-col flex-1 min-h-0">
          <div className="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            {fieldLoadError ? <p className="text-red-600 text-sm mb-2">{fieldLoadError}</p> : null}
            {filteredDefaultField ? (
              <article className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Default field
                    </p>
                    <p className="font-semibold text-gray-900">{filteredDefaultField.name}</p>
                    {filteredDefaultField.address ? (
                      <p className="text-gray-600">{filteredDefaultField.address}</p>
                    ) : null}
                    <p className="text-sm text-gray-500">
                      Lat: {filteredDefaultField.latitude ?? '-'} | Lng:{' '}
                      {filteredDefaultField.longitude ?? '-'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Remove ${filteredDefaultField.name} as default field`}
                      title="Unset default field"
                      className="rounded p-1 text-red-500 hover:bg-gray-100 disabled:opacity-60"
                      onClick={() => onToggleDefault(filteredDefaultField.id, true)}
                      disabled={isSubmitting}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => openEditForm(filteredDefaultField.id)}
                      disabled={isSubmitting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(filteredDefaultField.id)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 border-t border-blue-100 pt-3">
                  <FieldWeatherPanel
                    weather={filteredDefaultField.weather}
                    unit={user.temperatureUnit}
                    dayCardClassName="w-44 shrink-0 rounded-md border border-blue-200 bg-white p-2"
                    emptyClassName="text-sm text-gray-500"
                  />
                </div>
              </article>
            ) : null}
            {areFieldsLoading ? (
              <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : sortedNonDefaultFields.length === 0 ? (
              <p className="text-gray-600">
                {defaultField ? 'No other fields yet.' : 'No fields yet. Add your first one.'}
              </p>
            ) : (
              <ul className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                {sortedNonDefaultFields.map((field) => (
                  <li key={field.id} className="rounded-md border border-gray-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{field.name}</p>
                        {field.address ? <p className="text-gray-600">{field.address}</p> : null}
                        <p className="text-sm text-gray-500">
                          Lat: {field.latitude ?? '-'} | Lng: {field.longitude ?? '-'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`Set ${field.name} as default field`}
                          title="Set as default field"
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-500 disabled:opacity-60"
                          onClick={() => onToggleDefault(field.id, false)}
                          disabled={isSubmitting}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M16.5 3A5.99 5.99 0 0 0 12 5.09 5.99 5.99 0 0 0 7.5 3C4.42 3 2 5.42 2 8.5c0 3.77 3.4 6.86 8.55 11.54L12 21.35l1.45-1.31C18.6 15.36 22 12.27 22 8.5 22 5.42 19.58 3 16.5 3Zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87A3.96 3.96 0 0 1 16.5 5C18.5 5 20 6.5 20 8.5c0 2.89-3.14 5.74-7.9 10.05Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => openEditForm(field.id)}
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(field.id)}
                          disabled={isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <FieldWeatherPanel
                        weather={field.weather}
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

      <FieldFormModal
        isOpen={isFormOpen}
        editingField={editingField}
        isSubmitting={isSubmitting}
        error={formError}
        onClose={closeForm}
        onSubmit={createOrUpdate}
      />
    </main>
  );
}
