import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateSixMonthProjections, 
  calculateRunwayMonths, 
  calculateQuarterlyTaxForecast, 
  HISTORICAL_MONTHS 
} from './projections.ts';

test('HISTORICAL_MONTHS contains 4 clean tracking periods', () => {
  assert.equal(HISTORICAL_MONTHS.length, 4);
  assert.equal(HISTORICAL_MONTHS[3].month, 'Oct 26');
  assert.equal(HISTORICAL_MONTHS[3].revenue, 0);
});

test('generateSixMonthProjections calculates projections accurately when baseline provided', () => {
  const projections = generateSixMonthProjections(10000000, 4000000, 1000000, 800000, {
    revenueGrowthPercent: 12,
    expenseInflationPercent: 4,
    headcountAddition: 1,
    averageNewHireSalary: 150000,
  });

  assert.equal(projections.length, 6);
  assert.equal(projections[0].month, 'Nov 26');
  assert.equal(projections[5].month, 'Apr 27');
  assert.equal(projections[0].isProjected, true);

  assert.ok(projections[5].revenue > projections[0].revenue);
  assert.ok(projections[5].cashBalance > projections[0].cashBalance);
});

test('calculateRunwayMonths computes correct runway in months', () => {
  assert.equal(calculateRunwayMonths(10000000, 2000000), 5.0);
  assert.equal(calculateRunwayMonths(15000000, 3000000), 5.0);
  assert.equal(calculateRunwayMonths(0, 0), 0);
  assert.equal(calculateRunwayMonths(1000000, 0), 999);
});

test('calculateQuarterlyTaxForecast computes PRA and FBR withholding projections', () => {
  const projections = generateSixMonthProjections(10000000, 3000000, 500000, 500000);
  const taxes = calculateQuarterlyTaxForecast(projections);

  assert.ok(taxes.q2PraTax > 0);
  assert.ok(taxes.q3PraTax > 0);
});
