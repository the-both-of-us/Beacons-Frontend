# Social App Frontend - Development Progress

**Last Updated:** November 8, 2025
**Status:** Auth + QR + Chat threads working end-to-end with mock SignalR data

---

## 🎯 Project Overview

A Next.js 14 frontend with TypeScript and Tailwind CSS for the Social App hackathon project. The frontend uses **mock data and services** to simulate the Azure backend, making it easy to develop independently and integrate later.

**Key Architecture Decision:** All backend interactions go through abstraction layers (`lib/api.ts`, `lib/mockSignalR.ts`) that can be swapped for real implementations without changing UI code.

---

## ✅ Completed Infrastructure (100%)

### Core Setup
- ✅ **Next.js 14.2.21** with App Router
- ✅ **TypeScript** with strict mode
- ✅ **Tailwind CSS v3.4** properly configured
- ✅ **Environment Configuration** (.env.local, .env.example)
- ✅ **Build System** - Successfully compiles with zero errors
- ✅ **Project Structure** - All directories created

### Dependencies Installed
```json
{
  "dependencies": {
    "next": "14.2.21",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "html5-qrcode": "^2.3.8"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/node": "^20.17.6",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.21"
  }
}
```

**Note:** `@microsoft/signalr` will be installed when integrating with real Azure backend.

---

## 📁 Complete Project Structure

```
/Users/abdu/Social-app-frontend/
├── .git/                                  ✅ Git repository initialized
├── .next/                                 ✅ Next.js build output
├── node_modules/                          ✅ Dependencies installed
│
├── app/                                   ✅ Next.js App Router
│   ├── layout.tsx                        ✅ Root layout with metadata
│   ├── page.tsx                          ✅ Landing page (fully built)
│   ├── globals.css                       ✅ Tailwind imports
│   │
│   ├── auth/                             ✅ Authentication flows implemented
│   │   ├── login/page.tsx                ✅ Email/password login w/ Zustand + mock API
│   │   ├── signup/page.tsx               ✅ Full account creation (react-hook-form + zod)
│   │   └── anonymous/page.tsx            ✅ Guest session explainer + CTA
│   │
│   ├── scan/page.tsx                     ✅ QR scanner + mock shortcuts
│   │
│   ├── room/[roomId]/page.tsx            ✅ Real-time chat room powered by mock SignalR
│   │
│   └── thread/[threadId]/page.tsx        ✅ Thread view + reply composer (mock data)
│
├── components/                            ✅ Component system
│   ├── ui/                               ✅ Base atoms (Button, Input, Card, Badge)
│   │
│   ├── auth/                             ✅ Form layer
│   │   ├── LoginForm.tsx                 ✅ react-hook-form + zod validation
│   │   └── SignupForm.tsx                ✅ Extended fields + shared styling
│   │
│   ├── qr/                               ✅ QRScanner.tsx (html5-qrcode wrapper)
│   │
│   ├── chat/                             ✅ Chat surface
│   │   ├── ChatRoom.tsx                  ✅ Orchestrates data fetching + layout
│   │   ├── MessageList.tsx               ✅ Auto-scroll container
│   │   ├── MessageItem.tsx               ✅ Message bubble + vote + AI card
│   │   ├── MessageInput.tsx              ✅ Composer w/ TagSelector + validation
│   │   └── TagSelector.tsx               ✅ Toggleable tag pills (location questions spawn threads)
│   │
│   ├── thread/                           ✅ Thread consumption
│   │   ├── ThreadView.tsx                ✅ Original question + replies + reply form
│   │   └── ThreadList.tsx                ✅ Sidebar summaries + AI badge
│   │
│   └── voting/                           ✅ VoteButtons.tsx (▲/▼ control w/ counts)
│
├── lib/                                   ✅ Utilities and services
│   ├── api.ts                            ✅ Mock API service (all endpoints)
│   ├── mockSignalR.ts                    ✅ Mock real-time service
│   ├── auth.ts                           ✅ Token management helpers
│   ├── utils.ts                          ✅ Utility functions
│   │
│   └── mock/                             ✅ All mock data complete
│       ├── mockUsers.ts                  ✅ 4 users (2 auth, 2 anonymous)
│       ├── mockLocations.ts              ✅ 4 locations (classroom, library, cafeteria, gym)
│       ├── mockRooms.ts                  ✅ 6 rooms (4 main, 2 thread)
│       ├── mockThreads.ts                ✅ Thread metadata (id ↔ original message)
│       ├── mockMessages.ts               ✅ 6 messages (includes thread replies) + 2 AI responses
│       └── mockQRCodes.ts                ✅ 4 QR codes (one per location)
│
├── store/                                 ✅ Zustand state management
│   ├── authStore.ts                      ✅ User authentication state
│   ├── chatStore.ts                      ✅ Messages and AI responses
│   └── roomStore.ts                      ✅ Current location/room state
│
├── types/                                 ✅ Complete TypeScript types
│   ├── user.ts                           ✅ User, AuthResponse, LoginRequest, SignUpRequest
│   ├── location.ts                       ✅ Location, ProximityVerification
│   ├── room.ts                           ✅ Room, Thread
│   ├── message.ts                        ✅ Message, AiResponse, Vote, CreateMessageRequest
│   ├── qr.ts                             ✅ QrCode, QrPayload, QrVerification
│   └── index.ts                          ✅ Exports all types
│
├── hooks/                                 ✅ Custom hooks directory
│   └── useSignalR.ts                     ✅ Mock SignalR lifecycle + send/vote helpers
│
├── public/                                ✅ Static assets directory
│
├── .env.local                             ✅ Local environment variables
├── .env.example                           ✅ Environment template
├── .gitignore                             ✅ Proper Next.js gitignore
├── package.json                           ✅ All dependencies defined
├── tsconfig.json                          ✅ TypeScript configuration
├── tailwind.config.ts                     ✅ Tailwind configuration
├── postcss.config.js                      ✅ PostCSS configuration
├── next.config.js                         ✅ Next.js configuration
├── TECHNICAL_IMPLEMENTATION.md            ✅ Full technical spec
├── CLAUDE.md                              ✅ Development guidance
└── PROGRESS.md                            ✅ This file
```

---

## 🎨 Completed UI Components

### Button Component (`components/ui/Button.tsx`)
```tsx
<Button variant="primary" size="lg">Click Me</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost" size="sm">Small</Button>
```
- ✅ Variants: primary, secondary, outline, ghost
- ✅ Sizes: sm, md, lg
- ✅ Disabled state handling
- ✅ Focus ring styling

### Input Component (`components/ui/Input.tsx`)
```tsx
<Input label="Email" type="email" error="Invalid email" />
```
- ✅ Label support
- ✅ Error message display
- ✅ Focus states
- ✅ Forward ref for react-hook-form

### Card Components (`components/ui/Card.tsx`)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```
- ✅ Card container with shadow
- ✅ CardHeader, CardTitle, CardContent sub-components

### Badge Component (`components/ui/Badge.tsx`)
```tsx
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
```
- ✅ Variants: default, primary, success, warning, danger
- ✅ Pill-shaped design

---

## 📄 Completed Pages

### Landing Page (`app/page.tsx`) ✅
**Status:** Fully built and styled

**Features:**
- ✅ Hero section with app title and tagline
- ✅ Description and value proposition
- ✅ Three CTA buttons:
  - "Scan QR Code" → `/scan`
  - "Login / Sign Up" → `/auth/login`
  - "Continue as Guest" → `/auth/anonymous`
- ✅ Features grid with 3 cards:
  - Location-Based Rooms
  - AI-Assisted Answers
  - Privacy First
- ✅ "How It Works" section (3-step process)
- ✅ Hackathon theme badge
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Beautiful gradient background

**Screenshot:** Visit http://localhost:3000

---

### Login Page (`app/auth/login/page.tsx`) ✅
- React Hook Form + zod validation (email + password) with inline error states.
- Calls `api.login` (mock) and hydrates `useAuthStore`, then routes to `/scan`.
- Secondary action lets users pivot to guest flow instantly.
- Shares card-first layout consistent with signup/anonymous screens.

### Signup Page (`app/auth/signup/page.tsx`) ✅
- Collects username, email, password, gender, age with validation messaging.
- On success, stores the new user/token in Zustand then redirects to QR scan.
- Cross-links back to login to keep nav tight.

### Anonymous Session Page (`app/auth/anonymous/page.tsx`) ✅
- Educates users on guest capabilities vs. limitations.
- `Continue Anonymously` triggers `api.createAnonymousSession`, persists to auth store, and steers to `/scan`.
- Includes CTA back to signup for full-feature conversion.

### QR Scanner Page (`app/scan/page.tsx`) ✅
- Integrates `html5-qrcode` via `components/qr/QRScanner`.
- Handles permission prompts, success/failure copy, and spinner while verifying QR data.
- Provides mock shortcuts for select locations to bypass camera during demos.
- Persists location + room in Zustand before pushing to `/room/:id`.

### Chat Room Page (`app/room/[roomId]/page.tsx`) ✅
- Orchestrated through `components/chat/ChatRoom`.
- Fetches location, room, messages, and thread metadata from mock API, then subscribes via `useSignalR`.
- Live message list, vote controls, AI response cards, and composer with tag toggles.
- Sidebar shows location-specific threads + AI readiness.

### Thread View Page (`app/thread/[threadId]/page.tsx`) ✅
- Fetches original question, replies, AI response, and location context.
- Reuses `ThreadView` + `MessageItem` for consistent UI, plus a reply composer (SignalR-enabled).
- Provides navigation crumbs back to scan/room and surfaces connection status.

---

## 🗄️ Mock Data Layer (Complete)

### Mock API Service (`lib/api.ts`)
All functions simulate 300ms network delay and return realistic responses.

**Implemented Endpoints:**
- ✅ `login(request)` - Validates credentials, returns JWT + user
- ✅ `signup(request)` - Creates new user, returns JWT + user
- ✅ `createAnonymousSession()` - Generates session ID, returns JWT + anonymous user
- ✅ `getCurrentUser()` - Retrieves user from localStorage
- ✅ `verifyQRCode(request)` - Validates QR, returns location + room
- ✅ `getAllLocations()` - Returns all 4 mock locations
- ✅ `getLocation(id)` - Returns specific location
- ✅ `getRoom(id)` - Fetches main/thread rooms for deep links
- ✅ `getThreadsForLocation(locationId)` - Supplies sidebar metadata
- ✅ `getThreadDetails(threadId)` - Returns original message, replies, AI response
- ✅ `getMessages(roomId)` - Returns messages for a room (main or thread)
- ✅ `sendMessage(roomId, content, tags, { parentThreadId? })` - Creates message, spawns new thread rooms when tag `location_specific_question` is selected
- ✅ `voteMessage(messageId, voteType)` - Updates vote count

**Integration Ready:** Change `NEXT_PUBLIC_USE_MOCK_DATA=false` to use real API.

### Mock SignalR Service (`lib/mockSignalR.ts`)
Simulates real-time WebSocket communication.

**Features:**
- ✅ Connection lifecycle (start, stop)
- ✅ Event handlers (on, emit)
- ✅ Hub methods:
  - `JoinRoom(roomId, accessToken)` - Join room, receive history
  - `SendMessage(roomId, content, tags, accessToken, parentThreadId?)` - Send message (supports thread replies + creation)
  - `VoteMessage(messageId, voteType, accessToken)` - Vote on message
  - `LeaveRoom(roomId)` - Leave room
- ✅ Client events:
  - `MessageReceived` - New message broadcast
  - `ThreadCreated` - Thread room created
  - `AiResponse` - AI response generated (3s delay)
  - `VoteUpdated` - Vote counts changed
  - `UserJoined`, `UserLeft` - User presence
  - `MessageHistory` - Initial messages on join
- ✅ Auto-simulation: Generates random message every 15 seconds
- ✅ AI response simulation: Triggers 3s after thread creation, stored via `addMockThread/addMockRoom`

**Integration Ready:** Replace with `@microsoft/signalr` client when backend is ready.

### Mock Data Files
All data matches Cosmos DB schema from TECHNICAL_IMPLEMENTATION.md.

**`lib/mock/mockUsers.ts`**
- ✅ 2 authenticated users (john_doe, jane_smith)
- ✅ 2 anonymous users with session IDs
- ✅ Helper functions: `getCurrentMockUser()`, `setCurrentMockUser()`

**`lib/mock/mockLocations.ts`**
- ✅ University Classroom A101
- ✅ University Main Library
- ✅ Student Cafeteria
- ✅ Campus Gym & Recreation Center
- ✅ All with coordinates and geofence radius

**`lib/mock/mockRooms.ts`**
- ✅ 4 main rooms (one per location)
- ✅ 2 thread rooms mirrored from tagged questions
- ✅ Helper functions: `getRoomById()`, `getRoomByLocationId()`, `addMockRoom()`

**`lib/mock/mockThreads.ts`**
- ✅ Thread metadata linking room ids → original messages → location ids
- ✅ Helpers: `getThreadById()`, `getThreadsByLocationId()`, `addMockThread()`

**`lib/mock/mockMessages.ts`**
- ✅ 6 sample messages (mix of main-room chatter + thread replies)
- ✅ Messages from auth and anonymous users
- ✅ Vote counts on messages
- ✅ Thread starters with `location_specific_question` tag
- ✅ 2 AI responses with confidence scores
- ✅ Helper functions: `getMessagesByRoomId()`, `getMessageById()`, `getThreadMessages()`, `getAiResponseByMessageId()`

**`lib/mock/mockQRCodes.ts`**
- ✅ 4 QR codes (one per location)
- ✅ Daily expiry simulation
- ✅ HMAC signature for verification
- ✅ Helper functions: `parseQRData()`, `verifyQRCode()`

---

## 🏪 State Management (Zustand)

### Auth Store (`store/authStore.ts`)
```tsx
const { user, token, isLoading, setUser, logout, initialize } = useAuthStore();
```
- ✅ User state (User | null)
- ✅ JWT token (string | null)
- ✅ Loading state
- ✅ Actions: `setUser()`, `logout()`, `initialize()`
- ✅ Persists to localStorage

### Chat Store (`store/chatStore.ts`)
```tsx
const { messages, aiResponses, addMessage, updateMessageVotes } = useChatStore();
```
- ✅ Messages array
- ✅ AI responses Map (messageId → AiResponse)
- ✅ Current room ID
- ✅ Actions: `setMessages()` (chronological), `addMessage()` (de-duped), `setCurrentRoom()`, `updateMessageVotes()`, `addAiResponse()`, `clearMessages()`

### Room Store (`store/roomStore.ts`)
```tsx
const { currentLocation, currentRoom, threads, setLocation, addThread } = useRoomStore();
```
- ✅ Current location (Location | null)
- ✅ Current room (Room | null)
- ✅ Threads array (Thread[])
- ✅ Actions: `setLocation()`, `setRoom()`, `setThreads()`, `addThread()` (de-dupes), `clearRoom()`

---

## 🛠️ Utility Functions

### Auth Helpers (`lib/auth.ts`)
- ✅ `getToken()` - Retrieve JWT from localStorage
- ✅ `setToken(token)` - Store JWT
- ✅ `removeToken()` - Clear JWT
- ✅ `isAuthenticated()` - Check if user has token
- ✅ `getSessionId()`, `setSessionId()`, `removeSessionId()` - Anonymous session management
- ✅ `generateSessionId()` - Create unique session ID

### General Utils (`lib/utils.ts`)
- ✅ `cn(...classes)` - Merge Tailwind classes
- ✅ `formatRelativeTime(dateString)` - Convert timestamps to "5m ago", "2h ago", etc.
- ✅ `delay(ms)` - Promise-based delay for simulating network latency

---

## 📝 TypeScript Types (Complete)

All types match the Cosmos DB schema from TECHNICAL_IMPLEMENTATION.md.

### Core Types Defined:
- ✅ `User` - User accounts and anonymous sessions
- ✅ `AuthResponse`, `LoginRequest`, `SignUpRequest` - Auth DTOs
- ✅ `Location` - Physical locations with coordinates
- ✅ `Room` - Chat rooms and thread rooms
- ✅ `Thread` - Thread metadata
- ✅ `Message` - Chat messages with tags, votes, AI responses
- ✅ `AiResponse` - AI-generated answers with confidence scores
- ✅ `Vote` - User votes on messages/AI responses
- ✅ `QrCode`, `QrPayload` - QR code data structures
- ✅ All verification request/response DTOs

**Export:** All types exported from `types/index.ts` for easy importing.

---

## ✅ Implemented Flows & Components

### Authentication
- Login, signup, and anonymous pages share a consistent card layout.
- `LoginForm`/`SignupForm` use `react-hook-form` + `zod`, surface inline validation, and hydrate `useAuthStore`.
- Anonymous flow explains guest limits and creates mock sessions before redirecting to `/scan`.
- Next steps: wire to real API + add password reset CTA.

### QR Scanner
- `app/scan/page.tsx` renders onboarding copy, camera onboarding, html5-qrcode preview, and verification spinners.
- Includes graceful error banners plus mock shortcuts for demos.
- Persists both `Location` + `Room` state so deep links to `/room/:id` work.
- Next steps: add better fallback text for camera-denied state + environment-specific QR hints.

### Chat Room Experience
- `ChatRoom.tsx` bootstraps room/location data, fetches `getThreadsForLocation`, and preloads AI responses for the sidebar.
- `useSignalR` manages the mock SignalR lifecycle, listens for message/vote/thread/AI events, and exposes `sendMessage`/`voteMessage`.
- `MessageList`, `MessageItem`, `MessageInput`, `TagSelector`, and `VoteButtons` compose the UI with Tailwind-friendly styling.
- Thread sidebar (`ThreadList`) shows question snippets + AI readiness.
- TODO: add skeleton/error components for SignalR failures, add `useMessages` hook to abstract message sorting/pagination.

### Thread View Experience
- `app/thread/[threadId]/page.tsx` fetches `getThreadDetails`, displays the original question + replies via `ThreadView`, and wires reply composer to SignalR (passing `parentThreadId`).
- Shows location + connection status badges and links back to scan/room.
- TODO: fetch the parent room id for better "Back to room" navigation, add optimistic reply UI.

### Voting & Tagging
- `VoteButtons` provides ▲/▼ controls with highlighted state hooks ready for future user-specific vote tracking.
- `TagSelector` highlights the `location_specific_question` tag so messages can spawn threads via API/SignalR.

### Custom Hooks
- `useSignalR` is live; it abstracts connection start/stop, event wiring, `sendMessage`, and `voteMessage`.
- Future hooks: `useAuth` (to centralize initialization/redirects), `useMessages` (pagination + optimistic updates), `useVoting` (per-user vote caching).

---

## 🔌 Backend Integration Plan

When your partner's Azure backend is ready:

### Step 1: Install Real SignalR Client
```bash
npm install @microsoft/signalr
```

### Step 2: Update Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://socialapp-backend.azurewebsites.net
NEXT_PUBLIC_SIGNALR_URL=https://socialapp-backend.azurewebsites.net/hubs/chat
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Step 3: Replace Mock API with Real Fetch Calls
In `lib/api.ts`, replace mock implementations:

```typescript
export const api = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      // existing mock code
    }

    // Real implementation:
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  // ... repeat for all other endpoints
};
```

### Step 4: Replace Mock SignalR with Real Client
Create `lib/signalr.ts`:

```typescript
import * as signalR from '@microsoft/signalr';

export class RealSignalRClient {
  private connection: signalR.HubConnection;

  constructor(accessToken: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}`, {
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  // Same interface as MockSignalRClient
  async start() { await this.connection.start(); }
  on(event: string, handler: Function) { this.connection.on(event, handler); }
  async invoke(method: string, ...args: any[]) {
    await this.connection.invoke(method, ...args);
  }
  stop() { this.connection.stop(); }
}
```

### Step 5: Update Hook to Use Real Client
In `hooks/useSignalR.ts`:

```typescript
import { USE_MOCK } from '@/lib/config';
import { MockSignalRClient } from '@/lib/mockSignalR';
import { RealSignalRClient } from '@/lib/signalr';

export const useSignalR = (roomId: string) => {
  const { token } = useAuthStore();

  const client = USE_MOCK
    ? new MockSignalRClient(token!)
    : new RealSignalRClient(token!);

  // Rest of hook logic stays the same
};
```

### Step 6: Verify Type Compatibility
Ensure backend API responses match TypeScript types in `types/`. If there are mismatches, update types or add transformers.

### Step 7: Test Integration
1. Login with real account
2. Scan real QR code
3. Send messages through real SignalR
4. Verify AI responses appear
5. Test voting system

**Expected Changes:** Minimal. Only `lib/api.ts` and SignalR client need updates. All UI components remain unchanged.

---

## 🚀 Running the Project

### Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Build (Production)
```bash
npm run build
# Creates optimized production build in .next/
```

### Type Check
```bash
npx tsc --noEmit
# Checks TypeScript types without building
```

### Linting
```bash
npm run lint
# Runs ESLint
```

---

## 📋 Next Steps (Priority Order)

### Recently Completed
- ✅ Authentication flows (login, signup, anonymous) with reusable forms.
- ✅ QR Scanner experience with camera onboarding + mock shortcuts.
- ✅ Chat Room experience (SignalR hook, message/vote/thread components).
- ✅ Thread View page with reply composer + AI response rendering.
- ✅ Voting + tagging controls.

### High Priority (MVP Polish)
1. ⏳ **`useAuth` & Guard Layer** — centralize auth initialization + protect routes automatically.
2. ⏳ **`useMessages` / `useVoting` Hooks** — encapsulate pagination, optimistic updates, and per-user vote caching.
3. ⏳ **Error & Loading States** — shared skeletons/spinners and toast-level error handling for SignalR/API failures.

### Medium Priority (Enhanced UX)
4. ⏳ **Responsive QA** — tighten breakpoints for small phones + large desktops.
5. ⏳ **Testing** — add Jest + RTL smoke tests for auth, QR shortcuts, message composer, thread reply.
6. ⏳ **Accessibility Sweep** — focus states for buttons, aria labels for QR scanner, semantic headings.

### Low Priority (Pre-Backend)
7. ⏳ **Persisted Mock Sessions** — ensure Zustand rehydrates across refresh using `initialize()` flows.
8. ⏳ **Toast/Notification System** — to surface thread creation + AI completion events.
9. ⏳ **Docs** — expand TECHNICAL_IMPLEMENTATION with new API endpoints (`getRoom`, `getThreadDetails`).

---

## 🎯 Success Criteria

### MVP Ready When:
- ✅ Users can create account or go anonymous
- ✅ Users can scan QR code (or skip for demo)
- ✅ Users can see real-time chat with mock data
- ✅ Users can send messages with tags
- ✅ Users can vote on messages
- ✅ AI responses appear after 3 seconds (mocked)
- ✅ Thread creation works for tagged messages
- ✅ UI is responsive and polished

### Backend Integration Ready When:
- ✅ Mock flag can be toggled via environment variable
- ✅ API calls go through abstraction layer
- ✅ SignalR client is swappable
- ✅ TypeScript types match backend schema
- ✅ No hard-coded mock data in UI components

---

## 🐛 Known Issues / Limitations

1. **Camera Access:** QR scanner requires HTTPS or localhost. Works in development, may need configuration for production.

2. **Mock Limitations:**
   - Messages don't persist across page refreshes (real backend will fix)
   - Anonymous session lost on browser close (intentional)
   - AI responses are random text (real backend will use Azure OpenAI)

3. **No Real-Time Across Tabs:** Mock SignalR only updates current tab. Real SignalR will sync across all connected clients.

4. **Geofencing Not Implemented:** Location verification exists in code but not UI. QR codes are primary access method.

---

## 📚 Key Files Reference

### Must Read Before Building:
1. `TECHNICAL_IMPLEMENTATION.md` - Full technical specification
2. `CLAUDE.md` - Development guidance for Claude Code
3. `types/` - All TypeScript interfaces (matches backend schema)

### Key Implementation Files:
- `lib/api.ts` - All API endpoints (mock implementations)
- `lib/mockSignalR.ts` - Real-time simulation
- `store/authStore.ts`, `chatStore.ts`, `roomStore.ts` - State management
- `components/ui/` - Reusable UI components

### Configuration Files:
- `.env.local` - Environment variables (gitignored)
- `.env.example` - Template for environment variables
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration

---

## 🤝 Working with Your Backend Partner

### What You Need From Backend:
1. **API Base URL** - e.g., `https://socialapp-backend.azurewebsites.net`
2. **SignalR Hub URL** - e.g., `https://socialapp-backend.azurewebsites.net/hubs/chat`
3. **API Response Shapes** - Confirm they match your TypeScript types
4. **SignalR Event Names** - Confirm they match (MessageReceived, ThreadCreated, etc.)
5. **Authentication Flow** - JWT in Authorization header or query param?

### What You'll Provide to Backend:
1. **Type Definitions** - Send them `types/` folder for C# model generation
2. **API Endpoint List** - From `lib/api.ts` comments
3. **SignalR Hub Methods** - From `lib/mockSignalR.ts` comments
4. **Sample Payloads** - JSON examples from mock data files

### Integration Day Checklist:
- [ ] Update `.env.local` with real URLs
- [ ] Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
- [ ] Test login endpoint
- [ ] Test QR verification endpoint
- [ ] Install `@microsoft/signalr`
- [ ] Replace mock SignalR with real client
- [ ] Test message sending through real SignalR
- [ ] Test voting system
- [ ] Test AI response generation
- [ ] Test thread creation

---

## 📞 Getting Help

### TypeScript Errors:
- Check type definitions in `types/`
- Ensure imports from `@/types` work
- Use `npx tsc --noEmit` to see all type errors

### Tailwind Not Working:
- Verify `globals.css` has `@tailwind` directives
- Check `tailwind.config.ts` content paths
- Restart dev server after config changes

### Mock Data Issues:
- Check `lib/mock/` files
- Ensure `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- Clear localStorage if needed: `localStorage.clear()`

### State Not Updating:
- Check Zustand store usage
- Verify store actions are called
- Use React DevTools to inspect store state

---

**End of Progress Document**

*This file will be updated as development progresses. Last update: Auth + QR + chat/thread flows implemented with mock SignalR + mock data.*
