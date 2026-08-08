import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Award, Calendar, Compass, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/60 to-brand-950/20 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse"></div>
        
        <div className="max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
            <Sparkles size={12} className="animate-spin" />
            SkillSync Platform Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
            Hello, {user?.name}! Ready to swap skills?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Discover peer matches, schedule learning sessions, manage your skills, and chat live with peers.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/matches"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10"
            >
              <Compass size={14} />
              Explore Matches
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition duration-300"
            >
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/matches" className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-brand-500/40 hover:bg-slate-900/60 transition duration-300 space-y-3 group">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 w-fit group-hover:scale-110 transition duration-300">
            <Compass size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-100">Find Matches</h4>
            <p className="text-xs text-slate-400 mt-1">Discover peers to teach & learn with</p>
          </div>
        </Link>

        <Link to="/tracker" className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-brand-500/40 hover:bg-slate-900/60 transition duration-300 space-y-3 group">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition duration-300">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-100">My Matches</h4>
            <p className="text-xs text-slate-400 mt-1">Track accepted peer connections</p>
          </div>
        </Link>

        <Link to="/chat" className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-brand-500/40 hover:bg-slate-900/60 transition duration-300 space-y-3 group">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit group-hover:scale-110 transition duration-300">
            <MessageSquare size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-100">In-App Chat</h4>
            <p className="text-xs text-slate-400 mt-1">Message & share files with peers</p>
          </div>
        </Link>

        <Link to="/profile" className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-brand-500/40 hover:bg-slate-900/60 transition duration-300 space-y-3 group">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 w-fit group-hover:scale-110 transition duration-300">
            <GraduationCap size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-100">Skills & Profile</h4>
            <p className="text-xs text-slate-400 mt-1">Manage teach/learn skills & hours</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
