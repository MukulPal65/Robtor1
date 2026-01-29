import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, Activity, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

interface SignupProps {
  onSignup: () => void;
  onLogin: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onLogin, onPrivacy, onTerms }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What was the name of your first pet?',
    securityAnswer: '',
  });

  const securityQuestions = [
    "What was the name of your first pet?",
    "In what city were you born?",
    "What is your mother's maiden name?",
    "What was the name of your favorite teacher?",
    "What was the make of your first car?"
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (_e: React.FormEvent) => {
    _e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            security_question: formData.securityQuestion,
            security_answer: formData.securityAnswer,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        if (data.session) {
          onSignup();
        } else {
          alert("Signup successful! Please check your email for verification.");
          onLogin();
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, label: '', color: 'bg-slate-200' };
    if (password.length < 6) return { strength: 33, label: 'Weak', color: 'bg-rose-500' };
    if (password.length < 10) return { strength: 66, label: 'Moderate', color: 'bg-amber-500' };
    return { strength: 100, label: 'Secure', color: 'bg-emerald-500' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-xl z-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side: Info & Marketing */}
          <div className="hidden lg:block space-y-8 pr-8 scale-in-center">
            <div className="inline-flex items-center justify-center p-3 bg-slate-900 border border-white/5 rounded-2xl shadow-premium mb-4">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Unlock Your <br />
              <span className="text-emerald-400">Health Potential.</span>
            </h2>
            <div className="space-y-4">
              {[
                "AI-Powered Medical Analysis",
                "Real-time Vitals Tracking",
                "Custom Fitness & Diet Plans",
                "Secure, Private Data Vault"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-slate-400 font-semibold text-sm">
                  <CheckCircle2 className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">HIPAA Compliant Standard</span>
              </div>
            </div>
          </div>

          {/* Right Side: Signup Form */}
          <div className="card p-10 animate-slide-up">
            <div className="mb-8 text-left">
              <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
              <p className="text-slate-400 text-sm mt-1">Join the future of personal health</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-3.5 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-field pl-14 py-3"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-4 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-14 py-3.5"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-4 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-14 pr-14 py-3.5"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-4 text-slate-300 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {formData.password && (
                  <div className="px-1 mt-1">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-500`} style={{ width: `${strength.strength}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1.5 font-bold uppercase tracking-tighter text-[9px]">
                      <span className="text-slate-400">Security Strength</span>
                      <span className={`${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Access</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-4 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field pl-14 pr-14 py-3.5"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Security Question</label>
                <select
                  value={formData.securityQuestion}
                  onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                  className="input-field py-3.5 appearance-none cursor-pointer"
                >
                  {securityQuestions.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <div className="relative group">
                  <Lock className="absolute left-5 top-4 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.securityAnswer}
                    onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                    placeholder="Secure answer"
                    className="input-field pl-14 py-3.5"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start px-1 py-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-200 rounded focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="ml-3 text-xs leading-relaxed">
                  <label htmlFor="terms" className="font-medium text-slate-500">
                    I agree to the <button type="button" onClick={onTerms} className="text-emerald-600 font-bold hover:underline">Terms</button> & <button type="button" onClick={onPrivacy} className="text-emerald-600 font-bold hover:underline">Privacy Policy</button>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full group relative overflow-hidden text-sm"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? 'Processing...' : 'Complete Registration'}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-slate-500 text-sm font-medium">
                Already registered?{" "}
                <button
                  onClick={onLogin}
                  className="text-emerald-600 font-bold hover:underline underline-offset-4"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;