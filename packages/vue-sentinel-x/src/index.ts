export {
  vueSentinelX,
  default,
  PLUGIN_NAME,
  DEFAULT_GRAPH_OUTPUT,
  analyzeVueFile,
  AnalysisStore,
  DependencyGraphBuilder,
} from "@amirrr1987/vue-sentinel-x-vite-plugin";
export type {
  VueSentinelXPluginOptions,
  ComponentGraphFile,
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
} from "@amirrr1987/vue-sentinel-x-vite-plugin";

export {
  createRuntime,
  createSentinelPlugin,
  sentinelTracker,
  sentinelMemory,
  sentinelPerformance,
  captureRuntimeSnapshot,
} from "@amirrr1987/vue-sentinel-x-runtime";
export type {
  SentinelRuntime,
  SentinelRuntimeOptions,
  SentinelVuePlugin,
} from "@amirrr1987/vue-sentinel-x-runtime";

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
} from "@amirrr1987/vue-sentinel-x-core";
export type { SentinelConfig, IntelligenceReport } from "@amirrr1987/vue-sentinel-x-core";
