import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Cocina',
  '/catalog': 'Catalogo',
};

export default function Header() {
  const location = useLocation();
  const [clock, setClock] = useState(new Date());
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const title = pageTitles[location.pathname] || 'Japoke Admin';

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gris-border shrink-0">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-naranja flex items-center justify-center">
          <span className="text-white font-heading font-bold">J</span>
        </div>
      </div>

      <h2 className="font-heading font-bold text-xl text-negro">{title}</h2>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gris font-medium tabular-nums hidden sm:block">
          {clock.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              online ? 'bg-success animate-pulse-dot' : 'bg-error'
            }`}
          />
          <span className="text-xs text-gris hidden sm:block">
            {online ? 'Conectado' : 'Sin conexion'}
          </span>
        </div>
      </div>
    </header>
  );
}
