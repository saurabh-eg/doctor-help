
export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar: string;
  walletBalance: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string[];
  experience: number;
  rating: number;
  patients: string;
  fee: number;
  avatar: string;
  available: boolean;
  nextSlot: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  mode: 'video' | 'in-clinic';
  avatar: string;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit' | 'refund';
  icon: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  provider: string;
  date: string;
  type: 'prescription' | 'report' | 'scan' | 'invoice';
}
