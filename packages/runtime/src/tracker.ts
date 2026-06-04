import type {
  ComponentLifecycleRecord,
  LifecycleEvent,
  LifecycleEventType,
} from "./types.js";

export const RUNTIME_LOG_PREFIX = "[vue-sentinel-x]";

/**
 * Global in-memory store for component lifecycle data.
 */
export class LifecycleTracker {
  readonly records = new Map<string, ComponentLifecycleRecord>();
  private readonly instanceToId = new WeakMap<object, string>();
  private readonly events: LifecycleEvent[] = [];

  register(instance: object, name: string, componentId: string): void {
    this.instanceToId.set(instance, componentId);
    this.records.set(componentId, {
      componentId,
      name,
      mountedAt: null,
      unmountedAt: null,
    });
  }

  getId(instance: object): string | undefined {
    return this.instanceToId.get(instance);
  }

  markMounted(
    instance: object,
    log = true,
  ): ComponentLifecycleRecord | undefined {
    const id = this.instanceToId.get(instance);
    if (!id) {
      return undefined;
    }
    const record = this.records.get(id);
    if (!record) {
      return undefined;
    }

    const timestamp = Date.now();
    record.mountedAt = timestamp;
    this.pushEvent("mounted", record, timestamp);

    if (log) {
      console.log(`${RUNTIME_LOG_PREFIX} mounted`, { ...record });
    }

    return record;
  }

  markUnmounted(
    instance: object,
    log = true,
  ): ComponentLifecycleRecord | undefined {
    const id = this.instanceToId.get(instance);
    if (!id) {
      return undefined;
    }
    const record = this.records.get(id);
    if (!record) {
      return undefined;
    }

    const timestamp = Date.now();
    record.unmountedAt = timestamp;
    this.pushEvent("unmounted", record, timestamp);

    if (log) {
      console.log(`${RUNTIME_LOG_PREFIX} unmounted`, { ...record });
    }

    return record;
  }

  getRecord(componentId: string): ComponentLifecycleRecord | undefined {
    return this.records.get(componentId);
  }

  getActive(): ComponentLifecycleRecord[] {
    return [...this.records.values()].filter(
      (r) => r.mountedAt !== null && r.unmountedAt === null,
    );
  }

  getEvents(): readonly LifecycleEvent[] {
    return this.events;
  }

  clear(): void {
    this.records.clear();
    this.events.length = 0;
  }

  toJSON(): ComponentLifecycleRecord[] {
    return [...this.records.values()];
  }

  private pushEvent(
    type: LifecycleEventType,
    record: ComponentLifecycleRecord,
    timestamp: number,
  ): void {
    this.events.push({
      type,
      componentId: record.componentId,
      name: record.name,
      timestamp,
    });
  }
}

/** Shared global tracker used by the Vue plugin. */
export const sentinelTracker = new LifecycleTracker();
