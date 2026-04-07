import React from 'react';

const ModernBadge = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    dot = false
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary': return 'bg-primary/10 text-primary border-primary/20';
            case 'success': return 'bg-success/10 text-success border-success/20';
            case 'error': return 'bg-error/10 text-error border-error/20';
            case 'warning': return 'bg-warning/10 text-warning border-warning/20';
            case 'gray': return 'bg-gray-500/10 text-text-secondary border-gray-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'text-[10px] px-1.5 py-0.5 rounded-md';
            case 'lg': return 'text-sm px-3 py-1 rounded-lg';
            case 'md':
            default: return 'text-xs px-2 py-0.5 rounded-md';
        }
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 font-bold border
            ${getVariantClasses()} 
            ${getSizeClasses()} 
            ${className}
        `}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
            {children}
        </span>
    );
};

export default ModernBadge;
