import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatPKR, 
  calculateInvoiceTotals, 
  getRecommendedWhtRate, 
  calculateProfitAndLoss,
  calculateBalanceSheet,
  PRA_STANDARD_RATE 
} from './taxCalculations.ts';
import { Account, InvoiceItem } from '../types/erp.ts';

test('formatPKR formats amounts accurately in Pakistani Rupee standard', () => {
  assert.equal(formatPKR(0), 'Rs. 0.00');
  assert.equal(formatPKR(1500000), 'Rs. 1,500,000.00');
  assert.equal(formatPKR(250000.5, 'PKR'), 'PKR 250,000.50');
  assert.equal(formatPKR(-45000), '-Rs. 45,000.00');
});

test('calculateInvoiceTotals calculates 16% PRA and line items correctly', () => {
  const items: InvoiceItem[] = [
    {
      id: '1',
      description: 'Custom Enterprise ERP Module Development',
      quantity: 1,
      unitPrice: 500000,
      amount: 500000,
      praApplicable: true,
    },
    {
      id: '2',
      description: 'Cloud Server Setup (Exempt / Hardware)',
      quantity: 2,
      unitPrice: 50000,
      amount: 100000,
      praApplicable: false,
    }
  ];

  // Subtotal = 500,000 + 100,000 = 600,000
  // PRA Taxable = 500,000 * 16% = 80,000
  // Discount = 20,000
  // Grand Total = 600,000 - 20,000 + 80,000 = 660,000
  // WHT (3% on subtotal 600,000) = 18,000
  // Amount paid = 200,000 -> Balance Due = 460,000
  const result = calculateInvoiceTotals(items, 20000, PRA_STANDARD_RATE, 3.0, 200000);

  assert.equal(result.subTotal, 600000);
  assert.equal(result.discountAmount, 20000);
  assert.equal(result.praTaxableSubtotal, 500000);
  assert.equal(result.praTaxAmount, 80000);
  assert.equal(result.withholdingTaxAmount, 18000);
  assert.equal(result.grandTotal, 660000);
  assert.equal(result.balanceDue, 460000);
});

test('getRecommendedWhtRate returns correct FBR rates for filers vs non-filers', () => {
  assert.equal(getRecommendedWhtRate('ACTIVE_FILER', true), 3.0);
  assert.equal(getRecommendedWhtRate('NON_FILER', true), 6.0);
  assert.equal(getRecommendedWhtRate('ACTIVE_FILER', false), 4.0);
  assert.equal(getRecommendedWhtRate('NON_FILER', false), 8.0);
  assert.equal(getRecommendedWhtRate('EXEMPT', true), 0);
});

test('calculateProfitAndLoss computes Net Income and margin accurately', () => {
  const accounts: Account[] = [
    { id: '1', code: '4010', name: 'Software Services', type: 'REVENUE', category: 'Operating Revenue', balance: 2000000 },
    { id: '2', code: '4020', name: 'Consulting', type: 'REVENUE', category: 'Operating Revenue', balance: 500000 },
    { id: '3', code: '5010', name: 'Office Rent - Bahria Town', type: 'EXPENSE', category: 'Operating Expense', balance: 350000 },
    { id: '4', code: '5020', name: 'LESCO Electricity', type: 'EXPENSE', category: 'Utilities', balance: 150000 },
  ];

  const pnl = calculateProfitAndLoss(accounts);
  assert.equal(pnl.totalRevenue, 2500000);
  assert.equal(pnl.totalOperatingExpenses, 500000);
  assert.equal(pnl.netIncome, 2000000);
  assert.equal(pnl.netProfitMargin, 80);
});

test('calculateBalanceSheet verifies balance equation (Assets = Liabilities + Equity)', () => {
  const accounts: Account[] = [
    { id: '1', code: '1010', name: 'Cash in Hand', type: 'ASSET', category: 'Current Assets', balance: 100000 },
    { id: '2', code: '1020', name: 'Meezan Bank Bahria Town', type: 'ASSET', category: 'Current Assets', balance: 900000 },
    { id: '3', code: '2010', name: 'Accounts Payable', type: 'LIABILITY', category: 'Current Liabilities', balance: 250000 },
    { id: '4', code: '3010', name: 'Share Capital', type: 'EQUITY', category: 'Equity', balance: 750000 },
  ];

  const sheet = calculateBalanceSheet(accounts, 0);
  assert.equal(sheet.totalAssets, 1000000);
  assert.equal(sheet.totalLiabilities, 250000);
  assert.equal(sheet.totalEquity, 750000);
  assert.equal(sheet.totalLiabilitiesAndEquity, 1000000);
  assert.equal(sheet.isBalanced, true);
});
