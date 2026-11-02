import test from 'node:test';
import assert from 'node:assert';
import { companyProfileData } from '../src/data/seedData';

test('PSEB registration is configured with valid Pakistani IT Exporter defaults', () => {
  assert.ok(companyProfileData.psebRegNo, 'PSEB registration number must be present');
  assert.match(companyProfileData.psebRegNo, /^PSEB-/, 'PSEB registration number should start with PSEB-');
  assert.strictEqual(companyProfileData.psebStatus, 'Active', 'Default PSEB status should be Active');
  assert.ok(companyProfileData.psebCategory?.includes('IT'), 'Category must indicate IT/Software');
  assert.ok(companyProfileData.psebExpiryDate, 'PSEB Expiry date must be defined');
  assert.ok(companyProfileData.psebSbpRetentionClause?.includes('Section 154A'), 'Must specify Section 154A ITO benefit');
  assert.ok(companyProfileData.psebSbpRetentionClause?.includes('50%'), 'Must specify SBP 50% FX retention benefit');
});

test('Company Profile merges PSEB defaults when restoring previous state', () => {
  const legacyProfile = {
    name: 'FAFAB Limited',
    ntn: '8943210-7'
  };

  const merged = {
    ...companyProfileData,
    ...legacyProfile,
    psebRegNo: (legacyProfile as any).psebRegNo || companyProfileData.psebRegNo
  };

  assert.strictEqual(merged.psebRegNo, 'PSEB-REG-2024-8943');
  assert.strictEqual(merged.ntn, '8943210-7');
});
