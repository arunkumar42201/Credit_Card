import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, FileSpreadsheet, Lock, ArrowRight, CheckCircle2, Activity, Cpu, Database, Eye } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-8 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Next-Gen Machine Learning Risk Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Detect Credit Card Fraud <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              in Sub-Millisecond Precision
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Protect financial assets with real-time ensemble inference, granular behavioral risk attribution, and instant explainable fraud intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-semibold text-slate-200 transition-colors"
            >
              <span>Explore Demo Roles</span>
            </Link>
          </div>

          {/* Metrics ribbon */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black font-mono text-white">99.8%</p>
              <p className="text-xs text-slate-400 mt-1">Detection Accuracy</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black font-mono text-indigo-400">&lt; 15ms</p>
              <p className="text-xs text-slate-400 mt-1">Inference Latency</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Explainable Scoring</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black font-mono text-purple-400">Zero</p>
              <p className="text-xs text-slate-400 mt-1">Sensitive PAN Storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Architecture Workflow</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">How Fraud Detection Operates</h2>
            <p className="text-sm text-slate-400 mt-2">From raw transaction telemetry to verified risk scores and proactive fraud prevention.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Telemetry Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests transaction amounts, time patterns, velocity frequency, geographical displacement, and device risk metrics without ever touching raw credit card PANs or CVVs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Scikit-learn Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Preprocesses categorical sectors and standardized behavioral deviations through an ensemble Random Forest trained with stratified subsampling on imbalanced fraud distributions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Explainable Risk Verdict</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Outputs probability percentages, risk score (0-100), risk tiers (LOW, MEDIUM, HIGH, CRITICAL), top contributing drivers, and clear action recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Statement */}
      <section className="py-16 border-t border-slate-800/60 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800">
            <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Privacy & Security First Architecture</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
              This system does not require, accept, or store sensitive credit card credentials (full PAN, PIN, CVV, or bank credentials). Machine learning inference is strictly computed on synthetic behavioral and financial telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-400">
        <p>FraudGuard AI - Production-Style Credit Card Fraud Detection Web Application</p>
        <p className="mt-1 font-mono text-[10px] text-slate-400">FastAPI &bull; React &bull; Scikit-learn &bull; Tailwind CSS &bull; SQLite</p>
      </footer>
    </div>
  );
};
