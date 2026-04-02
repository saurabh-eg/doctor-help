import { Router } from 'express';
import multer from 'multer';
import * as adminController from './controller';
import { validate } from '../../middleware/validate';
import { auth, authorize } from '../../middleware/auth';
import {
    userFiltersSchema,
    doctorFiltersSchema,
    labFiltersSchema,
    appointmentFiltersSchema,
    verifyDoctorSchema,
    suspendUserSchema,
    labStatusUpdateSchema,
    refundSchema,
    statsRangeSchema,
    labOrderFiltersSchema,
    labOrderStatusUpdateSchema,
    labOrderCollectorAssignSchema,
    labOrderReportUploadParamsSchema,
    labRegistrationRequestFiltersSchema,
    labRegistrationDecisionSchema,
} from './validators';

const router = Router();
const reportUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF reports are allowed'));
        }
    },
});

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

// Labs
router.get('/labs', validate(labFiltersSchema), adminController.getLabs);
router.patch('/labs/:id/status', validate(labStatusUpdateSchema), adminController.updateLabStatus);

// Appointments
router.get('/appointments', validate(appointmentFiltersSchema), adminController.getAppointments);
router.get('/appointments/:id', adminController.getAppointmentDetails);
router.patch('/appointments/:id/refund', validate(refundSchema), adminController.processRefund);

// Lab Orders
router.get('/lab-orders', validate(labOrderFiltersSchema), adminController.getLabOrders);
router.get('/lab-orders/:id', adminController.getLabOrderDetails);
router.patch('/lab-orders/:id/status', validate(labOrderStatusUpdateSchema), adminController.updateLabOrderStatusAdmin);
router.patch('/lab-orders/:id/collector', validate(labOrderCollectorAssignSchema), adminController.assignLabCollectorAdmin);
router.post(
    '/lab-orders/:id/report',
    (req, res, next) => {
        reportUpload.single('report')(req, res, (err) => {
            if (err) {
                const message = err instanceof Error ? err.message : 'Report upload failed';
                return res.status(400).json({ success: false, error: message });
            }
            return next();
        });
    },
    validate(labOrderReportUploadParamsSchema),
    adminController.uploadLabReportAdmin
);

// Lab Registration Requests
router.get(
    '/lab-registration-requests',
    validate(labRegistrationRequestFiltersSchema),
    adminController.getLabRegistrationRequests
);
router.patch(
    '/lab-registration-requests/:id/decision',
    validate(labRegistrationDecisionSchema),
    adminController.reviewLabRegistrationRequest
);

// Statistics
router.get('/stats/appointments', validate(statsRangeSchema), adminController.getAppointmentStats);
router.get('/stats/revenue', adminController.getRevenueStats);

export { router as adminRouter };
