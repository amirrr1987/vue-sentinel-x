import type { LifecycleTracker } from "../tracker.js";
import { installGlobalPatches } from "./patch-globals.js";
import { installWatchPatches } from "./patch-vue-watch.js";
import type { MemoryTracker } from "./memory-tracker.js";

let prepared = false;

/**
 * Install global patches early (before `createApp`) for best coverage.
 * Safe to call multiple times.
 */
export function prepareSentinelRuntime(
  lifecycle: LifecycleTracker,
  memory: MemoryTracker,
): void {
  if (prepared) {
    return;
  }
  prepared = true;
  installGlobalPatches(lifecycle, memory.registry);
  installWatchPatches(lifecycle, memory.registry);
}
