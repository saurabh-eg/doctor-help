import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Stethoscope, 
    Building2,
    Calendar, 
    FlaskConical,
    Bell,
    IndianRupee,
    BarChart3,
    Settings,
    LogOut,
    ShieldCheck,
    X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminNotifications } from '../../contexts/AdminNotificationsContext';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/labs', icon: Building2, label: 'Labs' },
    { to: '/verifications', icon: ShieldCheck, label: 'Verifications' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/lab-orders', icon: FlaskConical, label: 'Lab Orders' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/payments-demo', icon: IndianRupee, label: 'Payments Demo' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { logout } = useAuth();
    const { unreadCount } = useAdminNotifications();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar */}
            <aside className={clsx(
                'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transition-transform lg:translate-x-0 lg:static lg:z-0',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DH</span>
                        </div>
                        <span className="font-bold text-slate-900">Admin</span>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                        title="Close sidebar"
                        className="lg:hidden p-1 hover:bg-slate-100 rounded"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) => clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                                isActive 
                                    ? 'bg-primary-50 text-primary-600' 
                                    : 'text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            <item.icon size={20} />
                            {item.label}
                            {item.to === '/notifications' && unreadCount > 0 && (
                                <span className="ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
