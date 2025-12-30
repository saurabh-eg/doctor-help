import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, ShieldCheck, ShieldX, Eye, Stethoscope, Filter, X, MapPin, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Doctor, Pagination as PaginationType } from '../types';
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
    TableSkeleton
} from '../components/ui';

const STATUS_BADGES = {
    verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: ShieldCheck },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: ShieldX },
};

const ITEMS_PER_PAGE = 15;

export default function DoctorsPage() {
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['doctors', page, searchQuery, statusFilter],
        queryFn: async () => {
            const response = await adminApi.getDoctors({ 
                page, 
                limit: ITEMS_PER_PAGE, 
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            return {
                doctors: response.data.data as Doctor[],
                pagination: response.data.pagination as PaginationType,
            };
        },
        staleTime: 30000,
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

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
    const hasFilters = searchQuery || statusFilter !== 'all';

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
                    <p className="text-slate-500 mt-1">
                        All registered doctors
                        {data?.pagination && (
                            <span className="text-slate-400"> · {data.pagination.total} total</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name or specialization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={18} className="text-slate-400" />}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
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
                            <TableHeadCell>Doctor</TableHeadCell>
                            <TableHeadCell>Specialization</TableHeadCell>
                            <TableHeadCell>Experience</TableHeadCell>
                            <TableHeadCell>Rating</TableHeadCell>
                            <TableHeadCell>Fee</TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell align="right">Actions</TableHeadCell>
                        </TableHeader>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={7} rows={10} />
                        ) : !data?.doctors.length ? (
                            <TableEmpty
                                icon={<Stethoscope size={32} />}
                                title="No doctors found"
                                description={hasFilters ? "Try adjusting your search or filters" : "Doctors will appear here once they register"}
                                colSpan={7}
                            />
                        ) : (
                            data.doctors.map((doctor) => {
                                const statusKey = doctor.isVerified ? 'verified' : 'pending';
                                const StatusIcon = STATUS_BADGES[statusKey].icon;
                                
                                return (
                                    <TableRow key={doctor._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center overflow-hidden">
                                                    {doctor.photoUrl ? (
                                                        <img 
                                                            src={doctor.photoUrl} 
                                                            alt={doctor.userId?.name} 
                                                            className="w-11 h-11 object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-semibold text-primary-700">
                                                            {doctor.userId?.name?.charAt(0) || 'D'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        Dr. {doctor.userId?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{doctor.userId?.phone}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                                                {doctor.specialization || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-700 font-medium">{doctor.experience || 0}</span>
                                            <span className="text-slate-400 text-xs ml-1">years</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                                <span className="font-medium text-slate-900">{doctor.rating?.toFixed(1) || '0.0'}</span>
                                                <span className="text-slate-400 text-xs">({doctor.reviewCount || 0})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-slate-900">{formatCurrency(doctor.consultationFee || 0)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGES[statusKey].bg} ${STATUS_BADGES[statusKey].text}`}>
                                                <StatusIcon size={12} />
                                                {doctor.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <button
                                                onClick={() => setSelectedDoctor(doctor)}
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

            {/* Doctor Details Modal */}
            <Modal
                isOpen={!!selectedDoctor}
                onClose={() => setSelectedDoctor(null)}
                title="Doctor Details"
                size="lg"
            >
                {selectedDoctor && (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                {selectedDoctor.photoUrl ? (
                                    <img 
                                        src={selectedDoctor.photoUrl} 
                                        alt={selectedDoctor.userId?.name} 
                                        className="w-20 h-20 object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-primary-700">
                                        {selectedDoctor.userId?.name?.charAt(0) || 'D'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-slate-900">
                                    Dr. {selectedDoctor.userId?.name || 'Unknown'}
                                </h4>
                                <p className="text-primary-600 font-medium">{selectedDoctor.specialization}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                                        selectedDoctor.isVerified 
                                            ? 'bg-emerald-50 text-emerald-700' 
                                            : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {selectedDoctor.isVerified ? <ShieldCheck size={12} /> : <ShieldX size={12} />}
                                        {selectedDoctor.isVerified ? 'Verified' : 'Pending Verification'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-medium">{selectedDoctor.rating?.toFixed(1) || '0.0'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Experience</p>
                                <p className="text-lg font-bold text-slate-900">{selectedDoctor.experience || 0} years</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Consultation Fee</p>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedDoctor.consultationFee || 0)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Total Reviews</p>
                                <p className="text-lg font-bold text-slate-900">{selectedDoctor.reviewCount || 0}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Joined</p>
                                <p className="text-lg font-bold text-slate-900">
                                    {selectedDoctor.createdAt ? format(new Date(selectedDoctor.createdAt), 'MMM yyyy') : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h5 className="text-sm font-semibold text-slate-900">Contact Information</h5>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone size={16} className="text-slate-400" />
                                    <span className="text-slate-700">{selectedDoctor.userId?.phone || '-'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-slate-700">{selectedDoctor.userId?.email || '-'}</span>
                                </div>
                                {selectedDoctor.bio && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin size={16} className="text-slate-400 mt-0.5" />
                                        <span className="text-slate-700">{selectedDoctor.bio}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Qualification */}
                        {selectedDoctor.qualification && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-semibold text-slate-900">Qualification</h5>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                                        {selectedDoctor.qualification}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setSelectedDoctor(null)}
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
