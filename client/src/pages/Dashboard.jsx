import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Award, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 select-none select-none">
      {/* Welcome Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/60 to-brand-950/20 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse"></div>
        
        <div className="max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
            <Sparkles size={12} className="animate-spin" />
            Matching Pool Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-serif leading-tight">
            Hello, {user?.name}! Ready to swap skills?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Update your profile, add new skills, and declare your weekly availability to allow peers to book swaps.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10"
            >
              My Profile
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/profile/edit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 hover:text-white transition duration-300"
            >
              Edit Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 w-fit">
            <GraduationCap size={20} />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-100">
              {user?.skillsToTeach?.length || 0}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Skills to Teach</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 w-fit">
            <BookOpen size={20} />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-100">
              {user?.skillsToLearn?.length || 0}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Skills to Learn</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
            <Award size={20} />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-100">2</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Earned Badges</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-100">
              {user?.availability?.length || 0}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Availability Slots</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
