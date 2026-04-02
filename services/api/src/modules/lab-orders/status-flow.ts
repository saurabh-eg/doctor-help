export const LAB_ORDER_TRANSITIONS: Record<string, string[]> = {
    created: ['payment_pending', 'confirmed', 'cancelled'],
    payment_pending: ['confirmed', 'cancelled'],
    confirmed: ['collector_assigned', 'cancelled'],
    collector_assigned: ['collector_on_the_way', 'cancelled'],
    collector_on_the_way: ['sample_collected', 'cancelled'],
    sample_collected: ['processing', 'cancelled'],
    processing: ['report_ready', 'cancelled'],
    report_ready: ['completed'],
    completed: [],
    cancelled: [],
};

export function canTransition(fromStatus: string, toStatus: string): boolean {
    const allowed = LAB_ORDER_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
}

export function canAssignCollector(status: string): boolean {
    return ['confirmed', 'collector_assigned', 'collector_on_the_way'].includes(status);
}

export function canUploadReport(status: string): boolean {
    return status === 'processing';
}