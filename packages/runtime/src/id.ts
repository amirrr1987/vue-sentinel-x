let sequence = 0;

/** Generate a stable unique id per component instance. */
export function createComponentId(): string {
  sequence += 1;
  const time = Date.now().toString(36);
  return `vsx-${sequence}-${time}`;
}
