# Implementation Plan: game-merge

## Overview

Incrementally migrate the `game` project into `mcp-lab` in five phases: (1) backend merge, (2) frontend asset and CSS setup, (3) Soul Drink port, (4) Audit port, (5) hub page and route restructure. Each phase leaves the project in a runnable state.

## Tasks

- [x] 1. Merge backend: extend serverless.yml and src/index.ts

  - [x] 1.1 Add souldrink-stats and audit-verdicts DynamoDB table definitions to `mcp-lab/backend/serverless.yml`
    - Copy the `SoulDrinkStatsTable` resource block (TableName: `souldrink-stats`, key: `result_id`, PROVISIONED 1/1 RCU/WCU) from `game/backend/serverless.yml`
    - Copy the `AuditVerdictsTable` resource block (TableName: `audit-verdicts`, key: `verdict_id`, TTL on `ttl_expires_at`) from `game/backend/serverless.yml`
    - Add both table ARNs to the existing IAM role `Resource` list
    - Add environment variables `SOUL_DRINK_TABLE: souldrink-stats`, `AUDIT_VERDICTS_TABLE: audit-verdicts`, `AUDIT_VERDICT_TTL_DAYS: '30'` to the provider environment block
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 1.2 Add Soul Drink API routes to `mcp-lab/backend/src/index.ts`
    - Add `POST /api/stats` — increment `result_id` count in `souldrink-stats` using `UpdateCommand` with `ADD #count :inc` (port from `game/backend/index.ts`)
    - Add `GET /api/stats/:id` — fetch count for a specific `result_id` from `souldrink-stats` using `GetCommand`
    - Read table name from `process.env.SOUL_DRINK_TABLE`
    - _Requirements: 8.1, 8.2_

  - [x] 1.3 Add Audit API routes to `mcp-lab/backend/src/index.ts`
    - Add `POST /api/audit/verdict` — PutItem to `audit-verdicts` with TTL calculation (port from `game/backend/index.ts`)
    - Add `GET /api/audit/verdict/:verdictId` — GetItem from `audit-verdicts`, return 404 if not found
    - Add `POST /api/audit/impression` — log impression body, return `{ success: true }`
    - Read table name from `process.env.AUDIT_VERDICTS_TABLE` and TTL days from `process.env.AUDIT_VERDICT_TTL_DAYS`
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 1.4 Verify Dev Persona routes still compile and no TypeScript errors exist in `mcp-lab/backend/src/index.ts`
    - Run `npm run build` in `mcp-lab/backend` and confirm it exits cleanly
    - _Requirements: 8.6_

- [x] 2. Checkpoint — Backend compiles cleanly
  - Run `npm run build` in `mcp-lab/backend`. Ensure it exits with no errors. Ask the user if anything is unclear before continuing.

- [x] 3. Frontend setup: assets, CSS, test infrastructure

  - [x] 3.1 Copy public assets from game to mcp-lab frontend
    - Copy `game/frontend/public/nanobanana_mascot.png` → `mcp-lab/frontend/public/nanobanana_mascot.png`
    - Copy `game/frontend/public/banana_espresso.png`, `banana_matcha.png`, `banana_sesame.png`, `banana_tropical.png` → `mcp-lab/frontend/public/`
    - Copy `game/frontend/public/icons.svg` → `mcp-lab/frontend/public/icons.svg`
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Merge game CSS utilities into `mcp-lab/frontend/src/app/globals.css`
    - Append `@import url(...)` for Outfit and Prompt Google Fonts
    - Append Audit CSS custom properties (`--audit-bg`, `--audit-red`, `--audit-purple`, `--audit-gold`) under `:root`
    - Append `@keyframes float`, `@keyframes pulse-glow`, `.animate-float`, `.animate-glow`
    - Append `.glass-card`, `.banana-btn`, `.apple-btn` utility classes
    - Do NOT copy Vite scaffold classes (`.counter`, `.hero`, `#center`, `#next-steps`, `.ticks`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.3 Add vitest test infrastructure to `mcp-lab/frontend`
    - Add to `package.json` devDependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitest/coverage-v8`, `jsdom`, `fast-check`
    - Create `mcp-lab/frontend/vitest.config.ts` with `environment: 'jsdom'`, `globals: true`, and `setupFiles` pointing to a jest-dom setup file
    - Create `mcp-lab/frontend/src/test-setup.ts` that imports `@testing-library/jest-dom`
    - _Requirements: 11.1, 11.2_

- [x] 4. Port Soul Drink game to Next.js

  - [x] 4.1 Copy Soul Drink source files into mcp-lab frontend
    - Create directory `mcp-lab/frontend/src/soul-drink/`
    - Copy `game/frontend/src/components/QuestionCard.tsx` → `mcp-lab/frontend/src/soul-drink/components/QuestionCard.tsx`
    - Copy `game/frontend/src/components/ResultCard.tsx` → `mcp-lab/frontend/src/soul-drink/components/ResultCard.tsx`
    - Copy `game/frontend/src/data/questions.ts` → `mcp-lab/frontend/src/soul-drink/data/questions.ts`
    - Fix import paths within copied files if needed
    - _Requirements: 2.2_

  - [x] 4.2 Create `mcp-lab/frontend/src/app/soul-drink/page.tsx`
    - Add `'use client'` directive
    - Port `SoulDrinkRoot` function from `game/frontend/src/App.tsx` as the default export
    - Replace `import.meta.env.VITE_API_URL` with `process.env.NEXT_PUBLIC_API_URL`
    - Replace `import { Link } from 'react-router-dom'` with `import Link from 'next/link'`
    - Replace `<Link to="...">` with `<Link href="...">`
    - Update import paths for QuestionCard, ResultCard, and questions data to point to `../../soul-drink/...`
    - Confirm image `src` values use root-relative paths (`/nanobanana_mascot.png`, `/banana_*.png`)
    - _Requirements: 2.2, 3.1, 3.2, 4.2, 4.4, 5.3_

- [x] 5. Port Audit game to Next.js

  - [x] 5.1 Copy Audit source files into mcp-lab frontend
    - Create directory `mcp-lab/frontend/src/audit/` (and subdirectories: `components/`, `data/`, `pages/`, `__tests__/`)
    - Copy all files from `game/frontend/src/audit/` recursively into `mcp-lab/frontend/src/audit/`
    - This includes: `AuditGame.tsx`, `state.ts`, `types.ts`, `tokens.ts`, `verdictCalculator.ts`, `abTest.ts`, all files under `components/`, `data/`, `pages/`, `__tests__/`
    - _Requirements: 2.3, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 5.2 Update Audit source files: replace react-router-dom with next/navigation and fix API URLs
    - In `mcp-lab/frontend/src/audit/pages/ChallengePage.tsx`:
      - Replace `import { Link, useParams } from 'react-router-dom'` with `import Link from 'next/link'` and `import { useParams } from 'next/navigation'`
      - Replace `<Link to="...">` with `<Link href="...">`
      - Replace all bare `fetch('/api/audit/verdict/...')` calls with `` `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audit/verdict/...` ``
    - In `mcp-lab/frontend/src/audit/AuditGame.tsx`:
      - Replace `fetch('/api/audit/verdict', ...)` with `` fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audit/verdict`, ...) ``
    - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.3, 4.5_

  - [x] 5.3 Create `mcp-lab/frontend/src/app/audit/page.tsx`
    - Add `'use client'` directive
    - Import and render `<AuditGame />` from `../../audit/AuditGame`
    - _Requirements: 2.3_

  - [x] 5.4 Create `mcp-lab/frontend/src/app/audit/[verdictId]/challenge/page.tsx`
    - Add `'use client'` directive
    - Import and render `<ChallengePage />` from `../../../../audit/pages/ChallengePage`
    - _Requirements: 2.4, 3.4_

  - [x]* 5.5 Run ported audit unit tests
    - Run `npx vitest run` in `mcp-lab/frontend` and confirm all tests in `src/audit/__tests__/` pass
    - Fix any import path issues introduced by the directory move
    - _Requirements: 11.3, 11.4_

- [x] 6. Checkpoint — Audit and Soul Drink pages render without TypeScript errors
  - Run `npm run build` in `mcp-lab/frontend`. Ensure no TypeScript or build errors. Ask the user if anything is unclear.

- [x] 7. Create Hub page and move Dev Persona

  - [x] 7.1 Move Dev Persona to `/dev-persona`
    - Create directory `mcp-lab/frontend/src/app/dev-persona/`
    - Move `mcp-lab/frontend/src/app/page.tsx` to `mcp-lab/frontend/src/app/dev-persona/page.tsx`
    - Confirm file content is unchanged (already uses `process.env.NEXT_PUBLIC_API_URL`)
    - _Requirements: 2.1_

  - [x] 7.2 Create new Hub page at `mcp-lab/frontend/src/app/page.tsx`
    - Create a `'use client'` page that renders three game cards
    - Card 1 — Dev Persona: title, short description (Thai), `<Link href="/dev-persona">` CTA button
    - Card 2 — Soul Drink: title, mascot image (`/nanobanana_mascot.png`), short description, `<Link href="/soul-drink">` CTA button
    - Card 3 — Audit: title, short description, `<Link href="/audit">` CTA button
    - Use the existing dark background and glassmorphism styles from `globals.css` (`glass`, `glass-premium`, `--audit-bg`)
    - Use `framer-motion` for card entrance animations (already in mcp-lab dependencies)
    - Do NOT import from `react-router-dom`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1_

  - [x] 7.3 Update `layout.tsx` metadata
    - Change `title` from `"Create Next App"` to a title that reflects the multi-game hub (e.g., `"NanoBanana Lab"`)
    - Update `description` accordingly
    - _Requirements: 1.4_

- [x] 8. Final checkpoint — Full build and test pass
  - Run `npm run build` in `mcp-lab/frontend` and `npm run build` in `mcp-lab/backend`. Both must exit cleanly.
  - Run `npx vitest run` in `mcp-lab/frontend` and confirm all tests pass.
  - Ask the user if questions arise before considering the merge complete.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster iteration (tests can be run manually after).
- All three games share the single `NEXT_PUBLIC_API_URL` environment variable — set this in Cloudflare Pages to the merged API Gateway URL after the backend is deployed.
- The `game` repository is kept as-is; this spec only modifies `mcp-lab`.
- Property tests for `calculateVerdict` and `auditReducer` are covered by the ported unit tests (which already test the property boundaries explicitly). If full property-based testing with `fast-check` is desired, it can be added on top of the ported test files using the installed `fast-check` package.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4", "5"] },
    { "wave": 5, "tasks": ["6"] },
    { "wave": 6, "tasks": ["7"] },
    { "wave": 7, "tasks": ["8"] }
  ]
}
```

- Task 1 (backend merge) is independent of frontend work and can proceed first.
- Task 2 (backend checkpoint) gates further work on confirming the backend builds.
- Task 3 (frontend setup) provides assets, CSS, and test infra needed by tasks 4 and 5.
- Tasks 4 and 5 (Soul Drink and Audit ports) can proceed in parallel after task 3.
- Task 6 (frontend checkpoint) gates the hub work in task 7.
- Task 7 (hub + Dev Persona move) depends on all game pages existing (tasks 4, 5).
- Task 8 (final checkpoint) runs after all code changes are complete.
