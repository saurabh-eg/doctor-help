
import express from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { auth, AuthenticatedRequest } from '../../middleware/auth';
import { User } from '../../models';
import { nanoid } from 'nanoid';
import { Request } from 'express';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary config (read from env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/doctors/upload-photo


// Profile photo upload: stores in doctor/{userId}/profile/profile.jpg
router.post('/upload-photo', auth, upload.single('photo'), async (req: AuthenticatedRequest, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  try {
    // Get userId from JWT (numeric userId)
    const { user } = req;
    if (!user || !user.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    let numericId = user.numericUserId;
    if (!numericId) {
      const dbUser = await User.findById(user.userId);
      numericId = dbUser?.userId;
    }
    if (!numericId) {
      return res.status(400).json({ success: false, error: 'User numeric ID missing' });
    }

    const folder = `doctor/${numericId}/profile`;
    const publicId = 'profile';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
        ],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return res.status(500).json({ success: false, error: error?.message || 'Upload failed' });
        }
        return res.json({ success: true, url: result.secure_url });
      }
    );
    uploadStream.end(file.buffer);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Document upload: stores in doctor/{userId}/documents/{filename}
router.post('/upload-document', auth, upload.single('document'), async (req: AuthenticatedRequest, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  try {
    const { user } = req;
    if (!user || !user.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    let numericId = user.numericUserId;
    if (!numericId) {
      const dbUser = await User.findById(user.userId);
      numericId = dbUser?.userId;
    }
    if (!numericId) {
      return res.status(400).json({ success: false, error: 'User numeric ID missing' });
    }

    const folder = `doctor/${numericId}/documents`;
    const originalName = file.originalname.replace(/\s+/g, '_');
    const publicId = originalName.split('.').slice(0, -1).join('.') || 'document';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto',
        overwrite: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return res.status(500).json({ success: false, error: error?.message || 'Upload failed' });
        }
        return res.json({ success: true, url: result.secure_url });
      }
    );
    uploadStream.end(file.buffer);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

export { router as doctorUploadRouter };
