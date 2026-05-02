import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import { propertyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import type { Property } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyApi.list(20, 0),
  });

  const properties: Property[] = data?.data || [];
  const green = properties.filter((p) => p.overall_status === 'green').length;
  const yellow = properties.filter((p) => p.overall_status === 'yellow').length;
  const red = properties.filter((p) => p.overall_status === 'red').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mirë se vini, {user?.full_name.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 mt-1">
              {t.appTagline}
            </p>
          </div>
          <Link
            to="/properties/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t.newProperty}
          </Link>
        </div>

        {/* Subscription banner */}
        {user && user.plan === 'free' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-800">
                Jeni në planin <strong>Falas</strong>. Keni <strong>{(user.reports_limit || 1) - (user.reports_used || 0)}</strong> raport të mbetur.
              </span>
            </div>
            <Link to="/pricing" className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">
              Zgjeroni planin →
            </Link>
          </div>
        )}

        {/* Stats */}
        {properties.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Prona', value: data?.total || 0, icon: <FileText className="w-5 h-5" />, color: 'text-brand-600 bg-brand-50' },
              { label: 'Të Sigurta', value: green, icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Kujdes', value: yellow, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
              { label: 'Rrezik i Lartë', value: red, icon: <TrendingUp className="w-5 h-5" />, color: 'text-red-600 bg-red-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Properties list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.myProperties}</h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t.noProperties}</p>
              <Link
                to="/properties/new"
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.addFirstProperty}
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
