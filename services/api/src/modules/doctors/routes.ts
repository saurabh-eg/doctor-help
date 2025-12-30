import { Router } from 'express';
import { z } from 'zod';
import * as doctorsController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

const registerDoctorSchema = z.object({
    body: z.object({
        userId: z.string(),
        specialization: z.string(),
        qualification: z.string(),
        experience: z.number().min(0),
        consultationFee: z.number().min(0),
        bio: z.string().optional(),
        photoUrl: z.string().url().optional()
    })
});

const availabilitySchema = z.object({
    body: z.object({
        slots: z.array(z.object({
            day: z.number().min(0).max(6),
            startTime: z.string(),
            endTime: z.string()
        }))
    })
});

// Public routes
router.get('/', doctorsController.listDoctors);
router.get('/search', doctorsController.searchDoctors);
router.get('/meta/specializations', doctorsController.getMetaSpecializations);
router.get('/:id', doctorsController.getDoctor);

// Protected routes
router.use(auth);
router.get('/user/:userId', doctorsController.getDoctorByUserId); // Check if doctor profile exists
router.post('/register', validate(registerDoctorSchema), doctorsController.registerDoctor);
router.patch('/:id/availability', validate(availabilitySchema), doctorsController.updateAvailability);

export { router as doctorsRouter };
