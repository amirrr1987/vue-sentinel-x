import { resolveConfig, type SentinelConfig } from "vue-sentinel-x-core";
import { createSentinelPlugin, type SentinelRuntimeOptions } from "./plugin.js";
import { prepareSentinelRuntime } from "./memory/prepare.js";
import { sentinelMemory } from "./memory/memory-tracker.js";
import { sentinelPerformance } from "./performance/performance-tracker.js";
import { sentinelTracker } from "./tracker.js";
import type { SentinelRuntime } from "./types.js";

export type {
  ComponentLifecycleRecord,
  LifecycleEvent,
  LifecycleEventType,
  SentinelRuntime,
} from "./types.js";

export type { SentinelRuntimeOptions } from "./plugin.js";

export type {
  ComponentResourceBundle,
  MemorySnapshot,
  MemoryWarning,
  MemoryWarningCode,
  TrackedListener,
  TrackedResource,
  TrackedTimer,
  TrackedWatcher,
} from "./memory/types.js";

export type {
  ComponentPerformanceRecord,
  ComponentUpdateStats,
  LongTaskRecord,
  PerformanceReport,
  SlowComponentRanking,
} from "./performance/types.js";

export {
  createSentinelPlugin,
  type SentinelVuePlugin,
} from "./plugin.js";
export { resolveComponentName } from "./component-name.js";
export { createComponentId } from "./id.js";
export {
  LifecycleTracker,
  RUNTIME_LOG_PREFIX,
  sentinelTracker,
} from "./tracker.js";
export {
  MemoryTracker,
  sentinelMemory,
  prepareSentinelRuntime,
  captureMemorySnapshot,
  formatLeakWarning,
} from "./memory/index.js";
export {
  PerformanceTracker,
  sentinelPerformance,
  rankSlowComponents,
  resolveThresholds,
  DEFAULT_SLOW_MOUNT_MS,
  DEFAULT_SLOW_UPDATE_MS,
  DEFAULT_LONG_TASK_MS,
  DEFAULT_TOP_SLOW_COUNT,
} from "./performance/index.js";
export { captureRuntimeSnapshot, exposeRuntimeBridge } from "./snapshot.js";

/** Create the runtime plugin + global tracker API. */
export function createRuntime(
  options: SentinelRuntimeOptions = {},
): SentinelRuntime {
  const config = resolveConfig(options);

  if (config.enabled && config.features.memory) {
    prepareSentinelRuntime(sentinelTracker, sentinelMemory);
  }

  if (config.enabled && config.features.performance) {
    sentinelPerformance.configure(options.performanceThresholds);
  }

  return {
    plugin: createSentinelPlugin(options),
    tracker: sentinelTracker,
    memory: sentinelMemory,
    performance: sentinelPerformance,
  };
}

export type { SentinelConfig };

export {
  LiveBridge,
  createLiveBridge,
  getLiveBridge,
  BRIDGE_CHANNEL,
  BRIDGE_VERSION,
} from "./live-bridge.js";
export type { LiveBridgeOptions, BridgeMessage, BridgeMessageType } from "./live-bridge.js";
