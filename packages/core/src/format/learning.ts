import type { FindingWithLearning } from "../learning/types.js";
import type { RuleSeverity } from "../types.js";

const SEVERITY_LABEL: Record<RuleSeverity, string> = {
  error: "Issue",
  warning: "Warning",
  info: "Tip",
};

function formatCodeBlock(example: {
  code: string;
  language?: string;
  label?: string;
}): string {
  const lang = example.language ?? "text";
  const header = example.label ? `// ${example.label}\n` : "";
  return ["```" + lang, header + example.code.trim(), "```"].join("\n");
}

/**
 * Full Learning Mode block for one finding.
 */
export function formatLearningFinding(
  finding: FindingWithLearning,
  index?: number,
): string {
  const { learning } = finding;
  const prefix = index !== undefined ? `${index + 1}. ` : "";
  const label = SEVERITY_LABEL[finding.severity];
  const where = finding.component
    ? ` — ${finding.component}`
    : finding.filePath
      ? ` — ${basename(finding.filePath)}`
      : "";

  return [
    `${prefix}📚 ${label}${where}`,
    "",
    "What it is:",
    learning.whatItIs,
    "",
    "Why it's a problem:",
    learning.whyItsAProblem,
    "",
    "How to fix it:",
    learning.howToFix,
    "",
    "What we noticed in your app:",
    finding.problem,
    "",
    "❌ Bad example:",
    formatCodeBlock(finding.learning.badExample),
    "",
    "✅ Good example:",
    formatCodeBlock(finding.learning.goodExample),
  ].join("\n");
}

export function formatLearningReport(findings: FindingWithLearning[]): {
  messages: string[];
  summary: string;
} {
  if (findings.length === 0) {
    return {
      messages: [],
      summary:
        "✓ Learning Mode: no issues to study right now. Keep building!",
    };
  }

  const summary = `Learning Mode — ${findings.length} topic${findings.length === 1 ? "" : "s"} to review. Each section explains the idea, why it matters, and shows bad vs good code.`;

  return {
    summary,
    messages: findings.map((f, i) => formatLearningFinding(f, i)),
  };
}

export function formatLearningReportText(
  findings: FindingWithLearning[],
): string {
  const { messages, summary } = formatLearningReport(findings);
  if (messages.length === 0) {
    return summary;
  }
  const divider = "\n" + "═".repeat(48) + "\n";
  return [summary, "", ...messages].join(divider);
}

function basename(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? path;
}
