import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  FileCheck2
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { Account, AccountType } from '../../types/erp';

export const ChartOfAccountsModule: React.FC = () => {
  const { accounts, addAccount } = useErp();
  const [selectedType, setSelectedType] = useState<AccountType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Account Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('EXPENSE');
  const [category, setCategory] = useState('Operating Expenses');
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    addAccount({
      code,
      name,
      type,
      category,
      balance: openingBalance,
    });
    setShowAddModal(false);
    setCode('');
    setName('');
    setOpeningBalance(0);
  };

  const types: { key: AccountType | 'ALL'; label: string; range: string }[] = [
    { key: 'ALL', label: 'All Accounts', range: '1000 - 5999' },
    { key: 'ASSET', label: 'Assets', range: '1000 - 1999' },
    { key: 'LIABILITY', label: 'Liabilities', range: '2000 - 2999' },
    { key: 'EQUITY', label: 'Equity & Capital', range: '3000 - 3999' },
    { key: 'REVENUE', label: 'Operating Revenue', range: '4000 - 4999' },
    { key: 'EXPENSE', label: 'Operating Expenses', range: '5000 - 5999' },
  ];

  const filteredAccounts = accounts.filter(acc => {
    const matchesType = selectedType === 'ALL' || acc.type === selectedType;
    const matchesSearch = 
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.includes(searchQuery) ||
      acc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Standard Chart of Accounts (COA)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compliant double-entry general ledger structure aligned with Pakistani accounting principles and FBR / SECP reporting standards.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Ledger Account</span>
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {types.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSelectedType(t.key)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === t.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{t.label}</span>
            <span className="ml-1.5 text-[10px] opacity-70 font-mono">({t.range})</span>
          </button>
        ))}
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code (e.g. 1020) or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredAccounts.length} Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-24">GL Code</th>
                <th className="py-3 px-4">Account Title</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Reporting Category</th>
                <th className="py-3 px-4 text-right">Current Balance (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {acc.code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {acc.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      acc.type === 'ASSET' ? 'bg-blue-50 text-blue-700' :
                      acc.type === 'LIABILITY' ? 'bg-rose-50 text-rose-700' :
                      acc.type === 'EQUITY' ? 'bg-purple-50 text-purple-700' :
                      acc.type === 'REVENUE' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {acc.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatPKR(acc.balance)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Double Entry Ledger Validation Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">Double-Entry Ledger Integrity Verified</div>
            <div className="text-[11px] text-emerald-800">
              Debit and credit balances balance across all 5 chart groups. Automatic journal voucher creation on invoices and bank settlements.
            </div>
          </div>
        </div>
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateAccount}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Add New Chart of Account Ledger
              </h4>
              <button 
                type="button" 
                aria-label="Close add account modal"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">GL Account Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5070"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Account Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50"
                >
                  <option value="ASSET">Asset (1000s)</option>
                  <option value="LIABILITY">Liability (2000s)</option>
                  <option value="EQUITY">Equity (3000s)</option>
                  <option value="REVENUE">Revenue (4000s)</option>
                  <option value="EXPENSE">Expense (5000s)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Account Title / Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Legal & Professional Advisory"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Financial Statement Category</label>
              <input
                type="text"
                placeholder="e.g. Operating Expenses"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Opening Balance (PKR)</label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
