import { Menu, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminNotifications } from '../../contexts/AdminNotificationsContext';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { unreadCount, isRealtimeConnected } = useAdminNotifications();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Open navigation menu"
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                >
                    <Menu size={20} className="text-slate-600" />
                </button>
                <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
                    Doctor Help Admin
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Open notifications"
                    className="relative p-2 hover:bg-slate-100 rounded-lg"
                    title={isRealtimeConnected ? 'Realtime notifications connected' : 'Realtime notifications reconnecting'}
                    onClick={() => navigate('/notifications')}
                >
                    <Bell size={20} className="text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] leading-[18px] rounded-full text-center font-semibold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* User menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-primary-600" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">
                            {user?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
