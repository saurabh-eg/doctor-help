/**
 * Seed Admin User
 * Run: npx ts-node scripts/seed-admin.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model';

dotenv.config();

const ADMIN_PHONE = process.env.ADMIN_PHONE || '8603342657';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';

async function seedAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-help';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ phone: ADMIN_PHONE });
        
        if (existingAdmin) {
            if (existingAdmin.role === 'admin') {
                console.log('ℹ️  Admin user already exists:');
                console.log(`   Phone: ${ADMIN_PHONE}`);
                console.log(`   Name: ${existingAdmin.name}`);
                console.log(`   ID: ${existingAdmin._id}`);
            } else {
                // Upgrade to admin
                existingAdmin.role = 'admin';
                existingAdmin.name = ADMIN_NAME;
                existingAdmin.isPhoneVerified = true;
                await existingAdmin.save();
                console.log('✅ Upgraded existing user to admin:');
                console.log(`   Phone: ${ADMIN_PHONE}`);
                console.log(`   Name: ${ADMIN_NAME}`);
            }
        } else {
            // Create new admin
            const admin = new User({
                phone: ADMIN_PHONE,
                name: ADMIN_NAME,
                role: 'admin',
                isPhoneVerified: true,
            });
            await admin.save();
            console.log('✅ Created new admin user:');
            console.log(`   Phone: ${ADMIN_PHONE}`);
            console.log(`   Name: ${ADMIN_NAME}`);
            console.log(`   ID: ${admin._id}`);
        }

        console.log('\n📋 Admin Login Instructions:');
        console.log(`   1. Use phone: ${ADMIN_PHONE}`);
        console.log('   2. OTP will be sent (or use dev OTP: 123456)');
        console.log('   3. Access admin panel at /admin');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

seedAdmin();
