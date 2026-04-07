import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const ModernSelect = ({
    label,
    options = [],
    error,
    helperText,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
            {label && (
                <label className="text-sm font-semibold text-text-secondary ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <select
                    className={`
                        w-full py-3 pl-4 pr-10 rounded-xl border-2 transition-all duration-normal
                        bg-surface text-text-primary outline-none appearance-none
                        ${error
                            ? 'border-error/50 focus:border-error shadow-lg shadow-error/5'
                            : 'border-border focus:border-primary focus:shadow-lg focus:shadow-primary/5'}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within:text-primary transition-colors duration-normal">
                    <FaChevronDown size={14} />
                </div>
            </div>
            {(error || helperText) && (
                <p className={`text-xs ml-1 ${error ? 'text-error animate-in' : 'text-text-secondary opacity-70'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default ModernSelect;
