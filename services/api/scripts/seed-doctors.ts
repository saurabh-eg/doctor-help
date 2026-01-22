import mongoose from 'mongoose';
import { User, Doctor } from '../src/models';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctor-help';

const sampleDoctors = [
    {
        name: 'Dr. Rajesh Sharma',
        phone: '9876543201',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        consultationFee: 800,
        bio: 'Senior cardiologist with 15+ years of experience in treating heart diseases.',
        rating: 4.8,
        totalReviews: 245,
        isVerified: true,
        availability: [
            { day: 1, startTime: '09:00', endTime: '13:00' },
            { day: 1, startTime: '16:00', endTime: '20:00' },
            { day: 2, startTime: '09:00', endTime: '13:00' },
            { day: 3, startTime: '09:00', endTime: '13:00' },
            { day: 4, startTime: '09:00', endTime: '13:00' },
            { day: 5, startTime: '09:00', endTime: '13:00' },
        ]
    },
    {
        name: 'Dr. Priya Patel',
        phone: '9876543202',
        specialization: 'Dermatologist',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 8,
        consultationFee: 600,
        bio: 'Expert in skin care, acne treatment, and cosmetic dermatology.',
        rating: 4.6,
        totalReviews: 189,
        isVerified: true,
        availability: [
            { day: 1, startTime: '10:00', endTime: '14:00' },
            { day: 2, startTime: '10:00', endTime: '14:00' },
            { day: 3, startTime: '10:00', endTime: '14:00' },
            { day: 5, startTime: '10:00', endTime: '14:00' },
            { day: 6, startTime: '10:00', endTime: '13:00' },
        ]
    },
    {
        name: 'Dr. Amit Kumar',
        phone: '9876543203',
        specialization: 'General Physician',
        qualification: 'MBBS, MD (General Medicine)',
        experience: 12,
        consultationFee: 400,
        bio: 'Comprehensive care for all general health issues and preventive medicine.',
        rating: 4.7,
        totalReviews: 312,
        isVerified: true,
        availability: [
            { day: 0, startTime: '09:00', endTime: '12:00' },
            { day: 1, startTime: '09:00', endTime: '17:00' },
            { day: 2, startTime: '09:00', endTime: '17:00' },
            { day: 3, startTime: '09:00', endTime: '17:00' },
            { day: 4, startTime: '09:00', endTime: '17:00' },
            { day: 5, startTime: '09:00', endTime: '17:00' },
        ]
    },
    {
        name: 'Dr. Sneha Gupta',
        phone: '9876543204',
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 10,
        consultationFee: 500,
        bio: 'Specialized in child healthcare from newborns to adolescents.',
        rating: 4.9,
        totalReviews: 428,
        isVerified: true,
        availability: [
            { day: 1, startTime: '08:00', endTime: '12:00' },
            { day: 1, startTime: '17:00', endTime: '20:00' },
            { day: 2, startTime: '08:00', endTime: '12:00' },
            { day: 3, startTime: '08:00', endTime: '12:00' },
            { day: 4, startTime: '08:00', endTime: '12:00' },
            { day: 5, startTime: '08:00', endTime: '12:00' },
            { day: 6, startTime: '09:00', endTime: '12:00' },
        ]
    },
    {
        name: 'Dr. Vikram Singh',
        phone: '9876543205',
        specialization: 'Orthopedic',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 18,
        consultationFee: 900,
        bio: 'Expert in bone and joint problems, sports injuries, and fractures.',
        rating: 4.5,
        totalReviews: 156,
        isVerified: true,
        availability: [
            { day: 1, startTime: '10:00', endTime: '14:00' },
            { day: 2, startTime: '10:00', endTime: '14:00' },
            { day: 4, startTime: '10:00', endTime: '14:00' },
            { day: 5, startTime: '10:00', endTime: '14:00' },
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({ role: 'doctor' });
        await Doctor.deleteMany({});
        console.log('🧹 Cleared existing doctor data');

        for (const doctorData of sampleDoctors) {
            // Create user first
            const user = await User.create({
                phone: doctorData.phone,
                name: doctorData.name,
                role: 'doctor',
                isPhoneVerified: true
            });

            // Create doctor profile
            await Doctor.create({
                userId: user._id,
                specialization: doctorData.specialization,
                qualification: doctorData.qualification,
                experience: doctorData.experience,
                consultationFee: doctorData.consultationFee,
                bio: doctorData.bio,
                rating: doctorData.rating,
                reviewCount: doctorData.totalReviews,
                isVerified: doctorData.isVerified,
                availableSlots: doctorData.availability
            });

            console.log(`✅ Created: ${doctorData.name}`);
        }

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
