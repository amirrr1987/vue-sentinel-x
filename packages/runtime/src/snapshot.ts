import { captureMemorySnapshot } from "./memory/performance-memory.js";
import { sentinelMemory } from "./memory/memory-tracker.js";
import { sentinelPerformance } from "./performance/performance-tracker.js";
import { sentinelTracker } from "./tracker.js";
import type { RuntimeReportSection } from "@amirrr1987/vue-sentinel-x-core";

/** Serializable runtime data for reports and the dashboard. */
export function captureRuntimeSnapshot(): RuntimeReportSection {
  const heap = captureMemorySnapshot();

  return {
    lifecycle: sentinelTracker.toJSON(),
    memory: {
      warnings: sentinelMemory.getWarnings().map((w) => ({
        code: w.code,
        componentId: w.componentId,
        name: w.name,
        message: w.message,
      })),
      heap: heap
        ? {
            usedJSHeapSize: heap.usedJSHeapSize,
            totalJSHeapSize: heap.totalJSHeapSize,
            jsHeapSizeLimit: heap.jsHeapSizeLimit,
          }
        : undefined,
    },
    performance: {
      slowComponentCount: [...sentinelPerformance.records.values()].filter(
        (r) => r.isSlow,
      ).length,
      longTaskCount: sentinelPerformance.longTasks.length,
      topSlow: sentinelPerformance.getTopSlowComponents(10).map((r) => ({
        name: r.name,
        scoreMs: r.scoreMs,
        mountDurationMs: r.mountDurationMs,
      })),
      records: [...sentinelPerformance.records.values()].map((r) => ({
        name: r.name,
        mountDurationMs: r.mountDurationMs,
        updateCount: r.updates.count,
        avgUpdateMs: r.updates.avgMs,
      })),
    },
  };
}

/** Expose live data for the dashboard (browser only). */
export function exposeRuntimeBridge(): void {
  if (typeof window === "undefined") {
    return;
  }
  (window as Window & { __VUE_SENTINEL_X__?: unknown }).__VUE_SENTINEL_X__ = {
    captureSnapshot: captureRuntimeSnapshot,
    tracker: sentinelTracker,
    memory: sentinelMemory,
    performance: sentinelPerformance,
  };
}
