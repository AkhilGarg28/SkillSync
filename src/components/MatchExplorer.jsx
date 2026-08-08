import React, { useState, useEffect, useCallback } from 'react';
import FilterBar from './FilterBar';
import MatchRequestModal from './MatchRequestModal';
import MyMatchesTracker from './MyMatchesTracker';

export default function MatchExplorer({ currentUserId = '650000000000000000000001', apiBaseUrl = '/api/matches' }) {
  const [viewMode, setViewMode] = useState('explore'); // 'explore' | 'myMatches'
  const [matches, setMatches] = useState([]);
  const [groupedMatches, setGroupedMatches] = useState({ pending: [], accepted: [], completed: [], declined: [] });
  const [filters, setFilters] = useState({ category: '', timezone: '', minLevel: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedMatchedSkills, setSelectedMatchedSkills] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchExploreMatches = useCallback(async (pageNum = 1, append = false) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.category) query.append('category', filters.category);
      if (filters.timezone) query.append('timezone', filters.timezone);
      if (filters.minLevel) query.append('minLevel', filters.minLevel);
      query.append('page', pageNum);
      query.append('limit', 10);

      const res = await fetch(`${apiBaseUrl}/explore?${query.toString()}`, {
        headers: { 'X-User-Id': currentUserId, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setMatches(prev => (append ? [...prev, ...(data.data || [])] : data.data || []));
        setHasMore(Boolean(data.hasMore));
        setPage(pageNum);
      } else {
        showNotification(data.message || 'Failed to fetch matches', 'error');
      }
    } catch (err) {
      showNotification('Network connection error loading explore feed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, apiBaseUrl, currentUserId]);

  const fetchMyMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/mine`, {
        headers: { 'X-User-Id': currentUserId, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setGroupedMatches(data.data || { pending: [], accepted: [], completed: [], declined: [] });
      }
    } catch (err) {
      showNotification('Network connection error loading match tracker', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, currentUserId]);

  useEffect(() => {
    if (viewMode === 'explore') {
      fetchExploreMatches(1, false);
    } else {
      fetchMyMatches();
    }
  }, [viewMode, fetchExploreMatches, fetchMyMatches]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchExploreMatches(page + 1, true);
    }
  };

  const handleOpenRequestModal = (matchResult) => {
    setSelectedCandidate(matchResult.candidate);
    setSelectedMatchedSkills(matchResult.matchedSkills || []);
  };

  const handleSendRequest = async ({ toUserId, matchedSkills, message }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/request`, {
        method: 'POST',
        headers: { 'X-User-Id': currentUserId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, matchedSkills, message })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Match request sent to ${selectedCandidate.name}!`, 'success');
        setSelectedCandidate(null);
        fetchExploreMatches(1, false);
      } else {
        showNotification(data.message || 'Failed to send request', 'error');
      }
    } catch (err) {
      showNotification('Error sending match request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      const res = await fetch(`${apiBaseUrl}/${requestId}/respond`, {
        method: 'PUT',
        headers: { 'X-User-Id': currentUserId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Match request ${action}ed successfully!`, 'success');
        fetchMyMatches();
      } else {
        showNotification(data.message || 'Failed to respond to request', 'error');
      }
    } catch (err) {
      showNotification('Error responding to match request', 'error');
    }
  };

  return (
    <div style={styles.container}>
      {notification && (
        <div style={notification.type === 'error' ? styles.notifError : styles.notifSuccess}>
          {notification.msg}
        </div>
      )}

      <header style={styles.header}>
        <div>
          <h1 style={styles.appTitle}>⚡ SkillSync Explorer</h1>
          <p style={styles.tagline}>Peer-to-Peer Skill Swapping Feed (Module 2)</p>
        </div>
        <div style={styles.navTabs}>
          <button
            onClick={() => setViewMode('explore')}
            style={{ ...styles.navBtn, ...(viewMode === 'explore' ? styles.activeNavBtn : {}) }}
          >
            🔍 Explore Feed
          </button>
          <button
            onClick={() => setViewMode('myMatches')}
            style={{ ...styles.navBtn, ...(viewMode === 'myMatches' ? styles.activeNavBtn : {}) }}
          >
            📌 My Matches
          </button>
        </div>
      </header>

      {viewMode === 'explore' && (
        <>
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ category: '', timezone: '', minLevel: '' })}
          />

          {isLoading && matches.length === 0 ? (
            <div style={styles.loadingGrid}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={styles.skeletonCard}>Loading mutual fit candidates...</div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No Mutual Skill Fits Found</h3>
              <p style={styles.emptySub}>Try clearing or widening your skill category, timezone, or level filters.</p>
            </div>
          ) : (
            <>
              <div style={styles.cardGrid}>
                {matches.map((item) => {
                  const candidate = item.candidate || {};
                  return (
                    <div key={item.userId} style={styles.card}>
                      <div style={styles.cardTop}>
                        <div style={styles.avatar}>
                          {(candidate.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.candidateMeta}>
                          <h3 style={styles.candidateName}>{candidate.name}</h3>
                          <span style={styles.candidateLoc}>
                            📍 {candidate.city || 'Remote'} ({candidate.timezone || 'UTC'})
                          </span>
                        </div>
                        <div style={styles.scoreBadge} title="Match score based on mutual skill overlap and timezone alignment">
                          ★ {item.matchScore}
                        </div>
                      </div>

                      <div style={styles.skillsSection}>
                        <h4 style={styles.skillsHeading}>Matched Skills ({item.matchedSkills?.length || 0}):</h4>
                        <div style={styles.skillsList}>
                          {(item.matchedSkills || []).map((s, idx) => (
                            <span key={idx} style={styles.skillPill}>
                              {s.skillName}
                              <span style={s.direction === 'iTeach' ? styles.pillTagTeach : styles.pillTagLearn}>
                                {s.direction === 'iTeach' ? 'You Teach' : 'They Teach'}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenRequestModal(item)}
                        style={styles.requestBtn}
                      >
                        🤝 Request Swap
                      </button>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div style={styles.paginationContainer}>
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    style={styles.loadMoreBtn}
                  >
                    {isLoading ? 'Loading More...' : 'Load More Candidates'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {viewMode === 'myMatches' && (
        <MyMatchesTracker
          groupedMatches={groupedMatches}
          currentUserId={currentUserId}
          onRespond={handleRespondRequest}
          isLoading={isLoading}
        />
      )}

      {selectedCandidate && (
        <MatchRequestModal
          candidate={selectedCandidate}
          matchedSkills={selectedMatchedSkills}
          onClose={() => setSelectedCandidate(null)}
          onSubmit={handleSendRequest}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 16px',
    color: '#cdd6f4',
    minHeight: '100vh',
    backgroundColor: '#11111b',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  appTitle: { margin: 0, color: '#89b4fa', fontSize: '26px' },
  tagline: { margin: '4px 0 0 0', fontSize: '13px', color: '#a6adc8' },
  navTabs: { display: 'flex', gap: '10px' },
  navBtn: { padding: '10px 18px', borderRadius: '8px', border: '1px solid #313244', backgroundColor: '#181825', color: '#a6adc8', fontWeight: 'bold', cursor: 'pointer' },
  activeNavBtn: { backgroundColor: '#89b4fa', color: '#11111b', borderColor: '#89b4fa' },
  notifSuccess: { backgroundColor: '#a6e3a1', color: '#11111b', padding: '12px 18px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px' },
  notifError: { backgroundColor: '#f38ba8', color: '#11111b', padding: '12px 18px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px' },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  skeletonCard: { backgroundColor: '#1e1e2e', height: '180px', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c7086' },
  emptyState: { backgroundColor: '#1e1e2e', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', border: '1px dashed #313244' },
  emptyTitle: { color: '#f38ba8', margin: 0 },
  emptySub: { color: '#bac2de', fontSize: '14px', marginTop: '8px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#1e1e2e', borderRadius: '14px', border: '1px solid #313244', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
  cardTop: { display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#89b4fa', color: '#11111b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' },
  candidateMeta: { flex: 1 },
  candidateName: { margin: 0, fontSize: '17px', color: '#cdd6f4' },
  candidateLoc: { fontSize: '12px', color: '#a6adc8' },
  scoreBadge: { backgroundColor: '#f9e2af', color: '#11111b', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  skillsSection: { backgroundColor: '#181825', borderRadius: '10px', padding: '12px', border: '1px solid #313244' },
  skillsHeading: { margin: '0 0 8px 0', fontSize: '12px', color: '#a6adc8', textTransform: 'uppercase' },
  skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  skillPill: { backgroundColor: '#313244', color: '#cdd6f4', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  pillTagTeach: { backgroundColor: '#a6e3a1', color: '#11111b', padding: '2px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' },
  pillTagLearn: { backgroundColor: '#89b4fa', color: '#11111b', padding: '2px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' },
  requestBtn: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#a6e3a1', color: '#11111b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  paginationContainer: { display: 'flex', justifyContent: 'center', marginTop: '30px' },
  loadMoreBtn: { padding: '12px 28px', borderRadius: '8px', border: '1px solid #89b4fa', backgroundColor: '#181825', color: '#89b4fa', fontWeight: 'bold', cursor: 'pointer' },
};
