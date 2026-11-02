-- ============================================================
-- FAFAB LIMITED ERP — Supabase PostgreSQL Database Schema
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================

-- 1. General System Settings (Company Profile, Exchange Rates, Categories)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to system_settings" ON system_settings;
CREATE POLICY "Public full access to system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT,
    customer_name TEXT,
    grand_total NUMERIC,
    status TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to invoices" ON invoices;
CREATE POLICY "Public full access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_code TEXT,
    company_name TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to customers" ON customers;
CREATE POLICY "Public full access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    expense_number TEXT,
    category TEXT,
    amount NUMERIC,
    date TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to expenses" ON expenses;
CREATE POLICY "Public full access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- 5. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    employee_code TEXT,
    first_name TEXT,
    last_name TEXT,
    gross_salary NUMERIC,
    status TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to employees" ON employees;
CREATE POLICY "Public full access to employees" ON employees FOR ALL USING (true) WITH CHECK (true);

-- 6. Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id TEXT PRIMARY KEY,
    bank_name TEXT,
    account_title TEXT,
    current_balance NUMERIC,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to bank_accounts" ON bank_accounts;
CREATE POLICY "Public full access to bank_accounts" ON bank_accounts FOR ALL USING (true) WITH CHECK (true);

-- 7. Bank Transactions Table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id TEXT PRIMARY KEY,
    bank_account_id TEXT,
    date TEXT,
    reference_no TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to bank_transactions" ON bank_transactions;
CREATE POLICY "Public full access to bank_transactions" ON bank_transactions FOR ALL USING (true) WITH CHECK (true);

-- 8. Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT,
    payload JSONB NOT NULL
);

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to chart_of_accounts" ON chart_of_accounts;
CREATE POLICY "Public full access to chart_of_accounts" ON chart_of_accounts FOR ALL USING (true) WITH CHECK (true);

-- 9. Attendances Table
CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    date TEXT,
    status TEXT,
    payload JSONB NOT NULL
);

ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to attendances" ON attendances;
CREATE POLICY "Public full access to attendances" ON attendances FOR ALL USING (true) WITH CHECK (true);

-- 10. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    status TEXT,
    payload JSONB NOT NULL
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to leave_requests" ON leave_requests;
CREATE POLICY "Public full access to leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);

-- 11. Company Assets Table
CREATE TABLE IF NOT EXISTS company_assets (
    id TEXT PRIMARY KEY,
    asset_tag TEXT,
    title TEXT,
    payload JSONB NOT NULL
);

ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to company_assets" ON company_assets;
CREATE POLICY "Public full access to company_assets" ON company_assets FOR ALL USING (true) WITH CHECK (true);

-- 12. Payroll Periods Table
CREATE TABLE IF NOT EXISTS payroll_periods (
    id TEXT PRIMARY KEY,
    period_name TEXT,
    month NUMERIC,
    year NUMERIC,
    payload JSONB NOT NULL
);

ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to payroll_periods" ON payroll_periods;
CREATE POLICY "Public full access to payroll_periods" ON payroll_periods FOR ALL USING (true) WITH CHECK (true);
