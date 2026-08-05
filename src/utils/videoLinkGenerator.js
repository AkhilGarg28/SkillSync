const crypto = require('crypto');

function generateVideoCallLink(sessionId) {
  const isZoomConfigured = process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET;
  const isGoogleMeetConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  if (isZoomConfigured) {
    const randomMeetingId = Math.floor(10000000000 + Math.random() * 90000000000);
    return `https://zoom.us/j/${randomMeetingId}?pwd=skillsync_${sessionId.toString().substring(0, 6)}`;
  }

  if (isGoogleMeetConfigured) {
    const meetingCode = crypto.randomBytes(5).toString('hex').substring(0, 9);
    const formattedCode = `${meetingCode.slice(0, 3)}-${meetingCode.slice(3, 6)}-${meetingCode.slice(6, 9)}`;
    return `https://meet.google.com/${formattedCode}`;
  }

  const roomHash = crypto.randomBytes(4).toString('hex');
  const sessionShortId = sessionId ? sessionId.toString().substring(0, 8) : 'room';
  return `https://meet.skillsync.app/room/session_${sessionShortId}_${roomHash}`;
}

module.exports = {
  generateVideoCallLink,
};
