import React from 'react';
import { ShieldCheck, Star, Award } from 'lucide-react';

const badgeStyles = {
  'Verified Teacher': {
    icon: ShieldCheck,
    gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    shadow: 'shadow-emerald-500/5',
  },
  'Peer Rated': {
    icon: Star,
    gradient: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    iconColor: 'text-amber-400',
    shadow: 'shadow-amber-500/5',
  },
  default: {
    icon: Award,
    gradient: 'from-brand-500/20 to-violet-500/20 text-brand-300 border-brand-500/30',
    iconColor: 'text-brand-400',
    shadow: 'shadow-brand-500/5',
  },
};

const BadgeCard = ({ name, description }) => {
  const style = badgeStyles[name] || badgeStyles.default;
  const Icon = style.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${style.gradient} shadow-lg ${style.shadow} transition duration-300 hover:scale-[1.03] select-none`}
      title={description}
    >
      <div className={`p-1.5 rounded-lg bg-slate-950/40 border border-white/5 ${style.iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-semibold tracking-wide">{name}</h4>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default BadgeCard;
