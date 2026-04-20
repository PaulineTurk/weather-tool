import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { PreferencesPage } from './pages/PreferencesPage';
import { Header } from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
