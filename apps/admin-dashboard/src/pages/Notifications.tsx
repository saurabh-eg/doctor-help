import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Filter, RefreshCw, Save, Settings2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { adminApi } from '../api/client';
import { AdminNotification, NotificationPreferences, Pagination as PaginationType } from '../types';
import { useAdminNotifications } from '../contexts/AdminNotificationsContext';
import { Button, PageLoader, Pagination } from '../components/ui';

const ITEMS_PER_PAGE = 20;

type NotificationFilter = 'all' | 'unread' | 'read';

const DEFAULT_PREFERENCES: NotificationPreferences = {
    categories: {
        appointments: true,
        labOrders: true,
        payments: true,
        system: true,
    },
    quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
        timezone: 'Asia/Kolkata',
    },
    mutedTypes: [],
};

const ALL_NOTIFICATION_TYPES = [
    'appointment_booked',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_completed',
    'lab_order_created',
    'lab_order_confirmed',
    'lab_order_sample_collected',
    'lab_order_processing',
    'lab_order_report_ready',
    'lab_order_completed',
    'lab_order_cancelled',
    'payment_processed',
    'payment_failed',
    'system_message',
];

const toLabel = (value: string) =>
    value
        .split('_')
        .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
        .join(' ');

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const { unreadCount, isRealtimeConnected } = useAdminNotifications();

    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const [prefsDraft, setPrefsDraft] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

    const { data: prefsData, isFetching: isPrefsFetching } = useQuery({
        queryKey: ['admin-notification-preferences'],
        queryFn: async () => {
            const response = await adminApi.getNotificationPreferences();
            const preferences = (response.data.data || DEFAULT_PREFERENCES) as NotificationPreferences;
            setPrefsDraft(preferences);
            return preferences;
        },
        staleTime: 60000,
    });

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-notifications', page, filter],
        queryFn: async () => {
            const response = await adminApi.getNotifications({
                page,
                limit: ITEMS_PER_PAGE,
                isRead:
                    filter === 'all'
                        ? undefined
                        : filter === 'read',
            });

            return {
                notifications: (response.data.data || []) as AdminNotification[],
                pagination: response.data.pagination as PaginationType,
            };
        },
        staleTime: 30000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => adminApi.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => adminApi.markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    const deleteOneMutation = useMutation({
        mutationFn: async (id: string) => adminApi.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    const deleteAllMutation = useMutation({
        mutationFn: async () => adminApi.deleteAllNotifications(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    const savePrefsMutation = useMutation({
        mutationFn: async (payload: NotificationPreferences) =>
            adminApi.updateNotificationPreferences({
                categories: payload.categories,
                quietHours: payload.quietHours,
                mutedTypes: payload.mutedTypes,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notification-preferences'] });
        },
    });

    if (isLoading) return <PageLoader />;

    const notifications = data?.notifications || [];
    const hasLoadedPrefs = !!prefsData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="mt-1 text-slate-500">
                        Live notifications center
                        <span className="text-slate-400"> · {unreadCount} unread</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            isRealtimeConnected
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                        ></span>
                        {isRealtimeConnected ? 'Live connected' : 'Reconnecting'}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void refetch()}
                        isLoading={isFetching}
                    >
                        <RefreshCw size={14} className="mr-1" />
                        Refresh
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => markAllAsReadMutation.mutate()}
                        isLoading={markAllAsReadMutation.isPending}
                        disabled={unreadCount <= 0}
                    >
                        <CheckCheck size={14} className="mr-1" />
                        Mark all read
                    </Button>

                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteAllMutation.mutate()}
                        isLoading={deleteAllMutation.isPending}
                        disabled={!notifications.length}
                    >
                        <Trash2 size={14} className="mr-1" />
                        Delete all
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                    <Settings2 size={16} className="text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-900">Notification Preferences</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Categories
                        </p>
                        <div className="space-y-2">
                            {[
                                { key: 'appointments', label: 'Appointments' },
                                { key: 'labOrders', label: 'Lab Orders' },
                                { key: 'payments', label: 'Payments' },
                                { key: 'system', label: 'System' },
                            ].map((item) => (
                                <label key={item.key} className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-700">{item.label}</span>
                                    <input
                                        type="checkbox"
                                        checked={
                                            prefsDraft.categories[
                                                item.key as keyof NotificationPreferences['categories']
                                            ]
                                        }
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setPrefsDraft((prev) => ({
                                                ...prev,
                                                categories: {
                                                    ...prev.categories,
                                                    [item.key]: checked,
                                                },
                                            }));
                                        }}
                                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Quiet Hours
                        </p>

                        <label className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-700">Enable quiet hours</span>
                            <input
                                type="checkbox"
                                checked={prefsDraft.quietHours.enabled}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setPrefsDraft((prev) => ({
                                        ...prev,
                                        quietHours: {
                                            ...prev.quietHours,
                                            enabled: checked,
                                        },
                                    }));
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-xs text-slate-500">Start</span>
                                <input
                                    type="time"
                                    value={prefsDraft.quietHours.start}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPrefsDraft((prev) => ({
                                            ...prev,
                                            quietHours: {
                                                ...prev.quietHours,
                                                start: value,
                                            },
                                        }));
                                    }}
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                                />
                            </label>

                            <label className="space-y-1">
                                <span className="text-xs text-slate-500">End</span>
                                <input
                                    type="time"
                                    value={prefsDraft.quietHours.end}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPrefsDraft((prev) => ({
                                            ...prev,
                                            quietHours: {
                                                ...prev.quietHours,
                                                end: value,
                                            },
                                        }));
                                    }}
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                                />
                            </label>
                        </div>

                        <label className="mt-3 block space-y-1">
                            <span className="text-xs text-slate-500">Timezone</span>
                            <input
                                type="text"
                                value={prefsDraft.quietHours.timezone}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPrefsDraft((prev) => ({
                                        ...prev,
                                        quietHours: {
                                            ...prev.quietHours,
                                            timezone: value,
                                        },
                                    }));
                                }}
                                placeholder="Asia/Kolkata"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                            />
                        </label>
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Muted Notification Types
                    </p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {ALL_NOTIFICATION_TYPES.map((type) => {
                            const checked = prefsDraft.mutedTypes.includes(type);
                            return (
                                <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...prefsDraft.mutedTypes, type]
                                                : prefsDraft.mutedTypes.filter((t) => t !== type);
                                            setPrefsDraft((prev) => ({
                                                ...prev,
                                                mutedTypes: Array.from(new Set(next)),
                                            }));
                                        }}
                                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    {toLabel(type)}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            if (hasLoadedPrefs) {
                                setPrefsDraft(prefsData as NotificationPreferences);
                            }
                        }}
                        disabled={!hasLoadedPrefs || isPrefsFetching}
                    >
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => savePrefsMutation.mutate(prefsDraft)}
                        isLoading={savePrefsMutation.isPending}
                    >
                        <Save size={14} className="mr-1" />
                        Save Preferences
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        aria-label="Filter notifications"
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value as NotificationFilter);
                            setPage(1);
                        }}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>
            </div>

            <div className="relative rounded-2xl border border-slate-100 bg-white">
                {isFetching && !isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    </div>
                )}

                {!notifications.length ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                        <Bell size={36} className="text-slate-300" />
                        <p className="mt-3 font-medium text-slate-700">No notifications found</p>
                        <p className="text-sm text-slate-500">
                            New events will appear here in real time.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 sm:p-5 ${
                                    notification.isRead ? 'bg-white' : 'bg-blue-50/40'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                {notification.title}
                                            </h3>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                                {notification.type}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-700">{notification.message}</p>

                                        <p className="mt-2 text-xs text-slate-500">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {!notification.isRead && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => markAsReadMutation.mutate(notification._id)}
                                                isLoading={
                                                    markAsReadMutation.isPending &&
                                                    markAsReadMutation.variables === notification._id
                                                }
                                            >
                                                Mark read
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => deleteOneMutation.mutate(notification._id)}
                                            isLoading={
                                                deleteOneMutation.isPending &&
                                                deleteOneMutation.variables === notification._id
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
    );
}
