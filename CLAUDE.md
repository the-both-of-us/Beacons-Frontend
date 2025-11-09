# Frontend Guardrails

## High-Level
- Next.js App Router (React 18) + Tailwind CSS, TypeScript strict.
- No mock data, no feature flags. Everything talks to the ASP.NET backend through `lib/api.ts` (REST) and `hooks/useChatHub.ts` (SignalR).
- Pages that matter today: `/` (marketing hero), `/scan` (room directory), `/room/[roomId]` (chat surface).

## Data Flow
1. `lib/api.ts` wraps the backend REST endpoints (`/api/rooms`, `/api/rooms/{id}`, `/api/rooms/{id}/messages`). Keep it tiny and stateless.
2. `hooks/useChatHub.ts` owns the SignalR connection: build the hub URL from `NEXT_PUBLIC_SIGNALR_URL` (falls back to `${NEXT_PUBLIC_API_URL}/chatHub`), join a room, stream history + live messages.
3. UI components (`components/chat/*`) should stay dumb – they receive plain props from pages/containers.

## Coding Standards
- Keep everything client-side unless data can be fetched on the server without credentials (right now the pages are client components for simplicity).
- Use React hooks + local state (no Zustand) until we actually need shared state.
- When you add new API calls, centralize them in `lib/api.ts` and create types in `types/`.
- Prefer small, composable UI components; stick to Tailwind utilities already defined in `app/globals.css`.

## SignalR Tips
- Always register handlers before calling `connection.start()`.
- Map backend DTOs to our `Message` type immediately so the rest of the app never sees raw payloads.
- Handle `onreconnecting` / `onreconnected` to keep the UI badge accurate and to rejoin the room automatically.

## Environment
```
NEXT_PUBLIC_API_URL=http://localhost:5211
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5211/chatHub
```
Override them per environment; no other flags needed.

## Definition of Done
- Rooms list + chat room continue to work against `dotnet run`.
- No references to removed mock files or feature flags creep back in.
- Error states (fetch failures, SignalR disconnects) surface helpful messaging.
