import React from 'react';
import { User, Shield, Mail, Calendar, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white">Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your account identity, security role credentials, and active permissions.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-2">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Verified Email
            </span>
            <p className="font-semibold text-white">{user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Authorization Tier
            </span>
            <p className="font-semibold text-white capitalize">{user?.role} Access</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Authentication Mechanism
            </span>
            <p className="font-semibold text-white font-mono">HMAC-SHA256 JWT Token</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Account Status
            </span>
            <p className="font-semibold text-emerald-400">Active & Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
};
