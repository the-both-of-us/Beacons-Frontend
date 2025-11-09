# Beacons Frontend - Technical Implementation

## Architecture Overview

Beacons frontend is a Next.js 14+ application using React 18 with TypeScript. It provides a location-based chat interface with real-time messaging via SignalR, authentication via Google OAuth, and a modern UI built with Tailwind CSS.

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Runtime**: React 18
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Real-time**: SignalR WebSocket
- **Auth**: Auth.js (NextAuth.js)
- **HTTP Client**: Fetch API
- **State**: React Context (no global state library)

## Core Architecture

### Pages

**`/` (Home/Marketing)**
- Hero section with Beacons branding
- Room list with join functionality
- Authentication status in header

**`/login` (Authentication)**
- "Welcome to Beacons" messaging
- Google OAuth sign-in
- Sign-out functionality

**`/scan` (QR Code Scanner)**
- Camera-based QR code scanning
- Room discovery via QR codes
- Access token storage for room entry

**`/room/[roomId]` (Chat)**
- Real-time message display with threading
- Message input with tags
- Voting system
- AI response indicators
- Connection status badge

**`/admin` (Admin Dashboard)**
- Room management
- Admin user management
- QR code management

### Context & Hooks

#### AuthContext (`context/AuthContext.tsx`)
Manages authentication state:
- Google OAuth session (via Auth.js)
- User info and role (admin detection)
- Login/logout functions
- Token management

**Integration**: Validates admin status via `api.getCurrentAdminStatus()` on authenticated change

#### useChatHub (`hooks/useChatHub.ts`)
SignalR connection management:
- Auto-connection on room join
- Message history retrieval
- Real-time message streaming
- Vote updates
- Thread message loading
- Reconnection logic

**Connection URL**: `NEXT_PUBLIC_SIGNALR_URL` (defaults to `${NEXT_PUBLIC_API_URL}/chatHub`)

### UI Components

**Toast System** (`components/ui/Toast.tsx`)
- Context-based notifications
- Variants: success, error, warning, info
- Auto-dismiss (3000ms default)
- Provider in `app/providers.tsx`

**Button** (`components/ui/Button.tsx`)
- Variants: primary, secondary, outline, ghost
- Sizes: sm, md, lg
- Clean design with shadows and active states (no gradients)

**Card** (`components/ui/Card.tsx`)
- CardHeader, CardTitle, CardContent
- Hover effects, rounded corners
- Transition animations

**ErrorState** (`components/ui/ErrorState.tsx`)
- Reusable error display
- Variants: error, warning, info
- Recovery actions (retry, go back)

**Skeleton** (`components/ui/Skeleton.tsx`)
- Loading placeholders
- MessageSkeleton, RoomListSkeleton, ChatHeaderSkeleton
- Pulse animation

### Chat Components

**ChatRoom** (`components/chat/ChatRoom.tsx`)
Main chat interface:
- Header with room info and connection status
- Message list with threading
- Message input with tag support
- Reply functionality
- Voting system
- Error states
- Mobile-optimized two-row header

**MessageList** (`components/chat/MessageList.tsx`)
Message rendering:
- Top-level messages sorted by timestamp
- Thread replies with AI-first sorting
- Vote counts and buttons
- Reply indicators

**MessageInput** (`components/chat/MessageInput.tsx`)
Message composition:
- Textarea with tag selector
- Reply context display
- Character limit feedback
- Submit handling

## Integration Points

### Backend Communication

**REST API** (`lib/api.ts`):
```typescript
export const api = {
  getRoom(roomId: string)
  getRoomMessages(roomId: string)
  getAllRooms()
  voteMessage(roomId, messageId, voteType, voterId)
  getCurrentAdminStatus()
}
```

**SignalR WebSocket** (`hooks/useChatHub.ts`):
```
Connection: wss://[backend-url]/chatHub?access_token=[idToken]

Sent events:
- JoinRoom(roomId, recaptchaToken)
- LeaveRoom(roomId)
- SendMessage(SendMessageDto)
- VoteMessage(messageId, voteType)
- GetThreadMessages(threadId, limit?)

Received events:
- AssignedUsername(username, roles, isAuthenticated)
- ReceiveMessageHistory(messages[])
- ReceiveMessage(message)
- ReceiveThreadMessages(threadId, messages[])
- VoteUpdated(voteUpdate)
- UserJoined(username)
- UserLeft(username)
- Error(message)
```

### Authentication Flow

1. **Page Load**: `AuthProvider` wraps app
2. **Session Check**: `useSession()` from Auth.js
3. **Role Verification**: Call `api.getCurrentAdminStatus()` if authenticated
4. **WebSocket**: Pass `idToken` in connection query parameter
5. **Backend Validation**: Backend validates Google OAuth token
6. **Vote Attribution**: Backend uses authenticated `UserId`

**Protected Actions**:
- Voting requires authentication (shows toast if not signed in)
- Admin pages check `isAdmin` flag

### Data Flow

```
Component State
    ↓
useAuth() → AuthContext
    ↓
useChatHub() → SignalR WebSocket
    ↓
Backend SignalR Hub ↔ Cosmos DB
```

## Performance Optimizations

### Code Splitting
- Each page is a separate bundle
- Dynamic imports for heavy components

### Message Rendering
- useMemo for message organization (top-level vs threaded)
- Efficient list rendering
- Skeleton loading states

### Real-time Updates
- SignalR handles incremental updates
- No page refreshes on message arrival
- Optimistic UI for votes

## Mobile Responsive Design

**Two-Row Header** (mobile):
- Row 1: Room title + connection status
- Row 2: Navigation buttons
- Reduced font sizes: `text-[10px]` (sm), `text-xs` (regular)

**Flexible Layout**:
- Single column on mobile
- Full width utilization
- Touch-friendly button sizes

## Configuration

**Environment Variables**:
```
NEXT_PUBLIC_API_URL=http://localhost:5211
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5211/chatHub
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

**Constants**:
- Message max length: 2000 characters
- Toast auto-dismiss: 3000ms
- SignalR reconnection: auto

## Error Handling

- **Auth Errors**: Toast notifications with clear messaging
- **Network Errors**: Error state component with retry
- **Validation Errors**: Toast notifications
- **SignalR Disconnects**: Automatic reconnection with status badge
- **Message Send Failures**: Toast with error details

## State Management

**No Zustand/Redux** - Only React Context for:
- Authentication (AuthContext)
- Notifications (ToastContext)
- Component-level state (useState)

**Rationale**: Simple requirements, Context sufficient

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- WebSocket support required
- LocalStorage for token persistence

## Development

**Install dependencies**:
```bash
npm install
```

**Run dev server**:
```bash
npm run dev
```

**Build for production**:
```bash
npm run build
npm start
```

**Type checking**:
```bash
npm run type-check
```

## Deployment

1. Set environment variables in deployment platform
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or containerized platform
4. Ensure backend URL is accessible
5. Configure NEXTAUTH_URL for OAuth redirect

## Code Organization

```
app/                    # Pages and layouts
├── page.tsx           # Home
├── login/             # Auth page
├── room/[roomId]/     # Chat page
├── scan/              # QR scanner
├── admin/             # Admin dashboard
├── api/auth/          # OAuth route
└── layout.tsx         # Root layout

components/
├── ui/                # Reusable components
├── chat/              # Chat-specific components
├── admin/             # Admin-specific components
└── auth/              # Auth-specific components

context/               # React Context
hooks/                 # Custom hooks (useChatHub, etc)
lib/                   # Utilities (api client, auth, utils)
types/                 # TypeScript types
```

## Key Design Decisions

1. **No gradients**: Clean shadows and solid colors for professional look
2. **Context over Redux**: Simpler state management for current needs
3. **Server components off**: Client-side rendering for real-time interactivity
4. **SignalR over polling**: Efficient real-time updates
5. **Toast notifications**: Non-blocking feedback instead of redirects

## Future Improvements

- Message search and filtering
- User presence indicators
- Message reactions/emojis
- Room bookmarking
- Message pagination/infinite scroll
- Avatar support
- Typing indicators
- Read receipts
