import { 
  AttendanceRecord, 
  CompanyAsset, 
  Employee, 
  LeaveRequest, 
  PayrollPeriod, 
  PayrollRecord 
} from '../types/erp';

// Clean empty HR collections
export const initialEmployees: Employee[] = [];

export const initialAttendances: AttendanceRecord[] = [];

export const initialLeaves: LeaveRequest[] = [];

export const initialAssets: CompanyAsset[] = [];

// Helper to generate empty payroll period
export function generateInitialPayrollPeriod(): PayrollPeriod {
  const periodId = 'payroll-2026-10';

  return {
    id: periodId,
    periodName: 'October 2026',
    month: 10,
    year: 2026,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    status: 'DRAFT',
    totalGross: 0,
    totalTaxDeducted: 0,
    totalEobiEmployee: 0,
    totalEobiEmployer: 0,
    totalPessiEmployer: 0,
    totalNetPayable: 0,
    records: [],
  };
}
