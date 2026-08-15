import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, X, AlertTriangle, Info, Wrench } from 'lucide-react';
import { getApiUrl } from '../config/api';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    const fetchActiveAnnouncements = async () => {
      try {
        const res = await axios.get(getApiUrl('/api/announcements/active'));
        if (res.data.success) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        // Silent catch for non-blocking banner
      }
    };
    fetchActiveAnnouncements();
  }, []);

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a._id));

  if (visibleAnnouncements.length === 0) return null;

  const current = visibleAnnouncements[0];

  const getTypeStyle = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300 icon-amber-400';
      case 'maintenance':
        return 'bg-red-500/10 border-red-500/30 text-red-300 icon-red-400';
      default:
        return 'bg-brand-500/10 border-brand-500/30 text-brand-300 icon-brand-400';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
      case 'maintenance':
        return <Wrench size={16} className="text-red-400 shrink-0" />;
      default:
        return <Megaphone size={16} className="text-brand-400 shrink-0" />;
    }
  };

  return (
    <div className={`px-4 py-2.5 border-b backdrop-blur-md flex items-center justify-between text-xs font-medium transition duration-300 select-none ${getTypeStyle(current.type)}`}>
      <div className="flex items-center gap-2 max-w-4xl mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
        {getIcon(current.type)}
        <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800">
          {current.type}
        </span>
        <strong className="font-semibold text-slate-100">{current.title}:</strong>
        <span className="text-slate-300">{current.message}</span>
      </div>
      <button
        onClick={() => setDismissedIds((prev) => [...prev, current._id])}
        className="p-1 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition duration-200"
        title="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
