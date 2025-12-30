import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    date: Date;
    timeSlot: {
        start: string;
        end: string;
    };
    type: 'video' | 'clinic' | 'home';
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    symptoms?: string;
    notes?: string;
    prescription?: string;
    amount: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    meetingLink?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    timeSlot: {
        start: { type: String, required: true },
        end: { type: String, required: true },
    },
    type: { type: String, enum: ['video', 'clinic', 'home'], required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    symptoms: { type: String },
    notes: { type: String },
    prescription: { type: String },
    amount: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    meetingLink: { type: String },
}, { timestamps: true });

// Indexes for query performance
AppointmentSchema.index({ patientId: 1, date: 1 });
AppointmentSchema.index({ doctorId: 1, date: 1 });
AppointmentSchema.index({ date: 1, status: 1 });
AppointmentSchema.index({ status: 1, createdAt: -1 }); // Admin panel: filter by status
AppointmentSchema.index({ type: 1, status: 1 }); // Admin panel: filter by type
AppointmentSchema.index({ paymentStatus: 1, createdAt: -1 }); // Revenue stats
AppointmentSchema.index({ createdAt: -1 }); // Dashboard recent appointments

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
