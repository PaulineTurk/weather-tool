import { useEffect, useMemo, useState } from 'react';
import type { Field, FieldPayload } from '../../api/fieldApi';
import { fieldApi } from '../../api/fieldApi';

const extractDefaultField = (currentFields: Field[]): Field | null => {
  return currentFields.find((field) => field.isDefault) ?? null;
};

type Params = {
  userId: string | null;
  getCachedDefaultField: (userId: string) => Field | null;
  cacheDefaultField: (userId: string, field: Field | null) => void;
};

export function useFields({ userId, getCachedDefaultField, cacheDefaultField }: Params) {
  const [fields, setFields] = useState<Field[]>([]);
  const [areFieldsLoading, setAreFieldsLoading] = useState(false);
  const [fieldLoadError, setFieldLoadError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFields = async () => {
      if (!userId) {
        return;
      }

      setAreFieldsLoading(true);
      try {
        setFieldLoadError(null);
        const cachedDefaultField = getCachedDefaultField(userId);
        if (cachedDefaultField !== null && cachedDefaultField.userId === userId) {
          setFields([cachedDefaultField]);
        }

        const fetchedFields = await fieldApi.getFieldsForUser(userId);
        setFields(fetchedFields);
        cacheDefaultField(userId, extractDefaultField(fetchedFields));
      } catch (loadError) {
        setFieldLoadError(loadError instanceof Error ? loadError.message : 'Unknown error');
      } finally {
        setAreFieldsLoading(false);
      }
    };

    loadFields();
  }, [userId, cacheDefaultField, getCachedDefaultField]);

  const defaultField = useMemo(() => fields.find((field) => field.isDefault) ?? null, [fields]);

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

  const createOrUpdate = async (payload: FieldPayload) => {
    if (!userId) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedFields = editingField
        ? await fieldApi.updateField(userId, editingField.id, payload)
        : await fieldApi.createField(userId, payload);
      setFields(updatedFields);
      cacheDefaultField(userId, extractDefaultField(updatedFields));
      closeForm();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (fieldId: string) => {
    if (!userId) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedFields = await fieldApi.deleteField(userId, fieldId);
      setFields(updatedFields);
      cacheDefaultField(userId, extractDefaultField(updatedFields));
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleDefault = async (fieldId: string, isCurrentlyDefault: boolean) => {
    if (!userId) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedFields = await fieldApi.setFieldDefault(userId, fieldId, !isCurrentlyDefault);
      setFields(updatedFields);
      cacheDefaultField(userId, extractDefaultField(updatedFields));
    } catch (toggleError) {
      setFormError(toggleError instanceof Error ? toggleError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}

