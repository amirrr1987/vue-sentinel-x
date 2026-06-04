import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ComponentGraphFile } from "../types.js";

export async function writeComponentGraph(
  outputPath: string,
  graph: ComponentGraphFile,
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
}
