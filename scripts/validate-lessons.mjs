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

import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import {
  LESSON_STAGES,
  STAGE_ORDER,
  REQUIRED_STAGES,
  MAX_LESSON_MINUTES,
} from '../packages/core/curriculum/lessonStages.js';
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

      questions.push({
        file,
        line: path.node.loc?.start.line,
        id: literalValue(propOf(path.node, 'id')),
        enabled: literalValue(enabledNode),
        type: literalValue(propOf(assessmentNode, 'type')),
        learningPointIds: literalValue(propOf(assessmentNode, 'learningPointIds')),
      });
    },
  });

  return questions;
}

const errors = [];
const warnings = [];
const migratedCoverage = new Map(); // lesson code -> Set of covered LP ids

for (const lessonDir of findLessonDirs(lessonsRoot)) {
  const { id: code, modules, knowledgeMap, priorKnowledge } = parseLessonConfig(lessonDir);
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

  // ── Stage contract ────────────────────────────────────────────────────────
  if (!modules || modules.length === 0) {
    errors.push(`${configPath}: LESSON_CONFIG.modules must be a non-empty array of module objects`);
  } else {
    let totalMin = 0;
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
    if (catalogEntry.durationMinutes != null && Math.abs(totalMin - catalogEntry.durationMinutes) > 10) {
      warnings.push(`${configPath}: modules total ${totalMin} min but the catalogue declares ${catalogEntry.durationMinutes} min — realign coursesData.js`);
    }
    if (strict || catalogEntry.status === 'available') {
      for (const required of REQUIRED_STAGES) {
        // A lesson driven by the Knowledge Map formalises continuously: no
        // « À retenir » module is expected (see LESSON_CONTRACT.md).
        if (required === 'formalization' && knowledgeMap) continue;
        if (!presentStages.has(required)) {
          errors.push(`${configPath}: missing required stage '${required}'`);
        }
      }
    }
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
      if (!Array.isArray(q.learningPointIds) || q.learningPointIds.length === 0) {
        errors.push(`${where}: enabled assessment question must list at least one learningPointId`);
      } else {
        for (const lpId of q.learningPointIds) {
          if (!catalogEntry.learningPointIds.has(lpId)) {
            errors.push(`${where}: learningPointId '${lpId}' does not belong to lesson '${code}'`);
          } else {
            covered.add(lpId);
          }
        }
      }
    } else if (q.learningPointIds !== undefined && q.type !== 'assessment') {
      errors.push(`${where}: discovery/practice questions must not carry learningPointIds`);
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
