import React from 'react';

/**
 * PercentageInput - Specialized input for percentage values (0-100)
 * Shows % suffix and validates numeric range
 */
const PercentageInput = ({
    label,
    name,
    value,
    onChange,
    placeholder = '0',
    disabled = false,
    error = null,
    min = 0,
    max = 100,
    step = 0.1,
    required = false
}) => {
    const handleChange = (e) => {
        let newValue = e.target.value;
        if (newValue !== '') {
            newValue = Math.min(max, Math.max(min, parseFloat(newValue) || 0));
        }
        onChange({ target: { name, value: newValue } });
    };

    return (
        <div className="percentage-input">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <input
                    type="number"
                    name={name}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`w-full p-3 pr-10 border rounded-lg shadow-sm 
            focus:outline-none focus:ring-2 transition duration-200
            ${disabled
                            ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                            : 'bg-white hover:shadow-md'
                        }
            ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }
          `}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                    %
                </span>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default PercentageInput;
