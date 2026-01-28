import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onSignup: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup, onPrivacy, onTerms }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();

    if (!email || !password) {
      alert("⚠ Please enter both fields");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        alert("Login Successful!");
        onLogin();
      }
    } catch (error: any) {
      console.error(error);
      if (error.message.includes("Email not confirmed")) {
        alert("Please verify your email address before logging in. Check your inbox (and spam folder) for the confirmation link.");
      } else {
        alert(error.message || "Login failed. Please check your credentials.");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      alert('⚠️ Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}`,
      });

      if (error) throw error;

      alert(`✅ Password reset email sent to ${resetEmail}!

📧 Please check:
• Your inbox
• Spam/Junk folder
• Promotions tab (Gmail)

⏰ Email may take 1-2 minutes to arrive.

⚠️ Note: If you still don't receive the email, this might be because:
1. Supabase email service needs to be configured in your Supabase dashboard
2. You need to verify your email domain in Supabase settings
3. The email address is not registered

For now, you can contact your administrator to reset your password manually in the Supabase dashboard.`);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);

      let errorMessage = '❌ Failed to send reset email.\n\n';

      if (error.message.includes('User not found')) {
        errorMessage += 'This email is not registered. Please sign up first.';
      } else if (error.message.includes('rate limit')) {
        errorMessage += 'Too many reset attempts. Please wait a few minutes and try again.';
      } else if (error.message.includes('email')) {
        errorMessage += 'Email service is not configured.\n\nTo fix this:\n1. Go to your Supabase dashboard\n2. Navigate to Authentication → Email Templates\n3. Configure SMTP settings or use Supabase email service\n4. Enable "Confirm email" and "Reset password" templates';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }

      alert(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-3xl">
              <Heart className="w-16 h-16 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">ROBTOR</h1>
          <p className="text-gray-600">Your Personal AI Health Assistant</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  ref={emailRef}
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 border-2 rounded-xl"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="ml-2 text-sm">Remember me</span>
              </label>

              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-green-600 hover:text-green-700 font-semibold">
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button className="w-full bg-green-600 text-white py-3 rounded-xl flex justify-center items-center space-x-2">
              <span>Sign In</span>
              <ArrowRight />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p>
              Don't have an account?{" "}
              <button onClick={onSignup} className="text-green-600 font-semibold">
                Create Account
              </button>
            </p>
          </div>

        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-2">Reset Password</h3>
              <p className="text-gray-600 mb-4">Enter your email address and we'll send you a link to reset your password.</p>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>📧 Email Setup Required:</strong><br />
                  If you don't receive an email, Supabase email service needs to be configured:
                </p>
                <ol className="text-xs text-blue-700 mt-2 ml-4 space-y-1">
                  <li>1. Open your Supabase dashboard</li>
                  <li>2. Go to Authentication → Email Templates</li>
                  <li>3. Configure SMTP or enable Supabase email</li>
                  <li>4. Test the email service</li>
                </ol>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500"
                    placeholder="your.email@example.com"
                    onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legal & Support Footer */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center items-center space-x-4 mb-2">
            <div className="flex items-center text-[10px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Shield className="w-3 h-3 mr-1 text-green-600" />
              Secure Data Encryption
            </div>
            <div className="flex items-center text-[10px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Lock className="w-3 h-3 mr-1 text-blue-600" />
              HIPAA Compliant Standard
            </div>
          </div>

          <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-tight italic">
            <strong>Medical Disclaimer:</strong> Robtor is an AI health assistant and does NOT provide medical diagnosis or professional advice. Always consult a doctor for medical concerns.
          </p>

          <div className="flex flex-col space-y-2">
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <button onClick={onPrivacy} className="hover:text-green-600 transition-colors font-medium">Privacy Policy</button>
              <span>•</span>
              <button onClick={onTerms} className="hover:text-green-600 transition-colors font-medium">Terms of Service</button>
            </div>
            <p className="text-[10px] text-gray-400">
              Support: <span className="font-medium">support@robtor.ai</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
