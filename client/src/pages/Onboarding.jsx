import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import SkillForm from '../components/Skills/SkillForm';
import TeachSkillList from '../components/Skills/TeachSkillList';
import LearnSkillList from '../components/Skills/LearnSkillList';
import AvailabilityPicker from '../components/Availability/AvailabilityPicker';
import { Sparkles, MapPin, Globe, ArrowRight, ArrowLeft, Check, Compass } from 'lucide-react';

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Basic Details state
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  // Skill arrays states
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  const handleNextStep1 = async () => {
    if (!name.trim() || !city.trim()) return;
    setLoading(true);
    try {
      const response = await userService.updateProfile(user.id, {
        name: name.trim(),
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
      const response = await userService.updateProfile(user.id, {
        availability: availabilitySlots,
        timezone,
      });
      updateUser(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeach = (skill) => {
    setTeachSkills([...teachSkills, skill]);
  };

  const handleRemoveTeach = (index) => {
    setTeachSkills(teachSkills.filter((_, i) => i !== index));
  };

  const handleAddLearn = (skill) => {
    setLearnSkills([...learnSkills, skill]);
  };

  const handleRemoveLearn = (index) => {
    setLearnSkills(learnSkills.filter((_, i) => i !== index));
  };

  const handleAvailabilityChange = ({ slots, timezone: tz }) => {
    setAvailabilitySlots(slots);
    setTimezone(tz);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Welcome Onboarding</h2>
              <p className="text-[10px] text-slate-450 font-semibold">Customize your profile & swap skills</p>
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

        {/* Wizards stages */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                <Sparkles size={20} className="text-brand-400 animate-pulse" />
                Tell us about yourself
              </h3>
              <p className="text-xs text-slate-400">Provide basic location and details for matching.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-brand-500"
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
                  placeholder="e.g. San Francisco"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-brand-500"
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
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
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
                disabled={loading || !name.trim() || !city.trim()}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-bold text-white transition duration-300 disabled:opacity-50"
              >
                Next Step
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100">🎓 What skills can you teach?</h3>
              <p className="text-xs text-slate-400">Add competency fields you'd like to mentor peers in.</p>
            </div>

            <SkillForm onAdd={handleAddTeach} type="teach" />
            <TeachSkillList skills={teachSkills} onDelete={handleRemoveTeach} />

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
                Next Step
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100">📖 What skills do you want to learn?</h3>
              <p className="text-xs text-slate-400">Add the skills you want to learn from peers.</p>
            </div>

            <SkillForm onAdd={handleAddLearn} type="learn" />
            <LearnSkillList skills={learnSkills} onDelete={handleRemoveLearn} />

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
                Next Step
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-100">📅 Set weekly available slots</h3>
              <p className="text-xs text-slate-400">Pick the weekly timeslots you can reserve for peer sessions.</p>
            </div>

            <AvailabilityPicker
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
                {loading ? 'Finishing...' : 'Complete & Finish'}
                <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
