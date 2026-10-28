import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  AlertCircle, 
  UserCheck, 
  X, 
  CalendarDays 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { AttendanceRecord, AttendanceStatus, LeaveRequest, LeaveStatus, LeaveType } from '../../types/erp';

export const AttendanceAndLeavesModule: React.FC = () => {
  const { 
    attendances, 
    logAttendance, 
    leaveRequests, 
    submitLeaveRequest, 
    updateLeaveStatus, 
    employees, 
    currentRole 
  } = useErp();

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'LEAVES'>('ATTENDANCE');
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);

  // Mark Attendance Form
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('PRESENT');
  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('06:00 PM');
  const [workHours, setWorkHours] = useState<number>(9);
  const [notes, setNotes] = useState('');

  // Apply Leave Form
  const [leaveEmpId, setLeaveEmpId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState<number>(1);
  const [reason, setReason] = useState('');

  const handleMarkAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    logAttendance({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      date: new Date().toISOString().split('T')[0],
      checkIn: attStatus === 'ABSENT' || attStatus === 'ON_LEAVE' ? undefined : checkInTime,
      checkOut: attStatus === 'ABSENT' || attStatus === 'ON_LEAVE' ? undefined : checkOutTime,
      workHours: attStatus === 'ABSENT' || attStatus === 'ON_LEAVE' ? 0 : workHours,
      status: attStatus,
      notes: notes || undefined,
    });

    setShowMarkAttendanceModal(false);
    setNotes('');
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveEmpId);
    if (!emp || !reason) return;

    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays),
      reason,
    });

    setShowApplyLeaveModal(false);
    setReason('');
  };

  const canApprove = currentRole === 'ADMIN' || currentRole === 'HR_MANAGER';

  // Metrics
  const presentCount = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateCount = attendances.filter(a => a.status === 'LATE').length;
  const onLeaveCount = attendances.filter(a => a.status === 'ON_LEAVE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Attendance & Leave Workflows (Punjab Labor Compliant)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bahria Town Lahore office attendance tracking, daily work hours, biometric sync, and leave approval workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'ATTENDANCE' ? (
            <button
              type="button"
              onClick={() => setShowMarkAttendanceModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowApplyLeaveModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ATTENDANCE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Daily Attendance Logs ({attendances.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('LEAVES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'LEAVES'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Leave Applications & Approvals ({leaveRequests.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. DAILY ATTENDANCE TAB                                               */}
      {/* ===================================================================== */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Present Today</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{presentCount} Staff</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Late Arrivals</span>
                <div className="text-2xl font-bold text-amber-700 mt-1">{lateCount} Staff</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">On Approved Leave</span>
                <div className="text-2xl font-bold text-blue-700 mt-1">{onLeaveCount} Staff</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes / Terminal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="font-semibold text-slate-700 text-sm">No attendance records logged yet</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Employees can check in daily or HR can manually record biometric / card attendance using the &quot;Mark Attendance&quot; button.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    attendances.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-600">{att.date}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{att.employeeName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{att.employeeCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{att.checkIn || '—'}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{att.checkOut || '—'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{att.workHours ? `${att.workHours} hrs` : '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          att.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          att.status === 'ON_LEAVE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{att.notes || 'Biometric match ok'}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. LEAVE REQUESTS TAB                                                 */}
      {/* ===================================================================== */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4 text-center">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <div className="font-semibold text-slate-700 text-sm">No leave applications submitted yet</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Staff can submit Casual, Sick, or Annual leaves in accordance with Punjab labor regulations using &quot;Apply for Leave&quot;.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leaveRequests.map(lve => (
                    <tr key={lve.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{lve.employeeName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{lve.employeeCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                          {lve.leaveType} LEAVE
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{lve.startDate}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{lve.endDate}</td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-900">{lve.totalDays}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{lve.reason}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lve.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          lve.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {lve.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {lve.status === 'PENDING' && canApprove ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateLeaveStatus(lve.id, 'APPROVED')}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLeaveStatus(lve.id, 'REJECTED')}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleMarkAttendanceSubmit}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Record Employee Daily Attendance
              </h4>
              <button 
                type="button" 
                aria-label="Close attendance modal"
                onClick={() => setShowMarkAttendanceModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Select Employee *</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-medium"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Attendance Status *</label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-semibold"
              >
                <option value="PRESENT">Present (Full Day)</option>
                <option value="LATE">Late Arrival</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent (Unexcused)</option>
                <option value="ON_LEAVE">Approved Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Check-In Time</label>
                <input
                  type="text"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Check-Out Time</label>
                <input
                  type="text"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Notes / Reason for Delay</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Client visit on Ferozepur Road"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowMarkAttendanceModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Record Attendance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* APPLY LEAVE MODAL */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleApplyLeaveSubmit}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                Apply for Employee Leave (Punjab Labor Policy)
              </h4>
              <button 
                type="button" 
                aria-label="Close leave modal"
                onClick={() => setShowApplyLeaveModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Employee Name *</label>
              <select
                value={leaveEmpId}
                onChange={(e) => setLeaveEmpId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-medium"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Leave Category *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-semibold"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick / Medical Leave</option>
                  <option value="ANNUAL">Annual Earned Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="UNPAID">Leave Without Pay (Unpaid)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Total Days *</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Detailed Reason *</label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for requesting leave..."
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowApplyLeaveModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 cursor-pointer"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
