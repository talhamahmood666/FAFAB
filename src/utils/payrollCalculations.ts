/**
 * Pakistani Statutory Payroll & Labor Compliance Calculations (Punjab, EOBI, PESSI, FBR)
 * 
 * Rules Implemented:
 * 1. EOBI (Employees' Old-Age Benefits Institution):
 *    - Benchmark Minimum Wage in Punjab: PKR 37,000
 *    - Employee Contribution: 1% of minimum wage = PKR 370/month
 *    - Employer Contribution: 5% of minimum wage = PKR 1,850/month
 * 
 * 2. PESSI (Punjab Employees' Social Security Institution):
 *    - 6% employer contribution for employees earning up to the statutory ceiling
 *    - Statutory wage ceiling in Punjab: PKR 37,000
 * 
 * 3. FBR Income Tax Slabs for Salaried Individuals (Section 149 - Current Fiscal Year):
 *    - Slab 1: Up to PKR 600,000/year (PKR 50,000/mo) -> 0%
 *    - Slab 2: PKR 600,001 - 1,200,000 -> 5% of excess over 600k
 *    - Slab 3: PKR 1,200,001 - 2,200,000 -> PKR 30,000 + 15% of excess over 1.2M
 *    - Slab 4: PKR 2,200,001 - 3,200,000 -> PKR 180,000 + 25% of excess over 2.2M
 *    - Slab 5: PKR 3,200,001 - 4,100,000 -> PKR 430,000 + 30% of excess over 3.2M
 *    - Slab 6: Above PKR 4,100,000 -> PKR 700,000 + 35% of excess over 4.1M
 *    - Monthly tax withholding = Annual Tax / 12
 */

export const PUNJAB_MINIMUM_WAGE = 37000; // PKR 37,000 notified minimum wage
export const EOBI_EMPLOYEE_RATE = 0.01;   // 1%
export const EOBI_EMPLOYER_RATE = 0.05;   // 5%
export const PESSI_EMPLOYER_RATE = 0.06;  // 6%

/**
 * Standard Pakistani Salary Structure Breakdown:
 * Basic Salary: ~50% of Gross
 * House Rent Allowance (HRA): 45% of Basic Salary
 * Medical Allowance: 10% of Basic Salary (tax-exempt under clause 139)
 * Conveyance Allowance: Remainder
 */
export function calculateSalaryStructureFromGross(grossSalary: number) {
  const basicSalary = Math.round(grossSalary * 0.50);
  const houseRentAllowance = Math.round(basicSalary * 0.45);
  const medicalAllowance = Math.round(basicSalary * 0.10);
  const conveyanceAllowance = Math.max(0, grossSalary - basicSalary - houseRentAllowance - medicalAllowance);

  return {
    grossSalary,
    basicSalary,
    houseRentAllowance,
    medicalAllowance,
    conveyanceAllowance,
  };
}

/**
 * Calculate Monthly EOBI Contributions (PKR)
 */
export function calculateEobi(isApplicable: boolean = true) {
  if (!isApplicable) {
    return { employeeDeduction: 0, employerContribution: 0 };
  }
  const employeeDeduction = Math.round(PUNJAB_MINIMUM_WAGE * EOBI_EMPLOYEE_RATE); // PKR 370
  const employerContribution = Math.round(PUNJAB_MINIMUM_WAGE * EOBI_EMPLOYER_RATE); // PKR 1,850

  return {
    employeeDeduction,
    employerContribution,
  };
}

/**
 * Calculate Monthly PESSI (Punjab Employees' Social Security Institution)
 * 6% borne solely by Employer for wages within Punjab statutory ceiling
 */
export function calculatePessi(monthlyWage: number, isApplicable: boolean = true) {
  if (!isApplicable || monthlyWage > PUNJAB_MINIMUM_WAGE * 1.5) {
    // Highly compensated executives are exempt from PESSI
    return { employerContribution: 0 };
  }
  const wageBase = Math.min(monthlyWage, PUNJAB_MINIMUM_WAGE);
  const employerContribution = Math.round(wageBase * PESSI_EMPLOYER_RATE); // Max PKR 2,220

  return {
    employerContribution,
  };
}

/**
 * Calculate FBR Section 149 Annual and Monthly Salaried Income Tax
 */
export function calculateSalariedIncomeTax(monthlyTaxableGross: number) {
  const annualGross = monthlyTaxableGross * 12;
  let annualTax = 0;

  if (annualGross <= 600000) {
    annualTax = 0;
  } else if (annualGross <= 1200000) {
    annualTax = (annualGross - 600000) * 0.05;
  } else if (annualGross <= 2200000) {
    annualTax = 30000 + (annualGross - 1200000) * 0.15;
  } else if (annualGross <= 3200000) {
    annualTax = 180000 + (annualGross - 2200000) * 0.25;
  } else if (annualGross <= 4100000) {
    annualTax = 430000 + (annualGross - 3200000) * 0.30;
  } else {
    annualTax = 700000 + (annualGross - 4100000) * 0.35;
  }

  const monthlyTax = Math.round((annualTax / 12) * 100) / 100;

  return {
    annualGross,
    annualTax: Math.round(annualTax * 100) / 100,
    monthlyTax,
  };
}

/**
 * Full Monthly Payroll Deduction and Net Pay Engine
 */
export function computeEmployeeMonthlyPayroll(
  grossSalary: number,
  options: {
    isEobiApplicable?: boolean;
    isPessiApplicable?: boolean;
    isTaxApplicable?: boolean;
    unpaidLeaveDays?: number;
    otherDeductions?: number;
    bonus?: number;
    totalMonthDays?: number;
  } = {}
) {
  const {
    isEobiApplicable = true,
    isPessiApplicable = true,
    isTaxApplicable = true,
    unpaidLeaveDays = 0,
    otherDeductions = 0,
    bonus = 0,
    totalMonthDays = 30,
  } = options;

  // Unpaid leave deduction (pro-rata based on days)
  const perDayRate = totalMonthDays > 0 ? grossSalary / totalMonthDays : 0;
  const unpaidLeaveDeduction = Math.round(perDayRate * unpaidLeaveDays * 100) / 100;
  const adjustedGross = Math.max(0, grossSalary - unpaidLeaveDeduction + bonus);

  // EOBI
  const eobi = calculateEobi(isEobiApplicable);

  // PESSI
  const pessi = calculatePessi(grossSalary, isPessiApplicable);

  // FBR Income Tax on adjusted gross
  const tax = isTaxApplicable ? calculateSalariedIncomeTax(adjustedGross) : { monthlyTax: 0, annualTax: 0, annualGross: 0 };

  const totalEmployeeDeductions = Math.round(
    (eobi.employeeDeduction + tax.monthlyTax + unpaidLeaveDeduction + otherDeductions) * 100
  ) / 100;

  const netSalary = Math.round((adjustedGross - eobi.employeeDeduction - tax.monthlyTax - otherDeductions) * 100) / 100;

  return {
    baseGross: grossSalary,
    bonus,
    unpaidLeaveDeduction,
    adjustedGross,
    eobiEmployee: eobi.employeeDeduction,
    eobiEmployer: eobi.employerContribution,
    pessiEmployer: pessi.employerContribution,
    incomeTaxFbr: tax.monthlyTax,
    annualProjectedTax: tax.annualTax,
    otherDeductions,
    totalDeductions: totalEmployeeDeductions,
    netSalary,
  };
}
