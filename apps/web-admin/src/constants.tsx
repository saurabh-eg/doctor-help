
import { Doctor, Appointment, Transaction, MedicalRecord } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Senior Cardiologist',
    qualifications: ['MBBS', 'MD'],
    experience: 12,
    rating: 4.8,
    patients: '1.5k+',
    fee: 80,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiyJ-grjemAN2JdOUu-LIOeNygdzHgH2c9ITk1tnWYvZTDidnibM1NS3MlQa8bFxdQ0VsjD8erP8RLZ-iIRoYpg2u_Uu3O7bW6Vc4qwzJzCG4CPHkI1UnsTlUNy-HWLgv5GLaXU2hqOrzLvHSqcc1iFNhfsKWhjx6bC6i8rHZzRPP7VaabqGp8GFR5RlHacC91h59r1hTslICNwmyTJ5DlApVCSplCOw5BARIUh1uT2wHAqeJhLquZiIqvr3tnMz9Pp-CPKviN45M',
    available: true,
    nextSlot: 'Today, 4:00 PM'
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    specialty: 'General Physician',
    qualifications: ['MBBS'],
    experience: 8,
    rating: 4.9,
    patients: '800+',
    fee: 50,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDprBxk5OCvTsbBrT41m4H-YAwuP18_as-PjbkdkYfikwC1zhU8YHFUlH1wa6zQXDbuuTU2ATPIyst2ofMvl6p-iT0MpquOyxTWtrJHyOAvOgTBttrRQ-CxJBkfDdQwMWnwpzJRZkco0n7FfPOJyuy_b6ySvl2L21D3FJqY-a4hmhhZ9Vq0k3BPWLMbbc77teSIqMKi6eRJRw9pWEvNWNi9lxOwMTYg_XR31uX8e3X36OnoUrcY1t-MuTRjxCW2gPT4Z6IE8j2x8gE',
    available: true,
    nextSlot: 'Today, 2:00 PM'
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    specialty: 'Pediatrician',
    qualifications: ['MBBS', 'DCH'],
    experience: 10,
    rating: 4.7,
    patients: '1.2k+',
    fee: 60,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuIb8Ib7ekMlFvDRsULgA-oFCDx2B15D4dGUonu6jik-JtvocjMQDWsoyD5cBPzjYHlu5ryEfDrjw8Oscsj6YBMSwZDcRhgYZlOWhcWdfGtCvKvMzDFrNXmF1RIOeKrucYSijeTe0yGDBb5ugpt7sruYhOAMYQTNnC32WqGo4v3_lunxQ-Nh9HYz_t4cejFi1_QYaiH2rW2Y6VnL01TjQCgrYv05GmhLM-8ndLYQ441XmzOODdGlWTrSqLL-7K5p_AYEq7ErRMVK-s',
    available: true,
    nextSlot: 'Today, 5:30 PM'
  }
];

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'ap1',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiologist',
    date: 'Oct 24',
    time: '10:00 AM',
    status: 'confirmed',
    mode: 'video',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF7A7ZGVvJfpMSJ8o8Q85Y3NvT4GwnET5-vMxH0mQ2qk5Nryb7FY2IcR2m1h4z6gfazEhhhNtsNZq18bYWjZVrl2hdKCbMOfTvRBi-pgkaV9WtHU53ebbVMR2ZGNhydtVmbEbK75HBUoiMzByjjo40FOgiRfJvj104qvh2zvw7lJPSutio2mzMPtXrS0MndpAqcvLSyR4oyLx1fO1gJoCDdT9nIDamDwtFtiIfzivFhrbOqKqAAlzAgaOQSQEtE_lCd2yIhWmEQ44'
  }
];

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', title: 'Dr. Smith Consultation', date: 'Today, 10:23 AM', amount: -45.00, type: 'debit', icon: 'medical_services' },
  { id: 't2', title: 'Referral Bonus', date: 'Yesterday, 2:15 PM', amount: 10.00, type: 'credit', icon: 'diversity_3' },
  { id: 't3', title: 'Lab Test Refund', date: 'Mon, 14 Aug', amount: 25.00, type: 'refund', icon: 'assignment_return' }
];

export const RECORDS: MedicalRecord[] = [
  { id: 'r1', title: 'Viral Fever Treatment', provider: 'Dr. Sarah Smith • City Clinic', date: 'Oct 24, 2023', type: 'prescription' },
  { id: 'r2', title: 'Lipid Profile Test', provider: 'Thyrocare Labs', date: 'Sept 10, 2023', type: 'report' },
  { id: 'r3', title: 'MRI Scan - Knee', provider: 'City Hospital Diagnostics', date: 'Aug 15, 2023', type: 'scan' }
];
