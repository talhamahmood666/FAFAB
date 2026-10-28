/**
 * Tax & Accounting Calculations for Pakistan (FBR, PRA Punjab, Double-Entry)
 * All calculations avoid floating point drift by rounding to two decimal places.
 */

import { Account, InvoiceItem, TaxFilerStatus } from '../types/erp';

/**
 * Standard Punjab Revenue Authority (PRA) Provincial Sales Tax on Services rate
 */
export const PRA_STANDARD_RATE = 16.0; // 16% in Punjab

/**
 * Standard FBR Section 153 Withholding Tax rates on corporate services
 */
export const FBR_WHT_RATES = {
  SERVICES_FILER: 3.0,     // 3% for Active Tax Filer
  SERVICES_NON_FILER: 6.0, // 6% for Non-Filer
  GOODS_FILER: 4.0,        // 4% for Active Tax Filer
  GOODS_NON_FILER: 8.0,    // 8% for Non-Filer
};

/**
 * Format number into Pakistani Rupee representation
 * Example: 1500000 -> "Rs. 1,500,000" or "PKR 1,500,000"
 */
export function formatPKR(amount: number, prefix: 'Rs.' | 'PKR' = 'Rs.'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${prefix} 0.00`;
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${prefix} ${formatted}`;
}

/**
 * Calculate line item amounts and Pakistani Tax subtotals
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  discountAmount: number = 0,
  praRate: number = PRA_STANDARD_RATE,
  whtRate: number = 0,
  amountPaid: number = 0
) {
  let subTotal = 0;
  let praTaxableSubtotal = 0;

  for (const item of items) {
    const lineTotal = Math.round((Number(item.quantity) * Number(item.unitPrice)) * 100) / 100;
    subTotal += lineTotal;
    if (item.praApplicable) {
      praTaxableSubtotal += lineTotal;
    }
  }

  // Round subtotal
  subTotal = Math.round(subTotal * 100) / 100;
  const safeDiscount = Math.min(Math.max(0, discountAmount), subTotal);

  // PRA 16% Punjab Sales Tax on services
  const praTaxAmount = Math.round((praTaxableSubtotal * (praRate / 100)) * 100) / 100;

  // Withholding Tax by customer under FBR Sec 153 (usually deducted at payment time)
  const withholdingTaxAmount = Math.round((subTotal * (whtRate / 100)) * 100) / 100;

  // Grand Total invoiced to client
  const grandTotal = Math.round((subTotal - safeDiscount + praTaxAmount) * 100) / 100;

  // Outstanding receivable balance
  const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100);

  return {
    subTotal,
    discountAmount: safeDiscount,
    praTaxableSubtotal,
    praTaxAmount,
    withholdingTaxAmount,
    grandTotal,
    amountPaid,
    balanceDue,
  };
}

/**
 * Determine default FBR WHT rate based on Active Filer status
 */
export function getRecommendedWhtRate(filerStatus: TaxFilerStatus, isService: boolean = true): number {
  if (filerStatus === 'EXEMPT') return 0;
  if (isService) {
    return filerStatus === 'ACTIVE_FILER' 
      ? FBR_WHT_RATES.SERVICES_FILER 
      : FBR_WHT_RATES.SERVICES_NON_FILER;
  }
  return filerStatus === 'ACTIVE_FILER' 
    ? FBR_WHT_RATES.GOODS_FILER 
    : FBR_WHT_RATES.GOODS_NON_FILER;
}

/**
 * Calculate Profit and Loss Statement metrics from Chart of Accounts
 */
export function calculateProfitAndLoss(accounts: Account[]) {
  const revenueAccounts = accounts.filter(a => a.type === 'REVENUE');
  const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE');

  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalOperatingExpenses = expenseAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netIncome = Math.round((totalRevenue - totalOperatingExpenses) * 100) / 100;
  const netProfitMargin = totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 10000) / 100 : 0;

  return {
    revenueAccounts,
    expenseAccounts,
    totalRevenue,
    totalOperatingExpenses,
    netIncome,
    netProfitMargin,
  };
}

/**
 * Calculate Balance Sheet metrics ensuring Double-Entry validation:
 * Assets = Liabilities + Equity
 */
export function calculateBalanceSheet(accounts: Account[], netRetainedEarnings: number = 0) {
  const assetAccounts = accounts.filter(a => a.type === 'ASSET');
  const liabilityAccounts = accounts.filter(a => a.type === 'LIABILITY');
  const equityAccounts = accounts.filter(a => a.type === 'EQUITY');

  const totalAssets = Math.round(assetAccounts.reduce((sum, a) => sum + a.balance, 0) * 100) / 100;
  const totalLiabilities = Math.round(liabilityAccounts.reduce((sum, a) => sum + a.balance, 0) * 100) / 100;
  const baseEquity = Math.round(equityAccounts.reduce((sum, a) => sum + a.balance, 0) * 100) / 100;
  const totalEquity = Math.round((baseEquity + netRetainedEarnings) * 100) / 100;

  const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;
  const difference = Math.round((totalAssets - totalLiabilitiesAndEquity) * 100) / 100;
  const isBalanced = Math.abs(difference) < 0.05;

  return {
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    difference,
    isBalanced,
  };
}
