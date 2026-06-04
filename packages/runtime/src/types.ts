import type { MemoryWarning } from "./memory/types.js";

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

export type SentinelRuntime = {
  plugin: import("vue").Plugin;
  tracker: import("./tracker.js").LifecycleTracker;
  memory: import("./memory/memory-tracker.js").MemoryTracker;
  performance: import("./performance/performance-tracker.js").PerformanceTracker;
};
