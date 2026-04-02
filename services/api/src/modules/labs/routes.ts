import { Router } from 'express';
import { z } from 'zod';
import * as labsController from './controller';
import { validate } from '../../middleware/validate';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const listLabsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
});

const createLabSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        phone: z.string().min(10),
        email: z.string().email().optional(),
        address: z.object({
            line1: z.string().min(3),
            city: z.string().min(2),
            state: z.string().min(2),
            pincode: z.string().min(4),
        }),
        location: z.object({
            type: z.literal('Point'),
            coordinates: z.tuple([z.number(), z.number()]),
        }),
        isNablCertified: z.boolean().optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

const createLabTestSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        code: z.string().min(2),
        name: z.string().min(2),
        category: z.string().optional(),
        price: z.number().nonnegative(),
        discountedPrice: z.number().nonnegative().optional(),
        preparationInstructions: z.array(z.string()).optional().default([]),
        fastingHours: z.number().nonnegative().optional(),
        sampleType: z.string().optional(),
        turnaroundHours: z.number().positive().optional(),
        isActive: z.boolean().optional(),
    }),
    query: z.object({}).optional(),
});

const createLabPackageSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        code: z.string().min(2),
        name: z.string().min(2),
        description: z.string().optional(),
        items: z.array(z.object({
            testId: objectIdSchema,
            nameSnapshot: z.string().min(2),
        })).min(1),
        price: z.number().nonnegative(),
        discountedPrice: z.number().nonnegative().optional(),
        preparationInstructions: z.array(z.string()).optional().default([]),
        isActive: z.boolean().optional(),
    }),
    query: z.object({}).optional(),
});

const getByIdSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
});

const compareTestsSchema = z.object({
    params: z.object({
        testName: z.string().min(1),
    }),
    query: z.object({
        lat: z.string().optional(),
        lng: z.string().optional(),
    }).optional(),
    body: z.object({}).optional(),
});

router.get('/', validate(listLabsSchema), labsController.listLabs);
router.get('/compare/tests/:testName', validate(compareTestsSchema), labsController.compareTestPrices);
router.get('/:id', validate(getByIdSchema), labsController.getLabById);
router.get('/:id/catalog', validate(getByIdSchema), labsController.getLabCatalog);

router.post('/', auth, authorize(['admin']), validate(createLabSchema), labsController.createLab);
router.post('/:id/tests', auth, authorize(['admin']), validate(createLabTestSchema), labsController.createLabTest);
router.post('/:id/packages', auth, authorize(['admin']), validate(createLabPackageSchema), labsController.createLabPackage);

export { router as labsRouter };
