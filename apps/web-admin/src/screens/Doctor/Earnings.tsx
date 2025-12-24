
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const DoctorEarnings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl z-30 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Earnings</h1>
      </header>

      <main className="p-6 space-y-8">
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 size-32 bg-primary/20 blur-3xl"></div>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Net Revenue (Oct)</p>
           <h2 className="text-5xl font-display font-bold mb-8">$4,280.00</h2>
           
           <div className="flex gap-4">
              <button className="flex-1 bg-white text-slate-900 font-bold py-4 rounded-2xl text-xs active:scale-95 transition-all">Withdraw</button>
              <button className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl text-xs active:scale-95 transition-all">Details</button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Consultations</p>
              <p className="text-xl font-display font-bold">142</p>
           </div>
           <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Avg / Visit</p>
              <p className="text-xl font-display font-bold">$30.15</p>
           </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-display font-bold">Recent Payouts</h3>
              <span className="material-symbols-outlined text-slate-400">filter_list</span>
           </div>
           <div className="space-y-4">
              {[
                { date: 'Oct 20', amount: 1200, status: 'Paid' },
                { date: 'Oct 12', amount: 850, status: 'Paid' },
                { date: 'Oct 04', amount: 920, status: 'Paid' },
              ].map((payout, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         <span className="material-symbols-outlined text-[20px]">account_balance</span>
                      </div>
                      <div>
                         <p className="text-sm font-bold">{payout.date}</p>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest">{payout.status}</p>
                      </div>
                   </div>
                   <p className="font-display font-bold text-slate-900 dark:text-white">+${payout.amount}</p>
                </div>
              ))}
           </div>
        </div>
      </main>

      <BottomNav role="doctor" />
    </div>
  );
};

export default DoctorEarnings;
