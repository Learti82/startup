import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { User, Shield, Download, Trash2, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import toast from 'react-hot-toast';

const roleLabels: Record<string, string> = {
  buyer: 'Blerës', lawyer: 'Avokat/Noter', bank: 'Bankë', developer: 'Ndërtues', admin: 'Admin',
};

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateMe(form),
    onSuccess: () => { toast.success('Profili u përditësua'); refreshUser(); setEditMode(false); },
    onError: (err: Error) => toast.error(err.message),
  });

  const exportMutation = useMutation({
    mutationFn: () => userApi.exportData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prona-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Të dhënat u eksportuan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => { toast.success('Llogaria u fshi'); logout(); navigate('/'); },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.profile}</h1>

        {/* Profile info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-700">{user.full_name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full mt-1">
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName}</label>
                <input
                  type="text" value={form.full_name}
                  onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.phone}</label>
                <input
                  type="tel" value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium">
                  {t.cancel}
                </button>
                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? t.loading : t.save}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditMode(true)} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Ndrysho Profilin
            </button>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-brand-500" />
            <h3 className="font-semibold text-gray-900">Abonimi</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-0.5">Plani</p>
              <p className="font-semibold text-gray-900 capitalize">{user.plan || 'Falas'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Raporte</p>
              <p className="font-semibold text-gray-900">{user.reports_used || 0} / {user.reports_limit || 1}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Ndrysho Fjalëkalimin</h3>
          </div>
          <div className="space-y-3">
            <input
              type="password" placeholder="Fjalëkalimi aktual"
              value={pwForm.current_password}
              onChange={(e) => setPwForm(p => ({ ...p, current_password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <input
              type="password" placeholder="Fjalëkalimi i ri (të paktën 8 karaktere)"
              value={pwForm.new_password}
              onChange={(e) => setPwForm(p => ({ ...p, new_password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <button className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors">
              Ndrysho Fjalëkalimin
            </button>
          </div>
        </div>

        {/* GDPR actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Privatësia & Të dhënat</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Sipas GDPR, keni të drejtën të eksportoni ose fshini të gjitha të dhënat tuaja.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Eksporto Të Dhënat
            </button>
            <button
              onClick={() => {
                if (window.confirm('KUJDES: Kjo do të fshijë llogarinë dhe TË GJITHA të dhënat tuaja. Ky veprim nuk mund të kthehet. Jeni të sigurt?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Fshi Llogarinë
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
