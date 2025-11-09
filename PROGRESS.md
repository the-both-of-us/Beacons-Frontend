# Social App Frontend – Progress Log

**Last Updated:** November 8, 2025  
**Status:** Next.js client now consumes the live ASP.NET backend (rooms + SignalR chat)

---

## 🚀 What Works
- **Room Directory (`/scan`)** – Authenticated users can scan QR codes or browse live rooms pulled from `/api/rooms`. The QR tab pipes scans into `/api/qrcodes/verify/{code}` and routes to the validated room.
- **Chat View (`/room/[roomId]`)** – Loads room metadata + history from the REST API, then joins `/chatHub` with a bearer token so live messaging, vote updates, and AI responses stream in securely.
- **Realtime Messaging & Voting** – SignalR handles message delivery while REST `/api/messages/{id}/vote` records votes (with a hub fallback). Vote deltas broadcast via `VoteUpdated`.
- **Room Tags & AI** – Admins define tags (color + AI/thread toggles) when creating rooms. The composer surfaces those tags so users can trigger “Location Specific Q” flows that feed into Claude when `ANTHROPIC_API_KEY` is set.
- **Authentication** – MSAL-powered sign-in/out (`/login`, AuthStatus banner, RequireAuth states on `/scan`, `/room`, `/admin`) acquires Azure AD tokens, injects them into every fetch, and into SignalR via `accessTokenFactory`.
- **QR Code System** – Full lifecycle: admin QR creation/preview/download, browse/list/deactivate, plus the camera scanner in `/scan`.

## 🔧 Dev Workflow
1. **Backend** – `cd Social-app-backend/SocialApp && dotnet run` (ensure Cosmos + SignalR settings are loaded).
2. **Frontend** – `cd Social-app-frontend && npm install && npm run dev` (set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SIGNALR_URL` if you aren’t on localhost:5211).
3. **Test Flow** – Visit `http://localhost:3000/scan`, pick a room, send a few messages, and watch them appear in multiple browser tabs and the lightweight test harness.

## 📁 Key Files
- `lib/api.ts` – REST API wrapper (rooms, messages, and QR codes endpoints).
- `hooks/useChatHub.ts` – Shared SignalR hook; handles connection lifecycle and event mapping.
- `components/chat/*` – Presentational layer for the chat room (list + input).
- `components/qr/*` – QR code components (scanner, display).
- `components/admin/*` – Admin UI components (room manager, QR code manager, modals).
- `app/scan/page.tsx` – Room catalog page with QR scanner tab and browse rooms tab.
- `app/admin/page.tsx` – Admin dashboard for managing rooms and QR codes.
- `types/qrcode.ts` – TypeScript types for QR code data structures.

## ✅ Done vs. ⏭️ Next
| Area | Status | Notes |
| --- | --- | --- |
| Remove mocks/feature flags | ✅ | Deleted `lib/mock/`, Zustand stores, QR/auth/thread stubs. |
| Room list hooked to backend | ✅ | `/scan` now lists real rooms with join CTA. |
| SignalR integration | ✅ | Uses official client, auto-rejoins on reconnect. |
| QR Code System | ✅ | Full implementation: camera scanning, generation, admin UI, validation, print/download. Backend: QR model, service, controller. Frontend: Scanner component, display component, admin pages. |
| Admin Dashboard | ✅ | `/admin` page with tabs for managing rooms and QR codes. Create, view, deactivate QR codes. |
| Authentication & secure fetches | ✅ | MSAL login/logout, token injection, SignalR accessToken factory, gated routes. |
| Thread UI & AI polish | ⏭️ | Thread viewer + AI transcript UI still pending; backend supports it but frontend needs dedicated UX. |

## 📝 Follow-ups
- Hardening: add error toasts + retry UI for SignalR disconnects.
- UX: paginate long histories (backend currently returns 1 hour, but client still scrolls entire payload).
- Docs: If additional backend endpoints land (auth, QR, AI answers), extend `lib/api.ts` and reintroduce UI affordances.

---
Need anything else? Ping #frontend in Slack.
