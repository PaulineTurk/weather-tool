import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';

export function Header() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  if (!user) {
    return null;
  }
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-2 rounded-b-lg bg-white px-3 py-3 shadow-md sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button onClick={() => navigate('/')} className="flex shrink-0 flex-col items-center leading-none">
          <img src="/assets/logo.png" alt="AgriWatch logo" className="h-9 w-9 rounded object-cover sm:h-10 sm:w-10" />
          <span className="mt-1 text-[10px] font-semibold text-gray-700 sm:text-xs">AgriWatch</span>
        </button>
        <span className="max-w-[8rem] truncate text-sm font-bold text-gray-700 sm:max-w-none sm:text-lg">
          Welcome {user.name}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => navigate('/premium-access')}
          className="rounded-md border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 sm:px-4 sm:text-sm"
        >
          Premium access
        </button>

        <button
          type="button"
          aria-label="Open preferences"
          onClick={() => navigate('/preferences')}
          className="flex flex-col items-center gap-1 rounded-md px-2 py-2 hover:bg-gray-100 sm:px-3"
        >
          <img className="h-7 w-7 sm:h-8 sm:w-8" src="/assets/gear.png" alt="" />
        </button>
      </div>
    </header>
  );
}
