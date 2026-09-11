import React from 'react';
import { RiskBadge } from './RiskBadge';
import { ShieldCheck, AlertTriangle, AlertCircle, Flame, CheckCircle2, Copy, Check } from 'lucide-react';

export const PredictionCard = ({ result, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  if (!result) return null;

  const {
    transaction_id,
    prediction,
    probability,
    risk_score,
    risk_level,
    risk_factors = [],
    recommendation,
  } = result;

  const probPercent = Math.round(probability * 100);

  const getScoreColor = (score) => {
    if (score <= 30) return 'from-emerald-500 to-teal-400 text-emerald-400';
    if (score <= 60) return 'from-amber-500 to-yellow-400 text-amber-400';
    if (score <= 85) return 'from-orange-500 to-rose-500 text-orange-400';
    return 'from-rose-600 to-red-500 text-rose-500';
  };

  const getCardBorder = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-rose-500/40 shadow-rose-950/40';
      case 'HIGH':
        return 'border-orange-500/40 shadow-orange-950/40';
      case 'MEDIUM':
        return 'border-amber-500/40 shadow-amber-950/40';
      default:
        return 'border-emerald-500/30 shadow-emerald-950/30';
    }
  };

  const handleCopy = () => {
    if (transaction_id) {
      navigator.clipboard.writeText(transaction_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`bg-slate-900 border rounded-2xl p-6 shadow-2xl transition-all duration-300 ${getCardBorder(risk_level)}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Analysis Verdict</span>
          <div className="flex items-center gap-2.5 mt-1">
            <h3 className="text-2xl font-black tracking-tight text-white">{prediction}</h3>
            <RiskBadge level={risk_level} score={risk_score} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transaction_id && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{transaction_id}</span>
            </button>
          )}
        </div>
      </div>

      {/* Probability Gauge & Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-medium">Risk Score</span>
            <span className="text-xl font-bold font-mono text-white">{risk_score} <span className="text-xs text-slate-500">/ 100</span></span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(risk_score)} transition-all duration-700`}
              style={{ width: `${Math.max(4, risk_score)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>0 Low</span>
            <span>30 Med</span>
            <span>60 High</span>
            <span>85 Critical</span>
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-medium">Fraud Probability</span>
            <span className="text-xl font-bold font-mono text-white">{probPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(risk_score)} transition-all duration-700`}
              style={{ width: `${Math.max(4, probPercent)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>Model Output Confidence</span>
            <span>{(probability).toFixed(4)} P(Fraud)</span>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="rounded-xl p-4 bg-slate-950/90 border border-slate-800 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Action Recommendation</p>
        <p className="text-sm font-medium text-slate-200">{recommendation}</p>
      </div>

      {/* Explainable Risk Factors */}
      {risk_factors && risk_factors.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Risk Attribution Factors</p>
          <div className="space-y-2">
            {risk_factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      {onReset && (
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Analyze Another Transaction
          </button>
        </div>
      )}
    </div>
  );
};
