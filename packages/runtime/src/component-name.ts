import type { ComponentPublicInstance } from "vue";

/**
 * Resolve a human-readable component name from the instance / component type.
 */
export function resolveComponentName(
  instance: ComponentPublicInstance,
): string {
  const type = instance.$.type as {
    name?: string;
    __name?: string;
    displayName?: string;
  };

  if (type.name) {
    return type.name;
  }
  if (type.__name) {
    return type.__name;
  }
  if (type.displayName) {
    return type.displayName;
  }

  const optionsName = (instance.$options as { name?: string }).name;
  if (optionsName) {
    return optionsName;
  }

  return "Anonymous";
}
