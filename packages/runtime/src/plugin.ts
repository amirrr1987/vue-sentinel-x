import type { App, ComponentPublicInstance, Plugin } from "vue";
import { resolveComponentName } from "./component-name.js";
import { createComponentId } from "./id.js";
import { sentinelTracker, type LifecycleTracker } from "./tracker.js";
import type { SentinelRuntimeOptions } from "./types.js";

export type SentinelVuePlugin = Plugin;

export function createSentinelPlugin(
  options: SentinelRuntimeOptions = {},
  tracker: LifecycleTracker = sentinelTracker,
): SentinelVuePlugin {
  const { logLifecycle = true } = options;

  return {
    install(app: App) {
      app.mixin({
        beforeCreate(this: ComponentPublicInstance) {
          const componentId = createComponentId();
          const name = resolveComponentName(this);
          tracker.register(this, name, componentId);
        },

        mounted(this: ComponentPublicInstance) {
          tracker.markMounted(this, logLifecycle);
        },

        unmounted(this: ComponentPublicInstance) {
          tracker.markUnmounted(this, logLifecycle);
        },
      });
    },
  };
}
