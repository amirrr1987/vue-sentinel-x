export { installLongTaskObserver } from "./long-task-observer.js";
export {
  PerformanceTracker,
  sentinelPerformance,
} from "./performance-tracker.js";
export { rankSlowComponents, scoreComponent } from "./rankings.js";
export {
  DEFAULT_LONG_TASK_MS,
  DEFAULT_SLOW_MOUNT_MS,
  DEFAULT_SLOW_UPDATE_MS,
  DEFAULT_TOP_SLOW_COUNT,
  resolveThresholds,
  type PerformanceThresholds,
} from "./thresholds.js";
export type {
  ComponentPerformanceRecord,
  ComponentUpdateStats,
  LongTaskRecord,
  PerformanceReport,
  SlowComponentRanking,
} from "./types.js";
