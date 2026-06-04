import ts from "typescript";
import type { ImportedComponentRef } from "../types.js";

export type ScriptAstResult = {
  componentName?: string;
  importedComponents: ImportedComponentRef[];
};

/**
 * Walk the TypeScript AST of a Vue `<script>` block to find imports and optional `name`.
 */
export function analyzeScriptAst(
  scriptContent: string,
  filename: string,
): ScriptAstResult {
  if (!scriptContent.trim()) {
    return { importedComponents: [] };
  }

  const sourceFile = ts.createSourceFile(
    filename,
    scriptContent,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  const importedComponents: ImportedComponentRef[] = [];
  let componentName: string | undefined;

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      importedComponents.push(...importRefsFromDeclaration(node));
    }

    if (ts.isCallExpression(node) && isDefineOptionsCall(node)) {
      const name = nameFromOptionsArgument(node.arguments[0]);
      if (name) {
        componentName = name;
      }
    }

    if (ts.isExportAssignment(node) && !node.isExportEquals) {
      const name = componentNameFromExpression(node.expression);
      if (name) {
        componentName = name;
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return { componentName, importedComponents };
}

function importRefsFromDeclaration(
  node: ts.ImportDeclaration,
): ImportedComponentRef[] {
  const specifier = moduleSpecifierText(node.moduleSpecifier);
  if (!specifier || !isVueComponentSpecifier(specifier)) {
    return [];
  }

  const clause = node.importClause;
  if (!clause) {
    return [];
  }

  if (clause.name) {
    return [{ localName: clause.name.text, specifier }];
  }

  if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    return clause.namedBindings.elements.map((element) => ({
      localName: element.name.text,
      specifier,
    }));
  }

  return [];
}

function moduleSpecifierText(
  specifier: ts.Expression | undefined,
): string | null {
  if (!specifier) {
    return null;
  }
  if (ts.isStringLiteral(specifier)) {
    return specifier.text;
  }
  return null;
}

function isVueComponentSpecifier(specifier: string): boolean {
  return specifier.endsWith(".vue");
}

function isDefineOptionsCall(node: ts.CallExpression): boolean {
  const expr = node.expression;
  return ts.isIdentifier(expr) && expr.text === "defineOptions";
}

function nameFromOptionsArgument(
  arg: ts.Expression | undefined,
): string | undefined {
  if (!arg || !ts.isObjectLiteralExpression(arg)) {
    return undefined;
  }
  return readNameProperty(arg);
}

function componentNameFromExpression(
  expr: ts.Expression,
): string | undefined {
  if (ts.isObjectLiteralExpression(expr)) {
    return readNameProperty(expr);
  }
  if (ts.isCallExpression(expr) && isDefineComponentCall(expr)) {
    return nameFromOptionsArgument(expr.arguments[0]);
  }
  return undefined;
}

function isDefineComponentCall(node: ts.CallExpression): boolean {
  const expr = node.expression;
  return ts.isIdentifier(expr) && expr.text === "defineComponent";
}

function readNameProperty(obj: ts.ObjectLiteralExpression): string | undefined {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) {
      continue;
    }
    const key = prop.name;
    const keyText = ts.isIdentifier(key)
      ? key.text
      : ts.isStringLiteral(key)
        ? key.text
        : undefined;
    if (keyText !== "name") {
      continue;
    }
    const init = prop.initializer;
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
      return init.text;
    }
  }
  return undefined;
}
