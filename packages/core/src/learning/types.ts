export type CodeExample = {
  /** Short caption, e.g. "In your component" */
  label?: string;
  code: string;
  language?: "vue" | "javascript" | "typescript";
};

/** Educational content for junior developers. */
export type LearningLesson = {
  /** Plain-language definition */
  whatItIs: string;
  /** Why this hurts performance, stability, or maintainability */
  whyItsAProblem: string;
  /** Step-by-step fix in simple terms */
  howToFix: string;
  badExample: CodeExample;
  goodExample: CodeExample;
};

export type FindingWithLearning = {
  ruleId: string;
  severity: import("../types.js").RuleSeverity;
  component?: string;
  filePath?: string;
  problem: string;
  suggestion: string;
  explanation: string;
  learning: LearningLesson;
};
