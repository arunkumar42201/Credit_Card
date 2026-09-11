import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Zap, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { predictionService } from '../services/predictionService';
import { PredictionCard } from '../components/PredictionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AnalyzeTransaction = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      amount: 45.50,
      transaction_time_hour: 14,
      transaction_frequency_24h: 2,
      merchant_category: 'grocery',
      merchant_name: 'Whole Foods Market',
      location_risk_score: 0.08,
      device_risk_score: 0.05,
      distance_from_prev_km: 3.5,
      prev_amount_ratio: 0.95,
      account_age_days: 640,
      failed_transactions_24h: 0,
      is_international: 0,
      is_online: 1,
      notes: 'Customer weekly grocery purchase'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        amount: parseFloat(data.amount),
        transaction_time_hour: parseInt(data.transaction_time_hour),
        transaction_frequency_24h: parseInt(data.transaction_frequency_24h),
        merchant_category: data.merchant_category,
        merchant_name: data.merchant_name || null,
        location_risk_score: parseFloat(data.location_risk_score),
        device_risk_score: parseFloat(data.device_risk_score),
        distance_from_prev_km: parseFloat(data.distance_from_prev_km),
        prev_amount_ratio: parseFloat(data.prev_amount_ratio),
        account_age_days: parseInt(data.account_age_days),
        failed_transactions_24h: parseInt(data.failed_transactions_24h),
        is_international: parseInt(data.is_international),
        is_online: parseInt(data.is_online),
        notes: data.notes || null,
      };

      const res = await predictionService.predict(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Error occurred while scoring transaction.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Preset Scenarios
  const applyPreset = (presetType) => {
    if (presetType === 'legit') {
      setValue('amount', 32.50);
      setValue('transaction_time_hour', 13);
      setValue('transaction_frequency_24h', 1);
      setValue('merchant_category', 'dining');
      setValue('merchant_name', 'Chipotle Mexican Grill');
      setValue('location_risk_score', 0.05);
      setValue('device_risk_score', 0.04);
      setValue('distance_from_prev_km', 2.0);
      setValue('prev_amount_ratio', 0.85);
      setValue('account_age_days', 800);
      setValue('failed_transactions_24h', 0);
      setValue('is_international', 0);
      setValue('is_online', 0);
      setValue('notes', 'Routine local lunch purchase');
    } else if (presetType === 'suspicious') {
      setValue('amount', 650.00);
      setValue('transaction_time_hour', 23);
      setValue('transaction_frequency_24h', 6);
      setValue('merchant_category', 'clothing');
      setValue('merchant_name', 'Nordstrom Online');
      setValue('location_risk_score', 0.45);
      setValue('device_risk_score', 0.40);
      setValue('distance_from_prev_km', 180.0);
      setValue('prev_amount_ratio', 2.9);
      setValue('account_age_days', 120);
      setValue('failed_transactions_24h', 1);
      setValue('is_international', 0);
      setValue('is_online', 1);
      setValue('notes', 'Sudden evening order with minor distance shift');
    } else if (presetType === 'fraud') {
      setValue('amount', 3850.00);
      setValue('transaction_time_hour', 3);
      setValue('transaction_frequency_24h', 12);
      setValue('merchant_category', 'electronics');
      setValue('merchant_name', 'TechWarehouse Direct');
      setValue('location_risk_score', 0.92);
      setValue('device_risk_score', 0.88);
      setValue('distance_from_prev_km', 2850.0);
      setValue('prev_amount_ratio', 9.5);
      setValue('account_age_days', 14);
      setValue('failed_transactions_24h', 3);
      setValue('is_international', 1);
      setValue('is_online', 1);
      setValue('notes', 'Multiple failed authorization attempts, overnight spike');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Analyze Transaction</h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit behavioral telemetry to generate real-time fraud probabilities, risk score rankings, and actionable insights.
        </p>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">1-Click Test Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('legit')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors"
          >
            Legitimate Dining ($32.50)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('suspicious')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-semibold transition-colors"
          >
            Suspicious Surge ($650.00)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('fraud')}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
          >
            Critical Fraud Anomaly ($3,850.00)
          </button>
        </div>
      </div>

      {/* Form and Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transaction Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { required: true, min: 0.01 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Merchant Category *
                </label>
                <select
                  {...register('merchant_category', { required: true })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none capitalize"
                >
                  <option value="grocery">Grocery & Supermarket</option>
                  <option value="electronics">Electronics & Gadgets</option>
                  <option value="travel">Airlines & Travel</option>
                  <option value="dining">Restaurants & Dining</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="entertainment">Entertainment & Media</option>
                  <option value="gas_transport">Gas & Transit</option>
                  <option value="health_beauty">Health & Beauty</option>
                  <option value="utilities">Utilities & Bills</option>
                  <option value="retail">General Retail</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transaction Time (Hour: 0–23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  {...register('transaction_time_hour')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Velocity Frequency (Last 24h)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  {...register('transaction_frequency_24h')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Location / IP Risk Score (0.0 to 1.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register('location_risk_score')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Device Fingerprint Risk (0.0 to 1.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register('device_risk_score')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Distance From Prior Txn (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('distance_from_prev_km')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ratio to 30-Day Avg Amount
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register('prev_amount_ratio')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Age (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('account_age_days')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Failed Attempts (Last 24h)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  {...register('failed_transactions_24h')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  International Transaction
                </label>
                <select
                  {...register('is_international')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="0">Domestic (0)</option>
                  <option value="1">International Foreign (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Online E-Commerce
                </label>
                <select
                  {...register('is_online')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">Online (Web / App)</option>
                  <option value="0">Physical POS Terminal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Merchant Business Name & Notes (Optional)
              </label>
              <input
                type="text"
                {...register('notes')}
                placeholder="e.g. Flight booking JFK to LHR"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Scoring with Scikit-learn Pipeline...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute ML Fraud Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {loading ? (
            <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px]">
              <LoadingSpinner size="lg" text="Extracting features & evaluating ensemble model..." />
            </div>
          ) : result ? (
            <PredictionCard result={result} onReset={() => setResult(null)} />
          ) : (
            <div className="h-full bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[350px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white">Awaiting Input</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1.5">
                Fill the transaction parameters or select a 1-click test scenario above to evaluate risk in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
