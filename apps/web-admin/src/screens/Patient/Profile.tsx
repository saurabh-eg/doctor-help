
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: 'person_edit', label: 'Edit Profile', sub: 'Change name, phone...' },
    { icon: 'history', label: 'Medical History', sub: 'Your past consultations' },
    { icon: 'payments', label: 'Payment Methods', sub: 'Manage cards and UPI' },
    { icon: 'settings', label: 'Settings', sub: 'Theme, notifications...' },
    { icon: 'help', label: 'Help & Support', sub: 'FAQs and contact us' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <header className="bg-white dark:bg-surface-dark px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-sm text-center">
        <div className="relative inline-block mb-4">
          <div 
            className="size-24 rounded-full border-4 border-white shadow-xl bg-center bg-cover" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0lTR-F-fgUU1mNg76mQabPxAaec1rRReike_aw12A_UyfhMaCKfPp_QUtKLUoSzzI_X9oCUzXhdW5JvqrOp-Ig05b2oNe_5MRxkV7L3qgOa6XQCtnRCLJIHqzExig63d8eOsgneP2OY_mVxe8SrQ6Y3sorCWO2JzSOOSZ4CzKWUHdlFzFmCEZ7Q8Eu13yT2q0CPi97KjeQDijPdpAtA1x4j7OCsjU-r95zHUG_8GoMf_dOeG0-VD9KD2WjSKxjc1U1QQWU9cAdRE")' }}
          ></div>
          <button className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold">Alex Henderson</h2>
        <p className="text-slate-500 font-medium">+1 (555) 123-4567</p>
      </header>

      <main className="px-4 py-6">
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </main>

      <BottomNav role="patient" />
    </div>
  );
};

export default Profile;
