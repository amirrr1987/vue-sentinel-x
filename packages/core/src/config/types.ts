/** Feature toggles — set `false` to disable a capability. */
export type SentinelFeatureFlags = {
  /** Vite plugin: component graph + static analysis */
  graph?: boolean;
  /** Browser runtime instrumentation */
  runtime?: boolean;
  /** Lifecycle mount/unmount tracking */
  lifecycle?: boolean;
  /** Memory leak detection */
  memory?: boolean;
  /** Mount/update/long-task performance tracking */
  performance?: boolean;
  /** Intelligence Engine rules + issues */
  intelligence?: boolean;
  /** Learning Mode (lessons + code examples) */
  learningMode?: boolean;
  /** JSON / HTML report files */
  reports?: boolean;
};

export type SentinelReportConfig = {
  /** Write report files (master for reports feature) */
  enabled?: boolean;
  /** Write `sentinel-report.json` */
  json?: boolean;
  /** Write `sentinel-report.html` */
  html?: boolean;
  /** Directory under project root (default: `analysis`) */
  outputDir?: string;
  jsonFilename?: string;
  htmlFilename?: string;
};

export type SentinelPerformanceConfig = {
  /** Debounce graph writes in dev (ms) */
  graphDebounceMs?: number;
  /** Skip per-module console logging in the plugin */
  quiet?: boolean;
};

/**
 * Unified configuration for all Vue Sentinel X packages.
 * Pass a partial object; unset fields use sensible defaults.
 */
export type SentinelConfig = {
  /** Master switch — `false` disables everything */
  enabled?: boolean;
  features?: SentinelFeatureFlags;
  reports?: SentinelReportConfig;
  performance?: SentinelPerformanceConfig;

  // --- Vite plugin ---
  /** Log every transformed module */
  logFiles?: boolean;
  /** Log when component graph is written */
  logGraph?: boolean;
  /** Graph JSON path relative to root, or `false` */
  graphOutput?: string | false;
  /** Scan all `.vue` files on start */
  graphScan?: boolean;

  // --- Runtime ---
  logLifecycle?: boolean;
  detectMemoryLeaks?: boolean;
  logMemoryWarnings?: boolean;
  trackPerformance?: boolean;
  logSlowComponents?: boolean;
  logTopSlowIntervalMs?: number | false;
};

export type ResolvedSentinelConfig = Required<
  Pick<SentinelConfig, "enabled">
> & {
  features: Required<SentinelFeatureFlags>;
  reports: Required<
    Pick<
      SentinelReportConfig,
      "enabled" | "json" | "html" | "outputDir" | "jsonFilename" | "htmlFilename"
    >
  >;
  performance: Required<SentinelPerformanceConfig>;
} & SentinelConfig;
