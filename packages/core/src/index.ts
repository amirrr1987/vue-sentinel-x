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
  IntelligenceEngine,
  type IntelligenceEngineOptions,
} from "./engine/intelligence-engine.js";

export {
  formatFinding,
  formatReport,
  formatReportText,
} from "./format/messages.js";

export {
  defaultRules,
  memoryLeakRules,
  badWatcherRules,
  unnecessaryReactivityRules,
  largeComponentRules,
  type SentinelRule,
} from "./rules/index.js";

/** Default singleton engine with all built-in rules. */
export const intelligenceEngine = new IntelligenceEngine();
