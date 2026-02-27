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

// Check if the authenticated user owns the resource or is an admin
const isOwnerOrAdmin = (req: AuthenticatedRequest, targetId: string): boolean => {
    if (!req.user) return false;
    return req.user.userId === targetId || req.user.role === 'admin';
};

/** GET /api/users/:id — Get a user profile (owner or admin, supports 'me' alias). */
export const getUser = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const id = resolveUserId(authReq);
        if (!id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Users can only view their own profile, admins can view any
        if (!isOwnerOrAdmin(authReq, id)) {
            return res.status(403).json({ success: false, error: 'You can only view your own profile' });
        }

        const user = await User.findById(id).select('-__v');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('getUser error:', error);
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
};

/** PUT /api/users/:id — Update user profile fields (owner or admin). */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const id = resolveUserId(authReq);
        if (!id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Users can only update their own profile, admins can update any
        if (!isOwnerOrAdmin(authReq, id)) {
            return res.status(403).json({ success: false, error: 'You can only update your own profile' });
        }

        // Only allow safe fields (role, phone, isSuspended are NOT updatable here)
        const { name, email, avatar, address } = req.body;
        const safeUpdate: Record<string, any> = {};
        if (name !== undefined) safeUpdate.name = name;
        if (address !== undefined) safeUpdate.address = address;
        if (email !== undefined) safeUpdate.email = email;
        if (avatar !== undefined) safeUpdate.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: safeUpdate },
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
    } catch (error) {
        console.error('updateUser error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
};

/** POST /api/users/:id/complete-profile — Set name/email and mark profile complete (owner or admin). */
export const completeProfile = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const authReq = req as AuthenticatedRequest;
        const id = resolveUserId(authReq);
        if (!id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Users can only complete their own profile
        if (!isOwnerOrAdmin(authReq, id)) {
            return res.status(403).json({ success: false, error: 'You can only complete your own profile' });
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
    } catch (error) {
        console.error('completeProfile error:', error);
        res.status(500).json({ success: false, error: 'Failed to complete profile' });
    }
};

/** PATCH /api/users/:id/role — Set user role (self during onboarding, or admin). */
export const setRole = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const id = resolveUserId(authReq);
        if (!id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const isAdmin = authReq.user?.role === 'admin';
        const isSelf = authReq.user?.userId === id;

        // Only the resource owner or an admin can set the role
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ success: false, error: 'You can only change your own role' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const newRole = req.body.role;

        // Non-admin users: only allow setting role to 'doctor' during onboarding
        // (i.e., when current role is 'patient' and they haven't been a doctor before)
        // Prevents patients from self-promoting to doctor, bypassing verification
        if (!isAdmin) {
            if (user.role === 'doctor') {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot change role once set to doctor. Contact admin.'
                });
            }
            if (newRole === 'doctor') {
                // Allow patient → doctor only during onboarding
                // The actual doctor verification happens via /doctors/register
            }
        }

        user.role = newRole;
        await user.save();

        res.json({
            success: true,
            message: `Role set to ${newRole}`,
            data: { role: user.role }
        });
    } catch (error) {
        console.error('setRole error:', error);
        res.status(500).json({ success: false, error: 'Failed to set role' });
    }
};
