import React from 'react';
import { Clock, Globe, Calendar } from 'lucide-react';

const AvailabilityCard = ({ slots = [], timezone = 'UTC' }) => {
  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Globe size={14} className="text-brand-400" />
        <span>Timezone: {timezone}</span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar size={14} className="text-brand-400" />
          Weekly slots
        </label>

        {slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <Clock className="text-slate-600 mb-2" size={20} />
            <p className="text-xs text-slate-500 font-medium">No hours registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slots.map((slot, index) => (
              <div
                key={`${slot.dayOfWeek}-${slot.startTime}-${index}`}
                className="p-3 rounded-xl border border-slate-850 bg-slate-900/20 text-slate-200"
              >
                <span className="text-xs font-bold text-brand-400">{slot.dayOfWeek}</span>
                <p className="text-sm font-semibold mt-0.5">{slot.startTime} - {slot.endTime}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCard;
