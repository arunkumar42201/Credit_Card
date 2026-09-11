import React, { useState } from 'react';
import { RiskBadge } from './RiskBadge';
import { Search, Filter, Eye, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const TransactionTable = ({ transactions = [], onDelete, onInspect, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter
  const filtered = transactions.filter((txn) => {
    const matchesSearch =
      (txn.id && txn.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.merchant_category && txn.merchant_category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.notes && txn.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk =
      riskFilter === 'ALL' ||
      (txn.prediction && txn.prediction.risk_level === riskFilter);

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (txn.merchant_category && txn.merchant_category.toLowerCase() === categoryFilter.toLowerCase());

    return matchesSearch && matchesRisk && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories = Array.from(new Set(transactions.map((t) => t.merchant_category).filter(Boolean)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Controls Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, Category, Notes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Prediction</th>
              <th className="px-4 py-3">Risk Level</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  Loading transactions...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No matching transactions found.
                </td>
              </tr>
            ) : (
              paginated.map((txn) => {
                const pred = txn.prediction;
                return (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-400">
                      {txn.id}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(txn.created_at).toLocaleDateString()} {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      ${Number(txn.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">
                      {txn.merchant_category || 'Retail'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${
                        pred?.prediction === 'Fraudulent' ? 'text-rose-400' :
                        pred?.prediction === 'Suspicious' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {pred?.prediction || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {pred ? (
                        <RiskBadge level={pred.risk_level} score={pred.risk_score} />
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspect && onInspect(txn)}
                          title="Inspect Details"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(txn.id)}
                            title="Delete Transaction"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white">{Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
          <span className="font-semibold text-white">{Math.min(filtered.length, currentPage * pageSize)}</span> of{' '}
          <span className="font-semibold text-white">{filtered.length}</span> transactions
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
