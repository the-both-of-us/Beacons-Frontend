# Repository Guidelines

## Project Structure & Module Organization
Social-app-frontend uses the Next.js App Router. Route segments live in `app/` (`page.tsx`, `auth/`, `scan/`) with shared styles in `app/globals.css`. Reusable UI resides in `components/`, hooks in `hooks/`, platform helpers in `lib/`, Zustand slices in `store/`, and shared contracts in `types/`. Tailwind (`tailwind.config.ts`) and PostCSS set the design system—change tokens there to keep styling consistent.

## Build, Test, and Development Commands
- `npm install` — sync dependencies with `package-lock.json`.
- `npm run dev` — start Next.js on http://localhost:3000 with hot reload.
- `npm run build` — produce the optimized bundle; type and lint errors fail the run.
- `npm run start` — serve the `.next/` build; use for local smoke tests.
- `npm run lint` — run `next lint` with the shared ESLint + TypeScript config.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation. Use PascalCase for component files (`components/ProfileCard.tsx`) and camelCase for hooks (`hooks/useQrScanner.ts`). Default to server components; add `"use client"` only when browser APIs or Zustand state demands it. Compose styles with Tailwind utility classes plus `app/globals.css`, avoiding ad-hoc hex values. Run `npm run lint` before committing to catch typing and accessibility issues.

## Testing Guidelines
Automated tests are not yet in place; introduce Jest with React Testing Library inside `__tests__/` folders colocated with the feature. Mirror file names (`components/ProfileCard.test.tsx`) so intent stays obvious. Prioritize coverage for form validation, QR scanning, and Zustand stores, and log any blind spots in `PROGRESS.md`. Add an `npm run test` script and run it locally before opening a PR.

## Commit & Pull Request Guidelines
History is sparse (`tehcnical and claude mds`), so keep commits imperative and scoped, e.g., `feat: add thread reply composer`. Reference issues or roadmap items, call out environment updates, and update `.env.example` whenever `.env.local` changes. PRs should summarize the user story, enumerate major code paths, attach screenshots or GIFs for UI tweaks, and confirm `npm run lint` plus smoke tests passed before requesting review.

## Security & Configuration Tips
Store secrets only in `.env.local` and keep `.env.example` updated for onboarding. Prefix any browser-readable values with `NEXT_PUBLIC_`. Route network calls through helpers in `lib/` so credentials remain on the server and can share common headers or retries.
