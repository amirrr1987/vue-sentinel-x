# @vue-sentinel-x/dashboard

Vue 3 dev dashboard for component graphs, memory, performance, and Intelligence Engine issues.

## Run

```bash
bun install
bun run dashboard:dev
```

Open http://localhost:5174

To load reports from your app, enable `fetchLiveGraph` in `useSentinelData` and proxy `/analysis` to your Vite dev server in `vite.config.ts`.

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
2. **Runtime** tracks lifecycle, memory, and performance; exposes `window.__VUE_SENTINEL_X__.captureSnapshot()`.
3. **Core** runs rules on a merged snapshot → issues with problem / suggestion / explanation.
4. **Dashboard** loads mock data, or fetches `analysis/sentinel-report.json` when `fetchLiveGraph: true`.

## Adapters

- `src/adapters/graph-adapter.ts` — `toVisNetworkData()` for **vis-network**
- `src/adapters/chart-adapter.ts` — `ChartSeries` for **Chart.js / ECharts**

Replace placeholder renderers when dependencies are added.
