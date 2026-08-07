import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginForm = ({ onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 select-none">
      {/* Email input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Mail size={12} className="text-brand-400" />
          Email Address
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="e.g. john@example.com"
          className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition duration-300"
        />
        {errors.email && (
          <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>
        )}
      </div>

      {/* Password input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lock size={12} className="text-brand-400" />
          Password
        </label>
        <input
          type="password"
          {...register('password')}
          placeholder="••••••••"
          className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition duration-300"
        />
        {errors.password && (
          <span className="text-xs text-red-400 mt-1">{errors.password.message}</span>
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
            <LogIn size={16} />
            Sign In
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
