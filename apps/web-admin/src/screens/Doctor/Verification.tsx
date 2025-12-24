
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Verification: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-background-dark min-h-screen p-6 flex flex-col">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Get Verified</h1>
        <p className="text-slate-500">Complete these steps to start accepting patient appointments.</p>
      </header>

      <div className="space-y-4 flex-1">
        {[
          { icon: 'badge', title: 'Medical License', sub: 'Upload a clear photo of your license', status: 'pending' },
          { icon: 'account_balance', title: 'Bank Account', sub: 'For your consultation earnings', status: 'not-started' },
          { icon: 'clinical_notes', title: 'Clinic Address Proof', sub: 'Utility bill or rent agreement', status: 'not-started' }
        ].map((step, i) => (
          <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-gray-100 bg-gray-50/50">
             <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                   <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div>
                   <p className="font-bold text-sm">{step.title}</p>
                   <p className="text-xs text-slate-400">{step.sub}</p>
                </div>
             </div>
             {step.status === 'pending' ? (
                <span className="material-symbols-outlined text-orange-400">pending</span>
             ) : (
                <button className="text-primary">
                   <span className="material-symbols-outlined">add_circle</span>
                </button>
             )}
          </div>
        ))}
      </div>

      <div className="pt-6">
         <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl mb-8">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-xs text-primary font-medium leading-relaxed">Verification usually takes 24-48 hours. We'll notify you via SMS once it's complete.</p>
         </div>
         <button 
           onClick={() => navigate('/doctor/home')}
           className="w-full bg-black dark:bg-white dark:text-black text-white font-bold py-4 rounded-2xl active:scale-95 transition-all"
         >
           Submit for Review
         </button>
      </div>
    </div>
  );
};

export default Verification;
