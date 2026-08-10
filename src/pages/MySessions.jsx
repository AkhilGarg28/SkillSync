import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, Plus, Check, X, Link as LinkIcon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const MySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [zoomInputs, setZoomInputs] = useState({});
  const [editingZoomId, setEditingZoomId] = useState(null);

  const fetchSessionsAndMatches = async () => {
    try {
      setLoading(true);
      const [sessionsRes, matchesRes] = await Promise.all([
        axios.get(getApiUrl('/api/sessions/my-sessions')),
        axios.get(getApiUrl('/api/matches/mine')),
      ]);

      setSessions(sessionsRes.data.data || []);
      const accepted = matchesRes.data.data?.accepted || [];
      setAcceptedMatches(accepted);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsAndMatches();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatch || !proposedTime) {
      alert('Please select a matched user and date/time.');
      return;
    }

    try {
      const matchDoc = acceptedMatches.find((m) => m._id === selectedMatch);
      const user2Id =
        String(matchDoc.user1Id?._id || matchDoc.user1Id) === String(user.id)
          ? matchDoc.user2Id?._id || matchDoc.user2Id
          : matchDoc.user1Id?._id || matchDoc.user1Id;

      await axios.post(getApiUrl('/api/sessions/propose'), {
        matchId: selectedMatch,
        user1Id: user.id,
        user2Id,
        proposedTime,
      });

      setShowScheduleModal(false);
      setSelectedMatch('');
      setProposedTime('');
      fetchSessionsAndMatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to schedule session');
    }
  };

  const handleRespondSession = async (sessionId, action) => {
    try {
      await axios.put(getApiUrl(`/api/sessions/${sessionId}/respond`), { action });
      fetchSessionsAndMatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const handleSaveZoomUrl = async (sessionId) => {
    const zoomUrl = zoomInputs[sessionId];
    if (!zoomUrl) return;

    try {
      await axios.put(getApiUrl(`/api/sessions/${sessionId}/zoom-link`), { zoomUrl });
      setEditingZoomId(null);
      fetchSessionsAndMatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save Zoom URL');
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Calendar size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100 font-serif">My Learning Sessions</h2>
            <p className="text-xs text-slate-400">Schedule, manage, and join video meetings with your matched peers</p>
          </div>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10"
        >
          <Plus size={16} />
          Schedule Session
        </button>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Schedule New Session</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Select Accepted Matched Peer</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose a matched peer --</option>
                  {acceptedMatches.map((m) => {
                    const peer =
                      String(m.user1Id?._id || m.user1Id) === String(user?.id)
                        ? m.user2Id
                        : m.user1Id;
                    return (
                      <option key={m._id} value={m._id}>
                        {peer?.name || 'Matched User'} ({peer?.email})
                      </option>
                    );
                  })}
                </select>
                {acceptedMatches.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">You must have an accepted match before scheduling a session.</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Date & Time</label>
                <input
                  type="datetime-local"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-bold hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={acceptedMatches.length === 0}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-slate-100 text-xs font-bold"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 && !loading && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-slate-400">
            <Calendar size={36} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold">No scheduled sessions found.</p>
            <p className="text-xs text-slate-500 mt-1">Schedule a session with an accepted peer to get started.</p>
          </div>
        )}

        {sessions.map((s) => {
          const peer =
            String(s.user1Id?._id || s.user1Id) === String(user?.id)
              ? s.user2Id
              : s.user1Id;
          const isReceiver = String(s.user2Id?._id || s.user2Id) === String(user?.id);

          return (
            <div key={s._id} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    {peer?.profilePhoto ? (
                      <img src={peer.profilePhoto} alt={peer.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      peer?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{peer?.name || 'Matched Peer'}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock size={12} />
                      <span>{new Date(s.proposedTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      s.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : s.status === 'requested'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.status}
                  </span>

                  {s.status === 'requested' && isReceiver && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespondSession(s._id, 'accept')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleRespondSession(s._id, 'decline')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Zoom URL & Meeting Links */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={s.zoomUrl || s.videoCallLink || `/meeting/room-${s._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-blue-600/20"
                  >
                    <Video size={16} />
                    {s.zoomUrl ? '📹 Join Zoom Meeting' : '📹 Join Video Meeting (SkillSync Room)'}
                  </a>

                  {editingZoomId === s._id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="Paste Zoom / Google Meet URL"
                        value={zoomInputs[s._id] || ''}
                        onChange={(e) => setZoomInputs({ ...zoomInputs, [s._id]: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 w-64"
                      />
                      <button
                        onClick={() => handleSaveZoomUrl(s._id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingZoomId(s._id)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-400 transition cursor-pointer"
                    >
                      <LinkIcon size={12} />
                      {s.zoomUrl ? 'Edit Custom Link' : 'Paste Zoom / Meet Link'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MySessions;
