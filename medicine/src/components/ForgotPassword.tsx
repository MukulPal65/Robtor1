import React, { useState } from 'react';
import { ProfileService } from '../services/profileService';
import { Mail, ArrowLeft, Send, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordProps {
    onBack: () => void;
}

type Step = 'email' | 'question' | 'reset';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const findUserQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Find user profile by email
            // We need to fetch from profiles table where id matches auth.users email
            // This usually requires an RPC or a specific view if we want to search profiles by auth email safely
            const foundQuestion = await ProfileService.getUserSecurityQuestion(email.trim());

            if (!foundQuestion) {
                throw new Error('This account does not have a security question set yet. Please contact support at support@robtor.health to recover your account.');
            }

            setQuestion(foundQuestion);
            setStep('question');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to find user');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim() || !newPassword.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const result = await ProfileService.resetPasswordWithSecurityAnswer(
                email.trim(),
                answer.trim(),
                newPassword.trim()
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to reset password');
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to reset password');
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h3>
                <p className="text-gray-600 mb-8">
                    Your password has been successfully updated. You can now log in with your new password.
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

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {step === 'email' ? 'Reset Password' : step === 'question' ? 'Identity Check' : 'Set New Password'}
            </h2>
            <p className="text-gray-600 mb-6">
                {step === 'email' ? "Enter your email to find your account." :
                    step === 'question' ? "Answer your chosen security question." :
                        "Enter your new secure password."}
            </p>

            {step === 'email' && (
                <form onSubmit={findUserQuestion} className="space-y-4">
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

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center space-x-2 hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                            <><span>Find Account</span><Send className="w-4 h-4" /></>}
                    </button>
                </form>
            )}

            {step === 'question' && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-700">
                        "{question}"
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Answer</label>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Case-insensitive answer"
                            required
                        />
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

                    <button
                        onClick={() => setStep('reset')}
                        disabled={!answer.trim()}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center space-x-2 hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                        Next Step
                    </button>
                </div>
            )}

            {step === 'reset' && (
                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="At least 6 characters"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || !newPassword.trim()}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center space-x-2 hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                            <span>Update Password</span>}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
