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
// Cet outillage valide l'arbre de leçons SUR LE DISQUE contre le catalogue
// algérien (`dzCourseLevels`) : les leçons écrites sous lessons/moyen/4am/.
// Le catalogue français et ses 132 dossiers ont été supprimés le 2026-09-25 ;
// un dossier de leçon absent du catalogue DZ est désormais une erreur.
//
// ATTENTION : indexer une leçon ne l'ACTIVE pas. Ce qu'un élève peut ouvrir
// est décidé par ACTIVE_GRADE_IDS et le registre de l'application, que
// check-dormant-isolation.mjs vérifie séparément.
import { dzCourseLevels } from '../../packages/core/curriculum/coursesData.js';

const courseLevels = dzCourseLevels;

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
            // Phase 8
            kind: lesson.kind ?? 'lesson',
            unitId: lesson.unitId ?? null,
            prerequisiteLessonCodes: lesson.prerequisiteLessonCodes ?? [],
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
  // `knowledgeMapMode: 'progressive'` — the map is the progressive graph
  // (knowledgeGraph.js), docs/architecture/KNOWLEDGE_MAP.md Part A.
  const knowledgeMapMode = literalValue(propOf(configNode, 'knowledgeMapMode')) ?? null;

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

  // Phase 8 : la NATURE de la leçon ('lesson' | 'synthesis') et ses RESSOURCES
  // déclarées (manipulations, méthodes, situation) — des littéraux, comme tout
  // le reste, pour que validate-lessons.mjs et l'export du registre les lisent.
  const kindValue = literalValue(propOf(configNode, 'kind'));
  const kind = typeof kindValue === 'string' ? kindValue : 'lesson';
  const unit = literalValue(propOf(configNode, 'unit'));
  const resourcesNode = propOf(configNode, 'resources');
  const resources = resourcesNode === undefined
    ? undefined
    : resourcesNode.type === 'ArrayExpression'
      ? resourcesNode.elements.filter((el) => el?.type === 'ObjectExpression').map((el) => ({
          line: el.loc?.start.line,
          kind: literalValue(propOf(el, 'kind')),
          code: literalValue(propOf(el, 'code')),
          type: literalValue(propOf(el, 'type')),
          title: literalValue(propOf(el, 'title')),
          module: literalValue(propOf(el, 'module')),
          learningPointIds: literalValue(propOf(el, 'learningPointIds')),
          sourceElementIds: literalValue(propOf(el, 'sourceElementIds')),
          // Les DEUX NIVEAUX et la traçabilité de l'expérience
          // (packages/core/curriculum/manipulationLevels.js). `experience`
          // est un objet littéral : on en lit les champs un par un, parce
          // que `literalValue` ne descend pas dans les objets — c'est voulu,
          // les métadonnées de leçon restent statiques et lisibles à l'œil.
          level: literalValue(propOf(el, 'level')),
          objective: literalValue(propOf(el, 'objective')),
          autonomy: literalValue(propOf(el, 'autonomy')),
          experience: (() => {
            const node = propOf(el, 'experience');
            if (node === undefined) return undefined;
            if (node.type !== 'ObjectExpression') return 'INVALID';
            return {
              type: literalValue(propOf(node, 'type')),
              reason: literalValue(propOf(node, 'reason')),
              theme: literalValue(propOf(node, 'theme')),
            };
          })(),
        }))
      : 'INVALID';

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
          // 'problem' = un module « مسألة » (GuidedProblem) — LESSON_CONTRACT.md § Modules « مسائل ».
          track: literalValue(propOf(el, 'track')),
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
    knowledgeMapMode,
    kind,
    unit: typeof unit === 'string' ? unit : null,
    resources,
    grade: gradeOf(lessonDir),
    priorKnowledge,
    teachingScopeInclude,
    knowledgeAuditIgnore,
  };
}
