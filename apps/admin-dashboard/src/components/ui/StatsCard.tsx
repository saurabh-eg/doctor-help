import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    className?: string;
}

export default function StatsCard({ 
    title, 
    value, 
    icon, 
    change, 
    changeType = 'neutral',
    className 
}: StatsCardProps) {
    return (
        <div className={clsx(
            'bg-white rounded-2xl p-6 border border-slate-100',
            className
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                    {change && (
                        <p className={clsx(
                            'text-sm font-medium mt-2',
                            changeType === 'positive' && 'text-emerald-600',
                            changeType === 'negative' && 'text-red-600',
                            changeType === 'neutral' && 'text-slate-500'
                        )}>
                            {change}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-primary-50 rounded-xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}
