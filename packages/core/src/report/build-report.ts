import { buildIntelligenceContext } from "../context/build-context.js";
import { IntelligenceEngine } from "../engine/intelligence-engine.js";
import type { IntelligenceContext } from "../types.js";
import type { RuntimeReportSection, SentinelReportFile } from "./types.js";

export type BuildReportInput = {
  projectRoot: string;
  source?: SentinelReportFile["meta"]["source"];
  componentGraph?: SentinelReportFile["componentGraph"];
  runtime?: RuntimeReportSection;
  context?: IntelligenceContext;
  learningMode?: boolean;
};

const PACKAGE_VERSION = "0.0.1";

/**
 * Build a full sentinel report (graph + runtime + intelligence).
 */
export function buildSentinelReport(input: BuildReportInput): SentinelReportFile {
  const context =
    input.context ??
    buildIntelligenceContext({
      projectRoot: input.projectRoot,
      componentGraph: input.componentGraph,
      memoryWarnings: input.runtime?.memory?.warnings,
      performanceRecords: input.runtime?.performance?.records.map((r) => ({
        componentId: r.name,
        name: r.name,
        mountDurationMs: r.mountDurationMs,
        updates: {
          count: r.updateCount,
          avgMs: r.avgUpdateMs,
          maxMs: r.avgUpdateMs,
          totalMs: r.avgUpdateMs * r.updateCount,
        },
      })),
    });

  const engine = new IntelligenceEngine({
    learningMode: input.learningMode ?? false,
  });
  const intelligence = engine.analyze(context);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      projectRoot: input.projectRoot,
      version: PACKAGE_VERSION,
      source: input.source ?? "merged",
    },
    componentGraph: input.componentGraph,
    runtime: input.runtime,
    intelligence,
  };
}
