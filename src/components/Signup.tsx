import React, { useState } from 'react';
import { Shield, CreditCard, Star, Dumbbell, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { authService } from '../lib/supabase';

interface SignupProps {
  onSuccess: (user: { id?: string; fullName: string; email: string }) => void;
  onNavigateToLogin: () => void;
}

export default function Signup({ onSuccess, onNavigateToLogin }: SignupProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    try {
      const response = await authService.resendVerification(email);
      if (response.success) {
        setResendSuccess(true);
      } else {
        setError(response.error || 'Could not resend verification email.');
      }
    } catch (err: any) {
      setError(err.message || 'Error resending verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signUp(email, password, fullName);
      if (response.success) {
        if (response.sessionActive && response.user) {
          onSuccess({
            id: response.user.id,
            fullName: response.user.fullName,
            email: response.user.email,
          });
        } else {
          setShowVerificationSuccess(true);
        }
      } else {
        setError(response.error || 'Failed to register account');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationSuccess) {
    return (
      <div id="signup-container" className="min-h-screen bg-[#0B0F13] text-gray-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
        {/* Upper Logo / Brand */}
        <div id="signup-brand" className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
          <div id="signup-logo-badge" className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h2 id="signup-brand-title" className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            FitAI: Fitness Buddy
          </h2>
        </div>

        {/* Success Card */}
        <motion.div 
          id="verification-success-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-[#141A21] border border-gray-800/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Mail className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Check your inbox</h3>
              <p className="text-xs text-gray-400">We have sent a verification email to</p>
              <p className="text-sm font-semibold text-emerald-400 font-mono bg-emerald-950/20 py-1.5 px-3 rounded-lg inline-block border border-emerald-900/40">{email}</p>
            </div>

            <div className="text-left text-xs text-gray-300 bg-[#1C252F] border border-gray-800 rounded-xl p-4.5 leading-relaxed space-y-2.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Action Required:
              </p>
              <p>
                Your account has been created successfully. We've sent a verification email to your registered email address. Please verify your email before logging in.
              </p>
              <p className="text-[11px] text-gray-400 italic">
                ⚠️ If you do not see it within a few minutes, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 text-left">
                {error}
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              {resendSuccess ? (
                <p className="text-xs text-emerald-400 font-medium bg-emerald-950/20 border border-emerald-800/30 py-2 rounded-xl">
                  ✓ Verification email resent! Please check your inbox.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full bg-[#1C252F] hover:bg-[#25303D] text-white border border-gray-700/60 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}

              {/* Open Email Client Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="https://mail.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#141A21] hover:bg-[#1C252F] text-gray-300 border border-gray-800 font-semibold text-[11px] py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5"
                >
                  Open Gmail
                </a>
                <a 
                  href="https://outlook.live.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#141A21] hover:bg-[#1C252F] text-gray-300 border border-gray-800 font-semibold text-[11px] py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5"
                >
                  Open Outlook
                </a>
              </div>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                Go to Login Screen
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVerificationSuccess(false);
                  setResendSuccess(false);
                  setError('');
                }}
                className="w-full bg-[#141A21]/30 hover:bg-[#1C252F]/40 text-gray-400 hover:text-gray-300 font-medium text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center"
              >
                Entered wrong email? Change Email
              </button>
            </div>
          </div>
        </motion.div>

        {/* Empty space to balance upper logo */}
        <div className="h-10"></div>
      </div>
    );
  }

  return (
    <div id="signup-container" className="min-h-screen bg-[#0B0F13] text-gray-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Upper Logo / Brand */}
      <div id="signup-brand" className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <div id="signup-logo-badge" className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <h2 id="signup-brand-title" className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          FitAI: Fitness Buddy
        </h2>
        <p id="signup-brand-tagline" className="mt-1.5 text-sm text-gray-400">
          Analyze macros, monitor workouts, and chat with your AI Coach
        </p>
      </div>

      {/* Main card */}
      <motion.div 
        id="signup-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-[#141A21] border border-gray-800/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Create your account</h3>
          <p className="text-xs text-gray-400 mt-1">Get instant access to real-time food scanning and personalized coaching</p>
        </div>

        {error && (
          <div id="signup-error-alert" className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div id="signup-field-name">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="signup-input-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div id="signup-field-email">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="signup-input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div id="signup-field-password">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="signup-input-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div id="signup-field-confirm">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="signup-input-confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Agree Terms Checkbox */}
          <div id="signup-field-terms" className="flex items-start mt-2">
            <div className="flex items-center h-5">
              <input
                id="signup-checkbox-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 text-emerald-500 border-gray-700 bg-[#1C252F] rounded focus:ring-emerald-500 focus:ring-offset-[#141A21] focus:ring-2"
              />
            </div>
            <div className="ml-3 text-xs text-gray-400">
              <label htmlFor="signup-checkbox-terms" className="cursor-pointer select-none">
                I agree to the{' '}
                <a href="#" className="text-emerald-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>.
              </label>
            </div>
          </div>

          {/* Action button */}
          <button
            id="signup-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#10B981] hover:bg-[#0D9668] active:scale-[0.99] text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Existing account link */}
        <p id="signup-login-prompt" className="mt-5 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <button 
            onClick={onNavigateToLogin}
            className="text-emerald-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Log in
          </button>
        </p>
      </motion.div>

      {/* Bottom Trust Indicators */}
      <div id="signup-trust-bar" className="sm:mx-auto sm:w-full sm:max-w-md mt-10 grid grid-cols-3 gap-4 border-t border-gray-800/60 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-[#141A21] flex items-center justify-center text-emerald-400 mb-2">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-white">SSL Encrypted</span>
          <span className="text-[9px] text-gray-500 mt-0.5">Secure data logs</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-[#141A21] flex items-center justify-center text-emerald-400 mb-2">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-white">No Card Required</span>
          <span className="text-[9px] text-gray-500 mt-0.5">Totally free to use</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-[#141A21] flex items-center justify-center text-emerald-400 mb-2">
            <Star className="w-4 h-4 fill-emerald-400/20" />
          </div>
          <span className="text-[11px] font-medium text-white">4.9 Rated Coach</span>
          <span className="text-[9px] text-gray-500 mt-0.5">Verified health tips</span>
        </div>
      </div>
    </div>
  );
}
