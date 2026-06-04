import { formatLearningReport, formatLearningReportText } from "../format/learning.js";
import { formatReport, formatReportText } from "../format/messages.js";
import { enrichFindings } from "../learning/enrich.js";
import { defaultRules } from "../rules/index.js";
import type { SentinelRule } from "../rules/types.js";
import type { IntelligenceContext, IntelligenceReport, RuleFinding } from "../types.js";

export type IntelligenceEngineOptions = {
  rules?: SentinelRule[];
  /**
   * When true, adds lessons with bad/good examples for each finding.
   * Ideal for junior developers learning while coding.
   */
  learningMode?: boolean;
};

/**
 * Runs static + runtime rules and produces beginner-friendly guidance.
 */
export class IntelligenceEngine {
  private readonly rules: SentinelRule[];
  private readonly learningMode: boolean;

  constructor(options: IntelligenceEngineOptions = {}) {
    this.rules = options.rules ?? defaultRules;
    this.learningMode = options.learningMode ?? false;
  }

  analyze(context: IntelligenceContext): IntelligenceReport {
    const findings = this.runRules(context);
    const deduped = dedupeFindings(findings);
    const { messages, summary } = formatReport(deduped);

    const report: IntelligenceReport = {
      generatedAt: new Date().toISOString(),
      findings: deduped,
      messages,
      summary,
    };

    if (this.learningMode) {
      const learningFindings = enrichFindings(deduped);
      const learning = formatLearningReport(learningFindings);
      report.learningMode = true;
      report.learningFindings = learningFindings;
      report.learningMessages = learning.messages;
      report.learningSummary = learning.summary;
    }

    return report;
  }

  /** Same as {@link analyze} but returns one printable string. */
  analyzeText(context: IntelligenceContext): string {
    const report = this.analyze(context);
    if (report.learningMode && report.learningFindings) {
      return formatLearningReportText(report.learningFindings);
    }
    return formatReportText(report.findings) === report.summary
      ? report.summary
      : formatReportText(report.findings);
  }

  log(context: IntelligenceContext, prefix = "[vue-sentinel-x]"): IntelligenceReport {
    const report = this.analyze(context);

    if (report.learningMode && report.learningMessages) {
      console.log(`${prefix} ${report.learningSummary ?? report.summary}`);
      for (const message of report.learningMessages) {
        console.log(`${prefix}\n${message}`);
      }
      return report;
    }

    console.log(`${prefix} ${report.summary}`);
    for (const message of report.messages) {
      console.log(`${prefix}\n${message}`);
    }
    return report;
  }

  isLearningModeEnabled(): boolean {
    return this.learningMode;
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
