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
        role: z.enum(['patient', 'doctor']).optional()
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
router.post('/:id/role', validate(setRoleSchema), usersController.setRole);

export { router as usersRouter };
