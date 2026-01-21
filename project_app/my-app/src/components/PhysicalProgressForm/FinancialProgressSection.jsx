import React, { useState } from 'react';
import './PhysicalProgressForm.css';

/**
 * FinancialProgressSection - Redesigned Financial Progress form section
 * Features a table-based layout for financial data entry, access control, and currency conversion.
 */
const FinancialProgressSection = ({
    form,
    onChange,
    isEditing = true,
    projectName = "—",
    userRole,
    onSave
}) => {
    // Currency configuration
    const [currency, setCurrency] = useState('LKR');

    // Approximate exchange rates (Base: LKR)
    // In a real app, these should be fetched from an API
    const exchangeRates = {
        'LKR': 1,
        'USD': 0.0033,
        'GBP': 0.0026,
        'EUR': 0.0031,
        'CNY': 0.024,
        'JPY': 0.49,
        'AUD': 0.0051
    };

    const currencies = Object.keys(exchangeRates);

    // Convert value for display
    const convertValue = (val) => {
        if (!val) return '';
        const num = parseFloat(val);
        if (isNaN(num)) return '';
        if (currency === 'LKR') return val;

        // Convert and format
        return (num * exchangeRates[currency]).toFixed(2);
    };

    // Helper for rendering table inputs
    const renderTableInput = (name, placeholder, type = "number") => {
        // Access Control: Only financialStaff can edit
        // Currency Contorl: Only editable in LKR
        const isFinancialStaff = userRole === 'financialStaff';
        const isLKR = currency === 'LKR';
        const canEditField = isEditing && isFinancialStaff && isLKR;

        // Display value: raw form value if LKR, converted value otherwise
        const displayValue = isLKR ? (form[name] || '') : convertValue(form[name]);

        return (
            <div className="relative w-full">
                <input
                    type={isLKR ? type : "text"}
                    name={name}
                    value={displayValue}
                    onChange={onChange}
                    disabled={!canEditField}
                    placeholder={isLKR ? placeholder : ""}
                    min="0"
                    step="0.01"
                    className={`w-full p-2 border rounded text-right font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${!canEditField ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'}
                        ${isLKR && form[name] && parseFloat(form[name]) < 0 ? 'border-red-300 bg-red-50 text-red-600' : ''}
                    `}
                />
                {!isLKR && (
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        {currency}
                    </span>
                )}
            </div>
        );
    };

    const cumulativeValue = form.cumulativeExpenditureAtYearEnd
        ? parseFloat(form.cumulativeExpenditureAtYearEnd).toFixed(2)
        : '0.00';

    const displayCumulative = convertValue(cumulativeValue);

    return (
        <div className="financial-progress-section overflow-x-auto relative pb-8">
            {/* Toolbar: Currency & Save */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Display Currency:</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {currencies.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    {currency !== 'LKR' && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            ⚠ View only. Switch to LKR to edit.
                        </span>
                    )}
                </div>
            </div>

            <div className="min-w-[1000px] border border-gray-200 rounded-lg shadow-sm overflow-hidden font-sans">
                {/* Table Header */}
                <div className="bg-[#0f4c81] text-white grid grid-cols-8 gap-0 text-sm font-semibold divide-x divide-blue-800">
                    <div className="p-3 flex items-center">
                        Department / Project
                        <span className="ml-1 text-blue-300 opacity-70" title="Project Name">ⓘ</span>
                    </div>
                    <div className="p-3">
                        Allocation 2025 ({currency === 'LKR' ? 'Rs. Mn.' : currency})
                        <div className="text-[10px] font-normal opacity-80 mt-1">Total funds allocated for the year.</div>
                    </div>
                    <div className="p-3">
                        Expenditure Target
                        <div className="text-[10px] font-normal opacity-80 mt-1">Targeted spending amount</div>
                    </div>
                    <div className="p-3">
                        Imprest Requested
                        <div className="text-[10px] font-normal opacity-80 mt-1">Targeted spending amount</div>
                    </div>
                    <div className="p-3">
                        Imprest Received
                        <div className="text-[10px] font-normal opacity-80 mt-1">Targeted spending amount</div>
                    </div>
                    <div className="p-3">
                        Actual Expenditure
                        <div className="text-[10px] font-normal opacity-80 mt-1">Targeted spending amount</div>
                    </div>
                    <div className="p-3">
                        Bills in Hand
                        <div className="text-[10px] font-normal opacity-80 mt-1">Bills calculated expenditure</div>
                    </div>
                    <div className="p-3">
                        Cumulative Expenditure
                        <div className="text-[10px] font-normal opacity-80 mt-1">Auto-calculated expenditure</div>
                    </div>
                </div>

                {/* Table Rows - Currently displaying single row for the active project */}
                <div className="bg-white divide-y divide-gray-100">
                    <div className="grid grid-cols-8 gap-0 text-sm group hover:bg-gray-50 transition-colors">
                        {/* 1. Project Name */}
                        <div className="p-3 flex items-center font-medium text-gray-700 border-r border-gray-100 bg-gray-50">
                            {projectName || "—"}
                        </div>

                        {/* 2. Allocation */}
                        <div className="p-3 border-r border-gray-100 flex items-center">
                            {renderTableInput('allocationCurrentYear', '0.00')}
                        </div>

                        {/* 3. Expenditure Target */}
                        <div className="p-3 border-r border-gray-100 flex items-center">
                            {renderTableInput('expenditureTarget', '0.00')}
                        </div>

                        {/* 4. Imprest Requested */}
                        <div className="p-3 border-r border-gray-100 flex items-center">
                            {renderTableInput('imprestRequested', '0.00')}
                        </div>

                        {/* 5. Imprest Received */}
                        <div className="p-3 border-r border-gray-100 flex items-center">
                            {renderTableInput('imprestReceived', '0.00')}
                        </div>

                        {/* 6. Actual Expenditure */}
                        <div className="p-3 border-r border-gray-100 flex items-center">
                            {renderTableInput('actualExpenditure', '0.00')}
                        </div>

                        {/* 7. Bills in Hand */}
                        <div className="p-3 border-r border-gray-100 flex items-center">
                            {renderTableInput('billsInHand', '0.00')}
                        </div>

                        {/* 8. Cumulative Expenditure (Read Only) */}
                        <div className="p-3 flex items-center bg-gray-50 font-bold text-gray-700 text-right justify-end pr-4">
                            {displayCumulative}
                        </div>
                    </div>
                </div>

                {/* Helper / Footer Row */}
                <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs text-center text-gray-500 italic">
                    All financial values are in {currency === 'LKR' ? 'Rs. Mn.' : currency} • Rates are approximate for reference only.
                </div>
            </div>

            {/* Additional Fields not in table but present in data model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Escalation</label>
                    <input
                        type="number"
                        name="priceEscalation"
                        value={currency === 'LKR' ? (form.priceEscalation || '') : convertValue(form.priceEscalation)}
                        onChange={onChange}
                        disabled={!isEditing || userRole !== 'financialStaff' || currency !== 'LKR'}
                        placeholder="0.00"
                        className="w-full p-3 border border-gray-300 rounded text-right disabled:bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reasons for not achieving financial targets</label>
                    <textarea
                        name="financialTargetFailureReasons"
                        value={form.financialTargetFailureReasons || ''}
                        onChange={onChange}
                        disabled={!isEditing || userRole !== 'financialStaff'}
                        rows={1}
                        className="w-full p-3 border border-gray-300 rounded disabled:bg-gray-100"
                    />
                </div>
            </div>

            {/* Save Button for Financial Staff */}
            {userRole === 'financialStaff' && (
                <div className="mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={onSave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Financial Progress
                    </button>
                </div>
            )}
        </div>
    );
};

export default FinancialProgressSection;
