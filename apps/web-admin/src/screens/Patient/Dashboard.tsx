
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/patient/profile" className="relative group">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-white dark:border-slate-700 shadow-soft transition-transform group-active:scale-95" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0lTR-F-fgUU1mNg76mQabPxAaec1rRReike_aw12A_UyfhMaCKfPp_QUtKLUoSzzI_X9oCUzXhdW5JvqrOp-Ig05b2oNe_5MRxkV7L3qgOa6XQCtnRCLJIHqzExig63d8eOsgneP2OY_mVxe8SrQ6Y3sorCWO2JzSOOSZ4CzKWUHdlFzFmCEZ7Q8Eu13yT2q0CPi97KjeQDijPdpAtA1x4j7OCsjU-r95zHUG_8GoMf_dOeG0-VD9KD2WjSKxjc1U1QQWU9cAdRE")' }}
            ></div>
            <div className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-background-dark"></div>
          </Link>
          <div className="flex flex-col">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Good Morning,</p>
            <h2 className="text-slate-900 dark:text-white text-xl font-display font-bold leading-tight">Alex Henderson 👋</h2>
          </div>
        </div>
        <button className="flex size-11 items-center justify-center rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 shadow-soft relative group active:scale-90 transition-all">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
        </button>
      </header>

      <div className="px-5 py-2">
        <div 
          onClick={() => navigate('/patient/search')}
          className="group flex items-center w-full h-14 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft hover:shadow-card transition-all cursor-pointer"
        >
          <div className="pl-5 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary font-bold">search</span>
          </div>
          <span className="px-4 text-slate-500 dark:text-slate-400 font-medium">Search for doctors, labs, tests...</span>
        </div>
      </div>

      <section className="px-5 py-4">
        <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-700 shadow-card p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Upcoming Appointment</p>
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Dr. Sarah Johnson</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cardiologist • Video Consult</p>
            </div>
            <div className="size-14 rounded-2xl overflow-hidden shadow-soft ring-4 ring-slate-50 dark:ring-slate-800">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiyJ-grjemAN2JdOUu-LIOeNygdzHgH2c9ITk1tnWYvZTDidnibM1NS3MlQa8bFxdQ0VsjD8erP8RLZ-iIRoYpg2u_Uu3O7bW6Vc4qwzJzCG4CPHkI1UnsTlUNy-HWLgv5GLaXU2hqOrzLvHSqcc1iFNhfsKWhjx6bC6i8rHZzRPP7VaabqGp8GFR5RlHacC91h59r1hTslICNwmyTJ5DlApVCSplCOw5BARIUh1uT2wHAqeJhLquZiIqvr3tnMz9Pp-CPKviN45M" alt="Doctor" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-5">
            <span className="material-symbols-outlined text-primary font-bold">schedule</span>
            <span className="font-bold">Today, 10:30 AM <span className="mx-2 text-slate-300">|</span> 15 mins left</span>
          </div>
          <button className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            Join Video Call
          </button>
        </div>
      </section>

      <section className="px-5 py-4">
        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Medical Services</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: 'medical_services', label: 'Consult', color: 'blue' },
            { icon: 'medication', label: 'Medicine', color: 'emerald' },
            { icon: 'science', label: 'Lab Test', color: 'indigo' },
            { icon: 'emergency', label: 'SOS', color: 'rose' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 group cursor-pointer active:scale-95 transition-all">
              <div className={`flex size-16 items-center justify-center rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/10 text-${item.color}-600 dark:text-${item.color}-400 shadow-sm ring-1 ring-inset ring-${item.color}-500/10`}>
                <span className="material-symbols-outlined text-[30px]">{item.icon}</span>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6">
        <div className="flex items-center justify-between px-5 mb-5">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Specialties</h3>
          <button className="text-sm font-bold text-primary hover:underline">View All</button>
        </div>
        <div className="flex overflow-x-auto gap-5 px-5 pb-4 no-scrollbar">
          {[
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuByR4CXwHsc44gedC43E6H-ISBwKXQkPbVZ0pplD65Gkjn_dGMSpnm6zA54qOSTwMvhpgl3MkGKzvH8tFsjVtfz6z_Ee94Km5-uH-FXGocmjkL3AodUuPVYZVWDolZcdidB3GC1HBbbgaj6xhzaB8prhN8M86yV2Hi2cj6yYUxzak6u3n7ez2BbLG1tBvHfsg3Uy8RNMBjsbXRmQBA21H4iHs7-JvD4r2Ksr0DjmaGnqdKE8pUCxAcwB_bguiH_9dJkCMDBueS7pD0", label: "Dentist" },
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBh-C0eX2ISWttmZN4ImKk06Q9TB_MUpYPfiKHNxV7rC4KGSl8PJ80oix4rv0mGdOa4WA6OkvBtX419ZmxhApCw_5rAgPjhqTNpi4rQUYOsWQxKQVtjsoQ8cMbYdV2yzsC8qJPczd7PNo7uJwYR3QrrSfZ5r_wJIaXFgRPTGS00pmb8U_2FvVKxWVSjqTsNOLl9hGM0CWzD8IaxvuMiWhZQz_u9ylJTp03ZXFJGTEDsTYpRJ1_hyDBFlPdB2bXxZWuw-C_2bqCLavc", label: "Cardio" },
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0D9IHYlKz7rzUfOTQJlLvjnWztLDisNXwPsA25x7cl4-iyBlI0YGtWzn2b_usWnGDKhmmWF3glPOFxqpp3KMJDDtU01VrD9MpW0qfkncJU3eKuFCwXxSiwG2c6lREkP4YJau_zZcKzIA2GmRRZxWUxEpCvZKOl7UP_cj-Taf3wDcJt1bzDEz8KoCqVicnCWkwcyfvJ1B_kDAPxXwp4PVhkM-DphUxiSMvnHltydLPsBIMsJEaetDMdXCHWWVqS_oFsRhOpODtTKs", label: "Physician" }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3 min-w-[80px] shrink-0 group cursor-pointer">
              <div className="size-20 rounded-full p-1 border-2 border-slate-100 dark:border-slate-800 transition-colors group-hover:border-primary shadow-soft">
                <img className="w-full h-full object-cover rounded-full" src={s.img} alt={s.label} />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-6">
        <div className="w-full h-40 rounded-[28px] overflow-hidden relative group cursor-pointer shadow-card border border-slate-100 dark:border-slate-800">
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuChW4-mfRurdP7iFWIGUTRjoduk7fcm_hFUBU4NHyZ-wA2YoZJdaEnI-P8rdAUPkHj3mOmTRaT0VXL3Y6XHWRUBK9u0-ojj87D_mr56rGIHT1cj0gbwU_fMWNAEn3JnbC54s9bwUv7iuzT6xXNNfB_hFQxoqcrWxFAwq080WyoHNSLCBoQYn_609JUsFvrnFJbZzCxs5jIFQ88Iyr7Q9BJNF_6Z2f66QRgUhK0KKBK0FKiyLbpIJjapofZS6OLpNWpzlYti3DtPpsk" 
            alt="Offer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent p-6 flex flex-col justify-center">
            <span className="bg-accent text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full w-fit mb-3 uppercase tracking-wider shadow-sm">Exclusive Offer</span>
            <h3 className="text-white text-xl font-display font-bold leading-tight">Comprehensive <br/>Health Checkup</h3>
            <p className="text-slate-200 text-xs mt-1.5 font-medium opacity-90">Includes 75+ Parameters • Get 50% Cashback</p>
          </div>
        </div>
      </section>

      <BottomNav role="patient" />
    </div>
  );
};

export default PatientDashboard;
