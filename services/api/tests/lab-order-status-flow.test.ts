import { describe, expect, it } from 'vitest';
import {
    canAssignCollector,
    canTransition,
    canUploadReport,
    LAB_ORDER_TRANSITIONS,
} from '../src/modules/lab-orders/status-flow';

describe('lab order status flow', () => {
    it('allows only configured transitions', () => {
        expect(canTransition('confirmed', 'collector_assigned')).toBe(true);
        expect(canTransition('processing', 'report_ready')).toBe(true);
        expect(canTransition('report_ready', 'completed')).toBe(true);

        expect(canTransition('confirmed', 'processing')).toBe(false);
        expect(canTransition('completed', 'confirmed')).toBe(false);
        expect(canTransition('cancelled', 'confirmed')).toBe(false);
    });

    it('keeps transition map sane for terminal states', () => {
        expect(LAB_ORDER_TRANSITIONS.completed).toEqual([]);
        expect(LAB_ORDER_TRANSITIONS.cancelled).toEqual([]);
    });

    it('allows collector assignment only in expected statuses', () => {
        expect(canAssignCollector('confirmed')).toBe(true);
        expect(canAssignCollector('collector_assigned')).toBe(true);
        expect(canAssignCollector('collector_on_the_way')).toBe(true);

        expect(canAssignCollector('created')).toBe(false);
        expect(canAssignCollector('processing')).toBe(false);
        expect(canAssignCollector('completed')).toBe(false);
    });

    it('allows report upload only in processing status', () => {
        expect(canUploadReport('processing')).toBe(true);

        expect(canUploadReport('confirmed')).toBe(false);
        expect(canUploadReport('report_ready')).toBe(false);
        expect(canUploadReport('completed')).toBe(false);
    });
});
