
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Referral: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background-light/95 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="size-10 rounded-full hover:bg-white flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Refer & Earn</h1>
      </header>

      <main className="px-6 py-4 flex flex-col items-center text-center">
        <div className="w-full aspect-square max-w-[300px] mb-8">
           <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt2Ugwr4mDF8iV3wOPib-NvG8Rga_ZrPHDZW9Bei-RaJ3Lj2mJpFKBnB7XBPv_nq_sNLjlGYAhHdnw3amTAkBUgOZnD57Iu6j66sIKMLyW7Qm8thBhqIZca-q4kbXvTQ7GUDmwH3M6q8qGZPIWQB8dkxUbxs-VdzvQrdCbHsVDyYTDPpwIduMyAoBdUtRtYTa5UYrZyY69VKNGlH1E9yP0t1wRW-YcUeQFGKbrpb7noRmQweIyNxGskcUJb1-wA0J69RSM6zgTtnA" 
            alt="Referral Illustration"
            className="w-full h-full object-contain"
           />
        </div>

        <h2 className="text-2xl font-bold mb-3">Invite your friends!</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Share your code with friends. Once they complete their first consultation, both of you get <span className="text-primary font-bold">$10 credit</span>.
        </p>

        <div className="w-full space-y-4">
          <div className="p-5 border-2 border-dashed border-primary/30 rounded-3xl bg-primary/5 flex flex-col items-center">
             <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Your referral code</p>
             <div className="flex items-center gap-4">
                <span className="text-2xl font-bold tracking-widest">DOCTOR88</span>
                <button className="text-primary active:scale-90 transition-transform">
                   <span className="material-symbols-outlined">content_copy</span>
                </button>
             </div>
          </div>

          <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">share</span>
             Share with Friends
          </button>
        </div>
      </main>
    </div>
  );
};

export default Referral;
