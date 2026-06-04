import type { ComponentResourceBundle, MemoryWarning } from "./types.js";

const HEAP_GROWTH_WARNING_BYTES = 5 * 1024 * 1024;

export function evaluateLeakRules(
  componentId: string,
  name: string,
  active: ComponentResourceBundle,
  heapDeltaBytes?: number,
): MemoryWarning[] {
  const warnings: MemoryWarning[] = [];

  if (active.listeners.length > 0) {
    warnings.push({
      code: "listeners-remain",
      componentId,
      name,
      message: `${active.listeners.length} event listener(s) were not removed before unmount`,
      resources: active.listeners,
    });
  }

  if (active.timers.length > 0) {
    warnings.push({
      code: "timers-remain",
      componentId,
      name,
      message: `${active.timers.length} timer(s) (setTimeout/setInterval) were not cleared before unmount`,
      resources: active.timers,
    });
  }

  if (active.watchers.length > 0) {
    warnings.push({
      code: "watchers-remain",
      componentId,
      name,
      message: `${active.watchers.length} watcher(s) were not stopped before unmount`,
      resources: active.watchers,
    });
  }

  if (
    heapDeltaBytes !== undefined &&
    heapDeltaBytes >= HEAP_GROWTH_WARNING_BYTES
  ) {
    warnings.push({
      code: "heap-growth",
      componentId,
      name,
      message: `JS heap grew by ${Math.round(heapDeltaBytes / 1024)} KB during component lifetime`,
      heapDeltaBytes,
    });
  }

  return warnings;
}

export function formatLeakWarning(name: string, warning: MemoryWarning): string {
  return `Possible memory leak detected in component ${name}: ${warning.message}`;
}
