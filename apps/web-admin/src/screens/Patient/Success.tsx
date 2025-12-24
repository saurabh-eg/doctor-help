
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark flex flex-col p-8 text-center items-center justify-center">
      <div className="size-40 relative mb-8">
         <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-950/30 rounded-full animate-ping"></div>
         <div className="relative size-full bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <span className="material-symbols-outlined text-white text-7xl filled">check_circle</span>
         </div>
      </div>

      <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">Confirmed!</h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
        Your appointment with <span className="text-slate-900 dark:text-white font-bold">Dr. Sarah Johnson</span> is confirmed for Tomorrow at 10:30 AM.
      </p>

      <div className="w-full space-y-4">
        <button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold h-16 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
           <span className="material-symbols-outlined">calendar_add_on</span>
           <span>Add to Google Calendar</span>
        </button>
        
        <button 
          onClick={() => navigate('/patient/bookings')}
          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold h-16 rounded-2xl active:scale-95 transition-all"
        >
           View Bookings
        </button>

        <button 
          onClick={() => navigate('/patient/home')}
          className="w-full text-primary font-bold py-4 hover:underline"
        >
           Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Success;
