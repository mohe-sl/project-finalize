import React from 'react';

/**
 * CalculatedField - Component for displaying auto-calculated read-only values
 * Shows a disabled input with calculator icon and optional formula explanation
 */
const CalculatedField = ({
    label,
    value,
    suffix = '%',
    formula = null,
    className = ''
}) => {
    const displayValue = value !== null && value !== undefined && value !== ''
        ? `${parseFloat(value).toFixed(2)}${suffix}`
        : '—';

    return (
        <div className={`calculated-field ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
                    </svg>
                    Auto-calculated
                </span>
            </label>

            <div className="relative">
                <div className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold text-lg cursor-not-allowed">
                    {displayValue}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
            </div>

            {formula && (
                <p className="mt-1 text-xs text-gray-500 italic">
                    Formula: {formula}
                </p>
            )}
        </div>
    );
};

export default CalculatedField;
