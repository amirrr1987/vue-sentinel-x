import { RUNTIME_LOG_PREFIX, sentinelTracker } from "../tracker.js";
import type { LifecycleTracker } from "../tracker.js";
import { installLongTaskObserver } from "./long-task-observer.js";
import { rankSlowComponents } from "./rankings.js";
import {
  resolveThresholds,
  type PerformanceThresholds,
} from "./thresholds.js";
import type {
  ComponentPerformanceRecord,
  ComponentUpdateStats,
  LongTaskRecord,
  PerformanceReport,
  SlowComponentRanking,
} from "./types.js";

type TimingMarks = {
  mountStart?: number;
  updateStart?: number;
};

const emptyUpdates = (): ComponentUpdateStats => ({
  count: 0,
  totalMs: 0,
  maxMs: 0,
  lastMs: 0,
  avgMs: 0,
});

export class PerformanceTracker {
  readonly records = new Map<string, ComponentPerformanceRecord>();
  readonly longTasks: LongTaskRecord[] = [];
  private readonly marks = new WeakMap<object, TimingMarks>();
  private readonly instanceToId = new WeakMap<object, string>();
  private thresholds: PerformanceThresholds = resolveThresholds();
  private teardownLongTaskObserver: (() => void) | undefined;
  private enabled = false;

  constructor(private readonly lifecycle: LifecycleTracker = sentinelTracker) {}

  configure(partial?: Partial<PerformanceThresholds>): void {
    this.thresholds = resolveThresholds(partial);
  }

  start(lifecycleEnabled: boolean): void {
    if (!lifecycleEnabled || this.enabled) {
      return;
    }
    this.enabled = true;
    this.teardownLongTaskObserver = installLongTaskObserver(
      this.lifecycle,
      this.thresholds.longTaskMs,
      (task) => this.recordLongTask(task),
    );
  }

  stop(): void {
    this.teardownLongTaskObserver?.();
    this.teardownLongTaskObserver = undefined;
    this.enabled = false;
  }

  linkInstance(instance: object, componentId: string): void {
    this.instanceToId.set(instance, componentId);
    if (!this.records.has(componentId)) {
      this.records.set(componentId, this.createRecord(componentId, ""));
    }
  }

  setName(componentId: string, name: string): void {
    const record = this.records.get(componentId);
    if (record) {
      record.name = name;
    }
  }

  beginMount(instance: object): void {
    const marks = this.marks.get(instance) ?? {};
    marks.mountStart = performance.now();
    this.marks.set(instance, marks);
  }

  endMount(instance: object): void {
    const id = this.instanceToId.get(instance);
    const marks = this.marks.get(instance);
    if (!id || marks?.mountStart === undefined) {
      return;
    }

    const duration = performance.now() - marks.mountStart;
    marks.mountStart = undefined;
    this.marks.set(instance, marks);

    const record = this.ensureRecord(id);
    record.mountDurationMs = duration;
    record.renderTimeMs = duration;

    if (duration >= this.thresholds.slowMountMs) {
      this.flagSlow(record, `mount took ${duration.toFixed(1)}ms`);
    }
  }

  beginUpdate(instance: object): void {
    const marks = this.marks.get(instance) ?? {};
    marks.updateStart = performance.now();
    this.marks.set(instance, marks);
  }

  endUpdate(instance: object): void {
    const id = this.instanceToId.get(instance);
    const marks = this.marks.get(instance);
    if (!id || marks?.updateStart === undefined) {
      return;
    }

    const duration = performance.now() - marks.updateStart;
    marks.updateStart = undefined;
    this.marks.set(instance, marks);

    const record = this.ensureRecord(id);
    const stats = record.updates;
    stats.count += 1;
    stats.totalMs += duration;
    stats.lastMs = duration;
    stats.maxMs = Math.max(stats.maxMs, duration);
    stats.avgMs = stats.totalMs / stats.count;

    if (duration >= this.thresholds.slowUpdateMs) {
      this.flagSlow(
        record,
        `update #${stats.count} took ${duration.toFixed(1)}ms`,
      );
    }
  }

  recordLongTask(task: LongTaskRecord): void {
    this.longTasks.push(task);
    if (!task.componentId) {
      return;
    }
    const record = this.records.get(task.componentId);
    if (!record) {
      return;
    }
    this.flagSlow(
      record,
      `long task ${task.durationMs.toFixed(1)}ms`,
    );
  }

  getTopSlowComponents(
    limit = this.thresholds.topSlowCount,
  ): SlowComponentRanking[] {
    return rankSlowComponents(this.records.values(), limit);
  }

  buildReport(): PerformanceReport {
    return {
      generatedAt: Date.now(),
      topSlowComponents: this.getTopSlowComponents(),
      longTasks: [...this.longTasks],
      slowComponentCount: [...this.records.values()].filter((r) => r.isSlow)
        .length,
    };
  }

  logTopSlowComponents(
    limit = this.thresholds.topSlowCount,
  ): SlowComponentRanking[] {
    const top = this.getTopSlowComponents(limit);
    if (top.length === 0) {
      console.log(`${RUNTIME_LOG_PREFIX} no slow components recorded yet`);
      return top;
    }

    console.log(
      `${RUNTIME_LOG_PREFIX} top ${top.length} slow components:`,
      top,
    );
    return top;
  }

  remove(instance: object): void {
    const id = this.instanceToId.get(instance);
    if (id) {
      this.records.delete(id);
    }
    this.marks.delete(instance);
  }

  clear(): void {
    this.records.clear();
    this.longTasks.length = 0;
  }

  private createRecord(
    componentId: string,
    name: string,
  ): ComponentPerformanceRecord {
    return {
      componentId,
      name,
      mountDurationMs: null,
      renderTimeMs: null,
      updates: emptyUpdates(),
      isSlow: false,
      slowReasons: [],
    };
  }

  private ensureRecord(componentId: string): ComponentPerformanceRecord {
    let record = this.records.get(componentId);
    if (!record) {
      record = this.createRecord(componentId, "");
      this.records.set(componentId, record);
    }
    return record;
  }

  private flagSlow(record: ComponentPerformanceRecord, reason: string): void {
    record.isSlow = true;
    if (!record.slowReasons.includes(reason)) {
      record.slowReasons.push(reason);
    }
  }
}

/** Global performance tracker. */
export const sentinelPerformance = new PerformanceTracker(sentinelTracker);
