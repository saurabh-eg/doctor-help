
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { TRANSACTIONS } from '../../constants';

const Wallet: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl p-5 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
        </button>
        <h2 className="text-xl font-display font-bold flex-1 text-center pr-10 text-slate-900 dark:text-white">My Wallet</h2>
      </header>

      <main className="flex-1 px-5 py-6">
        <div className="relative w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary-dark to-slate-900 p-8 text-white shadow-xl shadow-primary/20 mb-8 border border-white/10">
          <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 size-40 bg-primary-light/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Available Funds</p>
              <div className="size-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-white text-[22px]">account_balance_wallet</span>
              </div>
            </div>
            <h1 className="text-5xl font-display font-bold tracking-tight my-4">$150.00</h1>
            
            <div className="mt-8 flex items-center gap-6 divide-x divide-white/20">
              <div className="flex flex-col gap-1">
                <span className="text-blue-100/70 uppercase tracking-wider text-[10px] font-black">Cash Balance</span>
                <span className="font-bold text-lg">$50.00</span>
              </div>
              <div className="flex flex-col gap-1 pl-6">
                <span className="text-blue-100/70 uppercase tracking-wider text-[10px] font-black">Health Credits</span>
                <span className="font-bold text-lg text-accent">$100.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Add Cash', icon: 'add_circle', color: 'primary' },
            { label: 'Redeem', icon: 'card_giftcard', color: 'emerald' },
            { label: 'Refer', icon: 'stars', to: '/patient/referral', color: 'indigo' },
          ].map((action, i) => (
            <button 
              key={i} 
              onClick={() => action.to && navigate(action.to)}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-soft border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30 group active:scale-95"
            >
              <div className={`flex size-12 items-center justify-center rounded-2xl bg-${action.color === 'primary' ? 'blue' : action.color === 'emerald' ? 'emerald' : 'indigo'}-50 dark:bg-slate-800 text-primary group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[26px]">{action.icon}</span>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-10">
          <div className="group relative overflow-hidden rounded-[24px] bg-white dark:bg-surface-dark shadow-soft border border-slate-100 dark:border-slate-800 flex">
            <div className="flex-1 p-6 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="size-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Active Program</span>
              </div>
              <h3 className="text-lg font-display font-bold mb-2 text-slate-900 dark:text-white">Invite Friends</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Earn <span className="font-bold text-primary">$10.00</span> for every new user you bring to the platform.
              </p>
              <button 
                onClick={() => navigate('/patient/referral')} 
                className="bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-primary/10"
              >
                Get Invite Link
              </button>
            </div>
            <div className="w-2/5 relative">
               <img 
                 className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt2Ugwr4mDF8iV3wOPib-NvG8Rga_ZrPHDZW9Bei-RaJ3Lj2mJpFKBnB7XBPv_nq_sNLjlGYAhHdnw3amTAkBUgOZnD57Iu6j66sIKMLyW7Qm8thBhqIZca-q4kbXvTQ7GUDmwH3M6q8qGZPIWQB8dkxUbxs-VdzvQrdCbHsVDyYTDPpwIduMyAoBdUtRtYTa5UYrZyY69VKNGlH1E9yP0t1wRW-YcUeQFGKbrpb7noRmQweIyNxGskcUJb1-wA0J69RSM6zgTtnA" 
                 alt="Referral" 
               />
               <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white dark:to-surface-dark"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Transaction History</h3>
          <button className="text-sm font-bold text-primary hover:underline">View All</button>
        </div>

        <div className="space-y-4">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-50 dark:border-slate-800 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[24px]">{tx.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                  {tx.amount > 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                   <div className={`size-1.5 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500' : tx.type === 'debit' ? 'bg-slate-400' : 'bg-primary'}`}></div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{tx.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav role="patient" />
    </div>
  );
};

export default Wallet;
