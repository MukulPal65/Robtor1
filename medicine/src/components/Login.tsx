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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Animated Brand Header */}
        <div className="text-center mb-10 scale-in-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-2xl mb-6 animate-float">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-[2rem]">
              <Activity className="w-10 h-10 text-slate-950" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            ROBTOR<span className="text-emerald-400">.</span>
          </h1>
          <p className="text-slate-400 font-medium">Your Intelligence Health Partner</p>
        </div>

        {/* glass-card Login Box */}
        <div className="card p-10 animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your health portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  ref={emailRef}
                  type="email"
                  className="input-field pl-14"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-14 pr-14"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-5 text-slate-300 hover:text-slate-600 transition-colors"
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
                  <div className={`w-5 h-5 rounded-md border-2 transition-all ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                    {rememberMe && <Activity size={12} className="text-white absolute inset-0 m-auto" />}
                  </div>
                </div>
                <span className="ml-3 text-sm font-semibold text-slate-600">Stay signed in</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-emerald-600 hover:emerald-700 font-bold transition-colors"
              >
                Forgot?
              </button>
            </div>

            <button
              disabled={loading}
              className="btn-primary w-full group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-slate-100">
            <p className="text-slate-500 text-sm font-medium">
              New to Robtor?{" "}
              <button
                onClick={onSignup}
                className="text-emerald-600 font-bold hover:underline underline-offset-4"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="mt-10 px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white">
              <Shield className="w-3 h-3 mr-2 text-emerald-500" />
              AES-256 Encrypted
            </div>
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white">
              <Lock className="w-3 h-3 mr-2 text-blue-500" />
              HIPAA Ready
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <button onClick={onPrivacy} className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Privacy</button>
            <button onClick={onTerms} className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Terms</button>
          </div>
        </div>
      </div>

      {/* Simplified Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="card max-w-md w-full p-10 bg-white">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Reset Password</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Enter your email and we'll send a secure link to reset your access.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-5 w-5 h-5 text-slate-300 pointer-events-none" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field pl-14"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="btn-primary w-full"
                >
                  {resetLoading ? 'Sending...' : 'Send Secure Link'}
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="btn-secondary w-full"
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
