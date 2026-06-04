import type { MemoryWarning } from "./memory/types.js";
import type { PerformanceThresholds } from "./performance/thresholds.js";

/** Lifecycle record stored in the global tracker. */
export type ComponentLifecycleRecord = {
  componentId: string;
  name: string;
  mountedAt: number | null;
  unmountedAt: number | null;
  memoryWarnings?: MemoryWarning[];
};

export type LifecycleEventType = "mounted" | "unmounted";

export type LifecycleEvent = {
  type: LifecycleEventType;
  componentId: string;
  name: string;
  timestamp: number;
};

export type SentinelRuntimeOptions = {
  /** Log mount/unmount events to the console. Default: true */
  logLifecycle?: boolean;
  /** Track listeners, timers, watchers and run leak rules. Default: true */
  detectMemoryLeaks?: boolean;
  /** Log memory leak warnings to the console. Default: true */
  logMemoryWarnings?: boolean;
  /** Track mount/render/update timings and long tasks. Default: true */
  trackPerformance?: boolean;
  /** Log when a component is flagged slow on unmount. Default: true */
  logSlowComponents?: boolean;
  /** Periodically log top slow components (ms). Default: false */
  logTopSlowIntervalMs?: number | false;
  /** Override slow mount/update/long-task thresholds (ms). */
  performanceThresholds?: Partial<PerformanceThresholds>;
};

export type SentinelRuntime = {
  plugin: import("vue").Plugin;
  tracker: import("./tracker.js").LifecycleTracker;
  memory: import("./memory/memory-tracker.js").MemoryTracker;
  performance: import("./performance/performance-tracker.js").PerformanceTracker;
};
