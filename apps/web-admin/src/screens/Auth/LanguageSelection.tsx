
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="pt-8 px-6">
        <div 
          className="w-full aspect-[4/3] bg-center bg-no-repeat bg-contain flex flex-col justify-end overflow-hidden rounded-2xl bg-white dark:bg-white/5 shadow-sm p-8" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCRzDtM0g-NSDrF2k4V9-ccV_R4BpaFYo5Sc1fEwqGSWhKQNW3OSHrsaP7PEw7FbVxlxs8vYgivOYSsIpR4iUcg8Ol7ghCr716F_qlGfpSWZt9Tij7cfPFuSl6zKafIcWMWexnHJ-GXIV_oKemQF4YMZMpJ4LpT_vlaUrBWscmlQKHUswrRBGMYjuk4ztLmeSDfOP-5W4lN9f6DZU8wa92ZXrbCtCPs6BnwsDjh2M_Tm-fhusxv7Zh5Z0nRPhIQwvNEnuY891MRLOs")' }}
        >
        </div>
      </div>
      
      <div className="flex flex-col items-center px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-3xl text-black dark:text-accent">local_hospital</span>
          <h1 className="text-[#1c1c0d] dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center">Doctor Help</h1>
        </div>
        <p className="text-[#1c1c0d]/70 dark:text-white/70 text-base font-normal leading-normal text-center max-w-[320px]">
          Your health partner for bookings, labs, and records.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-end pb-8">
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-t-[2.5rem] p-6 pt-8 border-t border-white/20 dark:border-white/5">
          <h2 className="text-[#1c1c0d] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-6">
            Select your language<br/>
            <span className="text-lg font-normal opacity-80">अपनी भाषा चुनें</span>
          </h2>
          <div className="flex flex-col gap-4 max-w-[320px] mx-auto w-full">
            <button onClick={() => navigate('/patient/home')} className="group flex w-full items-center justify-between rounded-full h-14 pl-6 pr-4 bg-accent text-black transition-transform active:scale-95 shadow-md">
              <span className="text-lg font-bold">English</span>
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </div>
            </button>
            <button onClick={() => navigate('/patient/home')} className="group flex w-full items-center justify-between rounded-full h-14 pl-6 pr-4 bg-accent text-black transition-transform active:scale-95 shadow-md">
              <span className="text-lg font-bold">हिंदी</span>
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
