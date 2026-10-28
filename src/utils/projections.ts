/**
 * Financial Projections & Forecasting Engine for FAFAB Limited
 * Computes monthly trends and generates forward-looking 6-month forecasts
 * for Revenue, Expenses, Payroll, PRA Sales Tax, and Cash Runway in Pakistani Rupees (PKR).
 */

export interface MonthlyDataPoint {
  month: string;           // e.g. "Jul 26", "Aug 26"
  isProjected: boolean;
  revenue: number;         // PKR
  expenses: number;        // PKR
  payroll: number;         // PKR
  netProfit: number;       // PKR
  praTaxLiability: number; // 16% on services
  cashBalance: number;     // Cumulative bank balance
}

export interface ScenarioParameters {
  revenueGrowthPercent: number; // e.g. 15 for +15%
  expenseInflationPercent: number; // e.g. 5 for +5%
  headcountAddition: number; // e.g. 2 new engineers
  averageNewHireSalary: number; // e.g. 150000 PKR
}

export const HISTORICAL_MONTHS: MonthlyDataPoint[] = [
  { month: 'Jul 26', isProjected: false, revenue: 0, expenses: 0, payroll: 0, netProfit: 0, praTaxLiability: 0, cashBalance: 0 },
  { month: 'Aug 26', isProjected: false, revenue: 0, expenses: 0, payroll: 0, netProfit: 0, praTaxLiability: 0, cashBalance: 0 },
  { month: 'Sep 26', isProjected: false, revenue: 0, expenses: 0, payroll: 0, netProfit: 0, praTaxLiability: 0, cashBalance: 0 },
  { month: 'Oct 26', isProjected: false, revenue: 0, expenses: 0, payroll: 0, netProfit: 0, praTaxLiability: 0, cashBalance: 0 },
];

/**
 * Generate forward 6-month projections based on baseline performance and scenario parameters
 */
export function generateSixMonthProjections(
  currentCash: number = 0,
  baselineMonthlyRevenue: number = 0,
  baselineMonthlyExpenses: number = 0,
  baselineMonthlyPayroll: number = 0,
  scenario: ScenarioParameters = {
    revenueGrowthPercent: 10,
    expenseInflationPercent: 4,
    headcountAddition: 0,
    averageNewHireSalary: 150000,
  }
): MonthlyDataPoint[] {
  const projectedMonths: MonthlyDataPoint[] = [];
  const futureMonthNames = ['Nov 26', 'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27'];

  let runningCash = currentCash;
  const growthMultiplier = 1 + scenario.revenueGrowthPercent / 100 / 6;
  const expenseMultiplier = 1 + scenario.expenseInflationPercent / 100 / 6;
  const additionalPayroll = scenario.headcountAddition * scenario.averageNewHireSalary;

  let currentRev = baselineMonthlyRevenue;
  let currentExp = baselineMonthlyExpenses;
  let currentPay = baselineMonthlyPayroll + additionalPayroll;

  for (let i = 0; i < futureMonthNames.length; i++) {
    currentRev = Math.round(currentRev * growthMultiplier);
    currentExp = Math.round(currentExp * expenseMultiplier);

    const totalOutflow = currentExp + currentPay;
    const netProfit = Math.round(currentRev - totalOutflow);
    const praTaxLiability = Math.round(currentRev * 0.16 * 100) / 100;
    runningCash = Math.round(runningCash + netProfit);

    projectedMonths.push({
      month: futureMonthNames[i],
      isProjected: true,
      revenue: currentRev,
      expenses: currentExp,
      payroll: currentPay,
      netProfit,
      praTaxLiability,
      cashBalance: runningCash,
    });
  }

  return projectedMonths;
}

/**
 * Calculate Cash Runway in months
 */
export function calculateRunwayMonths(currentLiquidCash: number, monthlyBurn: number): number {
  if (monthlyBurn <= 0) return currentLiquidCash > 0 ? 999 : 0;
  return Math.round((currentLiquidCash / monthlyBurn) * 10) / 10;
}

/**
 * Calculate Quarterly Tax Forecast for PRA and FBR
 */
export function calculateQuarterlyTaxForecast(projectedMonths: MonthlyDataPoint[]) {
  const q2Months = projectedMonths.slice(0, 2);
  const q3Months = projectedMonths.slice(2, 5);

  const q2PraTax = q2Months.reduce((sum, m) => sum + m.praTaxLiability, 0);
  const q3PraTax = q3Months.reduce((sum, m) => sum + m.praTaxLiability, 0);

  const q2EstimatedWht = q2Months.reduce((sum, m) => sum + m.revenue * 0.03, 0);
  const q3EstimatedWht = q3Months.reduce((sum, m) => sum + m.revenue * 0.03, 0);

  return {
    q2PraTax: Math.round(q2PraTax),
    q3PraTax: Math.round(q3PraTax),
    q2EstimatedWht: Math.round(q2EstimatedWht),
    q3EstimatedWht: Math.round(q3EstimatedWht),
  };
}
