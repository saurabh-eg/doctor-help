import { Router } from 'express';
import * as adminController from './controller';
import { validate } from '../../middleware/validate';
import { auth, authorize } from '../../middleware/auth';
import {
    userFiltersSchema,
    doctorFiltersSchema,
    appointmentFiltersSchema,
    verifyDoctorSchema,
    suspendUserSchema,
    refundSchema,
    statsRangeSchema,
} from './validators';

const router = Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(authorize(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', validate(userFiltersSchema), adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/suspend', validate(suspendUserSchema), adminController.suspendUser);

// Doctors
router.get('/doctors', validate(doctorFiltersSchema), adminController.getDoctors);
router.get('/doctors/pending', adminController.getPendingDoctors);
router.get('/doctors/:id', adminController.getDoctorDetails);
router.patch('/doctors/:id/verify', validate(verifyDoctorSchema), adminController.verifyDoctor);

// Appointments
router.get('/appointments', validate(appointmentFiltersSchema), adminController.getAppointments);
router.get('/appointments/:id', adminController.getAppointmentDetails);
router.patch('/appointments/:id/refund', validate(refundSchema), adminController.processRefund);

// Statistics
router.get('/stats/appointments', validate(statsRangeSchema), adminController.getAppointmentStats);
router.get('/stats/revenue', adminController.getRevenueStats);

export { router as adminRouter };
