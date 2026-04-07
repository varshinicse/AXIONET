import React from 'react';

const ModernCard = ({
    children,
    variant = 'flat',
    className = '',
    padding = 'p-6',
    hoverable = false,
    onClick,
    animate = true
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'glass':
                return 'glass-card';
            case 'neu':
                return 'neu-flat';
            case 'neu-pressed':
                return 'neu-pressed';
            case 'elevated':
                return 'bg-surface shadow-xl shadow-black/5 border border-border';
            case 'flat':
            default:
                return 'bg-surface border border-border shadow-sm';
        }
    };

    const interactiveClasses = (hoverable || onClick)
        ? 'cursor-pointer transition-all duration-normal hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
        : '';

    return (
        <div
            className={`
                rounded-2xl transition-all duration-normal overflow-hidden
                ${getVariantClasses()} 
                ${padding} 
                ${interactiveClasses} 
                ${animate ? 'animate-in' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default ModernCard;
