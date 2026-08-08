import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import { SkillSelector, SkillsList } from '../components/Skills/SkillsComponents';
import AvailabilityCalendar from '../components/Availability/AvailabilityCalendar';
import { Sparkles, MapPin, Globe, ArrowRight, ArrowLeft, Check, Compass } from 'lucide-react';

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Basic Details
  const [fullName, setFullName] = useState(user?.name || '');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  // Step 2: Teach Skills
  const [teachSkills, setTeachSkills] = useState([]);

  // Step 3: Learn Skills
  const [learnSkills, setLearnSkills] = useState([]);

  // Step 4: Availability
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  const handleNextStep1 = async () => {
    if (!fullName.trim() || !city.trim()) return;
    setLoading(true);
    try {
      const response = await userService.updateProfile(user.id, {
        name: fullName.trim(),
        city: city.trim(),
        timezone,
      });
      updateUser(response.data);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep2 = async () => {
    setLoading(true);
    try {
      // Post all teach skills to the backend
      for (const skill of teachSkills) {
        await userService.addTeachSkill(user.id, skill);
      }
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep3 = async () => {
    setLoading(true);
    try {
      // Post all learn skills to the backend
      for (const skill of learnSkills) {
        await userService.addLearnSkill(user.id, skill);
      }
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishStep4 = async () => {
    setLoading(true);
    try {
      // Put availability slots and timezone to user profile
      const response = await userService.updateProfile(user.id, {
        availability: availabilitySlots,
        timezone,
      });
      updateUser(response.data);
      navigate('/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeachSkill = (skill) => {
    setTeachSkills([...teachSkills, skill]);
  };

  const handleRemoveTeachSkill = (idx) => {
    setTeachSkills(teachSkills.filter((_, i) => i !== idx));
  };

  const handleAddLearnSkill = (skill) => {
    setLearnSkills([...learnSkills, skill]);
  };

  const handleRemoveLearnSkill = (idx) => {
    setLearnSkills(learnSkills.filter((_, i) => i !== idx));
  };

  const handleAvailabilityChange = ({ slots, timezone: selectedTimezone }) => {
    setAvailabilitySlots(slots);
    setTimezone(selectedTimezone);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Onboarding wizard</h2>
              <p className="text-[10px] text-slate-400 font-semibold">Customize your peer matching details</p>
            </div>
          </div>
          <div className="flex gap-1.5 text-xs text-slate-500 font-bold tracking-wider">
            <span className={step >= 1 ? 'text-brand-400' : ''}>1</span>
            <span>/</span>
            <span className={step >= 2 ? 'text-brand-400' : ''}>2</span>
            <span>/</span>
            <span className={step >= 3 ? 'text-brand-400' : ''}>3</span>
            <span>/</span>
            <span className={step >= 4 ? 'text-brand-400' : ''}>4</span>
          </div>
        </div>

        {/* Wizard Step Forms */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                <Sparkles size={20} className="text-brand-400" />
                Tell us about yourself
              </h3>
              <p className="text-xs text-slate-400">These details will help peers recognize your name, location, and timezone.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin size={12} className="text-brand-400" />
                  Your Location (City)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco, London"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe size={12} className="text-brand-400" />
                  Primary Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">EST (America/New_York)</option>
                  <option value="America/Los_Angeles">PST (America/Los_Angeles)</option>
                  <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                  <option value="Europe/London">GMT (Europe/London)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep1}
                disabled={loading || !fullName.trim() || !city.trim()}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Next Step'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                🎓 What skills can you teach?
              </h3>
              <p className="text-xs text-slate-400">Add the skills you are comfortable mentoring peers in, including optional proof links (e.g. GitHub profile, certificates).</p>
            </div>

            <SkillSelector onAdd={handleAddTeachSkill} type="teach" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Added Teaching Skills ({teachSkills.length})</h4>
              <SkillsList skills={teachSkills} type="teach" onRemove={handleRemoveTeachSkill} />
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sm font-bold text-slate-400 hover:text-slate-200 transition duration-300"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300"
              >
                {loading ? 'Saving...' : 'Next Step'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                📖 What skills do you want to learn?
              </h3>
              <p className="text-xs text-slate-400">Specify the skills you want to learn and your desired level (e.g. Beginner, Intermediate).</p>
            </div>

            <SkillSelector onAdd={handleAddLearnSkill} type="learn" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Added Learning Skills ({learnSkills.length})</h4>
              <SkillsList skills={learnSkills} type="learn" onRemove={handleRemoveLearnSkill} />
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sm font-bold text-slate-400 hover:text-slate-200 transition duration-300"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep3}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300"
              >
                {loading ? 'Saving...' : 'Next Step'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                📅 Set your weekly availability
              </h3>
              <p className="text-xs text-slate-400">Specify the weekly slots you are available for skill-swap sessions. This data is critical for the Module 3 session scheduling engine.</p>
            </div>

            <AvailabilityCalendar
              slots={availabilitySlots}
              timezone={timezone}
              onChange={handleAvailabilityChange}
            />

            <div className="pt-4 border-t border-slate-800/60 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sm font-bold text-slate-400 hover:text-slate-200 transition duration-300"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={handleFinishStep4}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-sm font-bold text-white transition duration-300 shadow-md shadow-brand-600/10"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Check size={16} />
                    Complete & Finish
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
