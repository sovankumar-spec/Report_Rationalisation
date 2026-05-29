# Report Rationalizer Agent Guidance

## Purpose

Report Rationalizer is an enterprise report-rationalization application for Frontier-to-Verizon BI modernization. Verizon is the reference estate. Frontier/source reports are analyzed against Verizon/reference reports so analysts can approve or override one disposition per source report.

## Non-Negotiables

- Runtime data must come from user-supplied source and reference folder paths through the Express API.
- Do not add static report inventories, generated JSON payloads, mock metrics, or baked source/target counts.
- Do not reintroduce `public/data`, `load.json`, generated report JSON, or static dashboard totals.
- Dashboard metrics and scorecards are source-centric: one row and one disposition per Frontier/source report.
- Verizon/reference reports are comparison targets, not the primary dashboard counting grain.
- Keep the product title as `Report Rationalizer`.
- Keep UI copy enterprise-facing. Do not expose provider names, model names, secret names, or implementation jargon in the UI.

## Runtime Architecture

```
server/
  routes/reports.ts      # Reads user-supplied source/target folder paths
  routes/rationalize.ts  # Server-side rationale enrichment
  lib/parser.ts          # Parses report.json and SQL files
  lib/overlap.ts         # Builds source-centric inventory and deterministic decisions

src/
  types.ts               # Shared report and decision interfaces
  dataLayer.ts           # API client for report loading and enrichment
  App.tsx                # Application shell, six tabs, dashboard, lineage, metadata, disposition table
  index.css              # AWS-console-inspired production styling
```

The app has no static data fallback. The UI starts empty, accepts paths, calls `/api/load-reports`, then computes source-centric decisions from parsed SQL/KPI evidence.

## Decision Rules

Decision bands are deterministic and must stay aligned between `server/lib/overlap.ts` and `src/App.tsx`:

- `100%` overlap -> `Rationalize`
- `70-99%` overlap -> `Consolidate`
- `<70%` overlap -> `Migrate`

Server-side enrichment may improve rationale, KPI gap wording, and confidence. It must not change overlap percentages, target mappings, or disposition bands.

## Production Expectations

- Treat static report data as a defect unless it is explicitly user-supplied at runtime.
- Keep the AWS dashboard feel across all tabs: restrained colors, dense information hierarchy, clear tables, and predictable governance actions.
- Avoid marketing-page patterns, decorative filler, and explanatory tutorial copy inside the app.
- Keep layouts responsive at zoom and across common desktop resolutions.
- Prefer focused changes in `src/App.tsx`, `src/index.css`, `server/lib/*`, and `server/routes/*`.
- Run `npm run typecheck` and `npm run build` after changes.

## What Not To Add

- Static demo payloads or generated report inventories.
- Target-centric dashboard scorecards.
- Hardcoded report counts, static source/target totals, or placeholder decisions.
- Client-side secret entry fields or visible provider/model/key references.
- Separate legacy UI modules unless the application is intentionally refactored.
