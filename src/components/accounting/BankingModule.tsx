import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  Building2, 
  CreditCard 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { BankAccount, BankTransaction } from '../../types/erp';

export const BankingModule: React.FC = () => {
  const { 
    bankAccounts, 
    bankTransactions, 
    addBankTransaction, 
    reconcileBankTransaction 
  } = useErp();

  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [showTxModal, setShowTxModal] = useState(false);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  // New Transaction Form
  const [txType, setTxType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [refNo, setRefNo] = useState('');

  const activeAccount = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];
  const activeTransactions = bankTransactions.filter(tx => tx.bankAccountId === activeAccount?.id);

  const totalBankLiquidity = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

  const handleCopy = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(iban);
    setTimeout(() => setCopiedIban(null), 2000);
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !activeAccount) return;

    const isDeposit = txType === 'DEBIT';
    const newRunning = isDeposit 
      ? activeAccount.currentBalance + amount 
      : activeAccount.currentBalance - amount;

    addBankTransaction({
      bankAccountId: activeAccount.id,
      date: new Date().toISOString().split('T')[0],
      description,
      referenceNo: refNo || `TX-${Date.now().toString().slice(-6)}`,
      debit: isDeposit ? amount : 0,
      credit: isDeposit ? 0 : amount,
      runningBalance: newRunning,
      isReconciled: true,
    });

    // Update active bank balance
    activeAccount.currentBalance = newRunning;

    setShowTxModal(false);
    setDescription('');
    setAmount(0);
    setRefNo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            Corporate Treasury & Bank Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage Meezan Bank (Islamic Banking), HBL, and Petty Cash Vault in Bahria Town Lahore with real-time statement reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowTxModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Bank Entry</span>
          </button>
        </div>
      </div>

      {/* Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bankAccounts.map(account => {
          const isSelected = account.id === selectedBankId;
          return (
            <div
              key={account.id}
              onClick={() => setSelectedBankId(account.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {account.bankName}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  PKR
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold truncate">{account.accountTitle}</div>
                <div className={`text-2xl font-bold font-mono mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {formatPKR(account.currentBalance)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                <div className="font-mono text-[11px] opacity-80 truncate max-w-[180px]">
                  {account.iban}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(account.iban);
                  }}
                  className={`p-1 rounded hover:bg-slate-800/80 transition-colors ${
                    copiedIban === account.iban ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                  title="Copy IBAN"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Account Detail & Reconciliation Statement */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900">
                {activeAccount?.accountTitle}
              </h3>
              <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Branch: {activeAccount?.branchName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Reconcile&quot; to verify internal general ledger against actual bank electronic statements.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Ledger Balance:</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatPKR(activeAccount?.currentBalance || 0)}
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description / Narration</th>
                <th className="py-3 px-4">Reference / Raast #</th>
                <th className="py-3 px-4 text-right text-emerald-700">Deposit (Debit)</th>
                <th className="py-3 px-4 text-right text-rose-700">Withdrawal (Credit)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
                <th className="py-3 px-4 text-center">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions recorded for this account.
                  </td>
                </tr>
              ) : (
                activeTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {tx.referenceNo}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                      {tx.debit > 0 ? formatPKR(tx.debit) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-700">
                      {tx.credit > 0 ? formatPKR(tx.credit) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatPKR(tx.runningBalance)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => reconcileBankTransaction(tx.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                          tx.isReconciled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {tx.isReconciled ? 'Reconciled' : 'Unmatched'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD TRANSACTION MODAL */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateTx}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Post Bank Transaction Entry
              </h4>
              <button 
                type="button" 
                aria-label="Close bank entry modal"
                onClick={() => setShowTxModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Target Account</label>
              <div className="p-2 bg-slate-100 rounded border border-slate-200 font-semibold text-slate-800">
                {activeAccount?.accountTitle}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Entry Nature</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-semibold"
                >
                  <option value="DEBIT">Deposit / Inflow (Debit)</option>
                  <option value="CREDIT">Withdrawal / Outflow (Credit)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Amount in PKR *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="PKR Amount"
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Description / Memo *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Client deposit / Society electricity bill"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Cheque # or Raast Reference</label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. MEZN-RAAST-77218"
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Post to Bank Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
