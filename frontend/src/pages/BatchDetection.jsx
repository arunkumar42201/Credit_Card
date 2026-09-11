import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Activity,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Search,
  Eye,
  FileText
} from 'lucide-react';
import { predictionService } from '../services/predictionService';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const BatchDetection = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Please choose a valid .csv file');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (!dropped.name.endsWith('.csv')) {
        setError('Please drop a valid .csv file');
        return;
      }
      setFile(dropped);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await predictionService.predictBatch(formData, (progress) => {
        setUploadProgress(progress);
      });
      setBatchResult(res);
    } catch (err) {
      setError(err.message || 'Batch processing failed. Check your CSV column headers.');
    } finally {
      setLoading(false);
    }
  };

  // Export Results as CSV
  const handleExportCSV = () => {
    if (!batchResult || !batchResult.results) return;

    const headers = ['Row', 'Transaction ID', 'Amount', 'Category', 'Prediction', 'Probability', 'Risk Score', 'Risk Level', 'Recommendation'];
    const rows = batchResult.results.map((r) => [
      r.row_index,
      r.transaction_id,
      r.amount,
      `"${r.merchant_category}"`,
      r.prediction,
      r.probability,
      r.risk_score,
      r.risk_level,
      `"${r.recommendation.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fraud_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter batch results
  const filteredResults = (batchResult?.results || []).filter((r) => {
    const matchesSearch =
      r.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.merchant_category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || r.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Batch Fraud Detection</h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload CSV datasets to run high-throughput machine learning inference across multiple transactions.
          </p>
        </div>

        {/* Download Sample CSV */}
        <a
          href="/sample_batch_transactions.csv"
          download="sample_batch_transactions.csv"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Sample CSV Template</span>
        </a>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            {file ? file.name : 'Drag and drop your transaction CSV here'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB — Ready to upload and score`
              : 'Or click to browse from your computer. Standard format with amount, category, and behavioral metrics.'}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action button & progress */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Supported columns: <span className="font-mono text-slate-300">amount, merchant_category, location_risk_score, etc.</span>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center gap-2"
          >
            {loading ? (
              <span>Running ML Batch Inference...</span>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Start Batch Analysis</span>
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Processing data & scoring with Random Forest pipeline...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {batchResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Processed"
              value={batchResult.total_processed}
              subtitle="Total rows in batch"
              icon={Activity}
              color="indigo"
            />
            <StatCard
              title="Legitimate"
              value={batchResult.legitimate_count}
              subtitle="Approved transactions"
              icon={ShieldCheck}
              color="emerald"
            />
            <StatCard
              title="Suspicious"
              value={batchResult.suspicious_count}
              subtitle="Step-up review"
              icon={AlertTriangle}
              color="amber"
            />
            <StatCard
              title="Fraudulent"
              value={batchResult.fraudulent_count}
              subtitle={`${batchResult.fraud_percentage}% of batch`}
              icon={Flame}
              color="rose"
            />
            <StatCard
              title="Avg Risk Score"
              value={`${batchResult.average_risk_score} / 100`}
              subtitle="Batch ensemble mean"
              icon={CheckCircle2}
              color="cyan"
            />
          </div>

          {/* Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter batch results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Results CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Row</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Prediction</th>
                    <th className="px-4 py-3">Risk Level</th>
                    <th className="px-4 py-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredResults.map((r) => (
                    <tr key={r.transaction_id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-slate-400">#{r.row_index}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-400">{r.transaction_id}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">${r.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 capitalize text-slate-300">{r.merchant_category}</td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={
                          r.prediction === 'Fraudulent' ? 'text-rose-400' :
                          r.prediction === 'Suspicious' ? 'text-amber-400' : 'text-emerald-400'
                        }>
                          {r.prediction}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={r.risk_level} score={r.risk_score} />
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={r.recommendation}>
                        {r.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
