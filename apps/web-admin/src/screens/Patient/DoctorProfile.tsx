
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DOCTORS } from '../../constants';

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctor = DOCTORS.find(d => d.id === id) || DOCTORS[0];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen relative pb-[140px]">
      <header className="sticky top-0 z-30 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl p-4 justify-between border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
        </button>
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Professional Profile</h2>
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">favorite</span>
        </button>
      </header>

      <div className="flex flex-col p-8 items-center gap-5">
        <div className="relative group">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-[32px] h-36 w-36 shadow-xl ring-8 ring-white dark:ring-surface-dark transition-transform group-hover:scale-105 duration-500" 
            style={{ backgroundImage: `url(${doctor.avatar})` }}
          ></div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-2xl p-2.5 shadow-lg flex items-center justify-center border-4 border-white dark:border-surface-dark">
            <span className="material-symbols-outlined text-[20px] filled">check_circle</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{doctor.name}</h1>
            <span className="material-symbols-outlined text-primary filled text-[22px]">verified</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-2">{doctor.specialty}</p>
          <div className="flex items-center justify-center gap-2">
             {doctor.qualifications.map((q, i) => (
               <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{q}</span>
             ))}
          </div>
        </div>
      </div>

      <div className="px-5 grid grid-cols-3 gap-3 mb-10">
        {[
          { icon: 'workspace_premium', label: 'Exp', value: `${doctor.experience}Y+`, color: 'blue' },
          { icon: 'star', label: 'Rating', value: doctor.rating.toString(), color: 'orange', filled: true },
          { icon: 'group', label: 'Cured', value: doctor.patients, color: 'emerald' }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
            <div className={`bg-${stat.color === 'blue' ? 'blue' : stat.color === 'orange' ? 'amber' : 'emerald'}-50 dark:bg-slate-800 p-2 rounded-xl mb-2 text-${stat.color === 'blue' ? 'blue' : stat.color === 'orange' ? 'amber' : 'emerald'}-600`}>
              <span className={`material-symbols-outlined text-[22px] ${stat.filled ? 'filled' : ''}`}>{stat.icon}</span>
            </div>
            <p className="text-lg font-display font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="px-5 border-b border-slate-100 dark:border-slate-800 flex mb-8">
        {['About', 'Clinic', 'Feedback'].map((tab, i) => (
          <button key={i} className={`pb-4 pt-2 text-xs font-black uppercase tracking-[0.2em] flex-1 relative transition-colors ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>
            {tab}
            {i === 0 && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-8">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-3">Professional Summary</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
            {doctor.name} is a renowned specialist in {doctor.specialty.toLowerCase()} with a patient-first approach. 
            Recognized for clinical excellence and compassionate care. <span className="text-primary font-bold cursor-pointer hover:underline">Read Full Bio</span>
          </p>
        </div>

        <div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Facility Details</h3>
              <button className="text-xs font-bold text-primary flex items-center gap-1">
                 Directions <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
           </div>
           <div className="bg-white dark:bg-surface-dark rounded-[28px] p-5 border border-slate-100 dark:border-slate-800 shadow-soft">
              <div className="flex items-center gap-4 mb-5">
                 <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">domain</span>
                 </div>
                 <div>
                    <p className="font-bold text-slate-900 dark:text-white">Apollo Hospital</p>
                    <p className="text-xs text-slate-500 font-medium">124 Main Street, Suite 400</p>
                 </div>
              </div>
              <div className="h-44 w-full rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-slate-100 dark:ring-slate-800">
                 <img className="w-full h-full object-cover grayscale opacity-40 dark:opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsxkncCMKuVVKZHwlKPi9UzL-TjU2v5DorFyl_20eLa131PfIsQpj6_O0XiZ14QYuxZVd7TdLVAl8wUl8qA41MyW9fMENmzwwfEu2hbT6Azui1HRbd8UGb_P79xTTxmRq2MK1D3xtYxYErjgxpmdxymwxJX_hucL2S0uiWzn5xqRKwCHYa5vTzlY793Zv43uSNeCmoVZHQ8bxlhRTebPhhvN7WBTDeii-1wF5bPKtgclYU4hK-o93_TmKmrktt0XZ-9IMZHwux5nI" alt="Map" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                       <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
                       <span className="material-symbols-outlined text-primary text-4xl filled drop-shadow-lg">location_on</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 p-5 shadow-2xl z-40 max-w-md mx-auto rounded-t-[32px]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Booking Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">${doctor.fee}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">/ Visit</span>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/patient/book/${doctor.id}`)}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold h-16 rounded-[20px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Reserve Slot</span>
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
