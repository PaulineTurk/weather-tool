import { User } from '../api/userApi';

type HeaderProps = {
  user: User;
  onOpenAppLogo: () => void;
  onOpenPreferences: () => void;
};

export function Header({ user, onOpenAppLogo, onOpenPreferences }: HeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between rounded-b-lg bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAppLogo}
        >
          <img src="/assets/logo.png" alt="Weather Tool logo" className="h-10 w-10 rounded object-cover" />
        </button>
        <span className="text-lg font-bold text-gray-700">Welcome {user.name}</span>
      </div>

      <button
        type="button"
        onClick={onOpenPreferences}
        className="flex flex-col items-center gap-1 rounded-md px-3 py-2 hover:bg-gray-100"
      >
        <img className="h-8 w-8" src='/assets/gear.png' />
      </button>
    </header>
  );
}
