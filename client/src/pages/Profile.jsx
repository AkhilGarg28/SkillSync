import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import ProfileCard from '../components/Profile/ProfileCard';
import BadgeList from '../components/Badges/BadgeList';
import TeachSkillList from '../components/Skills/TeachSkillList';
import LearnSkillList from '../components/Skills/LearnSkillList';
import AvailabilityCard from '../components/Availability/AvailabilityCard';
import Loader from '../components/Layout/Loader';
import { Link } from 'react-router-dom';
import { Edit, Award, GraduationCap, BookOpen, Calendar, Settings } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [profileRes, badgesRes] = await Promise.all([
          userService.getProfile(user.id),
          userService.getBadges(user.id),
        ]);
        setProfile(profileRes.data);
        setBadges(badgesRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 select-none select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
          <Settings size={20} className="text-brand-400" />
          My Profile Dashboard
        </h2>
        <Link
          to="/profile/edit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-brand-400 hover:text-brand-300 transition duration-300"
        >
          <Edit size={14} />
          Edit Profile
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Basic info card */}
      <ProfileCard profile={profile} />

      {/* Badges Earned Container */}
      <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Award size={16} className="text-brand-400" />
          Earned Badges
        </h3>
        <BadgeList badges={badges} />
      </div>

      {/* Skills list grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Teach list */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-400" />
            Skills You Teach
          </h3>
          <TeachSkillList skills={profile?.skillsToTeach || []} />
        </div>

        {/* Learn list */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-400" />
            Skills You Want to Learn
          </h3>
          <LearnSkillList skills={profile?.skillsToLearn || []} />
        </div>

        {/* Availability Calendar card */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={18} className="text-brand-400" />
            Weekly Available Calendar
          </h3>
          <AvailabilityCard slots={profile?.availability || []} timezone={profile?.timezone} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
