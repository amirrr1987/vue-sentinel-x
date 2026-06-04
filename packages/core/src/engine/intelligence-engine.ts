import { formatReport, formatReportText } from "../format/messages.js";
import { defaultRules } from "../rules/index.js";
import type { SentinelRule } from "../rules/types.js";
import type { IntelligenceContext, IntelligenceReport, RuleFinding } from "../types.js";

export type IntelligenceEngineOptions = {
  rules?: SentinelRule[];
};

/**
 * Runs static + runtime rules and produces beginner-friendly guidance.
 */
export class IntelligenceEngine {
  private readonly rules: SentinelRule[];

  constructor(options: IntelligenceEngineOptions = {}) {
    this.rules = options.rules ?? defaultRules;
  }

  analyze(context: IntelligenceContext): IntelligenceReport {
    const findings = this.runRules(context);
    const deduped = dedupeFindings(findings);
    const { messages, summary } = formatReport(deduped);

    return {
      generatedAt: new Date().toISOString(),
      findings: deduped,
      messages,
      summary,
    };
  }

  /** Same as {@link analyze} but returns one printable string. */
  analyzeText(context: IntelligenceContext): string {
    const report = this.analyze(context);
    return formatReportText(report.findings) === report.summary
      ? report.summary
      : formatReportText(report.findings);
  }

  log(context: IntelligenceContext, prefix = "[vue-sentinel-x]"): IntelligenceReport {
    const report = this.analyze(context);
    console.log(`${prefix} ${report.summary}`);
    for (const message of report.messages) {
      console.log(`${prefix}\n${message}`);
    }
    return report;
  }

  getRules(): readonly SentinelRule[] {
    return this.rules;
  }

  private runRules(context: IntelligenceContext): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const rule of this.rules) {
      try {
        findings.push(...rule.run(context));
      } catch (error) {
        findings.push({
          ruleId: "engine-error",
          severity: "warning",
          problem: `Rule "${rule.id}" failed to run.`,
          suggestion: "Report this to the vue-sentinel-x maintainers.",
          explanation:
            error instanceof Error ? error.message : String(error),
        });
      }
    }
    return findings;
  }
}

/** Prefer deduplicating overlapping memory messages (specific + summary). */
function dedupeFindings(findings: RuleFinding[]): RuleFinding[] {
  const seen = new Set<string>();
  const result: RuleFinding[] = [];

  const priority = (id: string): number => {
    if (id === "memory-leak-detected") {
      return 1;
    }
    if (id.startsWith("memory-") && id !== "memory-leak-detected") {
      return 2;
    }
    return 0;
  };

  const sorted = [...findings].sort(
    (a, b) => priority(a.ruleId) - priority(b.ruleId),
  );

  for (const finding of sorted) {
    const key = `${finding.ruleId}:${finding.filePath ?? ""}:${finding.component ?? ""}:${finding.problem.slice(0, 40)}`;
    if (seen.has(key)) {
      continue;
    }

    const component = finding.component;
    const filePath = finding.filePath;
    if (component && filePath) {
      const hasMemorySummary = result.some(
        (r) =>
          r.ruleId === "memory-leak-detected" &&
          r.filePath === filePath &&
          r.component === component,
      );
      if (
        hasMemorySummary &&
        finding.ruleId.startsWith("memory-") &&
        finding.ruleId !== "memory-leak-detected"
      ) {
        continue;
      }

      if (
        hasMemorySummary &&
        finding.ruleId === "watchers-not-stopped"
      ) {
        continue;
      }
    }

    seen.add(key);
    result.push(finding);
  }

  return result;
}
