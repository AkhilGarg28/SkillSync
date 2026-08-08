import React, { useState } from 'react';

export default function MatchRequestModal({ candidate, matchedSkills, onClose, onSubmit, isSubmitting }) {
  const [message, setMessage] = useState('');

  if (!candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      toUserId: candidate._id || candidate.id,
      matchedSkills,
      message,
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>🤝 Request Skill Swap</h3>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        <p style={styles.subtext}>
          You are proposing a peer-to-peer skill swap with <strong>{candidate.name}</strong> ({candidate.city || 'Remote'}, {candidate.timezone || 'UTC'}).
        </p>

        <div style={styles.skillsBox}>
          <h4 style={styles.sectionTitle}>Skills to Swap:</h4>
          {matchedSkills.length === 0 ? (
            <span style={styles.noSkills}>General Skill Swap Request</span>
          ) : (
            matchedSkills.map((s, idx) => (
              <div key={idx} style={styles.skillItem}>
                <span style={styles.skillName}>{s.skillName}</span>
                <span style={s.direction === 'iTeach' ? styles.badgeTeach : styles.badgeLearn}>
                  {s.direction === 'iTeach' ? 'You Teach' : 'They Teach'}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Introductory Message (Optional):</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to swap skills with you..."
              maxLength={300}
              rows={3}
              style={styles.textarea}
            />
            <span style={styles.charCount}>{message.length}/300</span>
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Sending Request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#1e1e2e',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    color: '#cdd6f4',
    border: '1px solid #313244',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: { margin: 0, color: '#89b4fa', fontSize: '20px' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#a6adc8',
    fontSize: '24px',
    cursor: 'pointer',
  },
  subtext: { fontSize: '14px', color: '#bac2de', marginBottom: '16px', lineHeight: '1.4' },
  skillsBox: {
    backgroundColor: '#181825',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '20px',
    border: '1px solid #313244',
  },
  sectionTitle: { margin: '0 0 10px 0', fontSize: '13px', color: '#a6adc8', textTransform: 'uppercase' },
  skillItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px dashed #313244',
  },
  skillName: { fontSize: '14px', fontWeight: '500' },
  badgeTeach: {
    backgroundColor: '#a6e3a1',
    color: '#11111b',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  badgeLearn: {
    backgroundColor: '#89b4fa',
    color: '#11111b',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  noSkills: { fontSize: '13px', color: '#6c7086' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' },
  label: { fontSize: '13px', fontWeight: '600', color: '#bac2de' },
  textarea: {
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#313244',
    color: '#cdd6f4',
    border: '1px solid #45475a',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
  },
  charCount: { fontSize: '11px', color: '#6c7086', alignSelf: 'flex-end', marginTop: '2px' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #45475a',
    backgroundColor: '#313244',
    color: '#cdd6f4',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#a6e3a1',
    color: '#11111b',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
