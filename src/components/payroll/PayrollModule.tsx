import React, { useState } from 'react';
import { 
  Banknote, 
  Play, 
  CheckCircle, 
  Printer, 
  ShieldCheck, 
  Eye, 
  Building2, 
  CreditCard, 
  X, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { PayrollRecord } from '../../types/erp';

export const PayrollModule: React.FC = () => {
  const { 
    currentPayrollPeriod, 
    runMonthlyPayroll, 
    disbursePayrollPeriod, 
    selectedPayslip, 
    setSelectedPayslip, 
    companyProfile,
    currentRole 
  } = useErp();

  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      runMonthlyPayroll(selectedMonth, selectedYear);
      setIsProcessing(false);
    }, 400);
  };

  const handleDisburseSalaries = () => {
    if (window.confirm(`Confirm direct bank transfer of ${formatPKR(currentPayrollPeriod.totalNetPayable)} from Meezan Bank Bahria Town operating account?`)) {
      disbursePayrollPeriod(currentPayrollPeriod.id);
    }
  };

  const canDisburse = (currentRole === 'ADMIN' || currentRole === 'ACCOUNTANT') && currentPayrollPeriod.status === 'PROCESSED';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            Statutory Payroll Engine & Salary Disbursements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automates Punjab statutory deductions: EOBI (1% employee + 5% employer), PESSI (6% employer), and FBR Section 149 income tax slabs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunPayroll}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isProcessing ? 'Calculating...' : 'Recalculate Monthly Payroll'}</span>
          </button>

          {currentPayrollPeriod.status === 'PROCESSED' && (
            <button
              type="button"
              onClick={handleDisburseSalaries}
              disabled={!canDisburse}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Disburse via Meezan Bank</span>
            </button>
          )}

          {currentPayrollPeriod.status === 'PAID' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
              <CheckCircle className="w-4 h-4" />
              <span>Salaries Disbursed</span>
            </span>
          )}
        </div>
      </div>

      {/* Statutory Payroll KPI Cards (PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Gross Salaries</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatPKR(currentPayrollPeriod.totalGross)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fixed packages & allowances</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">FBR Tax Withheld (Sec 149)</span>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            {formatPKR(currentPayrollPeriod.totalTaxDeducted)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Remitted to FBR treasury</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">EOBI Contributions</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {formatPKR(currentPayrollPeriod.totalEobiEmployee + currentPayrollPeriod.totalEobiEmployer)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Emp: {formatPKR(currentPayrollPeriod.totalEobiEmployee)} • Empr: {formatPKR(currentPayrollPeriod.totalEobiEmployer)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">PESSI Social Security</span>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1">
            {formatPKR(currentPayrollPeriod.totalPessiEmployer)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">6% employer Punjab contribution</div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Net Salaries Payable</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatPKR(currentPayrollPeriod.totalNetPayable)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Meezan Bank Direct Wire</div>
        </div>
      </div>

      {/* Statutory Compliance Notice Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <div className="font-bold text-emerald-950">
              Punjab Statutory Payroll Rules Enforced for {currentPayrollPeriod.periodName}
            </div>
            <div className="text-emerald-800 text-[11px]">
              Minimum Wage: PKR 37,000. EOBI Employee Deduction: PKR 370 / month. Employer EOBI: PKR 1,850 / month. PESSI 6% social security capped per Punjab rules.
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
          FBR Slabs Active
        </span>
      </div>

      {/* Payroll Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Monthly Salary Register — {currentPayrollPeriod.periodName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual staff allowances, tax withholding, and take-home pay.
            </p>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            Total Staff: <strong>{currentPayrollPeriod.records.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">CNIC</th>
                <th className="py-3 px-4 text-right">Gross Package</th>
                <th className="py-3 px-4 text-right">Basic (50%)</th>
                <th className="py-3 px-4 text-right text-amber-700">EOBI (1%)</th>
                <th className="py-3 px-4 text-right text-blue-700">FBR Tax</th>
                <th className="py-3 px-4 text-right text-rose-700">Total Deduct</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-800">Net Take-Home</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentPayrollPeriod.records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="font-semibold text-slate-700 text-sm">No payroll records generated yet</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Onboard employees in the Employee Directory, then click &quot;Recalculate Monthly Payroll&quot; to generate Punjab statutory salary slips.
                    </div>
                  </td>
                </tr>
              ) : (
                currentPayrollPeriod.records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{record.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {record.employeeCode} • {record.designation}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {record.cnic}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatPKR(record.grossSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatPKR(record.basicSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-amber-800">
                    {formatPKR(record.eobiEmployee)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-blue-800">
                    {formatPKR(record.incomeTaxFbr)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-rose-700">
                    {formatPKR(record.totalDeductions)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                    {formatPKR(record.netSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      record.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPayslip(record)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      View Payslip
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* OFFICIAL SALARY PAYSLIP MODAL (PRINT-READY)                           */}
      {/* ===================================================================== */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">
                  Monthly Payslip: {selectedPayslip.employeeName} ({currentPayrollPeriod.periodName})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Payslip (PDF)
                </button>
                <button
                  type="button"
                  aria-label="Close payslip modal"
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Payslip Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
              {/* Header */}
              <div className="border-b-2 border-emerald-800 pb-5 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-black flex items-center justify-center text-sm">
                      F
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">FAFAB LIMITED</h1>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Plot 12-A, Commercial Area, Sector C, Bahria Town, Lahore, Punjab, Pakistan
                  </p>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    SECP Reg: {companyProfile.registrationNo} • NTN: {companyProfile.ntn} • EOBI Reg: {companyProfile.eobiRegNo}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-emerald-800 uppercase tracking-wider">SALARY PAYSLIP</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">Pay Period: {currentPayrollPeriod.periodName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Disbursement: {selectedPayslip.disbursementDate || '31 Oct 2026'}</div>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <div><strong>Employee Name:</strong> {selectedPayslip.employeeName}</div>
                  <div><strong>Employee Code:</strong> {selectedPayslip.employeeCode}</div>
                  <div><strong>Designation:</strong> {selectedPayslip.designation}</div>
                  <div><strong>Department:</strong> {selectedPayslip.department}</div>
                </div>

                <div className="space-y-1">
                  <div><strong>NADRA CNIC:</strong> {selectedPayslip.cnic}</div>
                  <div><strong>Salary Bank:</strong> {selectedPayslip.bankName}</div>
                  <div className="font-mono text-[11px]"><strong>IBAN:</strong> {selectedPayslip.iban}</div>
                  <div><strong>Status:</strong> {selectedPayslip.status}</div>
                </div>
              </div>

              {/* Earnings & Deductions Dual Column Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Earnings Column */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">
                    Gross Earnings (PKR)
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary (50%):</span>
                      <span className="font-mono font-medium">{formatPKR(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">House Rent Allowance (45%):</span>
                      <span className="font-mono font-medium">{formatPKR(selectedPayslip.houseRent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Medical Allowance (10%):</span>
                      <span className="font-mono font-medium">{formatPKR(selectedPayslip.medical)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Conveyance Allowance:</span>
                      <span className="font-mono font-medium">{formatPKR(selectedPayslip.conveyance)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Gross Salary:</span>
                      <span className="font-mono text-emerald-800">{formatPKR(selectedPayslip.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">
                    Statutory Deductions (PKR)
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">EOBI Employee (1%):</span>
                      <span className="font-mono font-medium text-amber-800">{formatPKR(selectedPayslip.eobiEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">FBR Income Tax (Sec 149):</span>
                      <span className="font-mono font-medium text-blue-800">{formatPKR(selectedPayslip.incomeTaxFbr)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Other Deductions:</span>
                      <span className="font-mono">Rs. 0.00</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 italic">
                      <span>* Employer EOBI (5%):</span>
                      <span className="font-mono">{formatPKR(selectedPayslip.eobiEmployer)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Employee Deductions:</span>
                      <span className="font-mono text-rose-700">{formatPKR(selectedPayslip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Salary Highlight Box */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Net Take-Home Salary Transferred
                  </span>
                  <div className="text-xs text-emerald-400 mt-0.5">
                    Transferred to {selectedPayslip.bankName} (Raast Reference: {selectedPayslip.paymentReference})
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {formatPKR(selectedPayslip.netSalary)}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
                <div>
                  <div className="w-48 border-b border-slate-400 mx-auto mb-1" />
                  <span className="font-medium">Employee Signature</span>
                </div>
                <div>
                  <div className="w-48 border-b border-slate-400 mx-auto mb-1" />
                  <span className="font-medium">For FAFAB LIMITED (Authorized HR / Finance)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
