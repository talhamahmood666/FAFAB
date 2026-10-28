import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CreditCard, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  X, 
  BadgeCheck, 
  Briefcase 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { calculateSalaryStructureFromGross } from '../../utils/payrollCalculations';
import { Employee, EmploymentType, EmployeeStatus } from '../../types/erp';

export const EmployeeDirectoryModule: React.FC = () => {
  const { employees, addEmployee, companyProfile } = useErp();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New Employee Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Sector C, Bahria Town, Lahore');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [grossSalary, setGrossSalary] = useState<number>(150000);
  const [bankName, setBankName] = useState('Meezan Bank Limited');
  const [bankBranch, setBankBranch] = useState('Sector C, Bahria Town Branch, Lahore');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('PK72MEZN000219010');

  const departments = ['ALL', 'Engineering', 'Human Resources', 'Finance & Accounting', 'Operations'];

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesSearch = 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cnicNumber.includes(searchQuery) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !cnicNumber || !email) return;

    const newEmp = addEmployee({
      firstName,
      lastName,
      urduName: urduName || undefined,
      cnicNumber,
      dateOfBirth: '1995-01-01',
      gender: 'Male',
      email,
      phone: phone || '+92 300 0000000',
      residentialAddress: address,
      city: 'Lahore',
      department,
      designation: designation || 'Software Engineer',
      employmentType,
      status: 'ACTIVE',
      dateOfJoining: new Date().toISOString().split('T')[0],
      eobiNumber: `LHR-EOBI-${Math.floor(100000 + Math.random() * 900000)}`,
      pessiNumber: `PESSI-PB-${Math.floor(10000 + Math.random() * 90000)}`,
      ntnNumber: `${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1 + Math.random() * 9)}`,
      bankName,
      bankBranch,
      accountNumber: accountNumber || '02190100000000',
      iban: iban.length >= 24 ? iban : `PK72MEZN000219010${Math.floor(1000000 + Math.random() * 9000000)}`,
      grossSalary: Number(grossSalary),
    });

    setShowAddModal(false);
    setSelectedEmployee(newEmp);
    setFirstName('');
    setLastName('');
    setUrduName('');
    setCnicNumber('');
    setEmail('');
    setPhone('');
    setDesignation('');
  };

  const salaryPreview = calculateSalaryStructureFromGross(Number(grossSalary) || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Human Resources & Employee Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personnel profiles with Pakistani CNIC, Bahria Town residential addresses, designated bank IBANs, and EOBI/PESSI statutory compliance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {departments.map(dept => (
            <button
              key={dept}
              type="button"
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                deptFilter === dept
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee name, code, CNIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Employees Registered Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The employee database is currently empty. Click the button below to onboard your first team member with Pakistani CNIC and designated bank IBAN.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard First Employee</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-slate-900">
                      {emp.firstName} {emp.lastName}
                    </span>
                    {emp.urduName && (
                      <span className="text-[11px] text-slate-400 font-serif">
                        ({emp.urduName})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold">{emp.designation}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{emp.employeeCode}</div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {emp.status}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Pakistani CNIC:</span>
                <span className="font-mono font-semibold text-slate-800">{emp.cnicNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Department:</span>
                <span className="font-medium text-slate-800">{emp.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Monthly Gross:</span>
                <span className="font-mono font-bold text-emerald-700">{formatPKR(emp.grossSalary)}</span>
              </div>
            </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.residentialAddress}</span>
                </div>
                <span className="text-emerald-600 font-semibold hover:underline">View Card →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* EMPLOYEE DETAIL MODAL                                                 */}
      {/* ===================================================================== */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">
                  {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.employeeCode})
                </span>
              </div>
              <button
                type="button"
                aria-label="Close employee card"
                onClick={() => setSelectedEmployee(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-700">
              {/* Top Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                    {selectedEmployee.urduName && <span className="ml-2 font-serif text-slate-600 font-normal">({selectedEmployee.urduName})</span>}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 mt-0.5">{selectedEmployee.designation}</div>
                  <div className="text-[11px] text-slate-500">{selectedEmployee.department} • Joined {selectedEmployee.dateOfJoining}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Monthly Package:</span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {formatPKR(selectedEmployee.grossSalary)}
                  </span>
                </div>
              </div>

              {/* Statutory Identification */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Government & Compliance Identification:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">NADRA CNIC Number:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedEmployee.cnicNumber}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">FBR Salaried NTN:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedEmployee.ntnNumber || 'Not Linked'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">EOBI Registration No:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedEmployee.eobiNumber}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">PESSI Social Security No:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedEmployee.pessiNumber}</span>
                  </div>
                </div>
              </div>

              {/* Salary Structure Breakdown */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wider">
                  Pakistani Salary Allowances Structure (Gross PKR {formatPKR(selectedEmployee.grossSalary)}):
                </span>
                {(() => {
                  const s = calculateSalaryStructureFromGross(selectedEmployee.grossSalary);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-1.5 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Basic (50%):</span>
                        <span className="font-mono font-semibold">{formatPKR(s.basicSalary)}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">House Rent (45%):</span>
                        <span className="font-mono font-semibold">{formatPKR(s.houseRentAllowance)}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Medical (10%):</span>
                        <span className="font-mono font-semibold">{formatPKR(s.medicalAllowance)}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Conveyance:</span>
                        <span className="font-mono font-semibold">{formatPKR(s.conveyanceAllowance)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Banking Transfer Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Salary Direct Bank Wire:
                </span>
                <div><strong>Bank:</strong> {selectedEmployee.bankName} ({selectedEmployee.bankBranch})</div>
                <div><strong>Account Number:</strong> {selectedEmployee.accountNumber}</div>
                <div className="font-mono text-[11px] text-emerald-800">
                  <strong>IBAN:</strong> {selectedEmployee.iban}
                </div>
              </div>

              {/* Residence in Lahore */}
              <div className="text-xs text-slate-600">
                <strong>Lahore Residence:</strong> {selectedEmployee.residentialAddress}, {selectedEmployee.city}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ONBOARD EMPLOYEE MODAL                                                */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateEmployee}
            className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 text-xs space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Onboard New Pakistani Employee (Punjab Compliant)
              </h4>
              <button 
                type="button" 
                aria-label="Close employee onboarding modal"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mehmood"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Name in Urdu (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. اسد محمود"
                  value={urduName}
                  onChange={(e) => setUrduName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">NADRA CNIC Number *</label>
                <input
                  type="text"
                  required
                  placeholder="35201-XXXXXXX-X"
                  value={cnicNumber}
                  onChange={(e) => setCnicNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Official / Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@fafablimited.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Job Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Monthly Gross Package in PKR *</label>
              <input
                type="number"
                required
                min="37000"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-slate-900"
              />
              <div className="mt-1 text-[11px] text-slate-500">
                Minimum wage in Punjab: PKR 37,000. Basic: {formatPKR(salaryPreview.basicSalary)} • House Rent: {formatPKR(salaryPreview.houseRentAllowance)}.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Salary Bank</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank / HBL"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">IBAN (24 Characters)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="PK72MEZN000..."
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Lahore Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sector C, Bahria Town, Lahore"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Save & Onboard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
