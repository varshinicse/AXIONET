import React from 'react';

const ModernInput = ({
    label,
    icon: Icon,
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
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors duration-normal">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        w-full py-3 px-4 rounded-xl border-2 transition-all duration-normal
                        bg-surface text-text-primary outline-none
                        placeholder:text-text-secondary/50
                        ${Icon ? 'pl-11' : ''}
                        ${error
                            ? 'border-error/50 focus:border-error shadow-lg shadow-error/5'
                            : 'border-border focus:border-primary focus:shadow-lg focus:shadow-primary/5'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {(error || helperText) && (
                <p className={`text-xs ml-1 ${error ? 'text-error animate-in' : 'text-text-secondary opacity-70'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default ModernInput;
