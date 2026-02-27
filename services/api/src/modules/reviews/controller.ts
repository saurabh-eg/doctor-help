import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { Review } from '../../models/review.model';
import { Doctor } from '../../models/doctor.model';
import { Appointment } from '../../models/appointment.model';

/**
 * POST /api/reviews
 * Create a review for a completed appointment.
 * Only the patient who had the appointment can review, and only once.
 */
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        const userId = req.user!.userId;

        // Verify appointment exists and belongs to this patient
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        if (appointment.patientId.toString() !== userId) {
            return res.status(403).json({ success: false, error: 'You can only review your own appointments' });
        }
        if (appointment.status !== 'completed') {
            return res.status(400).json({ success: false, error: 'You can only review completed appointments' });
        }

        // Check if already reviewed
        const existing = await Review.findOne({ appointmentId });
        if (existing) {
            return res.status(400).json({ success: false, error: 'You have already reviewed this appointment' });
        }

        const review = await Review.create({
            appointmentId,
            patientId: userId,
            doctorId: appointment.doctorId,
            rating,
            comment: comment?.trim() || undefined,
        });

        // Update doctor's average rating
        const stats = await Review.aggregate([
            { $match: { doctorId: appointment.doctorId } },
            {
                $group: {
                    _id: '$doctorId',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ]);

        if (stats.length > 0) {
            await Doctor.findByIdAndUpdate(appointment.doctorId, {
                rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
                reviewCount: stats[0].count,
            });
        }

        // Populate patient info before returning
        const populated = await Review.findById(review._id)
            .populate('patientId', 'name avatar')
            .lean();

        res.status(201).json({ success: true, data: populated });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'You have already reviewed this appointment' });
        }
        console.error('Create review error:', error);
        res.status(500).json({ success: false, error: 'Failed to create review' });
    }
};

/**
 * GET /api/reviews/doctor/:doctorId
 * Get all reviews for a doctor, sorted by newest first.
 */
export const getDoctorReviews = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ doctorId })
                .populate('patientId', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ doctorId }),
        ]);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get doctor reviews error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
    }
};

/**
 * GET /api/reviews/check/:appointmentId
 * Check if a review already exists for an appointment.
 */
export const checkReviewExists = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { appointmentId } = req.params;
        const review = await Review.findOne({ appointmentId }).lean();

        res.json({
            success: true,
            data: {
                hasReview: !!review,
                review: review || null,
            },
        });
    } catch (error) {
        console.error('Check review error:', error);
        res.status(500).json({ success: false, error: 'Failed to check review' });
    }
};
