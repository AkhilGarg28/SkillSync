import React, { useState } from 'react';

export default function MyMatchesTracker({
  groupedMatches = { pending: [], accepted: [], completed: [], declined: [] },
  currentUserId,
  onRespond,
  isLoading
}) {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { id: 'pending', label: 'Pending Requests', count: groupedMatches.pending?.length || 0 },
    { id: 'accepted', label: 'Accepted Matches', count: groupedMatches.accepted?.length || 0 },
    { id: 'completed', label: 'Completed', count: groupedMatches.completed?.length || 0 },
    { id: 'declined', label: 'Declined', count: groupedMatches.declined?.length || 0 },
  ];

  const currentList = groupedMatches[activeTab] || [];

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📌 Match Status Tracker</h2>

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

      {isLoading ? (
        <div style={styles.loadingBox}>Loading match status tracker...</div>
      ) : currentList.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No matches found in <strong>{activeTab}</strong> state.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {currentList.map((item) => {
            const fromUser = item.fromUser || {};
            const toUser = item.toUser || {};
            const isIncoming = String(toUser._id || toUser.id || toUser) === String(currentUserId);
            const otherUser = isIncoming ? fromUser : toUser;

            return (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.userName}>{otherUser.name || 'User'}</h4>
                    <span style={styles.userLocation}>
                      📍 {otherUser.city || 'Remote'} ({otherUser.timezone || 'UTC'})
                    </span>
                  </div>
                  <span style={isIncoming ? styles.incomingBadge : styles.outgoingBadge}>
                    {isIncoming ? '📥 Incoming' : '📤 Sent'}
                  </span>
                </div>

                {item.message && (
                  <div style={styles.messageBox}>
                    <em>"{item.message}"</em>
                  </div>
                )}

                <div style={styles.matchedSkillsContainer}>
                  <strong style={styles.skillsLabel}>Swapping Skills:</strong>
                  {(item.matchedSkills || []).map((s, idx) => (
                    <span key={idx} style={styles.skillPill}>
                      {s.skillName} ({s.direction === 'iTeach' ? 'You Teach' : 'They Teach'})
                    </span>
                  ))}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.statusBadge}>Status: {item.status}</span>
                  {activeTab === 'pending' && isIncoming && (
                    <div style={styles.actions}>
                      <button
                        onClick={() => onRespond(item._id, 'decline')}
                        style={styles.declineBtn}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onRespond(item._id, 'accept')}
                        style={styles.acceptBtn}
                      >
                        Accept Match
                      </button>
                    </div>
                  )}
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
  userName: { margin: 0, fontSize: '16px', color: '#cdd6f4' },
  userLocation: { fontSize: '12px', color: '#a6adc8' },
  incomingBadge: { backgroundColor: '#fab387', color: '#11111b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  outgoingBadge: { backgroundColor: '#b4befe', color: '#11111b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  messageBox: { backgroundColor: '#181825', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#bac2de' },
  matchedSkillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' },
  skillsLabel: { fontSize: '13px', color: '#a6adc8' },
  skillPill: { backgroundColor: '#313244', color: '#a6e3a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
  statusBadge: { fontSize: '13px', color: '#fab387', textTransform: 'capitalize' },
  actions: { display: 'flex', gap: '10px' },
  declineBtn: { padding: '8px 14px', borderRadius: '6px', border: '1px solid #f38ba8', backgroundColor: 'transparent', color: '#f38ba8', cursor: 'pointer' },
  acceptBtn: { padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#a6e3a1', color: '#11111b', fontWeight: 'bold', cursor: 'pointer' },
};
