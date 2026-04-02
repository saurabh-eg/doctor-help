import { useState } from 'react';
import { IndianRupee, Receipt, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/client';
import { Button } from '../components/ui';

type PaymentResult = {
    paymentId: string;
    transactionId?: string;
    status: string;
    mode?: string;
    appointmentId?: string | null;
};

type PaymentStatusResult = {
    paymentId: string;
    appointmentId?: string | null;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    transactionId?: string;
    createdAt?: string;
};

export default function PaymentDemoPage() {
    const [appointmentId, setAppointmentId] = useState('');
    const [amount, setAmount] = useState('500');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [paymentIdToCheck, setPaymentIdToCheck] = useState('');
    const [initResult, setInitResult] = useState<PaymentResult | null>(null);
    const [statusResult, setStatusResult] = useState<PaymentStatusResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInitiate = async () => {
        setIsProcessing(true);
        setError(null);
        setStatusResult(null);

        try {
            const parsedAmount = Number(amount);
            if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                setError('Enter a valid amount greater than 0.');
                return;
            }

            const response = await adminApi.initiateDemoPayment({
                appointmentId: appointmentId.trim() || undefined,
                amount: parsedAmount,
                currency: 'INR',
                purpose: 'doctor_consultation',
            });

            setInitResult(response.data.data as PaymentResult);
            if (response.data?.data?.paymentId) {
                setPaymentIdToCheck(response.data.data.paymentId);
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to initiate payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckStatus = async () => {
        setIsChecking(true);
        setError(null);

        try {
            const id = paymentIdToCheck.trim();
            if (!id) {
                setError('Enter a payment ID to fetch status.');
                return;
            }

            const response = await adminApi.getPaymentStatus(id);
            setStatusResult(response.data.data as PaymentStatusResult);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to fetch payment status');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Demo Payments</h1>
                <p className="text-slate-500 mt-1">
                    Initiate a demo payment and verify transaction status for mobile/web flow testing.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <IndianRupee size={18} className="text-primary-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Initiate Demo Payment</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Appointment ID (optional)</label>
                        <input
                            value={appointmentId}
                            onChange={(e) => setAppointmentId(e.target.value)}
                            placeholder="Enter appointment id for linked payment"
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (INR)</label>
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="500"
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <Button onClick={handleInitiate} isLoading={isProcessing} className="w-full">
                        Start Demo Payment
                    </Button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Search size={18} className="text-primary-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Fetch Payment Status</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment ID</label>
                        <input
                            value={paymentIdToCheck}
                            onChange={(e) => setPaymentIdToCheck(e.target.value)}
                            placeholder="PAY-..."
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <Button onClick={handleCheckStatus} isLoading={isChecking} variant="secondary" className="w-full">
                        Check Status
                    </Button>
                </div>
            </div>

            {initResult && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center gap-2 text-emerald-700 mb-3">
                        <CheckCircle2 size={18} />
                        <h3 className="font-semibold">Initiation Result</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                        <p><span className="font-semibold">Payment ID:</span> {initResult.paymentId}</p>
                        <p><span className="font-semibold">Status:</span> {initResult.status}</p>
                        <p><span className="font-semibold">Transaction ID:</span> {initResult.transactionId || '-'}</p>
                        <p><span className="font-semibold">Mode:</span> {initResult.mode || '-'}</p>
                        <p><span className="font-semibold">Appointment ID:</span> {initResult.appointmentId || '-'}</p>
                    </div>
                </div>
            )}

            {statusResult && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-slate-900 mb-3">
                        <Receipt size={18} className="text-primary-600" />
                        <h3 className="font-semibold">Payment Status</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                        <p><span className="font-semibold">Payment ID:</span> {statusResult.paymentId}</p>
                        <p><span className="font-semibold">Status:</span> {statusResult.status}</p>
                        <p><span className="font-semibold">Provider:</span> {statusResult.provider}</p>
                        <p><span className="font-semibold">Transaction ID:</span> {statusResult.transactionId || '-'}</p>
                        <p><span className="font-semibold">Amount:</span> {statusResult.currency} {statusResult.amount}</p>
                        <p><span className="font-semibold">Appointment ID:</span> {statusResult.appointmentId || '-'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
