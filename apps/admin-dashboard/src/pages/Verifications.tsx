import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    ShieldCheck, 
    Building2,
    FileText, 
    Clock, 
    CheckCircle2,
    XCircle,
    ExternalLink,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Doctor, LabRegistrationRequest } from '../types';
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
    const [selectedLabRequest, setSelectedLabRequest] = useState<LabRegistrationRequest | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showLabRejectModal, setShowLabRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [labRejectionReason, setLabRejectionReason] = useState('');

    const documentTypeLabel: Record<string, string> = {
        registration_certificate: 'Registration Certificate',
        government_id: 'Government ID',
        nabl_certificate: 'NABL Certificate',
        pan_card: 'PAN Card',
        other: 'Other Document',
    };

    const { data: pendingDoctors, isLoading } = useQuery({
        queryKey: ['pending-doctors'],
        queryFn: async () => {
            const response = await adminApi.getPendingDoctors();
            return response.data.data as Doctor[];
        },
        staleTime: 30000,
    });

    const { data: pendingLabRequests, isLoading: isLabRequestsLoading } = useQuery({
        queryKey: ['pending-lab-registration-requests'],
        queryFn: async () => {
            const response = await adminApi.getLabRegistrationRequests({
                status: 'pending',
                page: 1,
                limit: 100,
            });
            return response.data.data as LabRegistrationRequest[];
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

    const reviewLabRequestMutation = useMutation({
        mutationFn: async ({
            id,
            decision,
            rejectionReason,
        }: {
            id: string;
            decision: 'approve' | 'reject';
            rejectionReason?: string;
        }) => {
            return adminApi.reviewLabRegistrationRequest(id, { decision, rejectionReason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-lab-registration-requests'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            closeLabModals();
        },
    });

    const closeModals = () => {
        setSelectedDoctor(null);
        setShowRejectModal(false);
        setRejectionReason('');
    };

    const closeLabModals = () => {
        setSelectedLabRequest(null);
        setShowLabRejectModal(false);
        setLabRejectionReason('');
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

    const handleApproveLabRequest = (request: LabRegistrationRequest) => {
        reviewLabRequestMutation.mutate({
            id: request._id,
            decision: 'approve',
        });
    };

    const handleRejectLabRequest = () => {
        if (!selectedLabRequest) return;
        reviewLabRequestMutation.mutate({
            id: selectedLabRequest._id,
            decision: 'reject',
            rejectionReason: labRejectionReason,
        });
    };

    if (isLoading || isLabRequestsLoading) return <PageLoader />;

    const pendingDoctorCount = pendingDoctors?.length || 0;
    const pendingLabCount = pendingLabRequests?.length || 0;
    const totalPendingCount = pendingDoctorCount + pendingLabCount;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verifications</h1>
                    <p className="text-slate-500 mt-1">
                        Review and verify doctor and lab applications
                        {totalPendingCount > 0 && (
                            <span className="text-amber-600 font-medium"> · {totalPendingCount} pending</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Alert Banner */}
            {totalPendingCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-amber-900">Action Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            {pendingDoctorCount} doctor{pendingDoctorCount !== 1 ? 's' : ''} and {pendingLabCount} lab
                            request{pendingLabCount !== 1 ? 's' : ''} awaiting review.
                        </p>
                    </div>
                </div>
            )}

            {/* Doctors Table */}
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
                            title="No pending doctor verifications"
                            description="All doctor profiles are already reviewed"
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

            {/* Labs Table */}
            <Table>
                <TableHead>
                    <TableHeader>
                        <TableHeadCell>Lab</TableHeadCell>
                        <TableHeadCell>Contact</TableHeadCell>
                        <TableHeadCell>Location</TableHeadCell>
                        <TableHeadCell>Applied On</TableHeadCell>
                        <TableHeadCell>Documents</TableHeadCell>
                        <TableHeadCell align="center">Actions</TableHeadCell>
                    </TableHeader>
                </TableHead>
                <TableBody>
                    {!pendingLabRequests?.length ? (
                        <TableEmpty
                            icon={<Building2 size={32} />}
                            title="No pending lab registrations"
                            description="New lab signup requests will appear here"
                            colSpan={6}
                        />
                    ) : (
                        pendingLabRequests.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell>
                                    <div>
                                        <p className="font-semibold text-slate-900">{request.labName}</p>
                                        <p className="text-xs text-slate-500">
                                            {request.isNablCertified ? 'NABL Certified' : 'Non-NABL'}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-slate-700">{request.contactName}</p>
                                        <p className="text-xs text-slate-500">Account (OTP) phone: {request.phone}</p>
                                        {request.alternateContactPhone && (
                                            <p className="text-xs text-slate-500">Alternate business phone: {request.alternateContactPhone}</p>
                                        )}
                                        {request.email && (
                                            <p className="text-xs text-slate-400">{request.email}</p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-slate-700">
                                        {request.address.city}, {request.address.state}
                                    </p>
                                    <p className="text-xs text-slate-500">{request.address.pincode}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={14} />
                                        <span className="text-sm">
                                            {request.createdAt
                                                ? format(new Date(request.createdAt), 'MMM d, yyyy')
                                                : '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => setSelectedLabRequest(request)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <FileText size={14} />
                                        View Docs
                                    </button>
                                </TableCell>
                                <TableCell align="center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleApproveLabRequest(request)}
                                            disabled={reviewLabRequestMutation.isPending}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={14} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedLabRequest(request);
                                                setShowLabRejectModal(true);
                                            }}
                                            disabled={reviewLabRequestMutation.isPending}
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

            {/* Lab Documents Modal */}
            <Modal
                isOpen={!!selectedLabRequest && !showLabRejectModal}
                onClose={() => setSelectedLabRequest(null)}
                title="Lab Verification Documents"
                description={`Review submitted documents for ${selectedLabRequest?.labName}`}
                size="lg"
            >
                {selectedLabRequest && (
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <h4 className="font-semibold text-slate-900">{selectedLabRequest.labName}</h4>
                            <p className="text-sm text-slate-600 mt-1">
                                {selectedLabRequest.contactName}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                Account (OTP) phone: {selectedLabRequest.phone}
                            </p>
                            {selectedLabRequest.alternateContactPhone && (
                                <p className="text-sm text-slate-600 mt-1">
                                    Alternate business phone: {selectedLabRequest.alternateContactPhone}
                                </p>
                            )}
                            <p className="text-sm text-slate-500 mt-1">
                                {selectedLabRequest.address.line1}, {selectedLabRequest.address.city}, {selectedLabRequest.address.state} {selectedLabRequest.address.pincode}
                            </p>
                            {selectedLabRequest.notes && (
                                <p className="text-sm text-slate-600 mt-3">Notes: {selectedLabRequest.notes}</p>
                            )}
                        </div>

                        <div>
                            <h5 className="text-sm font-semibold text-slate-700 mb-3">Uploaded Documents</h5>
                            {selectedLabRequest.verificationDocuments?.length ? (
                                <div className="space-y-2">
                                    {selectedLabRequest.verificationDocuments.map((doc, idx) => (
                                        <a
                                            key={`${doc.documentUrl}-${idx}`}
                                            href={doc.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg">
                                                    <FileText size={18} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        {documentTypeLabel[doc.documentType] || 'Document'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {doc.originalFileName || 'Click to view'}
                                                    </p>
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

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApproveLabRequest(selectedLabRequest)}
                                isLoading={reviewLabRequestMutation.isPending}
                            >
                                <CheckCircle2 size={18} className="mr-2" />
                                Approve Lab
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setShowLabRejectModal(true)}
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

            {/* Lab Reject Modal */}
            <Modal
                isOpen={showLabRejectModal}
                onClose={closeLabModals}
                title="Reject Lab Registration"
                description={`Provide a reason for rejecting ${selectedLabRequest?.labName}'s application`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rejection Reason
                        </label>
                        <textarea
                            value={labRejectionReason}
                            onChange={(e) => setLabRejectionReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={4}
                            placeholder="Explain why this application is being rejected..."
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            This reason will be shared with the lab applicant
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={closeLabModals}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={handleRejectLabRequest}
                            isLoading={reviewLabRequestMutation.isPending}
                            disabled={!labRejectionReason.trim()}
                        >
                            Reject Application
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
