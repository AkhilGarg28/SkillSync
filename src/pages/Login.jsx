import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initiateGoogleLogin } from '../services/authService';
import { Mail, Lock, LogIn, Chrome, AlertCircle, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(data.email, data.password);
      const userData = res?.data?.data?.user || res?.data?.user;
      if (userData?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
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
        {/* Title / Logo Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-slate-100 font-serif">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Access your SkillSync swaps & matching pool</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail size={12} className="text-brand-400" />
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. yourname@gmail.com"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
            />
            {errors.email && <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock size={12} className="text-brand-400" />
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
            />
            {errors.password && <span className="text-xs text-red-400 mt-1">{errors.password.message}</span>}
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
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or Connect via</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        <button
          type="button"
          onClick={initiateGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition duration-300"
        >
          <Chrome size={18} className="text-red-400" />
          Continue with Google
        </button>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
