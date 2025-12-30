import { useQuery } from '@tanstack/react-query';
import { 
    Users, 
    Stethoscope, 
    Calendar, 
    IndianRupee,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Clock,
    ArrowRight,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { 
    PageLoader, 
    StatusBadge,
    Table,
    TableHead,
    TableHeader,
    TableHeadCell,
    TableBody,
    TableRow,
    TableCell
} from '../components/ui';
import { DashboardStats } from '../types';
import { 
    AreaChart, 
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
    confirmed: '#2563eb',
    completed: '#10b981',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    'no-show': '#8b5cf6',
};

// Modern Stats Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    trend?: {
        value: string | number;
        isPositive: boolean;
        label: string;
    };
    link?: string;
}

function StatCard({ title, value, icon, iconBg, trend, link }: StatCardProps) {
    const Content = (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all duration-200 group">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend.isPositive ? (
                                <TrendingUp size={14} className="text-emerald-500" />
                            ) : (
                                <TrendingDown size={14} className="text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {trend.value}
                            </span>
                            <span className="text-xs text-slate-400">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    {icon}
                </div>
            </div>
            {link && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-sm text-primary-600 font-medium group-hover:gap-2 transition-all">
                    <span>View details</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
    );

    return link ? <Link to={link}>{Content}</Link> : Content;
}

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await adminApi.getDashboard();
            return response.data.data as DashboardStats;
        },
        staleTime: 30000,
    });

    const { data: revenueStats } = useQuery({
        queryKey: ['revenue-stats'],
        queryFn: async () => {
            const response = await adminApi.getRevenueStats();
            return response.data.data;
        },
        staleTime: 60000,
    });

    if (isLoading) return <PageLoader />;
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                    <Activity className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load dashboard</h3>
                <p className="text-slate-500">Please try refreshing the page</p>
            </div>
        );
    }

    if (!data) return null;

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    const statusChartData = Object.entries(data.appointments.byStatus || {}).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: STATUS_COLORS[status] || '#94a3b8',
    }));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        Welcome back! Here's your platform overview.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} />
                    <span>Last updated: {format(new Date(), 'MMM d, h:mm a')}</span>
                </div>
            </div>

            {/* Pending Verifications Alert */}
            {data.doctors.pendingVerification > 0 && (
                <Link to="/verifications">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <ShieldAlert className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-amber-900">
                                    {data.doctors.pendingVerification} Doctor{data.doctors.pendingVerification > 1 ? 's' : ''} Awaiting Verification
                                </p>
                                <p className="text-sm text-amber-700">Review documents and approve doctor profiles</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={data.users.total.toLocaleString()}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    iconBg="bg-blue-50"
                    trend={{
                        value: `${data.users.patients} patients`,
                        isPositive: true,
                        label: `· ${data.users.doctors} doctors`
                    }}
                    link="/users"
                />
                <StatCard
                    title="Verified Doctors"
                    value={data.doctors.verified}
                    icon={<Stethoscope className="w-5 h-5 text-emerald-600" />}
                    iconBg="bg-emerald-50"
                    trend={{
                        value: data.doctors.pendingVerification,
                        isPositive: data.doctors.pendingVerification === 0,
                        label: 'pending review'
                    }}
                    link="/doctors"
                />
                <StatCard
                    title="Today's Appointments"
                    value={data.appointments.today}
                    icon={<Calendar className="w-5 h-5 text-violet-600" />}
                    iconBg="bg-violet-50"
                    trend={{
                        value: data.appointments.thisMonth,
                        isPositive: true,
                        label: 'this month'
                    }}
                    link="/appointments"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(data.revenue.thisMonth)}
                    icon={<IndianRupee className="w-5 h-5 text-amber-600" />}
                    iconBg="bg-amber-50"
                    trend={{
                        value: `${data.revenue.growth}%`,
                        isPositive: Number(data.revenue.growth) >= 0,
                        label: 'vs last month'
                    }}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Monthly revenue trend</p>
                        </div>
                    </div>
                    {revenueStats && revenueStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={revenueStats}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value >= 1000 ? `${value/1000}k` : value}`}
                                />
                                <Tooltip 
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#2563eb" 
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-slate-400">
                            No revenue data available
                        </div>
                    )}
                </div>

                {/* Appointments by Status */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Appointment Status</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Distribution overview</p>
                    </div>
                    {statusChartData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {statusChartData.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-slate-600">{entry.name}</span>
                                        </div>
                                        <span className="font-medium text-slate-900">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-slate-400">
                            No appointment data
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Recent Appointments</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Latest booking activity</p>
                    </div>
                    <Link 
                        to="/appointments" 
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        View all
                        <ArrowRight size={14} />
                    </Link>
                </div>
                
                <Table>
                    <TableHead>
                        <TableHeader>
                            <TableHeadCell>Patient</TableHeadCell>
                            <TableHeadCell>Doctor</TableHeadCell>
                            <TableHeadCell>Date & Time</TableHeadCell>
                            <TableHeadCell>Type</TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell align="right">Amount</TableHeadCell>
                        </TableHeader>
                    </TableHead>
                    <TableBody>
                        {data.recentAppointments?.map((appointment: any) => (
                            <TableRow key={appointment._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-slate-600">
                                                {appointment.patientId?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {appointment.patientId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {appointment.patientId?.phone}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium text-slate-700">
                                        Dr. {appointment.doctorId?.userId?.name || 'Unknown'}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <p className="text-slate-900">
                                        {format(new Date(appointment.date), 'MMM d, yyyy')}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {appointment.timeSlot?.start || '-'}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                        {appointment.type}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={appointment.status} />
                                </TableCell>
                                <TableCell align="right">
                                    <span className="font-semibold text-slate-900">
                                        ₹{appointment.amount?.toLocaleString() || 0}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
