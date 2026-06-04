import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { SentinelReportFile } from "./types.js";

export async function writeJsonReport(
  filePath: string,
  report: SentinelReportFile,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
