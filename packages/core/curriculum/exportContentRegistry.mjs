// Exporte le REGISTRE DE CONTENU — modules de leçon, exercices de pratique et
// ITEMS d'évaluation — pour l'importateur Laravel
// (php artisan smarter:import-content-registry).
//
// Même poignée de main, et pour la même raison, que exportCurriculum.mjs :
// PHP ne peut pas importer un module ES, et réécrire en PHP la façon dont un
// lesson.config.js déclare ses modules créerait une seconde définition qui
// dériverait. La frontière est ce fichier généré.
//
// Ce que l'export porte : l'IDENTITÉ des modules, des exercices et des items,
// jamais leur contenu pédagogique — à une exception près, voulue : la CLÉ DE
// RÉPONSE d'un item (le choix juste, la réponse attendue, la politique
// d'évaluation). C'est ce qui rend le serveur capable de juger une réponse
// sans faire confiance au client (Mastery V2, phase 3). L'énoncé, les
// indices, les retours restent dans le JSX et dans content/practice/.
//
// Pourquoi un import() dynamique plutôt qu'une lecture d'AST (la méthode de
// scripts/lib/lessonAst.mjs) pour les lesson.config.js : ce sont des modules
// ES purs, sans JSX ni React, et les importer donne des valeurs DÉJÀ
// RÉSOLUES. Les questions du test final, elles, vivent dans du JSX : on les
// lit par l'AST, comme validate-lessons.mjs, et on n'en prend que les
// littéraux (le contrat AI_LESSON_CONTRACT.md exige des métadonnées
// statiques — un `correct` calculé n'existe pas).
//
// Usage: node packages/core/curriculum/exportContentRegistry.mjs [outputPath]

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import {
  parseFile, propOf, literalValue, listSourceFiles, moduleOfFile, traverse,
} from '../../../scripts/lib/lessonAst.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const lessonsRoot = join(repoRoot, 'apps/web/src/lessons');
// SMARTER_PRACTICE_ROOT : même dérogation que validate-exercises.mjs, pour
// les essais de charge sur une banque synthétique.
const practiceRoot = process.env.SMARTER_PRACTICE_ROOT || join(repoRoot, 'content/practice');
const outputPath = resolve(
  process.argv[2] || join(here, '.generated/content-registry-export.json')
);

/** Le pseudo-code d'exercice du test final — même valeur que EvidenceClassifier::FINAL_TEST_EXERCISE. */
const FINAL_TEST_EXERCISE = 'final';
/** Difficulté d'une question de test final qui n'en déclare pas — config mastery.engines.2.default_difficulty. */
const DEFAULT_FINAL_TEST_DIFFICULTY = 3;

const sha1 = (value) => createHash('sha1').update(JSON.stringify(value)).digest('hex');
const itemKey = (sourceKind, lessonCode, exerciseCode, questionId) =>
  `${sourceKind}:${lessonCode}:${exerciseCode ?? FINAL_TEST_EXERCISE}:${questionId}`;

/** Chaque dossier contenant un lesson.config.js (recherche en profondeur). */
function findLessonDirs(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (existsSync(join(full, 'lesson.config.js'))) acc.push(full);
    else findLessonDirs(full, acc);
  }
  return acc;
}

/**
 * `learningPoints: [{code, role}]` — la forme canonique — ou l'héritage
 * `learningPointIds: ['…']` (tous principaux). Renvoie null quand rien n'est
 * littéral.
 */
function readLearningPoints(assessmentNode) {
  const canonical = propOf(assessmentNode, 'learningPoints');
  if (canonical?.type === 'ArrayExpression') {
    const out = [];
    for (const el of canonical.elements) {
      if (el?.type !== 'ObjectExpression') return null;
      const code = literalValue(propOf(el, 'code'));
      const role = literalValue(propOf(el, 'role')) ?? 'primary';
      if (typeof code !== 'string') return null;
      out.push({ code, role: role === 'secondary' ? 'secondary' : 'primary' });
    }
    return out;
  }
  const ids = literalValue(propOf(assessmentNode, 'learningPointIds'));
  if (Array.isArray(ids) && ids.every((v) => typeof v === 'string')) {
    return ids.map((code) => ({ code, role: 'primary' }));
  }
  return null;
}

/**
 * Les questions ÉVALUATIVES d'un fichier de module : chaque objet portant
 * `assessment: {enabled: true, …}`. Ne lit que des littéraux.
 */
function extractAssessedQuestions(file) {
  const source = readFileSync(file, 'utf-8');
  if (!source.includes('assessment')) return [];
  const ast = parseFile(file);
  const questions = [];
  traverse(ast, {
    ObjectExpression(path) {
      const assessment = propOf(path.node, 'assessment');
      if (!assessment || assessment.type !== 'ObjectExpression') return;
      if (literalValue(propOf(assessment, 'enabled')) !== true) return;
      if (literalValue(propOf(assessment, 'type')) !== 'assessment') return;

      const optionsNode = propOf(path.node, 'options');
      const correctNode = propOf(path.node, 'correct');
      const correct = literalValue(correctNode);
      questions.push({
        id: literalValue(propOf(path.node, 'id')),
        title: literalValue(propOf(path.node, 'title')) ?? null,
        // Convention BossFinal (correctIndexOf) : `correct` absent ⇒ 0. Un
        // `correct` CALCULÉ, lui, n'est pas lisible ici : l'item sera exporté
        // sans clé, `evaluation: client` — le serveur ne devine pas.
        correct: correctNode === undefined ? 0 : (typeof correct === 'number' ? correct : null),
        // `[…]` ou `[…].map(…)` (options mises en forme) : même nombre d'options.
        optionCount: optionsNode?.type === 'ArrayExpression' ? optionsNode.elements.length
          : optionsNode?.type === 'CallExpression' && optionsNode.callee?.property?.name === 'map'
            && optionsNode.callee.object?.type === 'ArrayExpression' ? optionsNode.callee.object.elements.length
            : null,
        difficulty: literalValue(propOf(assessment, 'difficulty')),
        cognitiveDemand: literalValue(propOf(assessment, 'cognitiveDemand')) ?? null,
        learningPoints: readLearningPoints(assessment),
        file,
        line: path.node.loc?.start.line,
      });
    },
  });
  return questions;
}

const lessons = [];
const items = [];
const problems = [];

for (const dir of findLessonDirs(lessonsRoot)) {
  let config;
  try {
    const mod = await import(pathToFileURL(join(dir, 'lesson.config.js')).href);
    config = mod.LESSON_CONFIG;
  } catch (error) {
    problems.push(`${dir}: import impossible — ${error.message}`);
    continue;
  }

  if (!config?.id) {
    problems.push(`${dir}: LESSON_CONFIG.id manquant`);
    continue;
  }
  if (!Array.isArray(config.modules)) {
    problems.push(`${dir}: LESSON_CONFIG.modules absent`);
    continue;
  }

  lessons.push({
    // `id` est la clé de rapprochement avec lessons.code en base — le NOM DU
    // DOSSIER ne l'est pas (racines-carrees-4e vit dans un dossier
    // racines-carrees). Voir docs : LESSON_BASE_PATH = l'id, pas le dossier.
    code: config.id,
    grade: config.grade ?? null,
    // Phase 8 : les RESSOURCES déclarées (manipulations, méthodes,
    // situations). `undefined` (clé absente) quand la leçon n'en déclare
    // pas : l'importateur ne touche alors pas à la table.
    ...(Array.isArray(config.resources)
      ? {
          resources: config.resources.map((r) => ({
            code: r.code,
            kind: r.kind,
            type: r.type ?? null,
            title: r.title ?? '',
            description: r.description ?? null,
            module: Number.isFinite(r.module) ? r.module : null,
            learningPointIds: Array.isArray(r.learningPointIds) ? r.learningPointIds : null,
            sourceElementIds: Array.isArray(r.sourceElementIds) ? r.sourceElementIds : null,
            config: r.config ?? null,
          })),
        }
      : {}),
    modules: config.modules.map((m, index) => ({
      code: String(m.id ?? m.number ?? index),
      number: Number.isFinite(m.number) ? m.number : index,
      slug: m.slug ?? null,
      title: m.title ?? '',
      description: m.desc ?? null,
      stage: m.stage ?? null,
      estimatedMin: Number.isFinite(m.estimatedMin) ? m.estimatedMin : null,
      difficulty: Number.isFinite(m.difficulty) ? m.difficulty : null,
      // null (et non []) quand le module n'en déclare aucun : « ce module
      // n'enseigne aucun point » et « on n'a pas regardé » ne sont pas la
      // même chose. 265 modules sur 1082 sont dans ce cas.
      teachesLearningPointCodes: Array.isArray(m.teachesLearningPointIds)
        ? m.teachesLearningPointIds
        : null,
    })),
  });

  // --- Items du test final -------------------------------------------------
  // Une question évaluative d'un module `evaluation` = un item du registre,
  // avec sa clé de réponse (l'indice du choix juste). Une question hors
  // module d'évaluation, ou sans learning point littéral, est un PROBLÈME :
  // le validateur de leçons la refuse déjà ; ici on ne l'exporte pas en
  // silence.
  for (const file of listSourceFiles(dir)) {
    for (const q of extractAssessedQuestions(file)) {
      const where = `${relative(repoRoot, file)}:${q.line}`;
      const owner = moduleOfFile(dir, config.modules, file);
      if (!owner || owner.stage !== 'evaluation') {
        problems.push(`${where}: question évaluative hors d'un module « evaluation » — non exportée`);
        continue;
      }
      if (typeof q.id !== 'string' || !q.learningPoints || q.learningPoints.length === 0) {
        problems.push(`${where}: question évaluative sans id littéral ou sans learning point littéral — non exportée`);
        continue;
      }
      const difficulty = Number.isInteger(q.difficulty) ? q.difficulty : DEFAULT_FINAL_TEST_DIFFICULTY;
      const serverJudges = q.correct !== null;
      const answerKey = serverJudges ? { correct: q.correct, optionCount: q.optionCount } : null;
      items.push({
        lessonCode: config.id,
        itemKey: itemKey('final_test', config.id, null, q.id),
        sourceKind: 'final_test',
        exerciseCode: null,
        questionId: q.id,
        templateKey: null,
        difficulty,
        cognitiveDemand: q.cognitiveDemand,
        answerType: 'choice',
        title: q.title,
        learningPoints: q.learningPoints,
        answerKey,
        evaluation: serverJudges ? 'server' : 'client',
        // La version ne bouge que si ce qui JUGE bouge : l'id, la clé, les
        // points, la difficulté. Reformuler l'énoncé ne réécrit rien.
        contentVersion: sha1({ id: q.id, answerKey, learningPoints: q.learningPoints, difficulty }),
      });
    }
  }
}

// --- Exercices de pratique -------------------------------------------------
// Lus depuis l'index généré par validate-exercises.mjs, la même source que
// l'ExerciseRepository de Laravel : deux lectures du même fichier, jamais deux
// façons de recenser.
const exercises = [];
const indexPath = join(practiceRoot, 'index.generated.json');

if (existsSync(indexPath)) {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));

  for (const [lessonCode, levels] of Object.entries(index)) {
    for (const [level, ids] of Object.entries(levels)) {
      for (const exerciseCode of ids) {
        // Le titre et le nombre de questions se lisent dans le fichier de
        // l'exercice. Le fichier vit sous content/practice/<niveau>/<leçon>/
        // level-N/ ; le segment <niveau> n'est pas connu ici, d'où le balayage.
        let data = null;
        for (const dirName of readdirSync(practiceRoot)) {
          const file = join(practiceRoot, dirName, lessonCode, `level-${level}`, `${exerciseCode}.json`);
          if (!existsSync(file)) continue;
          data = JSON.parse(await readFile(file, 'utf8'));
          break;
        }

        exercises.push({
          lessonCode,
          exerciseCode,
          level: Number(level),
          title: data?.metadata?.title ?? null,
          questionCount: Array.isArray(data?.questions) ? data.questions.length : 0,
        });

        // Chaque question = un item, avec sa clé de réponse complète : c'est
        // elle que le serveur donne à AnswerEvaluator (PHP) pour juger.
        for (const q of data?.questions ?? []) {
          const difficulty = Number.isInteger(q.difficulty) ? q.difficulty : Number(level);
          const answerKey = {
            answerType: q.answerType,
            expectedAnswer: q.expectedAnswer ?? null,
            evaluationPolicy: q.evaluationPolicy ?? null,
            choices: Array.isArray(q.choices)
              ? q.choices.map((c) => ({ id: c.id, isCorrect: !!c.isCorrect, misconceptionId: c.misconceptionId ?? null }))
              : null,
            misconceptionSignatures: q.misconceptionSignatures ?? null,
          };
          const learningPoints = (q.learningPoints ?? []).map((lp) => ({ code: lp.code, role: lp.role ?? 'primary' }));
          items.push({
            lessonCode,
            itemKey: itemKey('practice', lessonCode, exerciseCode, q.id),
            sourceKind: 'practice',
            exerciseCode,
            questionId: q.id,
            templateKey: data?.templateId ?? null,
            difficulty,
            cognitiveDemand: q.cognitiveDemand ?? null,
            answerType: q.answerType,
            title: data?.metadata?.title ?? null,
            learningPoints,
            answerKey,
            evaluation: 'server',
            contentVersion: sha1({ id: q.id, answerKey, learningPoints, difficulty, templateKey: data?.templateId ?? null }),
          });
        }
      }
    }
  }
}

if (problems.length) {
  console.error('Problèmes rencontrés :');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  JSON.stringify({ exportedAt: null, lessons, exercises, items }, null, 2) + '\n'
);

const moduleCount = lessons.reduce((n, l) => n + l.modules.length, 0);
console.log(`Content registry export written to ${outputPath}`);
console.log(`${lessons.length} lessons, ${moduleCount} modules, ${exercises.length} exercises, ${items.length} assessment items`);
