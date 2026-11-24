import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function SeverityBadge({ severity, size = 'sm' }) {
  const sev = (severity || 'Medium').toLowerCase();

  const configs = {
    critical: {
      bg: 'bg-[#FEF2F2] border-rose-200 text-rose-700',
      icon: ShieldAlert,
    },
    high: {
      bg: 'bg-orange-50 border-orange-200 text-orange-700',
      icon: AlertCircle,
    },
    medium: {
      bg: 'bg-[#FFFBEB] border-amber-200 text-amber-700',
      icon: AlertTriangle,
    },
    low: {
      bg: 'bg-[#EFF6FF] border-blue-200 text-blue-700',
      icon: Info,
    },
    informational: {
      bg: 'bg-slate-50 border-slate-200 text-slate-600',
      icon: Info,
    },
  };

  const config = configs[sev] || configs.medium;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="capitalize">{severity}</span>
    </span>
  );
}
