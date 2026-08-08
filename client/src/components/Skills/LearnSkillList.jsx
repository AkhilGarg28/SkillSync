import React from 'react';
import SkillCard from './SkillCard';
import { Sparkles } from 'lucide-react';

const LearnSkillList = ({ skills = [], onDelete }) => {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 select-none">
        <Sparkles className="text-slate-600 mb-2" size={24} />
        <p className="text-xs text-slate-500">No learning skills listed.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill, idx) => (
        <SkillCard
          key={`${skill.skillName}-${idx}`}
          name={skill.skillName}
          level={skill.desiredLevel}
          type="learn"
          onDelete={onDelete ? () => onDelete(idx) : null}
        />
      ))}
    </div>
  );
};

export default LearnSkillList;
