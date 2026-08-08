import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { Lock, ArrowLeft, KeyRound, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden select-none">
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white mb-3">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-slate-100 font-serif">Set New Password</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your new password below</p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
              <CheckCircle size={32} className="text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold">Password Reset Successful!</h4>
                <p className="text-xs opacity-80 mt-1">Redirecting you to login page...</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lock size={12} className="text-brand-400" />
                  New Password
                </label>
                <input
                  type="password"
                  {...register('newPassword')}
                  placeholder="At least 6 characters"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
                {errors.newPassword && <span className="text-xs text-red-400 mt-1">{errors.newPassword.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lock size={12} className="text-brand-400" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Re-enter new password"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
                {errors.confirmPassword && <span className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-sm font-bold text-white transition duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sm font-semibold text-slate-400 hover:text-slate-200 transition duration-300"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
