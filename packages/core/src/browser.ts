/** Browser-safe exports (no Node.js `fs` / `path`). */

export type {
  ComponentGraphInput,
  ComponentGraphNodeInput,
  IntelligenceContext,
  IntelligenceReport,
  MemoryWarningInput,
  PerformanceRecordInput,
  RuleFinding,
  RuleSeverity,
} from "./types.js";

export {
  buildIntelligenceContext,
  contextFromComponentGraph,
} from "./context/build-context.js";

export {
  resolveConfig,
  isFeatureEnabled,
  type SentinelConfig,
  type SentinelFeatureFlags,
} from "./config/index.js";

import { IntelligenceEngine } from "./engine/intelligence-engine.js";

export { IntelligenceEngine };

export const intelligenceEngine = new IntelligenceEngine();
export const learningEngine = new IntelligenceEngine({ learningMode: true });

export {
  formatFinding,
  formatReport,
  formatReportText,
} from "./format/messages.js";

export { buildSentinelReport } from "./report/build-report.js";
export type {
  RuntimeReportSection,
  SentinelReportFile,
} from "./report/types.js";

export {
  enrichFindings,
  getLearningLesson,
  type LearningLesson,
} from "./learning/index.js";
