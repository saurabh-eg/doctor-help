import { Router } from 'express';
import { z } from 'zod';
import * as labOrdersController from './controller';
import { validate } from '../../middleware/validate';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const createLabOrderSchema = z.object({
    body: z.object({
        labId: objectIdSchema,
        testIds: z.array(objectIdSchema).optional().default([]),
        packageIds: z.array(objectIdSchema).optional().default([]),
        patientProfile: z.object({
            name: z.string().min(2),
            age: z.number().int().min(0).max(120),
            gender: z.enum(['male', 'female', 'other']),
            relationship: z.string().optional(),
        }),
        prescriptionUrl: z.string().url().optional(),
        slotDate: z.string(),
        slotTime: z.string().min(2),
        homeCollection: z.boolean().optional().default(true),
        address: z.string().min(5),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

const listOrdersSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        status: z.string().optional(),
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
});

const getByIdSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
});

const updateStatusSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        status: z.enum([
            'created',
            'payment_pending',
            'confirmed',
            'collector_assigned',
            'collector_on_the_way',
            'sample_collected',
            'processing',
            'report_ready',
            'completed',
            'cancelled',
        ]),
    }),
    query: z.object({}).optional(),
});

router.use(auth);

router.post('/', validate(createLabOrderSchema), labOrdersController.createLabOrder);
router.get('/my', validate(listOrdersSchema), labOrdersController.getMyLabOrders);
router.get('/:id', validate(getByIdSchema), labOrdersController.getLabOrderById);
router.post('/:id/cancel', validate(getByIdSchema), labOrdersController.cancelMyLabOrder);
router.patch('/:id/status', authorize(['admin']), validate(updateStatusSchema), labOrdersController.updateLabOrderStatus);

export { router as labOrdersRouter };
