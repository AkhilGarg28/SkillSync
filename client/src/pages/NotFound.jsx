import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4 select-none relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 animate-bounce">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-100 font-serif">404</h2>
          <h3 className="text-lg font-bold text-slate-200 mt-2">Page Not Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            The route you are trying to visit does not exist or has been relocated.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-sm font-bold text-white transition duration-300 shadow-lg shadow-brand-600/20"
        >
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
