export type ComponentUpdateStats = {
  count: number;
  totalMs: number;
  maxMs: number;
  lastMs: number;
  avgMs: number;
};

export type ComponentPerformanceRecord = {
  componentId: string;
  name: string;
  /** `beforeMount` → `mounted` */
  mountDurationMs: number | null;
  /** Initial paint: same window as first mount */
  renderTimeMs: number | null;
  updates: ComponentUpdateStats;
  /** Flagged when mount/update/long-task thresholds exceeded */
  isSlow: boolean;
  slowReasons: string[];
};

export type LongTaskRecord = {
  durationMs: number;
  startTime: number;
  componentId?: string;
  componentName?: string;
};

export type SlowComponentRanking = {
  componentId: string;
  name: string;
  scoreMs: number;
  mountDurationMs: number | null;
  maxUpdateMs: number;
  avgUpdateMs: number;
  updateCount: number;
  slowReasons: string[];
};

export type PerformanceReport = {
  generatedAt: number;
  topSlowComponents: SlowComponentRanking[];
  longTasks: LongTaskRecord[];
  slowComponentCount: number;
};
