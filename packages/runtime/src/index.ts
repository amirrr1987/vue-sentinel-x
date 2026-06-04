import { createSentinelPlugin } from "./plugin.js";
import { sentinelTracker } from "./tracker.js";
import type { SentinelRuntime, SentinelRuntimeOptions } from "./types.js";

export type {
  ComponentLifecycleRecord,
  LifecycleEvent,
  LifecycleEventType,
  SentinelRuntime,
  SentinelRuntimeOptions,
} from "./types.js";

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

/** Create the runtime plugin + global tracker API. */
export function createRuntime(
  options: SentinelRuntimeOptions = {},
): SentinelRuntime {
  return {
    plugin: createSentinelPlugin(options),
    tracker: sentinelTracker,
  };
}
