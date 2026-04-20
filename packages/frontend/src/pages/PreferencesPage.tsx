import { FormEvent, useState } from 'react';
import { userApi } from '../api/userApi';
import { useUserStore } from '../store/userStore';

type PreferencesPageProps = {
  onBackHome: () => void;
};

export function PreferencesPage({ onBackHome }: PreferencesPageProps) {
  const { user, setUser } = useUserStore();
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>(user?.temperatureUnit ?? 'C');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const daysValue = formData.get('forecastDays');
    const forecastDays = typeof daysValue === 'string' ? Number.parseInt(daysValue, 10) : Number.NaN;

    if (!Number.isInteger(forecastDays) || forecastDays < 1 || forecastDays > 10) {
      setError('Invalid preferences.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const updatedUser = await userApi.updateUserPreferences(user.id, {
        temperatureUnit,
        forecastDays,
      });
      setUser(updatedUser);
      onBackHome();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl pt-24 pb-4 px-4 h-screen overflow-hidden flex flex-col">
      <section className="rounded-lg bg-white p-10 shadow-md flex-1 flex flex-col">
        <h1 className="text-xl font-semibold text-gray-800">User preferences</h1>
        <p className="mt-1 text-sm text-gray-600">Configure how weather data is displayed.</p>

        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <div>
            <p className="text-sm font-medium text-gray-700">Temperature unit</p>
            <div className="mt-2 flex rounded-md border border-gray-300 p-1 w-fit">
              <label className="cursor-pointer">
                <input
                  className="sr-only"
                  type="radio"
                  name="temperatureUnit"
                  value="C"
                  checked={temperatureUnit === 'C'}
                  onChange={() => setTemperatureUnit('C')}
                />
                <span
                  className={`block rounded px-4 py-2 text-sm ${temperatureUnit === 'C' ? 'bg-green-600 text-white' : 'text-gray-700'
                    }`}
                >
                  °C
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  className="sr-only"
                  type="radio"
                  name="temperatureUnit"
                  value="F"
                  checked={temperatureUnit === 'F'}
                  onChange={() => setTemperatureUnit('F')}
                />
                <span
                  className={`block rounded px-4 py-2 text-sm ${temperatureUnit === 'F' ? 'bg-green-600 text-white' : 'text-gray-700'
                    }`}
                >
                  °F
                </span>
              </label>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Forecast days
            <select
              name="forecastDays"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              defaultValue={String(user.forecastDays)}
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((dayCount) => (
                <option key={dayCount} value={dayCount}>
                  {dayCount} day{dayCount > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={onBackHome}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              Save preferences
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
