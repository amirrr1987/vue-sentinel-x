/** Input shapes for the engine (framework-agnostic). */

export type ComponentGraphInput = {
  components: ComponentGraphNodeInput[];
  sharedComponents?: SharedComponentInput[];
};

export type ComponentGraphNodeInput = {
  id: string;
  name: string;
  children?: string[];
  parents?: string[];
  importedComponents?: Array<{ localName: string; specifier: string }>;
  structure?: {
    hasScript: boolean;
    hasTemplate: boolean;
    scriptSetup: boolean;
  };
};

export type SharedComponentInput = {
  id: string;
  name: string;
  usageCount: number;
  usedBy: string[];
};

export type MemoryWarningInput = {
  code: string;
  componentId: string;
  name: string;
  message: string;
  heapDeltaBytes?: number;
};

export type PerformanceRecordInput = {
  componentId: string;
  name: string;
  mountDurationMs: number | null;
  renderTimeMs?: number | null;
  updates: {
    count: number;
    avgMs: number;
    maxMs: number;
    totalMs?: number;
  };
  isSlow?: boolean;
  slowReasons?: string[];
};

export type LongTaskInput = {
  durationMs: number;
  componentName?: string;
  componentId?: string;
};

/** Everything the intelligence engine can reason about. */
export type IntelligenceContext = {
  projectRoot?: string;
  componentGraph?: ComponentGraphInput;
  memory?: {
    warnings: MemoryWarningInput[];
  };
  performance?: {
    records: PerformanceRecordInput[];
    longTasks?: LongTaskInput[];
  };
};

export type RuleSeverity = "error" | "warning" | "info";

/** One issue reported by a rule. */
export type RuleFinding = {
  ruleId: string;
  severity: RuleSeverity;
  /** Display name, e.g. `UserProfile` */
  component?: string;
  filePath?: string;
  problem: string;
  suggestion: string;
  explanation: string;
};

export type IntelligenceReport = {
  generatedAt: string;
  findings: RuleFinding[];
  /** Human-readable lines ready to print or show in a UI */
  messages: string[];
  summary: string;
  /** Present when Learning Mode is enabled */
  learningMode?: boolean;
  /** Findings with lessons (what / why / fix + examples) */
  learningFindings?: import("./learning/types.js").FindingWithLearning[];
  /** Learning Mode formatted messages */
  learningMessages?: string[];
  learningSummary?: string;
};
