import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

/**
 * Project-local ESLint rules for the Forma application framework.
 *
 * These rules intentionally apply to feature TSX files only. Theme and
 * shared component code is the controlled source for design tokens, while
 * feature code consumes those tokens.
 */

const COLOR_KEYS = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor',
  'fill',
  'stroke',
]);

const SPACING_KEYS = /^(?:p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|padding|margin|gap|rowGap|columnGap)$/;
const RAW_COLOR = /^(?:#(?:[\da-f]{3,8})|(?:rgb|rgba|hsl|hsla)\(|(?:transparent|currentColor|inherit|initial|unset|white|black|red|blue|green|gray|grey|yellow|orange|purple|pink|teal|navy|maroon|lime|aqua|fuchsia|silver|olive|gold)$)/i;

let styleExceptions = [];
try {
  const file = readFileSync(new URL('../docs/style-exceptions.json', import.meta.url), 'utf8');
  const parsed = JSON.parse(file);
  styleExceptions = Array.isArray(parsed.exceptions) ? parsed.exceptions : [];
} catch {
  // A missing optional exceptions file should leave the rule strict.
}

function isObjectExpression(node) {
  return node && node.type === 'ObjectExpression';
}

function isAllowedReference(node) {
  if (!node) return true;
  if (node.type === 'Literal') {
    return node.value === 0 || node.value === '0' || node.value === 'auto' || node.value === 'inherit' || node.value === 'currentColor';
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 1
      && node.quasis[0]?.value.raw === '' && node.quasis[1]?.value.raw === 'px') {
    return isAllowedReference(node.expressions[0]);
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    const value = node.quasis[0]?.value.raw ?? '';
    return value === '0' || value === 'auto' || value === 'inherit' || value === 'currentColor';
  }
  if (node.type === 'Identifier') return node.name === 'undefined';
  if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
    let current = node;
    while (current && (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')) current = current.object;
    return current?.type === 'Identifier' && ['theme', 'tokens', 'vercelTokens'].includes(current.name);
  }
  if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') {
    return isAllowedReference(node.callee);
  }
  return false;
}

function literalString(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0]?.value.raw ?? '';
  return null;
}

function rawColor(node) {
  const value = literalString(node);
  if (!value) return false;
  if (/^(?:text|primary|secondary|error|warning|success|info)\.[\w-]+$/.test(value)) return false;
  if (value === 'divider' || value.startsWith('var(--')) return false;
  return RAW_COLOR.test(value);
}

export function matchesStyleException(entries, filename, property, value) {
  return entries.some((entry) => (
    entry && entry.path === filename && entry.property === property && String(entry.value) === String(value) && typeof entry.reason === 'string' && entry.reason.trim().length > 0
  ));
}

function isExcepted(context, property, value) {
  const rawFilename = context.filename ?? (typeof context.getFilename === 'function' ? context.getFilename() : '');
  const filename = relative(process.cwd(), rawFilename).replaceAll('\\', '/');
  return matchesStyleException(styleExceptions, filename, property, value);
}

function isStyleAttribute(node) {
  return node?.type === 'JSXAttribute' && (node.name?.name === 'sx' || node.name?.name === 'style');
}

function propertyName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  return null;
}

function createDesignRule(context) {
  const styleBindings = new Map();
  const visitingBindings = new Set();
  function inspectObject(object) {
    for (const property of object.properties) {
      if (property.type !== 'Property') continue;
      const key = propertyName(property.key);
      if (key?.startsWith('.Mui') || key?.includes('.Mui')) {
        context.report({ node: property.key, messageId: 'globalMui' });
      }
      const value = property.value;
      const literal = literalString(value) ?? (value.type === 'Literal' ? value.value : undefined);
      if (COLOR_KEYS.has(key) && rawColor(value) && !isExcepted(context, key, literal)) {
        context.report({ node: value, messageId: 'rawColor' });
      }
      if (/^(?:fontSize|letterSpacing|fontWeight|lineHeight|borderRadius|boxShadow)$/.test(key) && !isAllowedReference(value) && !isExcepted(context, key, literal ?? value.value)) {
        context.report({ node: value, messageId: 'rawDesignValue', data: { key } });
      }
      if (SPACING_KEYS.test(key) && value.type === 'Literal' && typeof value.value === 'string' && !isAllowedReference(value) && !isExcepted(context, key, value.value)) {
        context.report({ node: value, messageId: 'rawSpacing' });
      }
      // Check nested responsive values, selector blocks and named style objects.
      if (!(COLOR_KEYS.has(key) && rawColor(value))) inspectExpression(value, key);
    }
  }

  function inspectExpression(expression, propertyKey) {
    if (propertyKey && COLOR_KEYS.has(propertyKey) && rawColor(expression) && !isExcepted(context, propertyKey, literalString(expression))) {
      context.report({ node: expression, messageId: 'rawColor' });
      return;
    }
    if (isObjectExpression(expression)) inspectObject(expression);
    if (expression?.type === 'ArrayExpression') {
      for (const element of expression.elements) inspectExpression(element, propertyKey);
    }
    if (expression?.type === 'ConditionalExpression' || expression?.type === 'LogicalExpression') {
      inspectExpression(expression.consequent ?? expression.left, propertyKey);
      inspectExpression(expression.alternate ?? expression.right, propertyKey);
    }
    if (expression?.type === 'ArrowFunctionExpression' || expression?.type === 'FunctionExpression') {
      inspectExpression(expression.body, propertyKey);
    }
    if (expression?.type === 'TSAsExpression' || expression?.type === 'TSTypeAssertion' || expression?.type === 'TypeCastExpression') {
      inspectExpression(expression.expression, propertyKey);
    }
    if (expression?.type === 'Identifier' && styleBindings.has(expression.name) && !visitingBindings.has(expression.name)) {
      visitingBindings.add(expression.name);
      inspectExpression(styleBindings.get(expression.name), propertyKey);
      visitingBindings.delete(expression.name);
    }
  }

  return {
    JSXAttribute(node) {
      if (isStyleAttribute(node) && node.value?.expression) inspectExpression(node.value.expression);
    },
    VariableDeclarator(node) {
      if (node.id?.type === 'Identifier' && node.init) styleBindings.set(node.id.name, node.init);
    },
    CallExpression(node) {
      const callee = node.callee;
      const isStyled = callee?.type === 'Identifier' && callee.name === 'styled'
        || callee?.type === 'MemberExpression' && callee.property?.type === 'Identifier' && callee.property.name === 'styled';
      const isStyledFactory = callee?.type === 'CallExpression' && (
        callee.callee?.type === 'Identifier' && callee.callee.name === 'styled'
        || callee.callee?.type === 'MemberExpression' && callee.callee.property?.type === 'Identifier' && callee.callee.property.name === 'styled'
      );
      if (isStyled || isStyledFactory) for (const argument of node.arguments) inspectExpression(argument);
    },
    TaggedTemplateExpression(node) {
      const tag = node.tag;
      const isStyledTag = tag?.type === 'MemberExpression' && tag.object?.type === 'Identifier' && tag.object.name === 'styled';
      if (isStyledTag) context.report({ node: tag, messageId: 'styledTemplate' });
    },
  };
}

const designRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Require feature styles to consume shared design tokens.' },
    schema: [],
    messages: {
      rawColor: 'Use a theme color token instead of a raw color literal.',
      rawDesignValue: 'Use a theme token for {{key}} instead of a raw style value.',
      rawSpacing: 'Use numeric MUI spacing or theme.spacing() instead of a raw spacing string.',
      globalMui: 'Do not override global .Mui selectors in feature code; fix the shared component or theme.',
      styledTemplate: 'Do not use styled template literals in feature code; use shared components and theme tokens.',
    },
  },
  create: createDesignRule,
};

const importsRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep feature code behind shared UI and avoid global styling escapes.' },
    schema: [],
    messages: {
      dataGrid: 'Import DataGrid through shared/ui DataTable; type-only imports are allowed.',
      globalStyle: 'Do not import CssBaseline or GlobalStyles in feature code; configure the shared theme.',
      cssImport: 'Do not import CSS files from feature code; use the shared theme and components.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === '@mui/x-data-grid' || source.startsWith('@mui/x-data-grid/')) {
          const isTypeImport = node.importKind === 'type';
          if (!isTypeImport && node.specifiers.some((specifier) => specifier.type === 'ImportNamespaceSpecifier' || specifier.type === 'ImportDefaultSpecifier')) {
            context.report({ node, messageId: 'dataGrid' });
          }
          for (const specifier of node.specifiers) {
            const imported = specifier.imported?.name;
            const isType = isTypeImport || specifier.importKind === 'type';
            if (!isType && imported === 'DataGrid') context.report({ node: specifier, messageId: 'dataGrid' });
          }
        }
        if (source === '@mui/material' || source === '@mui/material/GlobalStyles' || source === '@mui/material/CssBaseline') {
          if (node.importKind !== 'type' && node.specifiers.some((specifier) => specifier.type === 'ImportNamespaceSpecifier')) {
            context.report({ node, messageId: 'globalStyle' });
          }
          for (const specifier of node.specifiers) {
            const imported = specifier.imported?.name;
            const isType = node.importKind === 'type' || specifier.importKind === 'type';
            if (!isType && (imported === 'CssBaseline' || imported === 'GlobalStyles')) context.report({ node: specifier, messageId: 'globalStyle' });
          }
        }
        if (/\.(?:css|scss|sass|less)(?:\?.*)?$/.test(source)) context.report({ node, messageId: 'cssImport' });
      },
      ExportNamedDeclaration(node) {
        if (node.source?.value === '@mui/x-data-grid' && node.exportKind !== 'type') {
          context.report({ node, messageId: 'dataGrid' });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source?.value === '@mui/x-data-grid' && node.exportKind !== 'type') {
          context.report({ node, messageId: 'dataGrid' });
        }
      },
    };
  },
};

export const rules = {
  'design-tokens': designRule,
  'feature-imports': importsRule,
};

export default { rules };
