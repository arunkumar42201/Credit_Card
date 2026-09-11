import React from 'react';
import { X, Calendar, DollarSign, MapPin, Smartphone, ShieldCheck, Clock, Layers, AlertTriangle } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const pred = transaction.prediction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Transaction Inspection</span>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">{transaction.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Prediction banner */}
          {pred && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Model Classification</p>
                <p className="text-xl font-black text-white mt-0.5">{pred.prediction}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Risk Score</p>
                  <p className="text-lg font-bold font-mono text-indigo-400">{pred.risk_score} / 100</p>
                </div>
                <RiskBadge level={pred.risk_level} score={pred.risk_score} />
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Amount (USD)</span>
              <p className="text-base font-bold font-mono text-white mt-1">${Number(transaction.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Merchant Sector</span>
              <p className="text-sm font-semibold text-white capitalize mt-1">{transaction.merchant_category || 'Retail'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Time / Hour</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.transaction_time_hour ?? 12}:00</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Velocity (24h)</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.transaction_frequency_24h ?? 1} txn(s)</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Location Risk Index</span>
              <p className="text-sm font-mono font-semibold text-white mt-1">{transaction.location_risk_score ?? 0.1}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Device Risk Index</span>
              <p className="text-sm font-mono font-semibold text-white mt-1">{transaction.device_risk_score ?? 0.1}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Geo Distance Leap</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.distance_from_prev_km ?? 0} km</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Amount / 30d Avg</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.prev_amount_ratio ?? 1.0}x</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Account Age</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.account_age_days ?? 365} days</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">24h Failed Attempts</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.failed_transactions_24h ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">International Flag</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.is_international ? 'Yes (Foreign)' : 'No (Domestic)'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Channel Type</span>
              <p className="text-sm font-semibold text-white mt-1">{transaction.is_online ? 'E-Commerce / Online' : 'Point of Sale / Physical'}</p>
            </div>
          </div>

          {transaction.notes && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Notes & Reference:</span>
              <p className="text-slate-300 mt-0.5">{transaction.notes}</p>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3">
            <span>Timestamp: {new Date(transaction.created_at).toLocaleString()}</span>
            <span>Status: <span className="text-emerald-400 capitalize font-medium">{pred?.status || 'Analyzed'}</span></span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
