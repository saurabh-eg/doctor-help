import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldX, FileText, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../api/client';
import { Doctor } from '../types';
import { Button, PageLoader } from '../components/ui';

export default function VerificationsPage() {
    const queryClient = useQueryClient();
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: pendingDoctors, isLoading, error } = useQuery({
        queryKey: ['pending-doctors'],
        queryFn: async () => {
            const response = await adminApi.getPendingDoctors();
            return response.data.data as Doctor[];
        },
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ id, isVerified, rejectionReason }: { id: string; isVerified: boolean; rejectionReason?: string }) => {
            return adminApi.verifyDoctor(id, { isVerified, rejectionReason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-doctors'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setSelectedDoctor(null);
            setShowRejectModal(false);
            setRejectionReason('');
        },
    });

    const handleApprove = (doctor: Doctor) => {
        verifyMutation.mutate({ id: doctor._id, isVerified: true });
    };

    const handleReject = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!selectedDoctor) return;
        verifyMutation.mutate({
            id: selectedDoctor._id,
            isVerified: false,
            rejectionReason: rejectionReason,
        });
    };

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load verifications</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Doctor Verifications</h1>
                <p className="text-slate-500 mt-1">
                    Review and approve doctor registrations
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-amber-700">{pendingDoctors?.length || 0}</p>
                        <p className="text-sm text-amber-600">Pending Review</p>
                    </div>
                </div>
            </div>

            {/* Pending List */}
            {pendingDoctors && pendingDoctors.length > 0 ? (
                <div className="space-y-4">
                    {pendingDoctors.map((doctor) => (
                        <div 
                            key={doctor._id} 
                            className="bg-white rounded-xl border border-slate-200 p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Doctor Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        {doctor.photoUrl ? (
                                            <img 
                                                src={doctor.photoUrl} 
                                                alt={doctor.userId?.name} 
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-primary-600 font-bold text-xl">
                                                {doctor.userId?.name?.charAt(0) || 'D'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Dr. {doctor.userId?.name || 'Unknown'}
                                        </h3>
                                        <p className="text-slate-500">{doctor.specialization}</p>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                                            <span>{doctor.qualification}</span>
                                            <span>•</span>
                                            <span>{doctor.experience} years experience</span>
                                            <span>•</span>
                                            <span>₹{doctor.consultationFee} fee</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-2">
                                            Applied on {format(new Date(doctor.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                {/* Documents & Actions */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    {doctor.documents && doctor.documents.length > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                                            <FileText className="w-5 h-5 text-slate-500" />
                                            <span className="text-sm text-slate-600">
                                                {doctor.documents.length} document(s)
                                            </span>
                                            <a
                                                href={doctor.documents[0]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:underline text-sm ml-2"
                                            >
                                                View
                                            </a>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReject(doctor)}
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                            isLoading={verifyMutation.isPending && selectedDoctor?._id === doctor._id}
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(doctor)}
                                            className="bg-green-600 hover:bg-green-700"
                                            isLoading={verifyMutation.isPending && selectedDoctor?._id === doctor._id}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            {doctor.bio && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-600">
                                        <span className="font-medium">Bio:</span> {doctor.bio}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">No pending verifications at the moment.</p>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <ShieldX className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Reject Verification</h3>
                        </div>
                        
                        <p className="text-slate-500 mb-4">
                            Rejecting <strong>Dr. {selectedDoctor.userId?.name}</strong>'s verification request. 
                            Please provide a reason.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={4}
                                placeholder="e.g., Documents are not clear, credentials could not be verified..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedDoctor(null);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={confirmReject}
                                isLoading={verifyMutation.isPending}
                                disabled={!rejectionReason.trim()}
                            >
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
