import test from 'node:test';
import assert from 'node:assert/strict';
import { getSupabaseProjectRef, isTableMissingError } from '../src/services/supabaseService';

test('getSupabaseProjectRef extracts project reference from standard supabase url', () => {
  const url1 = 'https://ysotolpebceouisyehlr.supabase.co';
  assert.equal(getSupabaseProjectRef(url1), 'ysotolpebceouisyehlr');

  const url2 = 'https://xyz123abc-project.supabase.co';
  assert.equal(getSupabaseProjectRef(url2), 'xyz123abc-project');

  assert.equal(getSupabaseProjectRef(''), null);
  assert.equal(getSupabaseProjectRef(undefined), null);
});

test('isTableMissingError correctly identifies PostgREST schema cache and missing table errors', () => {
  // PostgREST 404 schema cache error (the exact user error)
  const userError = {
    code: 'PGRST205',
    message: "Could not find the table 'public.system_settings' in the schema cache",
  };
  assert.equal(isTableMissingError(userError), true);

  // PostgreSQL relation does not exist
  const pgError = {
    code: '42P01',
    message: 'relation "public.system_settings" does not exist',
  };
  assert.equal(isTableMissingError(pgError), true);

  // Unrelated error (e.g. auth failed or network timeout)
  const authError = {
    code: '401',
    message: 'Invalid API key',
  };
  assert.equal(isTableMissingError(authError), false);

  assert.equal(isTableMissingError(null), false);
});
