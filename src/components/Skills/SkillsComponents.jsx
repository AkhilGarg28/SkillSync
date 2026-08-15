import React from 'react';
import { BookOpen, GraduationCap, Link2, Plus, Sparkles, X } from 'lucide-react';

// 1. SkillChip: A simple read-only tag
export const SkillChip = ({ name, level, type = 'teach' }) => {
  const isTeach = type === 'teach';
  const colorClass = isTeach
    ? 'bg-brand-500/10 text-brand-300 border-brand-500/20'
    : 'bg-pink-500/10 text-pink-300 border-pink-500/20';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {name}
      {level && (
        <span className="opacity-60 font-normal">
          ({level})
        </span>
      )}
    </span>
  );
};

// 2. SkillCard: Displays single skill in profile/dashboard views
export const SkillCard = ({ name, level, proofLink, proofStatus, rejectionReason, type = 'teach', onRemove }) => {
  const isTeach = type === 'teach';

  return (
    <div className="relative group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isTeach ? 'bg-brand-500/10 text-brand-400' : 'bg-pink-500/10 text-pink-400'}`}>
            {isTeach ? <GraduationCap size={20} /> : <BookOpen size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">{name}</h4>
              {isTeach && proofStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles size={10} />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{isTeach ? 'Teaches' : 'Wants to Learn'} • {level}</p>
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-500 hover:text-red-400 hover:bg-slate-800 p-1 rounded-lg transition"
            title="Remove skill"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isTeach && proofLink && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <a href={proofLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:underline truncate">
            <Link2 size={12} />
            <span>Credentials Proof</span>
          </a>
          {proofStatus && proofStatus !== 'none' && (
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              proofStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              proofStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {proofStatus}
            </span>
          )}
        </div>
      )}

      {isTeach && proofStatus === 'rejected' && rejectionReason && (
        <div className="mt-2 text-[11px] text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <strong className="font-bold">Rejection Reason:</strong> {rejectionReason}
        </div>
      )}
    </div>
  );
};

// 3. ExperienceDropdown: Selection input for experience levels
export const ExperienceDropdown = ({ value, onChange, label = 'Experience Level', options = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

// 4. ProofInput: Input for Optional Proof URLs
export const ProofInput = ({ value, onChange, error }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Proof URL (Optional)</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://github.com/yourusername or certificate link"
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
      />
      {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
    </div>
  );
};

// 5. SkillSelector: A search/select/add wrapper for adding skills
export const SkillSelector = ({ onAdd, type = 'teach' }) => {
  const [skillName, setSkillName] = React.useState('');
  const [level, setLevel] = React.useState('Intermediate');
  const [proofLink, setProofLink] = React.useState('');
  const [error, setError] = React.useState('');

  const handleAdd = () => {
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
    <div className="space-y-4 p-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Skill Name</label>
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g. React.js, Python, Public Speaking"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
          />
        </div>
        <ExperienceDropdown
          value={level}
          onChange={setLevel}
          label={isTeach ? 'Your Experience Level' : 'Desired Level'}
        />
      </div>

      {isTeach && <ProofInput value={proofLink} onChange={setProofLink} />}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-dashed border-slate-700 hover:border-brand-500 hover:bg-brand-500/5 text-slate-300 hover:text-brand-400 transition duration-300"
      >
        <Plus size={16} />
        Add Skill
      </button>
    </div>
  );
};

// 6. SkillsList: Renders grids of SkillCards
export const SkillsList = ({ skills = [], type = 'teach', onRemove }) => {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
        <Sparkles className="text-slate-600 mb-2" size={24} />
        <p className="text-xs text-slate-500">No skills added yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill, idx) => (
        <SkillCard
          key={`${skill.skillName}-${idx}`}
          name={skill.skillName}
          level={type === 'teach' ? skill.experienceLevel : skill.desiredLevel}
          proofLink={skill.proofLink}
          proofStatus={skill.proofStatus}
          rejectionReason={skill.rejectionReason}
          type={type}
          onRemove={onRemove ? () => onRemove(idx) : null}
        />
      ))}
    </div>
  );
};
