import React from 'react';

/**
 * SectionCard - Reusable section card component for government-style forms
 * Features a colored header with title and clean card layout
 */
const SectionCard = ({
    title,
    children,
    headerColor = 'bg-blue-700',
    icon = null,
    helperText = null
}) => {
    return (
        <div className="section-card bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Section Header */}
            <div className={`section-header ${headerColor} px-6 py-4 flex items-center gap-3`}>
                {icon && <span className="text-white text-xl">{icon}</span>}
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    {title}
                </h3>
            </div>

            {/* Section Content */}
            <div className="section-content p-6">
                {helperText && (
                    <p className="text-sm text-gray-500 italic mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {helperText}
                    </p>
                )}
                {children}
            </div>
        </div>
    );
};

export default SectionCard;
