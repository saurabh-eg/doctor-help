import clsx from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    size?: 'sm' | 'md';
}

const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    default: 'bg-slate-100 text-slate-700',
};

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
    return (
        <span className={clsx(
            'inline-flex items-center font-medium rounded-full',
            variantStyles[variant],
            size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        )}>
            {children}
        </span>
    );
}

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
        pending: { label: 'Pending', variant: 'warning' },
        confirmed: { label: 'Confirmed', variant: 'info' },
        'in-progress': { label: 'In Progress', variant: 'info' },
        completed: { label: 'Completed', variant: 'success' },
        cancelled: { label: 'Cancelled', variant: 'error' },
        verified: { label: 'Verified', variant: 'success' },
        rejected: { label: 'Rejected', variant: 'error' },
        paid: { label: 'Paid', variant: 'success' },
        refunded: { label: 'Refunded', variant: 'warning' },
    };

    const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'default' };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
