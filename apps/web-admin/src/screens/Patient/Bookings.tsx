
import React, { useState } from 'react';
import BottomNav from '../../components/BottomNav';
import { APPOINTMENTS } from '../../constants';

const Bookings: React.FC = () => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="bg-white dark:bg-surface-dark px-4 pt-12 pb-4 shadow-sm sticky top-0 z-30">
        <h2 className="text-xl font-bold text-center mb-4">My Bookings</h2>
        <div className="flex h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setTab('upcoming')}
            className={`flex-1 rounded-md text-sm font-bold transition-all ${tab === 'upcoming' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary dark:text-white' : 'text-slate-400'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setTab('past')}
            className={`flex-1 rounded-md text-sm font-bold transition-all ${tab === 'past' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary dark:text-white' : 'text-slate-400'}`}
          >
            Past
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {APPOINTMENTS.map((app) => (
          <div key={app.id} className="relative bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-16 rounded-full border-2 border-slate-100 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src={app.avatar} alt="Doc" />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between mb-1">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span>
                 </div>
                 <h3 className="font-bold">{app.doctorName}</h3>
                 <p className="text-xs text-slate-500 mb-2">{app.specialty}</p>
                 <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-[16px]">calendar_today</span> {app.date}, {app.time}
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-[16px]">videocam</span> Video
                    </div>
                 </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-3">
               <button className="flex-1 bg-primary/10 text-primary font-bold text-sm py-2 rounded-lg">Manage Booking</button>
            </div>
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full"></div>
          </div>
        ))}

        {tab === 'past' && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
             <span className="material-symbols-outlined text-6xl mb-2">history</span>
             <p className="font-medium">No past records yet</p>
          </div>
        )}
      </main>

      <BottomNav role="patient" />
    </div>
  );
};

export default Bookings;
