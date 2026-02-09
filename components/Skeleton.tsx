import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1
}) => {
    const baseClasses = 'animate-pulse bg-slate-200';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl'
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%')
    };

    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    ));

    return count > 1 ? <div className="space-y-2">{skeletons}</div> : skeletons[0];
};

// Card Skeleton for dashboard cards
export const CardSkeleton: React.FC = () => (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
        <div className="flex items-center gap-4 mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1">
                <Skeleton variant="text" height={20} className="mb-2" />
                <Skeleton variant="text" width="60%" height={14} />
            </div>
        </div>
        <Skeleton variant="rectangular" height={80} className="mb-4" />
        <div className="flex gap-2">
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
        </div>
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
    <tr>
        {Array.from({ length: columns }, (_, i) => (
            <td key={i} className="px-6 py-4">
                <Skeleton variant="text" height={20} />
            </td>
        ))}
    </tr>
);

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                        <Skeleton variant="text" width="70%" height={16} className="mb-1" />
                        <Skeleton variant="text" width="40%" height={12} />
                    </div>
                    <Skeleton variant="rectangular" width={60} height={28} />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
