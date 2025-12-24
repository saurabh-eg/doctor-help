
import React from 'react';
import BottomNav from '../../components/BottomNav';
import { RECORDS } from '../../constants';

const Records: React.FC = () => {
  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <header className="flex-none bg-white dark:bg-surface-dark px-5 pt-12 pb-6 shadow-soft z-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">Medical Vault</h2>
          <button className="group flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 transition-all shadow-lg shadow-primary/20 active:scale-95">
            <span className="material-symbols-outlined text-white text-[22px]">add_circle</span>
            <span className="text-white text-xs font-bold uppercase tracking-wider">Add New</span>
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input 
            className="block w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
            placeholder="Search prescriptions, reports..." 
            type="text"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md py-5 px-5 flex flex-col gap-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            <button className="shrink-0 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10">All Documents</button>
            <button className="shrink-0 rounded-xl bg-white dark:bg-surface-dark px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">Prescriptions</button>
            <button className="shrink-0 rounded-xl bg-white dark:bg-surface-dark px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">Lab Results</button>
          </div>
          <div className="flex items-center gap-2 px-1 bg-emerald-50 dark:bg-emerald-950/20 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 ml-3 filled">verified_user</span>
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">End-to-End Encrypted Access</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 ml-1">Recently Uploaded</h3>

          {RECORDS.map((record) => (
            <div key={record.id} className="group relative flex items-center justify-between rounded-[24px] bg-white dark:bg-surface-dark p-4 shadow-soft border border-slate-100 dark:border-slate-800 transition-all hover:shadow-card hover:border-primary/20 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                  record.type === 'prescription' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 
                  record.type === 'scan' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 
                  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                }`}>
                  <span className="material-symbols-outlined text-[28px]">
                    {record.type === 'prescription' ? 'prescriptions' : record.type === 'scan' ? 'radiology' : 'science'}
                  </span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{record.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{record.provider}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {record.date}
                    </span>
                    {record.type === 'report' && (
                      <span className="bg-emerald-500 size-1.5 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
              <button className="rounded-full p-2 text-slate-300 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">more_vert</span>
              </button>
            </div>
          ))}
          
          <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-30">
            <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
            <p className="text-sm font-bold uppercase tracking-widest">End of results</p>
          </div>
        </div>
      </main>

      <BottomNav role="patient" />
    </div>
  );
};

export default Records;
