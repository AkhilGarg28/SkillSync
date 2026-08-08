import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as userService from '../services/userService';
import Badge from '../components/Badges/Badge';
import { SkillsList } from '../components/Skills/SkillsComponents';
import AvailabilityCalendar from '../components/Availability/AvailabilityCalendar';
import { MapPin, Globe, Sparkles, Award, GraduationCap, BookOpen, Calendar, ArrowLeft, Star, Heart } from 'lucide-react';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        console.error('Failed to load public profile:', err);
        setError('User profile not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 select-none">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl max-w-sm">
          <p className="text-sm font-semibold">{error || 'Failed to display user profile.'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Return header */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Candidates
        </button>
      </div>

      {/* Header Profile Info card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Photo */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-800 relative overflow-hidden">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="text-center md:text-left space-y-2 flex-grow">
            <h2 className="text-2xl font-black text-slate-100 font-serif flex items-center justify-center md:justify-start gap-2">
              {profile.name}
              <Sparkles size={16} className="text-brand-400 animate-pulse" />
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 font-semibold">
              {profile.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-400" />
                  {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-brand-400" />
                {profile.timezone}
              </span>
            </div>
            {/* Ratings summary placeholder - Module 4 evaluation integration */}
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 text-xs font-semibold pt-1">
              <Star size={14} className="fill-current" />
              <span>4.8 / 5.0 Peer Rating</span>
              <span className="text-slate-500 ml-1 font-normal">• (12 feedback ratings)</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-slate-800/60 relative z-10">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">About Me</label>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed italic">
              "{profile.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Badges container */}
      {badges.length > 0 && (
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award size={16} className="text-brand-400" />
            Peer Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge, idx) => (
              <Badge key={idx} name={badge.name} description={badge.description} />
            ))}
          </div>
        </div>
      )}

      {/* Teach & Learn listing */}
      <div className="grid grid-cols-1 gap-8">
        {/* Teach Skills */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-400" />
            Skills They Teach
          </h3>
          <SkillsList skills={profile.skillsToTeach || []} type="teach" />
        </div>

        {/* Learn Skills */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-400" />
            Skills They Want to Learn
          </h3>
          <SkillsList skills={profile.skillsToLearn || []} type="learn" />
        </div>

        {/* Availability Calendar */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={18} className="text-brand-400" />
            Weekly Available Hours
          </h3>
          <AvailabilityCalendar
            slots={profile.availability || []}
            timezone={profile.timezone || 'UTC'}
            editable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
