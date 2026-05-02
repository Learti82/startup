import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast.success('Mirë se vini!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.errors.serverError;
      const isNetworkErr = msg.includes('Network Error') || msg.includes('ECONNREFUSED') || msg.includes('Failed to fetch');
      toast.error(
        isNetworkErr
          ? 'Serveri nuk është i disponueshëm. Ekzekutoni: docker compose up'
          : msg,
        { duration: 6000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-700 font-bold text-2xl">
            <ShieldCheck className="w-8 h-8" />
            <span>PronA</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t.loginTitle}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="ju@shembull.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t.loading : t.login}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">
              {t.noAccount}{' '}
              <Link to="/register" className="text-brand-600 font-medium hover:underline">{t.register}</Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-2">
            <p className="font-medium text-gray-700">Llogari demo (klikoni për të hyrë):</p>
            <button
              type="button"
              onClick={() => { setEmail('arbeni@demo.ks'); setPassword('password123'); }}
              className="w-full text-left px-2 py-1.5 bg-white border border-gray-200 rounded hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              👤 Blerës — arbeni@demo.ks
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@prona.ks'); setPassword('Admin@2024!'); }}
              className="w-full text-left px-2 py-1.5 bg-white border border-gray-200 rounded hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              🛡️ Admin — admin@prona.ks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
