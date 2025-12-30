import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';

export default function LoginPage() {
    const navigate = useNavigate();
    const { sendOtp, login } = useAuth();
    
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await sendOtp(phone);
        setIsLoading(false);

        if (result.success) {
            setStep('otp');
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            setError('Please enter a valid OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await login(phone, otp);
        setIsLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">DH</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-2">Doctor Help Platform</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">
                        {step === 'phone' ? 'Sign In' : 'Verify OTP'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'phone' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                leftIcon={<Phone size={18} />}
                                maxLength={10}
                            />
                            
                            <Button 
                                type="submit" 
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4">
                                OTP sent to <span className="font-medium text-slate-900">+91 {phone}</span>
                            </p>
                            
                            <Input
                                label="Enter OTP"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                leftIcon={<KeyRound size={18} />}
                                maxLength={6}
                            />
                            
                            <Button 
                                type="submit" 
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Verify & Login
                            </Button>

                            <button
                                type="button"
                                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                                className="w-full text-sm text-primary-600 hover:underline"
                            >
                                Change phone number
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Admin access only. Unauthorized access is prohibited.
                </p>
            </div>
        </div>
    );
}
