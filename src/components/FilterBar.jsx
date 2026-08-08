import React from 'react';

export default function FilterBar({ filters, onFilterChange, onReset }) {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.group}>
        <label style={styles.label}>Skill Category:</label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          style={styles.select}
        >
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Data Science">Data Science</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="Languages">Languages</option>
          <option value="Music">Music</option>
          <option value="Lifestyle">Lifestyle & Cooking</option>
        </select>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Timezone:</label>
        <select
          value={filters.timezone || ''}
          onChange={(e) => handleChange('timezone', e.target.value)}
          style={styles.select}
        >
          <option value="">All Timezones</option>
          <option value="EST">EST (Eastern)</option>
          <option value="CST">CST (Central)</option>
          <option value="PST">PST (Pacific)</option>
          <option value="GMT">GMT (London)</option>
          <option value="IST">IST (India)</option>
        </select>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Skill Level:</label>
        <select
          value={filters.minLevel || ''}
          onChange={(e) => handleChange('minLevel', e.target.value)}
          style={styles.select}
        >
          <option value="">Any Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <button onClick={onReset} style={styles.resetBtn}>
        Clear Filters
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'flex-end',
    backgroundColor: '#181825',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #313244',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1 1 180px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a6adc8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#313244',
    color: '#cdd6f4',
    border: '1px solid #45475a',
    fontSize: '14px',
    outline: 'none',
  },
  resetBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    backgroundColor: '#45475a',
    color: '#cdd6f4',
    border: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
};
