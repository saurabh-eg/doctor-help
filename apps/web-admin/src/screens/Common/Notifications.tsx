
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const notifications = [
    { id: 1, type: 'alert', title: 'Upcoming Call', body: 'Your session with Dr. Sarah begins in 15 mins.', time: '12m ago', icon: 'schedule', color: 'blue' },
    { id: 2, type: 'tip', title: 'Health Tip', body: 'Drinking 8 glasses of water today? Keep it up!', time: '2h ago', icon: 'water_drop', color: 'emerald' },
    { id: 3, type: 'status', title: 'Lab Ready', body: 'Your CBC report is now available in Records.', time: '5h ago', icon: 'description', color: 'indigo' },
    { id: 4, type: 'promo', title: 'Special Discount', body: 'Get 20% off on Dental checkups this week.', time: 'Yesterday', icon: 'local_offer', color: 'amber' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <header className="sticky top-0 z-30 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl p-5 justify-between border-b border-slate-100 dark:border-slate-800 pt-12">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-display font-bold">Notifications</h2>
        <button className="text-xs font-bold text-primary">Mark all read</button>
      </header>

      <main className="p-5 space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-white dark:bg-surface-dark p-4 rounded-[24px] shadow-soft border border-slate-50 dark:border-slate-800 flex items-start gap-4">
            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
              notif.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              notif.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              notif.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
              'bg-amber-50 text-amber-600'
            }`}>
              <span className="material-symbols-outlined">{notif.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{notif.body}</p>
            </div>
          </div>
        ))}

        <div className="pt-10 flex flex-col items-center justify-center opacity-20">
          <span className="material-symbols-outlined text-6xl">notifications_off</span>
          <p className="mt-2 font-bold uppercase text-xs tracking-[0.2em]">No more updates</p>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
