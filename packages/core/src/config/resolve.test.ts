import { describe, expect, it } from "vitest";
import { isFeatureEnabled, resolveConfig } from "./resolve.js";

describe("resolveConfig", () => {
  it("merges defaults when partial is empty", () => {
    const config = resolveConfig();
    expect(config.enabled).toBe(true);
    expect(config.features.graph).toBe(true);
  });

  it("disables all features when enabled is false", () => {
    const config = resolveConfig({ enabled: false });
    expect(config.enabled).toBe(false);
    expect(config.features.graph).toBe(false);
    expect(config.features.intelligence).toBe(false);
  });

  it("disables reports when reports feature flag is off", () => {
    const config = resolveConfig({ features: { reports: false } });
    expect(config.reports.enabled).toBe(false);
  });
});

describe("isFeatureEnabled", () => {
  it("returns false when master switch is off", () => {
    const config = resolveConfig({ enabled: false });
    expect(isFeatureEnabled(config, "graph")).toBe(false);
  });

  it("returns true for an enabled feature", () => {
    const config = resolveConfig({ features: { graph: true } });
    expect(isFeatureEnabled(config, "graph")).toBe(true);
  });
});
