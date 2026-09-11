import React, { useState, useEffect } from 'react';
import { History, Download, RefreshCw } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionModal } from '../components/TransactionModal';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getTransactions({ limit: 200 });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete transaction ${id}?`)) {
      try {
        await analyticsService.deleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete transaction');
      }
    }
  };

  const handleExportCSV = () => {
    if (!transactions.length) return;

    const headers = ['Transaction ID', 'Created At', 'Amount', 'Category', 'Prediction', 'Probability', 'Risk Level', 'Risk Score'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.created_at}"`,
      t.amount,
      `"${t.merchant_category || ''}"`,
      t.prediction?.prediction || '',
      t.prediction?.probability ?? '',
      t.prediction?.risk_level || '',
      t.prediction?.risk_score ?? ''
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_history_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, inspect, and export all scored transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactions}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <TransactionTable
        transactions={transactions}
        loading={loading}
        onInspect={(txn) => setSelectedTxn(txn)}
        onDelete={handleDelete}
      />

      {selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
};
