import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

export const RiskBadge = ({ level, score }) => {
  const cleanLevel = (level || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    HIGH: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      icon: AlertOctagon,
      label: 'High Risk',
    },
    CRITICAL: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20',
      icon: Flame,
      label: 'Critical Risk',
    },
  };

  const current = configs[cleanLevel] || configs.LOW;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
      {typeof score === 'number' && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
          {score}
        </span>
      )}
    </span>
  );
};
