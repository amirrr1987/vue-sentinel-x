export {
  vueSentinelX,
  default,
  PLUGIN_NAME,
  DEFAULT_GRAPH_OUTPUT,
  analyzeVueFile,
  AnalysisStore,
  DependencyGraphBuilder,
} from "vue-sentinel-x-vite-plugin";
export type {
  VueSentinelXPluginOptions,
  ComponentGraphFile,
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
} from "vue-sentinel-x-vite-plugin";

export {
  createRuntime,
  createSentinelPlugin,
  sentinelTracker,
  sentinelMemory,
  sentinelPerformance,
  captureRuntimeSnapshot,
} from "vue-sentinel-x-runtime";
export type {
  SentinelRuntime,
  SentinelRuntimeOptions,
  SentinelVuePlugin,
} from "vue-sentinel-x-runtime";

export {
  resolveConfig,
  isFeatureEnabled,
  DEFAULT_CONFIG,
  intelligenceEngine,
  learningEngine,
  buildIntelligenceContext,
  buildSentinelReport,
  writeReports,
  formatReport,
  formatReportText,
} from "vue-sentinel-x-core";
export type { SentinelConfig, IntelligenceReport } from "vue-sentinel-x-core";
