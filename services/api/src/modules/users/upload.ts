import express from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse, UploadApiOptions } from 'cloudinary';
import { auth, AuthenticatedRequest } from '../../middleware/auth';
import { User } from '../../models';

const router = express.Router();

// ── Constants ────────────────────────────────────────────────────────
const UPLOAD_TIMEOUT = 30_000; // 30 seconds
const PHOTO_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const PHOTO_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', 'application/octet-stream',
];

// ── Multer instance ──────────────────────────────────────────────────
const photoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: PHOTO_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        if (PHOTO_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${PHOTO_MIME_TYPES.join(', ')}`));
        }
    },
});

// ── Cloudinary config ────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helpers ──────────────────────────────────────────────────────────

/** Resolve the numeric user ID from the JWT or fall back to DB lookup. */
async function resolveNumericUserId(req: AuthenticatedRequest): Promise<number> {
    const { user } = req;
    if (!user || !user.userId) throw new Error('Unauthorized');

    if (user.numericUserId) return user.numericUserId;

    const dbUser = await User.findById(user.userId);
    if (!dbUser?.userId) throw new Error('User numeric ID missing');
    return dbUser.userId;
}

/** Upload a buffer to Cloudinary with a timeout guard. */
function uploadToCloudinary(buffer: Buffer, options: UploadApiOptions): Promise<string> {
    const uploadPromise = new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { ...options, overwrite: true, timeout: UPLOAD_TIMEOUT },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) return reject(error || new Error('Upload failed'));
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timed out')), UPLOAD_TIMEOUT)
    );

    return Promise.race([uploadPromise, timeoutPromise]);
}

// ── Route ────────────────────────────────────────────────────────────

/** Avatar upload: stores in user/{userId}/avatar/avatar.jpg */
router.post('/upload-avatar', auth, (req, res, next) => {
    photoUpload.single('photo')(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            return res.status(400).json({ success: false, error: message });
        }
        next();
    });
}, async (req: AuthenticatedRequest, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    try {
        const numericId = await resolveNumericUserId(req);
        const url = await uploadToCloudinary(file.buffer, {
            folder: `user/${numericId}/avatar`,
            public_id: 'avatar',
            resource_type: 'image',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto' },
            ],
        });

        // Save the avatar URL to the user model
        await User.findByIdAndUpdate(req.user!.userId, { avatar: url });

        return res.json({ success: true, data: { url } });
    } catch (err) {
        console.error('Avatar upload exception:', err);
        const message = err instanceof Error ? err.message : 'Upload failed';
        const status = message === 'Unauthorized' ? 401 : message.includes('numeric ID') ? 400 : 500;
        return res.status(status).json({ success: false, error: message });
    }
});

export { router as userUploadRouter };
