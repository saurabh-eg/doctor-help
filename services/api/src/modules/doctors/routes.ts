import { Router } from 'express';
import { z } from 'zod';
import * as doctorsController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

// IMPORTANT: Keep in sync with AppConstants.specialties in
// apps/flutter_app/lib/config/constants.dart
export const VALID_SPECIALIZATIONS = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
    'Orthopedist', 'Neurologist', 'Psychiatrist', 'Gynecologist',
    'ENT Specialist', 'Ophthalmologist', 'Dentist', 'Urologist'
] as const;

const registerDoctorSchema = z.object({
    body: z.object({
        userId: z.string().optional(), // Ignored — authenticated user's ID is used instead
        specialization: z.enum(VALID_SPECIALIZATIONS),
        qualification: z.string(),
        experience: z.number().min(0),
        consultationFee: z.number().min(0),
        licenseNumber: z.string().min(1).optional(),
        bio: z.string().optional(),
        photoUrl: z.string().url().optional(),
        documents: z.array(z.string()).optional()
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

const updateDoctorProfileSchema = z.object({
    body: z.object({
        specialization: z.enum(VALID_SPECIALIZATIONS).optional(),
        qualification: z.string().optional(),
        experience: z.number().min(0).optional(),
        consultationFee: z.number().min(0).optional(),
        bio: z.string().optional()
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
router.patch('/:id/profile', validate(updateDoctorProfileSchema), doctorsController.updateDoctorProfile);
router.patch('/:id/availability', validate(availabilitySchema), doctorsController.updateAvailability);

export { router as doctorsRouter };
