import { Request, Response } from 'express';
import { Appointment, Doctor } from '../../models';

export const createAppointment = async (req: Request, res: Response) => {
    const { patientId, doctorId, date, timeSlot, type, symptoms } = req.body;

    // Get doctor to check fee
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Check for conflicts
    const existingAppointment = await Appointment.findOne({
        doctorId,
        date: new Date(date),
        'timeSlot.start': timeSlot.start,
        status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
        return res.status(400).json({ success: false, error: 'This slot is already booked' });
    }

    const appointment = await Appointment.create({
        patientId,
        doctorId,
        date: new Date(date),
        timeSlot,
        type,
        symptoms,
        amount: doctor.consultationFee,
        status: 'pending'
    });

    res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
    });
};

export const getPatientAppointments = async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { status, upcoming } = req.query;

    const filter: any = { patientId };
    if (status) filter.status = status;
    if (upcoming === 'true') {
        filter.date = { $gte: new Date() };
    }

    const appointments = await Appointment.find(filter)
        .populate({
            path: 'doctorId',
            populate: {
                path: 'userId',
                select: 'name phone'
            }
        })
        .sort({ date: -1, 'timeSlot.start': 1 });

    res.json({
        success: true,
        data: appointments
    });
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const { status, date } = req.query;

    const filter: any = { doctorId };
    if (status) filter.status = status;
    if (date) {
        const queryDate = new Date(date as string);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
        filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
        .populate('patientId', 'name phone avatar')
        .sort({ date: 1, 'timeSlot.start': 1 });

    res.json({
        success: true,
        data: appointments
    });
};

export const updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({
        success: true,
        message: `Appointment ${status}`,
        data: appointment
    });
};

export const updateNotesSource = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes, prescription } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
        id,
        { notes, prescription },
        { new: true }
    );

    if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({
        success: true,
        message: 'Notes updated',
        data: appointment
    });
};

export const cancelAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
        return res.status(400).json({ success: false, error: 'Cannot cancel completed appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
        success: true,
        message: 'Appointment cancelled'
    });
};
