// Reads a lesson's knowledge.jsx (the Knowledge Map's single source of truth,
// docs/architecture/KNOWLEDGE_MAP.md) without executing it.
//
// The audit needs two things from each item: its identity (id, type, module)
// and its TEXT, because a <KnowledgeBrick id="…"> injects that text into the
// lesson's exposure stream at the brick's position. An item whose body uses a
// word the student has not met yet is therefore caught like any other early
// exposure.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { traverse, parseFile, literalValue, propOf } from './lessonAst.mjs';
import { collectText } from './collectText.mjs';

const CATEGORY_IDS = new Set(['concepts', 'regles', 'methodes', 'vocabulaire', 'memoriser', 'formules']);

/**
 * @returns {{ items: Map<string, object>, byModule: Map<number, object[]>,
 *             problems: {code: string, message: string, line: number}[], file: string|null }}
 */
export function readKnowledge(lessonDir) {
  const file = join(lessonDir, 'knowledge.jsx');
  const items = new Map();
  const byModule = new Map();
  const problems = [];
  if (!existsSync(file)) return { items, byModule, problems, file: null };

  const ast = parseFile(file);
  let modulesNode = null;
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier' && path.node.id.name === 'LESSON_KNOWLEDGE'
        && path.node.init?.type === 'ObjectExpression') {
        modulesNode = propOf(path.node.init, 'modules');
      }
    },
  });

  if (!modulesNode || modulesNode.type !== 'ObjectExpression') {
    problems.push({ code: 'E_KNOWLEDGE_UNPARSEABLE', line: 1, message: 'knowledge.jsx has no literal LESSON_KNOWLEDGE.modules object' });
    return { items, byModule, problems, file };
  }

  for (const prop of modulesNode.properties) {
    if (prop.type !== 'ObjectProperty') continue;
    const key = prop.key.type === 'NumericLiteral' ? prop.key.value : Number(prop.key.name ?? prop.key.value);
    if (!Number.isFinite(key) || prop.value.type !== 'ArrayExpression') continue;

    const list = [];
    for (const el of prop.value.elements) {
      if (el?.type !== 'ObjectExpression') continue;
      const id = literalValue(propOf(el, 'id'));
      const type = literalValue(propOf(el, 'type'));
      const line = el.loc?.start.line ?? 0;
      if (typeof id !== 'string' || !id) {
        problems.push({ code: 'E_ITEM_NO_ID', line, message: `knowledge item in module ${key} has no literal string id` });
        continue;
      }
      if (!CATEGORY_IDS.has(type)) {
        problems.push({ code: 'E_ITEM_BAD_TYPE', line, message: `knowledge item '${id}' has type ${JSON.stringify(type)} — must be one of ${[...CATEGORY_IDS].join('/')}` });
      }
      if (items.has(id)) {
        problems.push({ code: 'W_ITEM_DUPLICATE_ID', line, message: `knowledge item '${id}' is declared again in module ${key}; the first declaring module (${items.get(id).module}) wins` });
        continue;
      }

      const title = literalValue(propOf(el, 'title'));
      const summary = literalValue(propOf(el, 'summary'));
      const bodyText = collectText(propOf(el, 'body'));
      const visualText = collectText(propOf(el, 'visual'));
      const item = {
        id,
        type,
        module: key,
        line,
        title: typeof title === 'string' ? title : '',
        summary: typeof summary === 'string' ? summary : '',
        text: [typeof title === 'string' ? title : '', typeof summary === 'string' ? summary : '', bodyText.text, visualText.text]
          .filter(Boolean).join(' '),
        notation: [...bodyText.notation, ...visualText.notation],
        hasVisual: propOf(el, 'visual') !== undefined,
      };
      items.set(id, item);
      list.push(item);
    }
    byModule.set(key, list);
  }

  return { items, byModule, problems, file };
}
