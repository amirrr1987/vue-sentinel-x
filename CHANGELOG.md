# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-05

### Added

#### `@vue-sentinel-x/runtime`

- **Live Bridge** (`createLiveBridge`) — broadcasts runtime snapshots to the dashboard via `BroadcastChannel` (no WebSocket or extra server needed)
- `LiveBridge` class with `start()`, `stop()`, `flush()` methods and configurable `intervalMs`
- Responds to `ping` messages from the dashboard for immediate snapshot delivery on connect
- Exported from package index: `LiveBridge`, `createLiveBridge`, `getLiveBridge`, `BRIDGE_CHANNEL`, `BRIDGE_VERSION`

#### `@vue-sentinel-x/dashboard`

- **`useLiveBridge` composable** — connects to the runtime bridge; tracks `status` (`connected` / `waiting` / `stopped` / `disconnected`), `lastSnapshot`, `snapshotCount`
- **`LiveBridgeIndicator` component** — animated status pill in the header (green pulsing dot when live, yellow when waiting)
- **`useSentinelData`** updated with `liveBridge: true` option — merges incoming runtime snapshots reactively, appends memory history points for the chart

#### Monorepo / publishing

- All publishable packages bumped to `0.1.0` with `description`, `keywords`, `license`, `author`, `repository`, `bugs`, `engines`, `sideEffects`, `publishConfig`
- `scripts/bump-version.ts` — unified version bump across all packages
- `LICENSE` (MIT)
- `.npmignore` per package (excludes `src/`, `tsconfig.json`, `*.tsbuildinfo`)
- GitHub Actions: `ci.yml` (typecheck + build on push/PR), `publish.yml` (publish to npm on `v*` tags with provenance)

## [0.0.1] - 2026-06-05

Initial release of the Vue Sentinel X monorepo — static analysis, runtime instrumentation, intelligence rules, reports, and a dev dashboard.

### Added

#### `@vue-sentinel-x/vite-plugin`

- Vite plugin (`vueSentinelX`) with `enforce: "pre"` transform hook for `.vue` files
- SFC parsing via `@vue/compiler-sfc` and script analysis via TypeScript Compiler API
- Per-file extraction: component name, imported `.vue` components, script/template structure
- Project-wide component dependency graph with resolved parent → child edges
- Shared component detection (used by 2+ parents)
- Incremental analysis cache (content hash) to avoid re-parsing unchanged files
- Project scan on dev/build start; HMR invalidation and file watcher support
- Writes `analysis/component-graph.json` (configurable path)
- Debounced graph writes in dev (`graphDebounceMs`)

#### `@vue-sentinel-x/runtime`

- Vue 3 plugin via `createRuntime()` / `createSentinelPlugin()`
- Lifecycle tracking with unique component IDs (`mountedAt`, `unmountedAt`)
- Memory leak detection: event listeners, timers, watchers; `performance.memory` heap growth (Chromium)
- Performance tracking: mount duration, render/update timings, long tasks (`PerformanceObserver`)
- Top slow component rankings and console warnings
- Global trackers: `sentinelTracker`, `sentinelMemory`, `sentinelPerformance`
- Browser bridge: `window.__VUE_SENTINEL_X__.captureSnapshot()`
- `prepareSentinelRuntime()` for early global patching

#### `@vue-sentinel-x/core`

- **Intelligence Engine** with pluggable rules and beginner-friendly output (`problem`, `suggestion`, `explanation`)
- Rule categories: memory leaks, bad watchers, unnecessary reactivity, large components
- **Learning Mode** with per-rule lessons, bad/good code examples (`learningEngine`, `learningMode` option)
- Unified **`SentinelConfig`** with `resolveConfig()` and per-feature toggles
- Report builder: `buildSentinelReport()`, `writeReports()` (JSON + optional HTML)
- Browser-safe entry: `@vue-sentinel-x/core/browser` (no Node.js `fs` dependencies)
- `buildIntelligenceContext()` to merge graph, memory, and performance inputs

#### `@vue-sentinel-x/dashboard`

- Vue 3 + Vite dashboard (port 5174)
- Panels: component graph, memory usage, performance metrics, issues list
- Mock data for local development; optional fetch of `analysis/sentinel-report.json`
- Adapters prepared for **vis-network** (graph) and chart libraries (`ChartSeries`)

#### Tooling & docs

- Bun workspaces monorepo with `build`, `typecheck`, and `dashboard:dev` scripts
- Root `README.md` with real-project setup guide
- `.gitignore` for `analysis/` output directory
- Package README for dashboard data-flow notes

### Reports

- `analysis/sentinel-report.json` — graph metadata, intelligence findings, optional runtime section
- `analysis/sentinel-report.html` — standalone HTML summary (optional, `reports.html: true`)

### Configuration

- Master switch: `enabled`
- Feature flags: `graph`, `runtime`, `lifecycle`, `memory`, `performance`, `intelligence`, `learningMode`, `reports`
- Report options: `reports.json`, `reports.html`, `reports.outputDir`
- Performance: `performance.quiet`, `performance.graphDebounceMs`

[0.0.1]: https://github.com/amirrr1987/vue-sentinel-x/releases/tag/v0.0.1
