# Vue Sentinel X

Performance and health monitoring for Vue 3 apps — static component graphs, runtime lifecycle/memory/performance tracking, and an Intelligence Engine that explains issues in plain language.

## Packages

| Package | Purpose |
|---------|---------|
| `@vue-sentinel-x/vite-plugin` | Analyze `.vue` files at build/dev, write graph + reports |
| `@vue-sentinel-x/runtime` | Browser plugin: lifecycle, memory leaks, performance |
| `@vue-sentinel-x/core` | Rules, reports, shared config |
| `@vue-sentinel-x/dashboard` | Local UI to explore results |

## Quick start (real Vue + Vite project)

### 1. Install

From your app directory (monorepo: link workspace packages, or publish to npm when ready):

```bash
bun add -D @vue-sentinel-x/vite-plugin
bun add @vue-sentinel-x/runtime
```

### 2. Vite config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { vueSentinelX } from "@vue-sentinel-x/vite-plugin";

export default defineConfig({
  plugins: [
    vue(),
    vueSentinelX({
      // Master switch
      enabled: true,
      features: {
        graph: true,
        intelligence: true,
        reports: true,
        learningMode: false,
      },
      reports: {
        json: true,
        html: true, // optional HTML report
        outputDir: "analysis",
      },
      performance: {
        quiet: true, // skip per-file logs (recommended)
        graphDebounceMs: 250,
      },
    }),
  ],
});
```

After `vite build` or dev, check:

- `analysis/component-graph.json` — component dependency graph  
- `analysis/sentinel-report.json` — full report (graph + issues)  
- `analysis/sentinel-report.html` — optional human-readable report  

Add `analysis/` to `.gitignore` unless you want reports in CI artifacts.

### 3. Runtime (main.ts)

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createRuntime } from "@vue-sentinel-x/runtime";

const { plugin } = createRuntime({
  enabled: true,
  features: {
    runtime: true,
    lifecycle: false,
    memory: true,
    performance: true,
  },
  detectMemoryLeaks: true,
  trackPerformance: true,
  performance: { quiet: true },
});

createApp(App).use(plugin).mount("#app");
```

In the browser console (dev), live data is available at:

```ts
window.__VUE_SENTINEL_X__.captureSnapshot();
```

### 4. Dashboard (optional)

From the monorepo root:

```bash
bun run dashboard:dev
```

Open http://localhost:5174 — uses mock data by default. To load your app’s graph, proxy `/analysis` to your Vite dev server (see `packages/dashboard/README.md`).

### 5. Intelligence / Learning Mode

```ts
import {
  buildIntelligenceContext,
  intelligenceEngine,
  learningEngine,
} from "@vue-sentinel-x/core";

const context = buildIntelligenceContext({
  projectRoot: "/your-app",
  // pass graph JSON, runtime snapshot, etc.
});

const report = intelligenceEngine.analyze(context);
console.log(report.summary);

// Lessons + bad/good examples for juniors:
learningEngine.log(context);
```

## Configuration reference

All packages accept a partial **`SentinelConfig`** (see `@vue-sentinel-x/core`).

| Flag | Default | Description |
|------|---------|-------------|
| `enabled` | `true` | Master switch |
| `features.graph` | `true` | Vite component graph |
| `features.runtime` | `true` | Browser instrumentation |
| `features.memory` | `true` | Leak detection |
| `features.performance` | `true` | Mount/update/long tasks |
| `features.intelligence` | `true` | Issue rules |
| `features.learningMode` | `false` | Educational output |
| `features.reports` | `true` | JSON/HTML files |
| `reports.json` | `true` | Write `sentinel-report.json` |
| `reports.html` | `false` | Write `sentinel-report.html` |
| `performance.quiet` | `true` | Less console noise |
| `performance.graphDebounceMs` | `250` | Batch graph writes in dev |

Disable everything quickly:

```ts
vueSentinelX({ enabled: false });
createRuntime({ enabled: false });
```

## Data flow

```
┌──────────────────┐
│  vite-plugin     │──► analysis/component-graph.json
│  (AST / graph)   │──► analysis/sentinel-report.json|.html
└──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  runtime         │────►│  core engine     │
│  (browser)       │     │  (rules/issues)  │
└──────────────────┘     └──────────────────┘
         │                         │
         └────────────┬────────────┘
                      ▼
              ┌──────────────────┐
              │  dashboard       │
              └──────────────────┘
```

1. **Plugin** parses `.vue` files, caches by content hash, writes the graph and build-time report.  
2. **Runtime** tracks mounts, memory, and performance; exposes `__VUE_SENTINEL_X__` for live snapshots.  
3. **Core** merges inputs and runs rules → `problem`, `suggestion`, `explanation`.  
4. **Dashboard** visualizes the same snapshot (mock or fetched JSON).

## Monorepo scripts

```bash
bun install
bun run build          # build all packages
bun run typecheck
bun run dashboard:dev  # dashboard UI
```

## Performance notes

- Graph analysis is **incremental** (content hash cache; only changed files re-parse).  
- Graph writes are **debounced** in dev (`graphDebounceMs`).  
- Runtime patches install only when `features.memory` / `performance` are on.  
- Use `performance.quiet: true` and `logFiles: false` in everyday dev.

## License

MIT
