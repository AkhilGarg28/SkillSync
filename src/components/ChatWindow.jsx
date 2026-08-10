import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

export default function ChatWindow({
  isMatchAccepted: propIsMatchAccepted,
  sessionId,
  matchId: propMatchId,
  currentUserId: propCurrentUserId,
  initialMessages = [],
  onSendMessage,
  onUploadFile,
}) {
  const { user } = useAuth();
  const currentUserId = propCurrentUserId || user?.id || user?._id;

  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch accepted matches for the logged-in user
  const fetchAcceptedMatches = async () => {
    setLoadingMatches(true);
    try {
      const token = localStorage.getItem('skillsync_token') || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(getApiUrl('/api/matches/accepted'), { headers });
      const data = await res.json();
      if (data.success) {
        setAcceptedMatches(data.data || []);
        if (data.data && data.data.length > 0) {
          const matchToSelect = propMatchId
            ? data.data.find((m) => String(m._id) === String(propMatchId)) || data.data[0]
            : data.data[0];
          setSelectedMatch(matchToSelect);
        }
      }
    } catch (err) {
      console.error('Failed to fetch accepted matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchAcceptedMatches();
  }, [currentUserId]);

  // Fetch chat messages for selected match
  const fetchMessages = async (mId) => {
    if (!mId) return;
    try {
      const token = localStorage.getItem('skillsync_token') || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(getApiUrl(`/api/chat-messages/session/${mId}`), { headers });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  useEffect(() => {
    if (selectedMatch?._id) {
      fetchMessages(selectedMatch._id);
      const interval = setInterval(() => {
        fetchMessages(selectedMatch._id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedMatch?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isMatchAccepted = Boolean(
    propIsMatchAccepted || (selectedMatch && (selectedMatch.status === 'accepted' || selectedMatch.status === 'ACCEPTED'))
  );

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setIsUploading(true);

    try {
      const token = localStorage.getItem('skillsync_token') || localStorage.getItem('token');
      const activeMatchId = selectedMatch?._id || propMatchId;

      if (selectedFile) {
        if (onUploadFile) {
          const newMsg = await onUploadFile(selectedFile, inputText);
          if (newMsg) setMessages((prev) => [...prev, newMsg]);
        } else {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('matchId', activeMatchId);
          formData.append('messageText', inputText.trim());

          const res = await fetch(getApiUrl('/api/chat-messages/upload'), {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.data) {
            setMessages((prev) => [...prev, data.data]);
          }
        }
        setSelectedFile(null);
        setInputText('');
      } else if (inputText.trim()) {
        if (onSendMessage) {
          const newMsg = await onSendMessage(inputText);
          if (newMsg) setMessages((prev) => [...prev, newMsg]);
        } else {
          const res = await fetch(getApiUrl('/api/chat-messages'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              matchId: activeMatchId,
              senderId: currentUserId,
              messageText: inputText.trim(),
            }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            setMessages((prev) => [...prev, data.data]);
          }
        }
        setInputText('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingMatches) {
    return (
      <div style={styles.lockedContainer}>
        <div style={styles.loadingCard}>Checking match status and loading chat...</div>
      </div>
    );
  }

  if (!isMatchAccepted || !selectedMatch) {
    return (
      <div style={styles.lockedContainer}>
        <div style={styles.lockCard}>
          <div style={styles.lockIcon}>🔒</div>
          <h3 style={styles.lockTitle}>Chat is Locked</h3>
          <p style={styles.lockText}>
            In-app chat and file sharing are <strong>locked</strong> until your match request is accepted by both users.
          </p>
          <div style={styles.lockBadge}>
            Status: <strong>Match Pending Acceptance</strong>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link to="/matches" style={styles.exploreLink}>
              🔍 Explore & Request Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const senderObj = selectedMatch.sender || selectedMatch.user1Id || {};
  const receiverObj = selectedMatch.receiver || selectedMatch.user2Id || {};
  const partnerUser = String(senderObj._id || senderObj.id) === String(currentUserId) ? receiverObj : senderObj;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            💬 Chat with <span style={{ color: '#a6e3a1' }}>{partnerUser.name || 'Skill Partner'}</span>
          </div>
          <span style={styles.skillExchangeLabel}>
            Exchange: {selectedMatch.skillRequested} ↔ {selectedMatch.skillOffered}
          </span>
        </div>

        {acceptedMatches.length > 1 && (
          <select
            value={selectedMatch._id}
            onChange={(e) => {
              const m = acceptedMatches.find((x) => String(x._id) === String(e.target.value));
              if (m) setSelectedMatch(m);
            }}
            style={styles.peerSelect}
          >
            {acceptedMatches.map((m) => {
              const s = m.sender || m.user1Id || {};
              const r = m.receiver || m.user2Id || {};
              const partner = String(s._id || s.id) === String(currentUserId) ? r : s;
              return (
                <option key={m._id} value={m._id}>
                  🤝 {partner.name || 'Peer User'}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Message Thread */}
      <div style={styles.messageThread}>
        {messages.length === 0 ? (
          <div style={styles.emptyChatText}>
            No messages yet between you and {partnerUser.name || 'your partner'}. Say hi and start sharing skills! 👋
          </div>
        ) : (
          messages.map((msg, idx) => {
            const msgSenderId = String(msg.senderId || msg.sender);
            const isMe = msgSenderId === String(currentUserId);
            const timeStr = msg.timestamp || msg.createdAt
              ? new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg._id || idx}
                style={{
                  ...styles.messageBubbleContainer,
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(isMe ? styles.myMessage : styles.theirMessage),
                  }}
                >
                  <div style={styles.senderLabel}>{isMe ? 'You' : (partnerUser.name || 'Partner')}</div>
                  {msg.messageText && <div style={styles.messageText}>{msg.messageText}</div>}

                  {msg.fileAttachment && (
                    <div style={styles.attachmentCard}>
                      <span style={styles.attachmentIcon}>
                        {msg.fileAttachment.fileType?.includes('image') ? '🖼️' : '📄'}
                      </span>
                      <div style={styles.attachmentInfo}>
                        <div style={styles.fileName}>{msg.fileAttachment.fileName}</div>
                        <div style={styles.fileMeta}>
                          {Math.round((msg.fileAttachment.fileSize || 0) / 1024)} KB
                        </div>
                      </div>
                      {msg.fileAttachment.fileUrl && (
                        <a
                          href={msg.fileAttachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.downloadLink}
                        >
                          ⬇ Download
                        </a>
                      )}
                    </div>
                  )}

                  <div style={styles.timestamp}>{timeStr}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div style={styles.filePreviewBanner}>
          <span style={styles.filePreviewName}>📎 {selectedFile.name}</span>
          <span style={styles.filePreviewSize}>
            ({Math.round(selectedFile.size / 1024)} KB)
          </span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            style={styles.removeFileButton}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.txt,.doc,.docx"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={styles.attachButton}
          title="Attach File (Images/PDFs/Docs, Max 5MB)"
        >
          📎
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${partnerUser.name || 'peer'}...`}
          style={styles.textInput}
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !selectedFile) || isUploading}
          style={{
            ...styles.sendButton,
            ...((!inputText.trim() && !selectedFile) || isUploading ? styles.disabledSend : {}),
          }}
        >
          {isUploading ? 'Sending...' : '✈️ Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  lockedContainer: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '540px', margin: '0 auto', padding: '40px 20px' },
  loadingCard: { backgroundColor: '#1e1e2e', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#89b4fa', border: '1px solid #313244' },
  lockCard: { backgroundColor: '#1e1e2e', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', border: '1px solid #f38ba8' },
  lockIcon: { fontSize: '48px', marginBottom: '16px' },
  lockTitle: { margin: '0 0 12px 0', color: '#f38ba8', fontSize: '22px' },
  lockText: { color: '#a6adc8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' },
  lockBadge: { display: 'inline-block', backgroundColor: '#313244', color: '#f9e2af', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' },
  exploreLink: { textDecoration: 'none', padding: '10px 18px', borderRadius: '8px', backgroundColor: '#89b4fa', color: '#11111b', fontWeight: 'bold', fontSize: '13px' },
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '720px', margin: '0 auto', backgroundColor: '#1e1e2e', color: '#cdd6f4', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '620px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', overflow: 'hidden' },
  header: { padding: '16px 20px', backgroundColor: '#313244', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #45475a' },
  headerTitle: { fontWeight: 'bold', fontSize: '16px', color: '#89b4fa' },
  skillExchangeLabel: { fontSize: '11px', color: '#a6adc8', display: 'block', marginTop: '2px' },
  peerSelect: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #45475a', backgroundColor: '#181825', color: '#cdd6f4', fontSize: '12px', fontWeight: 'bold' },
  messageThread: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  emptyChatText: { textAlign: 'center', color: '#a6adc8', marginTop: '40px', fontSize: '14px', fontStyle: 'italic' },
  messageBubbleContainer: { display: 'flex', width: '100%' },
  messageBubble: { maxWidth: '75%', padding: '12px 16px', borderRadius: '14px', fontSize: '14px', lineHeight: '1.4' },
  myMessage: { backgroundColor: '#89b4fa', color: '#11111b', borderBottomRightRadius: '2px' },
  theirMessage: { backgroundColor: '#313244', color: '#cdd6f4', borderBottomLeftRadius: '2px' },
  senderLabel: { fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 },
  messageText: { wordBreak: 'break-word' },
  timestamp: { fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.7 },
  attachmentCard: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '8px 12px', borderRadius: '8px', marginTop: '6px' },
  attachmentIcon: { fontSize: '18px' },
  attachmentInfo: { flex: 1, overflow: 'hidden' },
  fileName: { fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  fileMeta: { fontSize: '10px', opacity: 0.7 },
  downloadLink: { fontSize: '11px', color: '#11111b', fontWeight: 'bold', textDecoration: 'none', backgroundColor: '#a6e3a1', padding: '4px 8px', borderRadius: '4px' },
  filePreviewBanner: { backgroundColor: '#313244', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', borderTop: '1px solid #45475a' },
  filePreviewName: { color: '#a6e3a1', fontWeight: 'bold' },
  filePreviewSize: { color: '#a6adc8' },
  removeFileButton: { marginLeft: 'auto', background: 'none', border: 'none', color: '#f38ba8', cursor: 'pointer', fontWeight: 'bold' },
  inputForm: { padding: '12px 16px', backgroundColor: '#181825', display: 'flex', alignItems: 'center', gap: '10px' },
  attachButton: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px' },
  textInput: { flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #45475a', backgroundColor: '#313244', color: '#cdd6f4', fontSize: '14px', outline: 'none' },
  sendButton: { padding: '10px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#a6e3a1', color: '#11111b', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' },
  disabledSend: { backgroundColor: '#585b70', color: '#7f849c', cursor: 'not-allowed' },
};
