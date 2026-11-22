// Lesson validator — the CI gate for two conventions:
//
// 1. Question-level `assessment: {enabled, type, learningPointIds}` metadata
//    (see docs/architecture/AI_LESSON_CONTRACT.md).
// 2. The module `stage` contract (see docs/architecture/LESSON_CONTRACT.md):
//    every module in LESSON_CONFIG.modules declares a stage from
//    LESSON_STAGES, stages appear in journey order, the lesson's total
//    estimatedMin stays within MAX_LESSON_MINUTES, and enabled assessment
//    questions only live inside `evaluation`-stage modules (mapped through
//    the modules/Module<NN><Descriptor>.jsx filename's number prefix — or,
//    for a module split across several files, the legacy modules/<slug>/
//    directory convention).
//
// Default mode fails ONLY on structural errors: duplicate question ids,
// malformed assessment metadata, learningPointIds that don't exist for that
// lesson, malformed stages. It does NOT fail lessons that simply have no
// assessment metadata yet — that would be a false-failing gate. `--strict`
// additionally requires every learning point of every 'available' lesson to
// have >= 1 assessment question and REQUIRED_STAGES on every lesson config;
// flip it on in CI once every lesson has been migrated.
//
// Usage: node scripts/validate-lessons.mjs [--strict]

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { relative, join } from 'node:path';
import {
  LESSON_STAGES,
  STAGE_ORDER,
  REQUIRED_STAGES,
  MAX_LESSON_MINUTES,
} from '../packages/core/curriculum/lessonStages.js';
import {
  isManipulationType,
  MANIPULATION_TYPE_IDS,
  RESOURCE_KINDS,
  LESSON_KINDS,
  REQUIRED_STAGES_BY_KIND,
} from '../packages/core/curriculum/manipulationTypes.js';
import {
  MANIPULATION_LEVEL_IDS,
  EXPERIENCE_TYPES,
  ADAPTATION_REASONS,
  VISUAL_THEME_IDS,
} from '../packages/core/curriculum/manipulationLevels.js';
// Shared AST plumbing (also used by scripts/audit-knowledge-dependencies.mjs).
import {
  traverse,
  repoRoot,
  lessonsRoot,
  parseFile,
  literalValue,
  propOf,
  gradeOf,
  findLessonDirs,
  listSourceFiles,
  moduleOfFile,
  buildLessonIndex,
  parseLessonConfig,
} from './lib/lessonAst.mjs';
// What a v2 lesson IS — its lesson.pack.js (plan §8bis; tested in validate-lib.test.mjs).
import { isV2Lesson, packKnowledgePath, packWorldId } from './validate-lib.mjs';

const strict = process.argv.includes('--strict');

const VALID_TYPES = new Set(['discovery', 'practice', 'assessment']);
const VALID_STAGES = new Set(LESSON_STAGES);

// Lesson codes are globally unique since the 45-min split (a catalogue test
// enforces it), but the index stays keyed `${gradeId}:${lessonId}` so a
// mis-placed lesson directory is caught too — the grade comes from the
// lesson directory's path (apps/web/src/lessons/<level>/<grade>/...).
const lessonIndex = buildLessonIndex();

/** Extracts every object literal carrying an `assessment` property from one file. */
function extractQuestions(file) {
  const source = readFileSync(file, 'utf-8');
  if (!source.includes('assessment')) return [];

  const ast = parseFile(file);
  const questions = [];

  traverse(ast, {
    ObjectExpression(path) {
      const assessmentNode = propOf(path.node, 'assessment');
      if (!assessmentNode || assessmentNode.type !== 'ObjectExpression') return;
      // Only question-level metadata has `enabled`/`type` — this skips the
      // 3e lesson.config.js's lesson-level `assessment: {moduleId, ...}` block.
      const enabledNode = propOf(assessmentNode, 'enabled');
      if (enabledNode === undefined) return;

      // Deux écritures du lien question → learning point : l'héritage
      // `learningPointIds: ['…']` (tous principaux) et la forme canonique
      // `learningPoints: [{code, role}]` (Mastery V2 — un principal, des
      // secondaires). Les deux sont lues ; le registre les unifie.
      const lpNode = propOf(assessmentNode, 'learningPoints');
      let learningPoints;
      if (lpNode !== undefined) {
        learningPoints = 'INVALID';
        if (lpNode.type === 'ArrayExpression' && lpNode.elements.every((el) => el?.type === 'ObjectExpression')) {
          const read = lpNode.elements.map((el) => ({
            code: literalValue(propOf(el, 'code')),
            role: literalValue(propOf(el, 'role')) ?? 'primary',
          }));
          if (read.every((lp) => typeof lp.code === 'string' && (lp.role === 'primary' || lp.role === 'secondary'))) {
            learningPoints = read;
          }
        }
      }

      questions.push({
        file,
        line: path.node.loc?.start.line,
        id: literalValue(propOf(path.node, 'id')),
        enabled: literalValue(enabledNode),
        type: literalValue(propOf(assessmentNode, 'type')),
        learningPointIds: literalValue(propOf(assessmentNode, 'learningPointIds')),
        learningPoints,
        difficulty: literalValue(propOf(assessmentNode, 'difficulty')),
        hasDifficulty: propOf(assessmentNode, 'difficulty') !== undefined,
        correct: literalValue(propOf(path.node, 'correct')),
        hasCorrect: propOf(path.node, 'correct') !== undefined,
      });
    },
  });

  return questions;
}

const errors = [];
const warnings = [];
const migratedCoverage = new Map(); // lesson code -> Set of covered LP ids

for (const lessonDir of findLessonDirs(lessonsRoot)) {
  const { id: code, modules, knowledgeMap, knowledgeMapMode, priorKnowledge, kind, unit, resources } = parseLessonConfig(lessonDir);
  const rel = relative(repoRoot, lessonDir);
  if (!code) {
    errors.push(`${rel}: lesson.config.js has no parseable literal LESSON_CONFIG.id`);
    continue;
  }

  const gradeId = gradeOf(lessonDir);
  const indexKey = `${gradeId}:${code}`;
  const catalogEntry = lessonIndex.get(indexKey);
  if (!catalogEntry) {
    errors.push(`${rel}: lesson '${indexKey}' not found in coursesData.js`);
    continue;
  }

  // ── Knowledge-dependency metadata ─────────────────────────────────────────
  // `priorKnowledge` lists the concept ids a lesson assumes (and its Module 0
  // diagnoses). Like every other lesson metadata field it must be a static
  // literal so the tooling can read it — see
  // docs/architecture/KNOWLEDGE_DEPENDENCY.md.
  const configPath = `${rel}/lesson.config.js`;
  if (priorKnowledge === 'INVALID') {
    errors.push(`${configPath}: priorKnowledge must be a literal array of concept id strings`);
  }

  // ── Carte des connaissances PROGRESSIVE (KNOWLEDGE_MAP.md Part A) ──────────
  // Une leçon qui a une carte a SA carte progressive : le drapeau littéral, un
  // knowledgeGraph.js, et sa réexportation par knowledge.jsx (c'est par là que
  // LazyKnowledgeProvider la reçoit). Les invariants du graphe lui-même —
  // validité, items portés, aides, disposition — sont vérifiés par
  // apps/web/src/lessons/common/knowledge/progressive/lessonGraphs.test.js.
  // A v2 lesson (a lesson with a `lesson.pack.js`, LESSON_V2.md §1) has ONE knowledge source, the file its pack names
  // (`lesson.pack.js › knowledge: () => import('./…')`): that file must export the graph (the world's « carte des
  // connaissances »). It needs no root knowledge.jsx / knowledgeGraph.js — they were the module lessons' map.
  const v2Lesson = isV2Lesson(lessonDir);
  const packKnowledge = v2Lesson ? packKnowledgePath(lessonDir) : null;
  if (knowledgeMap && v2Lesson) {
    if (knowledgeMapMode !== 'progressive') {
      errors.push(`${configPath}: knowledgeMap: true requires knowledgeMapMode: 'progressive' (got ${JSON.stringify(knowledgeMapMode)}) — docs/architecture/KNOWLEDGE_MAP.md A.13`);
    }
    const file = packKnowledge && [packKnowledge, `${packKnowledge}.js`, `${packKnowledge}.jsx`].map((f) => join(lessonDir, f)).find((f) => existsSync(f));
    if (!file) {
      errors.push(`${rel}: a v2 lesson with knowledgeMap: true needs a pack whose \`knowledge\` names an existing file — docs/architecture/LESSON_V2.md §1`);
    } else if (!/export\s+const\s+KNOWLEDGE_GRAPH\b|export\s*\{\s*KNOWLEDGE_GRAPH\s*\}/.test(readFileSync(file, 'utf-8'))) {
      errors.push(`${relative(repoRoot, file)}: the pack's knowledge must export KNOWLEDGE_GRAPH (the lesson's map) — docs/architecture/LESSON_V2.md §2`);
    }
  } else if (knowledgeMap) {
    if (knowledgeMapMode !== 'progressive') {
      errors.push(`${configPath}: knowledgeMap: true requires knowledgeMapMode: 'progressive' (got ${JSON.stringify(knowledgeMapMode)}) — docs/architecture/KNOWLEDGE_MAP.md A.13`);
    }
    if (!existsSync(join(lessonDir, 'knowledgeGraph.js'))) {
      errors.push(`${rel}: knowledgeMap: true requires a knowledgeGraph.js exporting KNOWLEDGE_GRAPH — docs/architecture/KNOWLEDGE_MAP.md A.9`);
    } else if (!/export\s*\{\s*KNOWLEDGE_GRAPH\s*\}\s*from\s*'\.\/knowledgeGraph'/.test(readFileSync(join(lessonDir, 'knowledge.jsx'), 'utf-8'))) {
      errors.push(`${rel}/knowledge.jsx: must re-export the graph — export { KNOWLEDGE_GRAPH } from './knowledgeGraph';`);
    }
  } else if (knowledgeMapMode === 'progressive') {
    errors.push(`${configPath}: knowledgeMapMode: 'progressive' without knowledgeMap: true`);
  }

  // ── Nature de la leçon et rattachement à l'unité (phase 8) ─────────────────
  if (!LESSON_KINDS.includes(kind)) {
    errors.push(`${configPath}: kind must be one of ${LESSON_KINDS.join('/')} (got ${JSON.stringify(kind)})`);
  }
  if (catalogEntry.kind !== kind) {
    errors.push(`${configPath}: kind '${kind}' but the catalogue declares '${catalogEntry.kind}' for '${code}'`);
  }
  if ((catalogEntry.unitId ?? null) !== (unit ?? null)) {
    errors.push(`${configPath}: unit ${JSON.stringify(unit ?? null)} but the catalogue places '${code}' in unit ${JSON.stringify(catalogEntry.unitId ?? null)}`);
  }

  // ── Ressources déclarées : manipulations, méthodes, situation ─────────────
  // Une manipulation est une DONNÉE (type d'un registre fermé + points
  // d'apprentissage qu'elle rend visibles), pas un composant nommé au hasard.
  if (resources === 'INVALID') {
    errors.push(`${configPath}: resources must be a literal array of resource objects`);
  } else if (Array.isArray(resources)) {
    const seenCodes = new Set();
    for (const r of resources) {
      const where = `${configPath}:${r.line}`;
      if (!RESOURCE_KINDS.includes(r.kind)) errors.push(`${where}: resource kind must be one of ${RESOURCE_KINDS.join('/')} (got ${JSON.stringify(r.kind)})`);
      if (typeof r.code !== 'string' || r.code === '') errors.push(`${where}: resource code must be a literal string`);
      else if (seenCodes.has(r.code)) errors.push(`${where}: duplicate resource code '${r.code}'`);
      else seenCodes.add(r.code);
      if (typeof r.title !== 'string' || r.title === '') errors.push(`${where}: resource title must be a literal string`);
      if (r.kind === 'manipulation' && !isManipulationType(r.type)) {
        errors.push(`${where}: manipulation type must be one of ${MANIPULATION_TYPE_IDS.join('/')} (got ${JSON.stringify(r.type)})`);
      }
      if (typeof r.module === 'number' && !modules?.some((m) => m.number === r.module)) {
        errors.push(`${where}: resource points at module ${r.module}, which does not exist in this lesson`);
      }
      if (!Array.isArray(r.learningPointIds) || r.learningPointIds.length === 0) {
        errors.push(`${where}: resource must list the learningPointIds it makes visible (literal array)`);
      } else {
        for (const lpId of r.learningPointIds) {
          if (!catalogEntry.learningPointIds.has(lpId)) errors.push(`${where}: resource references '${lpId}', which does not belong to lesson '${code}'`);
        }
      }
      if (r.sourceElementIds !== undefined && (!Array.isArray(r.sourceElementIds) || r.sourceElementIds.some((x) => typeof x !== 'string'))) {
        errors.push(`${where}: sourceElementIds must be a literal array of extraction element ids`);
      }

      // ── Les DEUX NIVEAUX et la traçabilité de l'expérience ──────────────
      // Le manuel dit CE QUE l'élève apprend ; la plateforme décide COMMENT
      // il le vit. Un contexte réhabillé doit donc dire d'où vient la
      // mathématique et pourquoi la situation a changé — jamais en silence
      // (docs/architecture/MANIPULATION_CONTRACT.md §7bis-levels).
      if (r.kind === 'manipulation') {
        if (r.level !== undefined) {
          if (!MANIPULATION_LEVEL_IDS.includes(r.level)) {
            errors.push(`${where}: manipulation level must be one of ${MANIPULATION_LEVEL_IDS.join('/')} (got ${JSON.stringify(r.level)})`);
          }
          if (typeof r.objective !== 'string' || r.objective === '') {
            errors.push(`${where}: a levelled manipulation must state its 'objective' — the mathematical objective, identical at both levels`);
          }
          if (r.level === 'advanced' && (typeof r.autonomy !== 'string' || r.autonomy === '')) {
            errors.push(`${where}: an 'advanced' manipulation must declare its 'autonomy' — what scaffolding it removes or demands more of. 'Beginner with bigger numbers' is not an advanced level.`);
          }
          if (r.experience === 'INVALID' || !r.experience) {
            errors.push(`${where}: a levelled manipulation must carry a literal 'experience' object { type, reason?, theme? }`);
          } else {
            if (!EXPERIENCE_TYPES.includes(r.experience.type)) {
              errors.push(`${where}: experience.type must be one of ${EXPERIENCE_TYPES.join('/')} (got ${JSON.stringify(r.experience.type)})`);
            } else if (r.experience.type !== 'textbook' && !ADAPTATION_REASONS.includes(r.experience.reason)) {
              errors.push(`${where}: an adapted context must carry one of these reasons: ${ADAPTATION_REASONS.join('/')}`);
            }
            if (r.experience.theme !== undefined && r.experience.theme !== '' && !VISUAL_THEME_IDS.includes(r.experience.theme)) {
              errors.push(`${where}: unknown visual theme ${JSON.stringify(r.experience.theme)} (one of ${VISUAL_THEME_IDS.join('/')})`);
            }
          }
          // Une manipulation à niveaux ne cite plus le manuel ? Sa
          // mathématique viendrait de nulle part.
          if (!Array.isArray(r.sourceElementIds) || r.sourceElementIds.length === 0) {
            errors.push(`${where}: a levelled manipulation must cite the textbook element its mathematics comes from (sourceElementIds)`);
          }
        }
      }
    }

    // ── Un module à niveaux en a DEUX, pas un ────────────────────────────
    // Dès qu'un module déclare un niveau, il doit déclarer les deux : un
    // « débutant » seul laisse l'élève avancé sans marche à monter, un
    // « avancé » seul laisse le débutant devant un mur (brief §3).
    const levelledByModule = new Map();
    for (const r of resources) {
      if (r.kind !== 'manipulation' || r.level === undefined) continue;
      if (!levelledByModule.has(r.module)) levelledByModule.set(r.module, []);
      levelledByModule.get(r.module).push(r);
    }
    for (const [moduleNumber, rs] of levelledByModule) {
      const present = new Set(rs.map((r) => r.level));
      const missing = MANIPULATION_LEVEL_IDS.filter((id) => !present.has(id));
      if (missing.length > 0) {
        errors.push(`${configPath}: module ${moduleNumber} declares a levelled manipulation but is missing its '${missing.join("', '")}' level — a levelled workspace always offers both`);
      }
      const objectives = new Set(rs.map((r) => r.objective).filter(Boolean));
      if (objectives.size > 1) {
        errors.push(`${configPath}: module ${moduleNumber}: both levels must serve the SAME mathematical objective — the context may change, the objective may not`);
      }
    }
    // Un module de manipulation doit déclarer AU MOINS une manipulation : le
    // stage sans la donnée est une étiquette vide.
    for (const m of modules ?? []) {
      if (m.stage === 'manipulation' && !resources.some((r) => r.kind === 'manipulation' && r.module === m.number)) {
        warnings.push(`${configPath}:${m.line}: module ${m.number} is a 'manipulation' stage but no manipulation resource points at it`);
      }
    }
  }

  // ── Stage contract ────────────────────────────────────────────────────────
  if (!modules || modules.length === 0) {
    errors.push(`${configPath}: LESSON_CONFIG.modules must be a non-empty array of module objects`);
  } else {
    let totalMin = 0;
    // Les « problèmes » (track: 'problem') sont un AJOUT de la plateforme : elles
    // comptent dans le plafond de 90 min, pas dans la comparaison avec la
    // durée que le propriétaire a déclarée au catalogue.
    let problemMin = 0;
    let prevOrder = -1;
    const presentStages = new Set();

    for (const m of modules) {
      const where = `${configPath}:${m.line}`;
      if (!VALID_STAGES.has(m.stage)) {
        errors.push(`${where}: module stage must be one of ${LESSON_STAGES.join('/')} (got ${JSON.stringify(m.stage)})`);
      } else {
        presentStages.add(m.stage);
        if (STAGE_ORDER[m.stage] < prevOrder) {
          errors.push(`${where}: stage '${m.stage}' appears after a later stage — modules must follow the journey order`);
        }
        prevOrder = Math.max(prevOrder, STAGE_ORDER[m.stage]);
      }
      if (typeof m.estimatedMin !== 'number' || m.estimatedMin <= 0) {
        errors.push(`${where}: module estimatedMin must be a positive numeric literal`);
      } else {
        totalMin += m.estimatedMin;
      }
      if (typeof m.slug !== 'string' || m.slug === '') {
        errors.push(`${where}: module slug must be a literal string (module files live at modules/<NN>_<slug>.jsx)`);
      }
      if (m.track != null && m.track !== 'problem') {
        errors.push(`${where}: module track must be 'problem' when present (got ${JSON.stringify(m.track)})`);
      }
      if (m.track === 'problem') {
        // Formatif par construction : jamais d'évaluation, toujours avant le test.
        if (m.stage !== 'practice_lab') errors.push(`${where}: a 'problem' module must be stage 'practice_lab' (got ${JSON.stringify(m.stage)})`);
        if (typeof m.estimatedMin === 'number') problemMin += m.estimatedMin;
      }
    }

    // The module-page player of « problem » modules (GuidedProblem, content/problems.js) is deleted (plan §4bis): a
    // 'problem' module is now DATA of a v2 lesson (a lesson with a `lesson.pack.js`, LESSON_V2.md §1) — progress is
    // stored by its number — and a lesson that would still need its page fails here.
    const problemModules = isV2Lesson(lessonDir) ? [] : modules.filter((m) => m.track === 'problem');
    if (problemModules.length > 0) {
      errors.push(`${configPath}: ${problemModules.length} 'problem' module(s) with pages, but the GuidedProblem player is deleted — a 'problem' module lives only in a v2 lesson (one with a lesson.pack.js)`);
    }

    // ── Learning-point wiring: what each module teaches / gates on ────────
    const taughtSoFar = new Set();
    const allTaught = new Set();
    for (const m of modules) {
      const where = `${configPath}:${m.line}`;

      for (const [field, ids] of [
        ['teachesLearningPointIds', m.teachesLearningPointIds],
        ['requiresLearningPointIds', m.requiresLearningPointIds],
      ]) {
        if (ids === undefined) continue;
        if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
          errors.push(`${where}: ${field} must be a literal array of learning point id strings`);
          continue;
        }
        for (const lpId of ids) {
          if (!catalogEntry.learningPointIds.has(lpId)) {
            errors.push(`${where}: ${field} references '${lpId}', which does not belong to lesson '${code}'`);
          }
        }
      }

      if (m.stage === 'evaluation' && Array.isArray(m.teachesLearningPointIds) && m.teachesLearningPointIds.length > 0) {
        errors.push(`${where}: an evaluation module evaluates — it must not declare teachesLearningPointIds`);
      }

      if (Array.isArray(m.requiresLearningPointIds)) {
        for (const lpId of m.requiresLearningPointIds) {
          if (catalogEntry.learningPointIds.has(lpId) && !taughtSoFar.has(lpId)) {
            errors.push(`${where}: mastery gate requires '${lpId}', but no EARLIER module teaches it — gates may only depend on already-taught learning points`);
          }
        }
      }

      if (Array.isArray(m.teachesLearningPointIds)) {
        for (const lpId of m.teachesLearningPointIds) {
          taughtSoFar.add(lpId);
          allTaught.add(lpId);
        }
      }
    }

    if (strict || catalogEntry.status === 'available') {
      for (const lpId of catalogEntry.learningPointIds) {
        if (!allTaught.has(lpId)) {
          errors.push(`${configPath}: learning point '${lpId}' is not taught by any module (no teachesLearningPointIds lists it)`);
        }
      }
    }

    if (totalMin > MAX_LESSON_MINUTES) {
      errors.push(`${configPath}: modules total ${totalMin} min — the cap is ${MAX_LESSON_MINUTES} min per lesson; split the lesson instead`);
    }
    if (catalogEntry.durationMinutes != null && Math.abs(totalMin - problemMin - catalogEntry.durationMinutes) > 10) {
      warnings.push(`${configPath}: modules total ${totalMin - problemMin} min (without problems) but the catalogue declares ${catalogEntry.durationMinutes} min — realign coursesData.js`);
    }
    if (strict || catalogEntry.status === 'available') {
      for (const required of (REQUIRED_STAGES_BY_KIND[kind] ?? REQUIRED_STAGES)) {
        // A lesson driven by the Knowledge Map formalises continuously: no
        // « À retenir » module is expected (see LESSON_CONTRACT.md).
        if (required === 'formalization' && knowledgeMap) continue;
        if (!presentStages.has(required)) {
          errors.push(`${configPath}: missing required stage '${required}'`);
        }
      }
    }
  }

  // ── Le renvoi « Revoir le module N » du test final ─────────────────────────
  // BossFinal lit `skills[k].module` pour construire le lien proposé à l'élève
  // qui a raté une compétence. Après la suppression d'un module « À retenir »,
  // sept de ces renvois pointaient encore un cran trop loin — donc sur le test
  // final LUI-MÊME : l'élève en difficulté était renvoyé à l'épreuve qu'il
  // venait d'échouer. Rien ne le voyait, le lien étant valide.
  for (const file of listSourceFiles(lessonDir)) {
    if (!/Module\d+.*\.jsx$/.test(file) || !readFileSync(file, 'utf-8').includes('skills=')) continue;
    const owner = moduleOfFile(lessonDir, modules, file);
    if (owner?.stage !== 'evaluation') continue;
    const ast = parseFile(file);
    traverse(ast, {
      VariableDeclarator(path) {
        if (path.node.id.name !== 'SKILLS' || path.node.init?.type !== 'ObjectExpression') return;
        for (const prop of path.node.init.properties) {
          if (prop.type !== 'ObjectProperty' || prop.value.type !== 'ObjectExpression') continue;
          const target = literalValue(propOf(prop.value, 'module'));
          if (typeof target !== 'number') continue;
          const targetModule = modules?.find((m) => m.number === target);
          const where = `${relative(repoRoot, file)}:${prop.loc?.start.line}`;
          if (!targetModule) {
            errors.push(`${where}: skill '${prop.key.name}' points at module ${target}, which does not exist in this lesson`);
          } else if (targetModule.stage === 'evaluation') {
            errors.push(`${where}: skill '${prop.key.name}' sends the student back to module ${target} — the evaluation itself. Point at the module that TEACHES it.`);
          }
        }
      },
    });
  }

  // ── A v2 lesson: its assessment evidence is the world's ─────────────────────
  // It has no module page (and no final test of modules): it is a lesson with a `lesson.pack.js` (LESSON_V2.md §1).
  // What proves a learning point (« savoir-faire ») is an exam-format answer of the game world, sent as a claim the SERVER
  // re-computes (§1bis): `world/evidence.js` names, for each key, the learning point it proves
  // (`const POINTS = { <key>: 'P<n>' }`). A learning point that no key proves stays uncovered below — the same error as
  // a lesson whose final test forgets it.
  if (isV2Lesson(lessonDir)) {
    // A UNIT'S LAST LESSON (world « mission-isle », docs/reports/INTEGRATION_LESSON_PLAN.md §5) forges no key: what proves
    // its learning point is its BANK in exam form (the sitting, mission 3 with it) — the server re-computes each answer from the
    // sheet. Its coverage is read from the bank: the learning points the questions of `content/practice/` carry.
    if (packWorldId(lessonDir) === 'mission-isle') {
      const bank = join(repoRoot, 'content', 'practice', gradeId, code);
      const codes = new Set();
      if (existsSync(bank))
        for (const f of readdirSync(bank, { recursive: true }))
          if (String(f).endsWith('.json'))
            for (const m of readFileSync(join(bank, String(f)), 'utf-8').matchAll(/"code":\s*"([^"]+)"/g)) codes.add(m[1]);
      migratedCoverage.set(indexKey, codes);
      continue;
    }
    const evidenceFile = join(lessonDir, 'world', 'evidence.js');
    const points = existsSync(evidenceFile) ? readFileSync(evidenceFile, 'utf-8').match(/const POINTS = \{([^}]*)\}/)?.[1] ?? '' : '';
    migratedCoverage.set(indexKey, new Set([...points.matchAll(/'(P\d+)'/g)].map((m) => `${gradeId}_${code}_${m[1]}`)));
    continue;
  }

  // ── Question-level assessment metadata ────────────────────────────────────
  const questions = listSourceFiles(lessonDir).flatMap(extractQuestions);
  if (questions.length === 0) continue; // not migrated yet — not an error in default mode

  const seenIds = new Set();
  const covered = new Set();

  for (const q of questions) {
    const where = `${relative(repoRoot, q.file)}:${q.line}`;

    if (typeof q.id !== 'string' || q.id === '') {
      errors.push(`${where}: assessment-tagged question has no literal string id`);
    } else if (seenIds.has(q.id)) {
      errors.push(`${where}: duplicate question id '${q.id}' in lesson '${code}'`);
    } else {
      seenIds.add(q.id);
    }

    if (typeof q.enabled !== 'boolean') {
      errors.push(`${where}: assessment.enabled must be a boolean literal`);
    }
    if (!VALID_TYPES.has(q.type)) {
      errors.push(`${where}: assessment.type must be one of ${[...VALID_TYPES].join('/')} (got ${JSON.stringify(q.type)})`);
    }
    if (q.enabled === true && q.type !== 'assessment') {
      errors.push(`${where}: enabled:true requires type:'assessment' — discovery/practice never submit evidence`);
    }

    if (q.enabled === true) {
      // Learning vs evaluation stays a hard boundary: only the final
      // challenge produces mastery evidence, so enabled questions must sit
      // inside an evaluation-stage module's directory.
      const owner = moduleOfFile(lessonDir, modules, q.file);
      if (!owner) {
        warnings.push(`${where}: enabled assessment question is not under modules/<slug>/ for any declared module — cannot verify it belongs to an evaluation stage`);
      } else if (owner.stage !== 'evaluation') {
        errors.push(`${where}: enabled assessment questions may only live in an 'evaluation'-stage module (found stage '${owner.stage}')`);
      }
    }

    if (q.enabled === true) {
      // Le lien question → learning point, dans l'une des deux écritures.
      let refs = null;
      if (q.learningPoints !== undefined) {
        if (q.learningPoints === 'INVALID') {
          errors.push(`${where}: assessment.learningPoints must be a literal array of {code: string, role: 'primary'|'secondary'}`);
        } else {
          refs = q.learningPoints;
          const primaries = refs.filter((lp) => lp.role === 'primary');
          if (primaries.length !== 1) {
            errors.push(`${where}: assessment.learningPoints must carry exactly one 'primary' learning point (got ${primaries.length})`);
          }
          if (refs.length > 4) {
            errors.push(`${where}: assessment.learningPoints may list at most 4 learning points`);
          }
        }
      } else if (Array.isArray(q.learningPointIds) && q.learningPointIds.length > 0) {
        refs = q.learningPointIds.map((id) => ({ code: id, role: 'primary' }));
        // L'écriture héritée n'a pas de rôle : avec plusieurs points, elle
        // déclarerait plusieurs PRINCIPAUX, ce que le registre d'items refuse
        // (Mastery V2 : exactement un principal). Bloquant pour une leçon
        // vivante ; avertissement pour l'arbre dormant, jamais importé.
        if (q.learningPointIds.length > 1) {
          const dormant = /^apps\/web\/src\/lessons\/(college|lycee)\//.test(relative(repoRoot, q.file));
          (dormant ? warnings : errors).push(`${where}: several learningPointIds without roles — use assessment.learningPoints: [{code, role: 'primary'}, {code, role: 'secondary'}] (exactly one primary)`);
        }
      }

      if (!refs || refs.length === 0) {
        errors.push(`${where}: enabled assessment question must list at least one learning point (learningPoints or learningPointIds)`);
      } else {
        for (const { code: lpId } of refs) {
          if (!catalogEntry.learningPointIds.has(lpId)) {
            errors.push(`${where}: learning point '${lpId}' does not belong to lesson '${code}'`);
          } else {
            covered.add(lpId);
          }
        }
      }

      // La difficulté (1..5) que le registre d'items et le moteur de maîtrise
      // liront ; facultative (défaut 3 côté serveur), littérale quand présente.
      if (q.hasDifficulty && !(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 5)) {
        errors.push(`${where}: assessment.difficulty must be an integer literal between 1 and 5`);
      }
      // La clé de réponse du registre : `correct` doit être lisible. Absent,
      // la convention BossFinal (index 0) s'applique — mais un `correct`
      // calculé ne peut pas être exporté, donc pas jugé par le serveur.
      if (q.hasCorrect && typeof q.correct !== 'number') {
        // Sans clé lisible, le serveur ne peut pas juger : l'item est exporté
        // `evaluation: client` et sa preuve pèse moins. Bloquant pour une
        // leçon vivante ; un avertissement pour l'arbre dormant (college/,
        // lycee/), qui n'est ni monté ni importé.
        const dormant = /^apps\/web\/src\/lessons\/(college|lycee)\//.test(relative(repoRoot, q.file));
        (dormant ? warnings : errors).push(`${where}: 'correct' must be a numeric literal — the assessment-item registry exports it as the answer key (computed ⇒ evaluation: client)`);
      }
    } else if ((q.learningPointIds !== undefined || q.learningPoints !== undefined) && q.type !== 'assessment') {
      errors.push(`${where}: discovery/practice questions must not carry learning points`);
    }
  }

  migratedCoverage.set(indexKey, covered);
}

// Coverage: always enforced for migrated lessons; in --strict, for every
// 'available' lesson in the catalogue.
const coverageTargets = strict
  ? [...lessonIndex.entries()].filter(([, e]) => e.status === 'available').map(([c]) => c)
  : [...migratedCoverage.keys()];

for (const code of coverageTargets) {
  const entry = lessonIndex.get(code);
  const covered = migratedCoverage.get(code) ?? new Set();
  for (const lpId of entry.learningPointIds) {
    if (!covered.has(lpId)) {
      errors.push(`lesson '${code}': learning point '${lpId}' has no assessment question`);
    }
  }
}

// ── Answer-key integrity (2026-09-24) ─────────────────────────────────────
// Every multiple-choice key a student can be judged against in a LIVE lesson
// (the collège tree, apps/web/src/lessons/college/) must point to an option
// that exists, and a question that shows options must declare its key:
// TapQuestion compares `pick === correct` with no default (a missing key makes
// the question unanswerable), and BossFinal would silently fall back to 0.
// Found necessary by the content-integrity audit; the dormant tree is not
// mounted and is not checked here.
const liveRoot = join(lessonsRoot, 'college');
const optionCount = (node) => {
  if (!node) return null;
  if (node.type === 'JSXExpressionContainer') return optionCount(node.expression);
  if (node.type === 'ArrayExpression') return node.elements.length;
  // ['…', '…'].map((o) => <MathText …/>) keeps the length of its array
  if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression'
      && node.callee.property?.name === 'map') return optionCount(node.callee.object);
  return null;
};
const keyOf = (node) => {
  if (node === undefined) return { present: false };
  const n = node.type === 'JSXExpressionContainer' ? node.expression : node;
  return { present: true, literal: n?.type === 'NumericLiteral', value: n?.type === 'NumericLiteral' ? n.value : null };
};
const checkKey = (where, count, key, mustDeclare) => {
  if (!key.present) {
    if (mustDeclare) errors.push(`${where}: question shows ${count ?? 'some'} options but declares no 'correct' key`);
    return;
  }
  if (!key.literal || count === null) return; // computed key or options: not checkable statically
  if (!Number.isInteger(key.value) || key.value < 0 || key.value >= count) {
    errors.push(`${where}: 'correct' = ${key.value} but there are only ${count} options (valid: 0..${count - 1})`);
  }
};
if (existsSync(liveRoot)) {
  for (const file of listSourceFiles(liveRoot)) {
    const source = readFileSync(file, 'utf-8');
    if (!source.includes('options')) continue;
    const ast = parseFile(file);
    const rel = relative(repoRoot, file);
    traverse(ast, {
      ObjectExpression(path) {
        const optionsNode = propOf(path.node, 'options');
        const count = optionCount(optionsNode);
        if (count === null) return;
        // a question with SEVERAL right answers declares them as a set — `answer: [values]` (a world's stone) — not as
        // one index; whether that set is the true one is the lesson's own test (its journey.test.js), not a static check
        if (propOf(path.node, 'answer')?.type === 'ArrayExpression') return;
        const isQuestion = propOf(path.node, 'assessment') !== undefined
          || propOf(path.node, 'prompt') !== undefined || propOf(path.node, 'explain') !== undefined;
        checkKey(`${rel}:${path.node.loc?.start.line}`, count, keyOf(propOf(path.node, 'correct')), isQuestion);
      },
      JSXOpeningElement(path) {
        const name = path.node.name?.name;
        if (name !== 'TapQuestion') return;
        const attr = (n) => path.node.attributes.find((a) => a.type === 'JSXAttribute' && a.name?.name === n)?.value;
        checkKey(`${rel}:${path.node.loc?.start.line}`, optionCount(attr('options')), keyOf(attr('correct')), true);
      },
    });
  }
}

const migratedCount = migratedCoverage.size;
console.log(`Scanned lessons under ${relative(repoRoot, lessonsRoot)} — ${migratedCount} lesson(s) carry assessment metadata.`);
for (const [key, covered] of migratedCoverage) {
  const total = lessonIndex.get(key)?.learningPointIds.size ?? 0;
  console.log(`  ${key}: ${covered.size}/${total} learning points covered`);
}

if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(strict ? 'Strict validation passed.' : 'Validation passed (default mode — unmigrated lessons are not coverage-checked).');
