import { AlertTriangle, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, HelpCircle, ClipboardList, Sparkles } from 'lucide-react';
import { useState } from 'react';
import RiskBadge from './RiskBadge';
import type { RiskReport as RiskReportType, RiskLevel } from '../types';
import { t } from '../i18n';

interface Props {
  report: RiskReportType;
}

const categoryLabels: Record<string, string> = {
  cadastral: 'Kadastral',
  permits: 'Lejet',
  ownership: 'Pronësia',
  mortgage: 'Hipoteka',
  developer: 'Zhvilluesi',
  compliance: 'Pajtueshmëria',
};

const severityIcons = {
  red: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  yellow: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  green: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const severityBg: Record<string, string> = {
  red: 'bg-red-50 border-red-200',
  yellow: 'bg-amber-50 border-amber-200',
  green: 'bg-emerald-50 border-emerald-200',
  info: 'bg-blue-50 border-blue-200',
};

function ScoreGauge({ score, status }: { score: number; status: RiskLevel }) {
  const color = status === 'green' ? '#10b981' : status === 'yellow' ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="45" fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="700" fill={color}>{score}</text>
        <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#6b7280">/100</text>
      </svg>
      <RiskBadge level={status} size="lg" />
    </div>
  );
}

function CategoryRow({ label, status }: { label: string; status: RiskLevel }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <RiskBadge level={status} size="sm" />
    </div>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function RiskReport({ report }: Props) {
  const redItems = report.risk_items?.filter((i) => i.severity === 'red') || [];
  const yellowItems = report.risk_items?.filter((i) => i.severity === 'yellow') || [];
  const otherItems = report.risk_items?.filter((i) => i.severity !== 'red' && i.severity !== 'yellow') || [];
  const allItems = [...redItems, ...yellowItems, ...otherItems];

  return (
    <div className="space-y-5">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreGauge score={report.overall_score} status={report.overall_status} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t.riskReport}</h2>
            <div className="grid grid-cols-2 gap-2">
              <CategoryRow label="Kadastral" status={report.cadastral_status} />
              <CategoryRow label="Lejet" status={report.permit_status} />
              <CategoryRow label="Pronësia" status={report.ownership_status} />
              <CategoryRow label="Hipoteka" status={report.mortgage_status} />
              <CategoryRow label="Zhvilluesi" status={report.developer_status} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {report.ai_summary && (
        <CollapsibleSection
          title={t.aiSummary}
          icon={<Sparkles className="w-4 h-4 text-brand-500" />}
        >
          <p className="text-gray-700 leading-relaxed">{report.ai_summary}</p>
          <p className="text-xs text-gray-400 mt-3">
            Versioni {report.version} • {new Date(report.updated_at || report.created_at).toLocaleString('sq-AL')}
          </p>
        </CollapsibleSection>
      )}

      {/* Risk Items */}
      {allItems.length > 0 && (
        <CollapsibleSection
          title={t.riskItems}
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        >
          <div className="space-y-3">
            {allItems.map((item) => (
              <div key={item.id} className={`rounded-lg border p-4 ${severityBg[item.severity]}`}>
                <div className="flex items-start gap-3">
                  {severityIcons[item.severity]}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                      <span className="text-xs bg-white/70 text-gray-500 px-2 py-0.5 rounded-full border">
                        {categoryLabels[item.category] || item.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                    {item.recommendation && (
                      <div className="bg-white/60 rounded-md px-3 py-2 text-xs text-gray-600">
                        <span className="font-medium">Rekomandim:</span> {item.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Missing Documents */}
      {report.missing_documents?.length > 0 && (
        <CollapsibleSection
          title={t.missingDocsTitle}
          icon={<ClipboardList className="w-4 h-4 text-red-500" />}
        >
          <ul className="space-y-2">
            {report.missing_documents.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full border-2 border-red-300 flex-shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Questions for Seller */}
      {report.questions_for_seller?.length > 0 && (
        <CollapsibleSection
          title={t.questionsForSeller}
          icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
          defaultOpen={false}
        >
          <ol className="space-y-2">
            {report.questions_for_seller.map((q, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="pt-0.5">{q}</span>
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      {/* Questions for Notary */}
      {report.questions_for_notary?.length > 0 && (
        <CollapsibleSection
          title={t.questionsForNotary}
          icon={<HelpCircle className="w-4 h-4 text-brand-500" />}
          defaultOpen={false}
        >
          <ol className="space-y-2">
            {report.questions_for_notary.map((q, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="pt-0.5">{q}</span>
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      {/* Legal Disclaimer */}
      {report.disclaimer && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">{t.disclaimer}:</strong> {report.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
