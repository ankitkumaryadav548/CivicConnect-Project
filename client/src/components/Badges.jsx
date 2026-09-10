import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const StatusBadge = ({ status, userRole }) => {
  const { user } = useAuth();
  const role = userRole || user?.role;
  const isAdmin = role === 'admin';

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
      color: 'bg-purple-50 text-purple-700 border-purple-200/60', 
      label: isAdmin ? 'Resolved (Pending Citizen Verification)' : 'Resolved (Needs Your Confirmation)',
      dotColor: 'bg-purple-500 animate-ping'
    },
    closed: { 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', 
      label: isAdmin ? 'Verified Closed by Citizen' : 'Your Issue is Solved & Closed',
      dotColor: 'bg-emerald-500'
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

export const DepartmentBadge = ({ department }) => {
  const deptConfig = {
    water_board: { color: 'bg-teal-50 text-teal-700 border-teal-200/80', label: '💧 Water Board' },
    pwd_roads: { color: 'bg-violet-50 text-violet-700 border-violet-200/80', label: '🛣️ Public Works (PWD)' },
    electricity_board: { color: 'bg-amber-50 text-amber-700 border-amber-200/80', label: '⚡ Electricity Board' },
    sanitation_dept: { color: 'bg-orange-50 text-orange-700 border-orange-200/80', label: '🧹 Sanitation Dept' },
    general_municipal: { color: 'bg-slate-100 text-slate-700 border-slate-200/80', label: '🏛️ General Municipal' },
  };

  const config = deptConfig[department?.toLowerCase()] || deptConfig['general_municipal'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${config.color}`}>
      {config.label}
    </span>
  );
};

export const SLABadge = ({ slaDeadline, status, priority }) => {
  if (status === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span>✅ SLA Met</span>
      </span>
    );
  }

  const deadline = slaDeadline ? new Date(slaDeadline) : null;
  const now = new Date();

  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span>⏱️ SLA Active</span>
      </span>
    );
  }

  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse shadow-sm">
        <span>🚨 SLA Breached</span>
      </span>
    );
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  let labelText = `${hoursLeft}h remaining`;
  if (daysLeft >= 1) {
    labelText = `${daysLeft}d remaining`;
  }

  const isUrgent = hoursLeft < 12 || priority === 'urgent';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
      isUrgent ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'
    }`}>
      <span>⏱️ SLA: {labelText}</span>
    </span>
  );
};
