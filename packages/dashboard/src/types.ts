import type {
  ComponentGraphInput,
  IntelligenceReport,
  MemoryWarningInput,
  PerformanceRecordInput,
} from "@amirrr1987/vue-sentinel-x-core/browser";

/** Unified snapshot consumed by the dashboard UI. */
export type SentinelSnapshot = {
  source: "mock" | "live";
  projectRoot: string;
  generatedAt: string;
  componentGraph: ComponentGraphInput & {
    meta?: {
      componentCount: number;
      edgeCount: number;
      sharedCount: number;
    };
  };
  memory: {
    usedMB: number;
    totalMB: number;
    limitMB: number;
    /** Points for chart library (time label + MB) */
    history: Array<{ label: string; usedMB: number }>;
    warnings: MemoryWarningInput[];
  };
  performance: {
    records: PerformanceRecordInput[];
    longTaskCount: number;
    slowComponentCount: number;
  };
  report: IntelligenceReport;
};
