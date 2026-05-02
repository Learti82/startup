import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { propertyApi } from '../services/api';
import { t } from '../i18n';
import toast from 'react-hot-toast';

const MUNICIPALITIES = [
  'Prishtinë', 'Prizren', 'Ferizaj', 'Gjilan', 'Pejë', 'Mitrovicë',
  'Gjakovë', 'Vushtrri', 'Lipjan', 'Podujevë', 'Fushë Kosovë',
  'Suharekë', 'Rahovec', 'Malishevë', 'Dragash', 'Istog', 'Klinë',
  'Skenderaj', 'Gllogovc', 'Shtime', 'Kaçanik', 'Hani i Elezit',
];

export default function NewProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', address: '', municipality: '', parcel_number: '',
    property_type: 'apartment', area_sqm: '', asking_price_eur: '',
    seller_name: '', developer_name: '', notes: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : undefined,
        asking_price_eur: form.asking_price_eur ? parseFloat(form.asking_price_eur) : undefined,
      };
      const property = await propertyApi.create(payload);
      toast.success('Prona u shtua me sukses!');
      navigate(`/properties/${property.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>Paneli</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{t.newProperty}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.addProperty}</h1>
              <p className="text-sm text-gray-500">Mbushni detajet bazike të pronës</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.propertyTitle} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.title} onChange={set('title')} required minLength={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="p.sh. Apartament 2+1 — Rr. Fehmi Agani"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />{t.address} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.address} onChange={set('address')} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Rruga, Numri, Lagjja, Qyteti"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.municipality}</label>
                <select value={form.municipality} onChange={set('municipality')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white">
                  <option value="">— Zgjidhni —</option>
                  {MUNICIPALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.parcelNumber}</label>
                <input
                  type="text" value={form.parcel_number} onChange={set('parcel_number')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="P-12345-22"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.propertyType}</label>
                <select value={form.property_type} onChange={set('property_type')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white">
                  {Object.entries(t.propertyTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.areaSqm}</label>
                <input
                  type="number" value={form.area_sqm} onChange={set('area_sqm')} min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="72.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.askingPrice}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                <input
                  type="number" value={form.asking_price_eur} onChange={set('asking_price_eur')} min="1"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="89,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.sellerName}</label>
                <input
                  type="text" value={form.seller_name} onChange={set('seller_name')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Emri Mbiemri"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.developerName}</label>
                <input
                  type="text" value={form.developer_name} onChange={set('developer_name')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="SH.P.K. ose emri"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.notes}</label>
              <textarea
                value={form.notes} onChange={set('notes')} rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                placeholder="Çdo informacion shtesë të rëndësishëm..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button" onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {loading ? t.loading : 'Shto Pronën'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
          Pasi shtoni pronën, do të mund të ngarkoni dokumentet dhe të gjeneroni raportin e rrezikut.
        </p>
      </div>
    </Layout>
  );
}
