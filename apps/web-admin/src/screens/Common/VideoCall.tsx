
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="h-screen w-full bg-slate-900 relative overflow-hidden">
      {/* Doctor Feed */}
      <div className="absolute inset-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiyJ-grjemAN2JdOUu-LIOeNygdzHgH2c9ITk1tnWYvZTDidnibM1NS3MlQa8bFxdQ0VsjD8erP8RLZ-iIRoYpg2u_Uu3O7bW6Vc4qwzJzCG4CPHkI1UnsTlUNy-HWLgv5GLaXU2hqOrzLvHSqcc1iFNhfsKWhjx6bC6i8rHZzRPP7VaabqGp8GFR5RlHacC91h59r1hTslICNwmyTJ5DlApVCSplCOw5BARIUh1uT2wHAqeJhLquZiIqvr3tnMz9Pp-CPKviN45M"
          className="w-full h-full object-cover opacity-90"
          alt="Doctor feed"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
      </div>

      {/* Header Info */}
      <header className="absolute top-12 left-0 w-full px-5 flex items-center justify-between z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
           <div className="size-10 rounded-full border-2 border-emerald-500 overflow-hidden">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiyJ-grjemAN2JdOUu-LIOeNygdzHgH2c9ITk1tnWYvZTDidnibM1NS3MlQa8bFxdQ0VsjD8erP8RLZ-iIRoYpg2u_Uu3O7bW6Vc4qwzJzCG4CPHkI1UnsTlUNy-HWLgv5GLaXU2hqOrzLvHSqcc1iFNhfsKWhjx6bC6i8rHZzRPP7VaabqGp8GFR5RlHacC91h59r1hTslICNwmyTJ5DlApVCSplCOw5BARIUh1uT2wHAqeJhLquZiIqvr3tnMz9Pp-CPKviN45M" className="w-full h-full object-cover" />
           </div>
           <div>
              <p className="text-white font-bold text-sm">Dr. Sarah Johnson</p>
              <div className="flex items-center gap-1.5">
                 <span className="size-1.5 bg-red-500 rounded-full animate-pulse"></span>
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Recording Live</p>
              </div>
           </div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-white font-mono text-xs">
          14:23
        </div>
      </header>

      {/* Self View */}
      <div className="absolute top-32 right-5 size-32 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
         <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0lTR-F-fgUU1mNg76mQabPxAaec1rRReike_aw12A_UyfhMaCKfPp_QUtKLUoSzzI_X9oCUzXhdW5JvqrOp-Ig05b2oNe_5MRxkV7L3qgOa6XQCtnRCLJIHqzExig63d8eOsgneP2OY_mVxe8SrQ6Y3sorCWO2JzSOOSZ4CzKWUHdlFzFmCEZ7Q8Eu13yT2q0CPi97KjeQDijPdpAtA1x4j7OCsjU-r95zHUG_8GoMf_dOeG0-VD9KD2WjSKxjc1U1QQWU9cAdRE" className="w-full h-full object-cover grayscale" />
         <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-white text-xs filled">mic</span>
         </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-12 left-0 w-full px-10 flex items-center justify-around z-30">
        <button className="size-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:bg-white/30 transition-all">
          <span className="material-symbols-outlined">videocam</span>
        </button>
        <button className="size-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:bg-white/30 transition-all">
          <span className="material-symbols-outlined">mic</span>
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="size-20 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-4xl">call_end</span>
        </button>
        <button className="size-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:bg-white/30 transition-all">
          <span className="material-symbols-outlined">chat</span>
        </button>
        <button className="size-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:bg-white/30 transition-all">
          <span className="material-symbols-outlined">screen_share</span>
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
