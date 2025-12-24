
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReviewPay: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-[100px]">
      <header className="sticky top-0 z-30 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl p-5 border-b border-slate-100 dark:border-slate-800 pt-12">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-display font-bold flex-1 text-center pr-10">Review & Pay</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Service Selection</h3>
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-soft border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              <img className="size-16 rounded-2xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiyJ-grjemAN2JdOUu-LIOeNygdzHgH2c9ITk1tnWYvZTDidnibM1NS3MlQa8bFxdQ0VsjD8erP8RLZ-iIRoYpg2u_Uu3O7bW6Vc4qwzJzCG4CPHkI1UnsTlUNy-HWLgv5GLaXU2hqOrzLvHSqcc1iFNhfsKWhjx6bC6i8rHZzRPP7VaabqGp8GFR5RlHacC91h59r1hTslICNwmyTJ5DlApVCSplCOw5BARIUh1uT2wHAqeJhLquZiIqvr3tnMz9Pp-CPKviN45M" alt="Doc" />
              <div>
                <p className="font-display font-bold text-lg">Dr. Sarah Johnson</p>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-0.5">Senior Cardiologist</p>
              </div>
            </div>
            <div className="pt-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                </div>
                <p className="text-sm font-bold">Tomorrow, 14 Oct • 10:30 AM</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                </div>
                <p className="text-sm font-bold">Secure Video Consultation</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cost Breakdown</h3>
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft border border-slate-50 dark:border-slate-800 space-y-4">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <p>Consultation Fee</p>
              <p className="text-slate-900 dark:text-white">$80.00</p>
            </div>
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <p>Platform Charges</p>
              <p className="text-slate-900 dark:text-white">$5.00</p>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Payable</p>
                <p className="text-3xl font-display font-bold text-primary">$85.00</p>
              </div>
              <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Inclusive of Tax</div>
            </div>
          </div>
        </section>

        <section className="pb-8">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Payment Method</h3>
           <div className="space-y-4">
              <label className="flex items-center justify-between p-5 bg-primary/5 border-2 border-primary rounded-3xl cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                       <span className="material-symbols-outlined text-[28px]">smartphone</span>
                    </div>
                    <div>
                       <p className="font-bold text-sm">UPI / Apple Pay</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Fastest Checkout</p>
                    </div>
                 </div>
                 <div className="size-6 rounded-full border-4 border-primary bg-white"></div>
              </label>
              
              <label className="flex items-center justify-between p-5 bg-white dark:bg-surface-dark border-2 border-transparent rounded-3xl cursor-pointer hover:border-slate-200 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500">
                       <span className="material-symbols-outlined text-[28px]">credit_card</span>
                    </div>
                    <p className="font-bold text-sm">Credit / Debit Card</p>
                 </div>
                 <div className="size-6 rounded-full border-2 border-slate-200"></div>
              </label>
           </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between max-w-md mx-auto z-40 rounded-t-[32px] shadow-2xl">
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pay</p>
          <p className="text-2xl font-display font-bold">$85.00</p>
        </div>
        <button 
          onClick={() => navigate('/patient/success')}
          className="bg-primary hover:bg-primary-dark text-white h-14 px-10 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default ReviewPay;
