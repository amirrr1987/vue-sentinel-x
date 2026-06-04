import type { ComponentGraphInput } from "../types.js";
import type { IntelligenceReport } from "../types.js";

export type RuntimeReportSection = {
  lifecycle?: Array<{
    componentId: string;
    name: string;
    mountedAt: number | null;
    unmountedAt: number | null;
  }>;
  memory?: {
    warnings: Array<{
      code: string;
      componentId: string;
      name: string;
      message: string;
    }>;
    heap?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };
  performance?: {
    slowComponentCount: number;
    longTaskCount: number;
    topSlow: Array<{
      name: string;
      scoreMs: number;
      mountDurationMs: number | null;
    }>;
    records: Array<{
      name: string;
      mountDurationMs: number | null;
      updateCount: number;
      avgUpdateMs: number;
    }>;
  };
};

export type SentinelReportFile = {
  meta: {
    generatedAt: string;
    projectRoot: string;
    version: string;
    source: "build" | "runtime" | "merged";
  };
  componentGraph?: ComponentGraphInput & {
    meta?: {
      componentCount: number;
      edgeCount: number;
      sharedCount: number;
    };
  };
  runtime?: RuntimeReportSection;
  intelligence: IntelligenceReport;
};
