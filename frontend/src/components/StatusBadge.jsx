import React from 'react';
import { CircleDot, Clock, CheckCircle2 } from 'lucide-react';

export default function StatusBadge({ status }) {
  const st = (status || 'Open').toLowerCase();

  const configs = {
    open: {
      bg: 'bg-[#FEF2F2] border-rose-200 text-rose-700',
      icon: CircleDot,
    },
    'in progress': {
      bg: 'bg-[#FFFBEB] border-amber-200 text-amber-700',
      icon: Clock,
    },
    resolved: {
      bg: 'bg-[#ECFDF5] border-emerald-200 text-emerald-700',
      icon: CheckCircle2,
    },
  };

  const config = configs[st] || configs.open;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
}
