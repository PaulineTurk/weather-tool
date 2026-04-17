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

export function HomePage() {
  const { user, isLoading, error, fetchUser } = useUserStore();
  const [fields, setFields] = useState<Field[]>([]);
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
        const fetchedFields = await fieldApi.getFieldsForUser(user.id);
        setFields(fetchedFields);
      } catch (loadError) {
        setFieldLoadError(loadError instanceof Error ? loadError.message : 'Unknown error');
      }
    };

    loadFields();
  }, [user]);

  const isEditing = editingField !== null;

  const sortedFields = useMemo(() => {
    return [...fields].sort((firstField, secondField) =>
      firstField.name.localeCompare(secondField.name, undefined, { sensitivity: 'base' })
    );
  }, [fields]);

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
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : 'Unknown error');
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
    <main className="mx-auto max-w-3xl space-y-4">
      <section className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your weather fields from this dashboard.</p>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Your fields ({sortedFields.length})</h2>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={openCreateForm}
            disabled={isSubmitting}
          >
            Add field
          </button>
        </div>

        <div className="rounded-md border border-gray-200">
          <div className="p-4">
            {fieldLoadError ? <p className="text-red-600 text-sm mb-2">{fieldLoadError}</p> : null}
            {sortedFields.length === 0 ? (
              <p className="text-gray-600">No fields yet. Add your first one.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {sortedFields.map((field) => (
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
                  defaultValue={editingField?.latitude !== null && editingField?.latitude !== undefined ? String(editingField.latitude) : ''}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Longitude
                <input
                  name="longitude"
                  type="number"
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
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
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
