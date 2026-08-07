import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import * as authService from '../services/authService';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
});

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await authService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'User with this email not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-slate-100 font-serif">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">We will email you instructions to reset it</p>
        </div>

        {success ? (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
              <CheckCircle size={32} className="text-emerald-400 animate-bounce" />
              <div>
                <h4 className="text-sm font-bold">Email Dispatched</h4>
                <p className="text-xs opacity-80 mt-1">Please check your inbox (and spam folder) for a recovery link.</p>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sm font-semibold text-slate-300 hover:text-white transition duration-300"
            >
              <ArrowLeft size={16} />
              Return to Login
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
                  <Mail size={12} className="text-brand-400" />
                  Registered Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="e.g. yourname@example.com"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
                {errors.email && <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-sm font-bold text-white transition duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Send size={16} />
                    Send Recovery Link
                  </>
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sm font-semibold text-slate-400 hover:text-slate-200 transition duration-300"
            >
              <ArrowLeft size={16} />
              Cancel & Return
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
