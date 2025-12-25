import { Elysia, t } from 'elysia';
import { Doctor, User } from '../../models';

export const doctorsModule = new Elysia({ prefix: '/doctors' })

    // List doctors with filters
    .get('/', async ({ query }) => {
        const {
            specialization,
            minRating,
            maxFee,
            page = '1',
            limit = '10'
        } = query;

        const filter: any = { isVerified: true };

        if (specialization) filter.specialization = specialization;
        if (minRating) filter.rating = { $gte: parseFloat(minRating) };
        if (maxFee) filter.consultationFee = { $lte: parseFloat(maxFee) };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [doctors, total] = await Promise.all([
            Doctor.find(filter)
                .populate('userId', 'name phone avatar')
                .skip(skip)
                .limit(limitNum)
                .sort({ rating: -1 }),
            Doctor.countDocuments(filter)
        ]);

        return {
            success: true,
            data: doctors,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                hasMore: skip + doctors.length < total
            }
        };
    })

    // Search doctors
    .get('/search', async ({ query }) => {
        const { q, limit = '10' } = query;

        if (!q || q.length < 2) {
            return { success: false, error: 'Search query too short' };
        }

        const doctors = await Doctor.find({
            isVerified: true,
            $or: [
                { specialization: { $regex: q, $options: 'i' } },
            ]
        })
            .populate('userId', 'name phone avatar')
            .limit(parseInt(limit));

        return {
            success: true,
            data: doctors
        };
    })

    // Get doctor by ID
    .get('/:id', async ({ params }) => {
        const doctor = await Doctor.findById(params.id)
            .populate('userId', 'name phone email avatar');

        if (!doctor) {
            return { success: false, error: 'Doctor not found' };
        }

        return {
            success: true,
            data: doctor
        };
    })

    // Register as doctor (after selecting doctor role)
    .post('/register', async ({ body }) => {
        const {
            userId,
            specialization,
            qualification,
            experience,
            consultationFee,
            bio
        } = body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Update user role
        user.role = 'doctor';
        await user.save();

        // Create doctor profile
        const doctor = await Doctor.create({
            userId,
            specialization,
            qualification,
            experience,
            consultationFee,
            bio,
            isVerified: false // Admin needs to verify
        });

        return {
            success: true,
            message: 'Doctor profile created. Pending verification.',
            data: doctor
        };
    }, {
        body: t.Object({
            userId: t.String(),
            specialization: t.String(),
            qualification: t.String(),
            experience: t.Number({ minimum: 0 }),
            consultationFee: t.Number({ minimum: 0 }),
            bio: t.Optional(t.String())
        })
    })

    // Update availability slots
    .patch('/:id/availability', async ({ params, body }) => {
        const doctor = await Doctor.findByIdAndUpdate(
            params.id,
            { availableSlots: body.slots },
            { new: true }
        );

        if (!doctor) {
            return { success: false, error: 'Doctor not found' };
        }

        return {
            success: true,
            message: 'Availability updated',
            data: { availableSlots: doctor.availableSlots }
        };
    }, {
        body: t.Object({
            slots: t.Array(t.Object({
                day: t.Number({ minimum: 0, maximum: 6 }),
                startTime: t.String(),
                endTime: t.String()
            }))
        })
    })

    // Get specializations list
    .get('/meta/specializations', () => {
        return {
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
        };
    });
