import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { HomePage } from './pages/HomePage';
import { PreferencesPage } from './pages/PreferencesPage';
import { Header } from './components/Header';
import { PremiumAccessPage } from './pages/PremiumAccessPage.tsx';

export function AppLayout() {
  const location = useLocation();
  const shouldHideHeader = location.pathname === '/premium-access';

  return (
    <div className="min-h-screen bg-gray-100">
      {shouldHideHeader ? null : <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/premium-access" element={<PremiumAccessPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
