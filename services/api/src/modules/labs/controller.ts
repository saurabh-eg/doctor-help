import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Lab, LabTest, LabPackage, User } from '../../models';
import { PAGINATION } from '../../utils/pagination';
import { escapeRegex } from '../../utils/regex';

const toRadians = (value: number): number => (value * Math.PI) / 180;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
};

/** GET /api/labs — List active labs (optional nearest sort with lat/lng). */
export const listLabs = async (req: Request, res: Response) => {
    try {
        const {
            page = String(PAGINATION.DEFAULT_PAGE),
            limit = String(PAGINATION.DEFAULT_LIMIT),
            search,
            city,
            state,
            lat,
            lng,
        } = req.query;

        const limitNum = Math.min(Number(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const pageNum = Number(page) || PAGINATION.DEFAULT_PAGE;
        const skip = (pageNum - 1) * limitNum;

        const filter: Record<string, any> = { isActive: true };
        if (search) {
            const safe = escapeRegex(String(search));
            filter.$or = [
                { name: { $regex: safe, $options: 'i' } },
                { 'address.city': { $regex: safe, $options: 'i' } },
                { 'address.state': { $regex: safe, $options: 'i' } },
                { 'address.pincode': { $regex: safe, $options: 'i' } },
            ];
        }
        if (city) {
            filter['address.city'] = { $regex: escapeRegex(String(city)), $options: 'i' };
        }
        if (state) {
            filter['address.state'] = { $regex: escapeRegex(String(state)), $options: 'i' };
        }

        const suspendedLabUsers = await User.find({
            role: 'lab',
            isSuspended: true,
        }).select('_id').lean();
        const suspendedLabUserIds = suspendedLabUsers.map((u: any) => u._id);
        if (suspendedLabUserIds.length > 0) {
            filter.$or = [
                { createdBy: { $exists: false } },
                { createdBy: null },
                { createdBy: { $nin: suspendedLabUserIds } },
            ];
        }

        const [labs, total] = await Promise.all([
            Lab.find(filter)
                .sort({ rating: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Lab.countDocuments(filter),
        ]);

        const hasCoordinates = lat !== undefined && lng !== undefined;
        const mapped = hasCoordinates
            ? labs
                .map((lab) => {
                    const [labLng, labLat] = lab.location.coordinates;
                    const distanceKm = haversineKm(Number(lat), Number(lng), labLat, labLng);
                    return {
                        ...lab,
                        distanceKm: Number(distanceKm.toFixed(2)),
                    };
                })
                .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
            : labs;

        return res.json({
            success: true,
            data: mapped,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('listLabs error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch labs' });
    }
};

/** GET /api/labs/:id — Get single lab with summary counts. */
export const getLabById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid lab id' });
        }

        const [lab, testsCount, packagesCount] = await Promise.all([
            Lab.findById(id).lean(),
            LabTest.countDocuments({ labId: id, isActive: true }),
            LabPackage.countDocuments({ labId: id, isActive: true }),
        ]);

        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        if (lab.createdBy) {
            const suspendedOwner = await User.exists({ _id: lab.createdBy, isSuspended: true });
            if (suspendedOwner) {
                return res.status(404).json({ success: false, error: 'Lab not found' });
            }
        }

        return res.json({
            success: true,
            data: {
                ...lab,
                testsCount,
                packagesCount,
            },
        });
    } catch (error) {
        console.error('getLabById error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab' });
    }
};

/** GET /api/labs/:id/catalog — Fetch tests and packages for a selected lab. */
export const getLabCatalog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid lab id' });
        }

        const [lab, tests, packages] = await Promise.all([
            Lab.findById(id).lean(),
            LabTest.find({ labId: id, isActive: true }).sort({ name: 1 }).lean(),
            LabPackage.find({ labId: id, isActive: true }).sort({ name: 1 }).lean(),
        ]);

        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        if (lab.createdBy) {
            const suspendedOwner = await User.exists({ _id: lab.createdBy, isSuspended: true });
            if (suspendedOwner) {
                return res.status(404).json({ success: false, error: 'Lab not found' });
            }
        }

        return res.json({
            success: true,
            data: {
                lab,
                tests,
                packages,
            },
        });
    } catch (error) {
        console.error('getLabCatalog error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch lab catalog' });
    }
};

/** GET /api/labs/compare/tests/:testName — Compare price/rating across labs for one test. */
export const compareTestPrices = async (req: Request, res: Response) => {
    try {
        const { testName } = req.params;
        const { lat, lng } = req.query;

        const suspendedLabUsers = await User.find({
            role: 'lab',
            isSuspended: true,
        }).select('_id').lean();
        const suspendedOwnerIds = new Set(suspendedLabUsers.map((u: any) => String(u._id)));

        const tests = await LabTest.find({
            isActive: true,
            name: new RegExp(String(testName), 'i'),
        })
            .populate('labId')
            .lean();

        const results = tests
            .map((test: any) => {
                const lab = test.labId;
                if (!lab || !lab.isActive) {
                    return null;
                }
                if (lab.createdBy && suspendedOwnerIds.has(String(lab.createdBy))) {
                    return null;
                }

                const price = test.discountedPrice ?? test.price;
                const item: Record<string, unknown> = {
                    labId: lab._id,
                    labName: lab.name,
                    city: lab.address?.city,
                    state: lab.address?.state,
                    rating: lab.rating,
                    testId: test._id,
                    testName: test.name,
                    price,
                    preparationInstructions: test.preparationInstructions || [],
                    fastingHours: test.fastingHours,
                };

                if (lat !== undefined && lng !== undefined && lab.location?.coordinates?.length === 2) {
                    const [labLng, labLat] = lab.location.coordinates;
                    item.distanceKm = Number(haversineKm(Number(lat), Number(lng), labLat, labLng).toFixed(2));
                }

                return item;
            })
            .filter(Boolean) as Record<string, unknown>[];

        results.sort((a, b) => Number(a.price) - Number(b.price));

        return res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('compareTestPrices error:', error);
        return res.status(500).json({ success: false, error: 'Failed to compare tests' });
    }
};

/** POST /api/labs (admin) — Create a new lab profile. */
export const createLab = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, address, location, isNablCertified } = req.body;

        const lab = await Lab.create({
            name,
            phone,
            email,
            address,
            location,
            isNablCertified,
            createdBy: undefined,
        });

        return res.status(201).json({
            success: true,
            message: 'Lab created successfully',
            data: lab,
        });
    } catch (error) {
        console.error('createLab error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create lab' });
    }
};

/** POST /api/labs/:id/tests (admin) — Add a test to a lab catalog. */
export const createLabTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid lab id' });
        }

        const lab = await Lab.findById(id);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        const test = await LabTest.create({
            ...req.body,
            labId: id,
        });

        return res.status(201).json({
            success: true,
            message: 'Lab test created successfully',
            data: test,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, error: 'Test code already exists for this lab' });
        }

        console.error('createLabTest error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create lab test' });
    }
};

/** POST /api/labs/:id/packages (admin) — Add a package to a lab catalog. */
export const createLabPackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, error: 'Invalid lab id' });
        }

        const lab = await Lab.findById(id);
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        const pkg = await LabPackage.create({
            ...req.body,
            labId: id,
        });

        return res.status(201).json({
            success: true,
            message: 'Lab package created successfully',
            data: pkg,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, error: 'Package code already exists for this lab' });
        }

        console.error('createLabPackage error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create lab package' });
    }
};
