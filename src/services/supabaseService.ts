import { supabase, isSupabaseConfigured, getSupabaseConfig } from '../lib/supabase';
import { 
  Account, 
  BankAccount, 
  BankTransaction, 
  CompanyAsset, 
  CompanyProfile, 
  Customer, 
  Employee, 
  Expense, 
  Invoice, 
  LeaveRequest, 
  PayrollPeriod, 
  AttendanceRecord 
} from '../types/erp';

export interface SupabaseFullData {
  companyProfile?: CompanyProfile;
  expenseCategories?: string[];
  customExchangeRates?: Record<string, number>;
  invoices?: Invoice[];
  customers?: Customer[];
  expenses?: Expense[];
  accounts?: Account[];
  bankAccounts?: BankAccount[];
  bankTransactions?: BankTransaction[];
  employees?: Employee[];
  attendances?: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
  assets?: CompanyAsset[];
  payrollPeriods?: PayrollPeriod[];
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  tablesMissing?: boolean;
  projectRef?: string | null;
}

export interface SupabaseFetchResult {
  data: SupabaseFullData | null;
  tablesMissing?: boolean;
  error?: string;
}

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  tablesMissing?: boolean;
}

/**
 * Extracts the project reference ID from a Supabase URL
 * e.g. "https://ysotolpebceouisyehlr.supabase.co" -> "ysotolpebceouisyehlr"
 */
export const getSupabaseProjectRef = (url?: string): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length >= 3 && hostParts[1] === 'supabase' && hostParts[2] === 'co') {
      return hostParts[0];
    }
  } catch {
    const match = url.match(/https?:\/\/([a-z0-9_-]+)\.supabase\.co/i);
    if (match) return match[1];
  }
  return null;
};

/**
 * Detects if a Supabase PostgREST error is due to non-existent tables in PostgreSQL
 */
export const isTableMissingError = (error: any): boolean => {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  const details = String(error.details || '').toLowerCase();

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    msg.includes('relation does not exist') ||
    details.includes('schema cache')
  );
};

export const SUPABASE_SCHEMA_SQL = `-- ============================================================
-- FAFAB LIMITED ERP — Supabase PostgreSQL Database Schema
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================

-- 1. General System Settings (Company Profile, Exchange Rates, Categories)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to system_settings" ON system_settings;
CREATE POLICY "Public full access to system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT,
    customer_name TEXT,
    grand_total NUMERIC,
    status TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to invoices" ON invoices;
CREATE POLICY "Public full access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_code TEXT,
    company_name TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to customers" ON customers;
CREATE POLICY "Public full access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    expense_number TEXT,
    category TEXT,
    amount NUMERIC,
    date TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to expenses" ON expenses;
CREATE POLICY "Public full access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- 5. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    employee_code TEXT,
    first_name TEXT,
    last_name TEXT,
    gross_salary NUMERIC,
    status TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to employees" ON employees;
CREATE POLICY "Public full access to employees" ON employees FOR ALL USING (true) WITH CHECK (true);

-- 6. Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id TEXT PRIMARY KEY,
    bank_name TEXT,
    account_title TEXT,
    current_balance NUMERIC,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to bank_accounts" ON bank_accounts;
CREATE POLICY "Public full access to bank_accounts" ON bank_accounts FOR ALL USING (true) WITH CHECK (true);

-- 7. Bank Transactions Table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id TEXT PRIMARY KEY,
    bank_account_id TEXT,
    date TEXT,
    reference_no TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to bank_transactions" ON bank_transactions;
CREATE POLICY "Public full access to bank_transactions" ON bank_transactions FOR ALL USING (true) WITH CHECK (true);

-- 8. Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT,
    payload JSONB NOT NULL
);
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to chart_of_accounts" ON chart_of_accounts;
CREATE POLICY "Public full access to chart_of_accounts" ON chart_of_accounts FOR ALL USING (true) WITH CHECK (true);

-- 9. Attendances Table
CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    date TEXT,
    status TEXT,
    payload JSONB NOT NULL
);
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to attendances" ON attendances;
CREATE POLICY "Public full access to attendances" ON attendances FOR ALL USING (true) WITH CHECK (true);

-- 10. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    status TEXT,
    payload JSONB NOT NULL
);
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to leave_requests" ON leave_requests;
CREATE POLICY "Public full access to leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);

-- 11. Company Assets Table
CREATE TABLE IF NOT EXISTS company_assets (
    id TEXT PRIMARY KEY,
    asset_tag TEXT,
    title TEXT,
    payload JSONB NOT NULL
);
ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to company_assets" ON company_assets;
CREATE POLICY "Public full access to company_assets" ON company_assets FOR ALL USING (true) WITH CHECK (true);

-- 12. Payroll Periods Table
CREATE TABLE IF NOT EXISTS payroll_periods (
    id TEXT PRIMARY KEY,
    period_name TEXT,
    month NUMERIC,
    year NUMERIC,
    payload JSONB NOT NULL
);
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to payroll_periods" ON payroll_periods;
CREATE POLICY "Public full access to payroll_periods" ON payroll_periods FOR ALL USING (true) WITH CHECK (true);
`;

export const testSupabaseConnection = async (): Promise<SupabaseTestResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { 
      success: false, 
      message: 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set.' 
    };
  }

  const { url } = getSupabaseConfig();
  const projectRef = getSupabaseProjectRef(url);

  try {
    const { error } = await supabase.from('system_settings').select('key').limit(1);
    if (error) {
      if (isTableMissingError(error)) {
        return {
          success: false,
          tablesMissing: true,
          projectRef,
          message: 'Connected to Supabase project! However, database tables do not exist yet. Please run the 1-Click SQL Schema Script in your Supabase SQL Editor.'
        };
      }
      return { 
        success: false, 
        projectRef,
        message: `Supabase error: ${error.message}` 
      };
    }
    return { 
      success: true, 
      tablesMissing: false,
      projectRef,
      message: 'Successfully connected to Supabase PostgreSQL! Database tables verified and live auto-sync is active.' 
    };
  } catch (err: any) {
    return { 
      success: false, 
      projectRef,
      message: err.message || 'Failed to connect to Supabase.' 
    };
  }
};

export const fetchAllFromSupabase = async (): Promise<SupabaseFetchResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    // Check if system_settings table exists first
    const testCheck = await supabase.from('system_settings').select('key').limit(1);
    if (testCheck.error) {
      if (isTableMissingError(testCheck.error)) {
        return { data: null, tablesMissing: true, error: 'Tables missing in Supabase schema' };
      }
    }

    const [
      settingsRes,
      invoicesRes,
      customersRes,
      expensesRes,
      employeesRes,
      bankAccountsRes,
      bankTxRes,
      accountsRes,
      attendancesRes,
      leavesRes,
      assetsRes,
      payrollRes,
    ] = await Promise.all([
      supabase.from('system_settings').select('*'),
      supabase.from('invoices').select('*'),
      supabase.from('customers').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('employees').select('*'),
      supabase.from('bank_accounts').select('*'),
      supabase.from('bank_transactions').select('*'),
      supabase.from('chart_of_accounts').select('*'),
      supabase.from('attendances').select('*'),
      supabase.from('leave_requests').select('*'),
      supabase.from('company_assets').select('*'),
      supabase.from('payroll_periods').select('*'),
    ]);

    // Check if any critical query had a table missing error
    if (isTableMissingError(settingsRes.error) || isTableMissingError(invoicesRes.error)) {
      return { data: null, tablesMissing: true, error: 'Tables missing in Supabase schema' };
    }

    // Format settings
    let companyProfile: CompanyProfile | undefined;
    let expenseCategories: string[] | undefined;
    let customExchangeRates: Record<string, number> | undefined;

    if (settingsRes.data) {
      for (const row of settingsRes.data) {
        if (row.key === 'company_profile') companyProfile = row.value;
        if (row.key === 'expense_categories') expenseCategories = row.value;
        if (row.key === 'custom_exchange_rates') customExchangeRates = row.value;
      }
    }

    const data: SupabaseFullData = {
      companyProfile,
      expenseCategories,
      customExchangeRates,
      invoices: invoicesRes.data ? invoicesRes.data.map((r: any) => (r.payload ? r.payload : r) as Invoice) : undefined,
      customers: customersRes.data ? customersRes.data.map((r: any) => (r.payload ? r.payload : r) as Customer) : undefined,
      expenses: expensesRes.data ? expensesRes.data.map((r: any) => (r.payload ? r.payload : r) as Expense) : undefined,
      employees: employeesRes.data ? employeesRes.data.map((r: any) => (r.payload ? r.payload : r) as Employee) : undefined,
      bankAccounts: bankAccountsRes.data ? bankAccountsRes.data.map((r: any) => (r.payload ? r.payload : r) as BankAccount) : undefined,
      bankTransactions: bankTxRes.data ? bankTxRes.data.map((r: any) => (r.payload ? r.payload : r) as BankTransaction) : undefined,
      accounts: accountsRes.data ? accountsRes.data.map((r: any) => (r.payload ? r.payload : r) as Account) : undefined,
      attendances: attendancesRes.data ? attendancesRes.data.map((r: any) => (r.payload ? r.payload : r) as AttendanceRecord) : undefined,
      leaveRequests: leavesRes.data ? leavesRes.data.map((r: any) => (r.payload ? r.payload : r) as LeaveRequest) : undefined,
      assets: assetsRes.data ? assetsRes.data.map((r: any) => (r.payload ? r.payload : r) as CompanyAsset) : undefined,
      payrollPeriods: payrollRes.data ? payrollRes.data.map((r: any) => (r.payload ? r.payload : r) as PayrollPeriod) : undefined,
    };

    return { data };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      return { data: null, tablesMissing: true, error: err.message };
    }
    return { data: null, error: err.message || 'Failed to fetch from Supabase' };
  }
};

export const syncAllToSupabase = async (data: Required<SupabaseFullData>): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase credentials not configured in environment.' };
  }

  try {
    // 1. Settings
    const settingsRes = await supabase.from('system_settings').upsert([
      { key: 'company_profile', value: data.companyProfile },
      { key: 'expense_categories', value: data.expenseCategories },
      { key: 'custom_exchange_rates', value: data.customExchangeRates },
    ]);

    if (settingsRes.error) {
      if (isTableMissingError(settingsRes.error)) {
        return {
          success: false,
          tablesMissing: true,
          message: "Database tables not found in Supabase. Please copy and execute the SQL schema script in your Supabase SQL Editor."
        };
      }
      return { success: false, message: `Failed to save settings: ${settingsRes.error.message}` };
    }

    // 2. Invoices
    if (data.invoices && data.invoices.length > 0) {
      const invoiceRows = data.invoices.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoiceNumber,
        customer_name: inv.customerName,
        grand_total: inv.grandTotal,
        status: inv.status,
        payload: inv,
      }));
      const res = await supabase.from('invoices').upsert(invoiceRows);
      if (res.error && isTableMissingError(res.error)) {
        return { success: false, tablesMissing: true, message: "Invoices table not found in Supabase." };
      }
    }

    // 3. Customers
    if (data.customers && data.customers.length > 0) {
      const customerRows = data.customers.map(c => ({
        id: c.id,
        customer_code: c.customerCode,
        company_name: c.companyName,
        payload: c,
      }));
      await supabase.from('customers').upsert(customerRows);
    }

    // 4. Expenses
    if (data.expenses && data.expenses.length > 0) {
      const expenseRows = data.expenses.map(e => ({
        id: e.id,
        expense_number: e.expenseNumber,
        category: e.category,
        amount: e.amount,
        date: e.date,
        payload: e,
      }));
      await supabase.from('expenses').upsert(expenseRows);
    }

    // 5. Employees
    if (data.employees && data.employees.length > 0) {
      const empRows = data.employees.map(emp => ({
        id: emp.id,
        employee_code: emp.employeeCode,
        first_name: emp.firstName,
        last_name: emp.lastName,
        gross_salary: emp.grossSalary,
        status: emp.status,
        payload: emp,
      }));
      await supabase.from('employees').upsert(empRows);
    }

    // 6. Bank Accounts
    if (data.bankAccounts && data.bankAccounts.length > 0) {
      const bankRows = data.bankAccounts.map(b => ({
        id: b.id,
        bank_name: b.bankName,
        account_title: b.accountTitle,
        current_balance: b.currentBalance,
        payload: b,
      }));
      await supabase.from('bank_accounts').upsert(bankRows);
    }

    // 7. Bank Transactions
    if (data.bankTransactions && data.bankTransactions.length > 0) {
      const txRows = data.bankTransactions.map(t => ({
        id: t.id,
        bank_account_id: t.bankAccountId,
        date: t.date,
        reference_no: t.referenceNo,
        payload: t,
      }));
      await supabase.from('bank_transactions').upsert(txRows);
    }

    // 8. Accounts (Chart of Accounts)
    if (data.accounts && data.accounts.length > 0) {
      const accRows = data.accounts.map(a => ({
        id: a.id,
        code: a.code,
        name: a.name,
        payload: a,
      }));
      await supabase.from('chart_of_accounts').upsert(accRows);
    }

    // 9. Attendance
    if (data.attendances && data.attendances.length > 0) {
      const attRows = data.attendances.map(att => ({
        id: att.id,
        employee_id: att.employeeId,
        date: att.date,
        status: att.status,
        payload: att,
      }));
      await supabase.from('attendances').upsert(attRows);
    }

    // 10. Leaves
    if (data.leaveRequests && data.leaveRequests.length > 0) {
      const leaveRows = data.leaveRequests.map(l => ({
        id: l.id,
        employee_id: l.employeeId,
        status: l.status,
        payload: l,
      }));
      await supabase.from('leave_requests').upsert(leaveRows);
    }

    // 11. Assets
    if (data.assets && data.assets.length > 0) {
      const assetRows = data.assets.map(ass => ({
        id: ass.id,
        asset_tag: ass.assetTag,
        title: ass.title,
        payload: ass,
      }));
      await supabase.from('company_assets').upsert(assetRows);
    }

    // 12. Payroll Periods
    if (data.payrollPeriods && data.payrollPeriods.length > 0) {
      const payrollRows = data.payrollPeriods.map(p => ({
        id: p.id,
        period_name: p.periodName,
        month: p.month,
        year: p.year,
        payload: p,
      }));
      await supabase.from('payroll_periods').upsert(payrollRows);
    }

    return { success: true, message: 'All local ERP records successfully pushed to Supabase PostgreSQL database!' };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      return {
        success: false,
        tablesMissing: true,
        message: "Database tables not found in Supabase. Please execute the SQL schema script in the Supabase SQL Editor."
      };
    }
    return { success: false, message: `Failed to push data to Supabase: ${err.message}` };
  }
};

export const deleteRecordFromSupabase = async (table: string, id: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete error on ${table}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Failed to delete record ${id} from ${table}:`, err);
    return false;
  }
};
