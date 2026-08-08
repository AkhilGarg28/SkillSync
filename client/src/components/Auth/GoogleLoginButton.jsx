import React from 'react';
import { initiateGoogleLogin } from '../../services/authService';
import { Chrome } from 'lucide-react';

const GoogleLoginButton = () => {
  return (
    <button
      type="button"
      onClick={initiateGoogleLogin}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition duration-300 select-none"
    >
      <Chrome size={18} className="text-red-400" />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
