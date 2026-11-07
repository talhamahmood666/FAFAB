import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Receipt, 
  DollarSign, 
  Save, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  Landmark, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Upload,
  Database,
  RefreshCw,
  Cloud,
  Copy,
  ExternalLink,
  Server,
  Loader2,
  Zap,
  AlertTriangle,
  Award,
  Printer,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { SupportedCurrency, DEFAULT_CURRENCIES } from '../../utils/currency';
import { getSupabaseConfig } from '../../lib/supabase';
import { 
  testSupabaseConnection, 
  SUPABASE_SCHEMA_SQL, 
  getSupabaseProjectRef, 
  SupabaseTestResult 
} from '../../services/supabaseService';

export const SettingsModule: React.FC = () => {
  const { 
    companyProfile, 
    updateCompanyProfile, 
    isPsebModalOpen,
    setIsPsebModalOpen,
    expenseCategories, 
    addExpenseCategory, 
    renameExpenseCategory, 
    deleteExpenseCategory, 
    expenses,
    invoices,
    customers,
    accounts,
    bankAccounts,
    bankTransactions,
    employees,
    attendances,
    leaveRequests,
    assets,
    payrollPeriods,
    customExchangeRates,
    setExchangeRate,
    isSupabaseActive,
    isSupabaseSyncing,
    autoSyncStatus,
    lastSyncedAt,
    autoSyncError,
    isAutoSyncEnabled,
    setIsAutoSyncEnabled,
    syncToSupabase,
    pullFromSupabase,
    retryAutoSync,
    adminCredentials,
    updateAdminPassword,
    updateAdminCredentials
  } = useErp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'pseb' | 'categories' | 'currency' | 'backup' | 'supabase'>('profile');

  // Admin Credentials & Security State
  const [adminUsernameInput, setAdminUsernameInput] = useState(adminCredentials.username || 'admin@fafab.com.pk');
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');
  const [confirmAdminPasswordInput, setConfirmAdminPasswordInput] = useState('');
  const [credentialsMessage, setCredentialsMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMessage(null);

    const trimmedUser = adminUsernameInput.trim();
    if (!trimmedUser) {
      setCredentialsMessage({ text: 'Please enter a valid administrator email or username.', isError: true });
      return;
    }

    if (adminCredentials.password && currentPassInput !== adminCredentials.password) {
      setCredentialsMessage({ text: 'Incorrect current password! Please enter your existing passphrase to save changes.', isError: true });
      return;
    }

    if (newAdminPasswordInput || confirmAdminPasswordInput) {
      if (newAdminPasswordInput !== confirmAdminPasswordInput) {
        setCredentialsMessage({ text: 'New password and confirmation password do not match.', isError: true });
        return;
      }
    }

    const newPassToSave = newAdminPasswordInput.trim() ? newAdminPasswordInput.trim() : adminCredentials.password;
    updateAdminCredentials(trimmedUser, newPassToSave);

    setCurrentPassInput('');
    setNewAdminPasswordInput('');
    setConfirmAdminPasswordInput('');

    setCredentialsMessage({
      text: `Administrator credentials updated successfully! New Username: "${trimmedUser}". Logging out will now require these updated credentials.`,
      isError: false
    });

    setTimeout(() => setCredentialsMessage(null), 6000);
  };

  // Supabase UI state
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; result?: SupabaseTestResult }>({ loading: false });
  const [supabaseActionStatus, setSupabaseActionStatus] = useState<{ loading: boolean; message?: string; isError?: boolean }>({ loading: false });
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const supabaseConfig = getSupabaseConfig();
  const projectRef = getSupabaseProjectRef(supabaseConfig.url);

  // Company Profile Form State
  const [profileForm, setProfileForm] = useState({ ...companyProfile });
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  // Expense Category State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatOldName, setEditingCatOldName] = useState<string | null>(null);
  const [editingCatNewName, setEditingCatNewName] = useState('');
  const [categorySuccessMessage, setCategorySuccessMessage] = useState('');

  // Currency Exchange Rates State
  const [ratesForm, setRatesForm] = useState({
    USD: customExchangeRates.USD || DEFAULT_CURRENCIES.USD.rateToPKR,
    GBP: customExchangeRates.GBP || DEFAULT_CURRENCIES.GBP.rateToPKR,
    EUR: customExchangeRates.EUR || DEFAULT_CURRENCIES.EUR.rateToPKR,
  });
  const [currencySuccessMessage, setCurrencySuccessMessage] = useState('');

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // PSEB Certificate State
  const psebFileInputRef = useRef<HTMLInputElement>(null);
  const [psebSuccessMessage, setPsebSuccessMessage] = useState('');

  const handlePsebFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfileForm(prev => ({ ...prev, psebCertificateDoc: result }));
        updateCompanyProfile({ psebCertificateDoc: result });
        setPsebSuccessMessage('Scanned PSEB Certificate document attached and synced!');
        setTimeout(() => setPsebSuccessMessage(''), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePseb = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({
      psebRegNo: profileForm.psebRegNo,
      psebStatus: profileForm.psebStatus,
      psebCategory: profileForm.psebCategory,
      psebIssueDate: profileForm.psebIssueDate,
      psebExpiryDate: profileForm.psebExpiryDate,
      psebSbpRetentionClause: profileForm.psebSbpRetentionClause,
      psebCertificateDoc: profileForm.psebCertificateDoc
    });
    setPsebSuccessMessage('PSEB registration numbers and software company status updated successfully!');
    setTimeout(() => setPsebSuccessMessage(''), 4000);
  };

  // Handle Profile Submit
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(profileForm);
    setProfileSuccessMessage('Company details and NTN/STRN tax registration numbers updated successfully!');
    setTimeout(() => setProfileSuccessMessage(''), 4000);
  };

  // Handle Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addExpenseCategory(newCatName.trim());
    setNewCatName('');
    setCategorySuccessMessage('New expense category added successfully!');
    setTimeout(() => setCategorySuccessMessage(''), 3000);
  };

  // Handle Start Edit Category
  const handleStartEditCategory = (catName: string) => {
    setEditingCatOldName(catName);
    setEditingCatNewName(catName);
  };

  // Handle Save Edit Category
  const handleSaveCategoryRename = (oldName: string) => {
    if (!editingCatNewName.trim() || editingCatNewName.trim() === oldName) {
      setEditingCatOldName(null);
      return;
    }
    renameExpenseCategory(oldName, editingCatNewName.trim());
    setEditingCatOldName(null);
    setEditingCatNewName('');
    setCategorySuccessMessage(`Category renamed from "${oldName}" to "${editingCatNewName.trim()}"!`);
    setTimeout(() => setCategorySuccessMessage(''), 3000);
  };

  // Handle Delete Category
  const handleDeleteCategory = (catName: string) => {
    const usageCount = expenses.filter(e => e.category === catName).length;
    if (usageCount > 0) {
      if (!confirm(`Warning: ${usageCount} expense vouchers are currently logged under "${catName}". Are you sure you want to delete this category?`)) {
        return;
      }
    }
    deleteExpenseCategory(catName);
    setCategorySuccessMessage(`Category "${catName}" removed.`);
    setTimeout(() => setCategorySuccessMessage(''), 3000);
  };

  // Handle Save Exchange Rates
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeRate('USD', Number(ratesForm.USD));
    setExchangeRate('GBP', Number(ratesForm.GBP));
    setExchangeRate('EUR', Number(ratesForm.EUR));
    setCurrencySuccessMessage('Custom exchange rates updated successfully!');
    setTimeout(() => setCurrencySuccessMessage(''), 4000);
  };

  // Export Complete ERP JSON Data
  const handleExportData = () => {
    const fullData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      companyProfile,
      expenseCategories,
      customExchangeRates,
      invoices,
      customers,
      expenses,
      accounts,
      bankAccounts,
      bankTransactions,
      employees,
      attendances,
      leaveRequests,
      assets,
      payrollPeriods
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `FAFAB_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupMessage({ text: `Backup file "${filename}" downloaded successfully!`, type: 'success' });
    setTimeout(() => setBackupMessage(null), 4000);
  };

  // Import ERP JSON Data
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || typeof json !== 'object') {
          throw new Error('Invalid JSON format');
        }

        if (json.companyProfile) localStorage.setItem('fafab_company_profile', JSON.stringify(json.companyProfile));
        if (json.expenseCategories) localStorage.setItem('fafab_expense_categories', JSON.stringify(json.expenseCategories));
        if (json.customExchangeRates) localStorage.setItem('fafab_exchange_rates', JSON.stringify(json.customExchangeRates));
        if (json.invoices) localStorage.setItem('fafab_invoices', JSON.stringify(json.invoices));
        if (json.customers) localStorage.setItem('fafab_customers', JSON.stringify(json.customers));
        if (json.expenses) localStorage.setItem('fafab_expenses', JSON.stringify(json.expenses));
        if (json.accounts) localStorage.setItem('fafab_accounts', JSON.stringify(json.accounts));
        if (json.bankAccounts) localStorage.setItem('fafab_bank_accounts', JSON.stringify(json.bankAccounts));
        if (json.bankTransactions) localStorage.setItem('fafab_bank_txs', JSON.stringify(json.bankTransactions));
        if (json.employees) localStorage.setItem('fafab_employees', JSON.stringify(json.employees));
        if (json.attendances) localStorage.setItem('fafab_attendances', JSON.stringify(json.attendances));
        if (json.leaveRequests) localStorage.setItem('fafab_leaves', JSON.stringify(json.leaveRequests));
        if (json.assets) localStorage.setItem('fafab_assets', JSON.stringify(json.assets));
        if (json.payrollPeriods) localStorage.setItem('fafab_payroll_periods', JSON.stringify(json.payrollPeriods));

        setBackupMessage({ text: 'Data imported successfully! Reloading system...', type: 'success' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setBackupMessage({ text: 'Error importing backup file: File format is not valid FAFAB ERP data.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Handle Reset Data
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data to system defaults? This will erase custom records saved in this browser.')) {
      localStorage.removeItem('fafab_db_version');
      localStorage.removeItem('fafab_company_profile');
      localStorage.removeItem('fafab_expense_categories');
      localStorage.removeItem('fafab_exchange_rates');
      localStorage.removeItem('fafab_invoices');
      localStorage.removeItem('fafab_customers');
      localStorage.removeItem('fafab_expenses');
      localStorage.removeItem('fafab_accounts');
      localStorage.removeItem('fafab_bank_accounts');
      localStorage.removeItem('fafab_bank_txs');
      localStorage.removeItem('fafab_employees');
      localStorage.removeItem('fafab_attendances');
      localStorage.removeItem('fafab_leaves');
      localStorage.removeItem('fafab_assets');
      localStorage.removeItem('fafab_payroll_periods');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          System & Company Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage corporate registration (NTN/STRN), expense categories, bank transfer instructions, exchange rates, and data backups.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & Tax IDs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Admin Username & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pseb')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'pseb'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>PSEB Software Registration & Certificate</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expense Categories ({expenseCategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('currency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'currency'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Multi-Currency Rates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Backup & Restore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer relative ${
            activeTab === 'supabase'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Supabase Cloud Sync</span>
          {isSupabaseActive ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">Setup</span>
          )}
        </button>
      </div>

      {/* ======================================================================= */}
      {/* TAB 1: COMPANY PROFILE & TAX REGISTRATIONS                             */}
      {/* ======================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMessage}</span>
            </div>
          )}

          {/* Legal Identity & Tax IDs Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Corporate Legal Identity & Tax Registrations</h3>
                <p className="text-[11px] text-slate-500">These details appear on official tax invoices and financial statements.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Registered Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. FAFAB LIMITED"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trade / Operating Name</label>
                <input
                  type="text"
                  value={profileForm.tradeName}
                  onChange={(e) => setProfileForm({ ...profileForm, tradeName: e.target.value })}
                  placeholder="e.g. FAFAB Enterprise Solutions"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">FBR NTN Number (Federal Tax) *</label>
                <input
                  type="text"
                  required
                  value={profileForm.ntn}
                  onChange={(e) => setProfileForm({ ...profileForm, ntn: e.target.value })}
                  placeholder="e.g. 8943210-7"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">STRN (FBR / PRA Sales Tax Registration) *</label>
                <input
                  type="text"
                  required
                  value={profileForm.strn}
                  onChange={(e) => setProfileForm({ ...profileForm, strn: e.target.value })}
                  placeholder="e.g. 32-77-8765-432-19"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">SECP Incorporation Registration Number</label>
                <input
                  type="text"
                  value={profileForm.registrationNo}
                  onChange={(e) => setProfileForm({ ...profileForm, registrationNo: e.target.value })}
                  placeholder="e.g. 0192847-SECP"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PRA Registration Number (Punjab Sales Tax on Services)</label>
                <input
                  type="text"
                  value={profileForm.praRegNo}
                  onChange={(e) => setProfileForm({ ...profileForm, praRegNo: e.target.value })}
                  placeholder="e.g. PRA-LHR-2024-99"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">EOBI Registration Number</label>
                <input
                  type="text"
                  value={profileForm.eobiRegNo}
                  onChange={(e) => setProfileForm({ ...profileForm, eobiRegNo: e.target.value })}
                  placeholder="e.g. LHR-EOBI-77123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PESSI Registration Number</label>
                <input
                  type="text"
                  value={profileForm.pessiRegNo}
                  onChange={(e) => setProfileForm({ ...profileForm, pessiRegNo: e.target.value })}
                  placeholder="e.g. PESSI-LHR-9981"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  PSEB Registration Number (Pakistan Software Export Board)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileForm.psebRegNo || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, psebRegNo: e.target.value })}
                    placeholder="e.g. PSEB-REG-2024-8943"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPsebModalOpen(true)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-xs"
                  >
                    View Certificate
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enables 0.25% concessionary final tax under Sec 154A of ITO & 50% SBP FX ESFCA retention.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Official Corporate Address & Contact Information</h3>
                <p className="text-[11px] text-slate-500">Physical address and phone numbers listed on correspondence.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Office Address *</label>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Plot 12-A, Commercial Area, Sector C, Bahria Town"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  placeholder="Lahore"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Province</label>
                <input
                  type="text"
                  value={profileForm.province}
                  onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                  placeholder="Punjab"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+92 42 35920000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Finance / Accounts Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="finance@fafab.com.pk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Default Bank Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Default Operating Bank Details (Invoice Wire Transfer)</h3>
                <p className="text-[11px] text-slate-500">Printed automatically at the bottom of client tax invoices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={profileForm.defaultBank.bankName}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    defaultBank: { ...profileForm.defaultBank, bankName: e.target.value }
                  })}
                  placeholder="e.g. Meezan Bank Limited"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Branch Name</label>
                <input
                  type="text"
                  value={profileForm.defaultBank.branchName}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    defaultBank: { ...profileForm.defaultBank, branchName: e.target.value }
                  })}
                  placeholder="e.g. Bahria Town Sector C Branch, Lahore"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Title</label>
                <input
                  type="text"
                  value={profileForm.defaultBank.accountTitle}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    defaultBank: { ...profileForm.defaultBank, accountTitle: e.target.value }
                  })}
                  placeholder="e.g. FAFAB LIMITED"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">IBAN Number</label>
                <input
                  type="text"
                  value={profileForm.defaultBank.iban}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    defaultBank: { ...profileForm.defaultBank, iban: e.target.value }
                  })}
                  placeholder="e.g. PK36 MEZN 0002 0102 9384 7102"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Single Admin Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Single Root Administrator Security</h3>
                  <p className="text-[11px] text-slate-500">Configure login credentials for the sole authorized ERP administrator account.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                Manage Credentials
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Active Administrator Username:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{adminCredentials.username}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Change Username / Password
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Corporate Profile Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================================= */}
      {/* TAB: ADMIN USERNAME & PASSWORD SECURITY                                 */}
      {/* ======================================================================= */}
      {activeTab === 'security' && (
        <form onSubmit={handleUpdateCredentials} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Root Administrator Account Security</h3>
                <p className="text-xs text-slate-500">
                  Change your administrator email/username and passphrase. Updating credentials takes effect immediately and persists across sessions.
                </p>
              </div>
            </div>

            {credentialsMessage && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                credentialsMessage.isError 
                  ? 'bg-rose-50 border border-rose-200 text-rose-800' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                {credentialsMessage.isError ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{credentialsMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block text-xs">
                  1. Administrator Email / Username *
                </label>
                <input
                  type="text"
                  required
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="e.g. admin@fafab.com.pk"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                />
                <p className="text-[11px] text-slate-500">
                  Currently active username: <strong className="font-mono text-slate-900">{adminCredentials.username}</strong>
                </p>
              </div>

              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block text-xs">
                  2. Current Security Passphrase (Required to save changes)
                </label>
                <input
                  type="password"
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block text-xs">
                  3. New Passphrase (Optional - leave blank to keep existing)
                </label>
                <input
                  type="password"
                  value={newAdminPasswordInput}
                  onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                  placeholder="Enter new admin passphrase..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block text-xs">
                  4. Confirm New Passphrase
                </label>
                <input
                  type="password"
                  value={confirmAdminPasswordInput}
                  onChange={(e) => setConfirmAdminPasswordInput(e.target.value)}
                  placeholder="Re-enter new admin passphrase..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Update Security Credentials</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================================= */}
      {/* TAB: PSEB SOFTWARE HOUSE REGISTRATION & CERTIFICATE                    */}
      {/* ======================================================================= */}
      {activeTab === 'pseb' && (
        <div className="space-y-6">
          {psebSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{psebSuccessMessage}</span>
            </div>
          )}

          {/* PSEB Hero Overview Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white border border-slate-700/80 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0f4c3a] border-2 border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-lg shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-white">
                      Pakistan Software Export Board (PSEB) Registration
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {profileForm.psebStatus || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Official software company accreditation under Ministry of Information Technology & Telecommunication, Government of Pakistan. Enables 0.25% concessionary export tax (Sec 154A ITO) and 50% foreign exchange retention (SBP ESFCA).
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400 font-mono">
                    <div>
                      PSEB ID: <strong className="text-emerald-400">{profileForm.psebRegNo || 'PSEB-REG-2024-8943'}</strong>
                    </div>
                    <span>•</span>
                    <div>
                      Category: <span className="text-slate-200">{profileForm.psebCategory || 'IT & ITeS Software House'}</span>
                    </div>
                    <span>•</span>
                    <div>
                      Valid To: <span className="text-slate-200">{profileForm.psebExpiryDate || '2027-06-30'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPsebModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View & Print Official Certificate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form to Manage PSEB Registration Details */}
          <form onSubmit={handleSavePseb} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">PSEB Registration Identifiers & Dates</h4>
                    <p className="text-[11px] text-slate-500">Update company registration credentials printed on invoices and official certificates.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    PSEB Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.psebRegNo || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, psebRegNo: e.target.value })}
                    placeholder="e.g. PSEB-REG-2024-8943"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-800 focus:bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Printed on foreign client invoices for SBP remittance clearing.</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Registration Category
                  </label>
                  <select
                    value={profileForm.psebCategory || 'IT & IT-Enabled Services (ITeS) / Software House'}
                    onChange={(e) => setProfileForm({ ...profileForm, psebCategory: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="IT & IT-Enabled Services (ITeS) / Software House">IT & IT-Enabled Services (ITeS) / Software House</option>
                    <option value="Software Development & Cloud SaaS">Software Development & Cloud SaaS</option>
                    <option value="IT Consulting, AI & Enterprise Solutions">IT Consulting, AI & Enterprise Solutions</option>
                    <option value="Call Center & Business Process Outsourcing (BPO)">Call Center & Business Process Outsourcing (BPO)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Registration Issue Date
                  </label>
                  <input
                    type="date"
                    value={profileForm.psebIssueDate || '2024-07-01'}
                    onChange={(e) => setProfileForm({ ...profileForm, psebIssueDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Registration Expiry / Renewal Date
                  </label>
                  <input
                    type="date"
                    value={profileForm.psebExpiryDate || '2027-06-30'}
                    onChange={(e) => setProfileForm({ ...profileForm, psebExpiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Registration Standing / Status
                  </label>
                  <select
                    value={profileForm.psebStatus || 'Active'}
                    onChange={(e) => setProfileForm({ ...profileForm, psebStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="Active">Active & Compliant</option>
                    <option value="Under Renewal">Under Renewal</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    SECP Incorporation Ref (Cross-Reference)
                  </label>
                  <input
                    type="text"
                    value={profileForm.registrationNo}
                    disabled
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Pulled from SECP Corporate Profile.</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  State Bank of Pakistan (SBP) & Tax Exemption Clause
                </label>
                <textarea
                  rows={2}
                  value={profileForm.psebSbpRetentionClause || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, psebSbpRetentionClause: e.target.value })}
                  placeholder="Clause printed on export invoices and remittance instructions..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Scanned Certificate Attachment Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Scanned PSEB Certificate Document</h4>
                    <p className="text-[11px] text-slate-500">Attach an official physical scanned certificate or PDF document for records and auditing.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={psebFileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handlePsebFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => psebFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{profileForm.psebCertificateDoc ? 'Replace Document' : 'Upload Scanned File'}</span>
                  </button>
                  {profileForm.psebCertificateDoc && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm(prev => ({ ...prev, psebCertificateDoc: undefined }));
                        updateCompanyProfile({ psebCertificateDoc: undefined });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {profileForm.psebCertificateDoc ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                  <img
                    src={profileForm.psebCertificateDoc}
                    alt="Attached PSEB Certificate"
                    className="max-h-60 object-contain rounded-lg shadow-sm border border-slate-200"
                  />
                  <span className="text-[11px] text-slate-500 font-medium mt-2">
                    Scanned copy attached. Viewable in Certificate modal or downloadable anytime.
                  </span>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No scanned certificate uploaded yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    The ERP automatically generates an official verified digital certificate. You can also upload a scanned copy of your physical paper certificate.
                  </p>
                </div>
              )}
            </div>

            {/* SBP IT Exporter Guidelines Informational Card */}
            <div className="bg-[#f0f9f6] rounded-2xl border border-emerald-200/80 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-800" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  State Bank of Pakistan (SBP) & FBR IT Exporter Statutory Framework
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                  <span className="font-bold text-emerald-800 block">Section 154A of ITO 2001</span>
                  <p className="text-[11px] text-slate-600">
                    Registered PSEB members pay a final <strong>0.25% concessionary tax</strong> on software exports realized via SBP PRC banking channels (vs 1% general unregistered rate).
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                  <span className="font-bold text-emerald-800 block">50% ESFCA Retention Quota</span>
                  <p className="text-[11px] text-slate-600">
                    Under SBP FE Circular No. 02/2023, IT software exporters can retain up to <strong>50% in foreign currency</strong> (USD/EUR/GBP) for overseas cloud hosting, software licenses, and marketing.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                  <span className="font-bold text-emerald-800 block">Proceeds Realization (PRC)</span>
                  <p className="text-[11px] text-slate-600">
                    Always include your PSEB registration number on invoices billed to foreign clients so Meezan Bank / HBL automatically applies the correct IT export tariff code upon swift remittance.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPsebModalOpen(true)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Open Certificate Modal</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save PSEB Registration Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {categorySuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{categorySuccessMessage}</span>
            </div>
          )}

          {/* Add Category Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Plus className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Add New Expense Category</h3>
                <p className="text-[11px] text-slate-500">Create custom categories for logging vouchers in the Expense Management module.</p>
              </div>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 text-xs">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Office Security & CCTV Maintenance, Client Entertainment, Repairs..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Configured Expense Categories ({expenseCategories.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Renaming updates existing expense records automatically.
              </span>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {expenseCategories.map((cat, idx) => {
                const usageCount = expenses.filter(e => e.category === cat).length;
                const isEditing = editingCatOldName === cat;

                return (
                  <div key={cat} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono text-slate-400 font-medium w-6">{idx + 1}.</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input
                            type="text"
                            value={editingCatNewName}
                            onChange={(e) => setEditingCatNewName(e.target.value)}
                            className="flex-1 p-1.5 bg-white border border-emerald-500 rounded font-semibold text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCategoryRename(cat)}
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save Rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatOldName(null)}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{cat}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            usageCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {usageCount} voucher{usageCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditCategory(cat)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: MULTI-CURRENCY & EXCHANGE RATES                                 */}
      {/* ======================================================================= */}
      {activeTab === 'currency' && (
        <form onSubmit={handleSaveRates} className="space-y-6">
          {currencySuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{currencySuccessMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Corporate Statutory Exchange Rate Engine</h3>
                <p className="text-[11px] text-slate-500">Base Currency is permanently set to <strong>Pakistani Rupee (PKR)</strong>. Configure statutory conversion rates for foreign currency invoicing.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>🇵🇰</span>
                  <span>PKR — Pakistani Rupee (Base Currency)</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded">1.00 PKR (Base)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>🇺🇸</span>
                    <span>US Dollar (USD $)</span>
                  </div>
                  <label className="text-[11px] text-slate-500 block">1 USD = ? PKR</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratesForm.USD}
                    onChange={(e) => setRatesForm({ ...ratesForm, USD: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>🇬🇧</span>
                    <span>British Pound (GBP £)</span>
                  </div>
                  <label className="text-[11px] text-slate-500 block">1 GBP = ? PKR</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratesForm.GBP}
                    onChange={(e) => setRatesForm({ ...ratesForm, GBP: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>🇪🇺</span>
                    <span>Euro (EUR €)</span>
                  </div>
                  <label className="text-[11px] text-slate-500 block">1 EUR = ? PKR</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratesForm.EUR}
                    onChange={(e) => setRatesForm({ ...ratesForm, EUR: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Exchange Rates</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================================= */}
      {/* TAB 4: DATA BACKUP & RESTORE                                           */}
      {/* ======================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {backupMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              backupMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {backupMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{backupMessage.text}</span>
            </div>
          )}

          {/* Export Data */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Download className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Export System Backup (JSON)</h3>
                <p className="text-[11px] text-slate-500">Download a full offline snapshot of all company records, invoices, HR files, and accounting entries.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="text-slate-600 space-y-1">
                <p>• Backup contains: Invoices ({invoices.length}), Vouchers ({expenses.length}), Employees ({employees.length}), Bank Txs ({bankTransactions.length}), Company Settings.</p>
                <p>• Can be safely imported into another computer, browser, or shared with colleagues.</p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export ERP Backup File</span>
              </button>
            </div>
          </div>

          {/* Import Data */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Import & Restore Data</h3>
                <p className="text-[11px] text-slate-500">Restore or transfer data from a previously exported FAFAB ERP JSON file.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="text-slate-600 space-y-1">
                <p>• Restores all invoices, employee files, tax numbers, and financial ledgers onto this browser.</p>
                <p>• Warning: Importing will replace existing data in this browser with the backup file contents.</p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFileChange}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Select & Import JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Reset System */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
              <RefreshCw className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm text-rose-900">Reset to Initial Seed State</h3>
                <p className="text-[11px] text-slate-500">Wipe local browser changes and restore default FAFAB Limited sample records.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <p className="text-slate-600">
                Use this if you wish to start fresh with clean initial seed data for FAFAB Limited Lahore.
              </p>

              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Reset Application Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 5: SUPABASE CLOUD DATABASE & VERCEL INTEGRATION                    */}
      {/* ======================================================================= */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
            isSupabaseActive 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSupabaseActive ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">
                      {isSupabaseActive ? 'Supabase Cloud Database: Active' : 'Supabase Cloud Database: Local Offline Mode'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSupabaseActive ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {isSupabaseActive ? 'CONNECTED' : 'NOT CONFIGURED'}
                    </span>
                    {projectRef && (
                      <span className="hidden md:inline px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        Project: {projectRef}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isSupabaseActive
                      ? `Connected to Supabase project (${supabaseConfig.url}). Real-time multi-user persistence for Vercel.`
                      : 'Running in browser localStorage mode. Connect Supabase to persist and sync records across all devices and team members on Vercel.'}
                  </p>
                </div>
              </div>

              {isSupabaseActive && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={supabaseTestStatus.loading}
                    onClick={async () => {
                      setSupabaseTestStatus({ loading: true });
                      const res = await testSupabaseConnection();
                      setSupabaseTestStatus({ loading: false, result: res });
                    }}
                    className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {supabaseTestStatus.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>
              )}
            </div>

            {/* Test result banner */}
            {supabaseTestStatus.result && (
              <div className={`mt-3 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                supabaseTestStatus.result.success
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : supabaseTestStatus.result.tablesMissing
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {supabaseTestStatus.result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : supabaseTestStatus.result.tablesMissing ? (
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{supabaseTestStatus.result.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* MISSING TABLES CALLOUT (Shown if tables are not initialized in Supabase) */}
          {isSupabaseActive && (supabaseTestStatus.result?.tablesMissing || autoSyncStatus === 'tables_needed') && (
            <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center shrink-0 font-bold">
                  <AlertTriangle className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm tracking-wide">
                    ACTION REQUIRED: INITIALIZE DATABASE TABLES IN SUPABASE
                  </h4>
                  <p className="text-xs text-slate-700 mt-1">
                    Your Supabase project is connected, but PostgreSQL tables (like <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold text-black">system_settings</code>, <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold text-black">invoices</code>, and <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold text-black">expenses</code>) have not been created yet.
                  </p>
                  <p className="text-xs text-slate-700 mt-0.5">
                    Supabase returned: <span className="font-mono text-amber-900 font-semibold bg-white/70 px-1.5 py-0.5 rounded">Could not find the table 'public.system_settings' in the schema cache</span>.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-4 py-2 bg-black hover:bg-slate-800 text-amber-400 font-black text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'SQL Script Copied to Clipboard!' : '1. Copy Complete SQL Schema Script'}</span>
                </button>

                <a
                  href={`https://supabase.com/dashboard/project/${projectRef || 'ysotolpebceouisyehlr'}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>2. Open Supabase SQL Editor ({projectRef || 'ysotolpebceouisyehlr'})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  disabled={supabaseTestStatus.loading}
                  onClick={async () => {
                    setSupabaseTestStatus({ loading: true });
                    const res = await testSupabaseConnection();
                    setSupabaseTestStatus({ loading: false, result: res });
                    if (res.success) {
                      await retryAutoSync();
                    }
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>3. Re-test & Verify Connection</span>
                </button>
              </div>

              {/* 30-Second Quick Instructions */}
              <div className="p-3.5 bg-white/80 rounded-xl border border-amber-300 text-xs text-slate-800 space-y-1.5">
                <div className="font-bold text-slate-900">How to run in 30 seconds:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>Click <strong>Copy Complete SQL Schema Script</strong> above.</li>
                  <li>Click <strong>Open Supabase SQL Editor</strong> to open your project's query editor.</li>
                  <li>Paste the script (Ctrl+V / Cmd+V) and click the green <strong>Run</strong> button.</li>
                  <li>Return here and click <strong>Re-test & Verify Connection</strong>. All 12 tables will be ready and auto-sync will begin immediately!</li>
                </ol>
              </div>
            </div>
          )}

          {/* AUTOMATIC CLOUD SYNC CONTROLS */}
          {isSupabaseActive && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">Automatic Background Cloud Synchronization</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {isAutoSyncEnabled ? 'ENABLED (LIVE)' : 'PAUSED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Invoices, expenses, payroll, and settings automatically synchronize to Supabase PostgreSQL without needing manual button clicks.
                    </p>
                  </div>
                </div>

                {/* Toggle Auto Sync */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                    <span>Auto-Sync:</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isAutoSyncEnabled}
                      onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAutoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isAutoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* Real-time Status Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Sync Status:</span>
                    {autoSyncStatus === 'synced' ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Synchronized with Supabase Cloud
                      </span>
                    ) : autoSyncStatus === 'syncing' || isSupabaseSyncing ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        Synchronizing changes in background...
                      </span>
                    ) : autoSyncStatus === 'tables_needed' ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Table Creation in Supabase
                      </span>
                    ) : autoSyncStatus === 'error' ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        {autoSyncError || 'Sync Error'}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-700">Idle / Ready</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Last automatic sync: <strong>{lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Pending first sync'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSupabaseSyncing}
                    onClick={async () => {
                      setSupabaseActionStatus({ loading: true });
                      const res = await syncToSupabase();
                      setSupabaseActionStatus({ loading: false, message: res.message, isError: !res.success });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    {isSupabaseSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Force Push Now</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSupabaseSyncing}
                    onClick={async () => {
                      setSupabaseActionStatus({ loading: true });
                      const res = await pullFromSupabase();
                      setSupabaseActionStatus({ loading: false, message: res.message, isError: !res.success });
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    {isSupabaseSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Pull Latest Cloud Data</span>
                  </button>
                </div>
              </div>

              {supabaseActionStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  supabaseActionStatus.isError 
                    ? 'bg-rose-50 border border-rose-200 text-rose-800' 
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  {supabaseActionStatus.isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{supabaseActionStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* 3-Step Supabase Setup Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Supabase Setup & Migration Guide</h3>
                <p className="text-[11px] text-slate-500">Everything needed to initialize or verify PostgreSQL tables for FAFAB Limited ERP.</p>
              </div>
              <a
                href={`https://supabase.com/dashboard/project/${projectRef || 'ysotolpebceouisyehlr'}/sql/new`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-4 text-xs">
              {/* Step 1 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">1</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Your Supabase Project</h4>
                  <p className="text-slate-600">
                    Connected project URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono font-semibold">{supabaseConfig.url || 'Not set'}</code>
                    {projectRef && <> (Project Reference: <strong className="text-slate-900 font-mono">{projectRef}</strong>)</>}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">2</span>
                <div className="space-y-2 flex-1">
                  <h4 className="font-bold text-slate-900">Run the Database Schema in Supabase SQL Editor</h4>
                  <p className="text-slate-600">
                    Open the <strong>SQL Editor</strong> in your Supabase dashboard, click <strong>New Query</strong>, paste the complete schema script, and click <strong>Run</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy 1-Click Complete SQL Script'}</span>
                    </button>

                    <a
                      href={`https://supabase.com/dashboard/project/${projectRef || 'ysotolpebceouisyehlr'}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>Open SQL Editor Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowSqlPreview(!showSqlPreview)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {showSqlPreview ? 'Hide SQL Preview' : 'View SQL Preview'}
                    </button>
                  </div>

                  {showSqlPreview && (
                    <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56">
                      <pre>{SUPABASE_SCHEMA_SQL}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">3</span>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">Environment Variables in Vercel</h4>
                  <p className="text-slate-600">
                    If deploying to Vercel, verify that your project settings have these two variables:
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">Variable 1:</span>
                      <span className="text-emerald-700 font-bold">VITE_SUPABASE_URL</span>
                      <span className="text-slate-400 text-[10px]">= {supabaseConfig.url || 'https://xyzcompany.supabase.co'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">Variable 2:</span>
                      <span className="text-emerald-700 font-bold">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-slate-400 text-[10px]">= eyJhbGciOi...</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Once deployed, every user and browser accessing your Vercel URL writes to and reads from your live Supabase database automatically!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


