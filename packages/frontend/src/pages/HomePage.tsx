import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Field, FieldPayload, fieldApi } from '../api/fieldApi';

const parseOptionalNumber = (value: FormDataEntryValue | null): number | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const confidenceLabel = (level: 'high' | 'medium' | 'low' | 'unknown'): string => {
  if (level === 'high') {
    return 'High';
  }

  if (level === 'medium') {
    return 'Medium';
  }

  if (level === 'low') {
    return 'Low';
  }

  return 'Unknown';
};

const displayTemperature = (temperatureC: number | null, unit: 'C' | 'F'): string => {
  if (temperatureC === null) {
    return '-';
  }

  if (unit === 'F') {
    return `${Math.round((temperatureC * 9) / 5 + 32)} °F`;
  }

  return `${temperatureC} °C`;
};
const extractDefaultField = (currentFields: Field[]): Field | null => {
  return currentFields.find((field) => field.isDefault) ?? null;
};

export function HomePage() {
  const { user, isLoading, error, fetchUser, cacheDefaultField, getCachedDefaultField } = useUserStore();
  const [fields, setFields] = useState<Field[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldLoadError, setFieldLoadError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const loadFields = async () => {
      if (!user) {
        return;
      }

      try {
        setFieldLoadError(null);
        const cachedDefaultField = getCachedDefaultField(user.id);
        if (cachedDefaultField !== null && cachedDefaultField.userId === user.id) {
          setFields([cachedDefaultField]);
        }

        const fetchedFields = await fieldApi.getFieldsForUser(user.id);
        setFields(fetchedFields);
        cacheDefaultField(user.id, extractDefaultField(fetchedFields));
      } catch (loadError) {
        setFieldLoadError(loadError instanceof Error ? loadError.message : 'Unknown error');
      }
    };

    loadFields();
  }, [user, cacheDefaultField, getCachedDefaultField]);

  const isEditing = editingField !== null;
  const defaultField = useMemo(() => fields.find((field) => field.isDefault) ?? null, [fields]);

  const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLocaleLowerCase(), [searchQuery]);
  const matchesSearch = (field: Field) =>
    normalizedSearchQuery.length === 0 || field.name.toLocaleLowerCase().includes(normalizedSearchQuery);

  const filteredFields = useMemo(() => fields.filter(matchesSearch), [fields, normalizedSearchQuery]);
  const filteredDefaultField = useMemo(
    () => filteredFields.find((field) => field.isDefault) ?? null,
    [filteredFields]
  );

  const sortedNonDefaultFields = useMemo(() => {
    return filteredFields
      .filter((field) => !field.isDefault)
      .sort((firstField, secondField) =>
        firstField.name.localeCompare(secondField.name, undefined, { sensitivity: 'base' })
      );
  }, [filteredFields]);

  const openCreateForm = () => {
    setEditingField(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (fieldId: string) => {
    const field = fields.find((currentField) => currentField.id === fieldId);

    if (!field) {
      return;
    }

    setEditingField(field);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingField(null);
    setFormError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setFormError('No user loaded.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const rawName = formData.get('name');
    const rawAddress = formData.get('address');

    if (typeof rawName !== 'string' || rawName.trim().length === 0) {
      setFormError('Field name is required.');
      return;
    }

    const payload: FieldPayload = {
      name: rawName.trim(),
      address: typeof rawAddress === 'string' && rawAddress.trim().length > 0 ? rawAddress.trim() : null,
      latitude: parseOptionalNumber(formData.get('latitude')),
      longitude: parseOptionalNumber(formData.get('longitude')),
    };

    setFormError(null);
    setIsSubmitting(true);

    try {
      let updatedFields: Field[];
      if (editingField) {
        updatedFields = await fieldApi.updateField(user.id, editingField.id, payload);
      } else {
        updatedFields = await fieldApi.createField(user.id, payload);
      }
      setFields(updatedFields);
      cacheDefaultField(user.id, extractDefaultField(updatedFields));
      closeForm();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (fieldId: string) => {
    if (!user) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedFields = await fieldApi.deleteField(user.id, fieldId);
      setFields(updatedFields);
      cacheDefaultField(user.id, extractDefaultField(updatedFields));
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleDefault = async (fieldId: string, isCurrentlyDefault: boolean) => {
    if (!user) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedFields = await fieldApi.setFieldDefault(user.id, fieldId, !isCurrentlyDefault);
      setFields(updatedFields);
      cacheDefaultField(user.id, extractDefaultField(updatedFields));
    } catch (toggleError) {
      setFormError(toggleError instanceof Error ? toggleError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h2 className="text-xl font-semibold text-gray-800">Your fields ({filteredFields.length}/{fields.length})</h2>
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Default field</p>
                    <p className="font-semibold text-gray-900">{filteredDefaultField.name}</p>
                    {filteredDefaultField.address ? <p className="text-gray-600">{filteredDefaultField.address}</p> : null}
                    <p className="text-sm text-gray-500">
                      Lat: {filteredDefaultField.latitude ?? '-'} | Lng: {filteredDefaultField.longitude ?? '-'}
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
                  {filteredDefaultField.weather?.status === 'ok' && filteredDefaultField.weather.days.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex min-w-max gap-2">
                        {filteredDefaultField.weather.days.map((dayWeather) => (
                          <article
                            key={dayWeather.date}
                            className="w-44 shrink-0 rounded-md border border-blue-200 bg-white p-2"
                          >
                            <p className="text-xs font-semibold text-gray-700">{dayWeather.date}</p>
                            <p className="text-xs text-gray-600">
                              Temp: {displayTemperature(dayWeather.temperatureC, user.temperatureUnit)}
                            </p>
                            <p className="text-xs text-gray-600">
                              Rain: {dayWeather.precipitationMm !== null ? `${dayWeather.precipitationMm} mm` : '-'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Wind: {dayWeather.windSpeedMs !== null ? `${dayWeather.windSpeedMs} m/s` : '-'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Confidence: {confidenceLabel(dayWeather.confidenceLevel)}
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {filteredDefaultField.weather?.message ?? 'Weather forecast unavailable for this field.'}
                    </p>
                  )}
                </div>
              </article>
            ) : null}
            {sortedNonDefaultFields.length === 0 ? (
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
                      {field.weather?.status === 'ok' && field.weather.days.length > 0 ? (
                        <div className="overflow-x-auto">
                          <div className="flex min-w-max gap-2">
                            {field.weather.days.map((dayWeather) => (
                              <article
                                key={dayWeather.date}
                                className="w-44 shrink-0 rounded-md border border-gray-200 bg-gray-50 p-2"
                              >
                                <p className="text-xs font-semibold text-gray-700">{dayWeather.date}</p>
                                <p className="text-xs text-gray-600">
                                  Temp: {displayTemperature(dayWeather.temperatureC, user.temperatureUnit)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Rain: {dayWeather.precipitationMm !== null ? `${dayWeather.precipitationMm} mm` : '-'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Wind: {dayWeather.windSpeedMs !== null ? `${dayWeather.windSpeedMs} m/s` : '-'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Confidence: {confidenceLabel(dayWeather.confidenceLevel)}
                                </p>
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {field.weather?.message ?? 'Weather forecast unavailable for this field.'}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {isFormOpen ? (
        <section
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4"
          aria-label="field form modal"
        >
          <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg space-y-4" onSubmit={onSubmit}>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit field' : 'Create field'}
            </h3>

            <label className="block text-sm font-medium text-gray-700">
              Name *
              <input
                name="name"
                type="text"
                defaultValue={editingField?.name ?? ''}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Address
              <input
                name="address"
                type="text"
                defaultValue={editingField?.address ?? ''}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Latitude
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  inputMode="decimal"
                  defaultValue={editingField?.latitude !== null && editingField?.latitude !== undefined ? String(editingField.latitude) : ''}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Longitude
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  inputMode="decimal"
                  defaultValue={editingField?.longitude !== null && editingField?.longitude !== undefined ? String(editingField.longitude) : ''}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </div>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isEditing ? 'Save changes' : 'Create field'}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </main>
  );
}
