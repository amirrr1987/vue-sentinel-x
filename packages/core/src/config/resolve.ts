import { DEFAULT_CONFIG, DEFAULT_FEATURES, DEFAULT_REPORTS } from "./defaults.js";
import type {
  ResolvedSentinelConfig,
  SentinelConfig,
  SentinelFeatureFlags,
} from "./types.js";

function mergeFeatures(
  partial?: SentinelFeatureFlags,
): Required<SentinelFeatureFlags> {
  return { ...DEFAULT_FEATURES, ...partial };
}

/**
 * Merge user config with defaults and apply master `enabled` switch.
 */
export function resolveConfig(
  partial: SentinelConfig = {},
): ResolvedSentinelConfig {
  const enabled = partial.enabled ?? DEFAULT_CONFIG.enabled ?? true;
  const features = mergeFeatures({
    ...DEFAULT_CONFIG.features,
    ...partial.features,
  });

  if (!enabled) {
    for (const key of Object.keys(features) as (keyof SentinelFeatureFlags)[]) {
      features[key] = false;
    }
  }

  const reports = {
    ...DEFAULT_REPORTS,
    ...DEFAULT_CONFIG.reports,
    ...partial.reports,
  };

  if (!features.reports) {
    reports.enabled = false;
  }

  return {
    ...DEFAULT_CONFIG,
    ...partial,
    enabled: enabled ?? true,
    features,
    reports,
    performance: {
      graphDebounceMs:
        partial.performance?.graphDebounceMs ??
        DEFAULT_CONFIG.performance?.graphDebounceMs ??
        250,
      quiet:
        partial.performance?.quiet ??
        DEFAULT_CONFIG.performance?.quiet ??
        true,
    },
  };
}

export function isFeatureEnabled(
  config: ResolvedSentinelConfig,
  feature: keyof SentinelFeatureFlags,
): boolean {
  return config.enabled && config.features[feature];
}
