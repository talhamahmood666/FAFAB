import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Calendar, 
  Award, 
  Building2, 
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export const PsebCertificateModal: React.FC = () => {
  const { 
    isPsebModalOpen, 
    setIsPsebModalOpen, 
    companyProfile, 
    updateCompanyProfile,
    setActiveModule 
  } = useErp();

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'digital' | 'scanned'>('digital');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isPsebModalOpen) return null;

  const handleCopyRegNo = () => {
    navigator.clipboard.writeText(companyProfile.psebRegNo || 'PSEB-REG-2024-8943');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        updateCompanyProfile({ psebCertificateDoc: result });
        setViewMode('scanned');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveUploadedDoc = () => {
    updateCompanyProfile({ psebCertificateDoc: undefined });
    setViewMode('digital');
  };

  const regNo = companyProfile.psebRegNo || 'PSEB-REG-2024-8943';
  const category = companyProfile.psebCategory || 'IT & IT-Enabled Services (ITeS) / Software House';
  const issueDate = companyProfile.psebIssueDate || '2024-07-01';
  const expiryDate = companyProfile.psebExpiryDate || '2027-06-30';
  const status = companyProfile.psebStatus || 'Active';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight">PSEB Certificate of Registration</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  {status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Pakistan Software Export Board · Ministry of IT & Telecom</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {companyProfile.psebCertificateDoc && (
              <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('digital')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    viewMode === 'digital' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Digital Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('scanned')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    viewMode === 'scanned' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Scanned Document
                </button>
              </div>
            )}

            {/* Upload Scanned Copy Button */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,application/pdf" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload official scanned certificate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {companyProfile.psebCertificateDoc ? 'Replace File' : 'Upload Scan'}
              </span>
            </button>

            {/* Copy Reg No Button */}
            <button
              type="button"
              onClick={handleCopyRegNo}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{copied ? 'Copied!' : regNo}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={() => setIsPsebModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          {viewMode === 'scanned' && companyProfile.psebCertificateDoc ? (
            /* Uploaded Scanned Copy View */
            <div className="w-full max-w-3xl bg-white p-4 rounded-xl border border-slate-200 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Scanned PSEB Certificate Document Attached</span>
                <button
                  type="button"
                  onClick={handleRemoveUploadedDoc}
                  className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Scanned Copy
                </button>
              </div>
              <div className="flex justify-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <img 
                  src={companyProfile.psebCertificateDoc} 
                  alt="Scanned PSEB Certificate" 
                  className="max-h-[600px] object-contain rounded shadow-xs"
                />
              </div>
            </div>
          ) : (
            /* Official Digital PSEB Certificate */
            <div className="w-full max-w-[780px] bg-[#faf8f2] text-slate-900 border-[6px] border-double border-[#0f4c3a] p-6 sm:p-10 rounded-sm shadow-xl relative overflow-hidden print:border-[4px] print:shadow-none print:max-w-none print:w-full">
              
              {/* Outer Guilloche-style Watermark / Background Crest */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
                <div className="w-[500px] h-[500px] rounded-full border-[18px] border-emerald-950 flex items-center justify-center">
                  <div className="text-center font-serif text-8xl font-black text-emerald-950">
                    PSEB
                  </div>
                </div>
              </div>

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#0f4c3a]" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#0f4c3a]" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#0f4c3a]" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#0f4c3a]" />

              {/* Official Header */}
              <div className="text-center relative z-10 pb-4 border-b border-[#0f4c3a]/20">
                {/* Emblem / Star & Crescent */}
                <div className="mx-auto w-14 h-14 rounded-full bg-[#0f4c3a] text-white flex items-center justify-center shadow-md mb-2">
                  <div className="text-center">
                    <span className="text-xl font-bold leading-none block">★</span>
                    <span className="text-[10px] font-bold tracking-tighter uppercase block mt-0.5">PAK</span>
                  </div>
                </div>

                <div className="text-[11px] font-bold tracking-[0.25em] text-[#0f4c3a] uppercase">
                  Government of Pakistan
                </div>
                <div className="text-xs font-semibold tracking-wider text-slate-700 uppercase mt-0.5">
                  Ministry of Information Technology & Telecommunication
                </div>
                <div className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase mt-1 font-serif">
                  Pakistan Software Export Board (Guarantee) Limited
                </div>
                <div className="text-[11px] text-slate-600 italic mt-0.5">
                  (Incorporated under the Companies Act, 2017) · Islamabad, Pakistan
                </div>
              </div>

              {/* Certificate Title Strip */}
              <div className="text-center my-6 relative z-10">
                <span className="inline-block px-6 py-1.5 rounded-full bg-[#0f4c3a]/10 border border-[#0f4c3a]/30 text-[#0f4c3a] font-serif font-black text-lg sm:text-xl tracking-wider uppercase">
                  Certificate of Registration
                </span>
                <p className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase mt-1.5">
                  Registered IT & IT-Enabled Services (ITeS) Exporter & Software House
                </p>
              </div>

              {/* Main Certification Text */}
              <div className="text-center text-xs sm:text-sm text-slate-800 leading-relaxed max-w-xl mx-auto space-y-3 relative z-10">
                <p>
                  This is to certify that
                </p>
                <div className="flex flex-col items-center justify-center my-1">
                  <img 
                    src="/assets/aistudio/00E4E085-7B00-4F64-BD05-2249D1CAA102_c81dd0be.PNG" 
                    alt="FAFAB Logo" 
                    className="w-16 h-16 rounded-full border-2 border-[#0f4c3a]/60 shadow-md object-contain bg-slate-900 mb-1" 
                  />
                  <div className="text-xl sm:text-2xl font-black text-[#0f4c3a] tracking-tight uppercase font-serif py-1 border-b border-dashed border-[#0f4c3a]/40 inline-block px-4">
                    {companyProfile.name || 'FAFAB LIMITED'}
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Located at: <strong className="text-slate-900">{companyProfile.address}, {companyProfile.city}, {companyProfile.province}, Pakistan</strong>
                </p>
                <p>
                  has been duly registered with the <strong>Pakistan Software Export Board (PSEB)</strong> under the category:
                </p>
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2.5 font-semibold text-[#0f4c3a] text-xs sm:text-sm">
                  {category}
                </div>
              </div>

              {/* Registration Identifiers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 bg-white/70 p-4 rounded-xl border border-slate-200 text-center relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">PSEB Reg No.</span>
                  <span className="font-mono font-black text-xs sm:text-sm text-[#0f4c3a] block mt-0.5">{regNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Federal NTN</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 block mt-0.5">{companyProfile.ntn}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Date of Issue</span>
                  <span className="font-mono font-semibold text-xs text-slate-800 block mt-0.5">{issueDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Valid Until</span>
                  <span className="font-mono font-bold text-xs text-emerald-700 block mt-0.5">{expiryDate}</span>
                </div>
              </div>

              {/* Statutory & SBP Facilitation Endorsements */}
              <div className="bg-[#f2efe6] rounded-xl p-4 border border-[#0f4c3a]/20 text-[11px] text-slate-700 space-y-1.5 relative z-10 mb-6">
                <div className="font-bold text-[#0f4c3a] text-xs flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Statutory Fiscal & Banking Facilitation Endorsements:
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>Section 154A of Income Tax Ordinance, 2001:</strong> Entitled to the 0.25% concessionary final tax regime on export proceeds of computer software and IT enabled services (against 1% general non-filer/unregistered withholding).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>SBP FE Circular No. 02/2023 (ESFCA Retention):</strong> Authorized to retain 50% of foreign exchange export remittances in Exporters&apos; Special Foreign Currency Accounts with authorized commercial banks (Meezan Bank, HBL, etc.).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>PRA & Sales Tax:</strong> Zero-rated provincial service sales tax on export of software and IT-enabled services.</span>
                </div>
              </div>

              {/* Signatures & Seal Footer */}
              <div className="pt-4 border-t border-[#0f4c3a]/20 flex items-end justify-between gap-4 relative z-10 text-center">
                {/* QR Code & Barcode */}
                <div className="text-left flex items-center space-x-3">
                  <div className="w-16 h-16 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-slate-900 grid grid-cols-4 gap-0.5 p-0.5 rounded-xs">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-2xs ${
                            (i % 3 === 0 || i === 5 || i === 10 || i === 15) ? 'bg-white' : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono leading-tight">
                    <span className="font-bold text-slate-700 block">DIGITAL VERIFICATION</span>
                    <span>pseb.org.pk/verify</span>
                    <span className="block text-emerald-800 font-semibold">{regNo}</span>
                  </div>
                </div>

                {/* Golden/Emerald Seal */}
                <div className="w-20 h-20 rounded-full border-4 border-double border-amber-600 bg-gradient-to-tr from-amber-100 to-amber-50 shadow-inner flex flex-col items-center justify-center p-1 text-[#0f4c3a] select-none">
                  <span className="text-[7px] font-black uppercase tracking-widest text-amber-800">PSEB OFFICIAL</span>
                  <div className="w-8 h-8 rounded-full border border-amber-500/50 flex items-center justify-center my-0.5 text-amber-700 font-bold text-xs">
                    ★
                  </div>
                  <span className="text-[6px] font-bold uppercase tracking-tighter text-amber-900">GOVT OF PAKISTAN</span>
                </div>

                {/* Director Signature */}
                <div className="text-right">
                  <div className="font-serif italic font-bold text-slate-800 text-xs sm:text-sm tracking-wide">
                    Syed Junaid Imam
                  </div>
                  <div className="w-32 border-b border-slate-400 my-1 ml-auto" />
                  <div className="text-[10px] font-bold text-slate-800 uppercase">
                    Managing Director / Director
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Pakistan Software Export Board
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active PSEB Software House status verified under Section 154A of ITO 2001.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPsebModalOpen(false);
              setActiveModule('settings');
            }}
            className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Edit PSEB Number & Details in Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
