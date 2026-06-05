export type { SentinelConfig as VueSentinelXPluginOptions } from "@amirrr1987/vue-sentinel-x-core";

export type ProcessedModule = {
  id: string;
  isVue: boolean;
};

export type VueFileStructure = {
  hasScript: boolean;
  hasTemplate: boolean;
  scriptSetup: boolean;
};

export type ImportedComponentRef = {
  /** Local binding name in the script (default or named import) */
  localName: string;
  /** Raw module specifier from the import */
  specifier: string;
  /** Resolved absolute path when available */
  resolvedPath?: string;
};

export type VueFileAnalysis = {
  filePath: string;
  componentName: string;
  importedComponents: ImportedComponentRef[];
  structure: VueFileStructure;
};

export type ComponentNode = {
  id: string;
  name: string;
  importedComponents: ImportedComponentRef[];
  structure: VueFileStructure;
  /** Resolved child component paths (parent → child) */
  children: string[];
  /** Resolved parent component paths */
  parents: string[];
};

export type ComponentEdge = {
  /** Parent component (importer) */
  from: string;
  /** Child component (imported `.vue`) */
  to: string;
  /** Local import name used in the parent component */
  via?: string;
};

export type SharedComponent = {
  id: string;
  name: string;
  /** Parent component paths that import this shared child */
  usedBy: string[];
  usageCount: number;
};

export type DependencyGraph = {
  components: ComponentNode[];
  edges: ComponentEdge[];
};

export type ComponentGraphMeta = {
  generatedAt: string;
  projectRoot: string;
  componentCount: number;
  edgeCount: number;
  sharedCount: number;
};

/** Serialized graph written to `analysis/component-graph.json` */
export type ComponentGraphFile = DependencyGraph & {
  meta: ComponentGraphMeta;
  sharedComponents: SharedComponent[];
};
