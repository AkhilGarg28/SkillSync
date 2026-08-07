import React from 'react';
import { getInitials } from '../../utils/helpers';
import { MapPin, Globe, Sparkles, Star } from 'lucide-react';

const ProfileCard = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-xl select-none">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Profile Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-800 relative overflow-hidden">
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(profile.name)
          )}
        </div>

        <div className="text-center md:text-left space-y-2 flex-grow">
          <h2 className="text-2xl font-black text-slate-100 font-serif flex items-center justify-center md:justify-start gap-2">
            {profile.name}
            <Sparkles size={16} className="text-brand-400" />
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
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 text-xs font-semibold pt-1">
            <Star size={14} className="fill-current" />
            <span>4.9 / 5.0 Rating</span>
            <span className="text-slate-500 ml-1 font-normal">• (Verified Peer reviews)</span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <div className="mt-6 pt-6 border-t border-slate-800/60 relative z-10">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Bio Description</label>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed italic">
            "{profile.bio}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
