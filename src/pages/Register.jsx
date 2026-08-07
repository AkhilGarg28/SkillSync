import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Sparkles, UserPlus, AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Full name is required').trim(),
    email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Register = () => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await registerUser(data.name, data.email, data.password);
      // Success logs the user in automatically (stores JWT/user) and redirects to onboarding
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Logo/Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-slate-100 font-serif">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Start swapping skills with matches worldwide</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User size={12} className="text-brand-400" />
              Full Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. John Doe"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
            />
            {errors.name && <span className="text-xs text-red-400 mt-1">{errors.name.message}</span>}
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail size={12} className="text-brand-400" />
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. john@example.com"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
            />
            {errors.email && <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock size={12} className="text-brand-400" />
              Password (Min 8 chars)
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
            />
            {errors.password && <span className="text-xs text-red-400 mt-1">{errors.password.message}</span>}
          </div>

          {/* Confirm Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock size={12} className="text-brand-400" />
              Confirm Password
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</span>
            )}
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
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
