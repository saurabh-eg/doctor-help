import { Request, Response } from 'express';
import { SignJWT } from 'jose';
import crypto from 'crypto';

import { Otp, User } from '../../models';
import { Counter } from '../../models/counter.model';
import { sendOTP } from './utils/send-otp';
import { AuthenticatedRequest } from '../../middleware/auth';
import { getJwtSecret } from '../../utils/jwt';

// Generate 6-digit OTP using cryptographically secure random
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Hash OTP for secure storage (one-way)
const hashOTP = (otp: string): string =>
    crypto.createHash('sha256').update(otp).digest('hex');

const OTP_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 10;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '45d';

/** POST /api/auth/send-otp — Generate and send OTP to a mobile number. */
export const sendOtpController = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body as { mobile: string };

        // Cooldown guard: prevent resend within 60 seconds
        const existingOtp = await Otp.findOne({ mobile }).sort({ createdAt: -1 });
        if (existingOtp) {
            const elapsedMs = Date.now() - existingOtp.createdAt.getTime();
            const remainingSeconds = Math.ceil((OTP_COOLDOWN_SECONDS * 1000 - elapsedMs) / 1000);
            if (remainingSeconds > 0) {
                return res.status(429).json({
                    success: false,
                    error: `OTP already sent. Please wait ${remainingSeconds} seconds before requesting again.`,
                    data: { retryAfter: remainingSeconds },
                });
            }
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await Otp.deleteMany({ mobile });
        await Otp.create({
            mobile,
            otp: hashOTP(otp),
            expiresAt,
        });

        const smsSent = await sendOTP(mobile, otp);
        if (!smsSent) {
            console.error(`OTP SMS delivery failed for ${mobile}`);
        }

        res.json({
            success: true,
            message: smsSent
                ? 'OTP sent successfully'
                : 'OTP generated successfully. SMS delivery is delayed, please retry if needed.',
            data: {
                smsSent,
                expiresAt,
                cooldown: OTP_COOLDOWN_SECONDS,
            },
            debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        });
    } catch (error) {
        console.error('sendOtpController error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP',
        });
    }
};

/** POST /api/auth/verify-otp — Verify OTP and issue JWT (creates user if new). */
export const verifyOtpController = async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body as { mobile: string; otp: string };

        const hashedOtp = hashOTP(otp);
        const existingOtp = await Otp.findOne({ mobile, otp: hashedOtp }).sort({ createdAt: -1 });
        if (!existingOtp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP' });
        }

        if (existingOtp.expiresAt.getTime() < Date.now()) {
            await Otp.deleteMany({ mobile });
            return res.status(400).json({ success: false, error: 'OTP expired' });
        }

        await Otp.deleteMany({ mobile });

        let user = await User.findOne({ phone: mobile });
        let isNewUser = false;

        if (!user) {
            const counter = await Counter.findByIdAndUpdate(
                'user',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            const newUserId = counter.seq;
            user = await User.create({
                phone: mobile,
                role: 'patient',
                isPhoneVerified: true,
                isProfileComplete: false,
                userId: newUserId,
            });
            isNewUser = true;
        } else if (!user.isPhoneVerified) {
            user.isPhoneVerified = true;
            await user.save();
        }

        // Block suspended users from logging in
        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                error: 'Your account has been suspended',
                data: { reason: user.suspendedReason }
            });
        }

        const token = await new SignJWT({
            userId: user._id.toString(),
            phone: user.phone,
            role: user.role,
            numericUserId: user.userId,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION)
            .sign(getJwtSecret());

        return res.json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                token,
                user: {
                    _id: user._id,
                    userId: user.userId,
                    phone: user.phone,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    isPhoneVerified: user.isPhoneVerified,
                    isProfileComplete: user.isProfileComplete,
                    isNewUser,
                },
            },
        });
    } catch (error) {
        console.error('verifyOtpController error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to verify OTP',
        });
    }
};

/** POST /api/auth/refresh — Issue a new JWT from the current (still-valid) token. */
export const refresh = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const jwtUser = authReq.user;

        // Re-fetch user from DB to check suspension & get fresh role
        const dbUser = await User.findById(jwtUser?.userId);
        if (!dbUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        if (dbUser.isSuspended) {
            return res.status(403).json({
                success: false,
                error: 'Your account has been suspended',
                data: { reason: dbUser.suspendedReason }
            });
        }

        const newToken = await new SignJWT({
            userId: dbUser._id.toString(),
            phone: dbUser.phone,
            role: dbUser.role,
            numericUserId: dbUser.userId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRATION)
            .sign(getJwtSecret());

        res.json({
            success: true,
            data: { token: newToken }
        });
    } catch (error) {
        console.error('refresh error:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh token' });
    }
};

/** GET /api/auth/me — Return the currently authenticated user's profile. */
export const getMe = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const user = await User.findById(authReq.user?.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                userId: user.userId,
                isPhoneVerified: user.isPhoneVerified,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
};
