import React from 'react';

export default function RiskBadge({ score, category, showLabel = true }) {
  let colorStyles = 'bg-[#EFF6FF] text-[#2563EB] border-blue-200';
  let badgeLabel = 'Low Risk';

  if (score >= 85) {
    colorStyles = 'bg-[#FEF2F2] text-rose-700 border-rose-200';
    badgeLabel = 'Critical Risk';
  } else if (score >= 65) {
    colorStyles = 'bg-orange-50 text-orange-700 border-orange-200';
    badgeLabel = 'High Risk';
  } else if (score >= 40) {
    colorStyles = 'bg-[#FFFBEB] text-amber-700 border-amber-200';
    badgeLabel = 'Medium Risk';
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2 py-0.5 rounded-md border shadow-2xs ${colorStyles}`}
      >
        {score}
        <span className="text-[10px] opacity-75 font-normal ml-0.5">/100</span>
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-[#64748B] hidden sm:inline">
          {category || badgeLabel}
        </span>
      )}
    </div>
  );
}
