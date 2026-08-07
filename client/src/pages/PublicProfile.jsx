import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as userService from '../services/userService';
import ProfileCard from '../components/Profile/ProfileCard';
import BadgeList from '../components/Badges/BadgeList';
import TeachSkillList from '../components/Skills/TeachSkillList';
import LearnSkillList from '../components/Skills/LearnSkillList';
import AvailabilityCard from '../components/Availability/AvailabilityCard';
import Loader from '../components/Layout/Loader';
import { ArrowLeft, Award, GraduationCap, BookOpen, Calendar, HelpCircle } from 'lucide-react';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const [profileRes, badgesRes] = await Promise.all([
          userService.getProfile(id),
          userService.getBadges(id),
        ]);
        setProfile(profileRes.data);
        setBadges(badgesRes.data);
      } catch (err) {
        console.error(err);
        setError('User profile not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  if (loading) return <Loader />;

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 select-none">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl max-w-sm">
          <p className="text-sm font-semibold">{error || 'User details not found.'}</p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300"
        >
          <ArrowLeft size={14} />
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none select-none">
      <div className="flex justify-start">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>

      {/* Main card */}
      <ProfileCard profile={profile} />

      {/* Earned badges */}
      <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Award size={16} className="text-brand-400" />
          Peer Badges
        </h3>
        <BadgeList badges={badges} />
      </div>

      {/* Teach & learn grid */}
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-400" />
            Skills They Teach
          </h3>
          <TeachSkillList skills={profile.skillsToTeach || []} />
        </div>

        <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-400" />
            Skills They Want to Learn
          </h3>
          <LearnSkillList skills={profile.skillsToLearn || []} />
        </div>

        <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={18} className="text-brand-400" />
            Weekly Availability Calendar
          </h3>
          <AvailabilityCard slots={profile.availability || []} timezone={profile.timezone} />
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
