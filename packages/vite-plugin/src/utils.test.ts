import { describe, expect, it } from "vitest";
import { isMainVueModule, isVueModule, normalizeModuleId } from "./utils.js";

describe("normalizeModuleId", () => {
  it("strips Vite query strings", () => {
    expect(normalizeModuleId("App.vue?vue&type=script")).toBe("App.vue");
  });
});

describe("isVueModule", () => {
  it("returns true for .vue paths", () => {
    expect(isVueModule("/src/App.vue")).toBe(true);
    expect(isVueModule("App.vue?vue&type=template")).toBe(true);
  });

  it("returns false for non-vue paths", () => {
    expect(isVueModule("/src/main.ts")).toBe(false);
  });
});

describe("isMainVueModule", () => {
  it("returns true only for main .vue module without query", () => {
    expect(isMainVueModule("/src/App.vue")).toBe(true);
    expect(isMainVueModule("App.vue?vue&type=script")).toBe(false);
  });
});
