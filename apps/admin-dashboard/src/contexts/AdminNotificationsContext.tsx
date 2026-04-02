import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

type AdminNotificationsContextValue = {
    unreadCount: number;
    isRealtimeConnected: boolean;
};

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | undefined>(undefined);

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

type UnreadCountEventPayload = {
    unreadCount?: number;
};

function parseEventPayload<T>(event: MessageEvent<string>): T | null {
    try {
        return JSON.parse(event.data) as T;
    } catch {
        return null;
    }
}

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const { isAuthenticated, token } = useAuth();

    const [unreadCount, setUnreadCount] = useState(0);
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const loadUnreadCount = async () => {
            if (!isAuthenticated) {
                setUnreadCount(0);
                return;
            }

            try {
                const response = await api.get('/notifications/unread-count');
                if (!isCancelled) {
                    setUnreadCount(Number(response.data?.data?.unreadCount || 0));
                }
            } catch {
                if (!isCancelled) {
                    setUnreadCount(0);
                }
            }
        };

        void loadUnreadCount();

        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setIsRealtimeConnected(false);
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
            return;
        }

        const streamUrl = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
        const source = new EventSource(streamUrl);
        eventSourceRef.current = source;

        const handleConnected = () => {
            setIsRealtimeConnected(true);
        };

        const handleUnreadCount = (event: MessageEvent<string>) => {
            const payload = parseEventPayload<UnreadCountEventPayload>(event);
            if (typeof payload?.unreadCount === 'number') {
                setUnreadCount(payload.unreadCount);
            }
        };

        const handleNotificationMutation = () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notification'] });
        };

        const handleError = () => {
            setIsRealtimeConnected(false);
        };

        source.addEventListener('connected', handleConnected as EventListener);
        source.addEventListener('notification.unread_count', handleUnreadCount as EventListener);
        source.addEventListener('notification.created', handleNotificationMutation as EventListener);
        source.addEventListener('notification.read', handleNotificationMutation as EventListener);
        source.addEventListener('notification.read_all', handleNotificationMutation as EventListener);
        source.addEventListener('notification.deleted', handleNotificationMutation as EventListener);
        source.addEventListener('notification.deleted_all', handleNotificationMutation as EventListener);
        source.onerror = handleError;

        return () => {
            source.close();
            if (eventSourceRef.current === source) {
                eventSourceRef.current = null;
            }
        };
    }, [isAuthenticated, token, queryClient]);

    const value = useMemo(
        () => ({ unreadCount, isRealtimeConnected }),
        [unreadCount, isRealtimeConnected]
    );

    return (
        <AdminNotificationsContext.Provider value={value}>
            {children}
        </AdminNotificationsContext.Provider>
    );
}

export function useAdminNotifications() {
    const context = useContext(AdminNotificationsContext);
    if (context === undefined) {
        throw new Error('useAdminNotifications must be used within AdminNotificationsProvider');
    }
    return context;
}
