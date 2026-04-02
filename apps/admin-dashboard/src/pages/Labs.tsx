import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, Filter, X, ShieldCheck, ShieldX, Power, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { AdminLab, LabRegistrationRequest, Pagination as PaginationType } from '../types';
import {
    Input,
    Button,
    PageLoader,
    Modal,
    Pagination,
    Table,
    TableHead,
    TableHeader,
    TableHeadCell,
    TableBody,
    TableRow,
    TableCell,
    TableEmpty,
    TableSkeleton,
} from '../components/ui';

const ITEMS_PER_PAGE = 15;

export default function LabsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedLabRequest, setSelectedLabRequest] = useState<LabRegistrationRequest | null>(null);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['labs', page, searchQuery, statusFilter],
        queryFn: async () => {
            const response = await adminApi.getLabs({
                page,
                limit: ITEMS_PER_PAGE,
                search: searchQuery || undefined,
                status: statusFilter,
            });

            return {
                labs: response.data.data as AdminLab[],
                pagination: response.data.pagination as PaginationType,
            };
        },
        staleTime: 30000,
    });

    const { data: approvedLabRequests } = useQuery({
        queryKey: ['approved-lab-registration-requests'],
        queryFn: async () => {
            const response = await adminApi.getLabRegistrationRequests({
                status: 'approved',
                page: 1,
                limit: 200,
            });
            return response.data.data as LabRegistrationRequest[];
        },
        staleTime: 60000,
    });

    const toggleLabStatus = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return adminApi.updateLabStatus(id, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labs'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(search);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch('');
        setSearchQuery('');
        setStatusFilter('all');
        setPage(1);
    };

    const hasFilters = searchQuery || statusFilter !== 'all';

    const approvedRequestByLabId = new Map(
        (approvedLabRequests || [])
            .filter((request) => request.approvedLabId)
            .map((request) => [request.approvedLabId as string, request])
    );

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Labs</h1>
                    <p className="text-slate-500 mt-1">
                        Manage registered laboratories
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
                            placeholder="Search by lab name, phone, email, city, or state..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={18} className="text-slate-400" />}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                aria-label="Filter by lab status"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">All Labs</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <Button type="submit">Search</Button>

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
                            <TableHeadCell>Lab</TableHeadCell>
                            <TableHeadCell>Location</TableHeadCell>
                            <TableHeadCell>Rating</TableHeadCell>
                            <TableHeadCell>Certification</TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell>Documents</TableHeadCell>
                            <TableHeadCell>Joined</TableHeadCell>
                            <TableHeadCell align="right">Actions</TableHeadCell>
                        </TableHeader>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={8} rows={8} />
                        ) : !data?.labs.length ? (
                            <TableEmpty
                                icon={<Building2 size={32} />}
                                title="No labs found"
                                description={hasFilters ? 'Try adjusting your search or filters' : 'Labs will appear here once registered'}
                                colSpan={8}
                            />
                        ) : (
                            data.labs.map((lab) => {
                                const approvedRequest = approvedRequestByLabId.get(lab._id);

                                return (
                                <TableRow key={lab._id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-slate-900">{lab.name}</p>
                                            <p className="text-xs text-slate-500">{lab.phone}</p>
                                            <p className="text-xs text-slate-500">{lab.email || '-'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-slate-700">{lab.address.city}, {lab.address.state}</p>
                                        <p className="text-xs text-slate-500">{lab.address.pincode}</p>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-900">{(lab.rating || 0).toFixed(1)}</span>
                                        <span className="text-slate-400 text-xs ml-1">({lab.ratingCount || 0})</span>
                                    </TableCell>
                                    <TableCell>
                                        {lab.isNablCertified ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
                                                <ShieldCheck size={12} />
                                                NABL Certified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                                <ShieldX size={12} />
                                                Not Certified
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {lab.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {approvedRequest?.verificationDocuments?.length ? (
                                            <button
                                                onClick={() => setSelectedLabRequest(approvedRequest)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <FileText size={14} />
                                                View Docs ({approvedRequest.verificationDocuments.length})
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">No docs</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-slate-600">
                                            {format(new Date(lab.createdAt), 'MMM d, yyyy')}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => toggleLabStatus.mutate({ id: lab._id, isActive: !lab.isActive })}
                                            disabled={toggleLabStatus.isPending}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                lab.isActive
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-emerald-600 hover:bg-emerald-50'
                                            }`}
                                        >
                                            <Power size={16} />
                                            {lab.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            )})
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

            <Modal
                isOpen={!!selectedLabRequest}
                onClose={() => setSelectedLabRequest(null)}
                title="Lab Documents"
                description={selectedLabRequest ? `Verification documents for ${selectedLabRequest.labName}` : undefined}
                size="lg"
            >
                {selectedLabRequest && (
                    <div className="space-y-4">
                        {selectedLabRequest.verificationDocuments?.length ? (
                            selectedLabRequest.verificationDocuments.map((doc, idx) => (
                                <a
                                    key={`${doc.documentUrl}-${idx}`}
                                    href={doc.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg">
                                            <FileText size={16} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 capitalize">
                                                {doc.documentType.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {doc.originalFileName || 'Click to view'}
                                            </p>
                                        </div>
                                    </div>
                                    <ExternalLink size={15} className="text-slate-400 group-hover:text-primary-600" />
                                </a>
                            ))
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl">
                                <p className="text-slate-500 text-sm">No documents uploaded</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100">
                            <Button variant="outline" className="w-full" onClick={() => setSelectedLabRequest(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
