/** Default thresholds (ms) — tuned for ~60fps (16.7ms per frame). */
export const DEFAULT_SLOW_MOUNT_MS = 50;
export const DEFAULT_SLOW_UPDATE_MS = 16;
export const DEFAULT_LONG_TASK_MS = 50;
export const DEFAULT_TOP_SLOW_COUNT = 10;

export type PerformanceThresholds = {
  slowMountMs: number;
  slowUpdateMs: number;
  longTaskMs: number;
  topSlowCount: number;
};

export function resolveThresholds(
  partial?: Partial<PerformanceThresholds>,
): PerformanceThresholds {
  return {
    slowMountMs: partial?.slowMountMs ?? DEFAULT_SLOW_MOUNT_MS,
    slowUpdateMs: partial?.slowUpdateMs ?? DEFAULT_SLOW_UPDATE_MS,
    longTaskMs: partial?.longTaskMs ?? DEFAULT_LONG_TASK_MS,
    topSlowCount: partial?.topSlowCount ?? DEFAULT_TOP_SLOW_COUNT,
  };
}
