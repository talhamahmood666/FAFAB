import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  ArrowUpRight, 
  Calendar, 
  PieChart, 
  Building2, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatPKR } from '../../utils/taxCalculations';
import { 
  generateSixMonthProjections, 
  calculateRunwayMonths, 
  calculateQuarterlyTaxForecast, 
  HISTORICAL_MONTHS, 
  MonthlyDataPoint 
} from '../../utils/projections';

export const FinancialProjections: React.FC = () => {
  const { bankAccounts, expenses, invoices, currentPayrollPeriod } = useErp();

  // Scenario Simulation Controls
  const [revenueGrowth, setRevenueGrowth] = useState<number>(10); // +10%
  const [expenseInflation, setExpenseInflation] = useState<number>(4); // +4%
  const [newHires, setNewHires] = useState<number>(0);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'netProfit' | 'cashBalance'>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyDataPoint | null>(null);

  const currentCash = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
  const baselineMonthlyRev = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const baselineMonthlyExp = expenses.reduce((sum, exp) => sum + exp.netPaid, 0);
  const baselineMonthlyPay = currentPayrollPeriod?.totalGross || 0;

  // Generate projections dynamically based on sliders
  const projections = useMemo(() => {
    return generateSixMonthProjections(
      currentCash,
      baselineMonthlyRev,
      baselineMonthlyExp,
      baselineMonthlyPay,
      {
        revenueGrowthPercent: revenueGrowth,
        expenseInflationPercent: expenseInflation,
        headcountAddition: newHires,
        averageNewHireSalary: 150000,
      }
    );
  }, [currentCash, baselineMonthlyRev, baselineMonthlyExp, baselineMonthlyPay, revenueGrowth, expenseInflation, newHires]);

  // Combined timeline (4 historical + 6 projected = 10 months)
  const fullTimeline: MonthlyDataPoint[] = useMemo(() => {
    return [...HISTORICAL_MONTHS, ...projections];
  }, [projections]);

  const taxForecast = useMemo(() => {
    return calculateQuarterlyTaxForecast(projections);
  }, [projections]);

  const latestMonth = fullTimeline[fullTimeline.length - 1] || {
    month: 'Apr 27',
    isProjected: true,
    revenue: 0,
    expenses: 0,
    payroll: 0,
    netProfit: 0,
    praTaxLiability: 0,
    cashBalance: 0,
  };
  const monthlyBurn = baselineMonthlyExp + baselineMonthlyPay + (newHires * 150000);
  const runwayMonths = calculateRunwayMonths(currentCash, monthlyBurn);

  // Calculate chart max for scaling (safely bounded to at least 1 to prevent NaN)
  const maxValue = useMemo(() => {
    if (chartMetric === 'cashBalance') {
      const max = Math.max(...fullTimeline.map(d => d.cashBalance));
      return Math.max(100000, max * 1.15);
    }
    if (chartMetric === 'netProfit') {
      const max = Math.max(...fullTimeline.map(d => d.netProfit));
      return Math.max(100000, max * 1.25);
    }
    const max = Math.max(...fullTimeline.map(d => Math.max(d.revenue, d.expenses + d.payroll)));
    return Math.max(100000, max * 1.15);
  }, [fullTimeline, chartMetric]);

  const chartHeight = 175;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Financial Projections & Scenario Modeling
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historical performance and 6-month predictive runway, cash flows, and PRA sales tax forecasts for FAFAB Limited.
          </p>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setChartMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartMetric === 'revenue' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue & Outflows
          </button>
          <button
            type="button"
            onClick={() => setChartMetric('netProfit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartMetric === 'netProfit' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Net Profit Curve
          </button>
          <button
            type="button"
            onClick={() => setChartMetric('cashBalance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartMetric === 'cashBalance' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cumulative Treasury
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Projected Cash (Apr 2027)
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatPKR(latestMonth.cashBalance)}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{revenueGrowth}% annual growth target</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Current Treasury Runway
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {runwayMonths} Months
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Based on current monthly burn {formatPKR(monthlyBurn)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Q2/Q3 PRA Sales Tax Liability
          </span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {formatPKR(taxForecast.q2PraTax + taxForecast.q3PraTax)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            16% Punjab provincial sales tax provision
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Projected Monthly Profit
          </span>
          <div className="text-2xl font-bold font-mono text-teal-700 mt-1">
            {formatPKR(latestMonth.netProfit)}
          </div>
          <div className="text-[10px] text-teal-600 font-medium mt-0.5">
            After planned hiring & Bahria Town rent
          </div>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {chartMetric === 'revenue' && 'Monthly Revenue vs. Total Operational Outflows (PKR)'}
              {chartMetric === 'netProfit' && 'Net Operating Profit Trajectory (PKR)'}
              {chartMetric === 'cashBalance' && 'Cumulative Bank Treasury Projection (Meezan + HBL)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical performance (Jul-Oct) followed by 6-month projected forward curve (Nov-Apr).
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600" />
              <span>Historical Solid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-400 border border-dashed border-emerald-700" />
              <span>Forecast Dashed</span>
            </div>
            {chartMetric === 'revenue' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-400" />
                <span>Outflows (Rent/Payroll)</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative pt-6 pb-2">
          {/* Tooltip Popup */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700 z-10 space-y-0.5">
              <div className="font-bold text-emerald-400 flex items-center justify-between gap-3">
                <span>{hoveredPoint.month}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {hoveredPoint.isProjected ? 'Projected' : 'Actual'}
                </span>
              </div>
              <div>Revenue: <strong className="font-mono">{formatPKR(hoveredPoint.revenue)}</strong></div>
              <div>Total Outflow: <strong className="font-mono">{formatPKR(hoveredPoint.expenses + hoveredPoint.payroll)}</strong></div>
              <div>Net Profit: <strong className="font-mono text-emerald-300">{formatPKR(hoveredPoint.netProfit)}</strong></div>
              <div>Treasury: <strong className="font-mono">{formatPKR(hoveredPoint.cashBalance)}</strong></div>
            </div>
          )}

          {/* SVG Bar & Trend Chart */}
          <div className="overflow-x-auto">
            <svg 
              viewBox="0 0 880 240" 
              className="w-full h-56 min-w-[700px] overflow-visible"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = chartHeight - pct * chartHeight + 10;
                const val = pct * maxValue;
                return (
                  <g key={idx}>
                    <line 
                      x1="60" 
                      y1={y} 
                      x2="860" 
                      y2={y} 
                      stroke="#e2e8f0" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x="50" 
                      y={y + 4} 
                      textAnchor="end" 
                      fontSize="9" 
                      fill="#94a3b8" 
                      fontFamily="monospace"
                    >
                      {Math.round(val / 1000000)}M
                    </text>
                  </g>
                );
              })}

              {/* Data Bars */}
              {fullTimeline.map((item, index) => {
                const barSpacing = 78;
                const x = 90 + index * barSpacing;
                
                let targetVal = item.revenue;
                if (chartMetric === 'netProfit') targetVal = item.netProfit;
                if (chartMetric === 'cashBalance') targetVal = item.cashBalance;

                const barHeight = Math.max(4, (targetVal / maxValue) * chartHeight);
                const y = chartHeight - barHeight + 10;

                const outflowVal = item.expenses + item.payroll;
                const outflowHeight = Math.max(4, (outflowVal / maxValue) * chartHeight);
                const outflowY = chartHeight - outflowHeight + 10;

                return (
                  <g 
                    key={item.month} 
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(item)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Primary Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={chartMetric === 'revenue' ? "24" : "36"}
                      height={barHeight}
                      rx="4"
                      fill={item.isProjected ? "#34d399" : "#059669"}
                      stroke={item.isProjected ? "#047857" : "none"}
                      strokeWidth={item.isProjected ? "1.5" : "0"}
                      strokeDasharray={item.isProjected ? "3 2" : "none"}
                      className="transition-all hover:opacity-80"
                    />

                    {/* Outflow comparison bar (when viewing revenue) */}
                    {chartMetric === 'revenue' && (
                      <rect
                        x={x + 28}
                        y={outflowY}
                        width="20"
                        height={outflowHeight}
                        rx="4"
                        fill="#fb7185"
                        opacity="0.85"
                        className="transition-all hover:opacity-100"
                      />
                    )}

                    {/* Month Label */}
                    <text
                      x={x + (chartMetric === 'revenue' ? 24 : 18)}
                      y={chartHeight + 22}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={item.isProjected ? "500" : "700"}
                      fill={item.isProjected ? "#64748b" : "#0f172a"}
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Modeling Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              What-If Financial Simulation Controls (Interactive)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setRevenueGrowth(10);
              setExpenseInflation(4);
              setNewHires(0);
            }}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Slider 1: Revenue Growth */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Annual Revenue Growth</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {revenueGrowth > 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="40"
              step="1"
              value={revenueGrowth}
              onChange={(e) => setRevenueGrowth(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-10% (Downturn)</span>
              <span>+15% (Target)</span>
              <span>+40% (Aggressive)</span>
            </div>
          </div>

          {/* Slider 2: Operating Expense Inflation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Expense Inflation (Utilities & Cloud)</span>
              <span className="font-mono text-amber-400 font-bold text-sm">+{expenseInflation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={expenseInflation}
              onChange={(e) => setExpenseInflation(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% Stable</span>
              <span>+5% Expected</span>
              <span>+15% High</span>
            </div>
          </div>

          {/* Slider 3: Planned New Hires in Lahore */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Bahria Town Engineering Hires</span>
              <span className="font-mono text-blue-400 font-bold text-sm">+{newHires} Engineers</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={newHires}
              onChange={(e) => setNewHires(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 Freeze</span>
              <span>+2 Hires</span>
              <span>+8 Scaling</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Projected Monthly Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Forward 6-Month Projection Schedule (Nov 2026 – Apr 2027)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All figures denominated in Pakistani Rupees with statutory PRA 16% provisions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Forecast Month</th>
                <th className="py-3 px-4 text-right">Projected Revenue</th>
                <th className="py-3 px-4 text-right">Operating Expenses</th>
                <th className="py-3 px-4 text-right">Staff Payroll</th>
                <th className="py-3 px-4 text-right text-blue-700">PRA 16% Tax</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-800">Net Profit</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Cumulative Treasury</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projections.map(m => (
                <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{m.month}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatPKR(m.revenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatPKR(m.expenses)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatPKR(m.payroll)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-blue-700">
                    {formatPKR(m.praTaxLiability)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatPKR(m.netProfit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                    {formatPKR(m.cashBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
