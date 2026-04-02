import { Request, Response } from 'express';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { LabRegistrationRequest } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';

const UPLOAD_TIMEOUT = 30_000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

/** POST /api/lab-registrations/upload-document — Upload verification document for lab registration request. */
export const uploadLabRegistrationDocument = async (req: Request, res: Response) => {
    try {
        const file = (req as Request & { file?: Express.Multer.File }).file;
        if (!file) {
            return res.status(400).json({ success: false, error: 'No document uploaded' });
        }

        const rawType = String(req.body?.documentType || 'other').toLowerCase();
        const allowedTypes = ['registration_certificate', 'government_id', 'nabl_certificate', 'pan_card', 'other'];
        const documentType = allowedTypes.includes(rawType) ? rawType : 'other';

        const timestamp = Date.now();
        const url = await uploadToCloudinary(file.buffer, {
            folder: 'lab-registrations/documents',
            public_id: `${documentType}_${timestamp}`,
            resource_type: 'auto',
        });

        return res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                url,
                fileName: file.originalname,
                documentType,
                mimeType: file.mimetype,
                size: file.size,
            },
        });
    } catch (error) {
        console.error('uploadLabRegistrationDocument error:', error);
        return res.status(500).json({ success: false, error: 'Failed to upload document' });
    }
};

/** POST /api/lab-registrations/request — Submit self-registration request for a lab account. */
export const createLabRegistrationRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const authPhone = authReq.user?.phone;
        if (!authPhone) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const {
            labName,
            contactName,
            email,
            address,
            location,
            isNablCertified,
            verificationDocuments,
            notes,
        } = req.body;

        const normalizedPhone = String(authPhone).replace(/\D/g, '');

        const pendingRequest = await LabRegistrationRequest.findOne({
            phone: normalizedPhone,
            status: 'pending',
        }).lean();

        if (pendingRequest) {
            return res.status(409).json({
                success: false,
                error: 'A pending registration request already exists for this phone number',
            });
        }

        if (!Array.isArray(verificationDocuments) || verificationDocuments.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one verification document is required',
            });
        }

        const requestDoc = await LabRegistrationRequest.create({
            labName,
            contactName,
            phone: normalizedPhone,
            email,
            address,
            location,
            isNablCertified,
            verificationDocuments,
            notes,
            status: 'pending',
        });

        return res.status(201).json({
            success: true,
            message: 'Lab registration request submitted successfully',
            data: {
                requestId: requestDoc._id,
                status: requestDoc.status,
            },
        });
    } catch (error) {
        console.error('createLabRegistrationRequest error:', error);
        return res.status(500).json({ success: false, error: 'Failed to submit registration request' });
    }
};
