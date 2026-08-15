import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Users, AlertTriangle, Calendar, Check, X, Ban, Activity,
  RefreshCw, Download, FileText, Star, Trash2, Megaphone, ShieldAlert,
  HeartHandshake, Layers, Cpu, Clock, History, Eye, Award, Sparkles, MessageSquare, AlertCircle
} from 'lucide-react';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const isSuperAdmin = currentAdmin?.adminRole === 'super_admin' || !currentAdmin?.adminRole;

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);

  const [pendingSkills, setPendingSkills] = useState([]);
  const [rejectingSkill, setRejectingSkill] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const [reports, setReports] = useState([]);
  const [actingReport, setActingReport] = useState(null);
  const [reportActionNotes, setReportActionNotes] = useState('');

  const [disputes, setDisputes] = useState([]);
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [disputeOutcome, setDisputeOutcome] = useState('no_action');
  const [disputeNotes, setDisputeNotes] = useState('');

  const [sessions, setSessions] = useState([]);
  const [cancellingSession, setCancellingSession] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewSearch, setReviewSearch] = useState('');

  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [reassignTargetCat, setReassignTargetCat] = useState('');

  const [healthData, setHealthData] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMsg, setNewAnnMsg] = useState('');
  const [newAnnType, setNewAnnType] = useState('info');

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditActionFilter, setAuditActionFilter] = useState('');

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Fetch functions
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/analytics'));
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
      const res = await axios.get(getApiUrl(`/api/admin/users?page=${userPage}&search=${encodeURIComponent(userSearch)}`));
      setUsers(res.data.data);
      setUserTotalPages(res.data.pages || 1);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSkills = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/pending-skills'));
      setPendingSkills(res.data.data);
    } catch (err) {
      setError('Failed to load pending skills.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/reports'));
      setReports(res.data.data);
    } catch (err) {
      setError('Failed to load abuse reports.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/disputes'));
      setDisputes(res.data.data);
    } catch (err) {
      setError('Failed to load session disputes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/sessions'));
      setSessions(res.data.data);
    } catch (err) {
      setError('Failed to load global sessions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl(`/api/admin/reviews?search=${encodeURIComponent(reviewSearch)}`));
      setReviews(res.data.data);
    } catch (err) {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/categories'));
      setCategories(res.data.data);
    } catch (err) {
      setError('Failed to load skill categories.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    if (!isSuperAdmin) return;
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/health'));
      setHealthData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load system health.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/admin/announcements'));
      setAnnouncements(res.data.data);
    } catch (err) {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl(`/api/admin/audit-logs?action=${encodeURIComponent(auditActionFilter)}`));
      setAuditLogs(res.data.data);
    } catch (err) {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'skills') fetchPendingSkills();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'disputes') fetchDisputes();
    if (activeTab === 'sessions') fetchSessions();
    if (activeTab === 'reviews') fetchReviews();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'health') fetchHealth();
    if (activeTab === 'announcements') fetchAnnouncements();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, userPage, userSearch, reviewSearch, auditActionFilter]);

  // Handlers
  const handleVerifySkill = async (userId, skillName, status, reason = '') => {
    try {
      await axios.put(getApiUrl(`/api/admin/users/${userId}/verify-skill`), {
        skillName,
        status,
        rejectionReason: reason,
      });
      showNotification(`Skill "${skillName}" set to ${status}.`);
      setRejectingSkill(null);
      setRejectionReasonInput('');
      fetchPendingSkills();
    } catch (err) {
      alert(err.response?.data?.error || 'Skill verification action failed');
    }
  };

  const handleToggleBlockUser = async (userId) => {
    try {
      const res = await axios.put(getApiUrl(`/api/admin/users/${userId}/block`));
      showNotification(res.data.message);
      fetchUsers();
    } catch (err) {
      alert('Failed to block/unblock user');
    }
  };

  const handleUpdateRole = async (userId, role, adminRole) => {
    try {
      const res = await axios.put(getApiUrl(`/api/admin/users/${userId}/role`), { role, adminRole });
      showNotification(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleViewUserActivity = async (userId) => {
    try {
      const res = await axios.get(getApiUrl(`/api/admin/users/${userId}/activity`));
      setSelectedUserActivity(res.data.data);
    } catch (err) {
      alert('Failed to fetch user activity summary');
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const res = await axios.put(getApiUrl(`/api/admin/reports/${reportId}/action`), {
        action,
        resolutionNotes: reportActionNotes,
      });
      showNotification(res.data.message);
      setActingReport(null);
      setReportActionNotes('');
      fetchReports();
    } catch (err) {
      alert('Failed to process report action');
    }
  };

  const handleResolveDispute = async (disputeId) => {
    try {
      const res = await axios.put(getApiUrl(`/api/admin/disputes/${disputeId}/resolve`), {
        outcome: disputeOutcome,
        adminNotes: disputeNotes,
      });
      showNotification(res.data.message);
      setResolvingDispute(null);
      setDisputeNotes('');
      fetchDisputes();
    } catch (err) {
      alert('Failed to resolve dispute');
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      const res = await axios.put(getApiUrl(`/api/admin/sessions/${sessionId}/cancel`), {
        reason: cancelReasonInput,
      });
      showNotification(res.data.message);
      setCancellingSession(null);
      setCancelReasonInput('');
      fetchSessions();
    } catch (err) {
      alert('Failed to cancel session');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await axios.delete(getApiUrl(`/api/admin/reviews/${reviewId}`));
      showNotification(res.data.message);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(getApiUrl('/api/admin/categories'), {
        name: newCatName,
        description: newCatDesc,
      });
      showNotification(res.data.message);
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const res = await axios.delete(getApiUrl(`/api/admin/categories/${categoryId}`), {
        data: { reassignToCategoryName: reassignTargetCat },
      });
      showNotification(res.data.message);
      setDeletingCategory(null);
      setReassignTargetCat('');
      fetchCategories();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.inUseCount) {
        setDeletingCategory({
          id: categoryId,
          inUseCount: err.response.data.inUseCount,
          errorMsg: err.response.data.error,
        });
      } else {
        alert(err.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(getApiUrl('/api/admin/announcements'), {
        title: newAnnTitle,
        message: newAnnMsg,
        type: newAnnType,
      });
      showNotification(res.data.message);
      setNewAnnTitle('');
      setNewAnnMsg('');
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to post announcement');
    }
  };

  const handleToggleAnnouncement = async (id) => {
    try {
      const res = await axios.put(getApiUrl(`/api/admin/announcements/${id}/toggle`));
      showNotification(res.data.message);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to toggle announcement');
    }
  };

  const handleExportCSV = (type) => {
    window.open(getApiUrl(`/api/admin/export/${type}`), '_blank');
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-100 font-serif">Admin Control Center</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSuperAdmin ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'}`}>
                {isSuperAdmin ? 'Super Admin' : 'Support Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive SkillSync platform administration, moderation & auditing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === 'analytics') fetchAnalytics();
              if (activeTab === 'users') fetchUsers();
              if (activeTab === 'skills') fetchPendingSkills();
              if (activeTab === 'reports') fetchReports();
              if (activeTab === 'disputes') fetchDisputes();
              if (activeTab === 'sessions') fetchSessions();
              if (activeTab === 'reviews') fetchReviews();
              if (activeTab === 'categories') fetchCategories();
              if (activeTab === 'health') fetchHealth();
              if (activeTab === 'announcements') fetchAnnouncements();
              if (activeTab === 'audit') fetchAuditLogs();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition duration-300"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl font-bold">
          {successMsg}
        </div>
      )}

      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-3">
        {[
          { id: 'analytics', label: 'Analytics & CSV', icon: Activity },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'skills', label: 'Verify Skills', icon: Award },
          { id: 'reports', label: 'Abuse Reports', icon: AlertTriangle },
          { id: 'disputes', label: 'Session Disputes', icon: HeartHandshake },
          { id: 'sessions', label: 'Global Sessions', icon: Calendar },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'categories', label: 'Skill Categories', icon: Layers, superOnly: true },
          { id: 'health', label: 'System Health', icon: Cpu, superOnly: true },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'audit', label: 'Audit Log', icon: History },
        ]
          .filter((t) => !t.superOnly || isSuperAdmin)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-300 ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/40 border border-slate-850 text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
      </div>

      {/* FEATURE 5 & 11: ANALYTICS & CSV EXPORT */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 justify-end">
            <button onClick={() => handleExportCSV('users')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300">
              <Download size={14} /> Export Users CSV
            </button>
            <button onClick={() => handleExportCSV('sessions')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300">
              <Download size={14} /> Export Sessions CSV
            </button>
            <button onClick={() => handleExportCSV('matches')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300">
              <Download size={14} /> Export Matches CSV
            </button>
            <button onClick={() => handleExportCSV('analytics')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">
              <Download size={14} /> Export Analytics Summary
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{analytics.totalUsers}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">{analytics.verifiedUsers} Verified Peers</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Matches Made</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{analytics.totalMatches}</h3>
              <p className="text-[11px] text-brand-400 mt-1">{analytics.acceptedMatches} Accepted Swaps</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Sessions</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{analytics.totalSessions}</h3>
              <p className="text-[11px] text-purple-400 mt-1">{analytics.completedSessions} Completed</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Moderation</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1">{analytics.pendingReports} Reports</h3>
              <p className="text-[11px] text-red-400 mt-1">{analytics.blockedUsers} Blocked Users</p>
            </div>
          </div>

          {/* User Growth Chart & Skill Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">User Growth Over Time</h4>
              <div className="flex items-end gap-3 h-40 pt-6">
                {(analytics.userGrowth || []).map((g, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-brand-400">{g.count}</span>
                    <div
                      className="w-full bg-brand-500/20 border border-brand-500/40 rounded-t-lg transition-all duration-500 hover:bg-brand-500/40"
                      style={{ height: `${Math.max(15, (g.count / Math.max(1, analytics.totalUsers)) * 100)}%` }}
                    ></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{g.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Popular Skills</h4>
              <div className="space-y-2">
                {(analytics.popularSkills || []).map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-850 bg-slate-950/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{s.skill}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {s.count} Teachers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 2: MANAGE USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full max-w-md"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
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
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {u.role}
                        </span>
                        {u.role === 'admin' && (
                          <span className="text-[9px] text-slate-500 font-bold">({u.adminRole || 'super_admin'})</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handleViewUserActivity(u._id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 font-semibold"
                      >
                        <Eye size={12} /> Activity
                      </button>
                      <button
                        onClick={() => handleToggleBlockUser(u._id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                          u.isBlocked
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        <Ban size={12} /> {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>

                      {isSuperAdmin && (
                        <select
                          value={u.role === 'admin' ? u.adminRole || 'super_admin' : 'user'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'user') handleUpdateRole(u._id, 'user', 'support_admin');
                            else handleUpdateRole(u._id, 'admin', val);
                          }}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                        >
                          <option value="user">Regular User</option>
                          <option value="support_admin">Support Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Activity Modal */}
          {selectedUserActivity && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-slate-100">User Profile & Activity Summary</h3>
                  <button onClick={() => setSelectedUserActivity(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="space-y-2 text-xs">
                  <p><strong>Name:</strong> {selectedUserActivity.user.name}</p>
                  <p><strong>Email:</strong> {selectedUserActivity.user.email}</p>
                  <p><strong>Status:</strong> {selectedUserActivity.user.isBlocked ? 'Blocked' : 'Active'}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-slate-500">Total Matches</p>
                      <p className="text-lg font-bold">{selectedUserActivity.activity.matchesCount}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-slate-500">Total Sessions</p>
                      <p className="text-lg font-bold">{selectedUserActivity.activity.sessionsCount}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-slate-500">Avg Rating Received</p>
                      <p className="text-lg font-bold text-amber-400">{selectedUserActivity.activity.avgRating} ★</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-slate-500">Abuse Reports Against</p>
                      <p className="text-lg font-bold text-red-400">{selectedUserActivity.activity.reportsAgainstUser.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 1: VERIFY SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {pendingSkills.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
              No pending skill verification submissions in queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSkills.map((ps, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{ps.skillName}</h4>
                      <p className="text-xs text-slate-400">{ps.userName} ({ps.userEmail}) • {ps.experienceLevel}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                  </div>

                  {ps.proofLink && (
                    <a href={ps.proofLink} target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline block truncate">
                      View Credential Proof Document ↗
                    </a>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                    <button
                      onClick={() => handleVerifySkill(ps.userId, ps.skillName, 'approved')}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setRejectingSkill(ps)}
                      className="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Reason Modal */}
          {rejectingSkill && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Reject Skill Verification</h3>
                <p className="text-xs text-slate-400">Provide an optional reason to display to {rejectingSkill.userName} for skill "{rejectingSkill.skillName}".</p>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Credential proof link is invalid or expired."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setRejectingSkill(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Cancel</button>
                  <button
                    onClick={() => handleVerifySkill(rejectingSkill.userId, rejectingSkill.skillName, 'rejected', rejectionReasonInput)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-xs font-bold text-white"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 3: ABUSE REPORTS */}
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
                  <button onClick={() => setActingReport(r)} className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">
                    Take Action
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Action Dialog */}
          {actingReport && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Take Action on Abuse Report</h3>
                <textarea
                  rows={2}
                  value={reportActionNotes}
                  onChange={(e) => setReportActionNotes(e.target.value)}
                  placeholder="Resolution notes / warning message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleReportAction(actingReport._id, 'warn')} className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                    Issue Formal Warning
                  </button>
                  <button onClick={() => handleReportAction(actingReport._id, 'block')} className="w-full py-2 rounded-xl bg-red-600 text-white text-xs font-bold">
                    Block Reported User
                  </button>
                  <button onClick={() => handleReportAction(actingReport._id, 'dismiss')} className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                    Dismiss Report
                  </button>
                  <button onClick={() => setActingReport(null)} className="w-full py-1 text-xs text-slate-500">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 6: SESSION DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
              No session disputes flagged.
            </div>
          ) : (
            disputes.map((d) => (
              <div key={d._id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Dispute: {d.reason}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Initiator: {d.initiatorId?.name} ({d.initiatorId?.email}) ↔ Respondent: {d.respondentId?.name} ({d.respondentId?.email})
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {d.status} ({d.outcome})
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-300">
                  <strong>Initiator Comment:</strong> {d.initiatorComment || d.details || 'No details.'}
                </div>

                {d.status === 'pending' && (
                  <button onClick={() => setResolvingDispute(d)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">
                    Resolve Dispute Outcome
                  </button>
                )}
              </div>
            ))
          )}

          {/* Resolve Dispute Modal */}
          {resolvingDispute && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Resolve Session Dispute</h3>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution Outcome</label>
                  <select
                    value={disputeOutcome}
                    onChange={(e) => setDisputeOutcome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 mt-1"
                  >
                    <option value="no_action">No Action (Dismiss Dispute)</option>
                    <option value="warn_initiator">Warn Initiator</option>
                    <option value="warn_respondent">Warn Respondent</option>
                    <option value="warn_both">Warn Both Participants</option>
                    <option value="void_session">Void Session (Cancel & Exclude from Badges)</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Admin resolution notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setResolvingDispute(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300">Cancel</button>
                  <button onClick={() => handleResolveDispute(resolvingDispute._id)} className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">
                    Submit Resolution
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 4: GLOBAL SESSIONS */}
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
              {s.status !== 'cancelled' && (
                <button onClick={() => setCancellingSession(s)} className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                  Cancel Session
                </button>
              )}
            </div>
          ))}

          {/* Cancel Modal */}
          {cancellingSession && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Cancel Session</h3>
                <textarea
                  rows={2}
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="Cancellation reason to send participants..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setCancellingSession(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300">Close</button>
                  <button onClick={() => handleCancelSession(cancellingSession._id)} className="px-3 py-1.5 rounded-xl bg-red-600 text-xs font-bold text-white">Confirm Cancellation</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 7: MANAGE REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search reviews by user or text..."
            value={reviewSearch}
            onChange={(e) => setReviewSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none max-w-md"
          />
          {reviews.map((r) => (
            <div key={r._id} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">{r.rating} ★</span>
                  <span className="text-xs text-slate-300">{r.reviewerId?.name} → {r.revieweeId?.name}</span>
                </div>
                <p className="text-xs text-slate-400">{r.comment || 'No comment.'}</p>
              </div>
              <button onClick={() => handleDeleteReview(r._id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FEATURE 8: SKILL CATEGORIES */}
      {activeTab === 'categories' && isSuperAdmin && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCategory} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4 max-w-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Add Master Skill Category</h4>
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Technology, Languages)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">Create Category</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c._id} className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-slate-100">{c.name}</h5>
                  <p className="text-[11px] text-slate-500">{c.description || 'No description'}</p>
                </div>
                <button onClick={() => handleDeleteCategory(c._id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Reassignment Modal */}
          {deletingCategory && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Category In Use Protection</h3>
                <p className="text-xs text-red-400">{deletingCategory.errorMsg}</p>
                <div>
                  <label className="text-xs font-bold text-slate-400">Reassign Skills To Category:</label>
                  <input
                    type="text"
                    placeholder="Existing category name to reassign to..."
                    value={reassignTargetCat}
                    onChange={(e) => setReassignTargetCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDeletingCategory(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300">Cancel</button>
                  <button onClick={() => handleDeleteCategory(deletingCategory.id)} className="px-3 py-1.5 rounded-xl bg-red-600 text-xs font-bold text-white">Reassign & Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 9: SYSTEM HEALTH */}
      {activeTab === 'health' && isSuperAdmin && healthData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Backend Status</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{healthData.backendStatus}</h3>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Database Status</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{healthData.dbStatus}</h3>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Active Sessions</p>
              <h3 className="text-2xl font-black text-brand-400 mt-1">{healthData.activeSessionsCount}</h3>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-500 font-semibold">Server Uptime</p>
              <h3 className="text-2xl font-black text-purple-400 mt-1">{healthData.uptimeSeconds}s</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Server Log Summary</h4>
            {(healthData.recentErrors || []).length === 0 ? (
              <p className="text-xs text-slate-500">No runtime error logs recorded.</p>
            ) : (
              (healthData.recentErrors || []).map((err, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[11px] text-red-400">
                  [{new Date(err.timestamp).toLocaleTimeString()}] {err.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FEATURE 12: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateAnnouncement} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3 max-w-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Compose Platform Announcement</h4>
            <input
              type="text"
              required
              placeholder="Announcement Title"
              value={newAnnTitle}
              onChange={(e) => setNewAnnTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
            />
            <textarea
              rows={2}
              required
              placeholder="Announcement Body / Maintenance Message"
              value={newAnnMsg}
              onChange={(e) => setNewAnnMsg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
            />
            <select
              value={newAnnType}
              onChange={(e) => setNewAnnType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
            >
              <option value="info">Info Notice</option>
              <option value="warning">Warning Notice</option>
              <option value="maintenance">Maintenance Notice</option>
            </select>
            <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">Post Announcement</button>
          </form>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{a.title}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{a.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{a.message}</p>
                </div>
                <button
                  onClick={() => handleToggleAnnouncement(a._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${a.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
                >
                  {a.isActive ? 'Active' : 'Expired'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE 13: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Filter audit logs by action..."
            value={auditActionFilter}
            onChange={(e) => setAuditActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 max-w-md"
          />
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-4">Admin Email</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-slate-100">{log.adminEmail}</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase">{log.action}</span></td>
                    <td className="p-4 text-slate-400">{log.targetType}</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{log.targetId}</td>
                    <td className="p-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
