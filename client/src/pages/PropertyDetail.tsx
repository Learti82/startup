import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight, MapPin, FileText, Trash2, Download,
  Sparkles, Loader2, RefreshCw, AlertTriangle, Home
} from 'lucide-react';
import Layout from '../components/Layout';
import RiskBadge from '../components/RiskBadge';
import RiskReport from '../components/RiskReport';
import DocumentUpload from '../components/DocumentUpload';
import { propertyApi, documentApi, reportApi } from '../services/api';
import { t } from '../i18n';
import toast from 'react-hot-toast';
import type { Document, RiskLevel } from '../types';

const DOC_TYPE_LABELS: Record<string, string> = t.documentTypes as unknown as Record<string, string>;

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'documents' | 'report'>('documents');

  const { data: property, isLoading: propLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.get(id!),
    enabled: !!id,
  });

  const { data: documents, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentApi.list(id!),
    enabled: !!id,
  });

  const { data: report, refetch: refetchReport, isLoading: reportLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportApi.get(id!),
    enabled: !!id,
    retry: false,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => reportApi.analyze(id!),
    onSuccess: () => {
      toast.success(t.reportGenerated);
      refetchReport();
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      setActiveTab('report');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => documentApi.delete(id!, docId),
    onSuccess: () => {
      toast.success('Dokumenti u fshi');
      refetchDocs();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePropertyMutation = useMutation({
    mutationFn: () => propertyApi.delete(id!),
    onSuccess: () => {
      toast.success('Prona u fshi');
      navigate('/dashboard');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (propLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Prona nuk u gjet.</p>
          <Link to="/dashboard" className="text-brand-600 mt-2 inline-block">← Kthehu</Link>
        </div>
      </Layout>
    );
  }

  const docs: Document[] = documents || [];
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    analyzing: 'bg-blue-100 text-blue-700',
    complete: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-gray-100 text-gray-500',
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/dashboard" className="hover:text-brand-600">Paneli</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate max-w-xs">{property.title}</span>
        </div>

        {/* Property header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{property.title}</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[property.status] || statusColors.pending}`}>
                    {t.status[property.status as keyof typeof t.status]}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{property.address}</span>
                </div>
                {property.overall_status && (
                  <div className="mt-2">
                    <RiskBadge level={property.overall_status as RiskLevel} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (window.confirm(t.confirDelete)) deletePropertyMutation.mutate(); }}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Fshi
              </button>
            </div>
          </div>

          {/* Property details grid */}
          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Komuna', value: property.municipality || '—' },
              { label: 'Parcela', value: property.parcel_number || '—' },
              { label: 'Sipërfaqja', value: property.area_sqm ? `${property.area_sqm} m²` : '—' },
              { label: 'Çmimi', value: property.asking_price_eur ? `€${property.asking_price_eur.toLocaleString()}` : '—' },
              { label: 'Shitësi', value: property.seller_name || '—' },
              { label: 'Zhvilluesi', value: property.developer_name || '—' },
            ].map((d) => (
              <div key={d.label}>
                <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                <p className="text-sm font-medium text-gray-700 truncate">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <div>
              <p className="font-semibold text-brand-900">
                {report ? 'Rirrafreshoni Analizën' : 'Filloni Analizën e Rrezikut'}
              </p>
              <p className="text-sm text-brand-700">
                {docs.length === 0 ? 'Ngarkoni dokumentet fillimisht' :
                  `${docs.length} dokument${docs.length !== 1 ? 'e' : ''} të gatshëm për analizë`}
              </p>
            </div>
          </div>
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending || docs.length === 0}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t.analyzing}</>
            ) : report ? (
              <><RefreshCw className="w-4 h-4" />Rillogarit</>
            ) : (
              <><Sparkles className="w-4 h-4" />{t.analyzeNow}</>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {(['documents', 'report'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'documents' ? (
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t.documents} ({docs.length})
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t.riskReport}
                  {property.overall_status && (
                    <span className={`w-2 h-2 rounded-full ${
                      property.overall_status === 'green' ? 'bg-emerald-500' :
                      property.overall_status === 'red' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Documents tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUpload
              propertyId={id!}
              onUploaded={() => refetchDocs()}
            />

            {docs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Dokumentet e Ngarkuara ({docs.length})
                </h3>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.original_filename}</p>
                          <p className="text-xs text-gray-400">
                            {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                            {doc.file_size_bytes && ` • ${(doc.file_size_bytes / 1024).toFixed(0)} KB`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={documentApi.download(id!, doc.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteDocMutation.mutate(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {docs.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                <p className="text-sm">Ngarkoni të paktën ekstraktin kadastral dhe lejen e ndërtimit për analizë optimale.</p>
              </div>
            )}
          </div>
        )}

        {/* Report tab */}
        {activeTab === 'report' && (
          <div>
            {reportLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : report ? (
              <RiskReport report={report} />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">{t.noReport}</p>
                <p className="text-sm text-gray-400">
                  {docs.length === 0
                    ? 'Ngarkoni dokumentet e pronës fillimisht.'
                    : 'Klikoni "Analizo Tani" për të gjeneruar raportin.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
