import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { AuthenticatedRequest } from '../../middleware/auth';
import { Lab, LabOrder, LabPackage, LabRegistrationRequest, LabTest, User } from '../../models';
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

async function getLabForUser(userId: string) {
    const linkedLab = await Lab.findOne({ createdBy: userId });
    if (linkedLab) return linkedLab;

    const user = await User.findById(userId).select('phone').lean();
    const rawPhone = String(user?.phone || '').trim();
    if (!rawPhone) return null;

    const digits = rawPhone.replace(/\D/g, '');
    const lastTenDigits = digits.length >= 10 ? digits.slice(-10) : '';
    const phoneCandidates = Array.from(
        new Set([rawPhone, digits, lastTenDigits].filter(Boolean))
    );

    const fallbackLab = await Lab.findOne({ phone: { $in: phoneCandidates } });
    if (!fallbackLab) return null;

    // Self-heal legacy/unlinked records so future lookups are direct by createdBy.
    if (!fallbackLab.createdBy || String(fallbackLab.createdBy) !== userId) {
        fallbackLab.createdBy = new mongoose.Types.ObjectId(userId);
        await fallbackLab.save();
    }

    return fallbackLab;
}

function isOrderOwnedByLab(orderLabId: unknown, labId: string): boolean {
    if (!orderLabId) return false;
    return String(orderLabId) === String(labId);
}

function parseInstructions(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
}

function normalizeOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

async function isLabVerified(labId: string): Promise<boolean> {
    const registrationRequest = await LabRegistrationRequest.findOne({
        approvedLabId: labId,
        status: 'approved',
    }).lean();
    return !!registrationRequest;
}

/** GET /api/lab-provider/profile */
export const getMyLabProfile = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const [lab, labUser] = await Promise.all([
            getLabForUser(userId),
            User.findById(userId).lean(),
        ]);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const registrationRequest = await LabRegistrationRequest.findOne({
            approvedLabId: String(lab._id),
        })
            .sort({ decidedAt: -1, createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            data: {
                ...lab.toObject(),
                contactName: labUser?.name,
                verificationDocuments: registrationRequest?.verificationDocuments || [],
            },
        });
    } catch (error) {
        console.error('getMyLabProfile error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab profile' });
    }
};

/** PATCH /api/lab-provider/profile */
export const updateMyLabProfile = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { contactName, labName, phone, email, address } = req.body as {
            contactName?: string;
            labName?: string;
            phone?: string;
            email?: string;
            address?: {
                line1: string;
                city: string;
                state: string;
                pincode: string;
            };
        };

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        if (typeof contactName === 'string' && contactName.trim().length > 0) {
            await User.findByIdAndUpdate(userId, { name: contactName.trim() });
        }

        if (typeof labName === 'string' && labName.trim().length > 0) {
            lab.name = labName.trim();
        }

        if (typeof phone === 'string' && phone.trim().length > 0) {
            lab.phone = phone.trim();
        }

        if (typeof email === 'string') {
            lab.email = email.trim();
        }

        if (address) {
            lab.address = {
                line1: String(address.line1).trim(),
                city: String(address.city).trim(),
                state: String(address.state).trim(),
                pincode: String(address.pincode).trim(),
            };
        }

        await lab.save();

        const [updatedUser, registrationRequest] = await Promise.all([
            User.findById(userId).lean(),
            LabRegistrationRequest.findOne({ approvedLabId: String(lab._id) })
                .sort({ decidedAt: -1, createdAt: -1 })
                .lean(),
        ]);

        return res.json({
            success: true,
            message: 'Lab profile updated successfully',
            data: {
                ...lab.toObject(),
                contactName: updatedUser?.name,
                verificationDocuments: registrationRequest?.verificationDocuments || [],
            },
        });
    } catch (error) {
        console.error('updateMyLabProfile error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab profile' });
    }
};

/** GET /api/lab-provider/dashboard */
export const getLabDashboard = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const labId = String(lab._id);

        const [
            totalOrders,
            pendingOrders,
            inProgressOrders,
            reportsReady,
            completedOrders,
            revenueAgg,
            recentOrders,
        ] = await Promise.all([
            LabOrder.countDocuments({ labId }),
            LabOrder.countDocuments({
                labId,
                status: { $in: ['created', 'payment_pending', 'confirmed', 'collector_assigned', 'collector_on_the_way'] },
            }),
            LabOrder.countDocuments({ labId, status: { $in: ['sample_collected', 'processing'] } }),
            LabOrder.countDocuments({ labId, status: 'report_ready' }),
            LabOrder.countDocuments({ labId, status: 'completed' }),
            LabOrder.aggregate([
                {
                    $match: {
                        labId: lab._id,
                        status: { $in: ['report_ready', 'completed'] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$amount' },
                    },
                },
            ]),
            LabOrder.find({ labId })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);

        return res.json({
            success: true,
            data: {
                lab,
                stats: {
                    totalOrders,
                    pendingOrders,
                    inProgressOrders,
                    reportsReady,
                    completedOrders,
                    totalRevenue: revenueAgg[0]?.totalRevenue || 0,
                },
                recentOrders,
            },
        });
    } catch (error) {
        console.error('getLabDashboard error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
};

/** GET /api/lab-provider/catalog */
export const getMyLabCatalog = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const includeInactive = String(req.query.includeInactive || 'false').toLowerCase() === 'true';
        const baseQuery = includeInactive
            ? { labId: lab._id }
            : { labId: lab._id, isActive: true };

        const [tests, packages] = await Promise.all([
            LabTest.find(baseQuery).sort({ name: 1 }).lean(),
            LabPackage.find(baseQuery).sort({ name: 1 }).lean(),
        ]);

        return res.json({
            success: true,
            data: {
                lab,
                tests,
                packages,
            },
        });
    } catch (error) {
        console.error('getMyLabCatalog error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab catalog' });
    }
};

/** POST /api/lab-provider/catalog/tests */
export const createMyLabTest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const isVerified = await isLabVerified(String(lab._id));
        if (!isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Your lab must be verified by admin before creating tests. Please wait for verification or contact support.',
            });
        }

        const discountedPrice = typeof req.body.discountedPrice === 'number'
            ? req.body.discountedPrice
            : undefined;

        if (discountedPrice !== undefined && discountedPrice > req.body.price) {
            return res.status(400).json({
                success: false,
                error: 'Discounted price cannot exceed actual price',
            });
        }

        const test = await LabTest.create({
            labId: lab._id,
            code: String(req.body.code).trim(),
            name: String(req.body.name).trim(),
            category: normalizeOptionalString(req.body.category),
            price: req.body.price,
            discountedPrice,
            preparationInstructions: parseInstructions(req.body.preparationInstructions),
            fastingHours: typeof req.body.fastingHours === 'number' ? req.body.fastingHours : undefined,
            sampleType: normalizeOptionalString(req.body.sampleType),
            turnaroundHours: typeof req.body.turnaroundHours === 'number' ? req.body.turnaroundHours : undefined,
            isActive: req.body.isActive ?? true,
        });

        return res.status(201).json({
            success: true,
            message: 'Lab test created successfully',
            data: test,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, error: 'Test code already exists for your lab' });
        }

        console.error('createMyLabTest error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create lab test' });
    }
};

/** PATCH /api/lab-provider/catalog/tests/:id */
export const updateMyLabTest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid test id' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const test = await LabTest.findOne({ _id: id, labId: lab._id });
        if (!test) {
            return res.status(404).json({ success: false, error: 'Lab test not found' });
        }

        const nextPrice = typeof req.body.price === 'number' ? req.body.price : test.price;
        const nextDiscountedPrice = typeof req.body.discountedPrice === 'number'
            ? req.body.discountedPrice
            : req.body.discountedPrice === null
                ? undefined
                : test.discountedPrice;

        if (nextDiscountedPrice !== undefined && nextDiscountedPrice > nextPrice) {
            return res.status(400).json({
                success: false,
                error: 'Discounted price cannot exceed actual price',
            });
        }

        if (typeof req.body.code === 'string') {
            test.code = req.body.code.trim();
        }
        if (typeof req.body.name === 'string') {
            test.name = req.body.name.trim();
        }
        if (req.body.category !== undefined) {
            test.category = normalizeOptionalString(req.body.category);
        }
        if (typeof req.body.price === 'number') {
            test.price = req.body.price;
        }
        test.discountedPrice = nextDiscountedPrice;
        if (req.body.preparationInstructions !== undefined) {
            test.preparationInstructions = parseInstructions(req.body.preparationInstructions);
        }
        if (req.body.fastingHours !== undefined) {
            test.fastingHours = typeof req.body.fastingHours === 'number' ? req.body.fastingHours : undefined;
        }
        if (req.body.sampleType !== undefined) {
            test.sampleType = normalizeOptionalString(req.body.sampleType);
        }
        if (req.body.turnaroundHours !== undefined) {
            test.turnaroundHours =
                typeof req.body.turnaroundHours === 'number' ? req.body.turnaroundHours : undefined;
        }
        if (typeof req.body.isActive === 'boolean') {
            test.isActive = req.body.isActive;
        }

        await test.save();

        return res.json({
            success: true,
            message: 'Lab test updated successfully',
            data: test,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, error: 'Test code already exists for your lab' });
        }

        console.error('updateMyLabTest error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab test' });
    }
};

/** POST /api/lab-provider/catalog/packages */
export const createMyLabPackage = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const isVerified = await isLabVerified(String(lab._id));
        if (!isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Your lab must be verified by admin before creating packages. Please wait for verification or contact support.',
            });
        }

        const rawTestIds = Array.isArray(req.body.testIds) ? req.body.testIds : [];
        const uniqueTestIds = [...new Set(rawTestIds.map((value: unknown) => String(value)))];

        const tests = await LabTest.find({
            _id: { $in: uniqueTestIds },
            labId: lab._id,
        }).lean();

        if (tests.length !== uniqueTestIds.length) {
            return res.status(400).json({
                success: false,
                error: 'One or more tests are invalid for your lab',
            });
        }

        const discountedPrice = typeof req.body.discountedPrice === 'number'
            ? req.body.discountedPrice
            : undefined;

        if (discountedPrice !== undefined && discountedPrice > req.body.price) {
            return res.status(400).json({
                success: false,
                error: 'Discounted price cannot exceed actual price',
            });
        }

        const pkg = await LabPackage.create({
            labId: lab._id,
            code: String(req.body.code).trim(),
            name: String(req.body.name).trim(),
            description: normalizeOptionalString(req.body.description),
            items: tests.map((test) => ({
                testId: test._id,
                nameSnapshot: test.name,
            })),
            price: req.body.price,
            discountedPrice,
            preparationInstructions: parseInstructions(req.body.preparationInstructions),
            isActive: req.body.isActive ?? true,
        });

        return res.status(201).json({
            success: true,
            message: 'Lab package created successfully',
            data: pkg,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, error: 'Package code already exists for your lab' });
        }

        console.error('createMyLabPackage error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create lab package' });
    }
};

/** PATCH /api/lab-provider/catalog/packages/:id */
export const updateMyLabPackage = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid package id' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const pkg = await LabPackage.findOne({ _id: id, labId: lab._id });
        if (!pkg) {
            return res.status(404).json({ success: false, error: 'Lab package not found' });
        }

        const nextPrice = typeof req.body.price === 'number' ? req.body.price : pkg.price;
        const nextDiscountedPrice = typeof req.body.discountedPrice === 'number'
            ? req.body.discountedPrice
            : req.body.discountedPrice === null
                ? undefined
                : pkg.discountedPrice;

        if (nextDiscountedPrice !== undefined && nextDiscountedPrice > nextPrice) {
            return res.status(400).json({
                success: false,
                error: 'Discounted price cannot exceed actual price',
            });
        }

        if (typeof req.body.code === 'string') {
            pkg.code = req.body.code.trim();
        }
        if (typeof req.body.name === 'string') {
            pkg.name = req.body.name.trim();
        }
        if (req.body.description !== undefined) {
            pkg.description = normalizeOptionalString(req.body.description);
        }
        if (typeof req.body.price === 'number') {
            pkg.price = req.body.price;
        }
        pkg.discountedPrice = nextDiscountedPrice;
        if (req.body.preparationInstructions !== undefined) {
            pkg.preparationInstructions = parseInstructions(req.body.preparationInstructions);
        }
        if (typeof req.body.isActive === 'boolean') {
            pkg.isActive = req.body.isActive;
        }

        if (Array.isArray(req.body.testIds)) {
            const uniqueTestIds = [...new Set(req.body.testIds.map((value: unknown) => String(value)))];

            const tests = await LabTest.find({
                _id: { $in: uniqueTestIds },
                labId: lab._id,
            }).lean();

            if (tests.length !== uniqueTestIds.length) {
                return res.status(400).json({
                    success: false,
                    error: 'One or more tests are invalid for your lab',
                });
            }

            pkg.items = tests.map((test) => ({
                testId: test._id,
                nameSnapshot: test.name,
            })) as any;
        }

        await pkg.save();

        return res.json({
            success: true,
            message: 'Lab package updated successfully',
            data: pkg,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, error: 'Package code already exists for your lab' });
        }

        console.error('updateMyLabPackage error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab package' });
    }
};

/** GET /api/lab-provider/orders */
export const getMyLabOrders = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const { page = 1, limit = 20, status = 'all', search } = req.query;
        const pageNum = Number(page) || 1;
        const pageLimit = Number(limit) || 20;
        const skip = (pageNum - 1) * pageLimit;

        const query: Record<string, unknown> = { labId: lab._id };

        if (status && status !== 'all') {
            query.status = status;
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
        console.error('getMyLabOrders error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab orders' });
    }
};

/** GET /api/lab-provider/orders/:id */
export const getMyLabOrderById = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const order = await LabOrder.findById(id).lean();
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        if (!isOrderOwnedByLab(order.labId, String(lab._id))) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error('getMyLabOrderById error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab order details' });
    }
};

/** PATCH /api/lab-provider/orders/:id/status */
export const updateMyLabOrderStatus = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { status } = req.body as { status: string };

        const allowedTargets = new Set([
            'confirmed',
            'collector_assigned',
            'collector_on_the_way',
            'sample_collected',
            'processing',
            'report_ready',
            'completed',
        ]);

        if (!allowedTargets.has(status)) {
            return res.status(400).json({ success: false, error: 'Unsupported status for lab provider action' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        if (!isOrderOwnedByLab(order.labId, String(lab._id))) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this order' });
        }

        if (!canTransition(order.status, status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from '${order.status}' to '${status}'`,
            });
        }

        order.status = status as any;
        if (status === 'sample_collected' && !order.sampleCollectedAt) {
            order.sampleCollectedAt = new Date();
        }
        await order.save();

        return res.json({ success: true, message: 'Order status updated', data: order });
    } catch (error) {
        console.error('updateMyLabOrderStatus error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab order status' });
    }
};

/** PATCH /api/lab-provider/orders/:id/collector */
export const assignMyLabOrderCollector = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { collectorName, collectorPhone, collectorEta } = req.body as {
            collectorName: string;
            collectorPhone: string;
            collectorEta?: string;
        };

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        if (!isOrderOwnedByLab(order.labId, String(lab._id))) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this order' });
        }

        if (!canAssignCollector(order.status)) {
            return res.status(400).json({
                success: false,
                error: `Collector assignment not allowed when order is '${order.status}'`,
            });
        }

        order.collector = {
            name: String(collectorName).trim(),
            phone: String(collectorPhone).trim(),
            eta: collectorEta ? new Date(String(collectorEta)) : undefined,
            assignedAt: new Date(),
        };

        if (order.status === 'confirmed') {
            order.status = 'collector_assigned';
        }

        await order.save();

        return res.json({
            success: true,
            message: 'Collector assigned successfully',
            data: order,
        });
    } catch (error) {
        console.error('assignMyLabOrderCollector error:', error);
        return res.status(500).json({ success: false, error: 'Failed to assign collector' });
    }
};

/** PATCH /api/lab-provider/orders/:id/escalate */
export const escalateMyLabOrder = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const reason = String(req.body.escalationReason || '').trim();

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        if (!isOrderOwnedByLab(order.labId, String(lab._id))) {
            return res.status(403).json({ success: false, error: 'Not authorized to escalate this order' });
        }

        order.adminOverride = {
            ...(order.adminOverride || {}),
            isEscalated: true,
            escalationReason: reason,
            escalatedByRole: 'lab',
            escalatedByUserId: userId,
            escalatedAt: new Date(),
        };

        await order.save();

        return res.json({
            success: true,
            message: 'Order escalated to admin support successfully',
            data: order,
        });
    } catch (error) {
        console.error('escalateMyLabOrder error:', error);
        return res.status(500).json({ success: false, error: 'Failed to escalate order' });
    }
};

/** POST /api/lab-provider/orders/:id/report */
export const uploadMyLabOrderReport = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const file = (req as Request & { file?: Express.Multer.File }).file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No report file uploaded' });
        }

        const lab = await getLabForUser(userId);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab profile not found' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Lab order not found' });
        }

        if (!isOrderOwnedByLab(order.labId, String(lab._id))) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this order' });
        }

        if (!canUploadReport(order.status)) {
            return res.status(400).json({
                success: false,
                error: `Report upload allowed only when status is 'processing' (current: '${order.status}')`,
            });
        }

        const reportUrl = await uploadToCloudinary(file.buffer, {
            folder: `lab-orders/reports/lab_${lab._id}`,
            public_id: `lab_order_${order._id}_report_${Date.now()}`,
            resource_type: 'raw',
            format: 'pdf',
        });

        order.reportUrl = reportUrl;
        order.reportUploadedAt = new Date();
        order.status = 'report_ready';
        await order.save();

        return res.json({
            success: true,
            message: 'Lab report uploaded successfully',
            data: order,
        });
    } catch (error) {
        console.error('uploadMyLabOrderReport error:', error);
        return res.status(500).json({ success: false, error: 'Failed to upload lab report' });
    }
};
