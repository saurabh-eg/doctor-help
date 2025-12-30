import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Doctor, Pagination } from '../types';
import { Input, Button, PageLoader } from '../components/ui';

export default function DoctorsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['doctors', page, search, statusFilter],
        queryFn: async () => {
            const response = await adminApi.getDoctors({ 
                page, 
                limit: 20, 
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            return {
                doctors: response.data.data as Doctor[],
                pagination: response.data.pagination as Pagination,
            };
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString()}`;
    };

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load doctors</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
                    <p className="text-slate-500 mt-1">
                        All registered doctors on the platform
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name or specialization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={18} />}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                    </select>
                    <Button type="submit">Search</Button>
                </form>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.doctors.map((doctor) => (
                    <div 
                        key={doctor._id} 
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    {doctor.photoUrl ? (
                                        <img 
                                            src={doctor.photoUrl} 
                                            alt={doctor.userId?.name} 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-primary-600 font-bold">
                                            {doctor.userId?.name?.charAt(0) || 'D'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        Dr. {doctor.userId?.name || 'Unknown'}
                                    </h3>
                                    <p className="text-sm text-slate-500">{doctor.specialization}</p>
                                </div>
                            </div>
                            {doctor.isVerified ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-amber-500" />
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                            <div className="bg-slate-50 rounded-lg py-2">
                                <p className="text-lg font-bold text-slate-900">{doctor.experience}</p>
                                <p className="text-xs text-slate-500">Years Exp</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg py-2">
                                <div className="flex items-center justify-center gap-1">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="font-bold text-slate-900">{doctor.rating.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-slate-500">{doctor.reviewCount} reviews</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg py-2">
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(doctor.consultationFee)}</p>
                                <p className="text-xs text-slate-500">Fee</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                                {doctor.qualification}
                            </div>
                            <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-primary-600"
                            >
                                <Eye size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {data?.doctors.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500">No doctors found</p>
                </div>
            )}

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Page {page} of {data.pagination.pages}
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

            {/* Doctor Detail Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Doctor Details</h3>
                                <button 
                                    onClick={() => setSelectedDoctor(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <XCircle size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                    {selectedDoctor.photoUrl ? (
                                        <img 
                                            src={selectedDoctor.photoUrl} 
                                            alt={selectedDoctor.userId?.name} 
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-primary-600 font-bold text-xl">
                                            {selectedDoctor.userId?.name?.charAt(0) || 'D'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">
                                        Dr. {selectedDoctor.userId?.name}
                                    </h4>
                                    <p className="text-slate-500">{selectedDoctor.specialization}</p>
                                    <p className="text-sm text-slate-400">{selectedDoctor.qualification}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Phone</p>
                                        <p className="font-medium text-slate-900">{selectedDoctor.userId?.phone}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Email</p>
                                        <p className="font-medium text-slate-900">{selectedDoctor.userId?.email || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Experience</p>
                                        <p className="font-medium text-slate-900">{selectedDoctor.experience} years</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Consultation Fee</p>
                                        <p className="font-medium text-slate-900">{formatCurrency(selectedDoctor.consultationFee)}</p>
                                    </div>
                                </div>

                                {selectedDoctor.bio && (
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-1">Bio</p>
                                        <p className="text-slate-900">{selectedDoctor.bio}</p>
                                    </div>
                                )}

                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-sm text-slate-500 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {selectedDoctor.isVerified ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                <span className="text-green-700 font-medium">Verified</span>
                                                {selectedDoctor.verifiedAt && (
                                                    <span className="text-slate-500 text-sm">
                                                        on {format(new Date(selectedDoctor.verifiedAt), 'MMM d, yyyy')}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-amber-500" />
                                                <span className="text-amber-700 font-medium">Pending Verification</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {selectedDoctor.documents && selectedDoctor.documents.length > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-2">Documents ({selectedDoctor.documents.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDoctor.documents.map((doc, i) => (
                                                <a
                                                    key={i}
                                                    href={doc}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-primary-600 hover:bg-primary-50"
                                                >
                                                    Document {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedDoctor(null)}
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
