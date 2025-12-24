
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="size-12 rounded-full border-2 border-white shadow-sm bg-center bg-cover" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArQovLcprrKua8ZR_-mUGYx4-ZBqnubGs91GS4HwKsKdLWZug50P1fW3KGyve6EI1qW-VCQpCJ6Le4fGGnrexhgPjuIDkGP4OT-68VzfLexV2tjze65i9eJ25dZjhzFwmmdbuIwsiCCR8VSU-7ZivaAoCOK0VDmurLUppRcD_MFeUOarL4K4aRliT6r9M-AQe0qvL6ClEhdEtr_ISMEVGmMfH4JHIdQo2h17bbjzW0xdSyKJuC5vBA4tvge1-rV8_NIo3lLaRERBs")' }}
            ></div>
            <div>
              <h2 className="text-lg font-bold">Good Morning, Dr. Smith</h2>
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[18px] filled">verified</span>
                <p className="text-xs font-medium uppercase tracking-wider">Verified Practitioner</p>
              </div>
            </div>
          </div>
          <button className="size-10 flex items-center justify-center rounded-full bg-white relative shadow-sm">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {[
            { label: 'Patients', value: '1,240', icon: 'groups', color: 'blue' },
            { label: 'Visits', value: '8', icon: 'stethoscope', color: 'green' },
            { label: 'Pending', value: '3', icon: 'pending_actions', color: 'orange' }
          ].map((stat, i) => (
            <div key={i} className="flex-1 min-w-[140px] bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <div className={`p-1.5 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                    <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                 </div>
                 <p className="text-[10px] font-bold uppercase text-slate-400">{stat.label}</p>
               </div>
               <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="flex justify-between items-end mb-3">
             <h3 className="text-lg font-bold">Up Next</h3>
             <button className="text-sm font-semibold text-primary">See All</button>
          </div>
          <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
             <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-slate-200 overflow-hidden">
                   <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP_pdUSrmsnCPX2nA9eVBYfYOgtVLsNyufNVOXRQN7p0L6ddme1JI5tRDbHVFVw9aBLRXzVZQfSSmcdCT_pemhVx7QE8WubH98k3uE5_fdQIZIV6ihOS4meUs3PlqQU11x4a7A9d5sCCUkOFi7Oa4J5BNpuJnfHffqbrhmwX3yHmDqOevNxZQc7Q8o3qbsSz5nliCrVwC4yrHF4HUTPYQS0Jy2jRFB2z9zytF94Y-elAJELK31iz3_LC0QEXw1Wxr7CfmfRnlE0_o" alt="Patient" />
                </div>
                <div>
                   <p className="font-bold">Sarah Jenkins</p>
                   <div className="flex items-center gap-1.5 text-primary text-sm font-bold my-0.5">
                      <span className="material-symbols-outlined text-[16px]">videocam</span> 10:00 AM - Video
                   </div>
                   <p className="text-xs text-slate-400">Symptom: Severe migraine & nausea</p>
                </div>
             </div>
             <button className="w-full mt-4 bg-primary text-white font-bold py-3 rounded-xl shadow-md">Start Consult</button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3">Pending Requests</h3>
          <div className="space-y-3">
             {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-xl border shadow-sm">
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                         <div className="size-10 rounded-full bg-slate-200"></div>
                         <div>
                            <p className="font-bold text-sm">John Doe</p>
                            <p className="text-xs text-slate-400">Fever & Body Ache</p>
                         </div>
                      </div>
                      <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-1 rounded">Today, 2:30 PM</span>
                   </div>
                   <div className="flex gap-3">
                      <button className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-bold">Decline</button>
                      <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold">Accept</button>
                   </div>
                </div>
             ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3">Clinical Tools</h3>
          <div className="grid grid-cols-2 gap-3 pb-8">
             {[
               { label: 'Availability', icon: 'edit_calendar', color: 'blue' },
               { label: 'Calendar', icon: 'calendar_today', color: 'purple' },
               { label: 'Records', icon: 'folder_shared', color: 'emerald' },
               { label: 'Notes', icon: 'description', color: 'amber' }
             ].map((tool, i) => (
                <button key={i} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark border rounded-2xl shadow-sm hover:border-primary">
                   <div className={`p-3 rounded-full bg-${tool.color}-50 text-${tool.color}-600 mb-2`}>
                      <span className="material-symbols-outlined">{tool.icon}</span>
                   </div>
                   <span className="text-sm font-bold">{tool.label}</span>
                </button>
             ))}
          </div>
        </section>
      </main>

      <BottomNav role="doctor" />
    </div>
  );
};

export default DoctorDashboard;
