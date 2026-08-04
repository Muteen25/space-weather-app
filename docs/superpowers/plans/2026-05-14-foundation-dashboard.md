# Foundation Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable slice of the Space Weather App: tested deterministic rules, mock-backed public API endpoints, and a responsive dashboard shell.

**Architecture:** Use a TypeScript React/Vite frontend and a TypeScript Express backend in one repository. Put deterministic space-weather interpretation logic in `src/shared` so it can be tested once and reused by both API and UI layers. Use representative sample data for the first slice, leaving real NOAA/NASA ingestion for the next track.

**Tech Stack:** React, Vite, TypeScript, Express, Vitest, React Testing Library, Supertest, Recharts, Lucide React.

---

### Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/test/setup.ts`

- [x] **Step 1: Define scripts and dependencies**

Use `npm test`, `npm run build`, `npm run dev`, and `npm run server:dev`.

- [x] **Step 2: Configure TypeScript, Vite, and Vitest**

Use strict TypeScript, React JSX, Vite proxying `/api` to `127.0.0.1:5000`, and jsdom tests.

### Task 2: Shared Rule Tests

**Files:**
- Create: `src/shared/severity.test.ts`
- Create: `src/shared/impact.test.ts`
- Create next: `src/shared/types.ts`
- Create next: `src/shared/severity.ts`
- Create next: `src/shared/impact.ts`

- [x] **Step 1: Write failing severity tests**

Cover Kp-to-G-scale, Kp-to-condition labels, severe alert override, and flare-to-R-scale estimates.

- [x] **Step 2: Write failing impact tests**

Cover quiet conditions, geomagnetic storm impacts, HF radio flare impacts, and radiation storm impacts.

- [x] **Step 3: Run tests and confirm failure before implementation**

Run: `npm test`.

### Task 3: Shared Rule Implementation

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/shared/severity.ts`
- Create: `src/shared/impact.ts`

- [x] **Step 1: Implement severity mapping**

Export `kpToGScale`, `kpToSeverity`, `flareClassToRadioScale`, and `classifyOverallCondition`.

- [x] **Step 2: Implement impact summaries**

Export `buildImpactSummary(input)` returning seven sector cards with level, reason, and related parameter.

- [x] **Step 3: Run tests and confirm shared rules pass**

Run: `npm test -- src/shared`.

### Task 4: Mock Public API

**Files:**
- Create: `src/server/data/sampleData.ts`
- Create: `src/server/app.ts`
- Create: `src/server/server.ts`

- [x] **Step 1: Implement Express app factory**

Expose `/api/dashboard/summary`, `/api/impact-summary`, `/api/solar-wind`, `/api/kp`, `/api/alerts`, and `/api/events`.

- [x] **Step 2: Run API tests**

Run: `npm test -- src/server/app.test.ts`.

### Task 5: Dashboard UI

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/styles.css`

- [x] **Step 1: Write dashboard rendering test**

Assert the app renders condition, Kp, solar wind, alert, and impact sections.

- [x] **Step 2: Implement responsive dashboard**

Use dense operational UI, clear severity labels, chart/table fallback, accessible buttons/labels, and no decorative landing page.

- [x] **Step 3: Run frontend tests**

Run: `npm test -- src/App.test.tsx`.

### Task 6: Verification

**Files:**
- Modify: `docs/progress.md`

- [x] **Step 1: Run full tests**

Run: `npm test`.

- [x] **Step 2: Run production build**

Run: `npm run build`.

- [x] **Step 3: Start dev server**

Run API server on port `5000` and Vite on port `5173`.
