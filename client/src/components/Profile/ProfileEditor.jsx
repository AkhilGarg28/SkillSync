import React, { useState } from 'react';
import { TIMEZONES } from '../../utils/constants';
import { Save, X, MapPin, Globe, User, Mail, Image, FileText } from 'lucide-react';

const ProfileEditor = ({ initialData, onSave, onCancel, saving }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'UTC');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(initialData?.profilePhoto || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    setError('');
    onSave({
      name: name.trim(),
      email: email.trim(),
      city: city.trim(),
      timezone,
      bio: bio.trim(),
      profilePhoto: profilePhoto.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Edit Profile Details</h3>
      
      {error && (
        <p className="text-xs text-red-400 font-semibold">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User size={12} className="text-brand-400" />
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition duration-300"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Mail size={12} className="text-brand-400" />
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition duration-300"
          />
        </div>

        {/* City Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin size={12} className="text-brand-400" />
            Location (City)
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition duration-300"
          />
        </div>

        {/* Timezone Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe size={12} className="text-brand-400" />
            Primary Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500 transition duration-300"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Avatar Photo Link */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Image size={12} className="text-brand-400" />
            Avatar Image URL
          </label>
          <input
            type="url"
            value={profilePhoto}
            onChange={(e) => setProfilePhoto(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition duration-300"
          />
        </div>

        {/* Bio Description */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText size={12} className="text-brand-400" />
            About Me / Biography
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition duration-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300"
        >
          <X size={14} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditor;
