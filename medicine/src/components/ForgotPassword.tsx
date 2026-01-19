import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
    onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-8 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-8">
                    We've sent a password reset link to <span className="font-semibold">{email}</span>.
                </p>
                <button
                    onClick={onBack}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <button
                onClick={onBack}
                className="flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600 mb-6">Enter your email and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center space-x-2 hover:bg-green-700 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>Send Reset Link</span>
                            <Send className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
