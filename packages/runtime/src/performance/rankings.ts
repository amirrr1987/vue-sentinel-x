import type {
  ComponentPerformanceRecord,
  SlowComponentRanking,
} from "./types.js";

/** Score used to rank components (higher = slower). */
export function scoreComponent(record: ComponentPerformanceRecord): number {
  const mount = record.mountDurationMs ?? 0;
  const maxUpdate = record.updates.maxMs;
  const avgUpdate = record.updates.avgMs;
  return Math.max(mount, maxUpdate, avgUpdate * 2);
}

export function rankSlowComponents(
  records: Iterable<ComponentPerformanceRecord>,
  limit: number,
): SlowComponentRanking[] {
  const ranked = [...records]
    .filter(
      (r) =>
        r.isSlow ||
        r.mountDurationMs !== null ||
        r.updates.count > 0,
    )
    .map((r) => ({
      componentId: r.componentId,
      name: r.name,
      scoreMs: scoreComponent(r),
      mountDurationMs: r.mountDurationMs,
      maxUpdateMs: r.updates.maxMs,
      avgUpdateMs: r.updates.avgMs,
      updateCount: r.updates.count,
      slowReasons: [...r.slowReasons],
    }))
    .sort((a, b) => b.scoreMs - a.scoreMs || a.name.localeCompare(b.name));

  return ranked.slice(0, limit);
}
