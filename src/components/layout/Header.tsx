import React from 'react';
import { 
  Menu, 
  Search, 
  PlusCircle, 
  Building2, 
  Calendar, 
  Globe2, 
  Receipt,
  LogOut,
  Cloud,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Award
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';
import { SupportedCurrency, DEFAULT_CURRENCIES } from '../../utils/currency';

interface HeaderProps {
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewInvoice, onOpenNewExpense }) => {
  const { 
    setIsSidebarOpen, 
    setActiveModule,
    currentRole, 
    setCurrentRole, 
    globalSearch, 
    setGlobalSearch,
    companyProfile,
    setIsPsebModalOpen,
    selectedCurrency,
    setSelectedCurrency,
    isSupabaseActive,
    autoSyncStatus,
    isSupabaseSyncing,
    logout
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

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 whitespace-nowrap">
            <span className="font-semibold text-slate-800">{companyProfile.name}</span>
            <span>•</span>
            <span className="hidden xl:flex items-center gap-1 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Sector C, Bahria Town Lahore
            </span>
            <span className="hidden xl:inline">•</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
              PRA 16%
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPsebModalOpen(true)}
              title="Click to view official Pakistan Software Export Board (PSEB) Certificate"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>PSEB: {companyProfile.psebRegNo || 'PSEB-REG-2024-8943'}</span>
            </button>
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

        {/* Right: Actions, Currency Switcher & Role Selector */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Supabase Live Cloud Status Badge */}
          {isSupabaseActive && (
            <div className="flex items-center">
              {autoSyncStatus === 'tables_needed' ? (
                <button
                  type="button"
                  onClick={() => setActiveModule('settings')}
                  title="Supabase project is connected, but database tables need to be created. Click to run 1-click SQL setup."
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-black font-black text-[11px] tracking-wide border border-black shadow-xs cursor-pointer animate-pulse transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-black" />
                  <span className="hidden sm:inline">SQL Tables Needed</span>
                  <span className="sm:hidden">SQL</span>
                </button>
              ) : autoSyncStatus === 'syncing' || isSupabaseSyncing ? (
                <div 
                  title="Automatically syncing latest ERP changes to Supabase PostgreSQL database in background..."
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span className="hidden sm:inline">Auto-Syncing...</span>
                </div>
              ) : autoSyncStatus === 'synced' ? (
                <button
                  type="button"
                  onClick={() => setActiveModule('settings')}
                  title="Live Auto-Sync Active: All invoices and ERP changes persist automatically to Supabase. Click to view settings."
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
                  <span>Auto-Synced</span>
                </button>
              ) : autoSyncStatus === 'error' ? (
                <button
                  type="button"
                  onClick={() => setActiveModule('settings')}
                  title="Auto-sync encountered an issue. Click to inspect Supabase settings."
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sync Alert</span>
                </button>
              ) : null}
            </div>
          )}

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

          {/* Currency Switcher */}
          <div className="flex items-center border-l border-slate-200 pl-3 space-x-1.5">
            <Globe2 className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as SupportedCurrency)}
              className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              aria-label="Select display currency"
            >
              {(Object.keys(DEFAULT_CURRENCIES) as SupportedCurrency[]).map((code) => {
                const info = DEFAULT_CURRENCIES[code];
                return (
                  <option key={code} value={code}>
                    {info.flag} {code} ({info.symbol})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Single Admin Identity & Logout */}
          <div className="flex items-center border-l border-slate-200 pl-3 space-x-2">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-none">Root Admin</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Exclusive Access</span>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Lock ERP and return to Brutalist Login Gate"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-black hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-black transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Lock ERP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
