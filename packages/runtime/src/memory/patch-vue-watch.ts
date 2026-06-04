import * as Vue from "vue";
import type { LifecycleTracker } from "../tracker.js";
import { resolveComponentId } from "./resolve-component.js";
import type { ResourceRegistry } from "./resource-registry.js";

const PATCHED_KEY = "__sentinelWatchPatched";

function wrapStop(
  componentId: string,
  registry: ResourceRegistry,
  stop: () => void,
): () => void {
  return () => {
    registry.markWatcherStopped(componentId, stop);
    stop();
  };
}

/**
 * Patch `vue.watch` / `vue.watchEffect` on the Vue module object.
 * Call `prepareSentinelRuntime()` before other imports when possible.
 */
export function installWatchPatches(
  tracker: LifecycleTracker,
  registry: ResourceRegistry,
): void {
  const vueModule = Vue as typeof Vue & { [PATCHED_KEY]?: boolean };
  if (vueModule[PATCHED_KEY]) {
    return;
  }

  const originalWatch = Vue.watch;
  const originalWatchEffect = Vue.watchEffect;

  const patchedWatch: typeof Vue.watch = ((...args: never[]) => {
    const stop = (originalWatch as (...a: never[]) => () => void)(...args);
    const componentId = resolveComponentId(tracker);
    if (componentId) {
      const wrapped = wrapStop(componentId, registry, stop);
      registry.trackWatcher(componentId, {
        type: "watch",
        stop: wrapped,
      });
      return wrapped;
    }
    return stop;
  }) as typeof Vue.watch;

  const patchedWatchEffect: typeof Vue.watchEffect = ((...args: never[]) => {
    const stop = (originalWatchEffect as (...a: never[]) => () => void)(...args);
    const componentId = resolveComponentId(tracker);
    if (componentId) {
      const wrapped = wrapStop(componentId, registry, stop);
      registry.trackWatcher(componentId, {
        type: "watchEffect",
        stop: wrapped,
      });
      return wrapped;
    }
    return stop;
  }) as typeof Vue.watchEffect;

  try {
    (vueModule as Record<string, unknown>).watch = patchedWatch;
    (vueModule as Record<string, unknown>).watchEffect = patchedWatchEffect;
    vueModule[PATCHED_KEY] = true;
  } catch {
    // Some bundlers freeze the module namespace.
  }
}
