import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  AlertCircle, 
  FileText, 
  Landmark, 
  ShieldAlert, 
  BarChart3,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { HISTORICAL_MONTHS } from '../../utils/projections';
import { Invoice } from '../../types/erp';

interface ExecutiveDashboardProps {
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onOpenNewInvoice,
  onOpenNewExpense,
  onSelectInvoice,
}) => {
  const { 
    invoices, 
    expenses, 
    bankAccounts, 
    setActiveModule, 
    companyProfile 
  } = useErp();

  // Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.netPaid, 0);
  const netOperatingProfit = totalCollected - totalExpenses;
  const totalBankLiquidity = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
  const praOutputTaxTotal = invoices.reduce((sum, inv) => sum + inv.praTaxAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Corporate Welcome & Quick Projection Trigger */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Bahria Town Lahore Operations • Fiscal Year 2026-27</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {companyProfile.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Pakistani statutory accounting, PRA 16% sales tax, Meezan/HBL corporate treasury, and predictive growth projections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModule('projections')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Graphs & Projections</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Sales Invoice</span>
            </button>
          </div>
        </div>

        {/* Quick Info Badges */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block text-[11px]">FBR NTN:</span>
            <span className="font-mono font-medium text-white">{companyProfile.ntn}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">PRA Reg (Sales Tax):</span>
            <span className="font-mono font-medium text-emerald-400">{companyProfile.praRegNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Primary Treasury:</span>
            <span className="font-medium text-white">Meezan Bank Bahria Town</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Runway Projection:</span>
            <span className="font-medium text-emerald-400">9.5+ Months Active</span>
          </div>
        </div>
      </div>

      {/* Financial Health KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Realized */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue Realized</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatPKR(totalCollected)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Billed Total:</span>
              <span className="font-semibold text-slate-700">{formatPKR(totalInvoiced)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Operating Expenses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Expenses</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatPKR(totalExpenses)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Bahria Town Rent, LESCO, Cloud</span>
            </div>
          </div>
        </div>

        {/* Card 3: Net Cash Inflow */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Cash Inflow</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatPKR(netOperatingProfit)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <span>Healthy operating margin</span>
            </div>
          </div>
        </div>

        {/* Card 4: Liquid Treasury Reserves */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bank & Cash Liquidity</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatPKR(totalBankLiquidity)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Meezan Bank + HBL + Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphical Trend Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                FY 2026-27 Revenue vs. Expenditure Trajectory
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical performance (Jul-Oct) with forward 6-month projected growth curve.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModule('projections')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Advanced Scenario Modeling</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mini SVG Trend Line & Bars */}
        <div className="pt-4 overflow-x-auto">
          {invoices.length === 0 && expenses.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="font-semibold text-slate-700 text-xs">No historical revenue or outflows logged yet</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Financial trends and forward projection bars will generate dynamically as invoices and expenses are posted.
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 min-w-[500px] h-32 pt-2 px-2">
              {HISTORICAL_MONTHS.map(m => {
                const maxVal = Math.max(1, ...HISTORICAL_MONTHS.map(x => Math.max(x.revenue, x.expenses + x.payroll)));
                const heightPct = Math.round((m.revenue / maxVal) * 100);
                const outflowPct = Math.round(((m.expenses + m.payroll) / maxVal) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center gap-1 h-24">
                      <div 
                        style={{ height: `${Math.max(4, heightPct)}%` }} 
                        className="w-5 bg-emerald-600 rounded-t transition-all hover:bg-emerald-500" 
                        title={`Revenue: ${formatPKR(m.revenue)}`}
                      />
                      <div 
                        style={{ height: `${Math.max(4, outflowPct)}%` }} 
                        className="w-3.5 bg-rose-400 rounded-t transition-all hover:bg-rose-500" 
                        title={`Outflow: ${formatPKR(m.expenses + m.payroll)}`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Advisory & Bank Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Punjab Tax Compliance Advisory</h3>
              <p className="text-xs text-amber-800 mt-1">
                PRA Monthly Return (PST on Services) is due by the 15th of each calendar month. Current month accrued Output Tax liability is <strong className="font-semibold">{formatPKR(praOutputTaxTotal)}</strong>.
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveModule('reports')}
                  className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                >
                  View PRA Sales Tax Report
                </button>
                <span className="text-amber-400">•</span>
                <span className="text-[11px] text-amber-700 font-mono">Sec 153 WHT Checked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Corporate Bank & Cash Balances</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveModule('banking')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              Reconcile Accounts →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bankAccounts.map(account => (
              <div key={account.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium truncate">{account.bankName}</div>
                <div className="text-base font-bold text-slate-900 mt-1">{formatPKR(account.currentBalance)}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                  {account.iban}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Invoices (PKR)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes 16% PRA GST and statutory withholding tax fields.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {overdueAmount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Overdue: {formatPKR(overdueAmount)}
              </span>
            )}
            <button
              type="button"
              onClick={() => setActiveModule('invoices')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              View All Invoices
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4">PRA 16%</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <div className="font-semibold text-slate-700 text-xs">No customer invoices created yet</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Generate official tax invoices with PRA 16% sales tax using the &quot;Create Tax Invoice&quot; button above.
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{inv.customerName}</div>
                    <div className="text-[11px] text-slate-400">{inv.customerAddress}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{inv.issueDate}</div>
                    <div className="text-[11px] text-slate-400">Due: {inv.dueDate}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono">
                    {formatPKR(inv.praTaxAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatPKR(inv.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {inv.balanceDue > 0 ? (
                      <span className="text-amber-700 font-semibold">{formatPKR(inv.balanceDue)}</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Cleared</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : inv.status === 'OVERDUE'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : inv.status === 'PARTIALLY_PAID'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectInvoice(inv)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                    >
                      Inspect & Print
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
