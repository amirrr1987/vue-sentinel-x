import { parse, type SFCParseResult } from "@vue/compiler-sfc";
import type { VueFileStructure } from "../types.js";

export type ParsedSfc = {
  descriptor: SFCParseResult["descriptor"];
  structure: VueFileStructure;
  scriptSources: string[];
};

/**
 * Split a `.vue` file into SFC blocks (script, template, styles) using the Vue compiler.
 */
export function parseVueSfc(
  source: string,
  filename: string,
): ParsedSfc | null {
  const { descriptor, errors } = parse(source, { filename });

  if (errors.length > 0) {
    return null;
  }

  const scriptSources: string[] = [];
  if (descriptor.scriptSetup?.content) {
    scriptSources.push(descriptor.scriptSetup.content);
  }
  if (descriptor.script?.content) {
    scriptSources.push(descriptor.script.content);
  }

  const structure: VueFileStructure = {
    hasScript: Boolean(descriptor.script || descriptor.scriptSetup),
    hasTemplate: Boolean(descriptor.template),
    scriptSetup: Boolean(descriptor.scriptSetup),
  };

  return { descriptor, structure, scriptSources };
}
