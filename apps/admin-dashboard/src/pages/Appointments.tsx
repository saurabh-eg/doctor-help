import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Calendar, 
    Video, 
    Building2, 
    Home, 
    Filter, 
    X,
    Eye,
    User,
    Stethoscope,
    IndianRupee,
    Clock,
    CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Appointment, Pagination as PaginationType } from '../types';
import { 
    Button, 
    PageLoader,
    Modal,
    Pagination,
    StatusBadge,
    Table,
    TableHead,
    TableHeader,
    TableHeadCell,
    TableBody,
    TableRow,
    TableCell,
    TableEmpty,
    TableSkeleton
} from '../components/ui';

const TYPE_ICONS: Record<string, React.ReactNode> = {
    video: <Video size={14} className="text-blue-500" />,
    clinic: <Building2 size={14} className="text-emerald-500" />,
    home: <Home size={14} className="text-amber-500" />,
};

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
    video: { bg: 'bg-blue-50', text: 'text-blue-700' },
    clinic: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    home: { bg: 'bg-amber-50', text: 'text-amber-700' },
};

const ITEMS_PER_PAGE = 20;

export default function AppointmentsPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['appointments', page, statusFilter, typeFilter],
        queryFn: async () => {
            const response = await adminApi.getAppointments({ 
                page, 
                limit: ITEMS_PER_PAGE, 
                status: statusFilter !== 'all' ? statusFilter : undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
            });
            return {
                appointments: response.data.data as Appointment[],
                pagination: response.data.pagination as PaginationType,
            };
        },
        staleTime: 30000,
    });

    const clearFilters = () => {
        setStatusFilter('all');
        setTypeFilter('all');
        setPage(1);
    };

    const hasFilters = statusFilter !== 'all' || typeFilter !== 'all';

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                    <p className="text-slate-500 mt-1">
                        All platform appointments
                        {data?.pagination && (
                            <span className="text-slate-400"> · {data.pagination.total} total</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-500">Filters:</span>
                        </div>
                        
                        <select
                            aria-label="Filter by status"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                        </select>
                        
                        <select
                            aria-label="Filter by type"
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="video">Video Call</option>
                            <option value="clinic">In-Clinic</option>
                            <option value="home">Home Visit</option>
                        </select>
                        
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-800"
                            >
                                <X size={14} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="relative">
                {isFetching && !isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                    </div>
                )}
                
                <Table>
                    <TableHead>
                        <TableHeader>
                            <TableHeadCell>Patient</TableHeadCell>
                            <TableHeadCell>Doctor</TableHeadCell>
                            <TableHeadCell>Date & Time</TableHeadCell>
                            <TableHeadCell>Type</TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell align="right">Amount</TableHeadCell>
                            <TableHeadCell align="right">Actions</TableHeadCell>
                        </TableHeader>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={7} rows={10} />
                        ) : !data?.appointments.length ? (
                            <TableEmpty
                                icon={<Calendar size={32} />}
                                title="No appointments found"
                                description={hasFilters ? "Try adjusting your filters" : "Appointments will appear here once booked"}
                                colSpan={7}
                            />
                        ) : (
                            data.appointments.map((appointment) => {
                                const typeKey = appointment.type || 'video';
                                
                                return (
                                    <TableRow key={appointment._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {appointment.patientId?.name?.charAt(0) || 'P'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {appointment.patientId?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{appointment.patientId?.phone}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-600">
                                                        {appointment.doctorId?.userId?.name?.charAt(0) || 'D'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        Dr. {appointment.doctorId?.userId?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{appointment.doctorId?.specialization}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {appointment.timeSlot?.start} - {appointment.timeSlot?.end}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${TYPE_BADGES[typeKey]?.bg || 'bg-slate-100'} ${TYPE_BADGES[typeKey]?.text || 'text-slate-700'}`}>
                                                {TYPE_ICONS[typeKey]}
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
                                        <TableCell align="right">
                                            <button
                                                onClick={() => setSelectedAppointment(appointment)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={data.pagination.pages}
                        totalItems={data.pagination.total}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setPage}
                    />
                )}
            </div>

            {/* Appointment Details Modal */}
            <Modal
                isOpen={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                title="Appointment Details"
                size="lg"
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        {/* Status & Type */}
                        <div className="flex items-center gap-3">
                            <StatusBadge status={selectedAppointment.status} />
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${TYPE_BADGES[selectedAppointment.type]?.bg || 'bg-slate-100'} ${TYPE_BADGES[selectedAppointment.type]?.text || 'text-slate-700'}`}>
                                {TYPE_ICONS[selectedAppointment.type]}
                                {selectedAppointment.type} Consultation
                            </span>
                        </div>

                        {/* Patient & Doctor Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <User size={16} className="text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Patient</span>
                                </div>
                                <p className="font-semibold text-slate-900">{selectedAppointment.patientId?.name || 'Unknown'}</p>
                                <p className="text-sm text-slate-500">{selectedAppointment.patientId?.phone}</p>
                            </div>
                            <div className="p-4 bg-primary-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Stethoscope size={16} className="text-primary-400" />
                                    <span className="text-xs font-semibold text-primary-500 uppercase">Doctor</span>
                                </div>
                                <p className="font-semibold text-slate-900">Dr. {selectedAppointment.doctorId?.userId?.name || 'Unknown'}</p>
                                <p className="text-sm text-primary-600">{selectedAppointment.doctorId?.specialization}</p>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarDays size={16} className="text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Date</span>
                                </div>
                                <p className="font-semibold text-slate-900">
                                    {format(new Date(selectedAppointment.date), 'EEEE, MMM d, yyyy')}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={16} className="text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Time</span>
                                </div>
                                <p className="font-semibold text-slate-900">
                                    {selectedAppointment.timeSlot?.start} - {selectedAppointment.timeSlot?.end}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="p-4 bg-emerald-50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <IndianRupee size={16} className="text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">Payment</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-emerald-700">
                                        ₹{selectedAppointment.amount?.toLocaleString() || 0}
                                    </p>
                                    <span className={`text-xs font-medium ${
                                        selectedAppointment.paymentStatus === 'paid' 
                                            ? 'text-emerald-600' 
                                            : 'text-amber-600'
                                    }`}>
                                        {selectedAppointment.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedAppointment.notes && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Notes</p>
                                <p className="text-slate-700">{selectedAppointment.notes}</p>
                            </div>
                        )}

                        {/* Booking Time */}
                        <div className="text-center text-xs text-slate-400">
                            Booked on {selectedAppointment.createdAt ? format(new Date(selectedAppointment.createdAt), 'MMM d, yyyy \'at\' h:mm a') : '-'}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setSelectedAppointment(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
