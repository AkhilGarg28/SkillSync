import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Users, Award, AlertTriangle, Calendar, Check, X, Ban, Activity, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/analytics');
      setAnalytics(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/reports');
      setReports(res.data.data);
    } catch (err) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/sessions');
      setSessions(res.data.data);
    } catch (err) {
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab]);

  const handleToggleBlock = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/block`);
      fetchUsers();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleVerifyIdentity = async (userId, status) => {
    try {
      await axios.put(`/api/admin/users/${userId}/verify-identity`, { status });
      fetchUsers();
    } catch (err) {
      alert('Verification update failed');
    }
  };

  const handleVerifySkill = async (userId, skillName, status) => {
    try {
      await axios.put(`/api/admin/users/${userId}/verify-skill`, { skillName, status });
      fetchUsers();
    } catch (err) {
      alert('Skill verification failed');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await axios.put(`/api/admin/reports/${reportId}/resolve`, { status });
      fetchReports();
    } catch (err) {
      alert('Report resolution failed');
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Admin Panel Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100 font-serif">Admin Control Panel</h2>
            <p className="text-xs text-slate-400">Manage users, identity verifications, skill proofs, reports, and global analytics</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'analytics') fetchAnalytics();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'reports') fetchReports();
            if (activeTab === 'sessions') fetchSessions();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 hover:text-white transition duration-300"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-2">
        {[
          { id: 'analytics', label: 'Analytics & Overview', icon: Activity },
          { id: 'users', label: 'Users & Verifications', icon: Users },
          { id: 'reports', label: 'Reports & Moderation', icon: AlertTriangle },
          { id: 'sessions', label: 'Global Sessions', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-300 ${
              activeTab === tab.id
                ? 'bg-brand-600/10 border border-brand-500/30 text-brand-300'
                : 'bg-slate-900/30 border border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Total Users</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{analytics.totalUsers}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">{analytics.verifiedUsers} Verified Peers</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Total Matches</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{analytics.totalMatches}</h3>
              <p className="text-[11px] text-brand-400 mt-1">{analytics.acceptedMatches} Accepted Swaps</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Total Sessions</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{analytics.totalSessions}</h3>
              <p className="text-[11px] text-purple-400 mt-1">{analytics.completedSessions} Completed</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Pending Reports</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1">{analytics.pendingReports}</h3>
              <p className="text-[11px] text-red-400 mt-1">{analytics.blockedUsers} Blocked Users</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Top Popular Skills</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(analytics.popularSkills || []).map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{s.skill}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {s.count} Teachers
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Identity Status</th>
                <th className="p-4">Teach Skills Proofs</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/50">
                  <td className="p-4">
                    <div className="font-bold text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {u.verificationStatus || 'unverified'}
                      </span>
                      {u.verificationStatus === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleVerifyIdentity(u._id, 'approved')} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40">
                            <Check size={12} />
                          </button>
                          <button onClick={() => handleVerifyIdentity(u._id, 'rejected')} className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    {(u.skillsToTeach || []).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                        <span>{s.skillName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">{s.proofStatus || 'none'}</span>
                          {s.proofStatus === 'pending' && (
                            <>
                              <button onClick={() => handleVerifySkill(u._id, s.skillName, 'approved')} className="p-0.5 text-emerald-400"><Check size={12} /></button>
                              <button onClick={() => handleVerifySkill(u._id, s.skillName, 'rejected')} className="p-0.5 text-red-400"><X size={12} /></button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleBlock(u._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-300 ${
                        u.isBlocked
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      <Ban size={12} />
                      {u.isBlocked ? 'Unblock' : 'Block User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{r.reason}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-200">{r.details || 'No details provided.'}</p>
                <div className="text-xs text-slate-500">
                  Reporter: <span className="text-slate-300">{r.reporterId?.name}</span> ({r.reporterId?.email}) → Reported User: <span className="text-slate-300">{r.reportedUserId?.name}</span> ({r.reportedUserId?.email})
                </div>
              </div>
              {r.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleResolveReport(r._id, 'resolved')} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white">
                    Resolve
                  </button>
                  <button onClick={() => handleResolveReport(r._id, 'dismissed')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SESSIONS TAB */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s._id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{s.user1Id?.name} ↔ {s.user2Id?.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Proposed: {new Date(s.proposedTime).toLocaleString()}</p>
              </div>
              {s.videoCallLink && (
                <a href={s.videoCallLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-400 hover:underline">
                  Join Video Room
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
