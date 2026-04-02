import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { User } from '../../models/user.model';
import { Doctor } from '../../models/doctor.model';
import { Appointment } from '../../models/appointment.model';
import { LabOrder } from '../../models/lab-order.model';
import { Lab } from '../../models/lab.model';
import { LabTest } from '../../models/lab-test.model';
import { LabPackage } from '../../models/lab-package.model';
import { AdminAuditLog } from '../../models/admin-audit-log.model';
import { LabRegistrationRequest } from '../../models/lab-registration-request.model';
import { Counter } from '../../models/counter.model';
import { AuthenticatedRequest } from '../../middleware/auth';
import { canAssignCollector, canTransition, canUploadReport } from '../lab-orders/status-flow';
import { escapeRegex } from '../../utils/regex';

const UPLOAD_TIMEOUT = 30_000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(buffer: Buffer, options: UploadApiOptions): Promise<string> {
    const uploadPromise = new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { ...options, overwrite: true, timeout: UPLOAD_TIMEOUT },
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

async function logLabOrderAudit(
    req: Request,
    action: 'lab_order_status_updated' | 'lab_order_collector_assigned' | 'lab_order_report_uploaded',
    resourceId: string,
    meta?: Record<string, unknown>
): Promise<void> {
    try {
        const authReq = req as AuthenticatedRequest;
        const adminUserId = authReq.user?.userId;
        if (!adminUserId) return;

        await AdminAuditLog.create({
            adminUserId,
            action,
            resourceType: 'lab_order',
            resourceId,
            meta,
        });
    } catch (error) {
        // Audit log failures should not block operational APIs.
        console.error('Admin audit log error:', error);
    }
}

function ensureEscalatedForAdminOverride(order: any, overrideReason: string) {
    const trimmedReason = String(overrideReason || '').trim();
    if (trimmedReason.length < 5) {
        return {
            ok: false,
            status: 400,
            error: 'overrideReason must be at least 5 characters for admin override',
        };
    }

    if (!order?.adminOverride?.isEscalated) {
        return {
            ok: false,
            status: 403,
            error: 'Admin override is allowed only for escalated lab orders',
        };
    }

    return {
        ok: true,
        reason: trimmedReason,
    } as const;
}

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

        if (isSuspended) {
            if (user.role === 'doctor') {
                await Doctor.deleteMany({ userId: user._id });
            }

            if (user.role === 'lab') {
                const normalizedPhone = String(user.phone || '').replace(/\D/g, '');
                const phoneCandidates = normalizedPhone
                    ? [normalizedPhone, `+91${normalizedPhone}`, `91${normalizedPhone}`]
                    : [];

                const labs = await Lab.find({
                    $or: [
                        { createdBy: user._id },
                        ...(phoneCandidates.length > 0 ? [{ phone: { $in: phoneCandidates } }] : []),
                    ],
                }).select('_id').lean();

                const labIds = labs.map((l: any) => l._id);
                if (labIds.length > 0) {
                    await Promise.all([
                        LabTest.deleteMany({ labId: { $in: labIds } }),
                        LabPackage.deleteMany({ labId: { $in: labIds } }),
                        Lab.deleteMany({ _id: { $in: labIds } }),
                    ]);
                }
            }
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
                    pipeline: [{ $project: { name: 1, phone: 1, email: 1, isSuspended: 1 } }]
                }
            },
            { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
            { $match: { 'userId.isSuspended': { $ne: true } } },
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

        const activeDoctorUserIds = await User.find({
            role: 'doctor',
            isSuspended: { $ne: true },
        }).select('_id').lean();

        const filter = {
            isVerified: false,
            userId: { $in: activeDoctorUserIds.map((u: any) => u._id) },
        };
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

/**
 * GET /api/admin/labs
 * Paginated lab list with filters (admin only)
 */
export const getLabs = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, city, state, status = 'all' } = req.query;
        const pageNum = Number(page) || 1;
        const pageLimit = Number(limit) || 20;
        const skip = (pageNum - 1) * pageLimit;

        const query: any = {};

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        if (city) {
            query['address.city'] = { $regex: escapeRegex(String(city)), $options: 'i' };
        }

        if (state) {
            query['address.state'] = { $regex: escapeRegex(String(state)), $options: 'i' };
        }

        if (search) {
            const safe = escapeRegex(String(search));
            query.$or = [
                { name: { $regex: safe, $options: 'i' } },
                { phone: { $regex: safe, $options: 'i' } },
                { email: { $regex: safe, $options: 'i' } },
                { 'address.city': { $regex: safe, $options: 'i' } },
                { 'address.state': { $regex: safe, $options: 'i' } },
            ];
        }

        const [labs, total] = await Promise.all([
            Lab.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit)
                .lean(),
            Lab.countDocuments(query),
        ]);

        return res.json({
            success: true,
            data: labs,
            pagination: {
                page: pageNum,
                limit: pageLimit,
                total,
                pages: Math.ceil(total / pageLimit),
            },
        });
    } catch (error) {
        console.error('Get labs error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch labs' });
    }
};

/**
 * PATCH /api/admin/labs/:id/status
 * Activate/deactivate a lab
 */
export const updateLabStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body as { isActive: boolean };

        const updated = await Lab.findByIdAndUpdate(
            id,
            { isActive: Boolean(isActive) },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        return res.json({
            success: true,
            message: `Lab ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updated,
        });
    } catch (error) {
        console.error('Update lab status error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab status' });
    }
};

/**
 * GET /api/admin/lab-orders
 * Paginated lab orders list with filters
 */
export const getLabOrders = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, status, labId, dateFrom, dateTo, search } = req.query;
        const pageNum = Number(page) || 1;
        const pageLimit = Number(limit) || 20;
        const skip = (pageNum - 1) * pageLimit;

        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (labId) {
            query.labId = labId;
        }

        if (dateFrom || dateTo) {
            query.slotDate = {};
            if (dateFrom) query.slotDate.$gte = new Date(String(dateFrom));
            if (dateTo) query.slotDate.$lte = new Date(String(dateTo));
        }

        if (search) {
            const safe = escapeRegex(String(search));
            query.$or = [
                { 'patientProfile.name': { $regex: safe, $options: 'i' } },
                { address: { $regex: safe, $options: 'i' } },
            ];
        }

        const [orders, total] = await Promise.all([
            LabOrder.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit)
                .populate('labId', 'name phone address')
                .lean(),
            LabOrder.countDocuments(query),
        ]);

        return res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: pageLimit,
                total,
                pages: Math.ceil(total / pageLimit),
            },
        });
    } catch (error) {
        console.error('Get lab orders error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab orders' });
    }
};

/**
 * GET /api/admin/lab-orders/:id
 * Lab order details
 */
export const getLabOrderDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await LabOrder.findById(id)
            .populate('labId', 'name phone address rating isNablCertified')
            .lean();

        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error('Get lab order details error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab order details' });
    }
};

/**
 * PATCH /api/admin/lab-orders/:id/status
 * Update lab order status with transition validation
 */
export const updateLabOrderStatusAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthenticatedRequest;
        const adminUserId = authReq.user?.userId;
        const { status, overrideReason } = req.body;

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        const overrideCheck = ensureEscalatedForAdminOverride(order, overrideReason);
        if (!overrideCheck.ok) {
            return res.status(overrideCheck.status).json({ success: false, error: overrideCheck.error });
        }

        if (!canTransition(order.status, status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from '${order.status}' to '${status}'`,
            });
        }

        const previousStatus = order.status;
        order.status = status;
        if (status === 'sample_collected' && !order.sampleCollectedAt) {
            order.sampleCollectedAt = new Date();
        }
        order.adminOverride = {
            isEscalated: true,
            escalationReason: order.adminOverride?.escalationReason,
            escalatedByRole: order.adminOverride?.escalatedByRole,
            escalatedByUserId: order.adminOverride?.escalatedByUserId,
            escalatedAt: order.adminOverride?.escalatedAt,
            lastAdminOverrideReason: overrideCheck.reason,
            lastAdminOverrideAt: new Date(),
            lastAdminOverrideBy: adminUserId,
        };
        await order.save();

        await logLabOrderAudit(req, 'lab_order_status_updated', String(order._id), {
            previousStatus,
            newStatus: status,
            overrideReason: overrideCheck.reason,
        });

        const populated = await LabOrder.findById(order._id)
            .populate('labId', 'name phone address')
            .lean();

        return res.json({
            success: true,
            message: 'Lab order status updated',
            data: populated,
        });
    } catch (error) {
        console.error('Update lab order status error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab order status' });
    }
};

/**
 * PATCH /api/admin/lab-orders/:id/collector
 * Assign or update collector for lab order; auto-transitions confirmed -> collector_assigned
 */
export const assignLabCollectorAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthenticatedRequest;
        const adminUserId = authReq.user?.userId;
        const { collectorName, collectorPhone, collectorEta, overrideReason } = req.body;

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        const overrideCheck = ensureEscalatedForAdminOverride(order, overrideReason);
        if (!overrideCheck.ok) {
            return res.status(overrideCheck.status).json({ success: false, error: overrideCheck.error });
        }

        if (!canAssignCollector(order.status)) {
            return res.status(400).json({
                success: false,
                error: `Collector assignment not allowed when order is '${order.status}'`,
            });
        }

        const previousStatus = order.status;

        order.collector = {
            name: String(collectorName).trim(),
            phone: String(collectorPhone).trim(),
            eta: collectorEta ? new Date(String(collectorEta)) : undefined,
            assignedAt: new Date(),
        };

        if (order.status === 'confirmed') {
            order.status = 'collector_assigned';
        }

        order.adminOverride = {
            isEscalated: true,
            escalationReason: order.adminOverride?.escalationReason,
            escalatedByRole: order.adminOverride?.escalatedByRole,
            escalatedByUserId: order.adminOverride?.escalatedByUserId,
            escalatedAt: order.adminOverride?.escalatedAt,
            lastAdminOverrideReason: overrideCheck.reason,
            lastAdminOverrideAt: new Date(),
            lastAdminOverrideBy: adminUserId,
        };

        await order.save();

        await logLabOrderAudit(req, 'lab_order_collector_assigned', String(order._id), {
            previousStatus,
            newStatus: order.status,
            collectorName: order.collector?.name,
            collectorPhone: order.collector?.phone,
            collectorEta: order.collector?.eta,
            overrideReason: overrideCheck.reason,
        });

        const populated = await LabOrder.findById(order._id)
            .populate('labId', 'name phone address')
            .lean();

        return res.json({
            success: true,
            message: 'Collector assigned successfully',
            data: populated,
        });
    } catch (error) {
        console.error('Assign lab collector error:', error);
        return res.status(500).json({ success: false, error: 'Failed to assign collector' });
    }
};

/**
 * POST /api/admin/lab-orders/:id/report
 * Upload PDF report and auto-transition processing -> report_ready
 */
export const uploadLabReportAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthenticatedRequest;
        const adminUserId = authReq.user?.userId;
        const overrideReason = String(req.body?.overrideReason || '');
        const file = (req as Request & { file?: Express.Multer.File }).file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No report file uploaded' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        const overrideCheck = ensureEscalatedForAdminOverride(order, overrideReason);
        if (!overrideCheck.ok) {
            return res.status(overrideCheck.status).json({ success: false, error: overrideCheck.error });
        }

        if (!canUploadReport(order.status)) {
            return res.status(400).json({
                success: false,
                error: `Report upload allowed only when status is 'processing' (current: '${order.status}')`,
            });
        }

        const reportUrl = await uploadToCloudinary(file.buffer, {
            folder: `lab-orders/reports`,
            public_id: `lab_order_${order._id}_report_${Date.now()}`,
            resource_type: 'raw',
            format: 'pdf',
        });

        const previousStatus = order.status;

        order.reportUrl = reportUrl;
        order.reportUploadedAt = new Date();
        order.status = 'report_ready';
        order.adminOverride = {
            isEscalated: true,
            escalationReason: order.adminOverride?.escalationReason,
            escalatedByRole: order.adminOverride?.escalatedByRole,
            escalatedByUserId: order.adminOverride?.escalatedByUserId,
            escalatedAt: order.adminOverride?.escalatedAt,
            lastAdminOverrideReason: overrideCheck.reason,
            lastAdminOverrideAt: new Date(),
            lastAdminOverrideBy: adminUserId,
        };
        await order.save();

        await logLabOrderAudit(req, 'lab_order_report_uploaded', String(order._id), {
            previousStatus,
            newStatus: order.status,
            reportUploadedAt: order.reportUploadedAt,
            reportUrl,
            overrideReason: overrideCheck.reason,
        });

        const populated = await LabOrder.findById(order._id)
            .populate('labId', 'name phone address')
            .lean();

        return res.json({
            success: true,
            message: 'Lab report uploaded successfully',
            data: populated,
        });
    } catch (error) {
        console.error('Upload lab report error:', error);
        return res.status(500).json({ success: false, error: 'Failed to upload report' });
    }
};

/**
 * GET /api/admin/lab-registration-requests
 * Paginated lab registration requests for admin review.
 */
export const getLabRegistrationRequests = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, status = 'all', search } = req.query;
        const pageNum = Number(page) || 1;
        const pageLimit = Number(limit) || 20;
        const skip = (pageNum - 1) * pageLimit;

        const query: Record<string, unknown> = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            const safe = escapeRegex(String(search));
            query.$or = [
                { labName: { $regex: safe, $options: 'i' } },
                { contactName: { $regex: safe, $options: 'i' } },
                { phone: { $regex: safe, $options: 'i' } },
                { alternateContactPhone: { $regex: safe, $options: 'i' } },
                { email: { $regex: safe, $options: 'i' } },
            ];
        }

        const [requests, total] = await Promise.all([
            LabRegistrationRequest.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit)
                .lean(),
            LabRegistrationRequest.countDocuments(query),
        ]);

        return res.json({
            success: true,
            data: requests,
            pagination: {
                page: pageNum,
                limit: pageLimit,
                total,
                pages: Math.ceil(total / pageLimit),
            },
        });
    } catch (error) {
        console.error('Get lab registration requests error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab registration requests' });
    }
};

/**
 * PATCH /api/admin/lab-registration-requests/:id/decision
 * Approve or reject a lab self-registration request.
 */
export const reviewLabRegistrationRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const adminUserId = authReq.user?.userId;
        const { id } = req.params;
        const { decision, rejectionReason } = req.body as {
            decision: 'approve' | 'reject';
            rejectionReason?: string;
        };

        const registrationRequest = await LabRegistrationRequest.findById(id);
        if (!registrationRequest) {
            return res.status(404).json({ success: false, error: 'Lab registration request not found' });
        }

        if (registrationRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Request already processed with status '${registrationRequest.status}'`,
            });
        }

        if (decision === 'reject') {
            registrationRequest.status = 'rejected';
            registrationRequest.rejectionReason = rejectionReason?.trim();
            registrationRequest.decidedBy = adminUserId;
            registrationRequest.decidedAt = new Date();
            await registrationRequest.save();

            return res.json({
                success: true,
                message: 'Lab registration request rejected',
                data: registrationRequest,
            });
        }

        const coordinates = registrationRequest.location?.coordinates;
        const lng = Array.isArray(coordinates) ? Number(coordinates[0]) : NaN;
        const lat = Array.isArray(coordinates) ? Number(coordinates[1]) : NaN;
        const hasInvalidCoordinates =
            !Number.isFinite(lng) ||
            !Number.isFinite(lat) ||
            lng < -180 ||
            lng > 180 ||
            lat < -90 ||
            lat > 90;

        if (hasInvalidCoordinates) {
            return res.status(400).json({
                success: false,
                error: 'Invalid location coordinates in this registration request. Reject it and ask the lab to submit valid latitude (-90..90) and longitude (-180..180).',
            });
        }

        const existingLabByPhone = await Lab.findOne({ phone: registrationRequest.phone }).lean();
        if (existingLabByPhone) {
            return res.status(409).json({
                success: false,
                error: 'A lab profile already exists for this phone number/account.',
            });
        }

        // Approve flow: reuse OTP-authenticated account when present; otherwise create one.
        let labUser = await User.findOne({ phone: registrationRequest.phone });
        let createdNewUser = false;

        if (labUser) {
            if (labUser.role === 'admin' || labUser.role === 'doctor') {
                return res.status(409).json({
                    success: false,
                    error: 'This phone is linked to a non-convertible role account. Approval blocked.',
                });
            }
        } else {
            const counter = await Counter.findByIdAndUpdate(
                'user',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            labUser = await User.create({
                phone: registrationRequest.phone,
                name: registrationRequest.contactName,
                email: registrationRequest.email,
                role: 'lab',
                isPhoneVerified: false,
                isProfileComplete: false,
                userId: counter.seq,
            });
            createdNewUser = true;
        }

        const existingLab = await Lab.findOne({
            createdBy: labUser._id,
        }).lean();

        if (existingLab) {
            return res.status(409).json({
                success: false,
                error: 'A lab profile already exists for this phone number/account.',
            });
        }

        let labProfile;
        try {
            labProfile = await Lab.create({
                name: registrationRequest.labName,
                phone: registrationRequest.phone,
                email: registrationRequest.email,
                address: registrationRequest.address,
                location: registrationRequest.location,
                isNablCertified: registrationRequest.isNablCertified,
                isActive: true,
                createdBy: labUser._id,
            });
        } catch (createLabError) {
            if (createdNewUser) {
                await User.findByIdAndDelete(labUser._id);
            }
            throw createLabError;
        }

        if (!createdNewUser) {
            labUser.name = registrationRequest.contactName || labUser.name;
            if (registrationRequest.email) {
                labUser.email = registrationRequest.email;
            }
            labUser.role = 'lab';
            labUser.isPhoneVerified = true;
            labUser.isProfileComplete = false;
            await labUser.save();
        }

        registrationRequest.status = 'approved';
        registrationRequest.rejectionReason = undefined;
        registrationRequest.decidedBy = adminUserId;
        registrationRequest.decidedAt = new Date();
        registrationRequest.approvedUserId = labUser._id.toString();
        registrationRequest.approvedLabId = labProfile._id.toString();
        await registrationRequest.save();

        return res.json({
            success: true,
            message: 'Lab registration approved and lab account created',
            data: {
                request: registrationRequest,
                user: {
                    _id: labUser._id,
                    userId: labUser.userId,
                    phone: labUser.phone,
                    role: labUser.role,
                    isPhoneVerified: labUser.isPhoneVerified,
                },
                lab: {
                    _id: labProfile._id,
                    name: labProfile.name,
                },
            },
        });
    } catch (error) {
        const dbError = error as { code?: number; message?: string };
        if (dbError.code === 16755) {
            return res.status(400).json({
                success: false,
                error: 'Invalid geolocation coordinates for this lab request. Reject the request and ask for correct latitude/longitude.',
            });
        }
        console.error('Review lab registration request error:', error);
        return res.status(500).json({ success: false, error: 'Failed to process lab registration request' });
    }
};
