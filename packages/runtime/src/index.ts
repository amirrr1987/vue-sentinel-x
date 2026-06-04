import { createSentinelPlugin } from "./plugin.js";
import { sentinelMemory } from "./memory/memory-tracker.js";
import { prepareSentinelRuntime } from "./memory/prepare.js";
import { sentinelTracker } from "./tracker.js";
import type { SentinelRuntime, SentinelRuntimeOptions } from "./types.js";

export type {
  ComponentLifecycleRecord,
  LifecycleEvent,
  LifecycleEventType,
  SentinelRuntime,
  SentinelRuntimeOptions,
} from "./types.js";

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

/** Create the runtime plugin + global tracker API. */
export function createRuntime(
  options: SentinelRuntimeOptions = {},
): SentinelRuntime {
  if (options.detectMemoryLeaks !== false) {
    prepareSentinelRuntime(sentinelTracker, sentinelMemory);
  }

  return {
    plugin: createSentinelPlugin(options),
    tracker: sentinelTracker,
    memory: sentinelMemory,
  };
}
