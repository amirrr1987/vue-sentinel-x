export type VueSentinelXPluginOptions = {
  /** When true, logs every module that passes through the plugin. Default: true */
  logFiles?: boolean;
};

export type ProcessedModule = {
  id: string;
  isVue: boolean;
};
