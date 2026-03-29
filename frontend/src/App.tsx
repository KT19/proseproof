import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { StartupPage } from './components/pages/StartupPage';
import { MainPage } from './components/pages/MainPage';
import { StatsPage } from './components/pages/StatsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<StartupPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/main/:id" element={<MainPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
