import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(getApiUrl('/api/auth/login'), { email, password });
      const { token, user: userData } = response.data.data;

      if (userData.role !== 'admin') {
        setError('Access Denied: This account does not have administrator privileges.');
        setLoading(false);
        return;
      }

      localStorage.setItem('skillsync_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('skillsync_user', JSON.stringify(userData));
      updateUser(userData);

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur-xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/5">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-100 font-serif">Admin Portal Login</h2>
          <p className="text-xs text-slate-400">Restricted administrative access endpoint</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skillsync.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold uppercase tracking-wider transition duration-300 shadow-lg shadow-amber-500/10"
          >
            {loading ? 'Authenticating...' : 'Sign In To Admin Portal'}
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
