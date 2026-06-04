import { createHash } from "node:crypto";

/** Fast content fingerprint to skip unchanged re-parses. */
export function hashContent(source: string): string {
  return createHash("sha256").update(source).digest("hex").slice(0, 16);
}
