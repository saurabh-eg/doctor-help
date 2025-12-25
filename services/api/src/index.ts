import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import mongoose from 'mongoose';

// Import modules
import { authModule } from './modules/auth';
import { usersModule } from './modules/users';
import { doctorsModule } from './modules/doctors';
import { appointmentsModule } from './modules/appointments';

// Database connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-help';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Create app
const app = new Elysia()
    .use(cors())

    // Health check
    .get('/', () => ({
        status: 'ok',
        message: '🏥 Doctor Help API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    }))

    .get('/health', () => ({
        status: 'healthy',
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }))

    // Register modules under /api prefix
    .group('/api', (app) => app
        .use(authModule)
        .use(usersModule)
        .use(doctorsModule)
        .use(appointmentsModule)
    )

    // Global error handler
    .onError(({ code, error, set }) => {
        console.error(`❌ Error [${code}]:`, error);

        if (code === 'VALIDATION') {
            set.status = 400;
            return { success: false, error: 'Validation error', details: error.message };
        }

        set.status = 500;
        return { success: false, error: 'Internal server error' };
    })

    .listen(process.env.PORT || 3001);

// Start server
const startServer = async () => {
    await connectDB();
    console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`);
    console.log(`📚 API available at http://localhost:${app.server?.port}/api`);
};

startServer();

export type App = typeof app;
