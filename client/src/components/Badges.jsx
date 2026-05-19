import React from 'react';

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    open: { 
      color: 'bg-blue-50 text-blue-700 border-blue-200/60', 
      label: 'Open',
      dotColor: 'bg-blue-500'
    },
    in_progress: { 
      color: 'bg-amber-50 text-amber-700 border-amber-200/60', 
      label: 'In Progress',
      dotColor: 'bg-amber-500 animate-pulse'
    },
    resolved: { 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', 
      label: 'Resolved',
      dotColor: 'bg-emerald-500'
    },
    closed: { 
      color: 'bg-slate-100 text-slate-700 border-slate-200/60', 
      label: 'Closed',
      dotColor: 'bg-slate-500'
    },
  };

  const config = statusConfig[status] || statusConfig['open'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
      {config.label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const categoryConfig = {
    road: { color: 'bg-violet-50 text-violet-700 border-violet-200/60', label: 'Roads & Streets' },
    water: { color: 'bg-teal-50 text-teal-700 border-teal-200/60', label: 'Water & Supply' },
    electricity: { color: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Electricity' },
    sanitation: { color: 'bg-orange-50 text-orange-700 border-orange-200/60', label: 'Sanitation' },
    other: { color: 'bg-slate-100 text-slate-700 border-slate-200/60', label: 'Other' },
  };

  const config = categoryConfig[category?.toLowerCase()] || categoryConfig['other'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${config.color}`}>
      {config.label || category}
    </span>
  );
};
