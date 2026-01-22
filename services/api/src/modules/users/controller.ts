import { Request, Response } from 'express';
import { User } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';

// Resolve :id path param, supporting `me` to map to the authenticated user
const resolveUserId = (req: AuthenticatedRequest) => {
    if (req.params.id === 'me') {
        return req.user?.userId || '';
    }
    return req.params.id;
};

export const getUser = async (req: Request, res: Response) => {
    const id = resolveUserId(req as AuthenticatedRequest);
    if (!id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(id).select('-__v');

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
        success: true,
        data: user
    });
};

export const updateUser = async (req: Request, res: Response) => {
    const id = resolveUserId(req as AuthenticatedRequest);
    if (!id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
    ).select('-__v');

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
    });
};

export const completeProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const id = resolveUserId(req as AuthenticatedRequest);
    if (!id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { 
            $set: { 
                name, 
                email,
                isProfileComplete: true 
            } 
        },
        { new: true }
    ).select('-__v');

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
        success: true,
        message: 'Profile completed successfully',
        data: {
            _id: user._id,
            userId: user.userId,
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isPhoneVerified: user.isPhoneVerified,
            isProfileComplete: user.isProfileComplete
        }
    });
};

export const setRole = async (req: Request, res: Response) => {
    const id = resolveUserId(req as AuthenticatedRequest);
    if (!id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role: req.body.role },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
        success: true,
        message: `Role set to ${req.body.role}`,
        data: { role: user.role }
    });
};
