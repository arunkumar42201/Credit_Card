import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Cpu, ShieldCheck, Activity, Flame, ArrowRight, Settings } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        analyticsService.getAdminStats(),
        analyticsService.getAdminUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading administrator system metrics..." />
      </div>
    );
  }

  const activeUsersCount = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
            SYSTEM ROOT SUPERVISION
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Admin Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global system management, role provisioning, and model governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/model-info"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors"
          >
            <Cpu className="w-4 h-4" />
            <span>Model Telemetry</span>
          </Link>
        </div>
      </div>

      {/* System KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={users.length}
          subtitle={`${activeUsersCount} active users`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="System Transactions"
          value={stats?.total_transactions || 0}
          subtitle="All platform users"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="System Fraud Rate"
          value={`${stats?.fraud_rate || 0}%`}
          subtitle={`${stats?.fraudulent_count || 0} fraud incidents`}
          icon={Flame}
          color="rose"
        />
        <StatCard
          title="Active Model Status"
          value="Online"
          subtitle="Random Forest Pipeline"
          icon={Cpu}
          color="emerald"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">User Access Management</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Supervise user accounts across User, Analyst, and Admin tiers. Toggle account access status or remove compromised profiles.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            <span>Open User Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Production ML Model Governance</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Inspect true test dataset evaluation metrics: Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix, and top feature weights.
            </p>
          </div>
          <Link
            to="/admin/model-info"
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>View ML Performance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
