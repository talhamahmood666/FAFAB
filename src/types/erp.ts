/**
 * Types & Data Models for FAFAB Limited ERP
 * Bahria Town, Lahore, Pakistan
 */

import { SupportedCurrency } from '../utils/currency';

export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'HR_MANAGER' | 'EMPLOYEE';

export type TaxFilerStatus = 'ACTIVE_FILER' | 'NON_FILER' | 'EXEMPT';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 
  | 'BANK_TRANSFER' 
  | 'CHEQUE' 
  | 'CASH' 
  | 'PAY_ORDER' 
  | 'RAAST_INSTANT_PAYMENT';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'PROBATION' | 'INTERN';

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'HOLIDAY';

export type LeaveType = 'CASUAL' | 'SICK' | 'ANNUAL' | 'MATERNITY' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AssetCategory = 'Laptop' | 'Desktop' | 'Mobile Phone' | 'Vehicle' | 'Office Equipment';

export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_REPAIR' | 'DECOMMISSIONED';

export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'PAID';

export interface CompanyProfile {
  name: string;
  tradeName: string;
  registrationNo: string; // SECP
  ntn: string;            // FBR NTN
  strn: string;           // PRA / FBR Sales Tax
  praRegNo: string;       // Punjab Revenue Authority
  eobiRegNo: string;
  pessiRegNo: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  email: string;
  phone: string;
  website: string;
  defaultBank: {
    bankName: string;
    branchName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
}

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  ntn?: string;
  strn?: string;
  taxFilerStatus: TaxFilerStatus;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // PKR
  amount: number;    // PKR
  praApplicable: boolean; // 16% PRA GST
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "FAFAB-INV-2026-0042"
  customerId: string;
  customerName: string;
  customerNtn?: string;
  customerStrn?: string;
  customerAddress: string;
  issueDate: string;     // YYYY-MM-DD
  dueDate: string;       // YYYY-MM-DD
  status: InvoiceStatus;
  items: InvoiceItem[];
  subTotal: number;
  discountAmount: number;
  praTaxRate: number;    // Default 16% for Punjab
  praTaxAmount: number;  // In PKR
  withholdingTaxRate: number; // e.g. 3% for active filers under Sec 153
  withholdingTaxAmount: number;
  grandTotal: number;    // Subtotal + PRA Tax - Discount
  amountPaid: number;
  balanceDue: number;
  currency?: SupportedCurrency;
  exchangeRate?: number;
  notes?: string;
  paymentTerms: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. "EXP-2026-081"
  category: string;
  vendorName: string;
  vendorNtn?: string;
  date: string;
  currency?: SupportedCurrency;
  amount: number;
  salesTaxPaid: number;
  whtDeducted: number;
  netPaid: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  receiptUrl?: string;
  description: string;
  isReconciled: boolean;
}

export interface Account {
  id: string;
  code: string;       // "1010", "1020", etc.
  name: string;
  type: AccountType;
  category: string;
  balance: number;    // PKR
  description?: string;
}

export interface BankAccount {
  id: string;
  accountTitle: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  iban: string;
  currentBalance: number;
  currency: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  referenceNo: string;
  debit: number;   // Deposit
  credit: number;  // Withdrawal
  runningBalance: number;
  isReconciled: boolean;
}

// ----------------------------------------------------------------------------
// HR & PAYROLL MODULE TYPES
// ----------------------------------------------------------------------------

export interface Employee {
  id: string;
  employeeCode: string; // e.g. "FAFAB-EMP-001"
  firstName: string;
  lastName: string;
  urduName?: string;
  cnicNumber: string;   // e.g. "35201-8472199-3"
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  residentialAddress: string; // Bahria Town Lahore address
  city: string;
  department: string;
  designation: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  dateOfJoining: string;
  eobiNumber?: string;
  pessiNumber?: string;
  ntnNumber?: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  iban: string;
  grossSalary: number; // PKR
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string; // YYYY-MM-DD
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface CompanyAsset {
  id: string;
  assetTag: string; // e.g. "FAFAB-LPT-042"
  title: string;
  category: AssetCategory;
  serialNumber: string;
  assignedToId?: string;
  assignedToName?: string;
  purchaseCost: number; // PKR
  purchaseDate: string;
  status: AssetStatus;
}

export interface PayrollRecord {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  cnic: string;
  iban: string;
  bankName: string;
  basicSalary: number;
  houseRent: number;
  medical: number;
  conveyance: number;
  grossSalary: number;
  unpaidLeaveDays: number;
  unpaidLeaveDeduction: number;
  eobiEmployee: number;      // PKR 370
  eobiEmployer: number;      // PKR 1,850
  pessiEmployer: number;     // 6% of ceiling
  incomeTaxFbr: number;      // Section 149
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentReference?: string;
  disbursementDate?: string;
}

export interface PayrollPeriod {
  id: string;
  periodName: string; // e.g. "October 2026"
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status: PayrollStatus;
  totalGross: number;
  totalTaxDeducted: number;
  totalEobiEmployee: number;
  totalEobiEmployer: number;
  totalPessiEmployer: number;
  totalNetPayable: number;
  disbursementDate?: string;
  records: PayrollRecord[];
}

export type ActiveModule = 
  | 'dashboard' 
  | 'projections'
  | 'invoices' 
  | 'expenses' 
  | 'accounts' 
  | 'banking' 
  | 'reports' 
  | 'employees' 
  | 'payroll' 
  | 'attendance' 
  | 'leaves' 
  | 'assets';
