
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

interface BottomNavProps {
  role: UserRole;
}

const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const location = useLocation();
  const path = location.pathname;

  const patientLinks = [
    { label: 'Home', icon: 'home', to: '/patient/home' },
    { label: 'Bookings', icon: 'calendar_month', to: '/patient/bookings' },
    { label: 'Wallet', icon: 'account_balance_wallet', to: '/patient/wallet' },
    { label: 'Records', icon: 'description', to: '/patient/records' },
    { label: 'Profile', icon: 'person', to: '/patient/profile' },
  ];

  const doctorLinks = [
    { label: 'Home', icon: 'home', to: '/doctor/home' },
    { label: 'Appointments', icon: 'calendar_today', to: '/doctor/calendar' },
    { label: 'Tools', icon: 'construction', to: '/doctor/edit-profile' },
    { label: 'Earnings', icon: 'attach_money', to: '/doctor/earnings' },
  ];

  const links = role === 'patient' ? patientLinks : doctorLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map((link) => {
          const isActive = path === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              } hover:text-primary`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                {link.icon}
              </span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
