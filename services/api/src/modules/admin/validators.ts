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
        role: z.enum(['patient', 'doctor', 'admin', 'lab', 'all']).optional().default('all'),
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

// Lab filters
export const labFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        search: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
    }),
});

// Appointment filters
export const appointmentFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'all']).optional().default('all'),
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

// Activate/deactivate lab
export const labStatusUpdateSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: z.object({
        isActive: z.boolean(),
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

// Lab order filters
export const labOrderFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        status: z.enum([
            'created',
            'payment_pending',
            'confirmed',
            'collector_assigned',
            'collector_on_the_way',
            'sample_collected',
            'processing',
            'report_ready',
            'completed',
            'cancelled',
            'all',
        ]).optional().default('all'),
        labId: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        search: z.string().optional(),
    }),
});

// Lab order status update
export const labOrderStatusUpdateSchema = z.object({
    body: z.object({
        status: z.enum([
            'created',
            'payment_pending',
            'confirmed',
            'collector_assigned',
            'collector_on_the_way',
            'sample_collected',
            'processing',
            'report_ready',
            'completed',
            'cancelled',
        ]),
        overrideReason: z.string().min(5).max(1000),
    }),
});

// Collector assignment/update for lab order
export const labOrderCollectorAssignSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: z.object({
        collectorName: z.string().min(2).max(100),
        collectorPhone: z.string().min(8).max(20),
        collectorEta: z.string().datetime().optional(),
        overrideReason: z.string().min(5).max(1000),
    }),
});

// Report upload path params validation
export const labOrderReportUploadParamsSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: z.object({
        overrideReason: z.string().min(5).max(1000),
    }),
});

// Lab registration request list filters
export const labRegistrationRequestFiltersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '20')),
        status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('all'),
        search: z.string().optional(),
    }),
});

// Lab registration request approve/reject decision
export const labRegistrationDecisionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: z.object({
        decision: z.enum(['approve', 'reject']),
        rejectionReason: z.string().max(1000).optional(),
    }).superRefine((body, ctx) => {
        if (body.decision === 'reject' && (!body.rejectionReason || body.rejectionReason.trim().length < 3)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rejectionReason'],
                message: 'Rejection reason is required when decision is reject',
            });
        }
    }),
});
