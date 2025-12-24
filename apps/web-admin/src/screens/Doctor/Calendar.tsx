
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(24);

  const appointments = [
    { time: '09:00 AM', name: 'Robert Fox', type: 'In-Clinic', status: 'completed' },
    { time: '10:00 AM', name: 'Sarah Jenkins', type: 'Video', status: 'next' },
    { time: '11:30 AM', name: 'Michael Chen', type: 'Video', status: 'upcoming' },
    { time: '02:00 PM', name: 'Eleanor Pena', type: 'In-Clinic', status: 'upcoming' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <header className="bg-white dark:bg-surface-dark px-4 pt-12 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-center mb-6">Schedule</h1>
        <div className="flex justify-between">
          {[22, 23, 24, 25, 26, 27].map((day) => (
            <button 
              key={day} 
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center p-2 rounded-2xl w-12 transition-all ${selectedDay === day ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}
            >
              <span className="text-[10px] uppercase font-bold mb-1">Oct</span>
              <span className="text-lg font-bold">{day}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4">
        <h2 className="text-base font-bold text-slate-400 uppercase tracking-widest px-2 pt-4">Today's Timeline</h2>
        
        {appointments.map((app, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-16 flex flex-col items-center pt-2">
              <span className="text-xs font-bold text-slate-500">{app.time.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-400">{app.time.split(' ')[1]}</span>
              <div className="flex-1 w-0.5 bg-gray-200 my-2"></div>
            </div>
            <div className={`flex-1 p-4 rounded-2xl border ${app.status === 'next' ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white dark:bg-surface-dark border-gray-100'} mb-4`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{app.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${app.status === 'next' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {app.type}
                </span>
              </div>
              <p className={`text-xs ${app.status === 'next' ? 'text-blue-100' : 'text-slate-400'}`}>Follow-up session for migraine treatment.</p>
              {app.status === 'next' && (
                <button className="w-full mt-4 bg-white text-primary font-bold py-2.5 rounded-xl text-sm shadow-sm">Join Call</button>
              )}
            </div>
          </div>
        ))}
      </main>

      <BottomNav role="doctor" />
    </div>
  );
};

export default Calendar;
