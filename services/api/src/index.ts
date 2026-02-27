// Load environment variables BEFORE any other imports
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { Server } from 'http';

// Import middleware
import { errorHandler } from './middleware/error';
import { logger } from './utils/logger';

// Import routes
import { authRouter } from './modules/auth/routes';
import { usersRouter } from './modules/users/routes';
import { doctorsRouter } from './modules/doctors/routes';
import { appointmentsRouter } from './modules/appointments/routes';
import { doctorUploadRouter } from './modules/doctors/upload';
import { userUploadRouter } from './modules/users/upload';
import { adminRouter } from './modules/admin/routes';

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Database connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-help';
        await mongoose.connect(mongoUri);
        logger.info('✅ Connected to MongoDB');
    } catch (error) {
        logger.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Middleware
app.use(helmet());

// CORS — restrict to known origins
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://localhost:3001')
    .split(',')
    .map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, health checks)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api', limiter);

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '🏥 Doctor Help API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/doctors', doctorUploadRouter);
app.use('/api/users', userUploadRouter);
app.use('/api/admin', adminRouter);

// Error Handling
app.use(errorHandler);

// Start server
const startListening = (initialPort: number, maxAttempts = 10): Promise<{ server: Server; port: number }> => {
    return new Promise((resolve, reject) => {
        const tryListen = (port: number, attempt: number) => {
            const server = app.listen(port, () => {
                resolve({ server, port });
            });

            server.once('error', (error: NodeJS.ErrnoException) => {
                if (error.code === 'EADDRINUSE' && attempt < maxAttempts) {
                    logger.warn(`⚠️ Port ${port} is in use. Trying port ${port + 1}...`);
                    tryListen(port + 1, attempt + 1);
                    return;
                }

                reject(error);
            });
        };

        tryListen(initialPort, 1);
    });
};

const startServer = async () => {
    // Validate required environment variables at startup
    const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
    const optionalWarnings = ['FAST2SMS_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

    const missing = requiredEnvVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        logger.error(`\n❌ FATAL: Missing required environment variables: ${missing.join(', ')}`);
        logger.error('   Create a .env file or set them in your environment.\n');
        process.exit(1);
    }

    const missingOptional = optionalWarnings.filter(v => !process.env[v]);
    if (missingOptional.length > 0) {
        logger.warn(`⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`);
        logger.warn('   Some features (SMS, uploads) may not work.\n');
    }

    try {
        await connectDB();
        const { port } = await startListening(PORT);
        logger.info(`🚀 Server is running on http://localhost:${port}`);
        logger.info(`📚 API available at http://localhost:${port}/api`);
    } catch (error) {
        logger.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
