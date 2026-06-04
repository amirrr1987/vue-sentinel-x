# @vue-sentinel-x/dashboard

Vue 3 dev dashboard for component graphs, memory, performance, and Intelligence Engine issues.

## Run

```bash
bun install
bun run --filter @vue-sentinel-x/dashboard dev
```

Open http://localhost:5174

## Data flow (plugin → UI)

```
┌─────────────────┐     component-graph.json      ┌──────────────────┐
│  vite-plugin    │ ────────────────────────────► │  Dashboard       │
│  (build/dev)    │     /analysis/...           │  fetch / mock    │
└─────────────────┘                             └────────┬─────────┘
                                                         │
┌─────────────────┐     memory + performance            │
│  runtime        │ ───────── (future bridge) ─────────►│
│  (browser)      │     window.__SENTINEL__             │
└─────────────────┘                                     ▼
                                               ┌──────────────────┐
                                               │  @vue-sentinel-x/ │
                                               │  core engine      │
                                               │  → issues list    │
                                               └──────────────────┘
```

1. **Vite plugin** scans `.vue` files and writes `analysis/component-graph.json`.
2. **Runtime** tracks lifecycle, memory, and performance in the app (live data TBD via dev bridge).
3. **Core** runs rules on a merged snapshot → issues with problem / suggestion / explanation.
4. **Dashboard** loads the snapshot (mock today, live graph optional) and renders panels.

## Adapters

- `src/adapters/graph-adapter.ts` — `toVisNetworkData()` for **vis-network**
- `src/adapters/chart-adapter.ts` — `ChartSeries` for **Chart.js / ECharts**

Replace placeholder renderers when dependencies are added.
