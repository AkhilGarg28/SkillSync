import React from 'react';
import { Award, AwardIcon, ShieldCheck, Star } from 'lucide-react';

const badgeConfigs = {
  'Verified Teacher': {
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/10',
  },
  'Peer Rated': {
    icon: Star,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/10',
  },
  default: {
    icon: Award,
    color: 'from-brand-500/20 to-violet-500/20 text-brand-300 border-brand-500/30',
    iconColor: 'text-brand-400',
    glowColor: 'shadow-brand-500/10',
  },
};

const Badge = ({ name, description }) => {
  const config = badgeConfigs[name] || badgeConfigs.default;
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${config.color} shadow-lg ${config.glowColor} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}
      title={description}
    >
      <div className={`p-1.5 rounded-lg bg-slate-950/40 border border-white/5 ${config.iconColor}`}>
        <IconComponent size={20} />
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

export default Badge;
