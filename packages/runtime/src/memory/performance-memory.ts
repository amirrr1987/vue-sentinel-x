import type { MemorySnapshot } from "./types.js";

type PerformanceMemory = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
};

/**
 * Read `performance.memory` when the browser exposes it (mainly Chromium).
 */
export function captureMemorySnapshot(): MemorySnapshot | null {
  if (typeof performance === "undefined") {
    return null;
  }

  const memory = (performance as Performance & { memory?: PerformanceMemory })
    .memory;
  if (!memory) {
    return null;
  }

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    capturedAt: Date.now(),
  };
}
