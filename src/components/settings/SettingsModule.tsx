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
  Loader2
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { SupportedCurrency, DEFAULT_CURRENCIES } from '../../utils/currency';
import { getSupabaseConfig } from '../../lib/supabase';
import { testSupabaseConnection } from '../../services/supabaseService';

export const SettingsModule: React.FC = () => {
  const { 
    companyProfile, 
    updateCompanyProfile, 
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
    syncToSupabase,
    pullFromSupabase
  } = useErp();

  const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'currency' | 'backup' | 'supabase'>('profile');

  // Supabase UI state
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; result?: { success: boolean; message: string } }>({ loading: false });
  const [supabaseActionStatus, setSupabaseActionStatus] = useState<{ loading: boolean; message?: string; isError?: boolean }>({ loading: false });
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const supabaseConfig = getSupabaseConfig();

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
      {/* TAB 2: EXPENSE CATEGORIES MANAGEMENT                                   */}
      {/* ======================================================================= */}
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
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isSupabaseActive
                      ? `Syncing live with Supabase project (${supabaseConfig.url}). Invoices and ERP data persist centrally.`
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
                    className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {supabaseTestStatus.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>
              )}
            </div>

            {/* Test result banner */}
            {supabaseTestStatus.result && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                supabaseTestStatus.result.success
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {supabaseTestStatus.result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                )}
                <span>{supabaseTestStatus.result.message}</span>
              </div>
            )}
          </div>

          {/* Sync Actions (if active) */}
          {isSupabaseActive && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Cloud Synchronization Controls</h3>
                  <p className="text-[11px] text-slate-500">Migrate or pull corporate ERP records between this browser and Supabase PostgreSQL.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900">Push Local Data to Supabase</h4>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Upload all {invoices.length} invoices, {expenses.length} vouchers, {employees.length} employee records, and company settings from this browser to your Supabase tables.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSupabaseSyncing}
                    onClick={async () => {
                      setSupabaseActionStatus({ loading: true });
                      const res = await syncToSupabase();
                      setSupabaseActionStatus({ loading: false, message: res.message, isError: !res.success });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isSupabaseSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Push All to Supabase</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900">Pull Cloud Data from Supabase</h4>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Fetch and replace local records with the latest live data stored in your central Supabase PostgreSQL database.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSupabaseSyncing}
                    onClick={async () => {
                      setSupabaseActionStatus({ loading: true });
                      const res = await pullFromSupabase();
                      setSupabaseActionStatus({ loading: false, message: res.message, isError: !res.success });
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isSupabaseSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Pull Latest from Supabase</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3-Step Supabase Setup Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">How to Connect Supabase with FAFAB ERP on Vercel</h3>
                <p className="text-[11px] text-slate-500">Takes less than 3 minutes. Your app code is already fully configured for Supabase.</p>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Open Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-4 text-xs">
              {/* Step 1 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">1</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Create a Project on Supabase</h4>
                  <p className="text-slate-600">
                    Sign in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">supabase.com</a> (free tier available) and click <strong>New project</strong>. Name it e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono">fafab-erp</code>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">2</span>
                <div className="space-y-2 flex-1">
                  <h4 className="font-bold text-slate-900">Run the Database Schema in Supabase SQL Editor</h4>
                  <p className="text-slate-600">
                    In your Supabase project dashboard, open the <strong>SQL Editor</strong> tab on the left, click <strong>New Query</strong>, paste our schema script, and click <strong>Run</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const sql = `-- ============================================================
-- FAFAB LIMITED ERP — Supabase PostgreSQL Database Schema
-- Run in Supabase SQL Editor
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to system_settings" ON system_settings;
CREATE POLICY "Public full access to system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL,
    currency TEXT DEFAULT 'PKR',
    exchange_rate NUMERIC DEFAULT 1.0,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    pra_tax_amount NUMERIC DEFAULT 0,
    fbr_wh_tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    balance_due NUMERIC DEFAULT 0,
    payments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to invoices" ON invoices;
CREATE POLICY "Public full access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_code TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    ntn TEXT,
    strn TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to customers" ON customers;
CREATE POLICY "Public full access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    expense_number TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    payment_method TEXT,
    paid_to TEXT,
    tax_deducted NUMERIC DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'APPROVED',
    reference_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to expenses" ON expenses;
CREATE POLICY "Public full access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    employee_code TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    designation TEXT,
    joining_date TEXT,
    basic_salary NUMERIC DEFAULT 0,
    gross_salary NUMERIC DEFAULT 0,
    allowances JSONB DEFAULT '{}'::jsonb,
    deductions JSONB DEFAULT '{}'::jsonb,
    bank_details JSONB DEFAULT '{}'::jsonb,
    ntn TEXT,
    cnic TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to employees" ON employees;
CREATE POLICY "Public full access to employees" ON employees FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS bank_accounts (
    id TEXT PRIMARY KEY,
    bank_name TEXT NOT NULL,
    account_title TEXT NOT NULL,
    account_number TEXT NOT NULL,
    iban TEXT,
    branch TEXT,
    current_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to bank_accounts" ON bank_accounts;
CREATE POLICY "Public full access to bank_accounts" ON bank_accounts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    reference_no TEXT,
    status TEXT DEFAULT 'POSTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to bank_transactions" ON bank_transactions;
CREATE POLICY "Public full access to bank_transactions" ON bank_transactions FOR ALL USING (true) WITH CHECK (true);`;

                        navigator.clipboard.writeText(sql);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy SQL Schema Script'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSqlPreview(!showSqlPreview)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {showSqlPreview ? 'Hide SQL Preview' : 'View SQL Script'}
                    </button>
                  </div>

                  {showSqlPreview && (
                    <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48">
                      <pre>{`-- Also saved in project root as /supabase_schema.sql
CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, invoice_number TEXT, total_amount NUMERIC...);
CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, customer_code TEXT, name TEXT...);
CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, expense_number TEXT, amount NUMERIC...);
CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY, employee_code TEXT, first_name TEXT...);
CREATE TABLE IF NOT EXISTS bank_accounts (id TEXT PRIMARY KEY, bank_name TEXT, current_balance NUMERIC...);
CREATE TABLE IF NOT EXISTS bank_transactions (id TEXT PRIMARY KEY, account_id TEXT, amount NUMERIC...);`}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">3</span>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">Add Environment Variables in Vercel</h4>
                  <p className="text-slate-600">
                    In your Supabase project, go to <strong>Project Settings</strong> &rarr; <strong>API</strong>. Copy your <strong>Project URL</strong> and <strong>anon / public key</strong>.
                  </p>
                  <p className="text-slate-600">
                    Then in your <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">Vercel Dashboard</a>:
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">Variable 1:</span>
                      <span className="text-emerald-700 font-bold">VITE_SUPABASE_URL</span>
                      <span className="text-slate-400 text-[10px]">= https://xyzcompany.supabase.co</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">Variable 2:</span>
                      <span className="text-emerald-700 font-bold">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-slate-400 text-[10px]">= eyJhbGciOi...</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    After adding both variables, trigger a <strong>Redeploy</strong> in Vercel. Once deployed, all devices and users accessing your domain will instantly write to and read from your live Supabase database!
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


