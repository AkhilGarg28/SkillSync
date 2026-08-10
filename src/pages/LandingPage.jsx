import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  Video,
  MessageSquare,
  MessageCircle,
  Star,
  CheckCircle2,
  Users,
  Code,
  Music,
  Palette,
  FileSpreadsheet,
  Globe,
  Laptop,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none selection:bg-brand-500 selection:text-white flex flex-col">
      {/* SECTION 1 — NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-slate-100 font-bold text-lg tracking-wide hover:opacity-90">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
            <Sparkles size={16} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300 font-extrabold font-serif">
            SkillSync
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#hero" className="hover:text-slate-200 transition">
            Home
          </a>
          <a href="#how-it-works" className="hover:text-slate-200 transition">
            How It Works
          </a>
          <a href="#features" className="hover:text-slate-200 transition">
            Features
          </a>
          <a href="#examples" className="hover:text-slate-200 transition">
            Examples
          </a>
        </div>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 space-y-24 pb-20">
        {/* SECTION 2 — HERO */}
        <section id="hero" className="relative pt-12 md:pt-20 px-4 md:px-8 max-w-6xl mx-auto text-center">
          {/* Ambient Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>

          <div className="space-y-6 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              <Sparkles size={14} className="text-brand-400" />
              Peer-to-Peer Skill Exchange Platform
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-100 font-serif leading-tight tracking-tight">
              Learn. Teach. <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-400">
                Swap Skills.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
              SkillSync connects people who want to learn with people who can teach, making skill exchange simple, affordable and community-driven.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300 shadow-lg shadow-brand-600/25 group"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition duration-300" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold text-slate-300 hover:text-white transition duration-300"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="mt-12 md:mt-16 p-4 sm:p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Teaching Side */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>You Teach What You Know</span>
                </div>
                <p className="text-xs text-slate-300">
                  Share your expertise in programming, languages, design, music, or professional tools with eager learners.
                </p>
              </div>

              {/* Learning Side */}
              <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 text-left space-y-2">
                <div className="flex items-center gap-2 text-brand-400 font-bold text-xs">
                  <Sparkles size={16} />
                  <span>You Learn What You Need</span>
                </div>
                <p className="text-xs text-slate-300">
                  Connect 1-on-1 with matched peers to gain new skills through practical exchange sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — HOW IT WORKS */}
        <section id="how-it-works" className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-serif">
              How SkillSync Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Exchange skills directly with matched peers in four straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-100">Create Your Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add the skills you can teach and the skills you want to learn.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-100">Find Your Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore compatible people based on complementary skills.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-100">Send a Swap Request</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with someone and request a skill exchange.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-slate-100">Schedule & Learn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once matched, schedule a session and meet through the available video meeting option.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 — FEATURES */}
        <section id="features" className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-serif">
              Built For Seamless Peer Exchange
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Everything you need to find peers, request swaps, schedule sessions, and communicate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 w-fit">
                <Compass size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Skill Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find people with complementary skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <Users size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Swap Requests</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send and manage skill exchange requests.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <Calendar size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Scheduled Sessions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plan learning sessions with your matches.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 w-fit">
                <Video size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Video Meetings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join SkillSync meetings or use supported meeting links.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 w-fit">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Chat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Communicate with accepted matches.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                <MessageCircle size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Community Forum</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discuss skills, learning and experiences.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 w-fit">
                <Star size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Reviews & Ratings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review your learning experience after sessions.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 space-y-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-100">Progress Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your match/session progress.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5 — SKILL EXCHANGE EXAMPLES */}
        <section id="examples" className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-serif">
              Skill Exchange Examples
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Illustrative examples of how members exchange knowledge on SkillSync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example 1 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                  <Code size={18} />
                  <span>Python</span>
                </div>
                <span className="text-slate-500 text-xs font-bold font-mono">↔</span>
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                  <Music size={18} />
                  <span>Guitar</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Teach basics of Python programming in exchange for acoustic guitar chords and practice guidance."
              </p>
            </div>

            {/* Example 2 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <Palette size={18} />
                  <span>Graphic Design</span>
                </div>
                <span className="text-slate-500 text-xs font-bold font-mono">↔</span>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FileSpreadsheet size={18} />
                  <span>Excel</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Offer Figma and UI design feedback in exchange for advanced Excel formulas and data modeling."
              </p>
            </div>

            {/* Example 3 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Globe size={18} />
                  <span>Spoken English</span>
                </div>
                <span className="text-slate-500 text-xs font-bold font-mono">↔</span>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Laptop size={18} />
                  <span>Web Development</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Practice conversational English with a peer while receiving mentorship on React and JavaScript."
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6 — CALL TO ACTION */}
        <section className="px-4 md:px-8 max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-brand-950/30 to-slate-900 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-100 font-serif">
              Ready to exchange your skills?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Create your SkillSync profile and start learning from people around you.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300 shadow-xl shadow-brand-600/30"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 7 — FOOTER */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-slate-100">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-xs">
                <Sparkles size={12} />
              </div>
              <span className="font-serif">SkillSync</span>
            </div>
            <p className="text-xs text-slate-500">Learn. Teach. Swap Skills.</p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-semibold">
            <a href="#hero" className="hover:text-slate-200 transition">
              Home
            </a>
            <Link to="/login" className="hover:text-slate-200 transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-slate-200 transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
