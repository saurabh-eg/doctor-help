import { Elysia, t } from 'elysia';
import { Appointment, Doctor } from '../../models';

export const appointmentsModule = new Elysia({ prefix: '/appointments' })

    // Create appointment
    .post('/', async ({ body }) => {
        const { patientId, doctorId, date, timeSlot, type, symptoms } = body;

        // Get doctor to check fee
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return { success: false, error: 'Doctor not found' };
        }

        // Check for conflicts
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: new Date(date),
            'timeSlot.start': timeSlot.start,
            status: { $nin: ['cancelled'] }
        });

        if (existingAppointment) {
            return { success: false, error: 'This slot is already booked' };
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

        return {
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        };
    }, {
        body: t.Object({
            patientId: t.String(),
            doctorId: t.String(),
            date: t.String(),
            timeSlot: t.Object({
                start: t.String(),
                end: t.String()
            }),
            type: t.Union([t.Literal('video'), t.Literal('clinic'), t.Literal('home')]),
            symptoms: t.Optional(t.String())
        })
    })

    // Get appointments for patient
    .get('/patient/:patientId', async ({ params, query }) => {
        const { status, upcoming } = query;

        const filter: any = { patientId: params.patientId };

        if (status) filter.status = status;
        if (upcoming === 'true') {
            filter.date = { $gte: new Date() };
            filter.status = { $nin: ['completed', 'cancelled'] };
        }

        const appointments = await Appointment.find(filter)
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name avatar' }
            })
            .sort({ date: upcoming === 'true' ? 1 : -1 });

        return {
            success: true,
            data: appointments
        };
    })

    // Get appointments for doctor
    .get('/doctor/:doctorId', async ({ params, query }) => {
        const { status, date } = query;

        const filter: any = { doctorId: params.doctorId };

        if (status) filter.status = status;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const appointments = await Appointment.find(filter)
            .populate('patientId', 'name phone avatar')
            .sort({ date: 1, 'timeSlot.start': 1 });

        return {
            success: true,
            data: appointments
        };
    })

    // Get single appointment
    .get('/:id', async ({ params }) => {
        const appointment = await Appointment.findById(params.id)
            .populate('patientId', 'name phone avatar')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name avatar' }
            });

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        return {
            success: true,
            data: appointment
        };
    })

    // Update appointment status
    .patch('/:id/status', async ({ params, body }) => {
        const appointment = await Appointment.findByIdAndUpdate(
            params.id,
            { status: body.status },
            { new: true }
        );

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        return {
            success: true,
            message: `Appointment ${body.status}`,
            data: appointment
        };
    }, {
        body: t.Object({
            status: t.Union([
                t.Literal('pending'),
                t.Literal('confirmed'),
                t.Literal('in-progress'),
                t.Literal('completed'),
                t.Literal('cancelled')
            ])
        })
    })

    // Add prescription/notes to appointment
    .patch('/:id/notes', async ({ params, body }) => {
        const appointment = await Appointment.findByIdAndUpdate(
            params.id,
            {
                notes: body.notes,
                prescription: body.prescription
            },
            { new: true }
        );

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        return {
            success: true,
            message: 'Notes updated',
            data: appointment
        };
    }, {
        body: t.Object({
            notes: t.Optional(t.String()),
            prescription: t.Optional(t.String())
        })
    })

    // Cancel appointment
    .post('/:id/cancel', async ({ params }) => {
        const appointment = await Appointment.findById(params.id);

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        if (appointment.status === 'completed') {
            return { success: false, error: 'Cannot cancel completed appointment' };
        }

        appointment.status = 'cancelled';
        await appointment.save();

        // TODO: Process refund if paid

        return {
            success: true,
            message: 'Appointment cancelled'
        };
    });
