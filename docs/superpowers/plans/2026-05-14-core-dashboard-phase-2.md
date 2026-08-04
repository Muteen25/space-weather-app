# Core Dashboard Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 2 core dashboard from `2nd Phase.md`: solar wind charts, magnetic field charts, Kp chart, NOAA scale cards, alert list, and data freshness indicators.

**Architecture:** Replace runtime sample data with live NOAA SWPC source adapters. Keep deterministic parsing and source normalization on the backend, expose range-aware REST endpoints, and render frontend panels from live-source API contracts. Test fixtures remain in test files only.

**Tech Stack:** React, Vite, TypeScript, Express, Vitest, Supertest, NOAA SWPC JSON feeds.

---

### Task 1: NOAA Adapter Parsers

**Files:**
- Create: `src/server/adapters/noaaSwpcAdapter.test.ts`
- Create: `src/server/adapters/noaaSwpcAdapter.ts`

- [x] **Step 1: Write parser tests for official NOAA payload shapes**

Covered plasma header rows, magnetic-field header rows, Kp object rows, NOAA scales object, alert message metadata, and range-to-product mapping.

- [x] **Step 2: Implement parser and source client**

Added `NoaaSwpcClient`, range endpoint resolution, parser functions, freshness calculation, and source health tracking.

### Task 2: Phase 2 API Routes

**Files:**
- Modify: `src/server/app.test.ts`
- Create: `src/server/services/spaceWeatherService.ts`
- Modify: `src/server/app.ts`

- [x] **Step 1: Expand API contract tests**

Covered `/api/solar-wind`, `/api/magnetic-field`, `/api/kp`, `/api/scales`, `/api/source-health`, `/api/dashboard/summary`, and `/api/impact-summary`.

- [x] **Step 2: Add live service layer**

Added cache-backed service methods and dependency injection for fast tests.

### Task 3: Phase 2 Dashboard UI

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [x] **Step 1: Write UI test for phase-2 panels**

Covered solar wind, magnetic field, Kp trend, NOAA scales, source health, impact summary, alerts, and no sample/prototype labeling.

- [x] **Step 2: Implement phase-2 dashboard panels**

Added range controls, accessible SVG charts, data tables, freshness badges, source health rows, and separated G/R/S cards.

### Task 4: No Runtime Mock Data Cleanup

**Files:**
- Delete: `src/server/data/sampleData.ts`

- [x] **Step 1: Remove old production-path sample data**

Deleted the previous sample data file after runtime routes moved to live NOAA adapters.

### Task 5: Verification

- [x] **Step 1: Run tests**

Run: `npm test`

Observed: 5 test files, 23 tests passed.

- [x] **Step 2: Run production build**

Run: `npm run build`

Observed: TypeScript and Vite production build completed successfully.

- [x] **Step 3: Probe live local endpoints**

Verified:
- `http://127.0.0.1:5001/api/dashboard/summary`
- `http://127.0.0.1:5001/api/magnetic-field?range=2h`
- `http://127.0.0.1:5001/api/source-health`
- `http://127.0.0.1:5173/`
