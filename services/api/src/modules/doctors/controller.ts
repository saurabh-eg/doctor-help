import { Request, Response } from 'express';
import { Doctor, User } from '../../models';

export const listDoctors = async (req: Request, res: Response) => {
    const {
        specialization,
        minRating,
        maxFee,
        page = '1',
        limit = '10'
    } = req.query;

    const filter: any = { isVerified: true };

    if (specialization) filter.specialization = specialization;
    if (minRating) filter.rating = { $gte: parseFloat(minRating as string) };
    if (maxFee) filter.consultationFee = { $lte: parseFloat(maxFee as string) };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
        Doctor.find(filter)
            .populate('userId', 'name phone avatar')
            .skip(skip)
            .limit(limitNum)
            .sort({ rating: -1 }),
        Doctor.countDocuments(filter)
    ]);

    res.json({
        success: true,
        data: doctors,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            hasMore: skip + doctors.length < total
        }
    });
};

export const searchDoctors = async (req: Request, res: Response) => {
    const { q, limit = '10' } = req.query;

    if (!q || (q as string).length < 2) {
        return res.status(400).json({ success: false, error: 'Search query too short' });
    }

    const doctors = await Doctor.find({
        isVerified: true,
        $or: [
            { specialization: { $regex: q as string, $options: 'i' } },
        ]
    })
        .populate('userId', 'name phone avatar')
        .limit(parseInt(limit as string));

    res.json({
        success: true,
        data: doctors
    });
};

export const getDoctor = async (req: Request, res: Response) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate('userId', 'name phone avatar')
        .select('-__v');

    if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.json({
        success: true,
        data: doctor
    });
};

export const registerDoctor = async (req: Request, res: Response) => {
    const {
        userId,
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
    if (existingDoctor) {
        return res.status(400).json({ success: false, error: 'Doctor profile already exists for this user' });
    }

    // Get numeric doctorId from user
    const user = await User.findById(userId);
    let doctorId: number | undefined = undefined;
    if (user && user.userId) {
        doctorId = user.userId;
    }

    // If photoUrl is present, ensure it uses the new upload path (doctor/{doctorId}/profile/profile.jpg)
    let finalPhotoUrl = photoUrl;
    if (doctorId && photoUrl && !photoUrl.includes(`/doctor/${doctorId}/profile/`)) {
        // Optionally rewrite or validate here
        // For now, just keep as is
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

    res.status(201).json({
        success: true,
        message: 'Doctor profile created. Pending verification.',
        data: doctor
    });
};

export const updateAvailability = async (req: Request, res: Response) => {
    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { availableSlots: req.body.slots },
        { new: true }
    );

    if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.json({
        success: true,
        message: 'Availability updated',
        data: { availableSlots: doctor.availableSlots }
    });
};

export const getMetaSpecializations = (req: Request, res: Response) => {
    res.json({
        success: true,
        data: [
            'General Physician',
            'Cardiologist',
            'Dermatologist',
            'Pediatrician',
            'Orthopedist',
            'Neurologist',
            'Psychiatrist',
            'Gynecologist',
            'ENT Specialist',
            'Ophthalmologist',
            'Dentist',
            'Urologist'
        ]
    });
};

// Get doctor profile by user ID (for checking if doctor profile exists)
export const getDoctorByUserId = async (req: Request, res: Response) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.userId })
            .populate('userId', 'name phone avatar')
            .select('-__v');

        // Return success with null data if no doctor found (not an error)
        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to check doctor profile' });
    }
};
