import { IntelligenceEngine } from "./engine/intelligence-engine.js";

export type {
  ComponentGraphInput,
  ComponentGraphNodeInput,
  IntelligenceContext,
  IntelligenceReport,
  LongTaskInput,
  MemoryWarningInput,
  PerformanceRecordInput,
  RuleFinding,
  RuleSeverity,
  SharedComponentInput,
} from "./types.js";

/** @deprecated Use {@link IntelligenceContext} */
export type { IntelligenceContext as AnalysisContext } from "./types.js";

export {
  buildIntelligenceContext,
  contextFromComponentGraph,
  withMemoryWarnings,
  withPerformance,
} from "./context/build-context.js";

export {
  resolveConfig,
  isFeatureEnabled,
  DEFAULT_CONFIG,
  DEFAULT_OUTPUT_DIR,
  type SentinelConfig,
  type ResolvedSentinelConfig,
  type SentinelFeatureFlags,
  type SentinelReportConfig,
} from "./config/index.js";

export {
  buildSentinelReport,
  writeJsonReport,
  writeHtmlReport,
  writeReports,
  renderHtmlReport,
  type BuildReportInput,
  type SentinelReportFile,
  type RuntimeReportSection,
} from "./report/index.js";

export {
  IntelligenceEngine,
  type IntelligenceEngineOptions,
} from "./engine/intelligence-engine.js";

export {
  formatFinding,
  formatReport,
  formatReportText,
} from "./format/messages.js";
export {
  formatLearningFinding,
  formatLearningReport,
  formatLearningReportText,
} from "./format/learning.js";
export {
  enrichFinding,
  enrichFindings,
  getLearningLesson,
  getAllLearningRuleIds,
  type CodeExample,
  type FindingWithLearning,
  type LearningLesson,
} from "./learning/index.js";

export {
  defaultRules,
  memoryLeakRules,
  badWatcherRules,
  unnecessaryReactivityRules,
  largeComponentRules,
  type SentinelRule,
} from "./rules/index.js";

/** Default engine (standard messages). */
export const intelligenceEngine = new IntelligenceEngine();

/** Engine with Learning Mode on — lessons + bad/good examples. */
export const learningEngine = new IntelligenceEngine({ learningMode: true });
