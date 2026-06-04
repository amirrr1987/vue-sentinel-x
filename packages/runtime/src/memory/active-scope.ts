/**
 * Stack of component instances currently running lifecycle / setup code.
 * Used when `getCurrentInstance()` is unavailable (e.g. async callbacks).
 */
const scopeStack: object[] = [];

export function enterComponentScope(instance: object): void {
  scopeStack.push(instance);
}

export function exitComponentScope(instance: object): void {
  const index = scopeStack.lastIndexOf(instance);
  if (index !== -1) {
    scopeStack.splice(index, 1);
  }
}

export function getActiveScopeInstance(): object | undefined {
  return scopeStack[scopeStack.length - 1];
}

export function clearComponentScope(): void {
  scopeStack.length = 0;
}
