import { Elysia } from 'elysia';
import mongoose from 'mongoose';

const app = new Elysia()
    .get('/', () => 'Hello from Doctor Help API')
    .listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

// Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-help');
//     console.log('✅ Connected to MongoDB');
//   } catch (error) {
//     console.error('❌ MongoDB Connection Error:', error);
//   }
// };
// connectDB();
