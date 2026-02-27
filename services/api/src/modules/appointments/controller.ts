import { Request, Response } from 'express';
import { Appointment, Doctor } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';
import { PAGINATION } from '../../utils/pagination';

/** POST /api/appointments — Book a new appointment (authenticated patient). */
export const createAppointment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { doctorId, date, timeSlot, type, symptoms } = req.body;

        // Use authenticated user's ID as patientId — don't trust body
        const patientId = authReq.user?.userId;
        if (!patientId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Parse date as YYYY-MM-DD to avoid timezone shifts
        const [year, month, day] = date.split('-').map(Number);
        const appointmentDate = new Date(Date.UTC(year, month - 1, day));
        const now = new Date();
        const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        if (appointmentDate < today) {
            return res.status(400).json({ success: false, error: 'Cannot book an appointment in the past' });
        }

        // If booking for today, ensure the slot start time hasn't passed
        if (appointmentDate.getTime() === today.getTime() && timeSlot?.start) {
            const [slotHour, slotMin] = timeSlot.start.split(':').map(Number);
            const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour, slotMin);
            if (slotStart <= now) {
                return res.status(400).json({ success: false, error: 'This time slot has already passed for today' });
            }
        }

        // Get doctor to check fee
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        // Check for conflicts
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: appointmentDate,
            'timeSlot.start': timeSlot.start,
            status: { $nin: ['cancelled', 'no-show'] }
        });

        if (existingAppointment) {
            return res.status(400).json({ success: false, error: 'This slot is already booked' });
        }

        let appointment;
        try {
            appointment = await Appointment.create({
                patientId,
                doctorId,
                date: appointmentDate,
                timeSlot,
                type,
                symptoms,
                amount: doctor.consultationFee,
                status: 'pending'
            });
        } catch (err: any) {
            // Handle duplicate key error from the unique compound index (race condition)
            if (err.code === 11000) {
                return res.status(400).json({ success: false, error: 'This slot is already booked' });
            }
            throw err;
        }

        // Populate doctorId so the client receives a full object (not a raw ObjectId string)
        await appointment.populate({ path: 'doctorId', populate: { path: 'userId', select: 'name phone' } });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        console.error('createAppointment error:', error);
        res.status(500).json({ success: false, error: 'Failed to create appointment' });
    }
};

/** GET /api/appointments/patient/:patientId — List a patient's appointments (owner or admin). */
export const getPatientAppointments = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { patientId } = req.params;

        // Patients can only view their own appointments, admins can view any
        if (patientId !== authReq.user?.userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'You can only view your own appointments' });
        }

        const { status, upcoming, page = '1', limit = String(PAGINATION.DEFAULT_LIMIT) } = req.query;
        const skip = (Number(page) - 1) * Math.min(Number(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const limitNum = Math.min(Number(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const filter: any = { patientId };
        if (status) filter.status = status;
        if (upcoming === 'true') {
            filter.date = { $gte: new Date() };
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(filter)
                .populate({
                    path: 'doctorId',
                    populate: {
                        path: 'userId',
                        select: 'name phone'
                    }
                })
                .sort({ date: -1, 'timeSlot.start': 1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Appointment.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: Number(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            }
        });
    } catch (error) {
        console.error('getPatientAppointments error:', error);
        res.status(500).json({ success: false, error: 'Failed to get appointments' });
    }
};

/** GET /api/appointments/doctor/:doctorId — List a doctor's appointments (owner or admin). */
export const getDoctorAppointments = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { doctorId } = req.params;

        // Doctors can only view their own appointments, admins can view any
        // We need to check if the authenticated user owns this doctor profile
        if (authReq.user?.role !== 'admin') {
            const doctor = await Doctor.findById(doctorId);
            if (!doctor || doctor.userId.toString() !== authReq.user?.userId) {
                return res.status(403).json({ success: false, error: 'You can only view your own appointments' });
            }
        }

        const { status, date, page = '1', limit = String(PAGINATION.DEFAULT_LIMIT) } = req.query;
        const limitNum = Math.min(Number(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
        const skip = (Number(page) - 1) * limitNum;
        const filter: any = { doctorId };
        if (status) filter.status = status;
        if (date) {
            const queryDate = new Date(date as string);
            const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(filter)
                .populate('patientId', 'name phone avatar')
                .sort({ date: 1, 'timeSlot.start': 1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Appointment.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: Number(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            }
        });
    } catch (error) {
        console.error('getDoctorAppointments error:', error);
        res.status(500).json({ success: false, error: 'Failed to get appointments' });
    }
};

// Valid status transitions (state machine)
const VALID_TRANSITIONS: Record<string, string[]> = {
    'pending':     ['confirmed', 'cancelled'],
    'confirmed':   ['in-progress', 'cancelled', 'no-show'],
    'in-progress': ['completed', 'cancelled'],
    'completed':   [],            // Terminal state
    'cancelled':   [],            // Terminal state
    'no-show':     [],            // Terminal state
};

/** PATCH /api/appointments/:id/status — Transition appointment status (state-machine validated). */
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findById(id).populate('doctorId', 'userId');
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Validate status transition
        const allowed = VALID_TRANSITIONS[appointment.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from '${appointment.status}' to '${status}'`
            });
        }

        // Only the doctor (confirm/complete/in-progress) or admin can update status
        // Patient can only cancel their own appointments
        const isAdmin = authReq.user?.role === 'admin';
        const isPatient = appointment.patientId.toString() === authReq.user?.userId;

        if (!isAdmin) {
            // Check if user is the doctor who owns the appointment
            const populatedDoctor = appointment.doctorId as any;
            const isDoctor = populatedDoctor?.userId && populatedDoctor.userId.toString() === authReq.user?.userId;

            if (!isDoctor && !isPatient) {
                return res.status(403).json({ success: false, error: 'Not authorized to update this appointment' });
            }

            // Patients can only cancel
            if (isPatient && status !== 'cancelled') {
                return res.status(403).json({ success: false, error: 'Patients can only cancel appointments' });
            }
        }

        appointment.status = status;
        await appointment.save();

        // Re-fetch with proper population so the response matches list endpoints
        const populated = await Appointment.findById(appointment._id)
            .populate({
                path: 'doctorId',
                select: 'userId',
                populate: { path: 'userId', select: 'name phone avatar' }
            })
            .populate('patientId', 'name phone avatar')
            .lean();

        res.json({
            success: true,
            message: `Appointment ${status}`,
            data: populated
        });
    } catch (error) {
        console.error('updateStatus error:', error);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
};

/** PATCH /api/appointments/:id/notes — Add or update notes and prescription (doctor or admin). */
export const updateNotes = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { id } = req.params;
        const { notes, prescription } = req.body;

        const appointment = await Appointment.findById(id).populate('doctorId', 'userId');
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Only the doctor who owns this appointment or admin can add notes
        if (authReq.user?.role !== 'admin') {
            const populatedDoctor = appointment.doctorId as any;
            if (!populatedDoctor?.userId || populatedDoctor.userId.toString() !== authReq.user?.userId) {
                return res.status(403).json({ success: false, error: 'Only the assigned doctor can update notes' });
            }
        }

        appointment.notes = notes;
        appointment.prescription = prescription;
        await appointment.save();

        const populated = await Appointment.findById(appointment._id)
            .populate({
                path: 'doctorId',
                select: 'userId',
                populate: { path: 'userId', select: 'name phone avatar' }
            })
            .populate('patientId', 'name phone avatar')
            .lean();

        res.json({
            success: true,
            message: 'Notes updated',
            data: populated
        });
    } catch (error) {
        console.error('updateNotes error:', error);
        res.status(500).json({ success: false, error: 'Failed to update notes' });
    }
};

/** PATCH /api/appointments/:id/reschedule — Reschedule a pending/confirmed appointment. */
export const rescheduleAppointment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { id } = req.params;
        const { date, timeSlot } = req.body;

        const appointment = await Appointment.findById(id).populate('doctorId', 'userId');
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Only pending or confirmed appointments can be rescheduled
        if (!['pending', 'confirmed'].includes(appointment.status)) {
            return res.status(400).json({ success: false, error: `Cannot reschedule a ${appointment.status} appointment` });
        }

        // Only patient, doctor, or admin can reschedule
        const isAdmin = authReq.user?.role === 'admin';
        const isPatient = appointment.patientId.toString() === authReq.user?.userId;
        const populatedDoctor = appointment.doctorId as any;
        const isDoctor = !!(populatedDoctor?.userId && populatedDoctor.userId.toString() === authReq.user?.userId);

        if (!isAdmin && !isPatient && !isDoctor) {
            return res.status(403).json({ success: false, error: 'Not authorized to reschedule this appointment' });
        }

        // Prevent rescheduling to the past
        if (new Date(date) < new Date()) {
            return res.status(400).json({ success: false, error: 'Cannot reschedule to a past date' });
        }

        // Check for conflicts at the new slot
        const conflict = await Appointment.findOne({
            _id: { $ne: id },
            doctorId: appointment.doctorId,
            date: new Date(date),
            'timeSlot.start': timeSlot.start,
            status: { $nin: ['cancelled', 'no-show'] }
        });

        if (conflict) {
            return res.status(400).json({ success: false, error: 'This slot is already booked' });
        }

        appointment.date = new Date(date);
        appointment.timeSlot = timeSlot;
        appointment.status = 'pending'; // Reset to pending after reschedule
        await appointment.save();

        const populated = await Appointment.findById(appointment._id)
            .populate({
                path: 'doctorId',
                select: 'userId',
                populate: { path: 'userId', select: 'name phone avatar' }
            })
            .populate('patientId', 'name phone avatar')
            .lean();

        res.json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: populated
        });
    } catch (error) {
        console.error('rescheduleAppointment error:', error);
        res.status(500).json({ success: false, error: 'Failed to reschedule appointment' });
    }
};

/** DELETE /api/appointments/:id — Cancel an appointment (patient, doctor, or admin). */
export const cancelAppointment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { id } = req.params;
        const appointment = await Appointment.findById(id).populate('doctorId', 'userId');

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Only the patient, the doctor, or admin can cancel
        const isAdmin = authReq.user?.role === 'admin';
        const isPatient = appointment.patientId.toString() === authReq.user?.userId;
        let isDoctor = false;
        if (!isAdmin && !isPatient) {
            const populatedDoctor = appointment.doctorId as any;
            isDoctor = !!(populatedDoctor?.userId && populatedDoctor.userId.toString() === authReq.user?.userId);
        }

        if (!isAdmin && !isPatient && !isDoctor) {
            return res.status(403).json({ success: false, error: 'Not authorized to cancel this appointment' });
        }

        // Use state machine for cancellation validation
        const allowed = VALID_TRANSITIONS[appointment.status] || [];
        if (!allowed.includes('cancelled')) {
            return res.status(400).json({ success: false, error: `Cannot cancel a ${appointment.status} appointment` });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled'
        });
    } catch (error) {
        console.error('cancelAppointment error:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel appointment' });
    }
};
