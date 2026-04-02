import express from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { auth, AuthenticatedRequest } from '../../middleware/auth';
import { User } from '../../models';

const router = express.Router();

const UPLOAD_TIMEOUT = 30_000;
const PRESCRIPTION_MAX_SIZE = 10 * 1024 * 1024;
const PRESCRIPTION_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/octet-stream',
];

const prescriptionUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: PRESCRIPTION_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        if (PRESCRIPTION_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${PRESCRIPTION_MIME_TYPES.join(', ')}`));
        }
    },
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function resolveNumericUserId(req: AuthenticatedRequest): Promise<number> {
    const { user } = req;
    if (!user || !user.userId) {
        throw new Error('Unauthorized');
    }

    if (user.numericUserId) {
        return user.numericUserId;
    }

    const dbUser = await User.findById(user.userId);
    if (!dbUser?.userId) {
        throw new Error('User numeric ID missing');
    }

    return dbUser.userId;
}

function uploadToCloudinary(buffer: Buffer, options: UploadApiOptions): Promise<string> {
    const uploadPromise = new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { ...options, overwrite: false, timeout: UPLOAD_TIMEOUT },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) {
                    return reject(error || new Error('Upload failed'));
                }
                return resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timed out')), UPLOAD_TIMEOUT)
    );

    return Promise.race([uploadPromise, timeoutPromise]);
}

router.post('/upload-prescription', auth, (req, res, next) => {
    prescriptionUpload.single('prescription')(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            return res.status(400).json({ success: false, error: message });
        }
        return next();
    });
}, async (req: AuthenticatedRequest, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    try {
        const numericUserId = await resolveNumericUserId(req);
        const timestamp = Date.now();
        const url = await uploadToCloudinary(file.buffer, {
            folder: `user/${numericUserId}/lab-orders/prescriptions`,
            public_id: `prescription_${timestamp}`,
            resource_type: 'auto',
        });

        return res.json({
            success: true,
            data: { url },
        });
    } catch (err) {
        console.error('Prescription upload exception:', err);
        const message = err instanceof Error ? err.message : 'Upload failed';
        const status = message === 'Unauthorized' ? 401 : message.includes('numeric ID') ? 400 : 500;
        return res.status(status).json({ success: false, error: message });
    }
});

export { router as labOrderUploadRouter };
