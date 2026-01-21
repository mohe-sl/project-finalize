import React, { useState, useEffect } from 'react';
import './PhysicalProgressForm.css';

/**
 * PhysicalProgressSection - A redesigned Physical Progress form section
 * matching government/project monitoring system layout with:
 * - Overall Physical Targets
 * - Targets for Year
 * - Progress as at Date
 * - Additional Information
 */
const PhysicalProgressSection = ({
    form,
    onChange,
    isEditing = true,
    t,
    imagePreviews = {},
    onImageChange,
    onImageRemove
}) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState('March');

    // Parse contractors and consultants from form (support both string and array formats)
    const parseList = (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string' && value.trim()) {
            // Try to parse as JSON array first
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                // If not JSON, split by comma or treat as single entry
                return value.includes(',') ? value.split(',').map(s => s.trim()).filter(Boolean) : [value];
            }
        }
        return [''];
    };

    const [contractorsList, setContractorsList] = useState(() => parseList(form.contractors));
    const [consultantsList, setConsultantsList] = useState(() => parseList(form.consultants));

    // Update lists when form changes externally
    useEffect(() => {
        setContractorsList(parseList(form.contractors));
    }, [form.contractors]);

    useEffect(() => {
        setConsultantsList(parseList(form.consultants));
    }, [form.consultants]);

    // Handle adding new contractor
    const addContractor = () => {
        const newList = [...contractorsList, ''];
        setContractorsList(newList);
        onChange({ target: { name: 'contractors', value: JSON.stringify(newList.filter(Boolean)) } });
    };

    // Handle removing contractor
    const removeContractor = (index) => {
        const newList = contractorsList.filter((_, i) => i !== index);
        if (newList.length === 0) newList.push('');
        setContractorsList(newList);
        onChange({ target: { name: 'contractors', value: JSON.stringify(newList.filter(Boolean)) } });
    };

    // Handle contractor change
    const handleContractorChange = (index, value) => {
        const newList = [...contractorsList];
        newList[index] = value;
        setContractorsList(newList);
        onChange({ target: { name: 'contractors', value: JSON.stringify(newList.filter(Boolean)) } });
    };

    // Handle adding new consultant
    const addConsultant = () => {
        const newList = [...consultantsList, ''];
        setConsultantsList(newList);
        onChange({ target: { name: 'consultants', value: JSON.stringify(newList.filter(Boolean)) } });
    };

    // Handle removing consultant
    const removeConsultant = (index) => {
        const newList = consultantsList.filter((_, i) => i !== index);
        if (newList.length === 0) newList.push('');
        setConsultantsList(newList);
        onChange({ target: { name: 'consultants', value: JSON.stringify(newList.filter(Boolean)) } });
    };

    // Handle consultant change
    const handleConsultantChange = (index, value) => {
        const newList = [...consultantsList];
        newList[index] = value;
        setConsultantsList(newList);
        onChange({ target: { name: 'consultants', value: JSON.stringify(newList.filter(Boolean)) } });
    };

    // Calculate cumulative percentage based on overall target
    const calculateCumulativePercentage = () => {
        const progressAsOfPrevDec = parseFloat(form.progressAsOfPrevDecPercentage) || 0;
        const yearEndProgress = parseFloat(form.yearEndProgressPercentage) || 0;
        return Math.min(100, progressAsOfPrevDec + yearEndProgress);
    };

    // Get month options for dropdown
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // Get year options (current year and a few years before/after)
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    // Format progress date display
    const getProgressDateLabel = () => {
        const month = selectedMonth;
        const monthIndex = months.indexOf(month);
        // Last day of selected month
        const lastDay = new Date(selectedYear, monthIndex + 1, 0).getDate();
        const monthNum = String(monthIndex + 1).padStart(2, '0');
        return `${lastDay}.${monthNum}.${selectedYear}`;
    };

    // Handle quarterly target changes
    const handleQuarterlyChange = (quarter, value) => {
        const fieldName = `quarter${quarter}TargetPercentage`;
        onChange({ target: { name: fieldName, value } });
    };

    return (
        <div className="physical-progress-section">
            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Overall Physical Targets Section */}
                    <div className="section-card bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="section-header bg-blue-800 px-5 py-3">
                            <h3 className="text-base font-bold text-white">
                                Overall Physical Targets
                            </h3>
                        </div>
                        <div className="section-content p-5 space-y-4">
                            {/* Overall physical target (expected outputs) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Overall physical target (expected outputs)*
                                </label>
                                <textarea
                                    name="overallTarget"
                                    value={form.overallTarget || ''}
                                    onChange={onChange}
                                    disabled={!isEditing}
                                    placeholder="Enter descriptive expected outputs..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                />
                            </div>

                            {/* Cumulative physical progress as at December (%) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cumulative physical progress as at December {selectedYear - 1} (%)*
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 max-w-[150px]">
                                        <input
                                            type="number"
                                            name="progressAsOfPrevDecPercentage"
                                            value={form.progressAsOfPrevDecPercentage || ''}
                                            onChange={onChange}
                                            disabled={!isEditing}
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Targets for Year Section */}
                    <div className="section-card bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="section-header bg-blue-800 px-5 py-3">
                            <h3 className="text-base font-bold text-white">
                                Targets for {selectedYear}
                            </h3>
                        </div>
                        <div className="section-content p-5 space-y-4">
                            {/* Target Period Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Period Selection
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Year</label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            disabled={!isEditing}
                                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Month</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            {months.map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Targets for: [Month] [Year] */}
                            <div className="pt-2 border-t border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Targets for: {selectedMonth} {selectedYear}
                                </label>
                            </div>

                            {/* Descriptive target for the selected period */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descriptive target for the selected period*
                                </label>
                                <textarea
                                    name="currentYearDescriptiveTarget"
                                    value={form.currentYearDescriptiveTarget || ''}
                                    onChange={onChange}
                                    disabled={!isEditing}
                                    placeholder={`Describe the target for ${selectedMonth} ${selectedYear}...`}
                                    rows={2}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                />
                            </div>

                            {/* Cumulative Quarterly Targets (%) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Cumulative Quarterly Targets (%)
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['1', '2', '3', '4'].map((q) => (
                                        <div key={q}>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1 text-center">
                                                Q{q}*
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="number"
                                                    name={`quarter${q}TargetPercentage`}
                                                    value={form[`quarter${q}TargetPercentage`] || ''}
                                                    onChange={(e) => handleQuarterlyChange(q, e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className="w-full p-2 pr-8 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Progress as at Date Section */}
                    <div className="section-card bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="section-header bg-blue-800 px-5 py-3">
                            <h3 className="text-base font-bold text-white">
                                Progress as at {getProgressDateLabel()}
                            </h3>
                        </div>
                        <div className="section-content p-5 space-y-4">
                            {/* Progress description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Progress description*
                                </label>
                                <textarea
                                    name="yearEndProgressDescription"
                                    value={form.yearEndProgressDescription || ''}
                                    onChange={onChange}
                                    disabled={!isEditing}
                                    placeholder={`Describe the progress made up to ${getProgressDateLabel()}...`}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                />
                            </div>

                            {/* Progress as % of target and Cumulative physical target */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Progress as % of target*
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="yearEndProgressPercentage"
                                            value={form.yearEndProgressPercentage || ''}
                                            onChange={onChange}
                                            disabled={!isEditing}
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                                            %
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cumulative physical target as at {getProgressDateLabel()} (%)
                                    </label>
                                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold cursor-not-allowed flex items-center justify-between">
                                        <span>{calculateCumulativePercentage().toFixed(1)}%</span>
                                        <span className="text-xs text-gray-500 font-normal">(Auto-calculated)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="section-card bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="section-header bg-blue-800 px-5 py-3">
                            <h3 className="text-base font-bold text-white">
                                Additional Information
                            </h3>
                        </div>
                        <div className="section-content p-5 space-y-4">
                            {/* Reasons for not achieving physical / financial targets */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reasons for not achieving physical / financial targets*
                                </label>
                                <textarea
                                    name="physicalTargetFailureReasons"
                                    value={form.physicalTargetFailureReasons || ''}
                                    onChange={onChange}
                                    disabled={!isEditing}
                                    placeholder="Provide reasons if applicable..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                />
                            </div>

                            {/* Contractors - Multiple entries */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Contractor(s)*
                                    </label>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={addContractor}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Contractor
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {contractorsList.map((contractor, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={contractor}
                                                onChange={(e) => handleContractorChange(index, e.target.value)}
                                                disabled={!isEditing}
                                                placeholder={`Contractor ${index + 1}`}
                                                className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                            {isEditing && contractorsList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeContractor(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                    title="Remove contractor"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Consultants - Multiple entries */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Consultant(s)*
                                    </label>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={addConsultant}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Consultant
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {consultantsList.map((consultant, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={consultant}
                                                onChange={(e) => handleConsultantChange(index, e.target.value)}
                                                disabled={!isEditing}
                                                placeholder={`Consultant ${index + 1}`}
                                                className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                            {isEditing && consultantsList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeConsultant(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                    title="Remove consultant"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PhysicalProgressSection;

