import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MyMatchesTracker({
  groupedMatches = { pending: [], sent: [], accepted: [], completed: [], declined: [] },
  currentUserId,
  onRespond,
  isLoading: parentLoading
}) {
  const { user } = useAuth();
  const activeUserId = currentUserId || user?.id;

  const [activeTab, setActiveTab] = useState('pending');
  const [localMatches, setLocalMatches] = useState(groupedMatches);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('skillsync_token') || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch('/api/matches/mine', { headers });
      const data = await res.json();
      if (data.success) {
        setLocalMatches(data.data || { pending: [], sent: [], accepted: [], completed: [], declined: [] });
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeUserId]);

  const handleAction = async (requestId, action) => {
    if (onRespond) {
      await onRespond(requestId, action);
      fetchMatches();
    } else {
      try {
        const token = localStorage.getItem('skillsync_token') || localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const endpoint = `/api/matches/${requestId}/${action}`;
        await fetch(endpoint, {
          method: 'PATCH',
          headers,
        });
        fetchMatches();
      } catch (err) {
        console.error('Failed to update match status:', err);
      }
    }
  };

  const currentGrouped = (localMatches.pending?.length || localMatches.sent?.length || localMatches.accepted?.length || localMatches.declined?.length)
    ? localMatches
    : groupedMatches;

  const tabs = [
    { id: 'pending', label: 'Pending Requests', count: currentGrouped.pending?.length || 0 },
    { id: 'sent', label: 'Sent Requests', count: currentGrouped.sent?.length || 0 },
    { id: 'accepted', label: 'Accepted Matches', count: currentGrouped.accepted?.length || 0 },
    { id: 'completed', label: 'Completed', count: currentGrouped.completed?.length || 0 },
    { id: 'declined', label: 'Declined', count: currentGrouped.declined?.length || 0 },
  ];

  const currentList = currentGrouped[activeTab] || [];
  const showLoading = loading || parentLoading;

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || 'pending').toLowerCase();
    if (s === 'accepted') {
      return <span style={styles.badgeAccepted}>🟢 ACCEPTED</span>;
    }
    if (s === 'declined' || s === 'rejected') {
      return <span style={styles.badgeDeclined}>🔴 DECLINED</span>;
    }
    if (s === 'completed') {
      return <span style={styles.badgeAccepted}>🔵 COMPLETED</span>;
    }
    return <span style={styles.badgePending}>🟡 PENDING</span>;
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={styles.heading}>📌 Match Status Tracker</h2>
        <button onClick={fetchMatches} style={styles.refreshBtn}>
          🔄 Refresh Status
        </button>
      </div>

      <div style={styles.tabContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? styles.activeTabBtn : {}),
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {showLoading && currentList.length === 0 ? (
        <div style={styles.loadingBox}>Loading match status tracker...</div>
      ) : currentList.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No match requests found in <strong>{activeTab}</strong> section.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {currentList.map((item) => {
            const sender = item.sender || item.user1Id || item.user1 || {};
            const receiver = item.receiver || item.user2Id || item.user2 || {};
            const senderIdStr = String(sender._id || sender.id || sender);
            const receiverIdStr = String(receiver._id || receiver.id || receiver);
            
            const isSentTab = activeTab === 'sent' || (senderIdStr === String(activeUserId) && activeTab !== 'pending');
            const isIncoming = !isSentTab && receiverIdStr === String(activeUserId);
            
            const otherUser = isSentTab ? receiver : (isIncoming ? sender : (senderIdStr === String(activeUserId) ? receiver : sender));
            const otherUserId = otherUser._id || otherUser.id;

            const requestedSkill = item.skillRequested || item.requestedSkill || otherUser.skillsToTeach?.[0]?.skillName || 'Skill';
            const offeredSkill = item.skillOffered || item.offeredSkill || 'Skill';
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recently';

            return (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.avatar}>
                      {otherUser.profilePhoto ? (
                        <img src={otherUser.profilePhoto} alt={otherUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        (otherUser.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      {isSentTab ? (
                        <h4 style={styles.userName}>
                          Request sent to: <span style={{ color: '#89b4fa' }}>{otherUser.name || 'Recipient'}</span>
                        </h4>
                      ) : (
                        <h4 style={styles.userName}>
                          Request from: <span style={{ color: '#a6e3a1' }}>{otherUser.name || 'Peer User'}</span>
                        </h4>
                      )}
                      <span style={styles.userLocation}>
                        📍 {otherUser.city || 'Remote'} ({otherUser.timezone || 'UTC'})
                      </span>
                    </div>
                  </div>

                  <span style={isSentTab ? styles.outgoingBadge : (isIncoming ? styles.incomingBadge : styles.statusPill)}>
                    {isSentTab ? '📤 Sent Request' : (isIncoming ? '📥 Incoming Request' : '🤝 Match')}
                  </span>
                </div>

                <div style={styles.skillsExchangeBox}>
                  <div style={styles.skillRow}>
                    <span style={styles.skillLabel}>Skill Requested:</span>
                    <span style={styles.skillValueLearn}>{requestedSkill}</span>
                  </div>
                  <div style={styles.skillRow}>
                    <span style={styles.skillLabel}>Skill Offered:</span>
                    <span style={styles.skillValueTeach}>{offeredSkill}</span>
                  </div>
                </div>

                {item.message && (
                  <div style={styles.messageBox}>
                    <em>"{item.message}"</em>
                  </div>
                )}

                <div style={styles.cardFooter}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(item.status)}
                    <span style={styles.dateText}>Sent: {formattedDate}</span>
                  </div>

                  <div style={styles.actions}>
                    {otherUserId && (
                      <a
                        href={`/profile/${otherUserId}`}
                        style={styles.viewBtn}
                      >
                        👤 View Profile
                      </a>
                    )}
                    {item.status === 'accepted' && (
                      <>
                        <a
                          href="/sessions"
                          style={styles.scheduleSessionBtn}
                        >
                          📹 Schedule Zoom Session
                        </a>
                        <button
                          onClick={() => handleAction(item._id, 'complete')}
                          style={styles.completeBtn}
                        >
                          ✔ Mark Complete
                        </button>
                      </>
                    )}
                    {activeTab === 'pending' && isIncoming && (
                      <>
                        <button
                          onClick={() => handleAction(item._id, 'decline')}
                          style={styles.declineBtn}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAction(item._id, 'accept')}
                          style={styles.acceptBtn}
                        >
                          Accept Match
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { marginTop: '24px' },
  heading: { color: '#89b4fa', fontSize: '22px', marginBottom: '16px' },
  refreshBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #313244', backgroundColor: '#181825', color: '#cdd6f4', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  tabContainer: { display: 'flex', gap: '10px', borderBottom: '2px solid #313244', marginBottom: '20px' },
  tabBtn: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: '#a6adc8',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '-2px',
  },
  activeTabBtn: {
    color: '#89b4fa',
    borderBottom: '3px solid #89b4fa',
  },
  loadingBox: { padding: '30px', textAlign: 'center', color: '#a6adc8' },
  emptyState: {
    backgroundColor: '#181825',
    padding: '40px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px dashed #313244',
  },
  emptyText: { color: '#bac2de', fontSize: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: {
    backgroundColor: '#1e1e2e',
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid #313244',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#89b4fa', color: '#11111b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' },
  userName: { margin: 0, fontSize: '16px', color: '#cdd6f4' },
  userLocation: { fontSize: '12px', color: '#a6adc8' },
  incomingBadge: { backgroundColor: '#fab387', color: '#11111b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  outgoingBadge: { backgroundColor: '#b4befe', color: '#11111b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  statusPill: { backgroundColor: '#a6e3a1', color: '#11111b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  skillsExchangeBox: { backgroundColor: '#181825', padding: '12px', borderRadius: '10px', border: '1px solid #313244', display: 'flex', flexDirection: 'column', gap: '6px' },
  skillRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
  skillLabel: { color: '#a6adc8', fontWeight: '500' },
  skillValueLearn: { color: '#89b4fa', fontWeight: 'bold', backgroundColor: '#89b4fa15', padding: '2px 8px', borderRadius: '6px' },
  skillValueTeach: { color: '#a6e3a1', fontWeight: 'bold', backgroundColor: '#a6e3a115', padding: '2px 8px', borderRadius: '6px' },
  messageBox: { backgroundColor: '#181825', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#bac2de' },
  matchedSkillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' },
  skillsLabel: { fontSize: '13px', color: '#a6adc8' },
  skillPill: { backgroundColor: '#313244', color: '#a6e3a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
  badgePending: { backgroundColor: '#f9e2af20', border: '1px solid #f9e2af', color: '#f9e2af', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeAccepted: { backgroundColor: '#a6e3a120', border: '1px solid #a6e3a1', color: '#a6e3a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeDeclined: { backgroundColor: '#f38ba820', border: '1px solid #f38ba8', color: '#f38ba8', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  dateText: { fontSize: '12px', color: '#6c7086' },
  actions: { display: 'flex', gap: '10px' },
  viewBtn: { textDecoration: 'none', padding: '8px 14px', borderRadius: '6px', border: '1px solid #313244', backgroundColor: '#181825', color: '#cdd6f4', fontSize: '12px', fontWeight: 'bold' },
  scheduleSessionBtn: { textDecoration: 'none', padding: '8px 14px', borderRadius: '6px', backgroundColor: '#89b4fa', color: '#11111b', fontSize: '12px', fontWeight: 'bold' },
  completeBtn: { padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#fab387', color: '#11111b', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  declineBtn: { padding: '8px 14px', borderRadius: '6px', border: '1px solid #f38ba8', backgroundColor: 'transparent', color: '#f38ba8', cursor: 'pointer', fontSize: '12px' },
  acceptBtn: { padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#a6e3a1', color: '#11111b', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
};
