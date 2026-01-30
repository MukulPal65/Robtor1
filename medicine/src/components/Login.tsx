import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Activity } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (_e: React.FormEvent) => {
    _e.preventDefault();

    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();

    if (!email || !password) {
      alert("⚠ Please enter both fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        onLogin();
      }
    } catch (error: any) {
      console.error(error);
      if (error.message.includes("Email not confirmed")) {
        alert("Please verify your email address before logging in.");
      } else {
        alert(error.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
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

      alert(`✅ Password reset email sent to ${resetEmail}!`);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      alert(error.message || 'Unknown error occurred.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/40 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Animated Brand Header */}
        <div className="text-center mb-10 scale-in-center">
          <div className="inline-flex items-center justify-center p-4 bg-white border border-blue-100 rounded-[2.5rem] shadow-xl mb-6 animate-float">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-[2rem] shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-800 mb-2">
            ROBTOR<span className="text-blue-500">.</span>
          </h1>
          <p className="text-gray-500 font-medium">Your Intelligence Health Partner</p>
        </div>

        {/* glass-card Login Box */}
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your health portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  ref={emailRef}
                  type="email"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-gray-800 placeholder-slate-400 pl-14 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-gray-800 placeholder-slate-400 pl-14 pr-14 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <label className="flex items-center group cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all ${rememberMe ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                    {rememberMe && <Activity size={12} className="text-white absolute inset-0 m-auto" />}
                  </div>
                </div>
                <span className="ml-3 text-sm font-semibold text-gray-600">Stay signed in</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                Forgot?
              </button>
            </div>

            <button
              disabled={loading}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-full py-4 rounded-2xl font-black shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-slate-100">
            <p className="text-gray-500 text-sm font-medium">
              New to Robtor?{" "}
              <button
                onClick={onSignup}
                className="text-blue-600 font-bold hover:underline underline-offset-4"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="mt-10 px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white">
              <Shield className="w-3 h-3 mr-2 text-blue-500" />
              AES-256 Encrypted
            </div>
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white">
              <Lock className="w-3 h-3 mr-2 text-indigo-500" />
              HIPAA Ready
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <button onClick={onPrivacy} className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Privacy</button>
            <button onClick={onTerms} className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Terms</button>
          </div>
        </div>
      </div>

      {/* Simplified Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white max-w-md w-full p-10 rounded-[2rem] shadow-2xl">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Reset Password</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enter your email and we'll send a secure link to reset your access.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-5 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-gray-800 placeholder-slate-400 pl-14 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="bg-blue-600 text-white w-full py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  {resetLoading ? 'Sending...' : 'Send Secure Link'}
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="bg-slate-100 text-gray-600 w-full py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
