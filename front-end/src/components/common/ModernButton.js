import React from 'react';

const ModernButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    disabled = false,
    type = 'button',
    icon: Icon,
    iconPosition = 'left',
    loading = false
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'btn-primary';
            case 'secondary':
                return 'btn-secondary';
            case 'glass':
                return 'btn-glass';
            case 'neu':
                return 'btn-neu';
            case 'ghost':
                return 'text-text-secondary hover:text-text-primary hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-normal';
            case 'danger':
                return 'bg-error text-white hover:bg-red-600 shadow-lg shadow-error/20 hover:shadow-xl hover:shadow-error/30 hover:-translate-y-0.5';
            default:
                return 'btn-primary';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'xs': return 'px-2 py-1 text-xs rounded-lg';
            case 'sm': return 'px-3 py-1.5 text-sm rounded-lg';
            case 'lg': return 'px-8 py-4 text-lg rounded-2xl';
            case 'md':
            default: return 'px-5 py-2.5 rounded-xl';
        }
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`btn-modern group ${getVariantClasses()} ${getSizeClasses()} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
        >
            {loading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className={`${children ? 'mr-2' : ''} transition-transform duration-normal group-hover:scale-110`} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className={`${children ? 'ml-2' : ''} transition-transform duration-normal group-hover:scale-110`} />}
                </>
            )}
        </button>
    );
};

export default ModernButton;
