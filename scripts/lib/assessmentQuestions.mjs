// Assessment-question extraction for the curriculum audits.
//
// This reads the SAME object shape as scripts/validate-lessons.mjs
// (`extractQuestions`): any object literal carrying an `assessment` property
// with an `enabled` key is a question-level metadata block. The validator is a
// CI gate and is deliberately left untouched; this module adds the fields an
// audit needs (prompt, skill, requires, option count, source line) so a report
// can quote the question a Learning Point actually rests on.
//
// KEEP IN SYNC with validate-lessons.mjs:60-88. If the metadata shape changes,
// both readers change together.

import { readFileSync } from 'node:fs';
import { traverse, parseFile, literalValue, propOf } from './lessonAst.mjs';
import { collectText } from './collectText.mjs';

/** `requires: ['a','b']` → string[]; present but not literal → 'INVALID'. */
function readRequires(node) {
  if (node === undefined) return undefined;
  const value = literalValue(node);
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) return value;
  return 'INVALID';
}

/** A prompt is a string literal or JSX; both are flattened to readable text. */
function readPrompt(node) {
  if (!node) return '';
  const value = literalValue(node);
  if (typeof value === 'string') return value;
  return collectText(node).text;
}

/**
 * Every question-level `assessment` block in one file.
 * @returns {{id, line, enabled, type, learningPointIds, prompt, skill,
 *            requires, optionCount, correct}[]}
 */
export function extractAssessmentQuestions(file) {
  const source = readFileSync(file, 'utf-8');
  if (!source.includes('assessment')) return [];

  const ast = parseFile(file);
  const questions = [];

  traverse(ast, {
    ObjectExpression(path) {
      const assessmentNode = propOf(path.node, 'assessment');
      if (!assessmentNode || assessmentNode.type !== 'ObjectExpression') return;
      // Only question-level metadata has `enabled` — this skips the legacy
      // lesson-level `assessment: {moduleId, ...}` block of the 3e configs.
      const enabledNode = propOf(assessmentNode, 'enabled');
      if (enabledNode === undefined) return;

      const optionsNode = propOf(path.node, 'options');
      const lpIds = literalValue(propOf(assessmentNode, 'learningPointIds'));

      questions.push({
        file,
        line: path.node.loc?.start.line ?? 0,
        id: literalValue(propOf(path.node, 'id')),
        enabled: literalValue(enabledNode),
        type: literalValue(propOf(assessmentNode, 'type')),
        learningPointIds: Array.isArray(lpIds) ? lpIds.filter((v) => typeof v === 'string') : [],
        prompt: readPrompt(propOf(path.node, 'prompt')),
        skill: literalValue(propOf(path.node, 'skill')) ?? null,
        requires: readRequires(propOf(path.node, 'requires')),
        optionCount: optionsNode?.type === 'ArrayExpression' ? optionsNode.elements.length : null,
        correct: literalValue(propOf(path.node, 'correct')) ?? null,
      });
    },
  });

  return questions;
}
