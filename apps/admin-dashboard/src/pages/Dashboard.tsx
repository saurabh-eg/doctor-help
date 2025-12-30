import { useQuery } from '@tanstack/react-query';
import { 
    Users, 
    Stethoscope, 
    Calendar, 
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { StatsCard, StatusBadge, PageLoader } from '../components/ui';
import { DashboardStats } from '../types';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await adminApi.getDashboard();
            return response.data.data as DashboardStats;
        },
    });

    const { data: revenueStats } = useQuery({
        queryKey: ['revenue-stats'],
        queryFn: async () => {
            const response = await adminApi.getRevenueStats();
            return response.data.data;
        },
    });

    if (isLoading) return <PageLoader />;
    
    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load dashboard data</p>
            </div>
        );
    }

    if (!data) return null;

    // Format revenue
    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    // Prepare chart data
    const statusChartData = Object.entries(data.appointments.byStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
    }));

    const typeChartData = Object.entries(data.appointments.byType).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Platform overview and statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Users"
                    value={data.users.total.toLocaleString()}
                    icon={<Users className="w-6 h-6 text-primary-600" />}
                    change={`${data.users.patients} patients, ${data.users.doctors} doctors`}
                />
                <StatsCard
                    title="Verified Doctors"
                    value={data.doctors.verified}
                    icon={<Stethoscope className="w-6 h-6 text-primary-600" />}
                    change={`${data.doctors.pendingVerification} pending`}
                    changeType={data.doctors.pendingVerification > 0 ? 'negative' : 'positive'}
                />
                <StatsCard
                    title="Today's Appointments"
                    value={data.appointments.today}
                    icon={<Calendar className="w-6 h-6 text-primary-600" />}
                    change={`${data.appointments.thisMonth} this month`}
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={formatCurrency(data.revenue.thisMonth)}
                    icon={<DollarSign className="w-6 h-6 text-primary-600" />}
                    change={`${data.revenue.growth}% vs last month`}
                    changeType={Number(data.revenue.growth) >= 0 ? 'positive' : 'negative'}
                />
            </div>

            {/* Pending Verifications Alert */}
            {data.doctors.pendingVerification > 0 && (
                <Link to="/verifications">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-amber-800">
                                    {data.doctors.pendingVerification} Doctor{data.doctors.pendingVerification > 1 ? 's' : ''} Pending Verification
                                </p>
                                <p className="text-sm text-amber-600">Click to review and verify</p>
                            </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                </Link>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trend</h3>
                    {revenueStats && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                                <Tooltip 
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Appointments by Status */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Appointments by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Appointments</h3>
                    <Link to="/appointments" className="text-sm text-primary-600 hover:underline">
                        View all
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Patient</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Doctor</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentAppointments.map((appointment: any) => (
                                <tr key={appointment._id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-slate-900">
                                            {appointment.patientId?.name || 'Unknown'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {appointment.patientId?.phone}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-slate-900">
                                            {appointment.doctorId?.userId?.name || 'Unknown'}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-slate-700">
                                            {format(new Date(appointment.date), 'MMM d, yyyy')}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {appointment.timeSlot?.start}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="capitalize text-slate-700">{appointment.type}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusBadge status={appointment.status} />
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                                        ₹{appointment.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
