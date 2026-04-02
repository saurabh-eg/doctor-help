import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Lab, LabTest, LabPackage, LabOrder } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';
import { PAGINATION } from '../../utils/pagination';
import { canTransition } from './status-flow';
import {
    notifyLabOrderCreated,
    notifyLabOrderStatusChanged,
} from '../notifications';

/** POST /api/lab-orders — Create a lab booking for selected test/package items. */
export const createLabOrder = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const {
            labId,
            testIds = [],
            packageIds = [],
            patientProfile,
            prescriptionUrl,
            slotDate,
            slotTime,
            homeCollection,
            address,
        } = req.body;

        if (!mongoose.isValidObjectId(labId)) {
            return res.status(400).json({ success: false, error: 'Invalid lab id' });
        }

        const lab = await Lab.findById(labId);
        if (!lab || !lab.isActive) {
            return res.status(404).json({ success: false, error: 'Lab not found or inactive' });
        }

        if (testIds.length === 0 && packageIds.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one test or package is required' });
        }

        const [tests, packages] = await Promise.all([
            testIds.length
                ? LabTest.find({ _id: { $in: testIds }, labId, isActive: true }).lean()
                : Promise.resolve([]),
            packageIds.length
                ? LabPackage.find({ _id: { $in: packageIds }, labId, isActive: true }).lean()
                : Promise.resolve([]),
        ]);

        if (tests.length !== testIds.length) {
            return res.status(400).json({ success: false, error: 'One or more tests are invalid for selected lab' });
        }

        if (packages.length !== packageIds.length) {
            return res.status(400).json({ success: false, error: 'One or more packages are invalid for selected lab' });
        }

        const testItems = tests.map((test) => ({
            itemType: 'test' as const,
            itemId: test._id,
            name: test.name,
            price: test.discountedPrice ?? test.price,
        }));

        const packageItems = packages.map((pkg) => ({
            itemType: 'package' as const,
            itemId: pkg._id,
            name: pkg.name,
            price: pkg.discountedPrice ?? pkg.price,
        }));

        const items = [...testItems, ...packageItems];
        const amount = items.reduce((sum, item) => sum + item.price, 0);

        const preparationInstructions = Array.from(new Set([
            ...tests.flatMap((test) => test.preparationInstructions || []),
            ...packages.flatMap((pkg) => pkg.preparationInstructions || []),
            ...tests
                .filter((test) => typeof test.fastingHours === 'number' && test.fastingHours > 0)
                .map((test) => `Fasting required: ${test.fastingHours} hours for ${test.name}`),
        ]));

        let dateValue: Date;
        if (typeof slotDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(slotDate)) {
            const [year, month, day] = slotDate.split('-').map(Number);
            dateValue = new Date(Date.UTC(year, month - 1, day));
        } else {
            const parsed = new Date(slotDate);
            if (Number.isNaN(parsed.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid slotDate' });
            }
            dateValue = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
        }

        const order = await LabOrder.create({
            userId,
            labId,
            patientProfile,
            items,
            prescriptionUrl,
            preparationInstructions,
            slotDate: dateValue,
            slotTime,
            homeCollection,
            address,
            amount,
            status: 'created',
        });

        const populated = await LabOrder.findById(order._id)
            .populate('labId')
            .lean();

        await notifyLabOrderCreated({
            patientUserId: userId,
            labOwnerUserId: lab.createdBy?.toString(),
            orderId: order._id.toString(),
        });

        return res.status(201).json({
            success: true,
            message: 'Lab order created successfully',
            data: populated,
        });
    } catch (error) {
        console.error('createLabOrder error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create lab order' });
    }
};

/** GET /api/lab-orders/my — List authenticated user's orders. */
export const getMyLabOrders = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { page = String(PAGINATION.DEFAULT_PAGE), limit = String(PAGINATION.DEFAULT_LIMIT), status } = req.query;
        const pageNum = Number(page) || PAGINATION.DEFAULT_PAGE;
        const limitNum = Math.min(Number(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const skip = (pageNum - 1) * limitNum;

        const filter: Record<string, any> = { userId };
        if (status) {
            filter.status = String(status);
        }

        const [orders, total] = await Promise.all([
            LabOrder.find(filter)
                .populate('labId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            LabOrder.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('getMyLabOrders error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab orders' });
    }
};

/** GET /api/lab-orders/:id — Get single order (owner or admin). */
export const getLabOrderById = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid order id' });
        }

        const order = await LabOrder.findById(id).populate('labId').lean();
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (authReq.user?.role !== 'admin' && order.userId !== userId) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
        }

        return res.json({ success: true, data: order });
    } catch (error) {
        console.error('getLabOrderById error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab order' });
    }
};

/** POST /api/lab-orders/:id/cancel — Cancel own order if it has not progressed too far. */
export const cancelMyLabOrder = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid order id' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (authReq.user?.role !== 'admin' && order.userId !== userId) {
            return res.status(403).json({ success: false, error: 'Not authorized to cancel this order' });
        }

        const cancellableStatuses = ['created', 'payment_pending', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: `Order cannot be cancelled once status is '${order.status}'`,
            });
        }

        order.status = 'cancelled';
        await order.save();

        await notifyLabOrderStatusChanged({
            patientUserId: order.userId,
            orderId: order._id.toString(),
            status: order.status,
        });

        const populated = await LabOrder.findById(order._id).populate('labId').lean();

        return res.json({
            success: true,
            message: 'Lab order cancelled successfully',
            data: populated,
        });
    } catch (error) {
        console.error('cancelMyLabOrder error:', error);
        return res.status(500).json({ success: false, error: 'Failed to cancel lab order' });
    }
};

/** PATCH /api/lab-orders/:id/status — Update order status (admin only for now). */
export const updateLabOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid order id' });
        }

        const order = await LabOrder.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (!canTransition(order.status, status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from '${order.status}' to '${status}'`,
            });
        }

        order.status = status;
        await order.save();

        await notifyLabOrderStatusChanged({
            patientUserId: order.userId,
            orderId: order._id.toString(),
            status,
        });

        const populated = await LabOrder.findById(order._id).populate('labId').lean();

        return res.json({
            success: true,
            message: 'Lab order status updated',
            data: populated,
        });
    } catch (error) {
        console.error('updateLabOrderStatus error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update lab order status' });
    }
};
