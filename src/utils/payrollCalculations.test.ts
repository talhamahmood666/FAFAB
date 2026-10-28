import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateSalaryStructureFromGross, 
  calculateEobi, 
  calculatePessi, 
  calculateSalariedIncomeTax, 
  computeEmployeeMonthlyPayroll,
  PUNJAB_MINIMUM_WAGE 
} from './payrollCalculations.ts';

test('calculateSalaryStructureFromGross decomposes gross into Pakistani allowances', () => {
  const structure = calculateSalaryStructureFromGross(200000); // PKR 200,000 gross
  assert.equal(structure.grossSalary, 200000);
  assert.equal(structure.basicSalary, 100000); // 50%
  assert.equal(structure.houseRentAllowance, 45000); // 45% of Basic
  assert.equal(structure.medicalAllowance, 10000); // 10% of Basic
  assert.equal(structure.conveyanceAllowance, 45000); // Remainder
  assert.equal(
    structure.basicSalary + structure.houseRentAllowance + structure.medicalAllowance + structure.conveyanceAllowance,
    200000
  );
});

test('calculateEobi calculates 1% employee (PKR 370) and 5% employer (PKR 1850)', () => {
  const eobi = calculateEobi(true);
  assert.equal(eobi.employeeDeduction, 370);
  assert.equal(eobi.employerContribution, 1850);

  const exempt = calculateEobi(false);
  assert.equal(exempt.employeeDeduction, 0);
  assert.equal(exempt.employerContribution, 0);
});

test('calculatePessi computes 6% employer contribution up to Punjab statutory wage ceiling', () => {
  const pessi = calculatePessi(35000, true);
  assert.equal(pessi.employerContribution, Math.round(35000 * 0.06)); // 2,100

  // High earner exempt from PESSI
  const highEarner = calculatePessi(200000, true);
  assert.equal(highEarner.employerContribution, 0);
});

test('calculateSalariedIncomeTax evaluates FBR Section 149 slabs correctly', () => {
  // Case 1: Under PKR 600,000 / year (PKR 50,000/mo) -> 0%
  const slab1 = calculateSalariedIncomeTax(50000);
  assert.equal(slab1.annualTax, 0);
  assert.equal(slab1.monthlyTax, 0);

  // Case 2: PKR 1,000,000 / year (PKR 83,333.33/mo)
  // Tax = 5% of (1,000,000 - 600,000) = 5% of 400,000 = 20,000 annual -> 1,666.67 monthly
  const slab2 = calculateSalariedIncomeTax(1000000 / 12);
  assert.equal(slab2.annualTax, 20000);
  assert.equal(slab2.monthlyTax, 1666.67);

  // Case 3: PKR 1,800,000 / year (PKR 150,000/mo)
  // Tax = 30,000 + 15% of (1,800,000 - 1,200,000) = 30,000 + 90,000 = 120,000 annual -> 10,000 monthly
  const slab3 = calculateSalariedIncomeTax(150000);
  assert.equal(slab3.annualTax, 120000);
  assert.equal(slab3.monthlyTax, 10000);
});

test('computeEmployeeMonthlyPayroll produces exact net salary after deductions', () => {
  // Gross = 150,000/mo
  // Tax = 10,000/mo
  // EOBI Employee = 370/mo
  // Net = 150,000 - 10,000 - 370 = 139,630
  const payroll = computeEmployeeMonthlyPayroll(150000);
  assert.equal(payroll.adjustedGross, 150000);
  assert.equal(payroll.eobiEmployee, 370);
  assert.equal(payroll.incomeTaxFbr, 10000);
  assert.equal(payroll.netSalary, 139630);
});
