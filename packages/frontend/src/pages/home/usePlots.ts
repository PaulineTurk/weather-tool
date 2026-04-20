import { useEffect, useMemo, useState } from 'react';
import type { Plot, PlotPayload } from '../../api/plotApi';
import { plotApi } from '../../api/plotApi';

const extractDefaultPlot = (currentPlots: Plot[]): Plot | null => {
  return currentPlots.find((plot) => plot.isDefault) ?? null;
};

type Params = {
  userId: string | null;
  getCachedDefaultPlot: (userId: string) => Plot | null;
  cacheDefaultPlot: (userId: string, plot: Plot | null) => void;
};

export function usePlots({ userId, getCachedDefaultPlot, cacheDefaultPlot }: Params) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [arePlotsLoading, setArePlotsLoading] = useState(false);
  const [plotLoadError, setPlotLoadError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPlots = async () => {
      if (!userId) {
        return;
      }

      setArePlotsLoading(true);
      try {
        setPlotLoadError(null);
        const cachedDefaultPlot = getCachedDefaultPlot(userId);
        if (cachedDefaultPlot !== null && cachedDefaultPlot.userId === userId) {
          setPlots([cachedDefaultPlot]);
        }

        const fetchedPlots = await plotApi.getPlotsForUser(userId);
        setPlots(fetchedPlots);
        cacheDefaultPlot(userId, extractDefaultPlot(fetchedPlots));
      } catch (loadError) {
        setPlotLoadError(loadError instanceof Error ? loadError.message : 'Unknown error');
      } finally {
        setArePlotsLoading(false);
      }
    };

    loadPlots();
  }, [userId, cacheDefaultPlot, getCachedDefaultPlot]);

  const defaultPlot = useMemo(() => plots.find((plot) => plot.isDefault) ?? null, [plots]);

  const openCreateForm = () => {
    setEditingPlot(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (plotId: string) => {
    const plot = plots.find((currentPlot) => currentPlot.id === plotId);
    if (!plot) {
      return;
    }

    setEditingPlot(plot);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlot(null);
    setFormError(null);
  };

  const createOrUpdate = async (payload: PlotPayload) => {
    if (!userId) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedPlots = editingPlot
        ? await plotApi.updatePlot(userId, editingPlot.id, payload)
        : await plotApi.createPlot(userId, payload);
      setPlots(updatedPlots);
      cacheDefaultPlot(userId, extractDefaultPlot(updatedPlots));
      closeForm();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (plotId: string) => {
    if (!userId) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedPlots = await plotApi.deletePlot(userId, plotId);
      setPlots(updatedPlots);
      cacheDefaultPlot(userId, extractDefaultPlot(updatedPlots));
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleDefault = async (plotId: string, isCurrentlyDefault: boolean) => {
    if (!userId) {
      setFormError('No user loaded.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedPlots = await plotApi.setPlotDefault(userId, plotId, !isCurrentlyDefault);
      setPlots(updatedPlots);
      cacheDefaultPlot(userId, extractDefaultPlot(updatedPlots));
    } catch (toggleError) {
      setFormError(toggleError instanceof Error ? toggleError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
