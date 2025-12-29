import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#facc15', '#ef4444', '#8b5cf6', '#ec4899'];

const ProjectProgressCharts = ({ entries = [], currencyMode: propCurrencyMode = null }) => {
  const [internalCurrencyMode, setInternalCurrencyMode] = React.useState('LKR'); // 'LKR' | 'MILLION' | 'USD'
  // Use prop currency mode if provided, otherwise use internal state
  const currencyMode = propCurrencyMode ?? internalCurrencyMode;
  const setCurrencyMode = propCurrencyMode ? () => {} : setInternalCurrencyMode;
  // default exchange rate LKR per 1 USD (adjustable)
  const EXCHANGE_RATE = 360; // 1 USD = 360 LKR (example)

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    if (currencyMode === 'LKR') {
      // full LKR with thousands separator
      return `₨${Number(value).toLocaleString()}`;
    }
    if (currencyMode === 'MILLION') {
      return `₨${(Number(value) / 1000000).toFixed(2)}M`;
    }
    // USD
    const usd = Number(value) / EXCHANGE_RATE;
    if (Math.abs(usd) >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
    if (Math.abs(usd) >= 1000) return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${usd.toFixed(2)}`;
  };
  if (!entries || entries.length === 0) {
    return <div className="text-center p-8 bg-yellow-50 rounded border border-yellow-200">📊 No progress entries yet. Submit progress data to see charts.</div>;
  }

  // Sort by createdAt ascending
  const sorted = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const latest = sorted[sorted.length - 1];

  // 1. TIME SERIES: Cumulative progress over time
  const timeSeries = sorted.map((e) => ({
    date: new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    cumulative: e.cumulativeProgressPercentageOfOverallTarget ?? e.yearEndProgressPercentage ?? 0,
    target: e.cumulativeTargetAtYearEnd ? 100 : null,
  }));

  // 2. QUARTERLY PROGRESS: Q1-Q4 targets
  const quarterlyData = [
    { name: 'Q1', target: latest.quarter1TargetPercentage ?? 0 },
    { name: 'Q2', target: latest.quarter2TargetPercentage ?? 0 },
    { name: 'Q3', target: latest.quarter3TargetPercentage ?? 0 },
    { name: 'Q4', target: latest.quarter4TargetPercentage ?? 0 },
  ];

  // 3. FINANCIAL ANALYSIS: Allocation vs Expenditure vs Bills
  const allocationTotal = latest.allocationCurrentYear ?? 0;
  const expenditureTotal = latest.actualExpenditure ?? 0;
  const billsInHandTotal = latest.billsInHand ?? 0;
  const priceEscalationTotal = latest.priceEscalation ?? 0;
  const imprestReceivedTotal = latest.imprestReceived ?? 0;

  const financialData = [
    { name: 'Allocation', value: allocationTotal },
    { name: 'Expenditure', value: expenditureTotal },
    { name: 'Bills in Hand', value: billsInHandTotal },
    { name: 'Price Escalation', value: priceEscalationTotal },
  ];

  // 4. ALLOCATION vs SPENT (Comparison)
  const allocationVsSpent = [
    { name: 'Allocated', value: allocationTotal },
    { name: 'Spent', value: expenditureTotal },
    { name: 'Remaining', value: Math.max(0, allocationTotal - expenditureTotal) },
  ];

  // 5. PROGRESS COMPLETION: Achieved vs Target
  const achieved = latest.cumulativeProgressPercentageOfOverallTarget ?? latest.yearEndProgressPercentage ?? 0;
  const progressData = [
    { name: 'Achieved', value: achieved, fill: '#22c55e' },
    { name: 'Remaining', value: Math.max(0, 100 - achieved), fill: '#e5e7eb' },
  ];

  // KPI Summary
  const kpis = [
    { label: 'Overall Progress', value: `${achieved.toFixed(1)}%`, color: 'bg-blue-100', textColor: 'text-blue-700' },
    { label: 'Total Allocation', value: formatCurrency(allocationTotal), color: 'bg-green-100', textColor: 'text-green-700' },
    { label: 'Total Spent', value: formatCurrency(expenditureTotal), color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { label: 'Budget Utilization', value: `${allocationTotal > 0 ? ((expenditureTotal / allocationTotal) * 100).toFixed(1) : 0}%`, color: 'bg-purple-100', textColor: 'text-purple-700' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className={`${kpi.color} p-4 rounded-lg shadow-md border-l-4 border-current`}>
            <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QUARTERLY TARGETS - Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Quarterly Progress Targets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quarterlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="target" fill="#22c55e" radius={[8, 8, 0, 0]} name="Target %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FINANCIAL BREAKDOWN - Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Financial Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financialData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ALLOCATION vs SPENT - Donut Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💸 Budget Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationVsSpent}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {allocationVsSpent.map((entry, index) => (
                  <Cell key={`alloc-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROGRESS COMPLETION - Gauge-style Pie */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Overall Project Completion Status</h3>
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="50%" height={250}>
            <PieChart>
              <Pie
                data={progressData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
              >
                {progressData.map((entry, index) => (
                  <Cell key={`progress-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 pl-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600">{achieved.toFixed(1)}%</p>
              <p className="text-gray-600 mt-2">Project Completion</p>
            </div>
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Main Objective:</span>
                <span className="font-semibold">{latest.mainObjective || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold">{latest.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Funding Source:</span>
                <span className="font-semibold">{latest.fundingSource || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressCharts;
