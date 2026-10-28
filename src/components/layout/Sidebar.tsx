import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  BookOpen, 
  Landmark, 
  PieChart, 
  Users, 
  Banknote, 
  CalendarDays, 
  Laptop, 
  X, 
  ShieldCheck, 
  MapPin, 
  BadgeCheck 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { ActiveModule } from '../../types/erp';

export const Sidebar: React.FC = () => {
  const { 
    activeModule, 
    setActiveModule, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    invoices, 
    currentRole,
    leaveRequests 
  } = useErp();

  const pendingInvoicesCount = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'PENDING').length;

  const navItems: {
    id: ActiveModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    section: 'finance' | 'hr';
  }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, section: 'finance' },
    { id: 'projections', label: 'Graphs & Projections', icon: PieChart, section: 'finance' },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText, badge: pendingInvoicesCount, section: 'finance' },
    { id: 'expenses', label: 'Expense Management', icon: Receipt, section: 'finance' },
    { id: 'accounts', label: 'Chart of Accounts', icon: BookOpen, section: 'finance' },
    { id: 'banking', label: 'Bank & Cash Accounts', icon: Landmark, section: 'finance' },
    { id: 'reports', label: 'Financial Statements', icon: PieChart, section: 'finance' },
    
    // Human Resources & Payroll
    { id: 'employees', label: 'Employee Directory', icon: Users, section: 'hr' },
    { id: 'attendance', label: 'Attendance & Leaves', icon: CalendarDays, badge: pendingLeavesCount, section: 'hr' },
    { id: 'assets', label: 'Company Asset Fleet', icon: Laptop, section: 'hr' },
    { id: 'payroll', label: 'Statutory Payroll Engine', icon: Banknote, section: 'hr' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold text-lg ring-1 ring-emerald-400/30">
              F
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-white">FAFAB Limited</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  ERP
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-400 space-x-1">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Bahria Town, Lahore</span>
              </div>
            </div>
          </div>
          <button 
            type="button"
            aria-label="Close navigation sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pakistani Tax Compliance Strip */}
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[11px] font-semibold text-slate-200">FBR, PRA & EOBI Compliant</div>
              <div className="text-[10px] text-slate-400 font-mono">NTN: 8943210-7 • SECP</div>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Accounting & Finance Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Accounting & Finance
            </div>
            <nav className="space-y-1">
              {navItems.filter(item => item.section === 'finance').map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive 
                          ? 'bg-emerald-800 text-white' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* HR & Payroll Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Human Resources & Payroll
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                Punjab Labor
              </span>
            </div>
            <nav className="space-y-1">
              {navItems.filter(item => item.section === 'hr').map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive 
                          ? 'bg-emerald-800 text-white' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Role Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/70 border border-slate-700/60">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-emerald-400 border border-slate-600">
              {currentRole === 'ADMIN' ? 'AD' : currentRole === 'ACCOUNTANT' ? 'AC' : currentRole === 'HR_MANAGER' ? 'HR' : 'EM'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate flex items-center space-x-1">
                <span>Talha Mahmood</span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {currentRole === 'ADMIN' && 'Chief Financial Officer (Admin)'}
                {currentRole === 'ACCOUNTANT' && 'Senior Accountant'}
                {currentRole === 'HR_MANAGER' && 'HR Operations Manager'}
                {currentRole === 'EMPLOYEE' && 'Employee Self-Service'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
