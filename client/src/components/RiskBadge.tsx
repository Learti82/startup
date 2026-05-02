import type { RiskLevel } from '../types';
import { t } from '../i18n';

interface Props {
  level: RiskLevel | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const config = {
  green: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500',
    label: t.riskLevels.green,
  },
  yellow: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dot: 'bg-amber-500',
    label: t.riskLevels.yellow,
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    dot: 'bg-red-500',
    label: t.riskLevels.red,
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dot: 'bg-blue-500',
    label: 'Informacion',
  },
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export default function RiskBadge({ level, size = 'md', showLabel = true }: Props) {
  const c = config[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${sizes[size]}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
      {showLabel && c.label}
    </span>
  );
}
