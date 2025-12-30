
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Auth/Login';
import LanguageSelection from './screens/Auth/LanguageSelection';
import PatientDashboard from './screens/Patient/Dashboard';
import Search from './screens/Patient/Search';
import DoctorProfile from './screens/Patient/DoctorProfile';
import SlotSelection from './screens/Patient/SlotSelection';
import ReviewPay from './screens/Patient/ReviewPay';
import Bookings from './screens/Patient/Bookings';
import Wallet from './screens/Patient/Wallet';
import Records from './screens/Patient/Records';
import Profile from './screens/Patient/Profile';
import Referral from './screens/Patient/Referral';
import LabDetails from './screens/Patient/LabDetails';
import Success from './screens/Patient/Success';
import DoctorDashboard from './screens/Doctor/Dashboard';
import DoctorCalendar from './screens/Doctor/Calendar';
import DoctorEditProfile from './screens/Doctor/EditProfile';
import DoctorVerification from './screens/Doctor/Verification';
import DoctorEarnings from './screens/Doctor/Earnings';
import Notifications from './screens/Common/Notifications';
import VideoCall from './screens/Common/VideoCall';
import { UserRole } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('patient');

  return (
    <Router>
      <div className="mx-auto max-w-md bg-background-light dark:bg-background-dark min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200 dark:border-slate-800">
        <Routes>
          {/* Auth Flow */}
          <Route path="/" element={<Login onLogin={(role) => setUserRole(role)} />} />
          <Route path="/language" element={<LanguageSelection />} />

          {/* Common */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/video-call/:id" element={<VideoCall />} />

          {/* Patient Routes */}
          <Route path="/patient/home" element={<PatientDashboard />} />
          <Route path="/patient/search" element={<Search />} />
          <Route path="/patient/doctor/:id" element={<DoctorProfile />} />
          <Route path="/patient/book/:id" element={<SlotSelection />} />
          <Route path="/patient/review" element={<ReviewPay />} />
          <Route path="/patient/success" element={<Success />} />
          <Route path="/patient/bookings" element={<Bookings />} />
          <Route path="/patient/wallet" element={<Wallet />} />
          <Route path="/patient/records" element={<Records />} />
          <Route path="/patient/profile" element={<Profile />} />
          <Route path="/patient/referral" element={<Referral />} />
          <Route path="/patient/lab/:id" element={<LabDetails />} />

          {/* Doctor Routes */}
          <Route path="/doctor/home" element={<DoctorDashboard />} />
          <Route path="/doctor/calendar" element={<DoctorCalendar />} />
          <Route path="/doctor/edit-profile" element={<DoctorEditProfile />} />
          <Route path="/doctor/verify" element={<DoctorVerification />} />
          <Route path="/doctor/earnings" element={<DoctorEarnings />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
