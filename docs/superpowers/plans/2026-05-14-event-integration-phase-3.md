# Phase 3 Event Integration Plan

## Requirement Source

- `space_weather_app_prd_trd.md` / `2nd Phase.md`
- Phase 3 roadmap: NASA DONKI integration, CME list, flare list, event timeline, event detail page.
- Event timeline acceptance: at least 30 days of events, filterable by type, each event has timestamp/type/source/summary, details accessible without leaving the timeline.

## Implementation Checklist

- [x] Add failing adapter tests for NASA DONKI CME, FLR, GST, and SEP normalization.
- [x] Add failing public API test for normalized `/api/events` query parameters.
- [x] Add failing dashboard test for an event timeline panel.
- [x] Implement `NasaDonkiClient` with `DEMO_KEY` fallback and `NASA_API_KEY` override.
- [x] Normalize DONKI events into a shared timeline contract.
- [x] Replace the placeholder `/api/events` response with DONKI-backed service data.
- [x] Add source health records for DONKI event feeds.
- [x] Add dashboard timeline filters and detail drawer.
- [x] Preserve unit-test fixtures only; runtime path fetches official live NASA DONKI data.

## Verification Plan

- `npm test -- src/server/adapters/nasaDonkiAdapter.test.ts src/server/app.test.ts src/App.test.tsx`
- `npm test`
- `npm run build`
- Probe local API `/api/events?limit=3` after the dev server reloads.

## Notes

- Query defaults use the latest 30-day window to match the app's current MVP scope and avoid excessive public API range calls.
- Runtime NASA API key configuration is server-only through `NASA_API_KEY`; the frontend never receives the key.
- Empty DONKI event responses are treated as a valid empty timeline, not as fabricated data.
