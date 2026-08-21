import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    // General Status
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Open': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Quotes Received': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Selected': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Under Evaluation': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Fulfilled': 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    'Closed': 'bg-slate-700/30 text-slate-400 border-slate-700/50',
    'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    'Filed': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {status}
    </span>
  );
}

export function MedalBadge({ tier }) {
  const medalConfig = {
    'Diamond': { label: '💎 Diamond Medal', class: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-cyan-500/10' },
    'Platinum': { label: '🪙 Platinum Medal', class: 'bg-slate-200/20 text-slate-200 border-slate-300/40 shadow-slate-500/10' },
    'Gold': { label: '🥇 Gold Medal', class: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40 shadow-yellow-500/10' },
    'Silver': { label: '🥈 Silver Medal', class: 'bg-slate-400/20 text-slate-300 border-slate-400/40' },
    'Bronze': { label: '🥉 Bronze Medal', class: 'bg-orange-500/20 text-orange-300 border-orange-400/40' },
  };

  const config = medalConfig[tier] || medalConfig['Bronze'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border shadow-sm ${config.class}`}>
      {config.label}
    </span>
  );
}
