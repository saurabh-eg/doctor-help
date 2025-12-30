import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';

import { User } from '../../models';
import { Counter } from '../../models/counter.model';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-key-change-in-production'
);

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req: Request, res: Response) => {
    const { phone } = req.body;

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone, { otp, expiresAt });

    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
        success: true,
        message: 'OTP sent successfully',
        debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
};

export const verifyOTP = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;

    const storedOTP = otpStore.get(phone);
    if (!storedOTP) {
        return res.status(400).json({ success: false, error: 'OTP expired or not found' });
    }

    if (Date.now() > storedOTP.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (storedOTP.otp !== otp) {
        return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    otpStore.delete(phone);

    let user = await User.findOne({ phone });
    let isNewUser = false;


    if (!user) {
        // Atomic increment for userId (can be role-based if needed)
        const counter = await Counter.findByIdAndUpdate(
            'user',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const newUserId = counter.seq;
        user = await User.create({
            phone,
            role: 'patient', // Default role
            isPhoneVerified: true,
            userId: newUserId
        });
        isNewUser = true;
    }

    const token = await new SignJWT({
        userId: user._id.toString(),
        phone: user.phone,
        role: user.role,
        numericUserId: user.userId
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user._id,
                userId: user.userId,
                phone: user.phone,
                role: user.role,
                numericUserId: user.userId,
                isNewUser
            }
        }
    });
};

export const refresh = async (req: any, res: Response) => {
    const { user } = req;

    const newToken = await new SignJWT({
        userId: user.userId,
        phone: user.phone,
        role: user.role,
        numericUserId: user.numericUserId
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

    res.json({
        success: true,
        data: { token: newToken }
    });
};

export const getMe = async (req: any, res: Response) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
        success: true,
        data: {
            id: user._id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            userId: user.userId
        }
    });
};
