import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lab, LabTest, LabPackage } from '../src/models';

dotenv.config();

async function seedLabs() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-help';
    await mongoose.connect(mongoUri);

    try {
        const existingLab = await Lab.findOne({ name: 'HealthFirst Diagnostics' });
        let labId = existingLab?._id;

        if (!existingLab) {
            const lab = await Lab.create({
                name: 'HealthFirst Diagnostics',
                phone: '9876543210',
                email: 'support@healthfirst.example',
                address: {
                    line1: 'Main Road, Sector 12',
                    city: 'Bokaro',
                    state: 'Jharkhand',
                    pincode: '827012',
                },
                location: {
                    type: 'Point',
                    coordinates: [86.1511, 23.6693],
                },
                rating: 4.3,
                ratingCount: 128,
                isNablCertified: true,
                isActive: true,
            });
            labId = lab._id;
            console.log('Created lab:', lab.name);
        } else {
            console.log('Lab already exists:', existingLab.name);
        }

        if (!labId) {
            throw new Error('Lab id not available');
        }

        const testDefinitions = [
            {
                code: 'CBC',
                name: 'Complete Blood Count (CBC)',
                category: 'Blood',
                price: 250,
                discountedPrice: 210,
                preparationInstructions: ['Water allowed before test', 'Avoid heavy exercise before sample collection'],
                fastingHours: 0,
                sampleType: 'Blood',
                turnaroundHours: 12,
            },
            {
                code: 'LFT',
                name: 'Liver Function Test (LFT)',
                category: 'Blood',
                price: 550,
                discountedPrice: 490,
                preparationInstructions: ['Fasting required for 10 hours', 'Water allowed'],
                fastingHours: 10,
                sampleType: 'Blood',
                turnaroundHours: 24,
            },
            {
                code: 'TSH',
                name: 'Thyroid Stimulating Hormone (TSH)',
                category: 'Hormone',
                price: 450,
                discountedPrice: 399,
                preparationInstructions: ['Do not take thyroid medicine before sample unless advised by doctor'],
                fastingHours: 0,
                sampleType: 'Blood',
                turnaroundHours: 24,
            },
        ];

        const createdTests: Array<{ _id: mongoose.Types.ObjectId; name: string }> = [];

        for (const test of testDefinitions) {
            const existing = await LabTest.findOne({ labId, code: test.code });
            if (existing) {
                createdTests.push({ _id: existing._id, name: existing.name });
                console.log('Test exists:', existing.code);
                continue;
            }

            const created = await LabTest.create({
                ...test,
                labId,
                isActive: true,
            });
            createdTests.push({ _id: created._id, name: created.name });
            console.log('Created test:', created.code);
        }

        const packageCode = 'WELLNESS_BASIC';
        const existingPackage = await LabPackage.findOne({ labId, code: packageCode });

        if (!existingPackage) {
            const packageItems = createdTests.slice(0, 2).map((test) => ({
                testId: test._id,
                nameSnapshot: test.name,
            }));

            if (packageItems.length >= 2) {
                await LabPackage.create({
                    labId,
                    code: packageCode,
                    name: 'Basic Wellness Package',
                    description: 'CBC + LFT package for routine screening',
                    items: packageItems,
                    price: 800,
                    discountedPrice: 650,
                    preparationInstructions: ['Fasting required for 10 hours', 'Carry any recent prescription if available'],
                    isActive: true,
                });
                console.log('Created package:', packageCode);
            }
        } else {
            console.log('Package exists:', packageCode);
        }

        console.log('Lab seed completed successfully.');
    } finally {
        await mongoose.disconnect();
    }
}

seedLabs().catch((error) => {
    console.error('Failed to seed labs:', error);
    process.exit(1);
});
