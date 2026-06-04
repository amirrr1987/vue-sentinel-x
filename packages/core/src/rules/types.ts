import type { IntelligenceContext, RuleFinding } from "../types.js";

export type SentinelRule = {
  id: string;
  /** Short label shown in summaries */
  name: string;
  /** What this rule checks (one sentence) */
  description: string;
  run: (context: IntelligenceContext) => RuleFinding[];
};
