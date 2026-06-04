import type {
  SentinelConfig,
  SentinelFeatureFlags,
  SentinelReportConfig,
} from "./types.js";

export const DEFAULT_OUTPUT_DIR = "analysis";
export const DEFAULT_GRAPH_FILE = "component-graph.json";
export const DEFAULT_REPORT_JSON = "sentinel-report.json";
export const DEFAULT_REPORT_HTML = "sentinel-report.html";

export const DEFAULT_FEATURES: Required<SentinelFeatureFlags> = {
  graph: true,
  runtime: true,
  lifecycle: true,
  memory: true,
  performance: true,
  intelligence: true,
  learningMode: false,
  reports: true,
};

export const DEFAULT_REPORTS: Required<
  Pick<
    SentinelReportConfig,
    "enabled" | "json" | "html" | "outputDir" | "jsonFilename" | "htmlFilename"
  >
> = {
  enabled: true,
  json: true,
  html: false,
  outputDir: DEFAULT_OUTPUT_DIR,
  jsonFilename: DEFAULT_REPORT_JSON,
  htmlFilename: DEFAULT_REPORT_HTML,
};

export const DEFAULT_CONFIG: SentinelConfig = {
  enabled: true,
  features: DEFAULT_FEATURES,
  reports: DEFAULT_REPORTS,
  performance: {
    graphDebounceMs: 250,
    quiet: true,
  },
  logFiles: false,
  logGraph: true,
  graphOutput: `${DEFAULT_OUTPUT_DIR}/${DEFAULT_GRAPH_FILE}`,
  graphScan: true,
  logLifecycle: false,
  detectMemoryLeaks: true,
  logMemoryWarnings: true,
  trackPerformance: true,
  logSlowComponents: false,
  logTopSlowIntervalMs: false,
};
