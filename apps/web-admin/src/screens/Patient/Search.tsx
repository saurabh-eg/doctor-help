
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const Search: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl z-30 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-3xl font-display font-bold mb-6 text-slate-900 dark:text-white">Healthcare Search</h1>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
          </div>
          <input 
            className="w-full h-14 pl-12 pr-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-soft focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium" 
            placeholder="Search doctors, labs, or medical tests..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">tune</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
        <button className="shrink-0 h-11 px-6 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">All Results</button>
        <button className="shrink-0 h-11 px-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:border-primary/30 transition-colors shadow-soft">
          <span className="material-symbols-outlined text-xl text-primary">hematology</span> Blood Tests
        </button>
        <button className="shrink-0 h-11 px-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:border-primary/30 transition-colors shadow-soft">
          <span className="material-symbols-outlined text-xl text-primary">radiology</span> MRI / CT Scan
        </button>
      </div>

      <main className="px-6 py-4 space-y-8">
        <div className="relative h-44 rounded-[32px] overflow-hidden group cursor-pointer shadow-card">
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCan_jCaxF7svmoVB-EQv1n_ffHa_-dZO_8zDsICRRcvSuuoNkH9IU9CEgsDymPlzL9WQJIEWdv4R65orENWyUq4yWOHzc522FvYRTNtzUvQrrn6N0D2cQPpATHC3aysRzVF9JsmnoyZibRG8rnl0M_HtuN69N1qKwA2T_ye2autXmnhSujE6usBr5R1pfoAAu14OlPjGL4Wd6SIuck7K8hF2cgCGaUawc3RTNrFhzN7f9kMGofBO63KGH4l2ocefst5_whGXAqJTM" 
            alt="Promotion"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent p-8 flex flex-col justify-center max-w-[75%]">
             <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">Safe Check</span>
                <span className="text-white text-[11px] font-bold opacity-90">Sample Pickups Available</span>
             </div>
             <h2 className="text-2xl font-display font-bold text-white mb-5 leading-tight">Fast Diagnostic <br/>Results at Home</h2>
             <button className="bg-white text-slate-900 text-[10px] font-black px-6 py-3 rounded-xl w-fit uppercase tracking-wider shadow-xl shadow-black/20 hover:bg-slate-50 active:scale-95 transition-all">Schedule Appointment</button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Laboratories Near You</h3>
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Open Map</button>
          </div>

          <div 
            onClick={() => navigate('/patient/lab/1')}
            className="bg-white dark:bg-surface-dark rounded-[28px] p-6 shadow-soft hover:shadow-card border border-slate-100 dark:border-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-5 mb-6">
              <div className="size-20 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0 shadow-inner ring-1 ring-slate-100 dark:ring-slate-700">
                <img className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Xssc7FLxMGDJNrIhBGMxGb_lS0UvS2l2FkSku29TXIFAP0R1ml8j60pdIeEA52rNldZPrPXFntnAacO-mgJ0S7pHZhCXBKyUiRZjJp-2jFqN8C4v9kARlQe9MeTjLlE9c4HU_mblAiPQhL_zk8jObHa5MImKXgBKWMd-R3r0k4EkmvX0_QLQV5mS_vUsXK9JUpcrkqbz0ELFsqMGUpsh1LDq4_YZVGsYkovl8onD6xBE6qSScvMj0TdeGGmL1VufitnfKFDCk1s" alt="Lab" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">Precision Diagnostic <br/>Services</h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                    <span className="material-symbols-outlined text-[16px] filled">star</span> 4.9
                  </div>
                  <span className="text-slate-300">|</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">0.8 miles away</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 mb-6">
               <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3.5 rounded-xl shadow-soft">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">water_drop</span>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Diabetes Panel (HbA1c)</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Most Booked</p>
                     </div>
                  </div>
                  <span className="text-base font-display font-bold text-primary">$18.00</span>
               </div>
            </div>
            
            <button className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all">View All 42 Tests</button>
          </div>
        </div>
      </main>

      <BottomNav role="patient" />
    </div>
  );
};

export default Search;
