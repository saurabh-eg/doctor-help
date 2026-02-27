import { Router } from 'express';
import { z } from 'zod';
import * as usersController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

const updateUserSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        avatar: z.string().optional(),
        address: z.string().optional()
    })
});

const completeProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format').optional()
    })
});

const setRoleSchema = z.object({
    body: z.object({
        role: z.enum(['patient', 'doctor'])
    })
});

router.use(auth); // Protect all user routes

router.get('/:id', usersController.getUser);
router.patch('/:id', validate(updateUserSchema), usersController.updateUser);
router.post('/:id/complete-profile', validate(completeProfileSchema), usersController.completeProfile);
router.post('/:id/role', validate(setRoleSchema), usersController.setRole);

export { router as usersRouter };
