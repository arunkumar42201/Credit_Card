import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, ShieldCheck, BarChart2, Calendar, Database, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ModelInfo = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getModelInfo();
      setModelInfo(data);
    } catch (err) {
      console.error('Failed to load model info', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Retrieving real model evaluation parameters..." />
      </div>
    );
  }

  const cm = modelInfo?.confusion_matrix || {
    true_negatives: 0,
    false_positives: 0,
    false_negatives: 0,
    true_positives: 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
          ALGORITHMIC GOVERNANCE & EVALUATION
        </span>
        <h1 className="text-2xl font-black text-white mt-1">Machine Learning Model Specs</h1>
        <p className="text-xs text-slate-400 mt-1">
          True empirical performance metrics verified on an independent stratified test dataset.
        </p>
      </div>

      {/* Model Overview Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{modelInfo?.model_name || 'FraudGuard Model'}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{modelInfo?.algorithm}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Trained: </span>
            <span>{modelInfo?.trained_at}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Total Samples: </span>
            <span className="text-indigo-400 font-bold">{modelInfo?.dataset_size?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Real Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Accuracy</p>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{(modelInfo?.accuracy * 100).toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Precision</p>
          <p className="text-xl font-bold font-mono text-indigo-400 mt-1">{(modelInfo?.precision * 100).toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Fraud Recall</p>
          <p className="text-xl font-bold font-mono text-rose-400 mt-1">{(modelInfo?.recall * 100).toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">F1-Score</p>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1">{(modelInfo?.f1_score * 100).toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">ROC-AUC</p>
          <p className="text-xl font-bold font-mono text-purple-400 mt-1">{modelInfo?.roc_auc?.toFixed(4)}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">PR-AUC</p>
          <p className="text-xl font-bold font-mono text-cyan-400 mt-1">{modelInfo?.pr_auc?.toFixed(4)}</p>
        </div>
      </div>

      {/* Confusion Matrix & Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix Grid (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Empirical Confusion Matrix</h3>
          <p className="text-xs text-slate-400 mb-6">Evaluated on {modelInfo?.test_samples || 3000} held-out test transactions</p>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">True Negatives (TN)</span>
              <p className="text-2xl font-black font-mono text-white mt-1">{cm.true_negatives}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Legitimate correctly passed</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400">False Positives (FP)</span>
              <p className="text-2xl font-black font-mono text-white mt-1">{cm.false_positives}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Legitimate false alerts</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400">False Negatives (FN)</span>
              <p className="text-2xl font-black font-mono text-white mt-1">{cm.false_negatives}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Missed fraud occurrences</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">True Positives (TP)</span>
              <p className="text-2xl font-black font-mono text-white mt-1">{cm.true_positives}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Fraud successfully blocked</span>
            </div>
          </div>
        </div>

        {/* Feature Importances (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Top Predictive Feature Importances</h3>
          <p className="text-xs text-slate-400 mb-6">Relative tree Gini-impurity reduction weights</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={modelInfo?.top_features || []} margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 'dataMax + 0.05']} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
