import React from 'react';
import BadgeCard from './BadgeCard';
import { Award } from 'lucide-react';

const BadgeList = ({ badges = [] }) => {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 select-none">
        <Award className="text-slate-650 mb-2" size={24} />
        <p className="text-xs text-slate-500 font-medium">No badges earned yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {badges.map((badge, idx) => (
        <BadgeCard
          key={`${badge.name}-${idx}`}
          name={badge.name}
          description={badge.description}
        />
      ))}
    </div>
  );
};

export default BadgeList;
