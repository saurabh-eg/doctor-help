import { Request, Response } from 'express';
import { Doctor, User } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';
import { VALID_SPECIALIZATIONS } from './routes';
import { escapeRegex } from '../../utils/regex';
import { PAGINATION } from '../../utils/pagination';

/** GET /api/doctors — List verified doctors with optional filters and pagination. */
export const listDoctors = async (req: Request, res: Response) => {
    try {
        const {
            specialization,
            minRating,
            maxFee,
            page = '1',
            limit = String(PAGINATION.DEFAULT_LIMIT)
        } = req.query;

        const filter: any = { isVerified: true };

        if (specialization) filter.specialization = specialization;
        if (minRating) filter.rating = { $gte: parseFloat(minRating as string) };
        if (maxFee) filter.consultationFee = { $lte: parseFloat(maxFee as string) };

        const pageNum = parseInt(page as string) || PAGINATION.DEFAULT_PAGE;
        const limitNum = Math.min(parseInt(limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const skip = (pageNum - 1) * limitNum;

        const [doctors, total] = await Promise.all([
            Doctor.find(filter)
                .populate('userId', 'name phone avatar')
                .skip(skip)
                .limit(limitNum)
                .sort({ rating: -1 })
                .lean(),
            Doctor.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: doctors,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
                hasMore: skip + doctors.length < total
            }
        });
    } catch (error) {
        console.error('listDoctors error:', error);
        res.status(500).json({ success: false, error: 'Failed to list doctors' });
    }
};

/** GET /api/doctors/search — Full-text search across doctor names and specializations. */
export const searchDoctors = async (req: Request, res: Response) => {
    try {
        const { q, page = '1', limit = String(PAGINATION.DEFAULT_LIMIT) } = req.query;

        if (!q || (q as string).length < 2) {
            return res.status(400).json({ success: false, error: 'Search query too short' });
        }

        const pageNum = parseInt(page as string) || PAGINATION.DEFAULT_PAGE;
        const limitNum = Math.min(parseInt(limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const skip = (pageNum - 1) * limitNum;

        const regex = new RegExp(escapeRegex(q as string), 'i');

        // Find users whose name matches to include doctor matches by user
        const matchedUsers = await User.find({ name: { $regex: regex } }).select('_id');
        const matchedUserIds = matchedUsers.map(u => u._id);

        const searchFilter = {
            isVerified: true,
            $or: [
                { specialization: { $regex: regex } },
                { userId: { $in: matchedUserIds } }
            ]
        };

        const [doctors, total] = await Promise.all([
            Doctor.find(searchFilter)
                .populate('userId', 'name phone avatar')
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Doctor.countDocuments(searchFilter)
        ]);

        res.json({
            success: true,
            data: doctors,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
                hasMore: skip + doctors.length < total
            }
        });
    } catch (error) {
        console.error('searchDoctors error:', error);
        res.status(500).json({ success: false, error: 'Failed to search doctors' });
    }
};

/** GET /api/doctors/:id — Get a single doctor profile by ID. */
export const getDoctor = async (req: Request, res: Response) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'name phone avatar')
            .select('-__v')
            .lean();

        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('getDoctor error:', error);
        res.status(500).json({ success: false, error: 'Failed to get doctor' });
    }
};

/** POST /api/doctors/register — Create or update a doctor profile (requires auth). */
export const registerDoctor = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const authenticatedUserId = authReq.user?.userId;

        // Use the authenticated user's ID instead of trusting req.body.userId
        const userId = authenticatedUserId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const {
            specialization,
            qualification,
            experience,
            consultationFee,
            bio,
            photoUrl,
            documents
        } = req.body;

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId });

    // Get numeric doctorId from user
    const user = await User.findById(userId);
    let doctorId: number | undefined = undefined;
    if (user && user.userId) {
        doctorId = user.userId;
    }

    // If photoUrl is present, ensure it uses the new upload path (doctor/{doctorId}/profile/profile.jpg)
    let finalPhotoUrl = photoUrl;

    if (existingDoctor) {
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            existingDoctor._id,
            {
                specialization,
                qualification,
                experience,
                consultationFee,
                bio,
                photoUrl: finalPhotoUrl,
                documents: documents || [],
                doctorId: doctorId ?? existingDoctor.doctorId,
                isVerified: false,
                rejectionReason: undefined
            },
            { new: true }
        );

        return res.json({
            success: true,
            message: 'Doctor profile updated. Pending verification.',
            data: updatedDoctor
        });
    }

    const doctor = await Doctor.create({
        userId,
        doctorId,
        specialization,
        qualification,
        experience,
        consultationFee,
        bio,
        photoUrl: finalPhotoUrl,
        documents: documents || [],
        isVerified: false // Admin needs to verify
    });

    return res.status(201).json({
        success: true,
        message: 'Doctor profile created. Pending verification.',
        data: doctor
    });
    } catch (error) {
        console.error('registerDoctor error:', error);
        res.status(500).json({ success: false, error: 'Failed to register doctor' });
    }
};

/** PUT /api/doctors/:id/availability — Update a doctor's available time slots (owner or admin). */
export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const doctorId = req.params.id;

        // Verify the authenticated user owns this doctor profile
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        if (doctor.userId.toString() !== authReq.user?.userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'You can only update your own availability' });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { availableSlots: req.body.slots },
            { new: true }
        )
            .populate('userId', 'name phone avatar')
            .select('-__v');

        res.json({
            success: true,
            message: 'Availability updated',
            data: updatedDoctor
        });
    } catch (error) {
        console.error('updateAvailability error:', error);
        res.status(500).json({ success: false, error: 'Failed to update availability' });
    }
};

/** PUT /api/doctors/:id — Update a doctor's profile fields (owner or admin). */
export const updateDoctorProfile = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const doctorId = req.params.id;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        // Only the owner or admin can update
        if (doctor.userId.toString() !== authReq.user?.userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'You can only update your own profile' });
        }

        const { specialization, qualification, experience, consultationFee, bio } = req.body;
        const safeUpdate: Record<string, any> = {};
        if (specialization !== undefined) safeUpdate.specialization = specialization;
        if (qualification !== undefined) safeUpdate.qualification = qualification;
        if (experience !== undefined) safeUpdate.experience = experience;
        if (consultationFee !== undefined) safeUpdate.consultationFee = consultationFee;
        if (bio !== undefined) safeUpdate.bio = bio;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { $set: safeUpdate },
            { new: true }
        )
            .populate('userId', 'name phone avatar')
            .select('-__v');

        res.json({
            success: true,
            message: 'Doctor profile updated',
            data: updatedDoctor
        });
    } catch (error) {
        console.error('updateDoctorProfile error:', error);
        res.status(500).json({ success: false, error: 'Failed to update doctor profile' });
    }
};

/** GET /api/doctors/meta/specializations — Return valid specialization options. */
export const getMetaSpecializations = (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: [...VALID_SPECIALIZATIONS]
    });
};

/** GET /api/doctors/user/:userId — Look up a doctor profile by the owning user ID. */
export const getDoctorByUserId = async (req: Request, res: Response) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.userId })
            .populate('userId', 'name phone avatar')
            .select('-__v')
            .lean();

        // Return success with null data if no doctor found (not an error)
        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('getDoctorByUserId error:', error);
        res.status(500).json({ success: false, error: 'Failed to check doctor profile' });
    }
};
