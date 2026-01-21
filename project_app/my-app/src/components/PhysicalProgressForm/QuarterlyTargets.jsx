import React from 'react';

/**
 * QuarterlyTargets - Component for quarterly percentage inputs with validation
 * Validates cumulative values (Q2 >= Q1, Q3 >= Q2, Q4 >= Q3) and Q4 = 100%
 */
const QuarterlyTargets = ({
    values = { q1: '', q2: '', q3: '', q4: '' },
    onChange,
    disabled = false,
    errors = {}
}) => {
    const quarters = [
        { key: 'q1', label: 'Q1', color: 'bg-blue-100 text-blue-800 border-blue-300' },
        { key: 'q2', label: 'Q2', color: 'bg-green-100 text-green-800 border-green-300' },
        { key: 'q3', label: 'Q3', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { key: 'q4', label: 'Q4', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    ];

    const handleChange = (key, value) => {
        const numValue = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value) || 0));
        onChange({ ...values, [key]: numValue });
    };

    // Validate cumulative progression
    const validateQuarters = () => {
        const warnings = [];
        const q1 = parseFloat(values.q1) || 0;
        const q2 = parseFloat(values.q2) || 0;
        const q3 = parseFloat(values.q3) || 0;
        const q4 = parseFloat(values.q4) || 0;

        if (q2 < q1) warnings.push('Q2 should be ≥ Q1');
        if (q3 < q2) warnings.push('Q3 should be ≥ Q2');
        if (q4 < q3) warnings.push('Q4 should be ≥ Q3');
        if (q4 !== 0 && q4 !== 100) warnings.push('Q4 should equal 100%');

        return warnings;
    };

    const warnings = validateQuarters();

    return (
        <div className="quarterly-targets">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                {quarters.map(({ key, label, color }) => (
                    <div key={key} className="relative">
                        <label className={`block text-center text-sm font-semibold mb-2 px-3 py-1 rounded-full ${color}`}>
                            {label} Target
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={values[key]}
                                onChange={(e) => handleChange(key, e.target.value)}
                                disabled={disabled}
                                placeholder="0"
                                className={`w-full p-3 pr-8 border rounded-lg text-center text-lg font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:shadow-md'}
                  ${errors[key] ? 'border-red-500' : 'border-gray-300'}
                `}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                %
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Bar Visualization */}
            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="flex h-full">
                    <div
                        className="bg-blue-500 transition-all duration-300"
                        style={{ width: `${parseFloat(values.q1) || 0}%` }}
                    />
                    <div
                        className="bg-green-500 transition-all duration-300"
                        style={{ width: `${Math.max(0, (parseFloat(values.q2) || 0) - (parseFloat(values.q1) || 0))}%` }}
                    />
                    <div
                        className="bg-yellow-500 transition-all duration-300"
                        style={{ width: `${Math.max(0, (parseFloat(values.q3) || 0) - (parseFloat(values.q2) || 0))}%` }}
                    />
                    <div
                        className="bg-purple-500 transition-all duration-300"
                        style={{ width: `${Math.max(0, (parseFloat(values.q4) || 0) - (parseFloat(values.q3) || 0))}%` }}
                    />
                </div>
            </div>

            {/* Validation Warnings */}
            {warnings.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{warnings.join(' • ')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuarterlyTargets;
