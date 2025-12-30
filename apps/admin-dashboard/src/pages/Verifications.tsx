import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    ShieldCheck, 
    ShieldX, 
    FileText, 
    Clock, 
    CheckCircle2,
    XCircle,
    ExternalLink,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Doctor } from '../types';
import { 
    Button, 
    PageLoader,
    Modal,
    Table,
    TableHead,
    TableHeader,
    TableHeadCell,
    TableBody,
    TableRow,
    TableCell,
    TableEmpty
} from '../components/ui';

export default function VerificationsPage() {
    const queryClient = useQueryClient();
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: pendingDoctors, isLoading } = useQuery({
        queryKey: ['pending-doctors'],
        queryFn: async () => {
            const response = await adminApi.getPendingDoctors();
            return response.data.data as Doctor[];
        },
        staleTime: 30000,
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ id, isVerified, rejectionReason }: { id: string; isVerified: boolean; rejectionReason?: string }) => {
            return adminApi.verifyDoctor(id, { isVerified, rejectionReason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-doctors'] });
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            closeModals();
        },
    });

    const closeModals = () => {
        setSelectedDoctor(null);
        setShowRejectModal(false);
        setRejectionReason('');
    };

    const handleApprove = (doctor: Doctor) => {
        verifyMutation.mutate({ id: doctor._id, isVerified: true });
    };

    const handleReject = () => {
        if (!selectedDoctor) return;
        verifyMutation.mutate({ 
            id: selectedDoctor._id, 
            isVerified: false, 
            rejectionReason 
        });
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verifications</h1>
                    <p className="text-slate-500 mt-1">
                        Review and verify doctor profiles
                        {pendingDoctors && pendingDoctors.length > 0 && (
                            <span className="text-amber-600 font-medium"> · {pendingDoctors.length} pending</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Alert Banner */}
            {pendingDoctors && pendingDoctors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-amber-900">Action Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            {pendingDoctors.length} doctor{pendingDoctors.length > 1 ? 's' : ''} awaiting verification. 
                            Please review their credentials and documents before approving.
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            <Table>
                <TableHead>
                    <TableHeader>
                        <TableHeadCell>Doctor</TableHeadCell>
                        <TableHeadCell>Specialization</TableHeadCell>
                        <TableHeadCell>Qualifications</TableHeadCell>
                        <TableHeadCell>Experience</TableHeadCell>
                        <TableHeadCell>Applied On</TableHeadCell>
                        <TableHeadCell>Documents</TableHeadCell>
                        <TableHeadCell align="center">Actions</TableHeadCell>
                    </TableHeader>
                </TableHead>
                <TableBody>
                    {!pendingDoctors?.length ? (
                        <TableEmpty
                            icon={<ShieldCheck size={32} />}
                            title="All caught up!"
                            description="No pending verifications at the moment"
                            colSpan={7}
                        />
                    ) : (
                        pendingDoctors.map((doctor) => (
                            <TableRow key={doctor._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center overflow-hidden">
                                            {doctor.photoUrl ? (
                                                <img 
                                                    src={doctor.photoUrl} 
                                                    alt={doctor.userId?.name} 
                                                    className="w-11 h-11 object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-amber-700">
                                                    {doctor.userId?.name?.charAt(0) || 'D'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Dr. {doctor.userId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-slate-500">{doctor.userId?.phone}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                                        {doctor.specialization || '-'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                                            {doctor.qualification}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-slate-700">{doctor.experience || 0} yrs</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={14} />
                                        <span className="text-sm">
                                            {doctor.createdAt ? format(new Date(doctor.createdAt), 'MMM d, yyyy') : '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <FileText size={14} />
                                        View Docs
                                    </button>
                                </TableCell>
                                <TableCell align="center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleApprove(doctor)}
                                            disabled={verifyMutation.isPending}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={14} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedDoctor(doctor);
                                                setShowRejectModal(true);
                                            }}
                                            disabled={verifyMutation.isPending}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle size={14} />
                                            Reject
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Documents Modal */}
            <Modal
                isOpen={!!selectedDoctor && !showRejectModal}
                onClose={() => setSelectedDoctor(null)}
                title="Verification Documents"
                description={`Review documents for Dr. ${selectedDoctor?.userId?.name}`}
                size="lg"
            >
                {selectedDoctor && (
                    <div className="space-y-6">
                        {/* Doctor Info */}
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden">
                                {selectedDoctor.photoUrl ? (
                                    <img 
                                        src={selectedDoctor.photoUrl} 
                                        alt={selectedDoctor.userId?.name} 
                                        className="w-16 h-16 object-cover"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-primary-700">
                                        {selectedDoctor.userId?.name?.charAt(0) || 'D'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Dr. {selectedDoctor.userId?.name}</h4>
                                <p className="text-primary-600">{selectedDoctor.specialization}</p>
                                <p className="text-sm text-slate-500 mt-1">{selectedDoctor.experience} years experience</p>
                            </div>
                        </div>

                        {/* Qualification */}
                        <div>
                            <h5 className="text-sm font-semibold text-slate-700 mb-3">Qualification</h5>
                            <div className="flex flex-wrap gap-2">
                                {selectedDoctor.qualification ? (
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                                        {selectedDoctor.qualification}
                                    </span>
                                ) : (
                                    <span className="text-slate-400">No qualification listed</span>
                                )}
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h5 className="text-sm font-semibold text-slate-700 mb-3">Uploaded Documents</h5>
                            {selectedDoctor.documents && selectedDoctor.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedDoctor.documents.map((docUrl: string, idx: number) => (
                                        <a
                                            key={idx}
                                            href={docUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg">
                                                    <FileText size={18} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">Document {idx + 1}</p>
                                                    <p className="text-xs text-slate-400">Click to view</p>
                                                </div>
                                            </div>
                                            <ExternalLink size={16} className="text-slate-400 group-hover:text-primary-600" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl">
                                    <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">No documents uploaded</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove(selectedDoctor)}
                                isLoading={verifyMutation.isPending}
                            >
                                <CheckCircle2 size={18} className="mr-2" />
                                Approve Doctor
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setShowRejectModal(true)}
                            >
                                <XCircle size={18} className="mr-2" />
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={closeModals}
                title="Reject Verification"
                description={`Provide a reason for rejecting Dr. ${selectedDoctor?.userId?.name}'s application`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rejection Reason
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={4}
                            placeholder="Explain why this application is being rejected..."
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            This reason will be shared with the doctor
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={closeModals}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={handleReject}
                            isLoading={verifyMutation.isPending}
                            disabled={!rejectionReason.trim()}
                        >
                            Reject Application
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
