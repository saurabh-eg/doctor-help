
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DOCTORS } from '../../constants';

const SlotSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctor = DOCTORS.find(d => d.id === id) || DOCTORS[0];
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slots = {
    morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'],
    afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM'],
    evening: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM']
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-32">
      <header className="flex items-center justify-between bg-white dark:bg-surface-dark px-4 py-3 border-b sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Select Time Slot</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4">
        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="bg-center bg-no-repeat bg-cover rounded-full h-14 w-14" style={{ backgroundImage: `url(${doctor.avatar})` }}></div>
          <div>
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-xs text-slate-500">{doctor.specialty} • Apollo Hospital</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="py-4 px-4">
          <h2 className="text-base font-bold mb-3">October 2023</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[24, 25, 26, 27, 28].map((day, i) => (
              <button key={i} className={`flex flex-col items-center justify-center min-w-[72px] h-[84px] rounded-xl border ${i === 0 ? 'bg-primary text-white' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold mb-1 opacity-80">{i === 0 ? 'Today' : 'Fri'}</span>
                <span className="text-xl font-bold">{day}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8 px-4 pt-4">
          {Object.entries(slots).map(([timeOfDay, timeSlots]) => (
            <div key={timeOfDay}>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-3 capitalize">{timeOfDay}</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button 
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 rounded-lg text-sm font-medium border transition-all ${
                      selectedSlot === slot 
                        ? 'bg-primary border-primary text-white shadow-md' 
                        : 'bg-white border-gray-200 text-slate-900'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t p-4 shadow-lg z-40 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Total Payable</span>
            <span className="text-lg font-bold">${doctor.fee}.00</span>
          </div>
        </div>
        <button 
          disabled={!selectedSlot}
          onClick={() => navigate('/patient/review')}
          className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${selectedSlot ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default SlotSelection;
