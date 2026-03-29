import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { healthApi } from '../../services/api';
import type { HealthStatus } from '../../types';

export function Header() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const status = await healthApi.check();
      setHealth(status);
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        connected: false,
        model_available: false,
        message: 'Ollama is offline',
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = health?.connected ?? false;

  return (
    <header className="gradient-primary text-white shadow-lg relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400"></div>
      
      <div className="max-w-7xl ml-2 pr-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold font-[Playfair_Display] tracking-wide">
            <span className="text-amber-400">Prose</span>Proof
          </h1>
          <div className="w-px h-6 bg-amber-400/30"></div>
          <nav className="flex gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-5 py-2 rounded text-sm font-medium font-[Inter] transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-amber-100/80 hover:bg-white/5 hover:text-amber-200'
                }`
              }
            >
              Main
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `px-5 py-2 rounded text-sm font-medium font-[Inter] transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-amber-100/80 hover:bg-white/5 hover:text-amber-200'
                }`
              }
            >
              Stats
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-[Inter]">
            <span className="relative flex h-3 w-3">
              {checking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/70"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOnline ? 'bg-green-400' : 'bg-red-400'
                }`}
              ></span>
            </span>
            <span className={`${isOnline ? 'text-green-300' : 'text-red-300'} font-medium`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
    </header>
  );
}
