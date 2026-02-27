import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../../models/user.model';
import { Doctor } from '../../models/doctor.model';
import { Appointment } from '../../models/appointment.model';
import { escapeRegex } from '../../utils/regex';

/**
 * GET /api/admin/dashboard
 * Platform-wide statistics
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Parallel queries for performance
        const [
            totalUsers,
            totalPatients,
            totalDoctors,
            verifiedDoctors,
            pendingVerifications,
            totalAppointments,
            todayAppointments,
            monthlyAppointments,
            monthlyRevenue,
            lastMonthRevenue,
            recentAppointments,
            appointmentsByStatus,
            appointmentsByType,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'patient' }),
            Doctor.countDocuments(),
            Doctor.countDocuments({ isVerified: true }),
            Doctor.countDocuments({ isVerified: false }),
            Appointment.countDocuments(),
            Appointment.countDocuments({ date: { $gte: startOfToday } }),
            Appointment.countDocuments({ date: { $gte: startOfMonth } }),
            Appointment.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Appointment.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Appointment.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('patientId', 'name phone')
                .populate({
                    path: 'doctorId',
                    populate: { path: 'userId', select: 'name' }
                })
                .lean(),
            Appointment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Appointment.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]),
        ]);

        const currentRevenue = monthlyRevenue[0]?.total || 0;
        const previousRevenue = lastMonthRevenue[0]?.total || 0;
        const revenueGrowth = previousRevenue > 0 
            ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    patients: totalPatients,
                    doctors: totalDoctors,
                },
                doctors: {
                    total: totalDoctors,
                    verified: verifiedDoctors,
                    pendingVerification: pendingVerifications,
                },
                appointments: {
                    total: totalAppointments,
                    today: todayAppointments,
                    thisMonth: monthlyAppointments,
                    byStatus: appointmentsByStatus.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                    byType: appointmentsByType.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                },
                revenue: {
                    thisMonth: currentRevenue,
                    lastMonth: previousRevenue,
                    growth: revenueGrowth,
                },
                recentAppointments,
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
};

/**
 * GET /api/admin/users
 * Paginated user list with filters
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (search) {
            const safe = escapeRegex(String(search));
            query.$or = [
                { name: { $regex: safe, $options: 'i' } },
                { phone: { $regex: safe, $options: 'i' } },
                { email: { $regex: safe, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            User.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

/**
 * GET /api/admin/users/:id
 * User details with appointments
 */
export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Get user's appointments
        const appointments = await Appointment.find({ patientId: id })
            .sort({ date: -1 })
            .limit(10)
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .lean();

        // If doctor, get doctor profile
        let doctorProfile = null;
        if (user.role === 'doctor') {
            doctorProfile = await Doctor.findOne({ userId: id }).lean();
        }

        res.json({
            success: true,
            data: {
                user,
                doctorProfile,
                recentAppointments: appointments,
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user details' });
    }
};

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend or unsuspend a user
 */
export const suspendUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isSuspended, reason } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { 
                isSuspended,
                suspendedReason: reason,
                suspendedAt: isSuspended ? new Date() : null,
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: user,
            message: isSuspended ? 'User suspended successfully' : 'User unsuspended successfully',
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user status' });
    }
};

/**
 * GET /api/admin/doctors
 * Paginated doctor list with optimized aggregation
 */
export const getDoctors = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, specialization, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const pageLimit = Number(limit);

        // Build match stage for aggregation
        const matchStage: any = {};
        
        if (specialization) {
            matchStage.specialization = specialization;
        }
        
        if (status === 'pending') {
            matchStage.isVerified = false;
        } else if (status === 'verified') {
            matchStage.isVerified = true;
        }

        // Use aggregation pipeline for optimized query with search
        const pipeline: any[] = [
            // Lookup user data first
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId',
                    pipeline: [{ $project: { name: 1, phone: 1, email: 1 } }]
                }
            },
            { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        ];

        // Add search filter if provided (searches in user name and specialization)
        if (search) {
            const searchRegex = new RegExp(escapeRegex(String(search)), 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { 'userId.name': searchRegex },
                        { specialization: searchRegex }
                    ]
                }
            });
        }

        // Add other filters
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Get total count with same filters
        const countPipeline = [...pipeline, { $count: 'total' }];
        
        // Add pagination and sorting
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: pageLimit }
        );

        // Execute both queries in parallel
        const [doctors, countResult] = await Promise.all([
            Doctor.aggregate(pipeline),
            Doctor.aggregate(countPipeline)
        ]);

        const total = countResult[0]?.total || 0;

        res.json({
            success: true,
            data: doctors,
            pagination: {
                page: Number(page),
                limit: pageLimit,
                total,
                pages: Math.ceil(total / pageLimit),
            }
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
};

/**
 * GET /api/admin/doctors/pending
 * Doctors pending verification
 */
export const getPendingDoctors = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = { isVerified: false };
        const [doctors, total] = await Promise.all([
            Doctor.find(filter)
                .sort({ createdAt: -1 })
                .populate('userId', 'name phone email')
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Doctor.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: doctors,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            }
        });
    } catch (error) {
        console.error('Get pending doctors error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch pending doctors' });
    }
};

/**
 * GET /api/admin/doctors/:id
 * Doctor details with documents
 */
export const getDoctorDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id)
            .populate('userId', 'name phone email avatar createdAt')
            .lean();

        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        // Get doctor's appointment stats
        const [totalAppointments, completedAppointments, totalEarnings] = await Promise.all([
            Appointment.countDocuments({ doctorId: id }),
            Appointment.countDocuments({ doctorId: id, status: 'completed' }),
            Appointment.aggregate([
                { $match: { doctorId: new mongoose.Types.ObjectId(id), paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
        ]);

        res.json({
            success: true,
            data: {
                ...doctor,
                stats: {
                    totalAppointments,
                    completedAppointments,
                    totalEarnings: totalEarnings[0]?.total || 0,
                }
            }
        });
    } catch (error) {
        console.error('Get doctor details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch doctor details' });
    }
};

/**
 * PATCH /api/admin/doctors/:id/verify
 * Verify or reject a doctor
 */
export const verifyDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isVerified, rejectionReason } = req.body;

        const updateData: any = { 
            isVerified,
            verifiedAt: isVerified ? new Date() : null,
        };

        if (!isVerified && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const doctor = await Doctor.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'name phone email');

        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        res.json({
            success: true,
            data: doctor,
            message: isVerified ? 'Doctor verified successfully' : 'Doctor verification rejected',
        });
    } catch (error) {
        console.error('Verify doctor error:', error);
        res.status(500).json({ success: false, error: 'Failed to update doctor verification' });
    }
};

/**
 * GET /api/admin/appointments
 * Paginated appointment list with filters
 */
export const getAppointments = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, status, type, dateFrom, dateTo, doctorId, patientId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (type && type !== 'all') {
            query.type = type;
        }

        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(String(dateFrom));
            if (dateTo) query.date.$lte = new Date(String(dateTo));
        }

        if (doctorId) {
            query.doctorId = doctorId;
        }

        if (patientId) {
            query.patientId = patientId;
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('patientId', 'name phone')
                .populate({
                    path: 'doctorId',
                    populate: { path: 'userId', select: 'name' }
                })
                .lean(),
            Appointment.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            }
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
    }
};

/**
 * GET /api/admin/appointments/:id
 * Appointment details
 */
export const getAppointmentDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('patientId', 'name phone email avatar')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name phone' }
            })
            .lean();

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch appointment details' });
    }
};

/**
 * PATCH /api/admin/appointments/:id/refund
 * Process refund for an appointment
 */
export const processRefund = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, reason } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        if (appointment.paymentStatus === 'refunded') {
            return res.status(400).json({ success: false, error: 'Appointment already refunded' });
        }

        // Validate payment was actually made
        if (appointment.paymentStatus !== 'paid') {
            return res.status(400).json({ success: false, error: 'Cannot refund an unpaid appointment' });
        }

        // Validate refund amount does not exceed appointment amount
        const refundAmount = Number(amount);
        if (!refundAmount || refundAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid refund amount' });
        }
        if (refundAmount > appointment.amount) {
            return res.status(400).json({
                success: false,
                error: `Refund amount (₹${refundAmount}) exceeds appointment amount (₹${appointment.amount})`
            });
        }

        appointment.paymentStatus = 'refunded';
        appointment.notes = `${appointment.notes || ''}\nRefund: ₹${refundAmount} - ${reason || 'No reason provided'}`;
        await appointment.save();

        res.json({
            success: true,
            data: appointment,
            message: `Refund of ₹${refundAmount} processed successfully`,
        });
    } catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({ success: false, error: 'Failed to process refund' });
    }
};

/**
 * GET /api/admin/stats/appointments
 * Appointment statistics over time
 */
export const getAppointmentStats = async (req: Request, res: Response) => {
    try {
        const { from, to, period = 'month' } = req.query;

        const endDate = to ? new Date(String(to)) : new Date();
        let startDate: Date;
        
        if (from) {
            startDate = new Date(String(from));
        } else {
            startDate = new Date();
            if (period === 'day') startDate.setDate(startDate.getDate() - 7);
            else if (period === 'week') startDate.setDate(startDate.getDate() - 30);
            else if (period === 'month') startDate.setMonth(startDate.getMonth() - 12);
            else startDate.setFullYear(startDate.getFullYear() - 1);
        }

        let groupBy: any;
        if (period === 'day') {
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        } else if (period === 'week') {
            groupBy = { $dateToString: { format: '%Y-W%V', date: '$date' } };
        } else {
            groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
        }

        const stats = await Appointment.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: stats,
            period,
            range: { from: startDate, to: endDate },
        });
    } catch (error) {
        console.error('Get appointment stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch appointment stats' });
    }
};

/**
 * GET /api/admin/stats/revenue
 * Revenue statistics - Optimized single aggregation query
 */
export const getRevenueStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Single aggregation query for all 6 months
        const revenueData = await Appointment.aggregate([
            { 
                $match: { 
                    paymentStatus: 'paid', 
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    appointments: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Create all 6 months with default values
        const months: any[] = [];
        const revenueMap = new Map(
            revenueData.map(r => [`${r._id.year}-${r._id.month}`, r])
        );

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const data = revenueMap.get(key);
            
            months.push({
                month: date.toLocaleString('default', { month: 'short' }),
                revenue: data?.revenue || 0,
                appointments: data?.appointments || 0,
            });
        }

        res.json({
            success: true,
            data: months,
        });
    } catch (error) {
        console.error('Get revenue stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch revenue stats' });
    }
};
