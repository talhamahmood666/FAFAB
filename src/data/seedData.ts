import { 
  Account, 
  BankAccount, 
  BankTransaction, 
  CompanyProfile, 
  Customer, 
  Expense, 
  Invoice 
} from '../types/erp';

export const companyProfileData: CompanyProfile = {
  name: 'FAFAB Limited',
  tradeName: 'FAFAB',
  registrationNo: '0194821-B (SECP Registered)',
  ntn: '8943210-7',
  strn: '32-77-8761-234-56',
  praRegNo: 'PRA-LHR-2024-9912',
  eobiRegNo: 'LHR-EOBI-77123',
  pessiRegNo: 'PESSI-PB-88219',
  address: 'Plot 12-A, Commercial Area, Sector C, Bahria Town',
  city: 'Lahore',
  province: 'Punjab',
  postalCode: '53720',
  email: 'finance@fafablimited.pk',
  phone: '+92 42 3786 1122',
  website: 'https://fafablimited.pk',
  defaultBank: {
    bankName: 'Meezan Bank Limited',
    branchName: 'Sector C, Bahria Town Branch, Lahore (Br. Code: 0219)',
    accountTitle: 'FAFAB Limited - Operating Account',
    accountNumber: '02190104889101',
    iban: 'PK72MEZN0002190104889101',
  },
};

// Clean empty database collections
export const initialCustomers: Customer[] = [];

export const initialInvoices: Invoice[] = [];

export const initialExpenses: Expense[] = [];

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'bank-1',
    accountTitle: 'FAFAB Limited - Main Operational Account',
    bankName: 'Meezan Bank Limited',
    branchName: 'Sector C, Bahria Town Branch, Lahore (Br. Code: 0219)',
    accountNumber: '02190104889101',
    iban: 'PK72MEZN0002190104889101',
    currentBalance: 0,
    currency: 'PKR',
  },
  {
    id: 'bank-2',
    accountTitle: 'FAFAB Limited - Tax & Reserves Escrow',
    bankName: 'Habib Bank Limited (HBL)',
    branchName: 'Bahria Town Branch, Lahore (Br. Code: 1488)',
    accountNumber: '14887900124503',
    iban: 'PK45HABB0014887900124503',
    currentBalance: 0,
    currency: 'PKR',
  },
  {
    id: 'bank-3',
    accountTitle: 'Office Petty Cash Vault (Secure)',
    bankName: 'Cash in Hand (Bahria Town Office)',
    branchName: 'Administrative Safe - Bahria Town',
    accountNumber: 'VAULT-LHR-001',
    iban: 'N/A (Cash in Hand)',
    currentBalance: 0,
    currency: 'PKR',
  },
];

export const initialBankTransactions: BankTransaction[] = [];

export const initialAccounts: Account[] = [
  // Assets (1000s)
  { id: 'acc-1', code: '1010', name: 'Petty Cash in Hand', type: 'ASSET', category: 'Current Assets', balance: 0 },
  { id: 'acc-2', code: '1020', name: 'Meezan Bank (Bahria Town Branch)', type: 'ASSET', category: 'Current Assets', balance: 0 },
  { id: 'acc-3', code: '1030', name: 'HBL Tax & Reserves Account', type: 'ASSET', category: 'Current Assets', balance: 0 },
  { id: 'acc-4', code: '1100', name: 'Accounts Receivable (Trade Debtors)', type: 'ASSET', category: 'Current Assets', balance: 0 },
  { id: 'acc-5', code: '1200', name: 'Office Computers, Laptops & Servers', type: 'ASSET', category: 'Non-Current Assets', balance: 0 },
  { id: 'acc-6', code: '1210', name: 'Office Furniture & Fixtures (Bahria Town)', type: 'ASSET', category: 'Non-Current Assets', balance: 0 },

  // Liabilities (2000s)
  { id: 'acc-7', code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'LIABILITY', category: 'Current Liabilities', balance: 0 },
  { id: 'acc-8', code: '2100', name: 'PRA Punjab Sales Tax Payable (16%)', type: 'LIABILITY', category: 'Current Liabilities', balance: 0 },
  { id: 'acc-9', code: '2110', name: 'FBR Withholding Tax Payable (Sec 153/149)', type: 'LIABILITY', category: 'Current Liabilities', balance: 0 },
  { id: 'acc-10', code: '2120', name: 'EOBI & PESSI Statutory Contributions Payable', type: 'LIABILITY', category: 'Current Liabilities', balance: 0 },

  // Equity (3000s)
  { id: 'acc-11', code: '3010', name: 'Paid-Up Share Capital (FAFAB Limited)', type: 'EQUITY', category: 'Equity', balance: 0 },
  { id: 'acc-12', code: '3020', name: 'Retained Earnings & Reserves', type: 'EQUITY', category: 'Equity', balance: 0 },

  // Revenue (4000s)
  { id: 'acc-13', code: '4010', name: 'Enterprise Software Engineering Services', type: 'REVENUE', category: 'Operating Revenue', balance: 0 },
  { id: 'acc-14', code: '4020', name: 'Cloud Architecture & Consulting Services', type: 'REVENUE', category: 'Operating Revenue', balance: 0 },

  // Expenses (5000s)
  { id: 'acc-15', code: '5010', name: 'Commercial Office Rent - Bahria Town', type: 'EXPENSE', category: 'Operating Expenses', balance: 0 },
  { id: 'acc-16', code: '5020', name: 'LESCO Electricity & Utilities', type: 'EXPENSE', category: 'Operating Expenses', balance: 0 },
  { id: 'acc-17', code: '5030', name: 'Nayatel Internet & Connectivity', type: 'EXPENSE', category: 'Operating Expenses', balance: 0 },
  { id: 'acc-18', code: '5040', name: 'Cloud Infrastructure (AWS / Azure)', type: 'EXPENSE', category: 'Operating Expenses', balance: 0 },
  { id: 'acc-19', code: '5050', name: 'Fleet Fuel & Logistics', type: 'EXPENSE', category: 'Operating Expenses', balance: 0 },
  { id: 'acc-20', code: '5060', name: 'Staff Refreshments & Kitchen Pantry', type: 'EXPENSE', category: 'Operating Expenses', balance: 0 },
];
