import type { Plugin } from "vite";
import type { ProcessedModule, VueSentinelXPluginOptions } from "./types.js";
import { isVueModule } from "./utils.js";

export const PLUGIN_NAME = "vue-sentinel-x";

export type { ProcessedModule, VueSentinelXPluginOptions };

export function vueSentinelX(
  options: VueSentinelXPluginOptions = {},
): Plugin {
  const { logFiles = true } = options;

  return {
    name: PLUGIN_NAME,
    enforce: "pre",

    transform(_code, id) {
      const module: ProcessedModule = {
        id,
        isVue: isVueModule(id),
      };

      if (logFiles) {
        const label = module.isVue ? "vue" : "module";
        console.log(`[${PLUGIN_NAME}] ${label}: ${id}`);
      }

      if (module.isVue) {
        // Hook point: parse SFC, run @vue-sentinel-x/core analysis, etc.
      }

      return null;
    },
  };
}

export default vueSentinelX;
