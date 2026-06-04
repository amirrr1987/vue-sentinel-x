export {
  DEFAULT_CONFIG,
  DEFAULT_FEATURES,
  DEFAULT_GRAPH_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_REPORT_HTML,
  DEFAULT_REPORT_JSON,
  DEFAULT_REPORTS,
} from "./defaults.js";
export { isFeatureEnabled, resolveConfig } from "./resolve.js";
export type {
  ResolvedSentinelConfig,
  SentinelConfig,
  SentinelFeatureFlags,
  SentinelPerformanceConfig,
  SentinelReportConfig,
} from "./types.js";
