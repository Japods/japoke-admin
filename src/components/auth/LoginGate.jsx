import { useState, useEffect } from 'react';

const SESSION_KEY = 'japoke_admin_auth';
const HASH_ENV = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function LoginGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === HASH_ENV) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const hash = await sha256(password);
    if (hash === HASH_ENV) {
      sessionStorage.setItem(SESSION_KEY, hash);
      setAuthenticated(true);
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
    setLoading(false);
  }

  if (checking) return null;

  if (authenticated) return children;

  return (
    <div className="min-h-screen bg-crema flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-naranja rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-negro">Japoke Admin</h1>
          <p className="text-gris text-sm mt-1">Panel de administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-card p-6 border border-gris-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-negro mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border-2 text-negro bg-white outline-none transition-colors
                  ${error
                    ? 'border-error focus:border-error'
                    : 'border-gris-border focus:border-naranja'
                  }`}
              />
              {error && (
                <p className="text-error text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-naranja text-white font-semibold rounded-xl
                         hover:bg-naranja-dark transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
