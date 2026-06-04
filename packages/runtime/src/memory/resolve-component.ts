import { getCurrentInstance } from "vue";
import type { LifecycleTracker } from "../tracker.js";
import { getActiveScopeInstance } from "./active-scope.js";

export function resolveComponentId(
  tracker: LifecycleTracker,
): string | undefined {
  const scoped = getActiveScopeInstance();
  if (scoped) {
    return tracker.getId(scoped);
  }

  const instance = getCurrentInstance();
  if (!instance) {
    return undefined;
  }

  const target = instance.proxy ?? instance;
  return tracker.getId(target as object);
}
