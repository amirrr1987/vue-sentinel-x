import type {
  ComponentGraphInput,
  IntelligenceContext,
  MemoryWarningInput,
  PerformanceRecordInput,
  LongTaskInput,
} from "../types.js";

/** Build engine input from the Vite `component-graph.json` shape. */
export function contextFromComponentGraph(
  graph: ComponentGraphInput & {
    sharedComponents?: ComponentGraphInput["sharedComponents"];
  },
  projectRoot?: string,
): IntelligenceContext {
  return {
    projectRoot,
    componentGraph: {
      components: graph.components,
      sharedComponents: graph.sharedComponents,
    },
  };
}

/** Merge runtime memory warnings into context. */
export function withMemoryWarnings(
  context: IntelligenceContext,
  warnings: MemoryWarningInput[],
): IntelligenceContext {
  return {
    ...context,
    memory: { warnings },
  };
}

/** Merge runtime performance records into context. */
export function withPerformance(
  context: IntelligenceContext,
  records: PerformanceRecordInput[],
  longTasks?: LongTaskInput[],
): IntelligenceContext {
  return {
    ...context,
    performance: { records, longTasks },
  };
}

/** Convenience: one-shot context from all available snapshots. */
export function buildIntelligenceContext(parts: {
  projectRoot?: string;
  componentGraph?: ComponentGraphInput;
  memoryWarnings?: MemoryWarningInput[];
  performanceRecords?: PerformanceRecordInput[];
  longTasks?: LongTaskInput[];
}): IntelligenceContext {
  return {
    projectRoot: parts.projectRoot,
    componentGraph: parts.componentGraph,
    memory: parts.memoryWarnings
      ? { warnings: parts.memoryWarnings }
      : undefined,
    performance: parts.performanceRecords
      ? {
          records: parts.performanceRecords,
          longTasks: parts.longTasks,
        }
      : undefined,
  };
}
