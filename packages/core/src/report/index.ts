import { join } from "node:path";
import type { SentinelReportFile } from "./types.js";
import { writeHtmlReport } from "./write-html.js";
import { writeJsonReport } from "./write-json.js";

export { buildSentinelReport, type BuildReportInput } from "./build-report.js";
export type { RuntimeReportSection, SentinelReportFile } from "./types.js";
export { writeJsonReport } from "./write-json.js";
export { renderHtmlReport, writeHtmlReport } from "./write-html.js";

export async function writeReports(options: {
  outputDir: string;
  report: SentinelReportFile;
  json?: boolean;
  html?: boolean;
  jsonFilename?: string;
  htmlFilename?: string;
}): Promise<{ jsonPath?: string; htmlPath?: string }> {
  const result: { jsonPath?: string; htmlPath?: string } = {};

  if (options.json !== false) {
    const jsonPath = join(
      options.outputDir,
      options.jsonFilename ?? "sentinel-report.json",
    );
    await writeJsonReport(jsonPath, options.report);
    result.jsonPath = jsonPath;
  }

  if (options.html) {
    const htmlPath = join(
      options.outputDir,
      options.htmlFilename ?? "sentinel-report.html",
    );
    await writeHtmlReport(htmlPath, options.report);
    result.htmlPath = htmlPath;
  }

  return result;
}
