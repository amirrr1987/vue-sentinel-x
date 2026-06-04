import type { App, ComponentPublicInstance, Plugin } from "vue";
import { resolveComponentName } from "./component-name.js";
import { createComponentId } from "./id.js";
import {
  enterComponentScope,
  exitComponentScope,
} from "./memory/active-scope.js";
import type { MemoryTracker } from "./memory/memory-tracker.js";
import { prepareSentinelRuntime } from "./memory/prepare.js";
import { sentinelMemory } from "./memory/memory-tracker.js";
import { sentinelTracker, type LifecycleTracker } from "./tracker.js";
import type { SentinelRuntimeOptions } from "./types.js";

export type SentinelVuePlugin = Plugin;

export function createSentinelPlugin(
  options: SentinelRuntimeOptions = {},
  tracker: LifecycleTracker = sentinelTracker,
  memory: MemoryTracker = sentinelMemory,
): SentinelVuePlugin {
  const {
    logLifecycle = true,
    detectMemoryLeaks = true,
    logMemoryWarnings = true,
  } = options;

  return {
    install(app: App) {
      if (detectMemoryLeaks) {
        prepareSentinelRuntime(tracker, memory);
      }

      app.mixin({
        beforeCreate(this: ComponentPublicInstance) {
          enterComponentScope(this);
          const componentId = createComponentId();
          const name = resolveComponentName(this);
          tracker.register(this, name, componentId);
        },

        mounted(this: ComponentPublicInstance) {
          enterComponentScope(this);
          tracker.markMounted(this, logLifecycle);
          if (detectMemoryLeaks) {
            memory.onMounted(this);
          }
        },

        unmounted(this: ComponentPublicInstance) {
          if (detectMemoryLeaks) {
            memory.onUnmounted(this, logMemoryWarnings);
          }
          tracker.markUnmounted(this, logLifecycle);
          exitComponentScope(this);
        },

        beforeUnmount(this: ComponentPublicInstance) {
          enterComponentScope(this);
        },
      });
    },
  };
}
