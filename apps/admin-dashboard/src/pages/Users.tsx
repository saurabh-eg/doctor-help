import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserX, UserCheck, Users, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { User, Pagination as PaginationType } from '../types';
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

const ROLE_BADGES: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
    doctor: { bg: 'bg-blue-100', text: 'text-blue-700' },
    patient: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

const ITEMS_PER_PAGE = 15;

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['users', page, searchQuery, roleFilter],
        queryFn: async () => {
            const response = await adminApi.getUsers({ 
                page, 
                limit: ITEMS_PER_PAGE, 
                search: searchQuery || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
            });
            return {
                users: response.data.data as User[],
                pagination: response.data.pagination as PaginationType,
            };
        },
        staleTime: 30000,
    });

    const suspendMutation = useMutation({
        mutationFn: async ({ id, isSuspended, reason }: { id: string; isSuspended: boolean; reason?: string }) => {
            return adminApi.suspendUser(id, { isSuspended, reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeModal();
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
        setRoleFilter('all');
        setPage(1);
    };

    const handleSuspend = (user: User) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    const closeModal = () => {
        setShowSuspendModal(false);
        setSelectedUser(null);
        setSuspendReason('');
    };

    const confirmSuspend = () => {
        if (!selectedUser) return;
        suspendMutation.mutate({
            id: selectedUser._id,
            isSuspended: !selectedUser.isSuspended,
            reason: suspendReason,
        });
    };

    const hasFilters = searchQuery || roleFilter !== 'all';

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                    <p className="text-slate-500 mt-1">
                        Manage all platform users
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
                            placeholder="Search by name, phone, or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={18} className="text-slate-400" />}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                aria-label="Filter by role"
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="patient">Patients</option>
                                <option value="doctor">Doctors</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                        
                        <Button type="submit">
                            Search
                        </Button>
                        
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
                            <TableHeadCell>User</TableHeadCell>
                            <TableHeadCell>Phone</TableHeadCell>
                            <TableHeadCell>Role</TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell>Joined</TableHeadCell>
                            <TableHeadCell align="right">Actions</TableHeadCell>
                        </TableHeader>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={6} rows={10} />
                        ) : !data?.users.length ? (
                            <TableEmpty
                                icon={<Users size={32} />}
                                title="No users found"
                                description={hasFilters ? "Try adjusting your search or filters" : "Users will appear here once they sign up"}
                                colSpan={6}
                            />
                        ) : (
                            data.users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {user.name?.charAt(0).toUpperCase() || user.phone.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {user.name || 'No Name'}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.email || '-'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-slate-700">{user.phone}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${ROLE_BADGES[user.role]?.bg || 'bg-slate-100'} ${ROLE_BADGES[user.role]?.text || 'text-slate-700'}`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {user.isSuspended ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Suspended
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-slate-600">
                                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => handleSuspend(user)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                user.isSuspended 
                                                    ? 'text-emerald-600 hover:bg-emerald-50' 
                                                    : 'text-red-600 hover:bg-red-50'
                                            }`}
                                        >
                                            {user.isSuspended ? (
                                                <>
                                                    <UserCheck size={16} />
                                                    Activate
                                                </>
                                            ) : (
                                                <>
                                                    <UserX size={16} />
                                                    Suspend
                                                </>
                                            )}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
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

            {/* Suspend Modal */}
            <Modal
                isOpen={showSuspendModal}
                onClose={closeModal}
                title={selectedUser?.isSuspended ? 'Activate User' : 'Suspend User'}
                description={
                    selectedUser?.isSuspended 
                        ? `Are you sure you want to activate ${selectedUser?.name || selectedUser?.phone}?`
                        : `This will prevent ${selectedUser?.name || selectedUser?.phone} from accessing the platform.`
                }
            >
                {!selectedUser?.isSuspended && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reason for suspension
                        </label>
                        <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Enter reason (optional)..."
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`flex-1 ${selectedUser?.isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                        onClick={confirmSuspend}
                        isLoading={suspendMutation.isPending}
                    >
                        {selectedUser?.isSuspended ? 'Activate User' : 'Suspend User'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
