import React from 'react';
import { 
  Menu, 
  Search, 
  PlusCircle, 
  Building2, 
  Calendar, 
  Globe2, 
  Receipt 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';

interface HeaderProps {
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewInvoice, onOpenNewExpense }) => {
  const { 
    setIsSidebarOpen, 
    currentRole, 
    setCurrentRole, 
    globalSearch, 
    setGlobalSearch,
    companyProfile 
  } = useErp();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & breadcrumb / location */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            aria-label="Open navigation sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{companyProfile.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Sector C, Bahria Town Lahore
            </span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
              PRA: 16% Active
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices, clients, expenses, ledger accounts..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Actions, Fiscal Year & Role Selector */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Buttons */}
          <button
            type="button"
            onClick={onOpenNewExpense}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Log Expense</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center border-l border-slate-200 pl-3 space-x-1.5">
            <span className="text-[11px] font-medium text-slate-500 hidden xl:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              aria-label="Select active user role"
            >
              <option value="ADMIN">Admin (CFO / Director)</option>
              <option value="ACCOUNTANT">Accountant (Full Finance)</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="EMPLOYEE">Employee (Self-Service)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
