import type { Plugin } from "vite";
import { analyzeVueFile } from "./analysis/analyze-vue-file.js";
import { DependencyGraphBuilder } from "./graph/index.js";
import type {
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
  VueSentinelXPluginOptions,
} from "./types.js";
import { isMainVueModule, isVueModule } from "./utils.js";

export const PLUGIN_NAME = "vue-sentinel-x";

export type {
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
  VueSentinelXPluginOptions,
};

export { analyzeVueFile } from "./analysis/analyze-vue-file.js";
export { DependencyGraphBuilder } from "./graph/index.js";

const GRAPH_LOG_DEBOUNCE_MS = 150;

export function vueSentinelX(
  options: VueSentinelXPluginOptions = {},
): Plugin {
  const { logFiles = true, logGraph = true } = options;
  const graph = new DependencyGraphBuilder();
  let graphLogTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleGraphLog = (): void => {
    if (!logGraph) {
      return;
    }
    if (graphLogTimer) {
      clearTimeout(graphLogTimer);
    }
    graphLogTimer = setTimeout(() => {
      graphLogTimer = undefined;
      const payload = graph.toJSON();
      console.log(
        `[${PLUGIN_NAME}] dependency graph:\n${JSON.stringify(payload, null, 2)}`,
      );
    }, GRAPH_LOG_DEBOUNCE_MS);
  };

  return {
    name: PLUGIN_NAME,
    enforce: "pre",

    transform(code, id) {
      const module: ProcessedModule = {
        id,
        isVue: isVueModule(id),
      };

      if (logFiles) {
        const label = module.isVue ? "vue" : "module";
        console.log(`[${PLUGIN_NAME}] ${label}: ${id}`);
      }

      if (isMainVueModule(id)) {
        const analysis = analyzeVueFile(code, id);
        if (analysis) {
          graph.add(analysis);
          scheduleGraphLog();
        }
      }

      return null;
    },

    buildEnd() {
      if (graphLogTimer) {
        clearTimeout(graphLogTimer);
        graphLogTimer = undefined;
      }
      if (logGraph && graph.toJSON().components.length > 0) {
        const payload = graph.toJSON();
        console.log(
          `[${PLUGIN_NAME}] dependency graph (build end):\n${JSON.stringify(payload, null, 2)}`,
        );
      }
    },
  };
}

export default vueSentinelX;
