import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Clock, Video, Building2, Home, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Appointment, Pagination } from '../types';
import { Input, Button, PageLoader, StatusBadge } from '../components/ui';

export default function AppointmentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['appointments', page, statusFilter, typeFilter],
        queryFn: async () => {
            const response = await adminApi.getAppointments({ 
                page, 
                limit: 20, 
                status: statusFilter !== 'all' ? statusFilter : undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
            });
            return {
                appointments: response.data.data as Appointment[],
                pagination: response.data.pagination as Pagination,
            };
        },
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'clinic': return <Building2 className="w-4 h-4" />;
            case 'home': return <Home className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'in-progress': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'refunded': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load appointments</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                <p className="text-slate-500 mt-1">
                    Monitor all platform appointments
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Types</option>
                        <option value="video">Video Call</option>
                        <option value="clinic">Clinic Visit</option>
                        <option value="home">Home Visit</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Doctor</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date & Time</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data?.appointments.map((appt) => (
                                <tr 
                                    key={appt._id} 
                                    className="hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setSelectedAppointment(appt)}
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {appt.patientId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-slate-500">{appt.patientId?.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                Dr. {(appt.doctorId as any)?.userId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {(appt.doctorId as any)?.specialization}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="text-slate-900">
                                                    {format(new Date(appt.date), 'MMM d, yyyy')}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {appt.timeSlot.start} - {appt.timeSlot.end}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            {getTypeIcon(appt.type)}
                                            <span className="capitalize">{appt.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        ₹{appt.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPaymentStatusColor(appt.paymentStatus)}`}>
                                            {appt.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {data?.appointments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No appointments found</p>
                    </div>
                )}

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                                disabled={page === data.pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Appointment Details</h3>
                                <button 
                                    onClick={() => setSelectedAppointment(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(selectedAppointment.status)}`}>
                                        {selectedAppointment.status}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getPaymentStatusColor(selectedAppointment.paymentStatus)}`}>
                                        {selectedAppointment.paymentStatus}
                                    </span>
                                </div>

                                {/* Patient */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-sm text-slate-500 mb-1">Patient</p>
                                    <p className="font-medium text-slate-900">{selectedAppointment.patientId?.name}</p>
                                    <p className="text-sm text-slate-500">{selectedAppointment.patientId?.phone}</p>
                                </div>

                                {/* Doctor */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-sm text-slate-500 mb-1">Doctor</p>
                                    <p className="font-medium text-slate-900">
                                        Dr. {(selectedAppointment.doctorId as any)?.userId?.name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {(selectedAppointment.doctorId as any)?.specialization}
                                    </p>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Date</p>
                                        <p className="font-medium text-slate-900">
                                            {format(new Date(selectedAppointment.date), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Time</p>
                                        <p className="font-medium text-slate-900">
                                            {selectedAppointment.timeSlot.start} - {selectedAppointment.timeSlot.end}
                                        </p>
                                    </div>
                                </div>

                                {/* Type & Amount */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Type</p>
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(selectedAppointment.type)}
                                            <span className="font-medium text-slate-900 capitalize">
                                                {selectedAppointment.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Amount</p>
                                        <p className="font-medium text-slate-900 text-lg">
                                            ₹{selectedAppointment.amount}
                                        </p>
                                    </div>
                                </div>

                                {/* Symptoms */}
                                {selectedAppointment.symptoms && (
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Symptoms</p>
                                        <p className="text-slate-900">{selectedAppointment.symptoms}</p>
                                    </div>
                                )}

                                {/* Notes */}
                                {selectedAppointment.notes && (
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Notes</p>
                                        <p className="text-slate-900">{selectedAppointment.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedAppointment(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
