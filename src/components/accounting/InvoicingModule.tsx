import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Download, 
  Eye, 
  CreditCard, 
  X, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { 
  calculateInvoiceTotals, 
  formatPKR, 
  getRecommendedWhtRate, 
  PRA_STANDARD_RATE 
} from '../../utils/taxCalculations';
import { Customer, Invoice, InvoiceItem, InvoiceStatus } from '../../types/erp';

interface InvoicingModuleProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
}

export const InvoicingModule: React.FC<InvoicingModuleProps> = ({
  isCreateOpen,
  setIsCreateOpen,
  selectedInvoice,
  setSelectedInvoice,
}) => {
  const { 
    invoices, 
    customers, 
    addInvoice, 
    updateInvoiceStatus, 
    recordInvoicePayment, 
    companyProfile, 
    addCustomer 
  } = useErp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payment Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [paymentRefNo, setPaymentRefNo] = useState('');

  // New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days. Deposit into Meezan Bank Bahria Town Account.');
  const [notes, setNotes] = useState('All services subject to 16% Punjab Sales Tax on Services under PRA rules.');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Enterprise ERP System Development & Customization',
      quantity: 1,
      unitPrice: 500000,
      amount: 500000,
      praApplicable: true,
    },
  ]);

  // Quick Customer Creation
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustContact, setNewCustContact] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNtn, setNewCustNtn] = useState('');
  const [newCustStrn, setNewCustStrn] = useState('');
  const [newCustFiler, setNewCustFiler] = useState<'ACTIVE_FILER' | 'NON_FILER'>('ACTIVE_FILER');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const whtRate = selectedCustomer ? getRecommendedWhtRate(selectedCustomer.taxFilerStatus, true) : 3.0;

  // Real-time calculations
  const invoiceMath = calculateInvoiceTotals(lineItems, discountAmount, PRA_STANDARD_RATE, whtRate, 0);

  // Line item actions
  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        praApplicable: true,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = Math.round((Number(updated.quantity) * Number(updated.unitPrice)) * 100) / 100;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSaveInvoice = (status: InvoiceStatus = 'SENT') => {
    if (!selectedCustomer) {
      alert('Please add or select a client first before creating an invoice.');
      setShowAddCustomerModal(true);
      return;
    }
    const invNumber = `FAFAB-INV-2026-${String(invoices.length + 46).padStart(4, '0')}`;
    const newInv = addInvoice({
      invoiceNumber: invNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.companyName,
      customerNtn: selectedCustomer.ntn,
      customerStrn: selectedCustomer.strn,
      customerAddress: selectedCustomer.address,
      issueDate,
      dueDate,
      status,
      items: lineItems,
      subTotal: invoiceMath.subTotal,
      discountAmount: invoiceMath.discountAmount,
      praTaxRate: PRA_STANDARD_RATE,
      praTaxAmount: invoiceMath.praTaxAmount,
      withholdingTaxRate: whtRate,
      withholdingTaxAmount: invoiceMath.withholdingTaxAmount,
      grandTotal: invoiceMath.grandTotal,
      amountPaid: 0,
      balanceDue: invoiceMath.grandTotal,
      notes,
      paymentTerms,
    });
    setIsCreateOpen(false);
    setSelectedInvoice(newInv);
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    const created = addCustomer({
      companyName: newCustName,
      contactPerson: newCustContact,
      phone: newCustPhone,
      email: '',
      address: newCustAddress || 'Lahore, Punjab',
      city: 'Lahore',
      ntn: newCustNtn || undefined,
      strn: newCustStrn || undefined,
      taxFilerStatus: newCustFiler,
    });
    setSelectedCustomerId(created.id);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustContact('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustNtn('');
    setNewCustStrn('');
  };

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    setPaymentRefNo(`RAAST-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalInvoice || paymentAmount <= 0) return;
    recordInvoicePayment(paymentModalInvoice.id, paymentAmount, paymentMethod, paymentRefNo);
    setPaymentModalInvoice(null);
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customerNtn && inv.customerNtn.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Invoicing & Pakistani Tax Billing
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generates standardized invoices with PRA (16% Punjab Sales Tax on Services), NTN/STRN fields, and Meezan Bank wire instructions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'SENT', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'DRAFT'].map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, client, NTN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client & NTN</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Subtotal (PKR)</th>
                <th className="py-3 px-4">PRA 16% Tax</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500 text-sm">
                    No invoices matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.customerNtn ? `NTN: ${inv.customerNtn}` : 'No NTN'} 
                        {inv.customerStrn ? ` • STRN: ${inv.customerStrn}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{inv.issueDate}</div>
                      <div className="text-[11px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {formatPKR(inv.subTotal)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-medium">
                      {formatPKR(inv.praTaxAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatPKR(inv.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {inv.balanceDue > 0 ? (
                        <span className="text-amber-700">{formatPKR(inv.balanceDue)}</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Cleared (PKR 0)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : inv.status === 'SENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        title="View & Print Official PDF"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        View / Print
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(inv)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                          Record Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INVOICE VIEW / PRINT MODAL (Official FAFAB Limited Letterhead Format)  */}
      {/* ===================================================================== */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
            {/* Modal Action Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">
                  Tax Invoice: {selectedInvoice.invoiceNumber}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedInvoice.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {selectedInvoice.status}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
                <button
                  type="button"
                  aria-label="Close invoice preview"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
              {/* Official Corporate Header */}
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-extrabold flex items-center justify-center text-base">
                      F
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      FAFAB LIMITED
                    </h1>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    Plot 12-A, Commercial Area, Sector C, Bahria Town, Lahore, Punjab, Pakistan
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <div><strong>SECP Reg:</strong> {companyProfile.registrationNo}</div>
                    <div><strong>FBR NTN:</strong> {companyProfile.ntn} • <strong>STRN:</strong> {companyProfile.strn}</div>
                    <div><strong>PRA Reg:</strong> {companyProfile.praRegNo} (Punjab Sales Tax on Services)</div>
                    <div><strong>Phone:</strong> {companyProfile.phone} • <strong>Email:</strong> {companyProfile.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-emerald-800 uppercase tracking-wider">
                    TAX INVOICE
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                    <div><strong>Issue Date:</strong> {selectedInvoice.issueDate}</div>
                    <div><strong>Due Date:</strong> {selectedInvoice.dueDate}</div>
                    <div><strong>Fiscal Year:</strong> 2026-27 (Punjab)</div>
                  </div>
                </div>
              </div>

              {/* Billed To (Customer Details) */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    BILLED TO (CUSTOMER):
                  </span>
                  <div className="text-sm font-bold text-slate-900">{selectedInvoice.customerName}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{selectedInvoice.customerAddress}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {selectedInvoice.customerNtn && <span><strong>NTN:</strong> {selectedInvoice.customerNtn} </span>}
                    {selectedInvoice.customerStrn && <span>• <strong>STRN:</strong> {selectedInvoice.customerStrn}</span>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    TAX REGISTRATION & FILER STATUS:
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active Tax Filer (FBR ATL)
                  </span>
                  <div className="text-xs text-slate-500 mt-2">
                    Province of Consumption: <strong>Punjab (PRA Standard)</strong>
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Description of Service / Deliverable</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Price (PKR)</th>
                      <th className="py-2.5 px-4 text-center">PRA Rate</th>
                      <th className="py-2.5 px-4 text-right">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{item.description}</td>
                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono">{formatPKR(item.unitPrice)}</td>
                        <td className="py-3 px-4 text-center">
                          {item.praApplicable ? (
                            <span className="text-emerald-700 font-bold">16%</span>
                          ) : (
                            <span className="text-slate-400">Exempt</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatPKR(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Pakistani Tax Calculations */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                {/* Bank Wire Information */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5 flex-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    Direct Bank Transfer Details (Pakistan):
                  </div>
                  <div className="text-slate-700"><strong>Bank Name:</strong> {companyProfile.defaultBank.bankName}</div>
                  <div className="text-slate-700"><strong>Branch:</strong> {companyProfile.defaultBank.branchName}</div>
                  <div className="text-slate-700"><strong>Account Title:</strong> {companyProfile.defaultBank.accountTitle}</div>
                  <div className="text-slate-700 font-mono text-[11px]">
                    <strong>IBAN:</strong> {companyProfile.defaultBank.iban}
                  </div>
                  <div className="text-emerald-800 text-[11px] font-semibold mt-1">
                    Raast ID: Instant 24/7 Settlements enabled
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="w-full sm:w-80 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Subtotal (Exclusive of Tax):</span>
                    <span className="font-mono font-medium text-slate-900">{formatPKR(selectedInvoice.subTotal)}</span>
                  </div>

                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                      <span>Discount Allowed:</span>
                      <span className="font-mono font-medium">-{formatPKR(selectedInvoice.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-900 bg-emerald-50 px-2 rounded">
                    <span className="font-semibold">Punjab Sales Tax (PRA @ 16%):</span>
                    <span className="font-mono font-bold">{formatPKR(selectedInvoice.praTaxAmount)}</span>
                  </div>

                  {selectedInvoice.withholdingTaxAmount > 0 && (
                    <div className="flex justify-between py-1 text-slate-500 italic text-[11px]">
                      <span>FBR WHT Sec 153 ({selectedInvoice.withholdingTaxRate}%):</span>
                      <span className="font-mono">({formatPKR(selectedInvoice.withholdingTaxAmount)})</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-extrabold text-slate-900">
                    <span>Grand Total (PKR):</span>
                    <span className="font-mono text-emerald-800">{formatPKR(selectedInvoice.grandTotal)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Amount Received:</span>
                    <span className="font-mono text-emerald-700 font-semibold">{formatPKR(selectedInvoice.amountPaid)}</span>
                  </div>

                  <div className="flex justify-between py-2 bg-slate-900 text-white px-2.5 rounded-lg text-xs font-bold">
                    <span>Balance Payable:</span>
                    <span className="font-mono">{formatPKR(selectedInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Sign-off */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
                <div className="space-y-1">
                  <div><strong>Payment Terms:</strong> {selectedInvoice.paymentTerms}</div>
                  <div><strong>Notes:</strong> {selectedInvoice.notes}</div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="w-48 border-b border-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700 text-xs">For FAFAB LIMITED</span>
                  <div className="text-[10px] text-slate-400">Authorized Finance Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CREATE INVOICE MODAL                                                  */}
      {/* ===================================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Generate New Sales Invoice (FBR & PRA Compliant)
              </h3>
              <button
                type="button"
                aria-label="Close invoice creation dialog"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Customer Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Customer (Client):</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomerModal(true)}
                      className="text-emerald-600 hover:underline font-semibold text-[11px]"
                    >
                      + Quick Add Client
                    </button>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {customers.length === 0 ? (
                      <option value="">No clients yet — click &quot;+ Quick Add Client&quot;</option>
                    ) : (
                      customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} ({c.taxFilerStatus === 'ACTIVE_FILER' ? 'Filer' : 'Non-Filer'})
                        </option>
                      ))
                    )}
                  </select>
                  {selectedCustomer && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      NTN: {selectedCustomer.ntn || 'Not Provided'} • {selectedCustomer.address}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Issue Date:</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Due Date:</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-slate-800">Invoice Items / Deliverables:</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                  >
                    + Add Item Row
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Service description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="flex-1 p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 p-1.5 bg-white border border-slate-300 rounded text-xs text-center"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Price in PKR"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-28 p-1.5 bg-white border border-slate-300 rounded text-xs text-right font-mono"
                        min="0"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.praApplicable}
                          onChange={(e) => handleItemChange(item.id, 'praApplicable', e.target.checked)}
                          className="rounded text-emerald-600"
                        />
                        <span>PRA 16%</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount in PKR (Optional):</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    min="0"
                  />
                  <div className="mt-2 text-[11px] text-slate-500">
                    FBR Withholding tax rate applied: <strong className="text-emerald-700">{whtRate}%</strong> (Customer is {selectedCustomer?.taxFilerStatus}).
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">{formatPKR(invoiceMath.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Punjab Sales Tax (PRA 16%):</span>
                    <span className="font-mono">{formatPKR(invoiceMath.praTaxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1">
                    <span>Grand Total (PKR):</span>
                    <span className="font-mono text-emerald-800">{formatPKR(invoiceMath.grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes & Terms:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice('DRAFT')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice('SENT')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Create & Post Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* QUICK ADD CUSTOMER MODAL                                              */}
      {/* ===================================================================== */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateCustomerSubmit}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Add New Pakistani Corporate Client</h4>
              <button type="button" aria-label="Close add client dialog" onClick={() => setShowAddCustomerModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Company / Client Name *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Al-Fatah Corporate Services"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newCustContact}
                  onChange={(e) => setNewCustContact(e.target.value)}
                  placeholder="e.g. Usman Ali"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">FBR NTN</label>
                <input
                  type="text"
                  value={newCustNtn}
                  onChange={(e) => setNewCustNtn(e.target.value)}
                  placeholder="1234567-8"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">STRN (PRA/FBR)</label>
                <input
                  type="text"
                  value={newCustStrn}
                  onChange={(e) => setNewCustStrn(e.target.value)}
                  placeholder="32-XX-XXXX-XXX-XX"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Tax Filer Status</label>
              <select
                value={newCustFiler}
                onChange={(e) => setNewCustFiler(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded"
              >
                <option value="ACTIVE_FILER">Active Tax Filer (FBR ATL)</option>
                <option value="NON_FILER">Non-Filer (Subject to higher WHT)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Address in Lahore / Punjab</label>
              <input
                type="text"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                placeholder="e.g. Sector B, Bahria Town, Lahore"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RECORD PAYMENT MODAL                                                  */}
      {/* ===================================================================== */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Record Payment for {paymentModalInvoice.invoiceNumber}
              </h4>
              <button type="button" aria-label="Close payment modal" onClick={() => setPaymentModalInvoice(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Payment Amount in PKR</label>
              <input
                type="number"
                value={paymentAmount}
                max={paymentModalInvoice.balanceDue}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono text-sm font-bold text-slate-900"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Outstanding Balance: <strong>{formatPKR(paymentModalInvoice.balanceDue)}</strong>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Settlement Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              >
                <option value="BANK_TRANSFER">Meezan Bank Raast / Wire Transfer</option>
                <option value="CHEQUE">Crossed Cheque</option>
                <option value="CASH">Cash in Hand (Petty Cash)</option>
                <option value="PAY_ORDER">Bank Pay Order</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Transaction Ref / Cheque #</label>
              <input
                type="text"
                value={paymentRefNo}
                onChange={(e) => setPaymentRefNo(e.target.value)}
                placeholder="e.g. MEZN-RAAST-00918"
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
              >
                Confirm Payment & Update Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
