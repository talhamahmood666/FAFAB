import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  Terminal
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
        setErrorMessage(result.error || 'ACCESS DENIED: INVALID CREDENTIALS');
        setIsSubmitting(false);
      }
    }, 250);
  };

  const handleQuickFill = () => {
    setUsername('admin@fafab.com.pk');
    setPassword('admin');
    setFillFeedback(true);
    setErrorMessage('');
    setTimeout(() => setFillFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F0EFE9] text-black font-mono antialiased flex flex-col justify-between selection:bg-black selection:text-[#FFE600] relative overflow-x-hidden">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#000000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Warning Strip */}
      <div className="w-full bg-black text-[#FFE600] px-4 py-2 border-b-[3px] border-black flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-widest relative z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#FFE600] shrink-0" />
          <span>SYS_GATE // FAFAB LIMITED ERP · SINGLE ADMIN PROTOCOL</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span>SECP REG: 0192847</span>
          <span>·</span>
          <span>FBR NTN: 8943210-7</span>
          <span>·</span>
          <span>PRA: 16% ON SERVICES</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-xl">
          {/* Main Brutalist Card */}
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] relative">
            {/* Header Bar */}
            <div className="bg-black text-white p-4 sm:p-5 border-b-[3px] border-black flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FFE600] text-black font-black flex items-center justify-center border-2 border-white text-base">
                  F
                </div>
                <div>
                  <h1 className="font-black text-lg sm:text-xl tracking-tight leading-none text-white uppercase">
                    {companyProfile.name || 'FAFAB LIMITED'}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-[#FFE600] font-semibold mt-1 tracking-wider uppercase">
                    ENTERPRISE LEDGER & TAX SYSTEM · BAH RIA TOWN LAHORE
                  </p>
                </div>
              </div>
              <div className="hidden xs:flex flex-col items-end">
                <span className="text-[10px] bg-white text-black font-black px-2 py-0.5 border border-black uppercase tracking-wider">
                  ROOT ONLY
                </span>
                <span className="text-[9px] text-slate-300 mt-1">VER: 2026.4</span>
              </div>
            </div>

            {/* Sub-Header Notice */}
            <div className="bg-[#FFE600] border-b-[3px] border-black px-4 py-2 text-xs font-bold flex items-center justify-between text-black">
              <span className="uppercase tracking-wider">RESTRICTED ACCESS PORTAL</span>
              <span className="text-[11px] font-black">1 SINGLE ADMIN ACCOUNT</span>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-[#FF3B30] text-white p-3.5 border-b-[3px] border-black flex items-start gap-2.5 text-xs font-bold animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="uppercase tracking-wider">AUTHENTICATION ERROR:</div>
                  <div className="font-medium text-[11px] mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Username Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase">
                  <label htmlFor="admin-user" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>[ 01 · ADMIN IDENTIFIER ]</span>
                  </label>
                  <span className="text-[10px] text-slate-600 font-semibold">EXCLUSIVE ROOT ID</span>
                </div>
                <div className="relative">
                  <input
                    id="admin-user"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin@fafab.com.pk or admin"
                    className="w-full p-3.5 bg-[#FAF9F5] border-[2px] border-black text-black font-mono font-bold text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase">
                  <label htmlFor="admin-pass" className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>[ 02 · SECURITY PASSPHRASE ]</span>
                  </label>
                  <span className="text-[10px] text-slate-600 font-semibold">KEY ENCRYPTED</span>
                </div>
                <div className="relative">
                  <input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full p-3.5 pr-12 bg-[#FAF9F5] border-[2px] border-black text-black font-mono font-bold text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full py-2 px-3 bg-[#E5E7EB] hover:bg-[#D1D5DB] border-[2px] border-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <KeyRound className="w-3.5 h-3.5 text-black" />
                  <span>
                    {fillFeedback ? 'CREDENTIALS POPULATED (admin / admin)' : 'CLICK TO AUTO-FILL ADMIN CREDENTIALS'}
                  </span>
                  {fillFeedback && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-black hover:bg-[#1E1E1E] text-white font-black text-sm tracking-wider uppercase border-[3px] border-black shadow-[6px_6px_0px_0px_#FFE600] hover:shadow-[4px_4px_0px_0px_#FFE600] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_#FFE600] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75"
              >
                <span>{isSubmitting ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE & ENTER ERP'}</span>
                <ArrowRight className="w-5 h-5 text-[#FFE600]" />
              </button>
            </form>

            {/* Security Footer Notice */}
            <div className="p-4 bg-[#FAF9F5] border-t-[3px] border-black text-[11px] text-slate-700 space-y-1">
              <div className="flex items-center gap-2 font-bold text-black">
                <ShieldAlert className="w-4 h-4 text-black shrink-0" />
                <span>SINGLE-USER ARCHITECTURE ENFORCED:</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                This ERP instance is strictly isolated for the Chief Administrator. Multi-account self-registration is permanently disabled. All tax invoices, payroll disbursements, and general ledger postings are executed under primary root authority.
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="mt-4 p-3 bg-white border-[2px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-600">DEFAULT ADMIN ACCESS:</span>
            <span className="bg-[#FFE600] px-2 py-0.5 border border-black">admin@fafab.com.pk / admin</span>
          </div>
        </div>
      </main>

      {/* Brutalist Footer Strip */}
      <footer className="w-full bg-white border-t-[3px] border-black p-3 text-[11px] font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <div>
          © {new Date().getFullYear()} {companyProfile.name || 'FAFAB LIMITED'} · ALL RIGHTS RESERVED
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <span>SECURED UNDER PAKISTAN IT ACT</span>
          <span>·</span>
          <span>SECTOR C, BAHRIA TOWN LAHORE</span>
        </div>
      </footer>
    </div>
  );
};
