import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import ForgotPassword from './ForgotPassword';

interface LoginProps {
  onLogin: () => void;
  onSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        // Log the activity
        try {
          const { ProfileService } = await import('../services/profileService');
          await ProfileService.logLoginActivity();
        } catch (logError) {
          console.error('Failed to log login activity:', logError);
        }
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
          {showForgotPassword ? (
            <ForgotPassword onBack={() => setShowForgotPassword(false)} />
          ) : (
            <>
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

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-green-600 hover:underline"
                  >
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
                  <button onClick={onSignup} className="text-green-600 font-semibold hover:underline">
                    Create Account
                  </button>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
