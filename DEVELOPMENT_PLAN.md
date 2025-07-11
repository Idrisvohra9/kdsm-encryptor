## 📈 **Full Development Plan: AI-Readable Phased Workflow + Best Practices**

---

### ✅ **PHASE 1: Core Setup & Project Bootstrapping**

**Objectives:**

- Initialize the Appwrite, create UI components, and project structure.

**Steps:**

1. Install and configure **Appwrite SDK**, `socket.io-client` in ('/socket-server'), `clsx`, and `zod`.
2. Setup environment file (`.env.local`) with Appwrite credentials.

4. Use `/components/ui/chats/` folder for atomic chat UI components.
5. Prepare **Folder Structure**:

   - `hooks/`, `context/`, `lib/`, `app/chats/[roomId]/`, `utils/`

---

### 🔐 **PHASE 2: Authentication & Session Management**

**Objectives:**

- Enable secure login/registration and manage sessions.

**Steps:**

1. Build `/auth/login` and `/auth/register` pages using Appwrite auth.
2. Store user sessions with **3-day expiry** using Appwrite's session mechanism.
3. Create `api/auth/session.ts` to manage sessions server-side.
4. Add a `/app/profile` page to show current session and logout options.

---

### 💬 **PHASE 3: Chat Room Creation + Routing + Invite Flow**

**Objectives:**

- Let users create rooms, share invites, and manage room entry.

**Steps:**

1. Build `/chats/create/page.jsx` for room creation.
2. Store room name, creatorId, and hashed Room Key in Appwrite.
3. Add Room PIN for private access, stored as `roomKeyHash` (optional).
4. Generate invite links:

   ```
   https://yourdomain.com/app/chats/abc123?invite=true
   ```

   - If `invite=true`, auto-prompt user to enter PIN.

5. Render `/chats/[roomId]/page.jsx` dynamically.

---

### 📡 **PHASE 4: Real-Time Socket Connection + Context Handling**

**Objectives:**

- Enable live message sync using sockets and manage state globally.

**Steps:**

1. Setup external **Socket.IO server** in `/socket-server` directory.
2. Connect socket client on room entry.
3. Emit and listen to events: `join-room`, `send-message`, `receive-message`.
4. **Add a `ChatContextProvider`** to wrap chat pages:

   ```tsx
   <ChatProvider>
     <ChatRoom />
   </ChatProvider>
   ```

   - Manage socket events, encryption state, member status, etc.

---

### 🔐 **PHASE 5: KDSM Encryption + Message Handling**

**Objectives:**

- Integrate client-side encryption with seamless UX.

**Steps:**

1. Create `useEncryption(roomKey)` hook:

   ```tsx
   const { encrypt, decrypt } = useEncryption(roomKey);
   ```

   - Separates cryptographic logic from UI.

2. Encrypt messages using `encrypt()` before sending to socket.
3. Store encrypted message in Appwrite `messages` collection.

   - Optional “Decrypt All” toggle on room entry.

---

### 📁 **PHASE 6: Encrypted File Sharing**

**Objectives:**

- Upload/download securely encrypted files with Room Key.

**Steps:**

1. Encrypt file (and metadata) client-side.
2. Upload using Appwrite’s **Storage API** with fileId linked to room.
3. Limit: 10MB/file for free users.
4. Require Room Key before file decryption.
5. Attach file info to `sharedFiles` collection.

---

### ⚙️ **PHASE 7: Room Settings + Role Management**

**Objectives:**

- Allow invite management and room personalization.

**Steps:**

1. Add `/chats/settings/page.jsx`.
2. Let room creators:

   - Toggle auto-decrypt
   - Choose retention (3 or 7 days)
   - Manage members

3. On joining a room:

   - Prompt for Room Key or PIN
   - Save it in memory for session duration

---

### 🧼 **PHASE 8: Retention Policy + Expiry Flow**

**Objectives:**

- Manage automatic deletion of old messages/files.

**Steps:**

1. Add `retention` field in `chatRooms` (enum: 3days, 7days).
2. Background cleanup script (daily):

   - Flag expired messages with `isExpired: true` (soft delete)
   - Remove file access or hide messages

3. UI displays "⚠️ Message expired" box for expired content.

---

### 💳 **PHASE 9: Subscription Enforcement + Feature Limits**

**Objectives:**

- Restrict premium features and prompt for upgrade.

**Steps:**

1. Track `subscriptionTier` in `users` collection.
2. Enforce:

   - Max 3 chat rooms for free tier
   - Max 10MB/file
   - No 7-day retention for free users

3. Add modal prompting for Pro upgrade when limit hit.

---

## 🧩 Final Appwrite Database Schema (Collections)

---

### 👤 `users` (managed by Appwrite Auth)

| Field              | Type         | Description             |
| ------------------ | ------------ | ----------------------- |
| `username`         | string       | Unique username         |
| `subscriptionTier` | enum         | free / pro              |
| `profilePicture`   | string (URL) | Profile avatar          |
| `joinedAt`         | datetime     | User creation timestamp |

---

### 🏠 `chatRooms`

| Field         | Type          | Description            |
| ------------- | ------------- | ---------------------- |
| `name`        | string        | Room name              |
| `creatorId`   | string        | Auth user ID           |
| `roomKeyHash` | string        | (Optional) Hashed PIN  |
| `members`     | array(string) | List of user IDs       |
| `retention`   | enum          | 3days / 7days          |
| `autoDecrypt` | boolean       | Toggle auto-decryption |
| `createdAt`   | datetime      | Room creation time     |

---

### 💬 `messages`

| Field              | Type     | Description                   |
| ------------------ | -------- | ----------------------------- |
| `roomId`           | string   | Linked room                   |
| `senderId`         | string   | Auth user ID                  |
| `contentEncrypted` | string   | KDSM encrypted message        |
| `signature`        | string   | Hash for message verification |
| `timestamp`        | datetime | Sent time                     |
| `isExpired`        | boolean  | Soft delete flag              |
| `expiresAt`        | datetime | When to expire message        |

---

### 📎 `sharedFiles`

| Field         | Type     | Description               |
| ------------- | -------- | ------------------------- |
| `roomId`      | string   | Linked room               |
| `uploaderId`  | string   | Auth user ID              |
| `fileId`      | string   | Appwrite file ID          |
| `fileName`    | string   | Encrypted file name       |
| `fileSize`    | int      | Enforced < 10MB for free  |
| `expiresAt`   | datetime | Based on retention policy |
| `requiresKey` | boolean  | Always true               |

### Todos:

- [ ] Automatic room deletion after 7 days
- [ ] UI for file upload/download
- ☁️ Backend & Data Improvements
  Soft Delete for Expired Messages:

Instead of hard deleting messages, flag them as expired and hide in UI.

You can show a "This message expired" warning box.

Why? Gives room for recovery for premium plans or debugging.


🛎 Notification & Status Enhancements
Encrypted Typing Indicators & Read Receipts:

Emit socket events like typing, seen in encrypted form (e.g., base64("typing:userId")).

Ensures even presence/status info isn't plainly readable.

📈 Scalability Considerations
Chunk Large Files and Encrypt Per Chunk:

For larger file support, especially for premium users.

Encrypt files in 1MB chunks, and reconstruct on download/decrypt.

Why? Scales better and avoids frontend/browser crashes on huge files.
