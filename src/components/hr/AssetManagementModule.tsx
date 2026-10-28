import React, { useState } from 'react';
import { 
  Laptop, 
  Plus, 
  Search, 
  ShieldCheck, 
  Smartphone, 
  Car, 
  Monitor, 
  CheckCircle, 
  X, 
  UserPlus 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { AssetCategory, AssetStatus, CompanyAsset } from '../../types/erp';

export const AssetManagementModule: React.FC = () => {
  const { assets, addAsset, assignAsset, employees } = useErp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignModalAsset, setAssignModalAsset] = useState<CompanyAsset | null>(null);
  const [assigneeEmpId, setAssigneeEmpId] = useState(employees[0]?.id || '');

  // New Asset Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseCost, setPurchaseCost] = useState<number>(250000);
  const [assignedToId, setAssignedToId] = useState('');

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  const assignedCount = assets.filter(a => a.status === 'ASSIGNED').length;
  const availableCount = assets.filter(a => a.status === 'AVAILABLE').length;

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !serialNumber) return;

    const assignedEmp = employees.find(e => e.id === assignedToId);
    const tagPrefix = category === 'Laptop' ? 'LPT' : category === 'Mobile Phone' ? 'MBL' : category === 'Vehicle' ? 'VEH' : 'AST';
    const assetTag = `FAFAB-${tagPrefix}-${String(assets.length + 1).padStart(3, '0')}`;

    addAsset({
      assetTag,
      title,
      category,
      serialNumber,
      purchaseCost: Number(purchaseCost),
      purchaseDate: new Date().toISOString().split('T')[0],
      status: assignedEmp ? 'ASSIGNED' : 'AVAILABLE',
      assignedToId: assignedEmp ? assignedEmp.id : undefined,
      assignedToName: assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : undefined,
    });

    setShowAddModal(false);
    setTitle('');
    setSerialNumber('');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalAsset || !assigneeEmpId) return;
    const emp = employees.find(e => e.id === assigneeEmpId);
    if (!emp) return;

    assignAsset(assignModalAsset.id, emp.id, `${emp.firstName} ${emp.lastName}`);
    setAssignModalAsset(null);
  };

  const filteredAssets = assets.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedToName && a.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-600" />
            Company Asset & Hardware Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track company laptops, mobile devices, monitors, and vehicles assigned to staff in Bahria Town Lahore.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Asset Fleet Valuation</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{formatPKR(totalAssetValue)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Assets Currently In Use</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{assignedCount} Assigned</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Unassigned / Buffer Pool</span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{availableCount} Available</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['ALL', 'ASSIGNED', 'AVAILABLE', 'UNDER_REPAIR'].map(status => (
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
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset tag, model, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Asset Tag</th>
                <th className="py-3 px-4">Title & Hardware Specs</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Assigned Employee</th>
                <th className="py-3 px-4 text-right">Cost (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="font-semibold text-slate-700 text-sm">No hardware assets registered yet</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Register laptops, testing devices, or monitors using the &quot;Register New Asset&quot; button above.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {asset.assetTag}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {asset.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {asset.serialNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    {asset.assignedToName ? (
                      <span className="font-semibold text-slate-900">{asset.assignedToName}</span>
                    ) : (
                      <span className="text-slate-400 italic">In Bahria Town Storage Safe</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatPKR(asset.purchaseCost)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.status === 'ASSIGNED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      asset.status === 'AVAILABLE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {asset.status === 'AVAILABLE' ? (
                      <button
                        type="button"
                        onClick={() => setAssignModalAsset(asset)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                      >
                        Assign to Staff
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Assigned</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateAsset}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" />
                Register Company Hardware Asset
              </h4>
              <button 
                type="button" 
                aria-label="Close add asset modal"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Asset Model / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro 16 M3 Max 36GB"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Asset Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50"
                >
                  <option value="Laptop">Laptop Computer</option>
                  <option value="Mobile Phone">Mobile Phone</option>
                  <option value="Desktop">Desktop PC</option>
                  <option value="Vehicle">Company Vehicle</option>
                  <option value="Office Equipment">Office Equipment</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Serial Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S/N C02G99..."
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Purchase Cost (PKR) *</label>
              <input
                type="number"
                required
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Assign to Employee (Optional)</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-slate-50"
              >
                <option value="">Keep in Buffer Inventory</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.designation})
                  </option>
                ))}
              </select>
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
                Save Hardware Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN ASSET MODAL */}
      {assignModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleConfirmAssignment}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Assign Asset to Staff Member
              </h4>
              <button 
                type="button" 
                aria-label="Close assign asset modal"
                onClick={() => setAssignModalAsset(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">{assignModalAsset.title}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Tag: {assignModalAsset.assetTag} • S/N: {assignModalAsset.serialNumber}
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Select Assignee *</label>
              <select
                value={assigneeEmpId}
                onChange={(e) => setAssigneeEmpId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-semibold"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department} - {emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setAssignModalAsset(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Confirm Handover & Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
