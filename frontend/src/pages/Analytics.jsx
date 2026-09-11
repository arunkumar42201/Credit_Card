import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Layers, RefreshCw } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Analytics = () => {
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [riskDist, setRiskDist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(14);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [trendData, catData, distData] = await Promise.all([
        analyticsService.getTrends(timeRange),
        analyticsService.getCategories(),
        analyticsService.getRiskDistribution()
      ]);
      setTrends(trendData);
      setCategories(catData);
      setRiskDist(distData);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Aggregating statistical risk distributions..." />
      </div>
    );
  }

  const riskDistData = [
    { name: 'Low (0-30)', count: riskDist?.low || 0, fill: '#10b981' },
    { name: 'Medium (31-60)', count: riskDist?.medium || 0, fill: '#f59e0b' },
    { name: 'High (61-85)', count: riskDist?.high || 0, fill: '#f97316' },
    { name: 'Critical (86-100)', count: riskDist?.critical || 0, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Risk Analytics & Trends</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive multi-dimensional telemetry, category exposure rates, and historical anomaly curves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Rate Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Fraud Incident Ratio (%)</h3>
          <p className="text-xs text-slate-400 mb-6">Proportion of flagged fraudulent attempts over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#64748b" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="fraud_rate" name="Fraud Rate (%)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3, fill: '#f43f5e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Risk Score Spectrum</h3>
          <p className="text-xs text-slate-400 mb-6">Distribution across configurable risk thresholds</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">Fraud Exposure by Merchant Sector</h3>
        <p className="text-xs text-slate-400 mb-6">Total volume vs fraud incidence rate across commercial categories</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="total" name="Total Transactions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fraud_count" name="Fraudulent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
