import React, { useState } from 'react';
import { EXPERIENCE_LEVELS } from '../../utils/constants';
import { Plus, GraduationCap, BookOpen, Link2, Sparkles } from 'lucide-react';

const SkillForm = ({ onAdd, type = 'teach' }) => {
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [proofLink, setProofLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setError('Skill name is required');
      return;
    }
    setError('');
    onAdd({
      skillName: skillName.trim(),
      [type === 'teach' ? 'experienceLevel' : 'desiredLevel']: level,
      ...(type === 'teach' && proofLink ? { proofLink: proofLink.trim() } : {}),
    });
    setSkillName('');
    setProofLink('');
  };

  const isTeach = type === 'teach';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-900/20 select-none">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <Sparkles size={12} className="text-brand-400" />
        Add {isTeach ? 'Teaching' : 'Learning'} Skill
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Skill Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Skill Name</label>
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g. Node.js, Public Speaking"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Experience Level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">
            {isTeach ? 'Your Level' : 'Desired Level'}
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
          >
            {EXPERIENCE_LEVELS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isTeach && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <Link2 size={12} />
            Proof Link (Optional)
          </label>
          <input
            type="url"
            value={proofLink}
            onChange={(e) => setProofLink(e.target.value)}
            placeholder="e.g. Certificate URL or GitHub repo link"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-dashed border-slate-700 hover:border-brand-500 hover:bg-brand-500/5 text-slate-400 hover:text-brand-300 transition duration-300"
      >
        <Plus size={14} />
        Add Skill
      </button>
    </form>
  );
};

export default SkillForm;
