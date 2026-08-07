import React from 'react';
import { getInitials } from '../../utils/helpers';
import { MapPin, Globe, Sparkles, Mail } from 'lucide-react';

const ProfileHeader = ({ name, email, city, timezone, profilePhoto }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-xl select-none">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Profile Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-800 relative overflow-hidden">
          {profilePhoto ? (
            <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
          ) : (
            getInitials(name)
          )}
        </div>

        <div className="text-center md:text-left space-y-2">
          <h2 className="text-2xl font-black text-slate-100 font-serif flex items-center justify-center md:justify-start gap-2">
            {name}
            <Sparkles size={16} className="text-brand-400" />
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-brand-400" />
              {email}
            </span>
            {city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-400" />
                {city}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-brand-400" />
              {timezone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
