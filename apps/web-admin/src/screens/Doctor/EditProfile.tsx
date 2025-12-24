
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background-light/95 backdrop-blur-md z-10 border-b">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Clinical Profile</h1>
        <button className="text-primary font-bold text-sm">Save</button>
      </header>

      <main className="p-6 space-y-8">
        <div className="flex flex-col items-center gap-4">
           <div className="size-28 rounded-full bg-slate-200 relative overflow-hidden">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQovLcprrKua8ZR_-mUGYx4-ZBqnubGs91GS4HwKsKdLWZug50P1fW3KGyve6EI1qW-VCQpCJ6Le4fGGnrexhgPjuIDkGP4OT-68VzfLexV2tjze65i9eJ25dZjhzFwmmdbuIwsiCCR8VSU-7ZivaAoCOK0VDmurLUppRcD_MFeUOarL4K4aRliT6r9M-AQe0qvL6ClEhdEtr_ISMEVGmMfH4JHIdQo2h17bbjzW0xdSyKJuC5vBA4tvge1-rV8_NIo3lLaRERBs" alt="Doc" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined">photo_camera</span>
              </div>
           </div>
           <p className="text-xs font-bold text-primary uppercase">Change Profile Picture</p>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase px-2">Professional Summary</label>
              <textarea 
                className="w-full bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-primary h-32"
                placeholder="Talk about your experience, specialties and philosophy of care..."
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase px-2">Video Fee</label>
                 <input className="w-full bg-white dark:bg-surface-dark border-gray-200 rounded-2xl p-4 text-sm" placeholder="$80" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase px-2">Clinic Fee</label>
                 <input className="w-full bg-white dark:bg-surface-dark border-gray-200 rounded-2xl p-4 text-sm" placeholder="$50" />
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-sm font-bold border-b pb-2">Clinic Details</h3>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase px-2">Clinic Name</label>
                 <input className="w-full bg-white dark:bg-surface-dark border-gray-200 rounded-2xl p-4 text-sm" placeholder="City Medical Center" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase px-2">Location</label>
                 <input className="w-full bg-white dark:bg-surface-dark border-gray-200 rounded-2xl p-4 text-sm" placeholder="124 Main Street, Suite 400" />
              </div>
           </div>
        </div>
      </main>

      <BottomNav role="doctor" />
    </div>
  );
};

export default EditProfile;
