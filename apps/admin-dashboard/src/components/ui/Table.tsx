import { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// Table Container
interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = '' }: TableProps) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    {children}
                </table>
            </div>
        </div>
    );
}

// Table Header
interface TableHeadProps {
    children: ReactNode;
}

export function TableHead({ children }: TableHeadProps) {
    return (
        <thead className="bg-slate-50/80 border-b border-slate-100">
            {children}
        </thead>
    );
}

// Table Header Row
interface TableHeaderProps {
    children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
    return <tr>{children}</tr>;
}

// Table Header Cell
interface TableHeadCellProps {
    children?: ReactNode;
    className?: string;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
    align?: 'left' | 'center' | 'right';
}

export function TableHeadCell({ 
    children, 
    className = '', 
    sortable = false,
    sortDirection = null,
    onSort,
    align = 'left'
}: TableHeadCellProps) {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];

    return (
        <th 
            className={`px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${alignClass} ${sortable ? 'cursor-pointer select-none hover:text-slate-700' : ''} ${className}`}
            onClick={sortable ? onSort : undefined}
        >
            <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
                {children}
                {sortable && (
                    <span className="text-slate-400">
                        {sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                        ) : sortDirection === 'desc' ? (
                            <ChevronDown size={14} />
                        ) : (
                            <ChevronsUpDown size={14} />
                        )}
                    </span>
                )}
            </div>
        </th>
    );
}

// Table Body
interface TableBodyProps {
    children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
    return (
        <tbody className="divide-y divide-slate-50">
            {children}
        </tbody>
    );
}

// Table Row
interface TableRowProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    isClickable?: boolean;
}

export function TableRow({ children, className = '', onClick, isClickable = false }: TableRowProps) {
    return (
        <tr 
            className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-primary-50/50' : 'hover:bg-slate-50/50'} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

// Table Cell
interface TableCellProps {
    children?: ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];

    return (
        <td className={`px-5 py-4 text-sm text-slate-600 ${alignClass} ${className}`}>
            {children}
        </td>
    );
}

// Empty State
interface TableEmptyProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    colSpan?: number;
}

export function TableEmpty({ icon, title, description, action, colSpan = 6 }: TableEmptyProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-5 py-16 text-center">
                {icon && (
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 text-slate-400">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
                {description && <p className="text-slate-500 mb-4">{description}</p>}
                {action}
            </td>
        </tr>
    );
}

// Loading Skeleton Row
interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-5 py-4">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default Table;
