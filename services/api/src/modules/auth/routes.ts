import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { User } from '../../models';

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const authModule = new Elysia({ prefix: '/auth' })
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production'
    }))

    // Send OTP
    .post('/send-otp', async ({ body }) => {
        const { phone } = body;

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP
        otpStore.set(phone, { otp, expiresAt });

        // In production, send via SMS gateway (Twilio, MSG91, etc.)
        console.log(`📱 OTP for ${phone}: ${otp}`);

        return {
            success: true,
            message: 'OTP sent successfully',
            // Remove in production - only for testing
            debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
    }, {
        body: t.Object({
            phone: t.String({ minLength: 10, maxLength: 10 })
        })
    })

    // Verify OTP & Login
    .post('/verify-otp', async ({ body, jwt }) => {
        const { phone, otp } = body;

        // Check OTP
        const storedOTP = otpStore.get(phone);
        if (!storedOTP) {
            return { success: false, error: 'OTP expired or not found' };
        }

        if (Date.now() > storedOTP.expiresAt) {
            otpStore.delete(phone);
            return { success: false, error: 'OTP expired' };
        }

        if (storedOTP.otp !== otp) {
            return { success: false, error: 'Invalid OTP' };
        }

        // OTP verified, clear it
        otpStore.delete(phone);

        // Find or create user
        let user = await User.findOne({ phone });
        let isNewUser = false;

        if (!user) {
            user = await User.create({ phone, isVerified: true });
            isNewUser = true;
        } else {
            user.isVerified = true;
            await user.save();
        }

        // Generate JWT
        const token = await jwt.sign({
            userId: user._id.toString(),
            phone: user.phone,
            role: user.role
        });

        return {
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    phone: user.phone,
                    name: user.name,
                    role: user.role,
                    isNewUser
                }
            }
        };
    }, {
        body: t.Object({
            phone: t.String({ minLength: 10, maxLength: 10 }),
            otp: t.String({ minLength: 6, maxLength: 6 })
        })
    })

    // Refresh token
    .post('/refresh', async ({ headers, jwt }) => {
        const authHeader = headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return { success: false, error: 'No token provided' };
        }

        const token = authHeader.substring(7);
        const payload = await jwt.verify(token);

        if (!payload) {
            return { success: false, error: 'Invalid token' };
        }

        // Generate new token
        const newToken = await jwt.sign({
            userId: payload.userId,
            phone: payload.phone,
            role: payload.role
        });

        return {
            success: true,
            data: { token: newToken }
        };
    })

    // Get current user from token
    .get('/me', async ({ headers, jwt }) => {
        const authHeader = headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return { success: false, error: 'No token provided' };
        }

        const token = authHeader.substring(7);
        const payload = await jwt.verify(token);

        if (!payload) {
            return { success: false, error: 'Invalid token' };
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return {
            success: true,
            data: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        };
    });
