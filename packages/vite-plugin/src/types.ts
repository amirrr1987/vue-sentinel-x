export type VueSentinelXPluginOptions = {
  /** When true, logs every module that passes through the plugin. Default: true */
  logFiles?: boolean;
  /** When true, logs the component dependency graph to the console. Default: true */
  logGraph?: boolean;
};

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
};

export type ComponentEdge = {
  from: string;
  to: string;
  /** Local import name used in the parent component */
  via?: string;
};

export type DependencyGraph = {
  components: ComponentNode[];
  edges: ComponentEdge[];
};
