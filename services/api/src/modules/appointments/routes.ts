import { Router } from 'express';
import { z } from 'zod';
import * as appointmentsController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

const createAppointmentSchema = z.object({
    body: z.object({
        patientId: z.string().optional(),
        doctorId: z.string(),
        date: z.string(),
        timeSlot: z.object({
            start: z.string(),
            end: z.string()
        }),
        type: z.enum(['video', 'clinic', 'home']),
        symptoms: z.string().optional()
    })
});

const updateStatusSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    })
});

const updateNotesSchema = z.object({
    body: z.object({
        notes: z.string().optional(),
        prescription: z.string().optional()
    })
});

const rescheduleSchema = z.object({
    body: z.object({
        date: z.string(),
        timeSlot: z.object({
            start: z.string(),
            end: z.string()
        })
    })
});

router.use(auth);

router.post('/', validate(createAppointmentSchema), appointmentsController.createAppointment);
router.get('/patient/:patientId', appointmentsController.getPatientAppointments);
router.get('/doctor/:doctorId', appointmentsController.getDoctorAppointments);
router.patch('/:id/status', validate(updateStatusSchema), appointmentsController.updateStatus);
router.patch('/:id/notes', validate(updateNotesSchema), appointmentsController.updateNotes);
router.patch('/:id/reschedule', validate(rescheduleSchema), appointmentsController.rescheduleAppointment);
router.post('/:id/cancel', appointmentsController.cancelAppointment);

export { router as appointmentsRouter };
