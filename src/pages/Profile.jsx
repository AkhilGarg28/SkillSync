import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import Badge from '../components/Badges/Badge';
import { SkillsList, SkillSelector } from '../components/Skills/SkillsComponents';
import AvailabilityCalendar from '../components/Availability/AvailabilityCalendar';
import { User, Edit, Save, X, MapPin, Globe, Sparkles, Award, GraduationCap, BookOpen, Calendar, Mail } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Editable fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const fetchProfileAndBadges = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [profileRes, badgesRes] = await Promise.all([
          userService.getProfile(user.id),
          userService.getBadges(user.id),
        ]);
        setProfile(profileRes.data);
        setBadges(badgesRes.data);

        // Populate form inputs
        setName(profileRes.data.name || '');
        setEmail(profileRes.data.email || '');
        setCity(profileRes.data.city || '');
        setTimezone(profileRes.data.timezone || 'UTC');
        setBio(profileRes.data.bio || '');
        setProfilePhoto(profileRes.data.profilePhoto || '');
        setAvailability(profileRes.data.availability || []);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Could not retrieve profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndBadges();
  }, [user?.id]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required fields.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const response = await userService.updateProfile(user.id, {
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
        timezone,
        bio: bio.trim(),
        profilePhoto: profilePhoto.trim(),
        availability,
      });

      setProfile(response.data);
      updateUser(response.data);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setError('');
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setCity(profile.city || '');
      setTimezone(profile.timezone || 'UTC');
      setBio(profile.bio || '');
      setProfilePhoto(profile.profilePhoto || '');
      setAvailability(profile.availability || []);
    }
    setEditMode(false);
  };

  const handleAddTeachSkill = async (newSkill) => {
    try {
      const response = await userService.addTeachSkill(user.id, newSkill);
      setProfile(response.data);
      updateUser(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add teaching skill.');
    }
  };

  const handleRemoveTeachSkill = async (idx) => {
    if (!profile) return;
    const updatedSkills = profile.skillsToTeach.filter((_, i) => i !== idx);
    try {
      const response = await userService.updateProfile(user.id, {
        skillsToTeach: updatedSkills,
      });
      setProfile(response.data);
      updateUser(response.data);
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  const handleAddLearnSkill = async (newSkill) => {
    try {
      const response = await userService.addLearnSkill(user.id, newSkill);
      setProfile(response.data);
      updateUser(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add learning skill.');
    }
  };

  const handleRemoveLearnSkill = async (idx) => {
    if (!profile) return;
    const updatedSkills = profile.skillsToLearn.filter((_, i) => i !== idx);
    try {
      const response = await userService.updateProfile(user.id, {
        skillsToLearn: updatedSkills,
      });
      setProfile(response.data);
      updateUser(response.data);
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  const handleAvailabilityChange = ({ slots, timezone: selectedTimezone }) => {
    setAvailability(slots);
    setTimezone(selectedTimezone);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl md:col-span-2"></div>
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Header Profile Info */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Photo */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-800 relative group overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="text-center md:text-left space-y-2">
              {editMode ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500 block"
                  />
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="Profile Image URL"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 block w-full"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-slate-100 font-serif flex items-center gap-2">
                    {profile?.name}
                    <Sparkles size={16} className="text-brand-400" />
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} className="text-brand-400" />
                      {profile?.email}
                    </span>
                    {profile?.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand-400" />
                        {profile?.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Globe size={14} className="text-brand-400" />
                      {profile?.timezone}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10 disabled:opacity-50"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300"
                >
                  <X size={14} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-brand-400 hover:text-brand-300 transition duration-300"
              >
                <Edit size={14} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 relative z-10">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">About Me / Bio</label>
          {editMode ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other skill swappers a bit about your journey..."
              rows={3}
              className="w-full mt-2 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
            />
          ) : (
            <p className="text-sm text-slate-300 mt-2 leading-relaxed italic">
              {profile?.bio || '"No bio information declared yet."'}
            </p>
          )}
        </div>
      </div>

      {/* Badges Earned Container */}
      {badges.length > 0 && (
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award size={16} className="text-brand-400" />
            Earned Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge, idx) => (
              <Badge key={idx} name={badge.name} description={badge.description} />
            ))}
          </div>
        </div>
      )}

      {/* Skills Manager grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Teach Skills */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-400" />
            Skills You Teach
          </h3>
          {editMode && <SkillSelector onAdd={handleAddTeachSkill} type="teach" />}
          <SkillsList
            skills={profile?.skillsToTeach || []}
            type="teach"
            onRemove={editMode ? handleRemoveTeachSkill : null}
          />
        </div>

        {/* Learn Skills */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-400" />
            Skills You Want to Learn
          </h3>
          {editMode && <SkillSelector onAdd={handleAddLearnSkill} type="learn" />}
          <SkillsList
            skills={profile?.skillsToLearn || []}
            type="learn"
            onRemove={editMode ? handleRemoveLearnSkill : null}
          />
        </div>

        {/* Availability Calendar */}
        <div className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={18} className="text-brand-400" />
            Weekly Available Calendar
          </h3>
          <AvailabilityCalendar
            slots={availability}
            timezone={timezone}
            onChange={handleAvailabilityChange}
            editable={editMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
