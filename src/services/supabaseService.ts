import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { 
      success: false, 
      message: 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set.' 
    };
  }

  try {
    const { error } = await supabase.from('system_settings').select('key').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but tables do not exist yet. Please run the SQL schema script in the Supabase SQL editor.'
        };
      }
      return { success: false, message: `Supabase error: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Supabase.' };
  }
};

export const fetchAllFromSupabase = async (): Promise<SupabaseFullData | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
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

    return {
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
  } catch (err) {
    console.warn('Error fetching from Supabase:', err);
    return null;
  }
};

export const syncAllToSupabase = async (data: Required<SupabaseFullData>): Promise<{ success: boolean; message: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase credentials not configured in environment.' };
  }

  try {
    // 1. Settings
    await supabase.from('system_settings').upsert([
      { key: 'company_profile', value: data.companyProfile },
      { key: 'expense_categories', value: data.expenseCategories },
      { key: 'custom_exchange_rates', value: data.customExchangeRates },
    ]);

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
      await supabase.from('invoices').upsert(invoiceRows);
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
    return { success: false, message: `Failed to push data to Supabase: ${err.message}` };
  }
};
