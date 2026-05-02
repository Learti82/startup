import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '', role: 'buyer', consent_gdpr: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent_gdpr) {
      toast.error(t.gdprRequired);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ ...form, consent_gdpr: true });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast.success('Llogaria u krijua me sukses!');
        navigate('/dashboard');
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t.registerTitle}</h1>
          <p className="text-gray-500 mt-1 text-sm">Filloni falas — pa kartë krediti</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName}</label>
              <input
                type="text" value={form.full_name} onChange={set('full_name')} required minLength={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Arben Gashi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
              <input
                type="email" value={form.email} onChange={set('email')} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="ju@shembull.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.phone} <span className="text-gray-400">(opsional)</span></label>
              <input
                type="tel" value={form.phone} onChange={set('phone')}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="+383 44 123 456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.role}</label>
              <select
                value={form.role} onChange={set('role')}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
              >
                <option value="buyer">{t.roles.buyer}</option>
                <option value="lawyer">{t.roles.lawyer}</option>
                <option value="bank">{t.roles.bank}</option>
                <option value="developer">{t.roles.developer}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} required minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Të paktën 8 karaktere"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={form.consent_gdpr}
                onChange={(e) => setForm((p) => ({ ...p, consent_gdpr: e.target.checked }))}
                className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-gray-600 leading-relaxed">{t.gdprConsent}</span>
            </label>

            <button
              type="submit" disabled={loading || !form.consent_gdpr}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t.loading : t.register}
            </button>
          </form>

          {/* Benefits list */}
          <div className="mt-5 space-y-2">
            {['1 raport falas pa kartë krediti', 'Dokumentet enkriptohen', 'Fshini llogarinë kurrë'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {t.haveAccount}{' '}
              <Link to="/login" className="text-brand-600 font-medium hover:underline">{t.login}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
