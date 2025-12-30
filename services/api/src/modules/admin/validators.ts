import { z } from 'zod';

// Query params for paginated lists
export const paginationSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});

// User filters
export const userFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        search: z.string().optional(),
        role: z.enum(['patient', 'doctor', 'admin', 'all']).optional().default('all'),
        isVerified: z.string().optional().transform(val => val === 'true'),
    }),
});

// Doctor filters
export const doctorFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        search: z.string().optional(),
        specialization: z.string().optional(),
        isVerified: z.string().optional().transform(val => val === 'true'),
        status: z.enum(['pending', 'verified', 'rejected', 'all']).optional().default('all'),
    }),
});

// Appointment filters
export const appointmentFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'all']).optional().default('all'),
        type: z.enum(['video', 'clinic', 'home', 'all']).optional().default('all'),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        doctorId: z.string().optional(),
        patientId: z.string().optional(),
    }),
});

// Verify/Reject doctor
export const verifyDoctorSchema = z.object({
    body: z.object({
        isVerified: z.boolean(),
        rejectionReason: z.string().optional(),
    }),
});

// Suspend user
export const suspendUserSchema = z.object({
    body: z.object({
        isSuspended: z.boolean(),
        reason: z.string().optional(),
    }),
});

// Process refund
export const refundSchema = z.object({
    body: z.object({
        amount: z.number().positive(),
        reason: z.string(),
    }),
});

// Date range for stats
export const statsRangeSchema = z.object({
    query: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
    }),
});
