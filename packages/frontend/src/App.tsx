import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { PreferencesPage } from './pages/PreferencesPage';
import { Header } from './components/Header';
import { useUserStore } from './store/userStore';

type PageRoute = '/' | '/preferences';

const readRoute = (): PageRoute => {
  return window.location.pathname === '/preferences' ? '/preferences' : '/';
};

function App() {
  const [route, setRoute] = useState<PageRoute>(readRoute());
  const { user } = useUserStore();

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (nextRoute: PageRoute) => {
    if (route === nextRoute) {
      return;
    }
    window.history.pushState({}, '', nextRoute);
    setRoute(nextRoute);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {user ? <Header user={user} onOpenPreferences={() => navigateTo('/preferences')} /> : null}
      {route === '/preferences' ? <PreferencesPage onBackHome={() => navigateTo('/')} /> : <HomePage />}
    </div>
  );
}

export default App;
