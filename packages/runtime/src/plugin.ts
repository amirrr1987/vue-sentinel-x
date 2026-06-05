import type { App, ComponentPublicInstance, Plugin } from "vue";
import { resolveConfig, type SentinelConfig } from "@amirrr1987/vue-sentinel-x-core";
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
import { exposeRuntimeBridge } from "./snapshot.js";
import { sentinelTracker, type LifecycleTracker } from "./tracker.js";
import type { PerformanceThresholds } from "./performance/thresholds.js";

export type SentinelVuePlugin = Plugin;

export type SentinelRuntimeOptions = Partial<SentinelConfig> & {
  performanceThresholds?: Partial<PerformanceThresholds>;
};

export function createSentinelPlugin(
  options: SentinelRuntimeOptions = {},
  tracker: LifecycleTracker = sentinelTracker,
  memory: MemoryTracker = sentinelMemory,
  performance: PerformanceTracker = sentinelPerformance,
): SentinelVuePlugin {
  const config = resolveConfig(options);
  const thresholds = options.performanceThresholds;

  if (!config.enabled || !config.features.runtime) {
    return { install() {} };
  }

  const lifecycleOn = config.features.lifecycle;
  const memoryOn = config.features.memory;
  const perfOn = config.features.performance;

  const logLifecycle = config.logLifecycle ?? false;
  const detectMemoryLeaks = memoryOn && (config.detectMemoryLeaks ?? true);
  const logMemoryWarnings = config.logMemoryWarnings ?? true;
  const trackPerformance = perfOn && (config.trackPerformance ?? true);
  const logSlowComponents = config.logSlowComponents ?? false;
  const logTopSlowIntervalMs = config.logTopSlowIntervalMs ?? false;

  let topSlowInterval: ReturnType<typeof setInterval> | undefined;

  return {
    install(app: App) {
      exposeRuntimeBridge();

      if (detectMemoryLeaks) {
        prepareSentinelRuntime(tracker, memory);
      }

      if (trackPerformance) {
        performance.configure(thresholds);
        performance.start(true);
      }

      if (logTopSlowIntervalMs && trackPerformance) {
        topSlowInterval = setInterval(() => {
          performance.logTopSlowComponents();
        }, logTopSlowIntervalMs);
      }

      app.mixin({
        beforeCreate(this: ComponentPublicInstance) {
          if (!lifecycleOn && !memoryOn && !perfOn) {
            return;
          }
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
          if (lifecycleOn) {
            tracker.markMounted(this, logLifecycle);
          }
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
          if (lifecycleOn) {
            tracker.markUnmounted(this, logLifecycle);
          }
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
            performance.stop();
          }
        });
      }
    },
  };
}
