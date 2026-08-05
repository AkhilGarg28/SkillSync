import React, { useState, useMemo } from 'react';

function computeOverlappingSlots(u1Availability, u2Availability) {
  if (!u1Availability?.weeklySlots || !u2Availability?.weeklySlots) {
    return [];
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const overlaps = [];

  days.forEach((day) => {
    const u1Slots = u1Availability.weeklySlots.filter(
      (s) => s.dayOfWeek && s.dayOfWeek.toLowerCase() === day.toLowerCase()
    );
    const u2Slots = u2Availability.weeklySlots.filter(
      (s) => s.dayOfWeek && s.dayOfWeek.toLowerCase() === day.toLowerCase()
    );

    u1Slots.forEach((s1) => {
      u2Slots.forEach((s2) => {
        const overlapStart = s1.startTime > s2.startTime ? s1.startTime : s2.startTime;
        const overlapEnd = s1.endTime < s2.endTime ? s1.endTime : s2.endTime;

        if (overlapStart < overlapEnd) {
          overlaps.push({
            dayOfWeek: day,
            startTime: overlapStart,
            endTime: overlapEnd,
          });
        }
      });
    });
  });

  return overlaps;
}

export default function AvailabilityPicker({
  user1Availability,
  user2Availability,
  onPropose,
  isSubmitting = false,
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const overlappingSlots = useMemo(
    () => computeOverlappingSlots(user1Availability, user2Availability),
    [user1Availability, user2Availability]
  );

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const chosenDay = days[dateObj.getUTCDay()];

    const isBlackout =
      user1Availability?.blackoutDates?.includes(selectedDate) ||
      user2Availability?.blackoutDates?.includes(selectedDate);

    if (isBlackout) {
      return [];
    }

    return overlappingSlots.filter(
      (slot) => slot.dayOfWeek.toLowerCase() === chosenDay.toLowerCase()
    );
  }, [selectedDate, overlappingSlots, user1Availability, user2Availability]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedDate) {
      setErrorMsg('Please select a session date.');
      return;
    }
    if (!selectedSlot) {
      setErrorMsg('Please select an available overlapping time slot.');
      return;
    }

    const proposedDateTimeStr = `${selectedDate}T${selectedSlot.startTime}:00.000Z`;

    if (onPropose) {
      onPropose({
        proposedTime: proposedDateTimeStr,
        slot: selectedSlot,
        date: selectedDate,
      });
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>📅 Mutual Availability & Session Scheduling</h3>
      <p style={styles.subtext}>
        Select a date to view overlapping free time slots where both you and your partner are available.
      </p>

      <div style={styles.overlapBadgeContainer}>
        <span style={styles.badgeLabel}>Mutual Free Days:</span>
        {overlappingSlots.length === 0 ? (
          <span style={styles.noOverlapText}>No overlapping weekly availability found</span>
        ) : (
          overlappingSlots.map((s, idx) => (
            <span key={idx} style={styles.badge}>
              {s.dayOfWeek}: {s.startTime} - {s.endTime}
            </span>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Choose Session Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
              setErrorMsg('');
            }}
            style={styles.input}
            required
          />
        </div>

        {selectedDate && (
          <div style={styles.field}>
            <label style={styles.label}>Available Overlapping Slots:</label>
            {slotsForSelectedDate.length === 0 ? (
              <div style={styles.warningBox}>
                ⚠️ No overlapping free slots available for selected date (or date falls on a blackout date).
              </div>
            ) : (
              <div style={styles.slotGrid}>
                {slotsForSelectedDate.map((slot, idx) => {
                  const isSelected =
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        ...styles.slotButton,
                        ...(isSelected ? styles.selectedSlotButton : {}),
                      }}
                    >
                      {slot.startTime} – {slot.endTime}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {errorMsg && <div style={styles.errorText}>❌ {errorMsg}</div>}

        <button
          type="submit"
          disabled={!selectedSlot || isSubmitting}
          style={{
            ...styles.submitButton,
            ...(!selectedSlot || isSubmitting ? styles.disabledButton : {}),
          }}
        >
          {isSubmitting ? 'Proposing Session...' : 'Propose Session Time'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: '#1e1e2e',
    color: '#cdd6f4',
    maxWidth: '560px',
    margin: '0 auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  heading: { marginTop: 0, marginBottom: '8px', fontSize: '20px', color: '#89b4fa' },
  subtext: { fontSize: '14px', color: '#a6adc8', marginBottom: '20px' },
  overlapBadgeContainer: { marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' },
  badgeLabel: { fontSize: '13px', fontWeight: '600', color: '#bac2de' },
  badge: { backgroundColor: '#313244', color: '#a6e3a1', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '500' },
  noOverlapText: { fontSize: '13px', color: '#f38ba8' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#cdd6f4' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #45475a', backgroundColor: '#313244', color: '#cdd6f4', fontSize: '14px', outline: 'none' },
  warningBox: { backgroundColor: '#45475a', color: '#f9e2af', padding: '12px', borderRadius: '8px', fontSize: '13px' },
  slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' },
  slotButton: { padding: '10px', borderRadius: '8px', border: '1px solid #45475a', backgroundColor: '#313244', color: '#cdd6f4', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' },
  selectedSlotButton: { backgroundColor: '#89b4fa', color: '#11111b', borderColor: '#89b4fa', fontWeight: 'bold' },
  errorText: { color: '#f38ba8', fontSize: '13px' },
  submitButton: { marginTop: '12px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#a6e3a1', color: '#11111b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  disabledButton: { backgroundColor: '#585b70', color: '#7f849c', cursor: 'not-allowed' },
};
