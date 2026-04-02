import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Beaker, Eye, Filter, Home, Search, Truck, X } from 'lucide-react';
import { adminApi } from '../api/client';
import { LabOrder, Pagination as PaginationType } from '../types';
import {
    Button,
    Input,
    Modal,
    PageLoader,
    Pagination,
    StatusBadge,
    Table,
    TableBody,
    TableCell,
    TableEmpty,
    TableHead,
    TableHeadCell,
    TableHeader,
    TableRow,
    TableSkeleton,
} from '../components/ui';

interface LabFilterOption {
    _id: string;
    name: string;
}

const ITEMS_PER_PAGE = 20;

const LAB_STATUSES: string[] = [
    'all',
    'created',
    'payment_pending',
    'confirmed',
    'collector_assigned',
    'collector_on_the_way',
    'sample_collected',
    'processing',
    'report_ready',
    'completed',
    'cancelled',
];

const LAB_ORDER_TRANSITIONS: Record<string, string[]> = {
    created: ['payment_pending', 'confirmed', 'cancelled'],
    payment_pending: ['confirmed', 'cancelled'],
    confirmed: ['collector_assigned', 'cancelled'],
    collector_assigned: ['collector_on_the_way', 'cancelled'],
    collector_on_the_way: ['sample_collected', 'cancelled'],
    sample_collected: ['processing', 'cancelled'],
    processing: ['report_ready', 'cancelled'],
    report_ready: ['completed'],
    completed: [],
    cancelled: [],
};

function getStatusLabel(status: string) {
    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function LabOrdersPage() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [labFilter, setLabFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [nextStatus, setNextStatus] = useState('');
    const [collectorName, setCollectorName] = useState('');
    const [collectorPhone, setCollectorPhone] = useState('');
    const [collectorEta, setCollectorEta] = useState('');
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [overrideReason, setOverrideReason] = useState('');

    const isInvalidDateRange = !!dateFrom && !!dateTo && dateFrom > dateTo;
    const effectiveDateFrom = isInvalidDateRange ? undefined : (dateFrom || undefined);
    const effectiveDateTo = isInvalidDateRange ? undefined : (dateTo || undefined);

    const { data: labOptionsData, isLoading: isLabsLoading } = useQuery({
        queryKey: ['labs-filter-options'],
        queryFn: async () => {
            const response = await adminApi.getLabs({ page: 1, limit: 200 });
            return (response.data.data as LabFilterOption[]) || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['lab-orders', page, statusFilter, labFilter, dateFrom, dateTo, searchQuery],
        queryFn: async () => {
            const response = await adminApi.getLabOrders({
                page,
                limit: ITEMS_PER_PAGE,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                labId: labFilter !== 'all' ? labFilter : undefined,
                dateFrom: effectiveDateFrom,
                dateTo: effectiveDateTo,
                search: searchQuery || undefined,
            });

            return {
                orders: response.data.data as LabOrder[],
                pagination: response.data.pagination as PaginationType,
            };
        },
        staleTime: 30000,
    });

    const {
        data: selectedOrder,
        isLoading: isDetailLoading,
        isFetching: isDetailFetching,
    } = useQuery({
        queryKey: ['lab-order', selectedOrderId],
        queryFn: async () => {
            const response = await adminApi.getLabOrderDetails(selectedOrderId as string);
            return response.data.data as LabOrder;
        },
        enabled: !!selectedOrderId,
        staleTime: 15000,
    });

    useEffect(() => {
        if (selectedOrder) {
            const options = LAB_ORDER_TRANSITIONS[selectedOrder.status] || [];
            setNextStatus(options[0] || '');
            setCollectorName(selectedOrder.collector?.name || '');
            setCollectorPhone(selectedOrder.collector?.phone || '');
            setCollectorEta(selectedOrder.collector?.eta ? String(selectedOrder.collector.eta).slice(0, 16) : '');
            setReportFile(null);
            setOverrideReason('');
        }
    }, [selectedOrder]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, overrideReason }: { id: string; status: string; overrideReason: string }) => {
            return adminApi.updateLabOrderStatus(id, { status, overrideReason });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
            queryClient.invalidateQueries({ queryKey: ['lab-order', variables.id] });
        },
    });

    const assignCollectorMutation = useMutation({
        mutationFn: async ({ id, collectorName, collectorPhone, collectorEta, overrideReason }: { id: string; collectorName: string; collectorPhone: string; collectorEta?: string; overrideReason: string }) => {
            return adminApi.assignLabCollector(id, { collectorName, collectorPhone, collectorEta, overrideReason });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
            queryClient.invalidateQueries({ queryKey: ['lab-order', variables.id] });
        },
    });

    const uploadReportMutation = useMutation({
        mutationFn: async ({ id, file, overrideReason }: { id: string; file: File; overrideReason: string }) => {
            return adminApi.uploadLabReport(id, file, overrideReason);
        },
        onSuccess: (_, variables) => {
            setReportFile(null);
            queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
            queryClient.invalidateQueries({ queryKey: ['lab-order', variables.id] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInvalidDateRange) return;
        setSearchQuery(search.trim());
        setPage(1);
    };

    const clearFilters = () => {
        setSearch('');
        setSearchQuery('');
        setStatusFilter('all');
        setLabFilter('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const closeModal = () => {
        setSelectedOrderId(null);
        setNextStatus('');
        setCollectorName('');
        setCollectorPhone('');
        setCollectorEta('');
        setReportFile(null);
    };

    const statusOptions = useMemo(() => {
        if (!selectedOrder) return [] as string[];
        return LAB_ORDER_TRANSITIONS[selectedOrder.status] || [];
    }, [selectedOrder]);

    const hasFilters =
        statusFilter !== 'all' ||
        labFilter !== 'all' ||
        !!dateFrom ||
        !!dateTo ||
        !!searchQuery;

    const isEscalated = !!(selectedOrder as any)?.adminOverride?.isEscalated;
    const escalationReason = (selectedOrder as any)?.adminOverride?.escalationReason as string | undefined;
    const hasOverrideReason = overrideReason.trim().length >= 5;

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lab Orders</h1>
                    <p className="text-slate-500 mt-1">
                        Manage diagnostic bookings
                        {data?.pagination && (
                            <span className="text-slate-400"> · {data.pagination.total} total</span>
                        )}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by patient name or address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={18} className="text-slate-400" />}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                aria-label="Filter by status"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {LAB_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'all' ? 'All Statuses' : getStatusLabel(status)}
                                    </option>
                                ))}
                            </select>

                            <select
                                aria-label="Filter by lab"
                                value={labFilter}
                                onChange={(e) => {
                                    setLabFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">All Labs</option>
                                {(labOptionsData || []).map((lab) => (
                                    <option key={lab._id} value={lab._id}>
                                        {lab.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                aria-label="Filter from date"
                                value={dateFrom}
                                max={dateTo || undefined}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setPage(1);
                                }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />

                            <input
                                type="date"
                                aria-label="Filter to date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setPage(1);
                                }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <Button type="submit" disabled={isInvalidDateRange}>Search</Button>

                        {isLabsLoading && (
                            <span className="text-xs text-slate-500">Loading labs...</span>
                        )}

                        {isInvalidDateRange && (
                            <span className="text-xs text-red-600">From date cannot be after To date.</span>
                        )}

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-800"
                            >
                                <X size={14} />
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

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
                            <TableHeadCell>Lab</TableHeadCell>
                            <TableHeadCell>Collection</TableHeadCell>
                            <TableHeadCell>Slot</TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell align="right">Amount</TableHeadCell>
                            <TableHeadCell align="right">Actions</TableHeadCell>
                        </TableHeader>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={7} rows={10} />
                        ) : !data?.orders.length ? (
                            <TableEmpty
                                icon={<Beaker size={32} />}
                                title="No lab orders found"
                                description={hasFilters ? 'Try adjusting your filters' : 'Lab bookings will appear here'}
                                colSpan={7}
                            />
                        ) : (
                            data.orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{order.patientProfile?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500 capitalize">
                                                {order.patientProfile?.gender || 'other'} · {order.patientProfile?.age || '-'} yrs
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{order.labId?.name || 'Unknown Lab'}</p>
                                            <p className="text-xs text-slate-500">{order.labId?.phone || '-'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${order.homeCollection ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {order.homeCollection ? <Truck size={14} /> : <Home size={14} />}
                                            {order.homeCollection ? 'Home' : 'Lab Visit'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {format(new Date(order.slotDate), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs text-slate-500">{order.slotTime}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="font-semibold text-slate-900">₹{order.amount?.toLocaleString() || 0}</span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => setSelectedOrderId(order._id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

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

            <Modal isOpen={!!selectedOrderId} onClose={closeModal} title="Lab Order Details" size="xl">
                {isDetailLoading || !selectedOrder ? (
                    <div className="py-8 text-center text-slate-500">Loading order details...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <StatusBadge status={selectedOrder.status} />
                                <span className="text-xs text-slate-500">Order ID: {selectedOrder._id}</span>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${isEscalated ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                            <p className={`text-xs font-semibold uppercase mb-1 ${isEscalated ? 'text-amber-700' : 'text-slate-600'}`}>
                                Admin Override Access
                            </p>
                            {isEscalated ? (
                                <p className="text-sm text-amber-900">
                                    This order is escalated by lab support. Admin override is allowed.
                                    {escalationReason ? ` Escalation reason: ${escalationReason}` : ''}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-600">
                                    Override actions are blocked until this order is escalated by lab support.
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Override Reason (Required)</p>
                            <textarea
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                placeholder="Explain why admin override is needed (min 5 chars)"
                                rows={3}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-xs text-slate-500">This reason is saved to audit logs.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Patient</p>
                                <p className="font-semibold text-slate-900">{selectedOrder.patientProfile.name}</p>
                                <p className="text-sm text-slate-600 capitalize">
                                    {selectedOrder.patientProfile.gender} · {selectedOrder.patientProfile.age} years
                                </p>
                                {selectedOrder.patientProfile.relationship && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Relationship: {selectedOrder.patientProfile.relationship}
                                    </p>
                                )}
                            </div>

                            <div className="p-4 bg-primary-50 rounded-xl">
                                <p className="text-xs font-semibold text-primary-500 uppercase mb-2">Lab</p>
                                <p className="font-semibold text-slate-900">{selectedOrder.labId?.name || 'Unknown'}</p>
                                <p className="text-sm text-primary-700">{selectedOrder.labId?.phone || '-'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Collector Assignment</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={collectorName}
                                    onChange={(e) => setCollectorName(e.target.value)}
                                    placeholder="Collector name"
                                    className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="text"
                                    value={collectorPhone}
                                    onChange={(e) => setCollectorPhone(e.target.value)}
                                    placeholder="Collector phone"
                                    className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="datetime-local"
                                    aria-label="Collector ETA"
                                    title="Collector ETA"
                                    value={collectorEta}
                                    onChange={(e) => setCollectorEta(e.target.value)}
                                    className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    isLoading={assignCollectorMutation.isPending}
                                    disabled={!selectedOrderId || !collectorName.trim() || !collectorPhone.trim() || !isEscalated || !hasOverrideReason}
                                    onClick={() => {
                                        if (!selectedOrderId) return;
                                        assignCollectorMutation.mutate({
                                            id: selectedOrderId,
                                            collectorName: collectorName.trim(),
                                            collectorPhone: collectorPhone.trim(),
                                            collectorEta: collectorEta || undefined,
                                            overrideReason: overrideReason.trim(),
                                        });
                                    }}
                                >
                                    Assign Collector
                                </Button>
                                {selectedOrder.collector?.assignedAt && (
                                    <span className="text-xs text-slate-500">
                                        Assigned at {format(new Date(selectedOrder.collector.assignedAt), 'MMM d, yyyy p')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Lab Report</p>
                            {selectedOrder.reportUrl ? (
                                <a
                                    href={selectedOrder.reportUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    View Uploaded Report
                                </a>
                            ) : (
                                <p className="text-sm text-slate-500">No report uploaded yet.</p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    aria-label="Upload lab report PDF"
                                    title="Upload lab report PDF"
                                    onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                                />
                                <Button
                                    isLoading={uploadReportMutation.isPending}
                                    disabled={!selectedOrderId || !reportFile || selectedOrder.status !== 'processing' || !isEscalated || !hasOverrideReason}
                                    onClick={() => {
                                        if (!selectedOrderId || !reportFile) return;
                                        uploadReportMutation.mutate({ id: selectedOrderId, file: reportFile, overrideReason: overrideReason.trim() });
                                    }}
                                >
                                    Upload Report
                                </Button>
                            </div>

                            {selectedOrder.status !== 'processing' && (
                                <p className="text-xs text-amber-700">Report upload is enabled only when status is Processing.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Slot</p>
                                <p className="font-semibold text-slate-900">
                                    {format(new Date(selectedOrder.slotDate), 'EEEE, MMM d, yyyy')}
                                </p>
                                <p className="text-sm text-slate-600">{selectedOrder.slotTime}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Collection Address</p>
                                <p className="text-sm text-slate-700">{selectedOrder.address}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Items</p>
                            <div className="space-y-2">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={`${item.itemId}-${idx}`} className="flex items-center justify-between gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-slate-900">{item.name}</span>
                                            <span className="text-xs text-slate-500 ml-2 capitalize">({item.itemType})</span>
                                        </div>
                                        <span className="font-semibold text-slate-900">₹{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-sm text-slate-600">Total Amount</span>
                                <span className="font-bold text-slate-900">₹{selectedOrder.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {!!selectedOrder.preparationInstructions?.length && (
                            <div className="p-4 bg-amber-50 rounded-xl">
                                <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Preparation Instructions</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                                    {selectedOrder.preparationInstructions.map((instruction, idx) => (
                                        <li key={`${instruction}-${idx}`}>{instruction}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selectedOrder.prescriptionUrl && (
                            <div>
                                <a
                                    href={selectedOrder.prescriptionUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    View Uploaded Prescription
                                </a>
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-100">
                            {statusOptions.length > 0 ? (
                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <select
                                        aria-label="Next lab order status"
                                        value={nextStatus}
                                        onChange={(e) => setNextStatus(e.target.value)}
                                        className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {getStatusLabel(status)}
                                            </option>
                                        ))}
                                    </select>

                                    <Button
                                        isLoading={updateStatusMutation.isPending || isDetailFetching}
                                        disabled={!nextStatus || !isEscalated || !hasOverrideReason}
                                        onClick={() => {
                                            if (!selectedOrderId || !nextStatus) return;
                                            updateStatusMutation.mutate({ id: selectedOrderId, status: nextStatus, overrideReason: overrideReason.trim() });
                                        }}
                                    >
                                        Update Status
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No further status transitions available.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
