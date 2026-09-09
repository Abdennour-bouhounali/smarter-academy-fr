// Shared AST plumbing for the lesson tooling.
//
// Extracted verbatim from scripts/validate-lessons.mjs so that the lesson
// validator (structure + assessment metadata) and the knowledge-dependency
// audit (docs/architecture/KNOWLEDGE_DEPENDENCY.md) read lesson sources the
// same way. Nothing here judges a lesson: it only parses.
//
// Everything is literal-or-nothing on purpose: lesson metadata must be static
// so the tooling can read it without executing a React module.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { courseLevels } from '../../packages/core/curriculum/coursesData.js';

export const traverse = traverseModule.default || traverseModule;
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const lessonsRoot = join(repoRoot, 'apps/web/src/lessons');

/** Parses one .js/.jsx file into a Babel AST. */
export function parseFile(file) {
  return parse(readFileSync(file, 'utf-8'), { sourceType: 'module', plugins: ['jsx'] });
}

/** Literal-or-undefined extraction: metadata must be static, not computed. */
export function literalValue(node) {
  if (!node) return undefined;
  if (node.type === 'StringLiteral' || node.type === 'BooleanLiteral' || node.type === 'NumericLiteral') return node.value;
  if (node.type === 'ArrayExpression') return node.elements.map((el) => literalValue(el));

  return undefined;
}

export function propOf(objectExpression, name) {
  if (!objectExpression || objectExpression.type !== 'ObjectExpression') return undefined;

  return objectExpression.properties.find(
    (p) => p.type === 'ObjectProperty' && !p.computed && (p.key.name === name || p.key.value === name)
  )?.value;
}

/** The grade directory of a lesson: apps/web/src/lessons/<level>/<grade>/... */
export function gradeOf(lessonDir) {
  return relative(lessonsRoot, lessonDir).split('/')[1] ?? null;
}

/** Finds every directory under apps/web/src/lessons containing a lesson.config.js. */
export function findLessonDirs(dir = lessonsRoot, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    try {
      statSync(join(full, 'lesson.config.js'));
      acc.push(full);
    } catch {
      findLessonDirs(full, acc);
    }
  }

  return acc;
}

export function listSourceFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listSourceFiles(full, acc);
    else if (/\.(jsx?|mjs)$/.test(name)) acc.push(full);
  }

  return acc;
}

/** The `Module<NN>` number a module file declares, or null. */
export function moduleFileNumber(file) {
  const match = file.split(sep).pop().match(/^Module(\d+)/);

  return match ? Number(match[1]) : null;
}

/**
 * Maps a source file to the module owning it. Two conventions are supported:
 *  - flat (preferred): `<lessonDir>/modules/Module<NN><Descriptor>.jsx`
 *  - legacy: `<lessonDir>/modules/<slug>/<file>`
 * Returns the module entry or null.
 */
export function moduleOfFile(lessonDir, modules, file) {
  const rel = relative(lessonDir, file).split(sep);
  if (rel[0] !== 'modules' || rel.length < 2) return null;

  if (rel.length === 2) {
    const number = moduleFileNumber(rel[1]);
    if (number === null) return null;
    return modules?.find((m) => m.number === number) ?? null;
  }

  return modules?.find((m) => m.slug === rel[1]) ?? null;
}

/**
 * The catalogue index, keyed `${gradeId}:${lessonId}`. Lesson codes are
 * globally unique, but keying by grade too catches a mis-placed lesson dir.
 */
export function buildLessonIndex() {
  const lessonIndex = new Map();
  for (const level of courseLevels) {
    for (const grade of level.grades) {
      for (const chapter of grade.chapters) {
        for (const lesson of chapter.lessons) {
          lessonIndex.set(`${grade.id}:${lesson.id}`, {
            learningPointIds: new Set(lesson.learningPoints.map((lp) => lp.id)),
            learningPoints: lesson.learningPoints.map((lp) => ({ id: lp.id, title: lp.title, order: lp.order })),
            pointsToLearn: lesson.learningPoints.map((lp) => lp.title),
            status: lesson.status,
            title: lesson.title,
            durationMinutes: lesson.durationMinutes,
            // Curriculum coordinates, needed by any per-grade report that
            // groups lessons by domain / official object.
            officialObject: lesson.officialObject ?? null,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            path: lesson.path,
            prerequisites: lesson.prerequisites ?? [],
          });
        }
      }
    }
  }

  return lessonIndex;
}

/**
 * Parses lesson.config.js into {id, modules, ...} where each module is
 * {line, number, stage, estimatedMin, slug, ...}. Values must be static
 * literals — computed metadata is reported as missing.
 *
 * `priorKnowledge` is 'INVALID' when present but not a literal string array
 * (see docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
export function parseLessonConfig(lessonDir) {
  const ast = parseFile(join(lessonDir, 'lesson.config.js'));

  let configNode = null;
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier' && path.node.id.name === 'LESSON_CONFIG'
        && path.node.init?.type === 'ObjectExpression') {
        configNode = path.node.init;
      }
    },
  });
  if (!configNode) return { id: null, modules: null };

  const id = literalValue(propOf(configNode, 'id'));
  const title = literalValue(propOf(configNode, 'title'));
  // The author's declared lesson length. The SUM of the modules' estimatedMin
  // is the truth; this field and the catalogue's durationMinutes must match it.
  const estimatedDurationMin = literalValue(propOf(configNode, 'estimatedDurationMin'));
  // `knowledgeMap: true` — the lesson's formalisation is the cumulative
  // Knowledge Map instead of a dedicated « À retenir » module.
  const knowledgeMap = literalValue(propOf(configNode, 'knowledgeMap')) === true;

  const priorNode = propOf(configNode, 'priorKnowledge');
  let priorKnowledge;
  if (priorNode !== undefined) {
    const value = literalValue(priorNode);
    priorKnowledge = Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : 'INVALID';
  }

  const scopeNode = propOf(configNode, 'teachingScope');
  const includeValue = literalValue(propOf(scopeNode, 'include'));
  const teachingScopeInclude = Array.isArray(includeValue) ? includeValue.filter((v) => typeof v === 'string') : [];

  const ignoreNode = propOf(propOf(configNode, 'knowledgeAudit'), 'ignore');
  const knowledgeAuditIgnore = ignoreNode?.type === 'ArrayExpression'
    ? ignoreNode.elements
        .filter((el) => el?.type === 'ObjectExpression')
        .map((el) => ({ term: literalValue(propOf(el, 'term')), reason: literalValue(propOf(el, 'reason')) }))
        .filter((e) => typeof e.term === 'string')
    : [];

  const modulesNode = propOf(configNode, 'modules');
  const modules = modulesNode?.type === 'ArrayExpression'
    ? modulesNode.elements
        .filter((el) => el?.type === 'ObjectExpression')
        .map((el) => ({
          line: el.loc?.start.line,
          number: literalValue(propOf(el, 'number')),
          stage: literalValue(propOf(el, 'stage')),
          estimatedMin: literalValue(propOf(el, 'estimatedMin')),
          slug: literalValue(propOf(el, 'slug')),
          title: literalValue(propOf(el, 'title')),
          path: literalValue(propOf(el, 'path')),
          teachesLearningPointIds: literalValue(propOf(el, 'teachesLearningPointIds')),
          requiresLearningPointIds: literalValue(propOf(el, 'requiresLearningPointIds')),
        }))
    : null;

  return {
    id: typeof id === 'string' ? id : null,
    title: typeof title === 'string' ? title : null,
    estimatedDurationMin: typeof estimatedDurationMin === 'number' ? estimatedDurationMin : null,
    modules,
    knowledgeMap,
    grade: gradeOf(lessonDir),
    priorKnowledge,
    teachingScopeInclude,
    knowledgeAuditIgnore,
  };
}
