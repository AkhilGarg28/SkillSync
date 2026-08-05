import React, { useState, useEffect, useRef } from 'react';

export default function ChatWindow({
  isMatchAccepted = false,
  sessionId,
  matchId,
  currentUserId,
  initialMessages = [],
  onSendMessage,
  onUploadFile,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      if (selectedFile && onUploadFile) {
        const newMsg = await onUploadFile(selectedFile, inputText);
        if (newMsg) setMessages((prev) => [...prev, newMsg]);
        setSelectedFile(null);
        setInputText('');
      } else if (inputText.trim() && onSendMessage) {
        const newMsg = await onSendMessage(inputText);
        if (newMsg) setMessages((prev) => [...prev, newMsg]);
        setInputText('');
      } else {
        const optimisticMsg = {
          _id: Date.now().toString(),
          senderId: currentUserId,
          messageText: inputText,
          fileAttachment: selectedFile
            ? {
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size,
              }
            : null,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setInputText('');
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isMatchAccepted) {
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
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>💬 SkillSync Live Chat</div>
        <div style={styles.activeBadge}>● Match Accepted & Active</div>
      </div>

      <div style={styles.messageThread}>
        {messages.length === 0 ? (
          <div style={styles.emptyChatText}>
            No messages yet. Say hi and start sharing skills! 👋
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                  <div style={styles.senderLabel}>{isMe ? 'You' : 'Partner'}</div>
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
          placeholder="Type your message..."
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
  lockCard: { backgroundColor: '#1e1e2e', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', border: '1px solid #f38ba8' },
  lockIcon: { fontSize: '48px', marginBottom: '16px' },
  lockTitle: { margin: '0 0 12px 0', color: '#f38ba8', fontSize: '22px' },
  lockText: { color: '#a6adc8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' },
  lockBadge: { display: 'inline-block', backgroundColor: '#313244', color: '#f9e2af', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' },
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '680px', margin: '0 auto', backgroundColor: '#1e1e2e', color: '#cdd6f4', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '600px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', overflow: 'hidden' },
  header: { padding: '16px 20px', backgroundColor: '#313244', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #45475a' },
  headerTitle: { fontWeight: 'bold', fontSize: '16px', color: '#89b4fa' },
  activeBadge: { fontSize: '12px', color: '#a6e3a1', fontWeight: '500' },
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
