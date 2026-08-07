import React from 'react';
import { GraduationCap, BookOpen, Link2, Trash2 } from 'lucide-react';

const SkillCard = ({ name, level, proofLink, type = 'teach', onDelete }) => {
  const isTeach = type === 'teach';

  return (
    <div className="relative group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition duration-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-md select-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isTeach ? 'bg-brand-500/10 text-brand-400' : 'bg-pink-500/10 text-pink-400'}`}>
            {isTeach ? <GraduationCap size={20} /> : <BookOpen size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{isTeach ? 'Teaches' : 'Wants to Learn'} • {level}</p>
          </div>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-slate-500 hover:text-red-400 hover:bg-slate-850 p-1.5 rounded-lg transition"
            title="Delete skill"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {isTeach && proofLink && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-400 hover:underline">
          <Link2 size={12} />
          <a href={proofLink} target="_blank" rel="noopener noreferrer" className="truncate max-w-[200px]">
            View Proof of Competency
          </a>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
