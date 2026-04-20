# BookMyIntern v2 — TypeScript

A full-stack BookMyIntern built with **Next.js 14 App Router**, **TypeScript**,
**MongoDB Atlas**, **Mongoose**, and **NextAuth.js**.

## What's new in v2

| Feature | Details |
|---------|---------|
| **Chat system** | Per-job conversations between students and recruiters, polling every 3 s |
| **Extended status** | 6-stage pipeline: Pending → Reviewed → Interview → On Hold → Selected → Rejected |
| **Inline status management** | Recruiter changes applicant status with a dropdown; student sees it instantly |
| **Message buttons** | Both dashboards have a "Message" button that opens or creates the right conversation |
| **Chat inbox** | `/chat` lists all conversations for any user |

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | Next.js 14 App Router, React 18, TSX    |
| Auth     | NextAuth.js v4, JWT sessions            |
| Database | MongoDB Atlas, Mongoose 8               |
| Language | TypeScript 5 (strict mode)              |
| Styling  | Plain CSS (globals.css)                 |
| Realtime | Polling (setInterval, 3 s)              |

---

## Prerequisites

| Tool          | Version |
|---------------|---------|
| Node.js       | 18 +    |
| npm           | 9 +     |
| Python        | 3.x (setup script only) |
| MongoDB Atlas | free M0 tier works      |

---

## Quick Setup

### 1 — Generate project files

```bash
python3 setup.py
```

Creates `job-portal/` with all 45 files.

### 2 — Install dependencies

```bash
cd job-portal
npm install
```

### 3 — Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/job-portal?retryWrites=true&w=majority
NEXTAUTH_SECRET=some-random-32-char-string
NEXTAUTH_URL=http://localhost:3000
```

**Getting your MongoDB URI**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. *Database Access* → create DB user with read/write
4. *Network Access* → add `0.0.0.0/0`
5. *Connect → Drivers* → copy URI, replace `<password>`

**Generating NEXTAUTH_SECRET**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4 — Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Full Project Structure

```
job-portal/
├── types/
│   ├── index.ts              # IJob, IApplication, IConversation, IMessage, …
│   └── next-auth.d.ts        # Session/JWT augmentation
│
├── lib/
│   ├── db.ts
│   └── authOptions.ts
│
├── models/
│   ├── User.ts
│   ├── RecruiterProfile.ts
│   ├── Job.ts
│   ├── Application.ts        # 6-status enum
│   ├── Conversation.ts       # participants[], jobId, lastMessagePreview
│   └── Message.ts            # conversationId, senderId, content
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   │
│   ├── jobs/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── student/dashboard/page.tsx     # status badges + Message Recruiter button
│   ├── recruiter/dashboard/page.tsx   # inline status selector + Message student button
│   │
│   ├── chat/
│   │   ├── page.tsx                   # conversation inbox
│   │   └── [id]/page.tsx              # chat UI with 3-second polling
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/signup/route.ts
│       ├── jobs/route.ts
│       ├── jobs/[id]/route.ts
│       ├── applications/route.ts
│       ├── applications/student/route.ts   # now includes recruiterId in populate
│       ├── recruiter/verify/route.ts
│       ├── recruiter/jobs/route.ts
│       ├── recruiter/jobs/[jobId]/applicants/route.ts
│       ├── recruiter/jobs/[jobId]/applicants/[appId]/route.ts  # PATCH status
│       ├── conversations/route.ts           # GET list, POST find-or-create
│       └── conversations/[id]/messages/route.ts  # GET, POST
│
├── components/
│   ├── Providers.tsx
│   ├── Navbar.tsx            # + Messages link
│   ├── ProfileMenu.tsx       # + Messages link
│   ├── VerificationModal.tsx
│   ├── JobCard.tsx
│   └── JobForm.tsx
│
├── middleware.ts             # + /chat in matcher
├── next.config.ts
└── tsconfig.json
```

---

## Application Status Pipeline

Recruiters move applicants through these stages from the applicant panel:

```
pending  →  reviewed  →  interview  →  on-hold  →  selected
                                               ↘
                                             rejected
```

The change is a single PATCH to `/api/recruiter/jobs/[jobId]/applicants/[appId]`,
updates MongoDB atomically, and reflects in the student's dashboard within seconds
(the student refreshes or revisits their dashboard).

---

## Chat System Architecture

```
POST /api/conversations
  body: { otherUserId, jobId }
  → find existing conversation OR create one
  → one conversation per (studentId + recruiterId + jobId)

GET  /api/conversations
  → list all conversations for current user (participants populated)

POST /api/conversations/[id]/messages
  body: { content }
  → saves message, updates lastMessagePreview on conversation

GET  /api/conversations/[id]/messages
  → all messages for the conversation (senderId.name populated)
  → chat page polls this every 3 seconds
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `MONGODB_URI` error on startup | Check `.env.local` exists and the URI is correct |
| Auth session not persisting | Make sure `NEXTAUTH_SECRET` is set |
| Status not updating for student | Refresh the student dashboard — status updates are server-side |
| Chat messages not loading | Verify both users are participants in the conversation |
| `duplicate key error` on Application | Expected — student already applied; UI handles it |
| TypeScript errors | Run `npm run lint` to find exact issue |
