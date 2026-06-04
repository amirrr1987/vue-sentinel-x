import { getActiveScopeInstance } from "../memory/active-scope.js";
import type { LifecycleTracker } from "../tracker.js";
import type { LongTaskRecord } from "./types.js";

export type LongTaskHandler = (task: LongTaskRecord) => void;

let observer: PerformanceObserver | undefined;

export function installLongTaskObserver(
  lifecycle: LifecycleTracker,
  longTaskThresholdMs: number,
  onLongTask: LongTaskHandler,
): () => void {
  if (typeof PerformanceObserver === "undefined") {
    return () => undefined;
  }

  try {
    observer?.disconnect();
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration < longTaskThresholdMs) {
          continue;
        }

        const instance = getActiveScopeInstance();
        const componentId = instance
          ? lifecycle.getId(instance)
          : undefined;
        const record = componentId
          ? lifecycle.getRecord(componentId)
          : undefined;
        const task: LongTaskRecord = {
          durationMs: entry.duration,
          startTime: entry.startTime,
          componentId,
          componentName: record?.name,
        };
        onLongTask(task);
      }
    });

    observer.observe({ entryTypes: ["longtask"] as PerformanceObserverInit["entryTypes"] });
  } catch {
    return () => undefined;
  }

  return () => {
    observer?.disconnect();
    observer = undefined;
  };
}
