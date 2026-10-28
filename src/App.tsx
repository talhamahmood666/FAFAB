/**
 * FAFAB Limited - Enterprise Accounting & HR ERP System
 * Bahria Town, Lahore, Punjab, Pakistan
 * Compliant with FBR, PRA (16%), PESSI, and EOBI Regulations.
 */

import React, { useState } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { InvoicingModule } from './components/accounting/InvoicingModule';
import { ExpensesModule } from './components/accounting/ExpensesModule';
import { ChartOfAccountsModule } from './components/accounting/ChartOfAccountsModule';
import { BankingModule } from './components/accounting/BankingModule';
import { FinancialReportsModule } from './components/accounting/FinancialReportsModule';
import { FinancialProjections } from './components/analytics/FinancialProjections';
import { EmployeeDirectoryModule } from './components/hr/EmployeeDirectoryModule';
import { AttendanceAndLeavesModule } from './components/hr/AttendanceAndLeavesModule';
import { AssetManagementModule } from './components/hr/AssetManagementModule';
import { PayrollModule } from './components/payroll/PayrollModule';
import { Invoice } from './types/erp';

const AppContent: React.FC = () => {
  const { activeModule, setActiveModule, selectedInvoice, setSelectedInvoice } = useErp();
  const [isInvoiceCreateOpen, setIsInvoiceCreateOpen] = useState(false);
  const [isExpenseCreateOpen, setIsExpenseCreateOpen] = useState(false);

  const handleOpenNewInvoice = () => {
    setActiveModule('invoices');
    setIsInvoiceCreateOpen(true);
  };

  const handleOpenNewExpense = () => {
    setActiveModule('expenses');
    setIsExpenseCreateOpen(true);
  };

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setActiveModule('invoices');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Header 
          onOpenNewInvoice={handleOpenNewInvoice}
          onOpenNewExpense={handleOpenNewExpense}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'dashboard' && (
            <ExecutiveDashboard
              onOpenNewInvoice={handleOpenNewInvoice}
              onOpenNewExpense={handleOpenNewExpense}
              onSelectInvoice={handleSelectInvoice}
            />
          )}

          {activeModule === 'projections' && (
            <FinancialProjections />
          )}

          {activeModule === 'invoices' && (
            <InvoicingModule
              isCreateOpen={isInvoiceCreateOpen}
              setIsCreateOpen={setIsInvoiceCreateOpen}
              selectedInvoice={selectedInvoice}
              setSelectedInvoice={setSelectedInvoice}
            />
          )}

          {activeModule === 'expenses' && (
            <ExpensesModule
              isCreateOpen={isExpenseCreateOpen}
              setIsCreateOpen={setIsExpenseCreateOpen}
            />
          )}

          {activeModule === 'accounts' && (
            <ChartOfAccountsModule />
          )}

          {activeModule === 'banking' && (
            <BankingModule />
          )}

          {activeModule === 'reports' && (
            <FinancialReportsModule />
          )}

          {/* Module 2: Human Resources & Employee Management */}
          {activeModule === 'employees' && (
            <EmployeeDirectoryModule />
          )}

          {activeModule === 'attendance' && (
            <AttendanceAndLeavesModule />
          )}

          {activeModule === 'assets' && (
            <AssetManagementModule />
          )}

          {/* Module 4: Statutory Payroll Engine */}
          {activeModule === 'payroll' && (
            <PayrollModule />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <AppContent />
    </ErpProvider>
  );
}
