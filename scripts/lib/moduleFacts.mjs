// Per-module facts for the curriculum audits: what a module makes the student
// DO, what it names, and what it asks.
//
// Everything here is read through the exposure stream
// (scripts/lib/exposureStream.mjs), never through a raw JSX walk, because four
// seconde modules build their steps with `DATA.map(...)` — a raw walk sees one
// template where the student meets N situations. The stream expands them.
//
// Nothing here judges a lesson. A human decides whether a Learning Point is
// covered; this module only reports what is verifiably in the source.

import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { traverse, parseFile, literalValue, repoRoot } from './lessonAst.mjs';
import { buildModuleStream } from './exposureStream.mjs';

const QUESTION_COMPONENTS = ['TapQuestion', 'BatchChoiceQuestion', 'NumericQuestion'];
// Shared furniture, not a manipulation: these render chrome or collect a
// prediction, they do not let the student act on the mathematics.
const NOT_A_MANIPULATION = new Set([
  'PredictionChips', 'KnowledgeSnapshot', 'KnowledgeBrick', 'KnowledgeMap',
  'KnowledgeProvider', 'Stepper', 'MathText', 'Feedback', 'ValidateButton',
  'MissionBrief', 'ChoiceGrid', 'ValueTable',
]);
const UTIL_NAME = /(utils?|Utils)$|^learningPoints$|^data$|^knowledge/i;

/** Static JSX element counts — the complement of the stream's expanded view. */
function staticJsxCounts(ast, names) {
  const counts = Object.fromEntries(names.map((n) => [n, 0]));
  traverse(ast, {
    JSXOpeningElement(path) {
      const n = path.node.name;
      const name = n.type === 'JSXIdentifier' ? n.name
        : n.type === 'JSXMemberExpression' ? n.property?.name : null;
      if (name && name in counts) counts[name] += 1;
    },
  });
  return counts;
}

/**
 * Local components a module imports from its own `components/` directory and
 * actually renders. A default import that is never used as an element is a
 * leftover, not a manipulation, so it is excluded.
 */
function manipulationImports(ast, file) {
  const dir = dirname(file);
  const candidates = new Map(); // localName -> resolved path

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (typeof source !== 'string' || !/(^|\/)components\//.test(source)) return;
      for (const spec of path.node.specifiers) {
        if (spec.type !== 'ImportDefaultSpecifier' && spec.type !== 'ImportSpecifier') continue;
        const local = spec.local.name;
        if (NOT_A_MANIPULATION.has(local) || UTIL_NAME.test(local)) continue;
        for (const ext of ['.jsx', '.js', '']) {
          const full = resolve(dir, source + ext);
          if (existsSync(full) && /\.jsx?$/.test(full)) { candidates.set(local, full); break; }
        }
      }
    },
  });

  const used = new Set();
  traverse(ast, {
    JSXOpeningElement(path) {
      const n = path.node.name;
      const name = n.type === 'JSXIdentifier' ? n.name : null;
      if (name && candidates.has(name)) used.add(name);
    },
  });

  return [...used].map((name) => {
    const full = candidates.get(name);
    const base = full.replace(/\.jsx?$/, '');
    // A manipulation with its own test file states its guarantees; most
    // lessons instead test the shared model (`<x>Utils.test.js`) the component
    // drives. `lessonHasModelTests` (per lesson) reports the second case.
    const ownTest = ['.test.js', '.test.jsx'].some((s) => existsSync(base + s));
    return { name, file: relative(repoRoot, full), ownTest };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Kit components a module RENDERS but never IMPORTS.
 *
 * The gates cannot see this: the offending element usually sits inside a gated
 * reveal, so the module loads fine and only throws a ReferenceError once the
 * student validates the step. One real case was found in Seconde
 * (equations-et-inequations M05, three <KnowledgeBrick> with no import), and
 * neither validate:lessons, audit:knowledge, the build nor a page-load smoke
 * reported it.
 */
function missingKitImports(ast, source) {
  const KIT = ['ContentModule', 'TapQuestion', 'BatchChoiceQuestion', 'NumericQuestion',
    'KnowledgeBrick', 'BossFinal', 'PrerequisiteDiagnostic', 'PredictionChips', 'KnowledgeSnapshot'];
  const bound = new Set();
  traverse(ast, {
    ImportDeclaration(path) {
      for (const spec of path.node.specifiers) bound.add(spec.local.name);
    },
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier') bound.add(path.node.id.name);
    },
    FunctionDeclaration(path) {
      if (path.node.id?.name) bound.add(path.node.id.name);
    },
  });
  const rendered = new Set();
  traverse(ast, {
    JSXOpeningElement(path) {
      const n = path.node.name;
      if (n.type === 'JSXIdentifier') rendered.add(n.name);
    },
  });
  return KIT.filter((n) => rendered.has(n) && !bound.has(n));
}

/**
 * How the module's steps are written. `DATA.map((s) => ({…}))` renders one
 * template per data row: the student meets N situations where the source shows
 * one, so any count taken from raw JSX would be wrong for these modules.
 */
function detectStepsShape(ast) {
  let shape = 'literal';
  traverse(ast, {
    JSXAttribute(path) {
      if (path.node.name?.name !== 'steps') return;
      const expr = path.node.value?.type === 'JSXExpressionContainer' ? path.node.value.expression : null;
      const isMap = (n) => n?.type === 'CallExpression' && n.callee?.type === 'MemberExpression'
        && n.callee.property?.name === 'map';
      if (isMap(expr)) { shape = 'mapped'; return; }
      if (expr?.type === 'Identifier') {
        const init = path.scope.getBinding(expr.name)?.path?.node?.init;
        if (isMap(init)) shape = 'mapped';
      }
    },
  });
  return shape;
}

/**
 * @param {string} file      absolute path of the module component
 * @param {object} module    the lesson.config.js module entry
 * @param {Map} knowledgeItems  from readKnowledge(lessonDir).items
 */
export function readModuleFacts(file, module, knowledgeItems) {
  const ast = parseFile(file);
  const counter = { n: 0 };
  const { segments, unparseable, rootName } = buildModuleStream(file, {
    moduleNumber: module?.number ?? null,
    stage: module?.stage ?? null,
    knowledgeItems,
    counter,
  });

  // Questions: one entry per distinct questionId in demand position.
  const byQuestion = new Map();
  for (const seg of segments) {
    if (!seg.questionId) continue;
    if (!byQuestion.has(seg.questionId)) {
      byQuestion.set(seg.questionId, {
        id: seg.questionId, component: seg.component,
        requires: Array.isArray(seg.requires) ? seg.requires : (seg.requires === 'INVALID' ? 'INVALID' : []),
        step: seg.step ?? null, prompt: '',
      });
    }
    const q = byQuestion.get(seg.questionId);
    if (/\.prompt$/.test(seg.slot) && !q.prompt) q.prompt = seg.text;
    if (q.step == null && seg.step != null) q.step = seg.step;
  }
  const questions = [...byQuestion.values()];

  const bricks = segments
    .filter((s) => s.slot === 'brick.item')
    .map((s) => ({ itemId: s.itemId, step: s.step ?? null, variant: s.variant, itemMissing: !!s.itemMissing, line: s.line }));

  const requiresIds = new Set();
  let requiresInvalid = 0;
  for (const q of questions) {
    if (q.requires === 'INVALID') { requiresInvalid += 1; continue; }
    q.requires.forEach((r) => requiresIds.add(r));
  }

  const streamCounts = {};
  for (const q of questions) streamCounts[q.component] = (streamCounts[q.component] ?? 0) + 1;

  const source = readFileSync(file, 'utf-8');
  const estimatedTimeLabel = source.match(/estimatedTime="([^"]+)"/)?.[1] ?? null;
  const stepsShape = detectStepsShape(ast);

  // A gated reveal is a teaching position: it is the consequence of a gesture,
  // shown before anything later asks about it (KNOWLEDGE_DEPENDENCY.md).
  const gatedReveals = segments.filter((s) => s.gated && s.kind === 'teaching').length;

  return {
    file: relative(repoRoot, file),
    root: rootName,
    // 'literal' | 'mapped' | 'unparseable' — a module whose steps the parser
    // cannot resolve is FLAGGED, never silently reported as having 0 questions.
    stepsShape: unparseable ? 'unparseable' : stepsShape,
    unparseable: unparseable ?? null,
    estimatedTimeLabel,
    steps: [...new Set(segments.map((s) => s.step).filter((s) => s != null))].sort((a, b) => a - b),
    questions,
    questionCounts: { stream: streamCounts, jsxStatic: staticJsxCounts(ast, [...QUESTION_COMPONENTS, 'PredictionChips', 'KnowledgeBrick', 'KnowledgeSnapshot']) },
    bricks,
    requires: { ids: [...requiresIds].sort(), count: questions.reduce((n, q) => n + (Array.isArray(q.requires) ? q.requires.length : 0), 0), invalid: requiresInvalid },
    gatedReveals,
    manipulations: manipulationImports(ast, file),
    missingKitImports: missingKitImports(ast, source),
  };
}
