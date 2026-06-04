/** Strip Vite query strings (e.g. `App.vue?vue&type=script`) before extension checks. */
export function normalizeModuleId(id: string): string {
  return id.split("?")[0];
}

export function isVueModule(id: string): boolean {
  return normalizeModuleId(id).endsWith(".vue");
}
