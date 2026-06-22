# Requirements Document

## Introduction

This document specifies the requirements for merging the `game` project into `mcp-lab`. The merge absorbs two games (Soul Drink and Self-Deception Audit) from a Vite + React project into the mcp-lab Next.js App Router frontend, and combines the `souldrink-backend` serverless service into the `dev-persona-backend` service. The result is a single repository, single frontend deployment, and single Lambda function serving all three games.

## Glossary

- **Hub**: The new root page (`/`) of the mcp-lab frontend that lists all three games.
- **Dev_Persona**: The existing quiz at mcp-lab, moved from `/` to `/dev-persona`.
- **Soul_Drink**: The banana-drink quiz ported from the game project, hosted at `/soul-drink`.
- **Audit**: The Self-Deception Audit game ported from the game project, hosted at `/audit`.
- **Challenge_Page**: The page at `/audit/[verdictId]/challenge` that lets a second user compare verdicts.
- **Merged_Backend**: The single Hono Lambda in `mcp-lab/backend` that serves API routes for all three games after the merge.
- **Frontend**: The Next.js 16 App Router application in `mcp-lab/frontend`.
- **App_Router**: Next.js file-based routing convention using the `app/` directory.
- **NEXT_PUBLIC_API_URL**: The environment variable used by the frontend to construct API base URLs.

---

## Requirements

### Requirement 1: Game Hub

**User Story:** As a user, I want a single landing page that shows all three available games, so that I can easily discover and navigate to any game from one place.

#### Acceptance Criteria

1. THE Hub SHALL display a navigation card for each of the three games: Dev Persona, Soul Drink, and Audit.
2. WHEN a user clicks a game card on the Hub, THE App_Router SHALL navigate to the corresponding route (`/dev-persona`, `/soul-drink`, or `/audit`).
3. THE Hub SHALL use `next/link` `<Link>` components for all game card navigation (no `react-router-dom` imports anywhere in the Frontend).
4. THE Hub SHALL preserve the existing dark background and glassmorphism visual aesthetic from `globals.css`.

---

### Requirement 2: Route Structure

**User Story:** As a user, I want each game to have its own dedicated URL, so that I can bookmark or share links to individual games.

#### Acceptance Criteria

1. THE Frontend SHALL serve the Dev Persona quiz at the `/dev-persona` route.
2. THE Frontend SHALL serve the Soul Drink quiz at the `/soul-drink` route.
3. THE Frontend SHALL serve the Audit game at the `/audit` route.
4. THE Frontend SHALL serve the Audit Challenge flow at the `/audit/[verdictId]/challenge` route.
5. THE App_Router SHALL implement all routes using Next.js App Router file-based conventions (`app/` directory with `page.tsx` files).
6. IF a user visits a route that does not exist, THEN THE App_Router SHALL render the default Next.js 404 page.

---

### Requirement 3: React Router Removal

**User Story:** As a developer, I want the merged codebase to use only Next.js routing primitives, so that there is no dependency on `react-router-dom`.

#### Acceptance Criteria

1. THE Frontend SHALL NOT include `react-router-dom` as a dependency in `package.json`.
2. WHEN a component requires a navigation link, THE Frontend SHALL use `import Link from 'next/link'` with `href` prop instead of `import { Link } from 'react-router-dom'` with `to` prop.
3. WHEN a page component requires the current route parameter (e.g., `verdictId`), THE Frontend SHALL use `useParams` from `next/navigation` instead of `useParams` from `react-router-dom`.
4. THE Challenge_Page SHALL read the `verdictId` path segment using `useParams` from `next/navigation`.

---

### Requirement 4: Environment Variable Migration

**User Story:** As a developer, I want all API base URL references to use the Next.js environment variable convention, so that the frontend builds correctly under Next.js.

#### Acceptance Criteria

1. THE Frontend SHALL NOT contain any reference to `import.meta.env.VITE_API_URL`.
2. WHEN the Soul_Drink game component makes an API call, THE Frontend SHALL construct the URL using `process.env.NEXT_PUBLIC_API_URL` as the base.
3. WHEN the Audit game component makes an API call, THE Frontend SHALL construct the URL using `process.env.NEXT_PUBLIC_API_URL` as the base.
4. WHEN `NEXT_PUBLIC_API_URL` is undefined or empty, THE Soul_Drink component SHALL fall back to a default mock rarity value without crashing.
5. WHEN `NEXT_PUBLIC_API_URL` is undefined or empty, THE Audit component SHALL display an error state without crashing.

---

### Requirement 5: Public Asset Migration

**User Story:** As a user, I want to see the Soul Drink mascot and banana result images when I play the Soul Drink game, so that the game looks correct in the merged frontend.

#### Acceptance Criteria

1. THE Frontend `public/` directory SHALL contain `nanobanana_mascot.png`.
2. THE Frontend `public/` directory SHALL contain `banana_espresso.png`, `banana_matcha.png`, `banana_sesame.png`, and `banana_tropical.png`.
3. WHEN the Soul_Drink game renders a result card, THE Frontend SHALL load banana images using root-relative paths (e.g., `/banana_espresso.png`) from the `public/` directory.

---

### Requirement 6: CSS Consolidation

**User Story:** As a developer, I want all game-specific CSS utilities to be available globally, so that Soul Drink and Audit components render correctly in the mcp-lab frontend.

#### Acceptance Criteria

1. THE `globals.css` SHALL include the `@keyframes float` and `@keyframes pulse-glow` animation definitions and their corresponding utility classes (`animate-float`, `animate-glow`).
2. THE `globals.css` SHALL define the Audit CSS custom properties (`--audit-bg`, `--audit-red`, `--audit-purple`, `--audit-gold`) under `:root`.
3. THE `globals.css` SHALL include the `.glass-card`, `.banana-btn`, and `.apple-btn` utility class definitions.
4. THE `globals.css` SHALL import the Outfit and Prompt Google Fonts needed by Soul Drink components.
5. THE `globals.css` SHALL NOT include Vite scaffold utility classes (`.counter`, `.hero`, `#center`, `#next-steps`, `.ticks`) from `game/frontend/src/App.css`.

---

### Requirement 7: Backend Merge

**User Story:** As a developer, I want all game API routes served from a single Lambda function, so that there is only one backend deployment to manage.

#### Acceptance Criteria

1. THE Merged_Backend `serverless.yml` SHALL define all three DynamoDB tables: `dev-persona-stats` (key: `archetypeId`), `souldrink-stats` (key: `result_id`), and `audit-verdicts` (key: `verdict_id`).
2. THE `audit-verdicts` table definition SHALL have TTL enabled on the `ttl_expires_at` attribute with a 30-day expiry applied at write time.
3. THE Merged_Backend IAM role SHALL grant `GetItem`, `PutItem`, `UpdateItem`, `Query`, and `Scan` permissions on all three DynamoDB tables.
4. THE Merged_Backend SHALL use `serverless-esbuild` as the TypeScript build plugin (NOT `serverless-plugin-typescript`).
5. THE Merged_Backend SHALL retain the existing API Gateway `httpApi` event trigger (no Lambda Function URL).

---

### Requirement 8: Merged API Routes

**User Story:** As a user playing any of the three games, I want my game results recorded and statistics retrieved correctly, so that the rarity and verdict features work after the merge.

#### Acceptance Criteria

1. WHEN a `POST /api/stats` request is received with a `result_id` body, THE Merged_Backend SHALL increment the count for that `result_id` in the `souldrink-stats` table and return the new count.
2. WHEN a `GET /api/stats/:id` request is received, THE Merged_Backend SHALL return the count for the given `result_id` from `souldrink-stats`.
3. WHEN a `POST /api/audit/verdict` request is received with a valid verdict payload, THE Merged_Backend SHALL persist the verdict to the `audit-verdicts` table and return `{ success: true, verdictId }`.
4. WHEN a `GET /api/audit/verdict/:verdictId` request is received, THE Merged_Backend SHALL return the verdict from `audit-verdicts`, or a 404 error if not found.
5. WHEN a `POST /api/audit/impression` request is received, THE Merged_Backend SHALL log the impression and return `{ success: true }` (fire-and-forget).
6. THE Merged_Backend SHALL continue to handle `POST /api/results` and `GET /api/stats` for Dev Persona using the `dev-persona-stats` table without regression.

---

### Requirement 9: Audit Game Logic Correctness

**User Story:** As a user completing the Audit game, I want my verdict to accurately reflect my evidence choices, so that the archetype classification and contradiction detection are correct.

#### Acceptance Criteria

1. FOR ALL valid `EvidenceLog` inputs with exactly 8 entries, `calculateVerdict` SHALL return a `contradictionIndex` value in the inclusive range [0.0, 1.0].
2. FOR ALL valid `EvidenceLog` inputs with N entries, `calculateVerdict` SHALL return `archetypeScores` whose values sum to exactly N.
3. WHEN two or more archetypes share the maximum score in an `EvidenceLog`, `calculateVerdict` SHALL return `archetype === 'WALKING_CONTRADICTION'` and `isSecret === true`.
4. WHEN exactly one archetype has a strictly higher score than all others AND `contradictionIndex` is ≤ 0.5, `calculateVerdict` SHALL return that archetype's id (not `WALKING_CONTRADICTION`).

---

### Requirement 10: Audit State Machine Correctness

**User Story:** As a developer, I want the audit game state machine to behave predictably across all input sequences, so that the game flow is reliable.

#### Acceptance Criteria

1. WHEN a `RESTART` action is dispatched, THE `auditReducer` SHALL reset all session fields to their initial values while preserving the `abVariant` field from the state at the time of restart.
2. WHEN a sequence of `SUBMIT_EVIDENCE` actions is dispatched, THE `auditReducer` SHALL accumulate evidence entries in `evidenceLog` without overwriting any previously submitted entry.
3. WHEN a `SUBMIT_EVIDENCE` action is dispatched with `caseIndex: 2`, THE `auditReducer` SHALL set `gameState` to `'MICRO_ROAST_3'` without incrementing `currentCaseIndex`.
4. WHEN a `SUBMIT_EVIDENCE` action is dispatched with `caseIndex: 7`, THE `auditReducer` SHALL set `gameState` to `'CALCULATING'`.

---

### Requirement 11: Test Suite Migration

**User Story:** As a developer, I want the existing audit unit tests to run in the mcp-lab frontend project, so that logic correctness is continuously verified after the merge.

#### Acceptance Criteria

1. THE Frontend `package.json` SHALL include `vitest`, `@testing-library/react`, and `jsdom` as devDependencies.
2. THE Frontend SHALL have a `vitest.config.ts` configured with `environment: 'jsdom'` and `globals: true`.
3. THE Frontend `src/audit/__tests__/` directory SHALL contain the ported `verdictCalculator.test.ts`, `auditReducer.test.ts`, and `abTest.test.ts` files.
4. WHEN `vitest run` is executed in the Frontend directory, THE test runner SHALL report all ported audit tests as passing.
