import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  X, 
  ExternalLink,
  Building,
  DollarSign
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { Expense, PaymentMethod } from '../../types/erp';

interface ExpensesModuleProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({
  isCreateOpen,
  setIsCreateOpen,
}) => {
  const { expenses, addExpense, deleteExpense } = useErp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Office Rent & Society Maintenance');
  const [vendorName, setVendorName] = useState('');
  const [vendorNtn, setVendorNtn] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [salesTaxPaid, setSalesTaxPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNo, setReferenceNo] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const categories = [
    'ALL',
    'Office Rent & Society Maintenance',
    'Electricity & Utilities',
    'Internet & Communications',
    'Cloud Hosting & Software Subscriptions',
    'Fleet Fuel & Local Logistics',
    'Staff Refreshments & Kitchen Pantry',
    'Legal & Audit Fees',
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    addExpense({
      category,
      vendorName: vendorName || 'Direct Vendor',
      vendorNtn: vendorNtn || undefined,
      date: new Date().toISOString().split('T')[0],
      amount,
      salesTaxPaid,
      whtDeducted: 0,
      netPaid: amount,
      paymentMethod,
      referenceNo: referenceNo || `EXP-REF-${Date.now().toString().slice(-5)}`,
      receiptUrl: receiptUrl || undefined,
      description,
      isReconciled: false,
    });

    setIsCreateOpen(false);
    setDescription('');
    setVendorName('');
    setVendorNtn('');
    setAmount(0);
    setSalesTaxPaid(0);
    setReferenceNo('');
    setReceiptUrl('');
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesCat = categoryFilter === 'ALL' || exp.category === categoryFilter;
    const matchesSearch = 
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalFilteredExpense = filteredExpenses.reduce((sum, exp) => sum + exp.netPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Corporate Expense Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track Bahria Town office rent, LESCO electricity, cloud servers, Nayatel internet, and vendor payments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Business Expense</span>
        </button>
      </div>

      {/* Filter and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses, vendors, receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Filtered Spend</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {formatPKR(totalFilteredExpense)}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category & Description</th>
                <th className="py-3 px-4">Vendor & NTN</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Net Amount (PKR)</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="font-semibold text-slate-700 text-sm">No business expenses recorded yet</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Log corporate utility bills, rent, software licenses, or vendor expenses using the button above.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                    {exp.expenseNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {exp.date}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 block w-fit mb-0.5">
                      {exp.category}
                    </span>
                    <div className="text-slate-900 font-medium truncate">{exp.description}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{exp.vendorName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {exp.vendorNtn ? `NTN: ${exp.vendorNtn}` : 'Unregistered'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 font-medium">
                      {exp.paymentMethod.replace('_', ' ')}
                    </span>
                    {exp.referenceNo && (
                      <div className="text-[10px] text-slate-400 font-mono">{exp.referenceNo}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatPKR(exp.netPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {exp.receiptUrl ? (
                      <a
                        href={exp.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Attached
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      aria-label="Delete expense voucher"
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EXPENSE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateExpense}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Record Business Expense Voucher
              </h4>
              <button 
                type="button" 
                aria-label="Close expense modal"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-slate-50"
              >
                {categories.filter(c => c !== 'ALL').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Description / Purpose *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly Commercial rent for Bahria Town Sector C Office"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. LESCO / Bahria Town"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Vendor NTN</label>
                <input
                  type="text"
                  value={vendorNtn}
                  onChange={(e) => setVendorNtn(e.target.value)}
                  placeholder="e.g. 1410281-0"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Total Amount in PKR *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="PKR Amount"
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Sales Tax Paid (PRA/FBR)</label>
                <input
                  type="number"
                  min="0"
                  value={salesTaxPaid || ''}
                  onChange={(e) => setSalesTaxPaid(Number(e.target.value))}
                  placeholder="Optional input tax"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Settlement Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50"
                >
                  <option value="BANK_TRANSFER">Meezan Bank Transfer</option>
                  <option value="CASH">Petty Cash in Hand</option>
                  <option value="CHEQUE">Crossed Cheque</option>
                  <option value="PAY_ORDER">Pay Order</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Transaction Ref / Cheque #</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. MEZN-TRF-001"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Receipt Image Link / Document URL</label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Save Expense Voucher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
