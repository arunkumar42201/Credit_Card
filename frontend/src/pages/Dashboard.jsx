import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Zap,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';

import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { StatCard } from '../components/StatCard';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionModal } from '../components/TransactionModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [riskDist, setRiskDist] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, trendsData, distData, txnsData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends(14),
        analyticsService.getRiskDistribution(),
        analyticsService.getTransactions({ limit: 10 })
      ]);

      setStats(overviewData);
      setTrends(trendsData);
      setRiskDist(distData);
      setRecentTxns(txnsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading risk intelligence telemetry..." />
      </div>
    );
  }

  // Pie chart data
  const pieData = [
    { name: 'Legitimate', value: stats?.legitimate_count || 0, color: '#10b981' },
    { name: 'Suspicious', value: stats?.suspicious_count || 0, color: '#f59e0b' },
    { name: 'Fraudulent', value: stats?.fraudulent_count || 0, color: '#f43f5e' },
  ];

  // Bar chart data for risk distribution
  const barData = [
    { level: 'Low', count: riskDist?.low || 0, fill: '#10b981' },
    { level: 'Medium', count: riskDist?.medium || 0, fill: '#f59e0b' },
    { level: 'High', count: riskDist?.high || 0, fill: '#f97316' },
    { level: 'Critical', count: riskDist?.critical || 0, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            {user?.role.toUpperCase()} CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time fraud surveillance and behavioral risk assessment. Highlighting anomalous transactions and transaction velocity spikes.
          </p>
        </div>

        <Link
          to="/analyze"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-150 transform hover:-translate-y-0.5"
        >
          <Zap className="w-4 h-4" />
          <span>Analyze Transaction</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Analyzed"
          value={stats?.total_transactions?.toLocaleString() || '0'}
          subtitle="Processed transaction records"
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="Fraudulent Detected"
          value={stats?.fraudulent_count?.toLocaleString() || '0'}
          subtitle={`${stats?.fraud_rate || 0}% fraud capture rate`}
          icon={Flame}
          color="rose"
        />
        <StatCard
          title="Suspicious Held"
          value={stats?.suspicious_count?.toLocaleString() || '0'}
          subtitle="Flagged for step-up 2FA verification"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Average Risk Score"
          value={`${stats?.average_risk_score || 0} / 100`}
          subtitle="Ensemble baseline index"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">14-Day Fraud Activity Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily volume versus detected fraudulent anomalies</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-indigo-400">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="total" name="Total Volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="fraudulent" name="Fraudulent" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Risk Ratio Split</h3>
            <p className="text-xs text-slate-400 mt-0.5">Classification proportions</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400">Live feed of recent scoring operations</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <TransactionTable
          transactions={recentTxns}
          onInspect={(txn) => setSelectedTxn(txn)}
        />
      </div>

      {/* Inspect Modal */}
      {selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
};
