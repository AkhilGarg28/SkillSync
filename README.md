# SkillSync — Module 3: Sessions & Chat

Module 3 handles all post-match operations in **SkillSync**: session scheduling engine, state machine enforcement, video call link generation, progress notes with milestones, in-app chat with file sharing, and automated session reminders.

---

## 1. Mongoose Schemas

### Collection: `sessions`
Represents scheduled skill-swap sessions between two matched users.

| Field Name | Type | Description | Required | Options / Default |
| :--- | :--- | :--- | :--- | :--- |
| `user1Id` | `ObjectId` (ref: `User`) | ID of the initiating user | Yes | - |
| `user2Id` | `ObjectId` (ref: `User`) | ID of the second matched user | Yes | - |
| `matchId` | `ObjectId` (ref: `Match`) | ID of the accepted match from Module 2 | No | - |
| `proposedTime` | `Date` | Proposed timestamp for the session | Yes | - |
| `confirmedTime` | `Date` | Confirmed timestamp once accepted | No | - |
| `status` | `String` | Current state of the session | Yes | Default: `'requested'`. Enum: `['requested', 'confirmed', 'completed', 'cancelled']` |
| `videoCallLink` | `String` | WebRTC / Zoom / Google Meet call link | No | Auto-generated when session confirmed |
| `notes` | `[ObjectId]` (ref: `SessionNote`) | Array of associated session note IDs | No | Default: `[]` |

---

### Collection: `chat_messages`
Represents direct messages exchanged within an accepted match or session.

| Field Name | Type | Description | Required | Options / Default |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | `ObjectId` (ref: `Session`) | ID of the session | Yes | - |
| `matchId` | `ObjectId` (ref: `Match`) | Link to Module 2 Match ID | No | - |
| `senderId` | `ObjectId` (ref: `User`) | User ID of the message sender | Yes | - |
| `messageText` | `String` | Body text of the message | No | Default: `""` |
| `fileAttachment` | `Object` | Metadata for optional file attachment | No | Sub-doc: `{ fileName, fileUrl, fileType, fileSize }` |
| `timestamp` | `Date` | Timestamp of when message was sent | Yes | Default: `Date.now` |

---

### Collection: `session_notes`
Represents progress notes and milestone checklists recorded for a session.

| Field Name | Type | Description | Required | Options / Default |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | `ObjectId` (ref: `Session`) | Parent session ID | Yes | - |
| `authorId` | `ObjectId` (ref: `User`) | User ID who created/updated the note | No | - |
| `notes` | `String` | Free-text progress/summary notes | No | Default: `""` |
| `milestones` | `[Object]` | Array of goal milestones | No | Sub-doc array: `[{ text: String, isDone: Boolean }]` |

---

### Collection: `notifications`
Represents in-app session reminders and system alerts.

| Field Name | Type | Description | Required | Options / Default |
| :--- | :--- | :--- | :--- | :--- |
| `userId` | `ObjectId` (ref: `User`) | Target user ID | Yes | - |
| `sessionId` | `ObjectId` (ref: `Session`) | Related session ID | No | - |
| `type` | `String` | Alert type | Yes | Default: `'session_reminder'` |
| `message` | `String` | Notification message text | Yes | - |
| `isRead` | `Boolean` | Read status | Yes | Default: `false` |
| `sentAt` | `Date` | Timestamp sent | Yes | Default: `Date.now` |

---

## 2. Scheduling Engine & State Machine

### Propose Session Time (`POST /api/sessions/propose`)
Validates proposed session time against **BOTH** users' availability data (weekly slots + blackout dates).

### Respond / State Machine Transitions (`PUT /api/sessions/:id/respond`)
Enforces server-side state machine:
- `requested` ➔ `confirmed` (accepts proposed time; sets `confirmedTime` & generates `videoCallLink`)
- `requested` ➔ `cancelled` (declines or cancels requested session)
- `confirmed` ➔ `completed` (marks finished)
- `confirmed` ➔ `cancelled` (allowed **ONLY BEFORE** session time passes)

---

## 3. In-App Chat & Pre-Acceptance Match Lock

### 🔒 Pre-Acceptance Match Lock Constraint
In-app chat and file sharing are **COMPLETELY INACCESSIBLE** until Module 2's match-accepted signal (`event: "MATCH_ACCEPTED"` or `status: "accepted"`) fires. Returns **`403 Forbidden`** for unaccepted matches.

### ⚡ Real-Time Socket.io Messaging
Handled in [`src/sockets/chatSocket.js`](file:///Users/rishisharma/Desktop/SkillSync/src/sockets/chatSocket.js). Socket events: `join_room`, `send_message`, `receive_message`, `error_message`.

### 📁 File Sharing & Scoped Access
Multer file upload handler (max 5MB limit; allowed MIME types: images & PDF/DOC/TXT documents). `GET /api/chat-messages/files/download/:filename` returns **`403 Forbidden`** to non-participants.

---

## 4. Reminders & Scheduled Notifications

Session reminders are automatically processed via `node-cron` in [`src/services/reminderService.js`](file:///Users/rishisharma/Desktop/SkillSync/src/services/reminderService.js).
- **Lookahead Window**: Configurable via `process.env.REMINDER_LOOKAHEAD_HOURS` (default: 24 hours).
- **In-App Notifications**: Creates `Notification` records for both matched participants.
- **Email Reminders**: Dispatches HTML email notifications via `nodemailer`.

---

## 5. Data Contracts for Teammates (Module 1 & Module 4)

Module 3 exposes completed session data via `GET /api/sessions/user/:userId`.

### Module 1 Contract ("Verified Teacher" & "Peer Rated" Badge Logic)
```json
{
  "_id": "66s222222222222222222222",
  "user1Id": "66b1a2c3d4e5f67890123456",
  "user2Id": "66b789012345678901234567",
  "status": "completed",
  "confirmedTime": "2026-08-10T15:00:00.000Z"
}
```

### Module 4 Contract (Peer Review & Rating Trigger)
```json
{
  "_id": "66s222222222222222222222",
  "matchId": "66m222222222222222222222",
  "user1Id": "66b1a2c3d4e5f67890123456",
  "user2Id": "66b789012345678901234567",
  "status": "completed"
}
```

---

## 6. Automated Test Suite

Run all 32 automated tests across 4 test suites:
```bash
npm test
```

```
PASS tests/fullModuleIntegration.test.js
PASS tests/chatAndFileSharing.test.js
PASS tests/sessionProgressAndAuth.test.js
PASS tests/sessionScheduling.test.js

Test Suites: 4 passed, 4 total
Tests:       32 passed, 32 total
Snapshots:   0 total
```
