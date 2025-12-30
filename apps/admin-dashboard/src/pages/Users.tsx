import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserX, UserCheck, Eye, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { User, Pagination } from '../types';
import { Input, Button, Badge, PageLoader } from '../components/ui';

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['users', page, search, roleFilter],
        queryFn: async () => {
            const response = await adminApi.getUsers({ 
                page, 
                limit: 20, 
                search: search || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
            });
            return {
                users: response.data.data as User[],
                pagination: response.data.pagination as Pagination,
            };
        },
    });

    const suspendMutation = useMutation({
        mutationFn: async ({ id, isSuspended, reason }: { id: string; isSuspended: boolean; reason?: string }) => {
            return adminApi.suspendUser(id, { isSuspended, reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowSuspendModal(false);
            setSelectedUser(null);
            setSuspendReason('');
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const handleSuspend = (user: User) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    const confirmSuspend = () => {
        if (!selectedUser) return;
        suspendMutation.mutate({
            id: selectedUser._id,
            isSuspended: !selectedUser.isSuspended,
            reason: suspendReason,
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'doctor': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load users</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                    <p className="text-slate-500 mt-1">
                        Manage all platform users
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name, phone, or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={18} />}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="admin">Admins</option>
                    </select>
                    <Button type="submit">Search</Button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Phone</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data?.users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                                <span className="text-slate-600 font-medium">
                                                    {user.name?.charAt(0) || user.phone.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {user.name || 'No Name'}
                                                </p>
                                                <p className="text-sm text-slate-500">{user.email || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{user.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isSuspended ? (
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                                Suspended
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleSuspend(user)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    user.isSuspended 
                                                        ? 'hover:bg-green-50 text-green-600' 
                                                        : 'hover:bg-red-50 text-red-600'
                                                }`}
                                                title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                                            >
                                                {user.isSuspended ? <UserCheck size={18} /> : <UserX size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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

            {/* Suspend Modal */}
            {showSuspendModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {selectedUser.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                        </h3>
                        <p className="text-slate-500 mb-4">
                            {selectedUser.isSuspended 
                                ? `Are you sure you want to unsuspend ${selectedUser.name || selectedUser.phone}?`
                                : `Are you sure you want to suspend ${selectedUser.name || selectedUser.phone}?`
                            }
                        </p>
                        
                        {!selectedUser.isSuspended && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reason (optional)
                                </label>
                                <textarea
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows={3}
                                    placeholder="Enter reason for suspension..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowSuspendModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={`flex-1 ${selectedUser.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                onClick={confirmSuspend}
                                isLoading={suspendMutation.isPending}
                            >
                                {selectedUser.isSuspended ? 'Unsuspend' : 'Suspend'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
