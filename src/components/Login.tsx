import React, { useState } from 'react';
import { Shield, CreditCard, Star, Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { authService } from '../lib/supabase';

interface LoginProps {
  onSuccess: (user: { id?: string; fullName: string; email: string }) => void;
  onNavigateToSignup: () => void;
}

export default function Login({ onSuccess, onNavigateToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signIn(email, password);
      if (response.success && response.user) {
        onSuccess({
          id: response.user.id,
          fullName: response.user.fullName,
          email: response.user.email,
        });
      } else {
        setError(response.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#0B0F13] text-gray-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Upper Logo / Brand */}
      <div id="login-brand" className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <div id="login-logo-badge" className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <h2 id="login-brand-title" className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          FitAI: Fitness Buddy
        </h2>
        <p id="login-brand-tagline" className="mt-1.5 text-sm text-gray-400">
          Log back in to track your meals, body metrics, and progress
        </p>
      </div>

      {/* Main Card */}
      <motion.div 
        id="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-[#141A21] border border-gray-800/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Welcome back</h3>
          <p className="text-xs text-gray-400 mt-1">Pick up right where you left off with your training and calorie logs</p>
        </div>

        {error && (
          <div id="login-error-alert" className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div id="login-field-email">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div id="login-field-password">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-emerald-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-input-password"
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

          {/* Action button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#10B981] hover:bg-[#0D9668] active:scale-[0.99] text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Log in'}
          </button>
        </form>

        {/* Create account link */}
        <p id="login-signup-prompt" className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToSignup}
            className="text-emerald-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Create a free account
          </button>
        </p>
      </motion.div>

      {/* Bottom Trust Indicators */}
      <div id="login-trust-bar" className="sm:mx-auto sm:w-full sm:max-w-md mt-10 grid grid-cols-3 gap-4 border-t border-gray-800/60 pt-6">
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
