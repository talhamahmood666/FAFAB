import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Account, 
  ActiveModule, 
  AttendanceRecord, 
  AttendanceStatus, 
  BankAccount, 
  BankTransaction, 
  CompanyProfile, 
  CompanyAsset, 
  Customer, 
  Employee, 
  Expense, 
  Invoice, 
  InvoiceStatus, 
  LeaveRequest, 
  LeaveStatus, 
  PayrollPeriod, 
  PayrollRecord, 
  PayrollStatus, 
  UserRole 
} from '../types/erp';
import { 
  companyProfileData, 
  initialAccounts, 
  initialBankAccounts, 
  initialBankTransactions, 
  initialCustomers, 
  initialExpenses, 
  initialInvoices 
} from '../data/seedData';
import { 
  generateInitialPayrollPeriod, 
  initialAssets, 
  initialAttendances, 
  initialEmployees, 
  initialLeaves 
} from '../data/hrSeedData';
import { 
  calculateSalaryStructureFromGross, 
  computeEmployeeMonthlyPayroll 
} from '../utils/payrollCalculations';
import { SupportedCurrency, DEFAULT_CURRENCIES, formatBasePKR } from '../utils/currency';

interface ErpContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  // Multi-Currency
  selectedCurrency: SupportedCurrency;
  setSelectedCurrency: (curr: SupportedCurrency) => void;
  customExchangeRates: Record<SupportedCurrency, number>;
  setExchangeRate: (code: SupportedCurrency, rate: number) => void;
  formatAmount: (amountInPKR: number) => string;

  // Company Profile
  companyProfile: CompanyProfile;

  // Invoicing & Customers
  invoices: Invoice[];
  customers: Customer[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  recordInvoicePayment: (id: string, amount: number, method: string, refNo: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'customerCode'>) => Customer;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber'>) => void;
  deleteExpense: (id: string) => void;

  // Accounts & General Ledger
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => void;

  // Banking
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  addBankTransaction: (tx: Omit<BankTransaction, 'id'>) => void;
  reconcileBankTransaction: (id: string) => void;

  // HR & Employee Management (Module 2)
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'employeeCode'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  attendances: AttendanceRecord[];
  logAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus) => void;
  assets: CompanyAsset[];
  addAsset: (asset: Omit<CompanyAsset, 'id'>) => void;
  assignAsset: (assetId: string, employeeId: string, employeeName: string) => void;

  // Payroll Engine (Module 4)
  payrollPeriods: PayrollPeriod[];
  currentPayrollPeriod: PayrollPeriod;
  selectedPayslip: PayrollRecord | null;
  setSelectedPayslip: (record: PayrollRecord | null) => void;
  runMonthlyPayroll: (month: number, year: number) => PayrollPeriod;
  disbursePayrollPeriod: (periodId: string) => void;

  // Search & Global filter
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyProfile] = useState<CompanyProfile>(companyProfileData);

  // Multi-Currency State
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(() => {
    const saved = localStorage.getItem('fafab_currency');
    return (saved as SupportedCurrency) || 'PKR';
  });

  const [customExchangeRates, setCustomExchangeRates] = useState<Record<SupportedCurrency, number>>(() => {
    const saved = localStorage.getItem('fafab_exchange_rates');
    return saved ? JSON.parse(saved) : {
      PKR: DEFAULT_CURRENCIES.PKR.rateToPKR,
      USD: DEFAULT_CURRENCIES.USD.rateToPKR,
      GBP: DEFAULT_CURRENCIES.GBP.rateToPKR,
      EUR: DEFAULT_CURRENCIES.EUR.rateToPKR,
    };
  });

  useEffect(() => {
    localStorage.setItem('fafab_currency', selectedCurrency);
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('fafab_exchange_rates', JSON.stringify(customExchangeRates));
  }, [customExchangeRates]);

  const setExchangeRate = (code: SupportedCurrency, rate: number) => {
    setCustomExchangeRates(prev => ({ ...prev, [code]: rate }));
  };

  const formatAmount = (amountInPKR: number): string => {
    return formatBasePKR(amountInPKR, selectedCurrency, customExchangeRates);
  };

  // Accounting State
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('fafab_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('fafab_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('fafab_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('fafab_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('fafab_bank_accounts');
    return saved ? JSON.parse(saved) : initialBankAccounts;
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    const saved = localStorage.getItem('fafab_bank_txs');
    return saved ? JSON.parse(saved) : initialBankTransactions;
  });

  // HR State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('fafab_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('fafab_attendances');
    return saved ? JSON.parse(saved) : initialAttendances;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('fafab_leaves');
    return saved ? JSON.parse(saved) : initialLeaves;
  });

  const [assets, setAssets] = useState<CompanyAsset[]>(() => {
    const saved = localStorage.getItem('fafab_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  // Payroll State
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>(() => {
    const saved = localStorage.getItem('fafab_payroll_periods');
    return saved ? JSON.parse(saved) : [generateInitialPayrollPeriod()];
  });

  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Clear legacy cached dummy data and enforce clean empty state
  useEffect(() => {
    const dbVer = localStorage.getItem('fafab_db_version');
    if (dbVer !== 'v2_empty_clean') {
      localStorage.setItem('fafab_db_version', 'v2_empty_clean');
      setInvoices(initialInvoices);
      setCustomers(initialCustomers);
      setExpenses(initialExpenses);
      setAccounts(initialAccounts);
      setBankAccounts(initialBankAccounts);
      setBankTransactions(initialBankTransactions);
      setEmployees(initialEmployees);
      setAttendances(initialAttendances);
      setLeaveRequests(initialLeaves);
      setAssets(initialAssets);
      setPayrollPeriods([generateInitialPayrollPeriod()]);
    }
  }, []);

  // Storage Sync
  useEffect(() => {
    localStorage.setItem('fafab_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('fafab_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('fafab_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('fafab_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('fafab_bank_txs', JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem('fafab_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('fafab_attendances', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('fafab_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('fafab_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('fafab_payroll_periods', JSON.stringify(payrollPeriods));
  }, [payrollPeriods]);

  // Invoice Handlers
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const id = `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Update Accounts Receivable (1100) and Output Tax (2100) in PKR
    const rate = (newInvoice.currency && newInvoice.currency !== 'PKR' && newInvoice.exchangeRate) ? newInvoice.exchangeRate : 1;
    const pkrBalanceDue = newInvoice.balanceDue * rate;
    const pkrPraTax = newInvoice.praTaxAmount * rate;

    setAccounts(prev => prev.map(acc => {
      if (acc.code === '1100') {
        return { ...acc, balance: acc.balance + pkrBalanceDue };
      }
      if (acc.code === '2100') {
        return { ...acc, balance: acc.balance + pkrPraTax };
      }
      return acc;
    }));

    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(prev => prev ? { ...prev, status } : null);
    }
  };

  const recordInvoicePayment = (id: string, amount: number, method: string, refNo: string) => {
    const inv = invoices.find(i => i.id === id);
    const rate = (inv?.currency && inv.currency !== 'PKR' && inv.exchangeRate) ? inv.exchangeRate : 1;
    const pkrAmount = amount * rate;

    setInvoices(prev => prev.map(i => {
      if (i.id === id) {
        const newPaid = Math.min(i.grandTotal, i.amountPaid + amount);
        const newBalance = Math.max(0, i.grandTotal - newPaid);
        const newStatus: InvoiceStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';
        return {
          ...i,
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newStatus,
        };
      }
      return i;
    }));

    setBankAccounts(prev => prev.map(bank => {
      if (bank.id === 'bank-1') {
        return { ...bank, currentBalance: bank.currentBalance + pkrAmount };
      }
      return bank;
    }));

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      bankAccountId: 'bank-1',
      date: new Date().toISOString().split('T')[0],
      description: `Payment for Invoice ${inv?.invoiceNumber || ''} (${method}${inv?.currency && inv.currency !== 'PKR' ? ` @ ${amount} ${inv.currency}` : ''})`,
      referenceNo: refNo || `REF-${Date.now().toString().slice(-6)}`,
      debit: pkrAmount,
      credit: 0,
      runningBalance: (bankAccounts.find(b => b.id === 'bank-1')?.currentBalance || 0) + pkrAmount,
      isReconciled: true,
    };
    setBankTransactions(prev => [newTx, ...prev]);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'customerCode'>): Customer => {
    const id = `cust-${Date.now()}`;
    const customerCode = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = { ...customerData, id, customerCode };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  // Expenses Handlers
  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseNumber'>) => {
    const id = `exp-${Date.now()}`;
    const expenseNumber = `EXP-2026-${String(expenses.length + 87).padStart(3, '0')}`;
    const newExpense: Expense = { ...expenseData, id, expenseNumber };
    setExpenses(prev => [newExpense, ...prev]);

    const targetBankId = expenseData.paymentMethod === 'CASH' ? 'bank-3' : 'bank-1';
    setBankAccounts(prev => prev.map(bank => {
      if (bank.id === targetBankId) {
        return { ...bank, currentBalance: Math.max(0, bank.currentBalance - expenseData.netPaid) };
      }
      return bank;
    }));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Accounts Handlers
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...accountData, id: `acc-${Date.now()}` }]);
  };

  // Banking Handlers
  const addBankTransaction = (txData: Omit<BankTransaction, 'id'>) => {
    setBankTransactions(prev => [{ ...txData, id: `tx-${Date.now()}` }, ...prev]);
  };

  const reconcileBankTransaction = (id: string) => {
    setBankTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, isReconciled: !tx.isReconciled } : tx));
  };

  // HR Handlers
  const addEmployee = (empData: Omit<Employee, 'id' | 'employeeCode'>): Employee => {
    const id = `emp-${Date.now()}`;
    const employeeCode = `FAFAB-EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmployee: Employee = {
      ...empData,
      id,
      employeeCode,
    };
    setEmployees(prev => [newEmployee, ...prev]);
    return newEmployee;
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedFields } : emp));
  };

  const logAttendance = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const id = `att-${Date.now()}`;
    setAttendances(prev => [{ ...recordData, id }, ...prev]);
  };

  const submitLeaveRequest = (leaveData: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => {
    const id = `lve-${Date.now()}`;
    const newLeave: LeaveRequest = {
      ...leaveData,
      id,
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const addAsset = (assetData: Omit<CompanyAsset, 'id'>) => {
    const id = `ast-${Date.now()}`;
    setAssets(prev => [{ ...assetData, id }, ...prev]);
  };

  const assignAsset = (assetId: string, employeeId: string, employeeName: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          assignedToId: employeeId,
          assignedToName: employeeName,
          status: 'ASSIGNED',
        };
      }
      return a;
    }));
  };

  // Payroll Handlers
  const runMonthlyPayroll = (month: number, year: number): PayrollPeriod => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const periodName = `${monthNames[month - 1]} ${year}`;
    const periodId = `payroll-${year}-${String(month).padStart(2, '0')}`;

    let totalGross = 0;
    let totalTax = 0;
    let totalEobiEmp = 0;
    let totalEobiEmpr = 0;
    let totalPessiEmpr = 0;
    let totalNet = 0;

    const records: PayrollRecord[] = employees.filter(e => e.status === 'ACTIVE').map(emp => {
      const structure = calculateSalaryStructureFromGross(emp.grossSalary);
      const result = computeEmployeeMonthlyPayroll(emp.grossSalary);

      totalGross += result.adjustedGross;
      totalTax += result.incomeTaxFbr;
      totalEobiEmp += result.eobiEmployee;
      totalEobiEmpr += result.eobiEmployer;
      totalPessiEmpr += result.pessiEmployer;
      totalNet += result.netSalary;

      return {
        id: `pr-${emp.id}-${year}-${month}`,
        payrollPeriodId: periodId,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        designation: emp.designation,
        department: emp.department,
        cnic: emp.cnicNumber,
        iban: emp.iban,
        bankName: emp.bankName,
        basicSalary: structure.basicSalary,
        houseRent: structure.houseRentAllowance,
        medical: structure.medicalAllowance,
        conveyance: structure.conveyanceAllowance,
        grossSalary: emp.grossSalary,
        unpaidLeaveDays: 0,
        unpaidLeaveDeduction: 0,
        eobiEmployee: result.eobiEmployee,
        eobiEmployer: result.eobiEmployer,
        pessiEmployer: result.pessiEmployer,
        incomeTaxFbr: result.incomeTaxFbr,
        otherDeductions: 0,
        totalDeductions: result.totalDeductions,
        netSalary: result.netSalary,
        status: 'PROCESSED',
        paymentReference: `MEZN-SAL-${monthNames[month - 1].slice(0, 3).toUpperCase()}-${emp.employeeCode.slice(-3)}`,
        disbursementDate: new Date().toISOString().split('T')[0],
      };
    });

    const newPeriod: PayrollPeriod = {
      id: periodId,
      periodName,
      month,
      year,
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      endDate: `${year}-${String(month).padStart(2, '0')}-30`,
      status: 'PROCESSED',
      totalGross,
      totalTaxDeducted: totalTax,
      totalEobiEmployee: totalEobiEmp,
      totalEobiEmployer: totalEobiEmpr,
      totalPessiEmployer: totalPessiEmpr,
      totalNetPayable: totalNet,
      records,
    };

    setPayrollPeriods(prev => [newPeriod, ...prev.filter(p => p.id !== periodId)]);
    return newPeriod;
  };

  const disbursePayrollPeriod = (periodId: string) => {
    const period = payrollPeriods.find(p => p.id === periodId);
    if (!period) return;

    // Deduct total net salary from Meezan Bank operating account
    setBankAccounts(prev => prev.map(b => {
      if (b.id === 'bank-1') {
        return { ...b, currentBalance: Math.max(0, b.currentBalance - period.totalNetPayable) };
      }
      return b;
    }));

    // Add transaction log
    const tx: BankTransaction = {
      id: `tx-payroll-${Date.now()}`,
      bankAccountId: 'bank-1',
      date: new Date().toISOString().split('T')[0],
      description: `Direct Salary Wire Batch: ${period.periodName} (${period.records.length} Staff)`,
      referenceNo: `SAL-BATCH-${Date.now().toString().slice(-6)}`,
      debit: 0,
      credit: period.totalNetPayable,
      runningBalance: (bankAccounts.find(b => b.id === 'bank-1')?.currentBalance || 0) - period.totalNetPayable,
      isReconciled: true,
    };
    setBankTransactions(prev => [tx, ...prev]);

    // Update status to PAID
    setPayrollPeriods(prev => prev.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          status: 'PAID',
          disbursementDate: new Date().toISOString().split('T')[0],
          records: p.records.map(r => ({ ...r, status: 'PAID' })),
        };
      }
      return p;
    }));
  };

  const currentPayrollPeriod = payrollPeriods[0] || generateInitialPayrollPeriod();

  return (
    <ErpContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeModule,
        setActiveModule,
        isSidebarOpen,
        setIsSidebarOpen,
        companyProfile,
        selectedCurrency,
        setSelectedCurrency,
        customExchangeRates,
        setExchangeRate,
        formatAmount,
        invoices,
        customers,
        selectedInvoice,
        setSelectedInvoice,
        addInvoice,
        updateInvoiceStatus,
        recordInvoicePayment,
        addCustomer,
        expenses,
        addExpense,
        deleteExpense,
        accounts,
        addAccount,
        bankAccounts,
        bankTransactions,
        addBankTransaction,
        reconcileBankTransaction,
        employees,
        addEmployee,
        updateEmployee,
        attendances,
        logAttendance,
        leaveRequests,
        submitLeaveRequest,
        updateLeaveStatus,
        assets,
        addAsset,
        assignAsset,
        payrollPeriods,
        currentPayrollPeriod,
        selectedPayslip,
        setSelectedPayslip,
        runMonthlyPayroll,
        disbursePayrollPeriod,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
