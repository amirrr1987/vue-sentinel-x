export { enterComponentScope, exitComponentScope } from "./active-scope.js";
export { evaluateLeakRules, formatLeakWarning } from "./leak-rules.js";
export { MemoryTracker, sentinelMemory } from "./memory-tracker.js";
export { captureMemorySnapshot } from "./performance-memory.js";
export { prepareSentinelRuntime } from "./prepare.js";
export { installGlobalPatches } from "./patch-globals.js";
export { installWatchPatches } from "./patch-vue-watch.js";
export { ResourceRegistry } from "./resource-registry.js";
export type {
  ComponentResourceBundle,
  MemorySnapshot,
  MemoryWarning,
  MemoryWarningCode,
  ResourceKind,
  TrackedListener,
  TrackedResource,
  TrackedTimer,
  TrackedWatcher,
} from "./types.js";
