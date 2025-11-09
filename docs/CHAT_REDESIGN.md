# Chat Experience Redesign

Status: draft ◦ Owner: frontend team ◦ Last updated: 2025-11-09

## 1. Goals
- Make the chat experience resilient and legible when hundreds of messages, tags, and AI replies pile up.
- Treat threads as first-class citizens with their own lifecycle (create, peek, expand, follow).
- Centralize tag UX so AI-triggering tags, filters, and moderation queues stay consistent.
- Decouple network/socket plumbing from rendering so we can iterate quickly on layout and mobile/desktop treatments.

---

## 2. Current-State Review

| Area | Findings | References |
| --- | --- | --- |
| Layout | `app/page.tsx` + `components/chat/ChatRoom.tsx:15-211` mixes hero marketing, data fetching, connection state, message orchestration, and UI. No room for dedicated panes (threads, composer states, AI suggestions). | `Social-app-frontend/app/page.tsx`, `components/chat/ChatRoom.tsx` |
| State & Data | Messages and threads are stored in local `useState` arrays (`ChatRoom.tsx:17-101`). There is no normalization, pagination, or cache. Every SignalR event mutates large arrays, leading to duplicate renders and buggy thread stats. | same |
| Threads | `MessageItem.tsx:21-92` relies on booleans (`isThreadStarter`, `replyCount`) that the backend sometimes omits. Thread fetching is bolted on via `useChatHub().getThreadMessages` and stored inside a `Record<string, Message[]>`. No entity modeling, no optimism, and no grouping UI beyond inline expansion. | `MessageItem.tsx`, `ThreadView.tsx`, `ChatRoom.tsx` |
| Tags | `MessageInput.tsx:37-112` treats tags like plain strings. Tag metadata (`enableAiResponse`, `enableThreading`) only affects chip badges, so the UI cannot enforce workflows (e.g., auto-spawn AI assistant threads for `location-specific-question`). There is no tag filtering UI in the timeline. | `MessageInput.tsx`, `types/room.ts` |
| AI Assistant | `ThreadView.tsx:17-84` fakes a loading skeleton but there is no pipeline to stream or retry AI responses. AI replies are stored as regular messages with `aiGenerated=true`, making it impossible to differentiate suggestions vs final answers vs moderation warnings. | `ThreadView.tsx`, backend lacks explicit AI endpoints |
| Networking | `useChatHub.ts:18-164` mixes connection lifecycle, DTO mapping, and cache mutation. All message history (room + thread) rides on a single hub connection but there is no reconnection replay, acking, or gap detection. REST fetches (`lib/api.ts`) do not share cache with hub events. | `hooks/useChatHub.ts`, `lib/api.ts` |

Pain points reported by users:
1. Threads randomly collapse or display stale replies (state lost on navigation).
2. AI answers feel unreliable—no indicator of progress, retries, or fallback.
3. Tags are hard to discover; no way to focus on “location-specific questions” or admin-only topics.
4. Rapid-fire rooms (200+ messages) lag because everything re-renders the whole list.

---

## 3. Proposed Architecture

### 3.1 High-Level Layout
```
┌────────────────────────────────────────────────────────────┐
│ Header: room info, audience controls, tag filters          │
├─────────────────────┬──────────────────────────────────────┤
│ Thread Rail         │ Timeline                             │
│ (followed threads,  │ (virtualized message list w/ AI      │
│ AI suggestions,     │ status, inline composer anchors)     │
│ moderation inbox)   │                                      │
├─────────────────────┴──────────────────────────────────────┤
│ Composer drawer: tag picker, AI mode toggle, attachments   │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Data & State Model
Adopt a normalized store (Zustand or TanStack Query + context) with the following entities:

| Entity | Fields | Notes |
| --- | --- | --- |
| `MessageEntity` | id, roomId, threadId, parentId, author, body, tags[], voteTotals, aiStatus (`'none' \| 'pending' \| 'answer' \| 'suggestion'`), createdAt | No booleans like `isThreadStarter`. Derive from `parentId === null`. |
| `ThreadEntity` | id, roomId, rootMessageId, replyIds[], aiRunId?, lastEventAt, status (`'open' \| 'resolved' \| 'archived'`) | Tracks membership + metadata separately from messages. |
| `TagEntity` | id, displayName, color, capabilities (`{ ai:boolean, thread:boolean, visibility:'public'|'mod' }`), description | Backed by backend room definitions. |
| `AiRun` | id, threadId, promptSummary, status, steps[], error | Allows streaming/resume. |

State slices:
- `roomSlice`: active room, participants, pinned tags, filters.
- `timelineSlice`: virtualized list of message IDs, pagination cursors.
- `threadSlice`: cache of thread entities, expanded states, follow/unfollow flags.
- `composerSlice`: current draft, selected tags, AI mode (human-only vs AI-assisted).

### 3.3 Networking Flow

| Flow | Current | New |
| --- | --- | --- |
| Initial load | REST `getRoom`, `getRoomMessages` sequential (`ChatRoom.tsx:20-57`). | Parallel fetch via React Query: `useRoom(roomId)`, `useMessages(roomId, cursor)`, cached globally. Thread summaries requested separately (`/api/rooms/{id}/threads`). |
| Real-time | Single `useChatHub` pushes entire DTOs into local state. | `useChatHub` dispatches typed events into the store: `MESSAGE_ADDED`, `THREAD_UPDATED`, `AI_PROGRESS`. Store handles dedupe and virtualization. |
| Threads | `getThreadMessages(threadId)` invoked ad hoc, results stored in component state. | Dedicated REST endpoint `/api/threads/{threadId}?cursor=...` plus hub event `THREAD_HISTORY`. Threads are cached by ID to support side-rail previews. |
| AI | No explicit API. `ThreadView` fakes loading. | Add `/api/threads/{id}/ai` to request/stream answers. UI shows run status chips, ability to retry/stop, and stores transcripts separately from human replies. |

### 3.4 Thread Experience
1. **Thread creation:** Reply action opens a side drawer with context (root message, tags, participants). Submitting either posts a reply or marks thread as “needs AI assist”.
2. **Thread rail:** Left column lists most active/followed threads with unread counts. Clicking opens the thread in a split panel without leaving the timeline.
3. **Inline preview:** Timeline shows a compact snippet (2 latest replies + AI summary). Clicking either expands inline (mobile) or focuses the thread panel (desktop).
4. **State machine:** Threads progress through states—`open` (waiting), `ai_pending`, `ai_answered`, `resolved`. Each state maps to UI badges and composer suggestions.

### 3.5 Tags & Filters
- Promote tags to the header area with chips/toggles. Selecting a tag filters the timeline and thread rail simultaneously.
- Tag definitions drive capabilities:
  - `enableThreading`: auto-open thread drawer on submit, require follow-up.
  - `enableAiResponse`: automatically kick off an AI run if no human reply arrives within N minutes.
  - `visibility`: show/hide tags to certain roles (admins, staff).
- Provide a `TagInspector` modal to explain each tag + AI behavior.

### 3.6 AI Assistant
- Introduce `AiRun` model. Every AI interaction is a run tied to a thread.
- UI states:
  1. `pending`: skeleton row, “cancel” button, ETA indicator.
  2. `streaming`: tokens appear with typing indicator.
  3. `completed`: message card with actions (copy, pin, mark as solution).
  4. `errored`: inline error with retry/resume buttons.
- Provide “Ask AI” button per thread even without tags; tag-based automation simply flips it on by default.
- Keep AI replies visually distinct and group them under an “Assistant” subheading inside the thread.

---

## 4. Component & Hook Breakdown

| Area | New Components/Hooks | Notes |
| --- | --- | --- |
| Layout | `RoomShell` (fetch room + provide contexts), `ThreadRail`, `Timeline`, `ComposerDrawer`. | `RoomShell` wraps children with providers (room, timeline, thread). |
| Timeline | `VirtualizedTimeline` (react-virtuoso), `MessageRow`, `InlineThreadPreview`. | Timeline consumes normalized store selectors, not raw arrays. |
| Threads | `ThreadPanel`, `ThreadHeader`, `ThreadRepliesList`, `ThreadActionBar`. | Panel subscribes to `threadSlice`; can dock on right or open modal on mobile. |
| Tags & Filters | `TagFilterBar`, `TagChip`, `TagInspectorModal`. | Lives in header; interacts with `timelineSlice` to filter message IDs. |
| Composer | `Composer` (rich textarea), `TagPicker`, `ThreadContextBadge`, `AiToggle`. | Composer subscribes to `composerSlice` and dispatches actions. |
| Networking | `useRoomData(roomId)`, `useMessages(roomId)`, `useThreads(roomId)` (React Query), `useChatSocket(roomId)` (stripped-down hub hook emitting events). | Hooks keep no UI state; they dispatch to the store. |
| Store | `useChatStore` (Zustand) with slices described in §3.2 plus selectors for UI. | Replaces `useState` clusters in `ChatRoom.tsx`. |

---

## 5. Implementation Roadmap

### Phase 0 – Foundations
1. Introduce Zustand (or TanStack Query + context) and scaffold `useChatStore`.
2. Refactor data fetching (`lib/api.ts`) to expose thread endpoints + tag metadata.
3. Slim down `useChatHub` to event dispatchers; migrate DTO mapping into dedicated adapters.

### Phase 1 – Layout & Timeline
1. Build `RoomShell` route wrapper that fetches room + tags before rendering.
2. Implement `VirtualizedTimeline` using store selectors. Replace `MessageList` usage.
3. Port composer into `ComposerDrawer`; wire up replies without thread panel yet.

### Phase 2 – Thread Architecture
1. Create `ThreadSlice` + `ThreadPanel`. Move reply rendering out of `MessageItem`.
2. Implement thread rail (list of active/followed threads) w/ unread badges.
3. Add new REST endpoints (`/api/threads`, `/api/threads/{id}`) or simulate until backend ready.

### Phase 3 – Tags & Filters
1. Replace inline tag chips in composer with `TagPicker`. Enforce capabilities (AI/thread gating).
2. Add header filter bar + tag inspector.
3. Connect filters to timeline selectors (e.g., show only messages tagged `location-specific-question`).

### Phase 4 – AI Assistant
1. Define `AiRun` slice + UI states (pending/streaming/completed/error).
2. Build `/api/threads/{id}/ai` integration + streaming indicator.
3. Add automation for tags that require AI, plus manual “Ask AI” button.

### Phase 5 – Polish
1. Accessibility pass (focus traps for drawers, ARIA for live regions).
2. Performance tuning: memoized selectors, virtualization thresholds, skeleton states.
3. Documentation updates + Storybook coverage for new components.

---

## 6. Backend Considerations
- Threads need dedicated endpoints:
  - `GET /api/threads?roomId={id}`
  - `GET /api/threads/{threadId}`
  - `POST /api/threads/{threadId}/follow`
  - `POST /api/threads/{threadId}/ai`
- Hub should emit granular events: `threadCreated`, `threadUpdated`, `aiRunStatusChanged`.
- Tags require richer metadata (visibility, automation rules) surfaced alongside rooms.
- AI orchestration should expose run IDs + statuses to align with the frontend `AiRun` model.

---

## 7. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Backend APIs not ready for threads-as-first-class objects. | UI blocked after Phase 2. | Stub adapters that derive `ThreadEntity` from existing messages; swap to backend endpoints later. |
| Socket event storm overwhelms store. | Performance degradation. | Use batching in `useChatSocket` (queue events, flush via `requestAnimationFrame`). |
| Mobile layout complexity. | Feature slips on phones. | Keep thread panel as modal on <768px with slide-up composer. |
| AI streaming adds long-lived requests. | Resource usage, UX weirdness. | Use SSE or WebSocket sub-channel; show explicit “Stop generating” control. |

---

## 8. Next Steps
1. Align with backend team on thread + AI endpoints and data contracts.
2. Spin up a feature branch (`feat/chat-redesign`) with scaffolding for `RoomShell` and the store.
3. Schedule design review to lock layout + visual hierarchy before implementation.

Once Phase 0 scaffolding lands, we can tackle each phase with focused PRs, ensuring regressions stay minimal while dramatically improving chat usability.
