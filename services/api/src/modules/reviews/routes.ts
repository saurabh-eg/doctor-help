import { Router } from 'express';
import { z } from 'zod';
import * as reviewsController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

const createReviewSchema = z.object({
    body: z.object({
        appointmentId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(500).optional(),
    }),
});

// Create a review (authenticated patients only)
router.post('/', auth, validate(createReviewSchema), reviewsController.createReview);

// Get reviews for a doctor (public)
router.get('/doctor/:doctorId', auth, reviewsController.getDoctorReviews);

// Check if review exists for an appointment
router.get('/check/:appointmentId', auth, reviewsController.checkReviewExists);

export const reviewsRouter = router;
