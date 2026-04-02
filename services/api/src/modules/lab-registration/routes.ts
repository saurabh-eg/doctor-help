import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import * as labRegistrationController from './controller';

const router = Router();
const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;
const DOCUMENT_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/octet-stream',
];

const documentUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: DOCUMENT_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        if (DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${DOCUMENT_MIME_TYPES.join(', ')}`));
        }
    },
});

const createLabRegistrationRequestSchema = z.object({
    body: z.object({
        labName: z.string().min(2),
        contactName: z.string().min(2),
        email: z.string().email().optional(),
        address: z.object({
            line1: z.string().min(3),
            city: z.string().min(2),
            state: z.string().min(2),
            pincode: z.string().min(4),
        }),
        location: z.object({
            type: z.literal('Point'),
            coordinates: z
                .tuple([z.number(), z.number()])
                .refine(
                    ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
                    'Invalid coordinates. Expected [longitude, latitude] within geo bounds'
                ),
        }),
        isNablCertified: z.boolean().optional().default(false),
        verificationDocuments: z.array(z.object({
            documentType: z.enum(['registration_certificate', 'government_id', 'nabl_certificate', 'pan_card', 'other']),
            documentUrl: z.string().url(),
            originalFileName: z.string().optional(),
            uploadedAt: z.string().datetime().optional(),
        })).min(1, 'At least one verification document is required'),
        notes: z.string().max(1000).optional(),
    }),
});

router.post('/upload-document', auth, (req, res, next) => {
    documentUpload.single('document')(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : 'Document upload failed';
            return res.status(400).json({ success: false, error: message });
        }
        return next();
    });
}, labRegistrationController.uploadLabRegistrationDocument);

router.post('/request', auth, validate(createLabRegistrationRequestSchema), labRegistrationController.createLabRegistrationRequest);

export { router as labRegistrationRouter };
