import React, { useState } from 'react';
import { Calendar, Clock, Globe, Plus, Trash2, AlertCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIMEZONES = [
  'UTC',
  'Africa/Lagos',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Australia/Sydney',
];

const AvailabilityCalendar = ({ slots = [], timezone = 'UTC', onChange, editable = true }) => {
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');

  const validateTime = (timeStr) => {
    return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
  };

  const handleAddSlot = () => {
    setError('');

    if (!validateTime(startTime) || !validateTime(endTime)) {
      setError('Please provide times in HH:MM 24-hour format');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    // Check for duplicate slots
    const isDuplicate = slots.some(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime === startTime &&
        slot.endTime === endTime
    );

    if (isDuplicate) {
      setError('This time slot has already been added');
      return;
    }

    const updatedSlots = [...slots, { dayOfWeek, startTime, endTime }].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek);
      }
      return a.startTime.localeCompare(b.startTime);
    });

    onChange({ slots: updatedSlots, timezone });
  };

  const handleRemoveSlot = (indexToRemove) => {
    const updatedSlots = slots.filter((_, idx) => idx !== indexToRemove);
    onChange({ slots: updatedSlots, timezone });
  };

  const handleTimezoneChange = (newTimezone) => {
    onChange({ slots, timezone: newTimezone });
  };

  return (
    <div className="space-y-6">
      {/* Timezone Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Globe size={14} className="text-brand-400" />
          Primary Timezone
        </label>
        {editable ? (
          <select
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full md:max-w-xs bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-850 px-4 py-2.5 rounded-xl inline-block max-w-xs">
            {timezone}
          </p>
        )}
      </div>

      {/* Add Slot Widget */}
      {editable && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock size={16} className="text-brand-400" />
            Add Availability Window
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Day</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Start Time (24h)</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 09:00"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">End Time (24h)</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 17:00"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddSlot}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition duration-300 shadow-md shadow-brand-600/10"
          >
            <Plus size={14} />
            Save Slot Window
          </button>
        </div>
      )}

      {/* Slots List */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar size={14} className="text-brand-400" />
          Active Availability Slots ({slots.length})
        </label>

        {slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <Clock className="text-slate-600 mb-2" size={24} />
            <p className="text-xs text-slate-500">No availability slots registered. Please add slots above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slots.map((slot, index) => (
              <div
                key={`${slot.dayOfWeek}-${slot.startTime}-${index}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 transition duration-300 hover:border-slate-700"
              >
                <div>
                  <span className="text-xs font-bold text-brand-400">{slot.dayOfWeek}</span>
                  <p className="text-sm font-medium mt-0.5">{slot.startTime} - {slot.endTime}</p>
                </div>
                {editable && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-slate-500 hover:text-red-400 hover:bg-slate-850 p-1.5 rounded-lg transition"
                    title="Remove slot"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
