# DDS Super Dashboard

A spatial, single-page reliability/manufacturing direction-setting dashboard. Built with **Vite + React + Tailwind + Framer Motion**. No routing — every view is a panel that warps, slides, or expands in place over `App.jsx`.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL and drag-and-drop any mix of `.xlsx` / `.csv` exports anywhere onto the page.

## Project structure

```
src/
  components/
    layout/        ControlDeck (header), MainStage (grid), Canvas (background shell)
    modules/        Feature components: Dropzone, RailcarOverview, MaterialShortages,
                     LateLoads, InventoryCountsCard, FinancialInsights, ProductionGrid,
                     InventoryVault, MetricDrilldown
    ui/             Reusable primitives: Card, Badge, Button, AnimatedNumber, ProgressBar,
                     EmptyState, StatusDropdown, DateRangeToggle, GenieOverlay, SlideDrawer
  context/
    DashboardContext.jsx   Single reducer-based store + memoized selectors
  utils/
    dataParser.js   Header-fingerprinting engine (the "Smart Dropzone" brain)
    dateHelpers.js  24h / 48h / Current Period range resolution + safe date parsing
    formatters.js   Currency/number/status formatting helpers
  App.jsx           Lean orchestrator — wires the panels together, ~70 lines
```

## How the Smart Dropzone routes files

`src/utils/dataParser.js` reads every dropped file into a raw matrix (`row[0]` = headers) using **SheetJS** for `.xlsx` and **PapaParse** for `.csv`, then fingerprints `row[0]` against this table:

| Dataset | Required headers (any order) | Notes |
|---|---|---|
| Inventory | `Docs entered up to`, `SLED/BBD`, `AGE(days)` | Powers the Inventory Vault's Expiring Materials list |
| Movements | `Movement Type`, `Material Document`, `Reason for Movement` | Auto-split into Cycle Counts (701/702) and Scrap (551/555) |
| COID | `Order`, `System Status`, `Qty Delivered` | Process Order status, feeds Production Grid |
| VAR Report | `Process Order`, `Quantity variance With Scrap`, `Value of Variance with Scrap` | Merged onto COID orders by Process Order # |
| `ats.csv` | single `ats`/`ATS` header or filename contains "ats" | |
| `cogi_errors.csv` | `Area`, `Count` | |
| `cycle_counts.csv` / `scrap_transactions.csv` | `W1`,`W2`,`W3`,`W4` | Disambiguated by filename containing "cycle"/"scrap" |
| `dashboard_comments.csv` | `Comments` | |
| `ingredients_status.csv` | `Timeframe`, `Status` | |
| `late_loads.csv` | `Date`,`Type`,`Material No.`,`PO Number` | |
| `material_shortages.csv` | `Material`,`ShortQuantity`,`ETA` | |
| `railcars.csv` | `RailNumber`,`Material`,`Location` | |
| `top_cycle_counts.csv` / `top_scrap.csv` | `ItemName`,`CostValue` | Disambiguated by filename |

Unrecognized files surface in a toast at the bottom of the screen instead of failing silently.

## Global date range filter

The `[24h | 48h | Current Period]` toggle in the `ControlDeck` lives in `DashboardContext` and drives `selectors.filteredMovements` / `movementTotals`, which the Inventory Vault reads. "Current Period" resolves to the most recent Sunday 00:00 → now (see `getMostRecentSundayStart` in `dateHelpers.js`).

## Spatial panels

- **Production Grid** — `GenieOverlay` (scale/skew warp-in from the click point, spring `{stiffness:260, damping:22}`)
- **Inventory Vault** — `SlideDrawer` (slides in from the right edge, spring `{stiffness:300, damping:26}`)
- **Metric drilldowns** (e.g. clicking "Total Inventory Adj." or the weekly counts card) — same `GenieOverlay`, content supplied by `MetricDrilldown.jsx`

All three are mounted once in `App.jsx` and toggled via `DashboardContext` state (`activePanel`, `drilldownMetric`) — zero URL/route changes.
