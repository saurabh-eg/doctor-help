import { Request, Response } from 'express';
import { User } from '../../models';

export const getUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
        success: true,
        data: user
    });
};

export const updateUser = async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
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

export const setRole = async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
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
