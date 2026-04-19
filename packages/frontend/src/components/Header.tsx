import { User } from '../api/userApi';

type HeaderProps = {
  user: User;
  onOpenPreferences: () => void;
};

export function Header({ user, onOpenPreferences }: HeaderProps) {
  return (
    <header className="mx-auto mb-4 flex w-full max-w-3xl items-center justify-between rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
        <img src="/assets/logo.png" alt="Weather Tool logo" className="h-10 w-10 rounded object-cover" />
        <p className="text-lg font-semibold text-gray-800">Weather Tool</p>
      </div>

      <button
        type="button"
        onClick={onOpenPreferences}
        className="flex flex-col items-center gap-1 rounded-md px-3 py-2 hover:bg-gray-100"
      >
        <span className="inline-block h-8 w-8 rounded-full bg-blue-600" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </button>
    </header>
  );
}
