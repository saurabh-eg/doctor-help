
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const LabDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const tests = [
    { name: 'Complete Blood Count (CBC)', price: 25, oldPrice: 40, time: '24 hrs' },
    { name: 'Lipid Profile', price: 35, oldPrice: 60, time: '24 hrs' },
    { name: 'Thyroid Profile (T3, T4, TSH)', price: 30, oldPrice: 50, time: '12 hrs' },
    { name: 'Vitamin B12 Check', price: 45, oldPrice: 80, time: '48 hrs' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <div className="relative h-64 w-full">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Xssc7FLxMGDJNrIhBGMxGb_lS0UvS2l2FkSku29TXIFAP0R1ml8j60pdIeEA52rNldZPrPXFntnAacO-mgJ0S7pHZhCXBKyUiRZjJp-2jFqN8C4v9kARlQe9MeTjLlE9c4HU_mblAiPQhL_zk8jObHa5MImKXgBKWMd-R3r0k4EkmvX0_QLQV5mS_vUsXK9JUpcrkqbz0ELFsqMGUpsh1LDq4_YZVGsYkovl8onD6xBE6qSScvMj0TdeGGmL1VufitnfKFDCk1s" 
          className="w-full h-full object-cover"
          alt="Lab Header"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-accent filled">star</span>
            <span className="text-white font-bold text-sm">4.8 (1.2k Reviews)</span>
          </div>
          <h1 className="text-2xl font-bold text-white">City Diagnostic Center</h1>
          <p className="text-slate-300 text-sm">124 Main Street, Downtown • Open 24/7</p>
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 size-10 bg-white/20 backdrop-blur-md rounded-full text-white flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <main className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Popular Tests</h2>
          <button className="text-sm font-bold text-primary">View All</button>
        </div>

        <div className="space-y-4">
          {tests.map((test, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm max-w-[70%]">{test.name}</h3>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">${test.price}</p>
                  <p className="text-xs text-slate-400 line-through">${test.oldPrice}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Reports in {test.time}
                </div>
                <button className="bg-accent text-black text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-primary rounded-3xl text-white relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Need a lab technician at home?</h3>
              <p className="text-blue-100 text-sm mb-4">Sample collection at your doorstep for $5 extra.</p>
              <button className="bg-white text-primary px-6 py-2.5 rounded-full font-bold text-xs">Book Home Collection</button>
           </div>
           <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] opacity-10">house</span>
        </div>
      </main>
    </div>
  );
};

export default LabDetails;
