import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import {
    Appointment,
    Doctor,
    Lab,
    LabOrder,
    LabRegistrationRequest,
    Payment,
    Review,
    User,
} from '../src/models';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctor-help';

type Options = {
    apply: boolean;
    olderThanHours: number;
};

function parseOptions(argv: string[]): Options {
    const apply = argv.includes('--apply');

    const hoursArg = argv.find((arg) => arg.startsWith('--older-than-hours='));
    const olderThanHours = hoursArg
        ? Number(hoursArg.split('=')[1])
        : 24;

    if (!Number.isFinite(olderThanHours) || olderThanHours < 1) {
        throw new Error('Invalid --older-than-hours value. Use a number >= 1');
    }

    return { apply, olderThanHours };
}

async function hasLinkedRecords(userId: Types.ObjectId): Promise<boolean> {
    const userIdString = String(userId);

    const [doctor, lab, appointment, review, labOrder, payment, labRegistration] = await Promise.all([
        Doctor.exists({ userId }),
        Lab.exists({ createdBy: userId }),
        Appointment.exists({ patientId: userId }),
        Review.exists({ patientId: userId }),
        LabOrder.exists({ userId: userIdString }),
        Payment.exists({ userId: userIdString }),
        LabRegistrationRequest.exists({ approvedUserId: userIdString }),
    ]);

    return !!(doctor || lab || appointment || review || labOrder || payment || labRegistration);
}

async function run() {
    const options = parseOptions(process.argv.slice(2));
    const cutoff = new Date(Date.now() - options.olderThanHours * 60 * 60 * 1000);

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    console.log(`Mode: ${options.apply ? 'APPLY (deletes enabled)' : 'DRY RUN (no deletes)'}`);
    console.log(`Cutoff: users created before ${cutoff.toISOString()}`);

    const candidates = await User.find({
        role: 'patient',
        isPhoneVerified: true,
        isProfileComplete: false,
        $or: [
            { name: { $exists: false } },
            { name: null },
            { name: '' },
            { name: /^\s+$/ },
        ],
        createdAt: { $lte: cutoff },
    })
        .select('_id phone role isPhoneVerified isProfileComplete name createdAt')
        .lean();

    console.log(`Potential ghost users found by base filter: ${candidates.length}`);

    const safeToDelete: string[] = [];
    for (const user of candidates) {
        const linked = await hasLinkedRecords(new Types.ObjectId(String(user._id)));
        if (!linked) {
            safeToDelete.push(String(user._id));
        }
    }

    console.log(`Safe-to-delete users (after relation checks): ${safeToDelete.length}`);

    if (safeToDelete.length > 0) {
        const preview = candidates
            .filter((u) => safeToDelete.includes(String(u._id)))
            .slice(0, 20)
            .map((u) => ({
                id: String(u._id),
                phone: u.phone,
                createdAt: u.createdAt,
            }));

        console.table(preview);
        if (safeToDelete.length > preview.length) {
            console.log(`...and ${safeToDelete.length - preview.length} more`);
        }
    }

    if (!options.apply) {
        console.log('Dry run complete. Re-run with --apply to delete these users.');
        await mongoose.disconnect();
        return;
    }

    if (safeToDelete.length === 0) {
        console.log('No users to delete.');
        await mongoose.disconnect();
        return;
    }

    const deleteResult = await User.deleteMany({ _id: { $in: safeToDelete } });
    console.log(`Deleted users: ${deleteResult.deletedCount || 0}`);

    await mongoose.disconnect();
    console.log('Done.');
}

run().catch(async (error) => {
    console.error('cleanup-ghost-users failed:', error);
    try {
        await mongoose.disconnect();
    } catch {
        // no-op
    }
    process.exit(1);
});
