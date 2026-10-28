import React, { useState } from 'react';
import { 
  PieChart, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { 
  calculateBalanceSheet, 
  calculateProfitAndLoss, 
  formatPKR 
} from '../../utils/taxCalculations';

export const FinancialReportsModule: React.FC = () => {
  const { accounts, invoices, companyProfile } = useErp();
  const [activeTab, setActiveTab] = useState<'PNL' | 'BALANCE_SHEET' | 'PRA_TAX'>('PNL');

  const pnl = calculateProfitAndLoss(accounts);
  const balanceSheet = calculateBalanceSheet(accounts, pnl.netIncome);

  // PRA Output Tax calculations
  const totalTaxableServices = invoices.reduce((sum, inv) => sum + inv.subTotal, 0);
  const totalPraTaxAccrued = invoices.reduce((sum, inv) => sum + inv.praTaxAmount, 0);
  const totalWhtRetained = invoices.reduce((sum, inv) => sum + inv.withholdingTaxAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            Financial Statements & Tax Filings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Auditable Profit & Loss, Balance Sheet, and PRA (Punjab Revenue Authority) sales tax return summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('PNL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PNL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Profit & Loss (Income Statement)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BALANCE_SHEET')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BALANCE_SHEET'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Balance Sheet (Assets = Liab + Equity)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PRA_TAX')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PRA_TAX'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          PRA Sales Tax (Punjab 16%) & WHT
        </button>
      </div>

      {/* REPORT CONTENT AREA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none">
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
          <div className="text-xl font-black text-slate-900 tracking-tight uppercase">
            {companyProfile.name}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {companyProfile.address}, {companyProfile.city}, {companyProfile.province}, Pakistan
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            NTN: {companyProfile.ntn} • STRN: {companyProfile.strn} • PRA Reg: {companyProfile.praRegNo}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 inline-block">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-800">
              {activeTab === 'PNL' && 'Statement of Profit and Loss (Income Statement)'}
              {activeTab === 'BALANCE_SHEET' && 'Balance Sheet (Statement of Financial Position)'}
              {activeTab === 'PRA_TAX' && 'Punjab Revenue Authority (PRA) Provincial Tax Statement'}
            </span>
            <div className="text-xs text-slate-500 mt-0.5">
              For the Period Ended October 2026 • Currency: Pakistani Rupee (PKR)
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. PROFIT AND LOSS STATEMENT                                      */}
        {/* ================================================================= */}
        {activeTab === 'PNL' && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Revenue Section */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg mb-2">
                1. Operating Revenue (Turnover)
              </div>
              <div className="divide-y divide-slate-100">
                {pnl.revenueAccounts.map(acc => (
                  <div key={acc.id} className="py-2 px-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{acc.code}</span>
                      <span className="font-medium text-slate-900">{acc.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatPKR(acc.balance)}</span>
                  </div>
                ))}
                <div className="py-2.5 px-3 flex justify-between items-center bg-slate-50 font-bold border-t border-slate-300">
                  <span>Total Operating Revenue:</span>
                  <span className="font-mono text-emerald-700 text-sm">{formatPKR(pnl.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg mb-2">
                2. Administrative & Operating Expenses
              </div>
              <div className="divide-y divide-slate-100">
                {pnl.expenseAccounts.map(acc => (
                  <div key={acc.id} className="py-2 px-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{acc.code}</span>
                      <span className="font-medium text-slate-900">{acc.name}</span>
                    </div>
                    <span className="font-mono text-slate-800">{formatPKR(acc.balance)}</span>
                  </div>
                ))}
                <div className="py-2.5 px-3 flex justify-between items-center bg-slate-50 font-bold border-t border-slate-300">
                  <span>Total Operating Expenses:</span>
                  <span className="font-mono text-rose-700 text-sm">{formatPKR(pnl.totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-sm font-bold tracking-tight block">Net Operating Profit (EBIT)</span>
                <span className="text-[11px] text-emerald-400">Profit Margin: {pnl.netProfitMargin}%</span>
              </div>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatPKR(pnl.netIncome)}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. BALANCE SHEET                                                  */}
        {/* ================================================================= */}
        {activeTab === 'BALANCE_SHEET' && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* ASSETS */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg mb-2">
                Assets
              </div>
              <div className="divide-y divide-slate-100">
                {balanceSheet.assetAccounts.map(acc => (
                  <div key={acc.id} className="py-2 px-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{acc.code}</span>
                      <span className="font-medium text-slate-900">{acc.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatPKR(acc.balance)}</span>
                  </div>
                ))}
                <div className="py-2.5 px-3 flex justify-between items-center bg-emerald-50 text-emerald-950 font-bold border-t border-emerald-200">
                  <span>Total Assets:</span>
                  <span className="font-mono text-sm">{formatPKR(balanceSheet.totalAssets)}</span>
                </div>
              </div>
            </div>

            {/* LIABILITIES */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg mb-2">
                Liabilities
              </div>
              <div className="divide-y divide-slate-100">
                {balanceSheet.liabilityAccounts.map(acc => (
                  <div key={acc.id} className="py-2 px-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{acc.code}</span>
                      <span className="font-medium text-slate-900">{acc.name}</span>
                    </div>
                    <span className="font-mono text-slate-800">{formatPKR(acc.balance)}</span>
                  </div>
                ))}
                <div className="py-2.5 px-3 flex justify-between items-center bg-slate-50 font-bold border-t border-slate-300">
                  <span>Total Liabilities:</span>
                  <span className="font-mono text-sm">{formatPKR(balanceSheet.totalLiabilities)}</span>
                </div>
              </div>
            </div>

            {/* EQUITY */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg mb-2">
                Equity & Reserves
              </div>
              <div className="divide-y divide-slate-100">
                {balanceSheet.equityAccounts.map(acc => (
                  <div key={acc.id} className="py-2 px-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{acc.code}</span>
                      <span className="font-medium text-slate-900">{acc.name}</span>
                    </div>
                    <span className="font-mono text-slate-800">{formatPKR(acc.balance)}</span>
                  </div>
                ))}
                <div className="py-2 px-3 flex justify-between items-center">
                  <span className="font-medium text-emerald-800">Current Period Retained Net Earnings</span>
                  <span className="font-mono text-emerald-800 font-bold">{formatPKR(pnl.netIncome)}</span>
                </div>
                <div className="py-2.5 px-3 flex justify-between items-center bg-slate-50 font-bold border-t border-slate-300">
                  <span>Total Equity:</span>
                  <span className="font-mono text-sm">{formatPKR(balanceSheet.totalEquity)}</span>
                </div>
              </div>
            </div>

            {/* Equation Balance Check */}
            <div className={`p-4 rounded-xl flex items-center justify-between font-bold ${
              balanceSheet.isBalanced 
                ? 'bg-emerald-900 text-white' 
                : 'bg-rose-900 text-white'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Total Liabilities and Stockholders&apos; Equity:</span>
              </div>
              <span className="font-mono text-base">{formatPKR(balanceSheet.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. PRA & FBR STATUTORY TAX STATEMENT                              */}
        {/* ================================================================= */}
        {activeTab === 'PRA_TAX' && (
          <div className="space-y-6 text-xs text-slate-800">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h4 className="font-bold text-sm text-emerald-950 mb-1">
                Punjab Sales Tax on Services (Punjab Revenue Authority - PRA)
              </h4>
              <p className="text-emerald-800 text-xs">
                Under Punjab Sales Tax on Services Act 2012, IT services & consulting rendered in Lahore are subject to 16% standard rate. Monthly return Annexure-C must be submitted by 15th of each month.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Services Billed:</span>
                <span className="text-lg font-bold font-mono text-slate-900">{formatPKR(totalTaxableServices)}</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[11px] text-emerald-800 block font-semibold">PRA Output Tax (16%):</span>
                <span className="text-lg font-bold font-mono text-emerald-900">{formatPKR(totalPraTaxAccrued)}</span>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[11px] text-blue-800 block font-semibold">FBR WHT Retained (Sec 153):</span>
                <span className="text-lg font-bold font-mono text-blue-900">{formatPKR(totalWhtRetained)}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Customer NTN / STRN</th>
                    <th className="py-2.5 px-4 text-right">Service Value (PKR)</th>
                    <th className="py-2.5 px-4 text-right">PRA 16% Tax</th>
                    <th className="py-2.5 px-4 text-center">Filer Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{inv.customerName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {inv.customerNtn || 'Unregistered'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatPKR(inv.subTotal)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatPKR(inv.praTaxAmount)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Active Filer
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
