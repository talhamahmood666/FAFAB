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
  RefreshCw
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { SupportedCurrency, DEFAULT_CURRENCIES } from '../../utils/currency';

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
    setExchangeRate
  } = useErp();

  const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'currency' | 'backup'>('profile');

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
    </div>
  );
};

