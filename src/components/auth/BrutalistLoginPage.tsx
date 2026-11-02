import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Landmark,
  BadgeCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export const BrutalistLoginPage: React.FC = () => {
  const { login, companyProfile } = useErp();
  const [username, setUsername] = useState('admin@fafab.com.pk');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fillFeedback, setFillFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Access Denied: Invalid administrator credentials.');
        setIsSubmitting(false);
      }
    }, 250);
  };

  const handleQuickFill = () => {
    setUsername('admin@fafab.com.pk');
    setPassword('admin');
    setFillFeedback(true);
    setErrorMessage('');
    setTimeout(() => setFillFeedback(false), 2200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient Emerald & Slate Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-gradient-to-b from-emerald-600/20 via-teal-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#34d399 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Corporate Status Bar */}
      <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200 tracking-wide">
            {companyProfile.name || 'FAFAB LIMITED'} · ENTERPRISE ERP GATEWAY
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {companyProfile.city || 'Bahria Town, Lahore, Punjab, Pakistan'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="hidden sm:inline">SECP Reg: <strong className="text-slate-200 font-mono">0192847</strong></span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="hidden sm:inline">FBR NTN: <strong className="text-slate-200 font-mono">8943210-7</strong></span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            PRA 16% Active
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-lg">
          {/* Main Card Container */}
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-200/80 overflow-hidden">
            {/* Header Section */}
            <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-800 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold text-xl ring-1 ring-emerald-400/40 shrink-0">
                    F
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
                        {companyProfile.name || 'FAFAB LIMITED'}
                      </h1>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        ERP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enterprise Financials, Invoicing & Payroll Engine
                    </p>
                  </div>
                </div>

                <div className="hidden xs:flex flex-col items-end">
                  <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wide bg-emerald-950 text-emerald-300 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    SINGLE ADMIN
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">v2026.4</span>
                </div>
              </div>

              {/* Single Admin Architecture Notice */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Chief Administrator Security Protocol
                </span>
                <span className="text-[11px] text-slate-400">
                  Protected System
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-rose-50 border-b border-rose-200 p-3.5 px-6 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">Authentication failed: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="admin-user" className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Administrator Email / Username</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Root Account</span>
                </div>
                <div className="relative">
                  <input
                    id="admin-user"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@fafab.com.pk"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="admin-pass" className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Security Password</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Encrypted</span>
                </div>
                <div className="relative">
                  <input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full px-3.5 py-2.5 pr-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Button */}
              <div>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {fillFeedback ? 'Credentials Loaded (admin@fafab.com.pk / admin)' : 'Click to Auto-Fill Default Admin Credentials'}
                  </span>
                  {fillFeedback && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Verifying Administrator Credentials...' : 'Authenticate & Enter ERP'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </button>
            </form>

            {/* Architecture Notice Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Single-User Enterprise Security Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                This deployment is restricted exclusively to the Chief Administrator. Multi-account self-registration is permanently disabled. Invoices in PKR, USD, EUR, and GBP, expense ledgers, and payroll disbursements are executed under central authority.
              </p>
            </div>
          </div>

          {/* Quick Info Box underneath */}
          <div className="mt-4 p-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Default Admin Access:</span>
            <div className="flex items-center gap-2">
              <code className="bg-slate-800 text-emerald-400 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700">
                admin@fafab.com.pk
              </code>
              <span className="text-slate-500">/</span>
              <code className="bg-slate-800 text-emerald-400 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700">
                admin
              </code>
            </div>
          </div>
        </div>
      </main>

      {/* Enterprise Footer Strip */}
      <footer className="w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 px-4 sm:px-6 py-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <div>
          © {new Date().getFullYear()} {companyProfile.name || 'FAFAB LIMITED'} · Enterprise Resource Planning System
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Compliant with FBR & PRA</span>
          <span>·</span>
          <span>Punjab IT Framework</span>
          <span>·</span>
          <span>Bahria Town, Lahore</span>
        </div>
      </footer>
    </div>
  );
};

// Also export as LoginPage for clean naming
export const LoginPage = BrutalistLoginPage;
