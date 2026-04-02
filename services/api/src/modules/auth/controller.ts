import { Request, Response } from 'express';
import { SignJWT } from 'jose';
import crypto from 'crypto';

import { Otp, User } from '../../models';
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
const OTP_DEV_MODE = (process.env.OTP_DEV_MODE || '').toLowerCase() === 'true';
const OTP_DEV_FALLBACK = process.env.OTP_DEV_OTP || '123456';
const normalizeMobile = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    return /^91\d{10}$/.test(digitsOnly) ? digitsOnly.slice(2) : digitsOnly;
};

/** POST /api/auth/send-otp — Generate and send OTP to a mobile number. */
export const sendOtpController = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body as { mobile: string };
        const normalizedMobile = normalizeMobile(mobile);

        // Cooldown guard: prevent resend within 60 seconds
        const existingOtp = await Otp.findOne({ mobile: normalizedMobile }).sort({ createdAt: -1 });
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

        const otp = OTP_DEV_MODE ? OTP_DEV_FALLBACK : generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await Otp.deleteMany({ mobile: normalizedMobile });
        await Otp.create({
            mobile: normalizedMobile,
            otp: hashOTP(otp),
            expiresAt,
        });

        let smsSent = false;
        if (OTP_DEV_MODE) {
            smsSent = true;
            console.info(`OTP_DEV_MODE enabled. Skipping SMS send for ${normalizedMobile}`);
        } else {
            smsSent = await sendOTP(normalizedMobile, otp);
            if (!smsSent) {
                console.error(`OTP SMS delivery failed for ${normalizedMobile}`);
                await Otp.deleteMany({ mobile: normalizedMobile });
                return res.status(502).json({
                    success: false,
                    error: 'Failed to deliver OTP. Please try again in a moment.',
                });
            }
        }

        res.json({
            success: true,
            message: OTP_DEV_MODE
                ? 'OTP generated in development mode'
                : smsSent
                ? 'OTP sent successfully'
                : 'OTP generated successfully. SMS delivery is delayed, please retry if needed.',
            data: {
                smsSent,
                expiresAt,
                cooldown: OTP_COOLDOWN_SECONDS,
            },
            debug_otp: (process.env.NODE_ENV === 'development' || OTP_DEV_MODE) ? otp : undefined,
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
        const normalizedMobile = normalizeMobile(mobile);

        const hashedOtp = hashOTP(otp);
        const existingOtp = await Otp.findOne({ mobile: normalizedMobile, otp: hashedOtp }).sort({ createdAt: -1 });
        if (!existingOtp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP' });
        }

        if (existingOtp.expiresAt.getTime() < Date.now()) {
            await Otp.deleteMany({ mobile: normalizedMobile });
            return res.status(400).json({ success: false, error: 'OTP expired' });
        }

        await Otp.deleteMany({ mobile: normalizedMobile });

        let user = await User.findOne({ phone: normalizedMobile });
        const isNewUser = !user;

        if (user && !user.isPhoneVerified) {
            user.isPhoneVerified = true;
            await user.save();
        }

        // Block suspended users from logging in
        if (user?.isSuspended) {
            return res.status(403).json({
                success: false,
                error: 'Your account has been suspended',
                data: { reason: user.suspendedReason }
            });
        }

        const tokenPayload = user
            ? {
                userId: user._id.toString(),
                phone: user.phone,
                role: user.role,
                numericUserId: user.userId,
                onboarding: false,
            }
            : {
                phone: normalizedMobile,
                role: 'patient' as const,
                onboarding: true,
            };

        const token = await new SignJWT(tokenPayload)
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
                    _id: user?._id || 'me',
                    userId: user?.userId,
                    phone: user?.phone || normalizedMobile,
                    name: user?.name,
                    email: user?.email,
                    role: user?.role || 'patient',
                    avatar: user?.avatar,
                    isPhoneVerified: true,
                    isProfileComplete: user?.isProfileComplete ?? false,
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

        // Re-fetch user from DB to check suspension & get fresh role.
        // For onboarding tokens (no userId yet), resolve by phone.
        const dbUser = jwtUser?.userId
            ? await User.findById(jwtUser.userId)
            : await User.findOne({ phone: jwtUser?.phone });

        if (!dbUser) {
            if (!jwtUser?.phone) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const onboardingToken = await new SignJWT({
                phone: jwtUser.phone,
                role: 'patient',
                onboarding: true,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(JWT_EXPIRATION)
                .sign(getJwtSecret());

            return res.json({
                success: true,
                data: { token: onboardingToken }
            });
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
        const jwtUser = authReq.user;

        const user = jwtUser?.userId
            ? await User.findById(jwtUser.userId)
            : await User.findOne({ phone: jwtUser?.phone });

        if (!user) {
            if (!jwtUser?.phone) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            return res.json({
                success: true,
                data: {
                    _id: 'me',
                    phone: jwtUser.phone,
                    name: undefined,
                    email: undefined,
                    role: 'patient',
                    avatar: undefined,
                    userId: undefined,
                    isPhoneVerified: true,
                    isProfileComplete: false,
                    isNewUser: true,
                }
            });
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
