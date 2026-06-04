import type { RuleFinding } from "../types.js";
import { getLearningLesson } from "./catalog.js";
import type { FindingWithLearning } from "./types.js";

export function enrichFinding(finding: RuleFinding): FindingWithLearning {
  return {
    ...finding,
    learning: getLearningLesson(finding.ruleId),
  };
}

export function enrichFindings(
  findings: RuleFinding[],
): FindingWithLearning[] {
  return findings.map(enrichFinding);
}
