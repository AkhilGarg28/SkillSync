import React from 'react';

export default function ReminderBanner({ notifications = [], onMarkRead }) {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  const unreadReminders = notifications.filter((n) => !n.isRead);
  if (unreadReminders.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.bellIcon}>🔔</span>
        <h4 style={styles.headerTitle}>Upcoming Session Reminders</h4>
        <span style={styles.badge}>{unreadReminders.length} New</span>
      </div>

      <div style={styles.list}>
        {unreadReminders.map((notif, idx) => (
          <div key={notif._id || idx} style={styles.reminderCard}>
            <div style={styles.messageContent}>{notif.message}</div>
            <div style={styles.actionRow}>
              <span style={styles.timeLabel}>
                Sent: {new Date(notif.sentAt || notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {onMarkRead && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notif._id)}
                  style={styles.dismissButton}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#313244', border: '1px solid #89b4fa', borderRadius: '12px', padding: '16px', marginBottom: '20px', maxWidth: '680px', margin: '0 auto 20px auto', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  bellIcon: { fontSize: '20px' },
  headerTitle: { margin: 0, fontSize: '16px', color: '#89b4fa' },
  badge: { backgroundColor: '#f9e2af', color: '#11111b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  reminderCard: { backgroundColor: '#1e1e2e', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #a6e3a1' },
  messageContent: { color: '#cdd6f4', fontSize: '13px', lineHeight: '1.4', marginBottom: '8px' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: '11px', color: '#a6adc8' },
  dismissButton: { background: 'none', border: 'none', color: '#89b4fa', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' },
};
