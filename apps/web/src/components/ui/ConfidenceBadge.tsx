import React from 'react';
import { clsx } from 'clsx';
import { ConfidenceLevel } from '@/types';
import { ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export function ConfidenceBadge({ level, className }: ConfidenceBadgeProps) {
  const configs = {
    high: {
      label: 'High Confidence',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tooltip: 'Strongly supported by multiple independent, authoritative sources.',
    },
    medium: {
      label: 'Moderate',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />,
      style: 'bg-sky-50 text-sky-700 border-sky-200',
      tooltip: 'Supported by available sources with consistent wording.',
    },
    low: {
      label: 'Low Support',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      tooltip: 'Mentioned tangentially or in limited context.',
    },
    uncertain: {
      label: 'Uncertain / Unverified',
      icon: <HelpCircle className="w-3.5 h-3.5 text-rose-600" />,
      style: 'bg-rose-50 text-rose-700 border-rose-200',
      tooltip: 'Contains ambiguities, conflicting details, or extrapolation requiring external verification.',
    },
  };

  const config = configs[level] || configs.uncertain;

  return (
    <span
      title={config.tooltip}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none',
        config.style,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

