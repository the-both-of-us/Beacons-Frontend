# Repository Guidelines

## Project Structure & Module Organization
Social-app-frontend uses the Next.js App Router. Route segments live in `app/` (`page.tsx`, `scan/`, `room/[roomId]/`). Reusable UI stays in `components/` (chat + shared UI), hooks sit inside `hooks/`, and platform helpers inside `lib/`. Tailwind (`app/globals.css`, `tailwind.config.ts`) drives styling.

## Build, Test, and Development Commands
- `npm install` — install deps (e.g., `@microsoft/signalr`, `next-auth` for Google Auth.js login).
- `npm run dev` — start Next.js on http://localhost:3000.
- `npm run build` — production bundle; fails on type errors.
- `npm run lint` — `next lint` (add an `.eslintrc` if prompted).

## Coding Style & Naming Conventions
- TypeScript + functional React components with hooks/local state (no Zustand currently).
- Client components only when using browser APIs/SignalR; otherwise prefer server components.
- Use Tailwind utility classes + `app/globals.css`; avoid inline styles.
- Keep network calls centralized in `lib/api.ts`; never call `fetch` directly from components.

## Testing Guidelines
Still manual: run the backend (`dotnet run`) + frontend (`npm run dev`), then exercise `/scan` and `/room/[roomId]`. When you add automated tests, colocate them (`componentName.test.tsx`) and log coverage gaps in `PROGRESS.md`.

## Commit & PR Guidelines
- Scope commits clearly (`feat: add chat reconnection badge`).
- Mention environment changes (API URLs, SignalR endpoints) in the PR description.
- Attach screenshots/GIFs for UI tweaks and call out manual verification steps.

## Security & Configuration Tips
- All runtime config is via `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SIGNALR_URL`, the reCAPTCHA site key (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`), Auth.js vars (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`), plus `ADMIN_EMAILS` for role assignments. Keep `.env.example` in sync.
- No secrets belong in the repo. Browsers should only see `NEXT_PUBLIC_*` values.
- When enabling new backend endpoints, update `lib/api.ts` instead of inlining `fetch` calls.
