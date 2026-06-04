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
import type { PerformanceTracker } from "./performance/performance-tracker.js";
import { sentinelPerformance } from "./performance/performance-tracker.js";
import { sentinelTracker, type LifecycleTracker } from "./tracker.js";
import type { SentinelRuntimeOptions } from "./types.js";

export type SentinelVuePlugin = Plugin;

export function createSentinelPlugin(
  options: SentinelRuntimeOptions = {},
  tracker: LifecycleTracker = sentinelTracker,
  memory: MemoryTracker = sentinelMemory,
  performance: PerformanceTracker = sentinelPerformance,
): SentinelVuePlugin {
  const {
    logLifecycle = true,
    detectMemoryLeaks = true,
    logMemoryWarnings = true,
    trackPerformance = true,
    logSlowComponents = true,
    logTopSlowIntervalMs = false,
    performanceThresholds,
  } = options;

  let topSlowInterval: ReturnType<typeof setInterval> | undefined;

  return {
    install(app: App) {
      if (detectMemoryLeaks) {
        prepareSentinelRuntime(tracker, memory);
      }

      if (trackPerformance) {
        performance.configure(performanceThresholds);
        performance.start(true);
      }

      if (logTopSlowIntervalMs && trackPerformance) {
        topSlowInterval = setInterval(() => {
          performance.logTopSlowComponents();
        }, logTopSlowIntervalMs);
      }

      app.mixin({
        beforeCreate(this: ComponentPublicInstance) {
          enterComponentScope(this);
          const componentId = createComponentId();
          const name = resolveComponentName(this);
          tracker.register(this, name, componentId);

          if (trackPerformance) {
            performance.linkInstance(this, componentId);
            performance.setName(componentId, name);
          }
        },

        beforeMount(this: ComponentPublicInstance) {
          enterComponentScope(this);
          if (trackPerformance) {
            performance.beginMount(this);
          }
        },

        mounted(this: ComponentPublicInstance) {
          enterComponentScope(this);
          if (trackPerformance) {
            performance.endMount(this);
          }
          tracker.markMounted(this, logLifecycle);
          if (detectMemoryLeaks) {
            memory.onMounted(this);
          }
        },

        beforeUpdate(this: ComponentPublicInstance) {
          enterComponentScope(this);
          if (trackPerformance) {
            performance.beginUpdate(this);
          }
        },

        updated(this: ComponentPublicInstance) {
          if (trackPerformance) {
            performance.endUpdate(this);
          }
        },

        unmounted(this: ComponentPublicInstance) {
          if (detectMemoryLeaks) {
            memory.onUnmounted(this, logMemoryWarnings);
          }
          tracker.markUnmounted(this, logLifecycle);
          exitComponentScope(this);

          if (trackPerformance && logSlowComponents) {
            const id = tracker.getId(this);
            const record = id ? performance.records.get(id) : undefined;
            if (record?.isSlow) {
              console.warn(
                `[vue-sentinel-x] slow component: ${record.name}`,
                record,
              );
            }
          }
        },

        beforeUnmount(this: ComponentPublicInstance) {
          enterComponentScope(this);
        },
      });

      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", () => {
          if (topSlowInterval) {
            clearInterval(topSlowInterval);
          }
          if (trackPerformance) {
            performance.logTopSlowComponents();
            performance.stop();
          }
        });
      }
    },
  };
}
