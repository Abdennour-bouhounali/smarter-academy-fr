// The EXPOSURE STREAM: everything a student can read in one lesson, in the
// order they meet it, each piece tagged with whether it TEACHES or DEMANDS.
//
// This is the model behind the knowledge-before-demand law
// (docs/architecture/KNOWLEDGE_DEPENDENCY.md):
//
//   teaching  brief · intro · step title/subtitle · step content · gated
//             reveal · footer            → may establish a concept
//   brick     <KnowledgeBrick id>        → establishes it, by declaration
//   jit       q.above · q.intro          → visible at the moment of demand
//   demand    prompt · options · rows    → the student must already know it
//   postAnswer explain · correction …    → REINFORCES; never establishes
//
// Source order is the timeline: a brick placed after a question in the same
// step establishes only for what follows it.

import { relative, resolve as resolvePathJoin, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { traverse, parseFile, literalValue, propOf, repoRoot } from './lessonAst.mjs';
import { collectText, splitMath } from './collectText.mjs';

const resolvePath = (dir, rel) => {
  const full = resolvePathJoin(dir, rel);
  return existsSync(full) ? full : null;
};

const QUESTION_COMPONENTS = new Set(['TapQuestion', 'BatchChoiceQuestion', 'NumericQuestion']);
const BRICK = 'KnowledgeBrick';

const KIND_BY_SLOT = {
  brief: 'teaching', intro: 'teaching', 'step.title': 'teaching', 'step.subtitle': 'teaching',
  'step.content': 'teaching', footer: 'teaching', gated: 'teaching',
  'brick.lead': 'brick', 'brick.item': 'brick', 'brick.tryit': 'teaching',
  'q.intro': 'jit', 'q.above': 'jit', 'boss.extra': 'jit',
  'q.prompt': 'demand', 'q.option': 'demand', 'q.rowLabel': 'demand', 'q.rowOption': 'demand',
  'diag.prompt': 'demand', 'diag.option': 'demand', 'boss.prompt': 'demand', 'boss.option': 'demand',
  'q.explain': 'postAnswer', 'q.explainWrong': 'postAnswer', 'q.correction': 'postAnswer',
  'q.explainFor': 'postAnswer', 'q.feedback': 'postAnswer',
  'diag.explain': 'postAnswer', 'boss.explain': 'postAnswer',
};

/**
 * Resolves `steps={steps}` to a literal array.
 *
 * Three shapes exist in the lessons: the array written inline, a local
 * `const steps = […]`, and the workshop pattern `DATA.map((s, i) => ({…}))`
 * where DATA is a literal array — often imported from the lesson's `data.js`.
 * The last one carries real questions, so it must not stay invisible.
 */
function resolveArray(node, path, ctx) {
  if (!node) return null;
  if (node.type === 'ArrayExpression') return node;

  if (node.type === 'Identifier' && path) {
    const binding = path.scope.getBinding(node.name);
    const init = binding?.path?.node?.init;
    if (init?.type === 'ArrayExpression') return init;
    if (init) return resolveArray(init, path, ctx);
    // Imported from a sibling data module.
    const imported = resolveImportedArray(node.name, binding, ctx);
    if (imported) return imported;
  }

  if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression'
    && node.callee.property?.name === 'map') {
    const source = resolveArray(node.callee.object, path, ctx);
    const cb = node.arguments[0];
    if (source && (cb?.type === 'ArrowFunctionExpression' || cb?.type === 'FunctionExpression')) {
      return { __mapped: true, source, callback: cb, loc: node.loc };
    }
  }

  return null;
}

/** A plain ArrayExpression, or null when the node is a mapped descriptor. */
function plainArray(node) {
  return node?.type === 'ArrayExpression' ? node : null;
}

/** Follows `import { SITUATIONS } from '../data'` to the literal array. */
function resolveImportedArray(name, binding, ctx) {
  const decl = binding?.path?.parent;
  if (decl?.type !== 'ImportDeclaration' || !ctx?.dir) return null;
  const source = decl.source?.value;
  if (typeof source !== 'string' || !source.startsWith('.')) return null;

  for (const ext of ['.js', '.jsx', '/index.js', '/index.jsx', '']) {
    const candidate = resolvePath(ctx.dir, source + ext);
    if (!candidate) continue;
    try {
      const ast = parseFile(candidate);
      let found = null;
      traverse(ast, {
        VariableDeclarator(p2) {
          if (p2.node.id.type === 'Identifier' && p2.node.id.name === name
            && p2.node.init?.type === 'ArrayExpression') found = p2.node.init;
        },
      });
      if (found) return found;
    } catch { /* not a readable module — leave it unresolved */ }
  }
  return null;
}

/** Unwraps `(kit) => <div/>` / `() => { return <div/> }` to the rendered node. */
function unwrapRender(node) {
  if (!node) return null;
  if (node.type === 'JSXExpressionContainer') return unwrapRender(node.expression);
  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') return node.body;
  return node;
}

function attr(element, name) {
  const a = element.openingElement?.attributes?.find(
    (x) => x.type === 'JSXAttribute' && x.name?.name === name
  );
  if (!a) return undefined;
  if (a.value === null) return { type: 'BooleanLiteral', value: true, loc: a.loc };
  return a.value.type === 'JSXExpressionContainer' ? a.value.expression : a.value;
}

function elementName(node) {
  const n = node.openingElement?.name;
  if (!n) return null;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return n.property?.name ?? null;
  return null;
}

/** `requires={['a','b']}` → string[]; present but non-literal → 'INVALID'. */
function readRequires(node) {
  if (node === undefined) return undefined;
  const value = literalValue(node);
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) return value;
  return 'INVALID';
}

/** True when a subtree holds a brick or a question — those must not be swallowed. */
function containsInteractive(node) {
  let found = false;
  const visit = (n) => {
    if (found || !n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(visit); return; }
    if (n.type === 'JSXElement') {
      const name = elementName(n);
      if (name === BRICK || QUESTION_COMPONENTS.has(name)) { found = true; return; }
    }
    for (const key of ['children', 'expression', 'body', 'elements', 'properties', 'value',
      'left', 'right', 'consequent', 'alternate', 'argument', 'arguments']) {
      if (n[key]) visit(n[key]);
    }
  };
  visit(node);
  return found;
}

export function buildModuleStream(file, ctx) {
  const { moduleNumber, stage, knowledgeItems, counter } = ctx;
  const resolveCtx = { dir: dirname(file) };
  const ast = parseFile(file);
  const rel = relative(repoRoot, file);
  const segments = [];
  let root = null;
  let rootPath = null;
  let rootName = null;

  traverse(ast, {
    JSXElement(path) {
      if (root) return;
      const name = elementName(path.node);
      if (name === 'ContentModule' || name === 'PrerequisiteDiagnostic' || name === 'BossFinal') {
        root = path.node;
        rootPath = path;
        rootName = name;
      }
    },
  });

  if (!root) return { segments, unparseable: 'no-kit-root', rootName: null };

  const push = (slot, rawNode, extra = {}) => {
    const node = deref(rawNode);
    const { text, notation } = node?.__raw ? splitMath(node.__raw) : collectText(node);
    if (!text && notation.length === 0 && !extra.always) return null;
    const seg = {
      position: counter.n++,
      module: moduleNumber,
      stage,
      file: rel,
      line: (node?.loc?.start.line) ?? extra.line ?? 0,
      step: extra.step ?? null,
      slot,
      kind: KIND_BY_SLOT[slot] ?? 'teaching',
      text,
      notation,
      ...extra,
    };
    delete seg.always;
    segments.push(seg);
    return seg;
  };

  /** Replaces `s.question` by the current data row's literal, when mapping. */
  function deref(node) {
    if (!node) return node;
    if (node.type === 'MemberExpression') return resolveRowMember(node) ?? node;
    return node;
  }

  // ── Question components ───────────────────────────────────────────────────
  const emitQuestion = (el, step, qIndex) => {
    const component = elementName(el);
    const id = literalValue(attr(el, 'id'));
    const questionId = typeof id === 'string' && id
      ? id
      : `M${String(moduleNumber).padStart(2, '0')}-S${step ?? 0}-Q${qIndex}`;
    const requires = readRequires(attr(el, 'requires'));
    const base = { step, questionId, component, requires };

    push('q.intro', attr(el, 'intro'), base);
    push('q.above', unwrapRender(attr(el, 'above')), base);
    push('q.prompt', attr(el, 'prompt'), { ...base, always: true, line: el.loc?.start.line });

    const correctIndex = literalValue(attr(el, 'correct'));
    const options = plainArray(resolveArray(deref(attr(el, 'options')), rootPath, resolveCtx));
    options?.elements?.forEach((opt, i) => {
      push('q.option', opt, { ...base, optionIndex: i, correctIndex });
    });

    const rows = plainArray(resolveArray(deref(attr(el, 'rows')), rootPath, resolveCtx));
    rows?.elements?.forEach((row) => {
      if (row?.type !== 'ObjectExpression') return;
      const rowCorrect = literalValue(propOf(row, 'correct'));
      const rowId = literalValue(propOf(row, 'id'));
      const rowBase = { ...base, rowId };
      push('q.rowLabel', propOf(row, 'label'), rowBase);
      const rowOptions = propOf(row, 'options');
      if (rowOptions?.type === 'ArrayExpression') {
        rowOptions.elements.forEach((opt, i) => {
          push('q.rowOption', opt, { ...rowBase, optionIndex: i, correctIndex: rowCorrect });
        });
      }
      push('q.correction', propOf(row, 'correction'), rowBase);
    });

    push('q.explain', attr(el, 'explain'), base);
    push('q.explainWrong', attr(el, 'explainWrong'), base);
    push('q.explainFor', attr(el, 'explainFor'), base);
    push('q.feedback', attr(el, 'feedback'), base);
  };

  // ── KnowledgeBrick ────────────────────────────────────────────────────────
  const emitBrick = (el, step) => {
    const id = literalValue(attr(el, 'id'));
    const variant = literalValue(attr(el, 'variant')) ?? 'new';
    const declared = literalValue(attr(el, 'establishes'));
    const establishes = [
      ...(typeof id === 'string' && id ? [id] : []),
      ...(Array.isArray(declared) ? declared.filter((v) => typeof v === 'string') : []),
    ];
    const item = typeof id === 'string' ? knowledgeItems.get(id) : null;
    const base = { step, itemId: id ?? null, variant, establishes, line: el.loc?.start.line };

    push('brick.lead', attr(el, 'lead'), base);
    // The item's own text enters the stream HERE — this is what makes an
    // item that spoils a later notion visible as an early exposure.
    push('brick.item', item ? { __raw: item.text, loc: el.loc } : null, {
      ...base, always: true, itemMissing: !item, itemNotation: item?.notation ?? [],
    });
    if (item?.notation?.length) {
      const seg = segments[segments.length - 1];
      if (seg?.slot === 'brick.item') seg.notation.push(...item.notation);
    }
    el.children.forEach((child) => walk(child, step, { inBrick: true }));
  };

  // ── Generic walk over rendered content ────────────────────────────────────
  let questionCounter = 0;
  // While walking a mapped step template, member expressions like `s.question`
  // resolve against the data row currently being rendered.
  let rowFields = null;

  function resolveRowMember(node) {
    if (!rowFields || node?.type !== 'MemberExpression') return null;
    if (node.object?.type !== 'Identifier' || node.object.name !== rowFields.name) return null;
    const key = node.property?.name ?? node.property?.value;
    return key ? propOf(rowFields.node, key) ?? null : null;
  }

  function walk(node, step, opts = {}) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'JSXElement') {
      const name = elementName(node);
      if (name === BRICK) { emitBrick(node, step); return; }
      if (QUESTION_COMPONENTS.has(name)) { emitQuestion(node, step, ++questionCounter); return; }
      // A leaf element (no nested brick or question) is collected as ONE
      // segment: « Essaie une entrée <strong>positive</strong>… » is one
      // sentence a student reads, not five fragments.
      if (!containsInteractive(node)) {
        const collected = collectText(node);
        if (collected.text || collected.notation.length) {
          push(opts.inBrick ? 'brick.tryit' : (opts.gated ? 'gated' : 'step.content'), node, {
            step, gated: opts.gated || undefined,
          });
        }
        return;
      }
      node.children.forEach((c) => walk(c, step, opts));
      return;
    }
    if (node.type === 'JSXFragment') { node.children.forEach((c) => walk(c, step, opts)); return; }
    if (node.type === 'JSXExpressionContainer') { walk(node.expression, step, opts); return; }

    // A gated reveal — {done && <Feedback>…} — is a TEACHING position: it is
    // the consequence of a manipulation, shown before anything later asks
    // about it. Both branches of a ternary count for the same reason.
    if (node.type === 'LogicalExpression') {
      walk(node.left, step, opts);
      walk(node.right, step, { ...opts, gated: true });
      return;
    }
    if (node.type === 'ConditionalExpression') {
      walk(node.consequent, step, { ...opts, gated: true });
      walk(node.alternate, step, { ...opts, gated: true });
      return;
    }
    if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') { walk(node.body, step, opts); return; }
    if (node.type === 'BlockStatement') { node.body.forEach((c) => walk(c, step, opts)); return; }
    if (node.type === 'ReturnStatement') { walk(node.argument, step, opts); return; }
    if (node.type === 'ArrayExpression') { node.elements.forEach((c) => walk(c, step, opts)); return; }
    if (node.type === 'CallExpression') { node.arguments.forEach((c) => walk(c, step, opts)); return; }

    // Plain text/markup in teaching position.
    const collected = collectText(node);
    if (collected.text || collected.notation.length) {
      push(opts.inBrick ? 'brick.tryit' : (opts.gated ? 'gated' : 'step.content'), node, {
        step, gated: opts.gated || undefined,
      });
    }
  }

  // ── Root dispatch ─────────────────────────────────────────────────────────
  if (rootName === 'ContentModule') {
    const brief = attr(root, 'brief');
    push('brief', propOf(brief, 'body'), { line: brief?.loc?.start.line });
    walk(unwrapRender(attr(root, 'intro')), null);

    const steps = resolveArray(attr(root, 'steps'), rootPath, resolveCtx);
    if (!steps) return { segments, unparseable: 'steps', rootName };

    if (steps.__mapped) {
      // `DATA.map((s, i) => ({…}))` : the template is walked once per row, so
      // each situation's own prompt and explanation enter the stream.
      const rows = steps.source.elements.filter((el) => el?.type === 'ObjectExpression');
      const body = unwrapRender(steps.callback.body);
      const param = steps.callback.params[0];
      const rowName = param?.type === 'Identifier' ? param.name : null;
      rows.forEach((row, i) => {
        rowFields = rowName ? { name: rowName, node: row } : null;
        const stepNode = body?.type === 'ObjectExpression' ? body : null;
        const num = i + 1;
        push('step.title', stepNode ? propOf(stepNode, 'title') : null, { step: num });
        push('step.subtitle', stepNode ? propOf(stepNode, 'subtitle') : null, { step: num });
        walk(unwrapRender(stepNode ? propOf(stepNode, 'content') : null), num);
      });
      rowFields = null;
    } else {
      for (const stepNode of steps.elements) {
        if (stepNode?.type !== 'ObjectExpression') continue;
        const num = literalValue(propOf(stepNode, 'num'));
        push('step.title', propOf(stepNode, 'title'), { step: num });
        push('step.subtitle', propOf(stepNode, 'subtitle'), { step: num });
        walk(unwrapRender(propOf(stepNode, 'content')), num);
      }
    }

    const beforeFooter = segments.length;
    walk(unwrapRender(attr(root, 'footer')), null, { footer: true });
    // Everything the footer walk produced is a footer slot: it is rendered
    // only once every step is done, so it can never establish a concept.
    for (let i = beforeFooter; i < segments.length; i += 1) {
      if (segments[i].slot === 'step.content' || segments[i].slot === 'gated') {
        segments[i].slot = 'footer';
        segments[i].kind = 'teaching';
      }
    }
    return { segments, unparseable: null, rootName };
  }

  // Module 0 and the boss are data-driven: QUESTIONS / EPREUVES arrays.
  const dataName = rootName === 'PrerequisiteDiagnostic' ? 'questions' : 'epreuves';
  const prefix = rootName === 'PrerequisiteDiagnostic' ? 'diag' : 'boss';
  const brief = attr(root, 'brief');
  push('brief', propOf(brief, 'body'), { line: brief?.loc?.start.line });
  push(`${prefix}.extra`, unwrapRender(attr(root, 'synthese')), {});

  const list = plainArray(resolveArray(attr(root, dataName), rootPath, resolveCtx));
  if (!list) return { segments, unparseable: dataName, rootName };

  list.elements.forEach((q, i) => {
    if (q?.type !== 'ObjectExpression') return;
    const id = literalValue(propOf(q, 'id'));
    const questionId = typeof id === 'string' && id ? id : `${prefix}-${i}`;
    const requires = readRequires(propOf(q, 'requires'));
    const correctIndex = literalValue(propOf(q, 'correct'));
    const base = { questionId, component: prefix, requires };

    push(`${prefix}.extra`, propOf(q, 'title'), base);
    push(`${prefix}.extra`, propOf(q, 'extra'), base);
    push(`${prefix}.prompt`, propOf(q, 'prompt'), { ...base, always: true, line: q.loc?.start.line });
    const options = propOf(q, 'options');
    if (options?.type === 'ArrayExpression') {
      options.elements.forEach((opt, oi) => push(`${prefix}.option`, opt, { ...base, optionIndex: oi, correctIndex }));
    }
    push(`${prefix}.explain`, propOf(q, 'explain'), base);
    push(`${prefix}.explain`, propOf(q, 'explainOk'), base);
    push(`${prefix}.explain`, propOf(q, 'explainKo'), base);
  });

  return { segments, unparseable: null, rootName };
}
