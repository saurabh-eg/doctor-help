import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { auth, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as labProviderController from './controller';

const router = Router();

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const listOrdersSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
});

const idParamsSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
});

const listCatalogSchema = z.object({
    query: z.object({
        includeInactive: z.string().optional(),
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
});

const createCatalogTestSchema = z.object({
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
    params: z.object({}).optional(),
});

const updateCatalogTestSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        code: z.string().min(2).optional(),
        name: z.string().min(2).optional(),
        category: z.string().optional(),
        price: z.number().nonnegative().optional(),
        discountedPrice: z.number().nonnegative().nullable().optional(),
        preparationInstructions: z.array(z.string()).optional(),
        fastingHours: z.number().nonnegative().nullable().optional(),
        sampleType: z.string().nullable().optional(),
        turnaroundHours: z.number().positive().nullable().optional(),
        isActive: z.boolean().optional(),
    }).refine((value) => Object.keys(value).length > 0, {
        message: 'At least one test field must be provided',
    }),
    query: z.object({}).optional(),
});

const createCatalogPackageSchema = z.object({
    body: z.object({
        code: z.string().min(2),
        name: z.string().min(2),
        description: z.string().optional(),
        testIds: z.array(objectIdSchema).min(1),
        price: z.number().nonnegative(),
        discountedPrice: z.number().nonnegative().optional(),
        preparationInstructions: z.array(z.string()).optional().default([]),
        isActive: z.boolean().optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

const updateCatalogPackageSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        code: z.string().min(2).optional(),
        name: z.string().min(2).optional(),
        description: z.string().nullable().optional(),
        testIds: z.array(objectIdSchema).min(1).optional(),
        price: z.number().nonnegative().optional(),
        discountedPrice: z.number().nonnegative().nullable().optional(),
        preparationInstructions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }).refine((value) => Object.keys(value).length > 0, {
        message: 'At least one package field must be provided',
    }),
    query: z.object({}).optional(),
});

const updateProfileSchema = z.object({
    body: z.object({
        contactName: z.string().min(2).max(100).optional(),
        labName: z.string().min(2).max(200).optional(),
        phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional(),
        email: z.string().email().optional(),
        address: z.object({
            line1: z.string().min(3),
            city: z.string().min(2),
            state: z.string().min(2),
            pincode: z.string().min(4),
        }).optional(),
    }).refine((value) => Object.keys(value).length > 0, {
        message: 'At least one profile field must be provided',
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

const updateStatusSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        status: z.enum([
            'confirmed',
            'collector_assigned',
            'collector_on_the_way',
            'sample_collected',
            'processing',
            'report_ready',
            'completed',
        ]),
    }),
    query: z.object({}).optional(),
});

const assignCollectorSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        collectorName: z.string().min(2).max(100),
        collectorPhone: z.string().min(8).max(20),
        collectorEta: z.string().datetime().optional(),
    }),
    query: z.object({}).optional(),
});

const escalateOrderSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        escalationReason: z.string().min(5).max(1000),
    }),
    query: z.object({}).optional(),
});

const uploadReportParamsSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
});

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

router.use(auth);
router.use(authorize(['lab']));

router.get('/profile', labProviderController.getMyLabProfile);
router.patch('/profile', validate(updateProfileSchema), labProviderController.updateMyLabProfile);
router.get('/dashboard', labProviderController.getLabDashboard);
router.get('/catalog', validate(listCatalogSchema), labProviderController.getMyLabCatalog);
router.post('/catalog/tests', validate(createCatalogTestSchema), labProviderController.createMyLabTest);
router.patch('/catalog/tests/:id', validate(updateCatalogTestSchema), labProviderController.updateMyLabTest);
router.post('/catalog/packages', validate(createCatalogPackageSchema), labProviderController.createMyLabPackage);
router.patch('/catalog/packages/:id', validate(updateCatalogPackageSchema), labProviderController.updateMyLabPackage);
router.get('/orders', validate(listOrdersSchema), labProviderController.getMyLabOrders);
router.get('/orders/:id', validate(idParamsSchema), labProviderController.getMyLabOrderById);
router.patch('/orders/:id/status', validate(updateStatusSchema), labProviderController.updateMyLabOrderStatus);
router.patch('/orders/:id/collector', validate(assignCollectorSchema), labProviderController.assignMyLabOrderCollector);
router.patch('/orders/:id/escalate', validate(escalateOrderSchema), labProviderController.escalateMyLabOrder);
router.post(
    '/orders/:id/report',
    validate(uploadReportParamsSchema),
    (req, res, next) => {
        reportUpload.single('report')(req, res, (err) => {
            if (err) {
                const message = err instanceof Error ? err.message : 'Report upload failed';
                return res.status(400).json({ success: false, error: message });
            }
            return next();
        });
    },
    labProviderController.uploadMyLabOrderReport
);

export { router as labProviderRouter };
