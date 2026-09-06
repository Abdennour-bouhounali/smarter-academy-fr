// Collects the student-visible TEXT of an AST node, keeping mathematical
// notation apart from prose.
//
// Why the split: « f(6) » inside $…$ is a notation exposure, not a French
// word, and the lexicon scans the two with different patterns. MathText is the
// platform's single KaTeX renderer, so its children are the only place $…$ can
// legitimately appear (docs/architecture/KNOWLEDGE_MAP.md).

const MATH_SPLIT = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;

/** Splits a raw string into {text, notation[]}: $…$ payloads leave the prose. */
export function splitMath(raw) {
  const notation = [];
  const text = String(raw ?? '')
    .split(MATH_SPLIT)
    .map((chunk) => {
      const m = /^\$\$?([^$]+)\$\$?$/.exec(chunk);
      if (m) {
        notation.push(m[1].trim());
        return ' ';
      }
      return chunk;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, notation };
}

const merge = (acc, part) => {
  if (part.text) acc.text = acc.text ? `${acc.text} ${part.text}` : part.text;
  acc.notation.push(...part.notation);
  return acc;
};

/**
 * Walks a node and returns every literal string a student could read.
 * Deliberately ignores JSX attribute values (className, ids, aria hooks…) —
 * only children, and the attributes an explicit caller asks for.
 */
export function collectText(node) {
  const acc = { text: '', notation: [] };
  if (!node) return acc;

  const visit = (n) => {
    if (!n || typeof n !== 'object') return;
    switch (n.type) {
      case 'StringLiteral':
        merge(acc, splitMath(n.value));
        return;
      case 'JSXText':
        merge(acc, splitMath(n.value));
        return;
      case 'TemplateLiteral': {
        // `${…}` becomes a neutral placeholder: its value is dynamic, and
        // pretending to know it would create false lexicon hits.
        const raw = n.quasis.map((q) => q.value.cooked ?? '').join(' ‹› ');
        merge(acc, splitMath(raw));
        n.expressions.forEach(visit);
        return;
      }
      case 'JSXExpressionContainer':
        visit(n.expression);
        return;
      case 'JSXElement':
        n.children.forEach(visit);
        return;
      case 'JSXFragment':
        n.children.forEach(visit);
        return;
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        visit(n.body);
        return;
      case 'BlockStatement':
        n.body.forEach(visit);
        return;
      case 'ReturnStatement':
        visit(n.argument);
        return;
      case 'IfStatement':
        visit(n.consequent); visit(n.alternate);
        return;
      case 'ConditionalExpression':
        visit(n.consequent); visit(n.alternate);
        return;
      case 'LogicalExpression':
        visit(n.left); visit(n.right);
        return;
      case 'ArrayExpression':
        n.elements.forEach(visit);
        return;
      case 'ObjectExpression':
        n.properties.forEach((p) => { if (p.type === 'ObjectProperty') visit(p.value); });
        return;
      case 'CallExpression':
        n.arguments.forEach(visit);
        return;
      case 'BinaryExpression':
        visit(n.left); visit(n.right);
        return;
      default:
        return;
    }
  };

  visit(node);
  return acc;
}
