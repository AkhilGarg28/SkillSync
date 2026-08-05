import React, { useState, useEffect } from 'react';

export default function SessionDetail({
  sessionData,
  initialNote,
  currentUserId,
  onSaveNotes,
  onAddMilestone,
  onToggleMilestone,
}) {
  const [notesText, setNotesText] = useState(initialNote?.notes || '');
  const [milestones, setMilestones] = useState(initialNote?.milestones || []);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setNotesText(initialNote.notes || '');
      setMilestones(initialNote.milestones || []);
    }
  }, [initialNote]);

  const { status, videoCallLink, confirmedTime, proposedTime } = sessionData || {};
  const displayTime = confirmedTime ? new Date(confirmedTime).toLocaleString() : proposedTime ? new Date(proposedTime).toLocaleString() : 'TBD';

  const handleSaveNotes = async () => {
    setIsSaving(true);
    if (onSaveNotes) {
      await onSaveNotes(notesText);
    }
    setIsSaving(false);
  };

  const handleAddMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;

    if (onAddMilestone) {
      const added = await onAddMilestone(newMilestoneText.trim());
      if (added) {
        setMilestones([...milestones, added]);
      }
    } else {
      setMilestones([
        ...milestones,
        { _id: Date.now().toString(), text: newMilestoneText.trim(), isDone: false },
      ]);
    }
    setNewMilestoneText('');
  };

  const handleToggleMilestoneClick = async (milestone) => {
    const newDoneState = !milestone.isDone;

    if (onToggleMilestone) {
      await onToggleMilestone(milestone._id, newDoneState);
    }

    setMilestones(
      milestones.map((m) => (m._id === milestone._id ? { ...m, isDone: newDoneState } : m))
    );
  };

  const copyVideoLink = () => {
    if (videoCallLink) {
      navigator.clipboard.writeText(videoCallLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>SkillSync Session Details</h2>
          <p style={styles.timeText}>⏰ Scheduled Time: <strong>{displayTime}</strong></p>
        </div>
        <div style={{ ...styles.statusBadge, ...styles[`status_${status || 'requested'}`] }}>
          {status ? status.toUpperCase() : 'REQUESTED'}
        </div>
      </div>

      <div style={styles.sectionCard}>
        <h3 style={styles.sectionHeader}>📹 Video Call Access</h3>
        {status === 'confirmed' && videoCallLink ? (
          <div style={styles.videoLinkBox}>
            <div style={styles.videoUrlText}>{videoCallLink}</div>
            <div style={styles.buttonGroup}>
              <a
                href={videoCallLink}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.joinButton}
              >
                🎥 Join Video Call
              </a>
              <button type="button" onClick={copyVideoLink} style={styles.copyButton}>
                {copied ? '✓ Copied' : '📋 Copy Link'}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.infoBanner}>
            ℹ️ Video call link will be generated automatically once the session is confirmed.
          </div>
        )}
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeaderRow}>
          <h3 style={styles.sectionHeader}>📝 Progress Notes</h3>
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={isSaving}
            style={styles.saveNotesButton}
          >
            {isSaving ? 'Saving...' : '💾 Save Notes'}
          </button>
        </div>
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder="Record session notes, topics covered, resources shared, or homework..."
          style={styles.textarea}
          rows={5}
        />
      </div>

      <div style={styles.sectionCard}>
        <h3 style={styles.sectionHeader}>🎯 Session Milestones & Tasks</h3>

        <div style={styles.milestoneList}>
          {milestones.length === 0 ? (
            <p style={styles.emptyText}>No milestones created yet. Add one below!</p>
          ) : (
            milestones.map((m, idx) => (
              <div
                key={m._id || idx}
                onClick={() => handleToggleMilestoneClick(m)}
                style={{
                  ...styles.milestoneItem,
                  ...(m.isDone ? styles.milestoneDone : {}),
                }}
              >
                <input
                  type="checkbox"
                  checked={m.isDone || false}
                  onChange={() => {}}
                  style={styles.checkbox}
                />
                <span
                  style={{
                    ...styles.milestoneText,
                    textDecoration: m.isDone ? 'line-through' : 'none',
                    color: m.isDone ? '#a6adc8' : '#cdd6f4',
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddMilestoneSubmit} style={styles.addMilestoneForm}>
          <input
            type="text"
            value={newMilestoneText}
            onChange={(e) => setNewMilestoneText(e.target.value)}
            placeholder="Add new milestone or target (e.g. Complete React tutorial)..."
            style={styles.milestoneInput}
          />
          <button type="submit" style={styles.addMilestoneButton}>
            ➕ Add Milestone
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '680px', margin: '0 auto', padding: '24px', backgroundColor: '#1e1e2e', color: '#cdd6f4', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #313244', paddingBottom: '16px' },
  title: { margin: 0, fontSize: '22px', color: '#89b4fa' },
  timeText: { margin: '6px 0 0 0', fontSize: '14px', color: '#bac2de' },
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  status_requested: { backgroundColor: '#f9e2af', color: '#11111b' },
  status_confirmed: { backgroundColor: '#a6e3a1', color: '#11111b' },
  status_completed: { backgroundColor: '#89b4fa', color: '#11111b' },
  status_cancelled: { backgroundColor: '#f38ba8', color: '#11111b' },
  sectionCard: { backgroundColor: '#313244', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  sectionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  sectionHeader: { margin: 0, fontSize: '16px', color: '#cdd6f4' },
  infoBanner: { backgroundColor: '#45475a', color: '#bac2de', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' },
  videoLinkBox: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' },
  videoUrlText: { fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#1e1e2e', padding: '10px 14px', borderRadius: '8px', color: '#a6e3a1', wordBreak: 'break-all' },
  buttonGroup: { display: 'flex', gap: '10px' },
  joinButton: { display: 'inline-block', padding: '10px 18px', backgroundColor: '#a6e3a1', color: '#11111b', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' },
  copyButton: { padding: '10px 16px', backgroundColor: '#45475a', color: '#cdd6f4', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #45475a', backgroundColor: '#1e1e2e', color: '#cdd6f4', fontSize: '14px', lineHeight: '1.5', resize: 'vertical', outline: 'none', marginTop: '8px' },
  saveNotesButton: { padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#89b4fa', color: '#11111b', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  milestoneList: { display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0 16px 0' },
  milestoneItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#1e1e2e', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  milestoneDone: { opacity: 0.7 },
  checkbox: { cursor: 'pointer', width: '16px', height: '16px' },
  milestoneText: { fontSize: '14px' },
  emptyText: { fontSize: '13px', color: '#a6adc8', fontStyle: 'italic' },
  addMilestoneForm: { display: 'flex', gap: '10px' },
  milestoneInput: { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #45475a', backgroundColor: '#1e1e2e', color: '#cdd6f4', fontSize: '13px', outline: 'none' },
  addMilestoneButton: { padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#cba6f7', color: '#11111b', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' },
};
