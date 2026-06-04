import type { RuleFinding, RuleSeverity } from "../types.js";

const SEVERITY_LABEL: Record<RuleSeverity, string> = {
  error: "Issue",
  warning: "Warning",
  info: "Tip",
};

const SEVERITY_ICON: Record<RuleSeverity, string> = {
  error: "✖",
  warning: "⚠",
  info: "ℹ",
};

/**
 * Format a single finding as a readable, beginner-friendly block.
 */
export function formatFinding(finding: RuleFinding, index?: number): string {
  const prefix =
    index !== undefined ? `${index + 1}. ` : "";
  const label = SEVERITY_LABEL[finding.severity];
  const icon = SEVERITY_ICON[finding.severity];
  const where = finding.component
    ? ` (${finding.component})`
    : finding.filePath
      ? ` (${basename(finding.filePath)})`
      : "";

  return [
    `${prefix}${icon} ${label}${where}`,
    "",
    finding.problem,
    "",
    `What to do: ${finding.suggestion}`,
    "",
    `Why it matters: ${finding.explanation}`,
  ].join("\n");
}

/**
 * Build a full text report from findings.
 */
export function formatReport(findings: RuleFinding[]): {
  messages: string[];
  summary: string;
} {
  if (findings.length === 0) {
    return {
      messages: [],
      summary:
        "✓ No problems detected. Your components look healthy from the data we have so far.",
    };
  }

  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  const tips = findings.filter((f) => f.severity === "info").length;

  const parts: string[] = [];
  if (errors > 0) {
    parts.push(`${errors} issue${errors === 1 ? "" : "s"}`);
  }
  if (warnings > 0) {
    parts.push(`${warnings} warning${warnings === 1 ? "" : "s"}`);
  }
  if (tips > 0) {
    parts.push(`${tips} tip${tips === 1 ? "" : "s"}`);
  }

  const summary = `Found ${parts.join(", ")}. Review the messages below.`;

  const messages = findings.map((f, i) => formatFinding(f, i));

  return { messages, summary };
}

/**
 * One concatenated string suitable for console or log files.
 */
export function formatReportText(findings: RuleFinding[]): string {
  const { messages, summary } = formatReport(findings);
  if (messages.length === 0) {
    return summary;
  }

  const divider = "\n" + "─".repeat(48) + "\n";
  return [summary, "", ...messages].join(divider);
}

function basename(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? path;
}
