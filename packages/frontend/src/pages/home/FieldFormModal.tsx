import { FormEvent } from 'react';
import type { Field, FieldPayload } from '../../api/fieldApi';

const parseOptionalNumber = (value: FormDataEntryValue | null): number | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

type Props = {
  isOpen: boolean;
  editingField: Field | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: FieldPayload) => Promise<void>;
};

export function FieldFormModal({ isOpen, editingField, isSubmitting, error, onClose, onSubmit }: Props) {
  if (!isOpen) {
    return null;
  }

  const isEditing = editingField !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawName = formData.get('name');
    const rawAddress = formData.get('address');

    if (typeof rawName !== 'string' || rawName.trim().length === 0) {
      return;
    }

    const payload: FieldPayload = {
      name: rawName.trim(),
      address: typeof rawAddress === 'string' && rawAddress.trim().length > 0 ? rawAddress.trim() : null,
      latitude: parseOptionalNumber(formData.get('latitude')),
      longitude: parseOptionalNumber(formData.get('longitude')),
    };

    await onSubmit(payload);
  };

  return (
    <section
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4"
      aria-label="field form modal"
    >
      <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg space-y-4" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit field' : 'Create field'}</h3>

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
              defaultValue={
                editingField?.latitude !== null && editingField?.latitude !== undefined
                  ? String(editingField.latitude)
                  : ''
              }
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
              defaultValue={
                editingField?.longitude !== null && editingField?.longitude !== undefined
                  ? String(editingField.longitude)
                  : ''
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
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
  );
}
