
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const navigate = useNavigate();

  const handleLogin = () => {
    onLogin(role);
    navigate('/language');
  };

  return (
    <div className="w-full flex flex-col h-screen px-6 pt-4 pb-8 bg-background-light dark:bg-background-dark overflow-y-auto">
      <nav className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-bold">
            <span className="material-symbols-outlined text-[20px]">local_hospital</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Doctor Help</span>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
          <button 
            onClick={() => setRole('patient')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'patient' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
          >
            Patient
          </button>
          <button 
            onClick={() => setRole('doctor')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'doctor' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
          >
            Doctor
          </button>
        </div>
      </nav>

      <header className="flex flex-col items-center text-center mb-10 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
          Your Health, <br/><span className="text-black/60 dark:text-white/60">Simplified.</span>
        </h1>
        <p className="text-base font-normal text-black/60 dark:text-white/60 max-w-[280px]">
          Log in to book doctors, manage records, and access care.
        </p>
      </header>

      <div className="w-full space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold ml-2 text-black/80 dark:text-white/80">Mobile Number</label>
          <div className="flex gap-3">
            <div className="relative w-[100px] shrink-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="material-symbols-outlined text-black/40 dark:text-white/40 text-[20px]">flag</span>
              </div>
              <select className="w-full h-14 pl-12 pr-8 appearance-none bg-white dark:bg-surface-dark border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-base font-medium">
                <option>+1</option>
                <option>+44</option>
                <option>+91</option>
              </select>
            </div>
            <div className="relative flex-1">
              <input 
                className="w-full h-14 pl-6 pr-4 bg-white dark:bg-surface-dark border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-base placeholder:text-black/30 font-medium shadow-sm" 
                placeholder="555-000-0000" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <button className="w-full h-14 bg-accent hover:opacity-90 active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20">
            <span className="text-black font-bold text-base tracking-wide">Get OTP</span>
            <span className="material-symbols-outlined text-black text-[20px]">sms</span>
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/5 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background-light dark:bg-background-dark px-4 text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-widest">Verification</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-black/60 dark:text-white/60">
              Enter the 4-digit code sent to <br/>
              <span className="font-bold text-black dark:text-white text-base">+1 (555) ***-**89</span>
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <input key={i} className="w-14 h-16 text-center text-2xl font-bold bg-white dark:bg-surface-dark border-2 border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-accent transition-all text-black dark:text-white" maxLength={1} type="text" />
            ))}
          </div>
          <button onClick={handleLogin} className="w-full h-14 bg-black dark:bg-white dark:text-black text-white hover:opacity-90 active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2 shadow-xl">
            <span className="font-bold text-base tracking-wide">Verify & Login</span>
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
