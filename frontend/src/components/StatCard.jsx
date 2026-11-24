import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badgeText,
}) {
  const variantStyles = {
    blue: {
      border: 'border-[#E2E8F0]',
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-blue-200',
    },
    rose: {
      border: 'border-rose-200',
      iconBg: 'bg-[#FEF2F2] text-rose-600',
      badgeBg: 'bg-[#FEF2F2] text-rose-700 border border-rose-200',
    },
    orange: {
      border: 'border-orange-200',
      iconBg: 'bg-orange-50 text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border border-orange-200',
    },
    amber: {
      border: 'border-amber-200',
      iconBg: 'bg-[#FFFBEB] text-amber-600',
      badgeBg: 'bg-[#FFFBEB] text-amber-700 border border-amber-200',
    },
    emerald: {
      border: 'border-emerald-200',
      iconBg: 'bg-[#ECFDF5] text-emerald-600',
      badgeBg: 'bg-[#ECFDF5] text-emerald-700 border border-emerald-200',
    },
    purple: {
      border: 'border-purple-200',
      iconBg: 'bg-[#F5F3FF] text-purple-600',
      badgeBg: 'bg-[#F5F3FF] text-purple-700 border border-purple-200',
    },
  }[variant] || {
    border: 'border-[#E2E8F0]',
    iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
    badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-blue-200',
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border ${variantStyles.border} bg-white shadow-card hover:shadow-card-hover transition-all duration-200 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${variantStyles.iconBg}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
          {value}
        </span>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${variantStyles.badgeBg}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#64748B] font-medium truncate">{subtitle}</p>
      )}
    </div>
  );
}
