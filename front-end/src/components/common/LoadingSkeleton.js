import React from 'react';

const LoadingSkeleton = ({
    className = '',
    variant = 'rect',
    animate = 'pulse'
}) => {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700';
    const animationClasses = animate === 'pulse' ? 'animate-pulse' : 'animate-shimmer';

    const variantClasses = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4 w-full mb-2'
    }[variant] || 'rounded-lg';

    return (
        <div className={`${baseClasses} ${animationClasses} ${variantClasses} ${className}`} />
    );
};

export const CardSkeleton = () => (
    <div className="p-4 bg-surface border border-border rounded-2xl shadow-sm">
        <LoadingSkeleton className="h-40 w-full mb-4" />
        <LoadingSkeleton variant="text" className="w-3/4" />
        <LoadingSkeleton variant="text" className="w-1/2" />
        <div className="flex gap-2 mt-4">
            <LoadingSkeleton variant="circle" className="h-8 w-8" />
            <LoadingSkeleton variant="text" className="w-24 mt-2" />
        </div>
    </div>
);

export default LoadingSkeleton;
