import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import ProfileEditor from '../components/Profile/ProfileEditor';
import SkillForm from '../components/Skills/SkillForm';
import TeachSkillList from '../components/Skills/TeachSkillList';
import LearnSkillList from '../components/Skills/LearnSkillList';
import AvailabilityPicker from '../components/Availability/AvailabilityPicker';
import Loader from '../components/Layout/Loader';
import { useNavigate } from 'react-router-dom';
import { Edit2, GraduationCap, BookOpen, Calendar, ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await userService.getProfile(user.id);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleProfileSave = async (profileData) => {
    setError('');
    setSaving(true);
    try {
      const response = await userService.updateProfile(user.id, profileData);
      setProfile(response.data);
      updateUser(response.data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
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

  const handleAvailabilityChange = async ({ slots, timezone }) => {
    try {
      const response = await userService.updateProfile(user.id, {
        availability: slots,
        timezone,
      });
      setProfile(response.data);
      updateUser(response.data);
    } catch (err) {
      setError('Failed to save availability window.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 select-none select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
          <Edit2 size={20} className="text-brand-400" />
          Edit My Profile
        </h2>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-400 hover:text-slate-200 transition duration-300"
        >
          <ArrowLeft size={14} />
          Back to Profile
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Profile Details Form */}
      <ProfileEditor
        initialData={profile}
        onSave={handleProfileSave}
        onCancel={() => navigate('/profile')}
        saving={saving}
      />

      {/* Teach Skills */}
      <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <GraduationCap size={18} className="text-brand-400" />
          Manage Skills You Teach
        </h3>
        <SkillForm onAdd={handleAddTeachSkill} type="teach" />
        <TeachSkillList skills={profile?.skillsToTeach || []} onDelete={handleRemoveTeachSkill} />
      </div>

      {/* Learn Skills */}
      <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <BookOpen size={18} className="text-brand-400" />
          Manage Skills You Want to Learn
        </h3>
        <SkillForm onAdd={handleAddLearnSkill} type="learn" />
        <LearnSkillList skills={profile?.skillsToLearn || []} onDelete={handleRemoveLearnSkill} />
      </div>

      {/* Availability Calendar picker */}
      <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Calendar size={18} className="text-brand-400" />
          Manage Weekly Available Hours
        </h3>
        <AvailabilityPicker
          slots={profile?.availability || []}
          timezone={profile?.timezone || 'UTC'}
          onChange={handleAvailabilityChange}
        />
      </div>
    </div>
  );
};

export default EditProfile;
