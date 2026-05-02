import { useQuery } from '@tanstack/react-query';
import { Users, FileText, BarChart3, ClipboardList, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import Layout from '../../components/Layout';
import { adminApi } from '../../services/api';
import { t } from '../../i18n';

interface Stats {
  totals: { users: number; properties: number; reports: number; documents: number };
  recent_activity: Array<{ full_name: string; email: string; property_count: number; last_activity: string }>;
  risk_distribution: Array<{ overall_status: string; count: string }>;
  daily_signups: Array<{ date: string; count: string }>;
}

const riskColors: Record<string, string> = {
  green: 'text-emerald-600',
  yellow: 'text-amber-600',
  red: 'text-red-600',
};
const riskIcons: Record<string, React.ReactNode> = {
  green: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  yellow: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  red: <XCircle className="w-5 h-5 text-red-500" />,
};
const riskLabels: Record<string, string> = {
  green: 'E Gjelbër (E Sigurt)',
  yellow: 'E Verdhë (Kujdes)',
  red: 'E Kuqe (Rrezik)',
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res as Stats;
    },
  });

  const { data: auditData } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => adminApi.getAuditLogs({ limit: 20 }),
  });

  const audit = (auditData?.data || []) as Array<Record<string, unknown>>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.adminDashboard}</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: t.totalUsers, value: stats.totals.users, icon: <Users className="w-5 h-5" />, bg: 'bg-blue-50 text-blue-600' },
                { label: t.totalProperties, value: stats.totals.properties, icon: <FileText className="w-5 h-5" />, bg: 'bg-brand-50 text-brand-600' },
                { label: t.totalReports, value: stats.totals.reports, icon: <BarChart3 className="w-5 h-5" />, bg: 'bg-purple-50 text-purple-600' },
                { label: t.totalDocuments, value: stats.totals.documents, icon: <ClipboardList className="w-5 h-5" />, bg: 'bg-amber-50 text-amber-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Risk distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">{t.riskDistribution}</h2>
                <div className="space-y-3">
                  {stats.risk_distribution.map((item) => (
                    <div key={item.overall_status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {riskIcons[item.overall_status]}
                        <span className="text-sm text-gray-600">
                          {riskLabels[item.overall_status] || item.overall_status}
                        </span>
                      </div>
                      <span className={`font-bold ${riskColors[item.overall_status] || 'text-gray-600'}`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                  {stats.risk_distribution.length === 0 && (
                    <p className="text-sm text-gray-400">Asnjë raport i gjeneruar ende.</p>
                  )}
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">{t.recentActivity}</h2>
                <div className="space-y-3">
                  {stats.recent_activity.slice(0, 6).map((user, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-700">{user.property_count} prona</p>
                        {user.last_activity && (
                          <p className="text-xs text-gray-400">
                            {new Date(user.last_activity).toLocaleDateString('sq-AL')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Audit logs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">{t.auditLogs}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Koha</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Veprimi</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Përdoruesi</th>
                  <th className="text-left py-2 font-medium text-gray-500 text-xs">Burimi</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((log) => (
                  <tr key={log.id as string} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(log.created_at as string).toLocaleString('sq-AL')}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">
                        {log.action as string}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-600 text-xs">
                      {(log.full_name as string) || (log.email as string) || 'N/A'}
                    </td>
                    <td className="py-2 text-gray-400 text-xs">
                      {(log.resource_type as string) || '—'}
                    </td>
                  </tr>
                ))}
                {audit.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">
                      Asnjë aktivitet i regjistruar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
