import { RUNTIME_LOG_PREFIX, sentinelTracker } from "../tracker.js";
import type { LifecycleTracker } from "../tracker.js";
import { evaluateLeakRules, formatLeakWarning } from "./leak-rules.js";
import { captureMemorySnapshot } from "./performance-memory.js";
import { ResourceRegistry } from "./resource-registry.js";
import type { MemorySnapshot, MemoryWarning } from "./types.js";

export class MemoryTracker {
  readonly registry = new ResourceRegistry();
  readonly warnings: MemoryWarning[] = [];
  private readonly heapAtMount = new Map<string, MemorySnapshot>();

  constructor(private readonly lifecycle: LifecycleTracker) {}

  onMounted(instance: object): void {
    const id = this.lifecycle.getId(instance);
    if (!id) {
      return;
    }
    const snapshot = captureMemorySnapshot();
    if (snapshot) {
      this.heapAtMount.set(id, snapshot);
    }
  }

  onUnmounted(
    instance: object,
    logWarnings = true,
  ): MemoryWarning[] {
    const id = this.lifecycle.getId(instance);
    const record = id ? this.lifecycle.getRecord(id) : undefined;
    if (!id || !record) {
      return [];
    }

    const active = this.registry.getActiveResources(id);
    const heapAtMount = this.heapAtMount.get(id);
    const heapAtUnmount = captureMemorySnapshot();
    this.heapAtMount.delete(id);

    const heapDeltaBytes =
      heapAtMount && heapAtUnmount
        ? heapAtUnmount.usedJSHeapSize - heapAtMount.usedJSHeapSize
        : undefined;

    const bundle = active ?? {
      listeners: [],
      timers: [],
      watchers: [],
    };

    const leaks = evaluateLeakRules(
      id,
      record.name,
      bundle,
      heapDeltaBytes,
    );

    for (const warning of leaks) {
      this.warnings.push(warning);
      if (logWarnings) {
        console.warn(
          `${RUNTIME_LOG_PREFIX} ${formatLeakWarning(record.name, warning)}`,
          warning,
        );
      }
    }

    if (leaks.length > 0) {
      this.lifecycle.attachMemoryWarnings(instance, leaks);
    }

    this.registry.removeComponent(id);
    return leaks;
  }

  getWarnings(): readonly MemoryWarning[] {
    return this.warnings;
  }

  clear(): void {
    this.warnings.length = 0;
    this.heapAtMount.clear();
    this.registry.clear();
  }
}

/** Global memory tracker paired with {@link sentinelTracker}. */
export const sentinelMemory = new MemoryTracker(sentinelTracker);
