#!/usr/bin/env node
/**
 * Porte de validation du contenu d'exercices (moteur de pratique).
 *
 * Pourquoi ce script existe AVANT le premier exercice : dans ce dépôt, un
 * contrat n'est pas un document, c'est un script qui échoue.
 * validate-lessons.mjs, check-routes.mjs, check-non-blocking.mjs ont tous été
 * écrits avant que la classe de défaut correspondante ne se répande. Le
 * contenu de pratique mérite le même traitement, et il ne l'aura jamais à
 * meilleur compte qu'aujourd'hui : il y a zéro exercice à corriger.
 *
 * Ce que le schéma JSON ne peut pas exprimer et qui se vérifie ici :
 *   — un code de Learning Point appartient-il VRAIMENT à cette leçon ;
 *   — la réponse attendue est-elle analysable par le vrai évaluateur
 *     (une réponse attendue illisible rend la question insoluble en production,
 *      c'est la vérification la plus rentable du lot) ;
 *   — un indice, un retour ou le format de réponse divulguent-ils la solution.
 *
 *   node scripts/validate-exercises.mjs [--strict] [--json]
 *
 * --strict : exige, pour chaque leçon activée, `defaultMinPerLevel` exercices
 *            par niveau (content/practice/policy.json, 3 aujourd'hui, ou le
 *            minimum dérogatoire de la leçon) sur les 5 niveaux — et 10
 *            feuilles par niveau (EXAM_PER_LEVEL) pour une leçon au format
 *            examen (exam-style.json) ; refuse un index généré périmé.
 *            Utilisé par check:lessons.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { buildLessonIndex, repoRoot } from './lib/lessonAst.mjs';
import { Rational } from '../packages/core/practice/rational.js';
import { parseAffineAnswer } from '../packages/core/practice/affineCanonical.js';
import { parseInterval } from '../packages/core/practice/intervalCompare.js';
import { SUPPORTED_ANSWER_TYPES, parseIntegerSet, evaluateAnswer, isSuccessOutcome } from '../packages/core/practice/answerEvaluator.js';
import { parseFactorization, factorizationKeyProblem, factorizationToLatex, factorizationToPlain } from '../packages/core/practice/factorization.js';
import { validateStatementFigure } from '../apps/web/src/lessons/common/components/statementFigure.js';
import { figureQuality } from '../apps/web/src/lessons/common/components/geoFigure.js';
import { EXAM_SUBS, brevetTagErrors, examProvenanceErrors, exerciseTypographyErrors } from './validate-lib.mjs';

const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
/** Feuilles par niveau d'une leçon au format examen (norme du déploiement des feuilles d'examen, 2026-10-06). */
const EXAM_PER_LEVEL = 10;
const AS_JSON = argv.includes('--json');

// SMARTER_PRACTICE_ROOT : une autre racine de contenu — pour les essais de
// charge (banque synthétique de 500 exercices par niveau), jamais en CI.
const CONTENT_ROOT = process.env.SMARTER_PRACTICE_ROOT || join(repoRoot, 'content/practice');
const INDEX_PATH = join(CONTENT_ROOT, 'index.generated.json');
const LEVELS = [1, 2, 3, 4, 5];
const MIN_PER_LEVEL = 3;

/**
 * Politique de couverture par leçon (content/practice/policy.json).
 *
 * L'invariant 12 (3 exercices × 5 niveaux) est le défaut. Une leçon dont les
 * exercices viennent d'un MANUEL scolaire ne peut pas l'atteindre sans
 * inventer des énoncés — ce que le projet interdit (docs/sources/…). Elle
 * déclare alors ici un minimum plus bas, avec sa source : l'exception est
 * VISIBLE et nominative, jamais un abaissement général du contrat.
 */
function readPolicy() {
  const read = readJson(join(CONTENT_ROOT, 'policy.json'));
  if (!read.ok) return { defaultMinPerLevel: MIN_PER_LEVEL, lessons: {} };
  return {
    defaultMinPerLevel: Number.isInteger(read.data.defaultMinPerLevel) ? read.data.defaultMinPerLevel : MIN_PER_LEVEL,
    lessons: read.data.lessons ?? {},
  };
}

/**
 * Props réellement acceptées par CoordPlane
 * (apps/web/src/lessons/common/components/CoordPlane.jsx:157-196). Une faute
 * de frappe dans `visual` rendrait un plan vide sans rien dire ; ici elle
 * échoue.
 */
const COORDPLANE_PROPS = new Set([
  'range', 'unit', 'unitY', 'step', 'points', 'segments', 'polygons', 'arrows',
  'guides', 'ghost', 'target', 'overlay', 'showGrid', 'axisLabels', 'size',
  'ariaLabel', 'caption', 'functions', 'curves', 'cursor', 'readGuides',
  'staircase', 'intercept', 'highlightIntervals', 'xStep', 'yStep', 'labelEvery',
  'frozen', 'disabled',
]);

/** Registre FERMÉ de laboratoires réutilisables. Jamais du code arbitraire. */
// Vide depuis le 2026-09-25 (voir apps/web/src/features/practice/PracticeLab.jsx).
const SUPPORT_LABS = new Set([]);

const HINT_ORDER = ['look', 'direction', 'strategy'];

/**
 * Mastery V2 — la demande cognitive d'une question (métadonnée d'explication,
 * jamais un poids dans le moteur) et le gabarit d'exercice partagé par ses
 * variantes (templateId). Un exercice généré arrive avec ces champs ; il n'a
 * besoin de rien d'autre pour être « prêt pour la maîtrise ».
 */
const COGNITIVE_DEMANDS = new Set(['recall', 'apply', 'transfer', 'reason']);
const TEMPLATE_ID_PATTERN = /^tpl-[a-z0-9]+(-[a-z0-9]+)*$/;

/* ── Présentation « sujet de brevet » (2026-10-06) ──────────────────────
   Un exercice qui porte `metadata.exam` est rendu comme un sujet du brevet
   (ExamSheet.jsx). Contrat : EXERCISE_CONTRACT.md § « The exam sheet ». La
   provenance (brevet en 3e, contrôle en 6e–4e) et les étiquettes `brevet` /
   `calculator` : scripts/validate-lib.mjs. */
const EXAM_KINDS = new Set(['official', 'excerpt', 'modelled', 'adapted']);
const EXAM_POINTS = /^\d{2}(,\d{1,2})?$/; // « 03 », « 02,5 », « 08 » — la donnée ; affiché « 2,5 points » (examPoints)
const EXAM_STEP = /^0[1-6]$/;

function validateExamPresentation(data, where) {
  const exam = data.metadata?.exam;
  for (const e of examProvenanceErrors(data)) err(where, e);
  if (exam === undefined) return;
  if (!exam || typeof exam !== 'object') { err(where, 'metadata.exam doit être un objet'); return; }
  // La feuille d'examen (ExamSheet) ne dessine PAS `statement.visual` (CoordPlane des cartes classiques) :
  // un repère ou une figure d'énoncé passe par `statement.figure` (GeoFigure), sinon il disparaît.
  if (data.statement?.visual) err(where, 'statement.visual n\'est pas affiché sur une feuille d\'examen — utiliser statement.figure (GeoFigure)');
  if (!EXAM_KINDS.has(exam.kind)) err(where, `metadata.exam.kind « ${exam.kind} » inconnu (attendus : ${[...EXAM_KINDS].join(', ')})`);
  if (typeof exam.heading !== 'string' || !exam.heading.trim()) err(where, 'metadata.exam.heading est obligatoire (« Exercice 1 », « Automatismes »…)');
  if (typeof exam.points !== 'string' || !EXAM_POINTS.test(exam.points)) err(where, `metadata.exam.points s'écrit sur deux chiffres : « 03 », « 02,5 » (reçu ${JSON.stringify(exam.points)})`);

  const formulas = data.statement?.formulas;
  if (formulas !== undefined && (!Array.isArray(formulas) || formulas.some((f) => typeof f !== 'string' || !f.trim()))) {
    err(where, 'statement.formulas est une liste de formules LaTeX non vides');
  }
  const table = data.statement?.table;
  if (table !== undefined) {
    if (!Array.isArray(table?.head) || !Array.isArray(table?.rows)) err(where, 'statement.table = { head: [...], rows: [[...]] }');
    else for (const [i, r] of table.rows.entries()) {
      if (!Array.isArray(r) || r.length !== table.head.length) err(where, `statement.table.rows[${i}] doit avoir ${table.head.length} cellules`);
    }
    // Une grille de tableur (`sheet: true`) : ['', 'A', 'B', …] puis des numéros de ligne consécutifs — « la cellule C3 » doit se lire.
    if (table.sheet && Array.isArray(table.head) && Array.isArray(table.rows)) {
      const letters = table.head.slice(1).every((h, i) => h === String.fromCharCode(65 + i));
      if (table.head[0] !== '' || !letters) err(where, 'statement.table.sheet : head = [\'\', \'A\', \'B\', …]');
      const nums = table.rows.map((r) => Number(r?.[0]));
      if (!nums.every((n, i) => Number.isInteger(n) && n >= 1 && (i === 0 || n === nums[i - 1] + 1))) err(where, 'statement.table.sheet : première colonne = numéros de ligne consécutifs');
    } else if (Array.isArray(table?.head) && table.head[0] === '' && table.head[1] === 'A' && table.head[2] === 'B') {
      err(where, 'statement.table ressemble à une grille de tableur : poser sheet: true (lecture de gauche à droite)');
    }
  }

  let lastStep = '00';
  let lastSub = null;
  for (const q of data.questions ?? []) {
    const qw = `${where} · ${q.id}`;
    if (!EXAM_STEP.test(q.step ?? '')) err(qw, `step « ${q.step} » : une étape de sujet s'écrit 01 … 06`);
    else if (q.step < lastStep) err(qw, `step « ${q.step} » recule après « ${lastStep} »`);
    else {
      if (q.step !== lastStep) lastSub = null;
      lastStep = q.step;
    }
    // Les sous-questions d'une étape : « a) », « b) », « c) »… dans l'ordre (la feuille écrit la parenthèse).
    if (q.sub !== undefined && !EXAM_SUBS.includes(q.sub)) err(qw, `sub « ${q.sub} » : une lettre minuscule ${EXAM_SUBS.join(', ')} (affichée « a) », « b) »…)`);
    else if (q.sub !== undefined) {
      if (lastSub !== null && q.sub < lastSub) err(qw, `sub « ${q.sub} » recule après « ${lastSub} » dans l'étape ${q.step}`);
      lastSub = q.sub;
    }
    if (q.lead !== undefined && (typeof q.lead !== 'string' || !q.lead.trim())) err(qw, 'lead est un texte non vide');
    // Le chrono de l'étape (propriétaire, 2026-10-06) : un temps en secondes, de 30 s à 1 h.
    if (q.timeSeconds !== undefined && !(Number.isInteger(q.timeSeconds) && q.timeSeconds >= 30 && q.timeSeconds <= 3600)) {
      err(qw, `timeSeconds doit être un entier de 30 à 3600 (reçu ${JSON.stringify(q.timeSeconds)})`);
    }
    // « Étapes du calcul » : une zone de brouillon réglée au-dessus du champ (requise ou facultative).
    if (q.work !== undefined && !['required', 'optional'].includes(q.work)) err(qw, `work « ${q.work} » : "required" ou "optional"`);
    if (q.work !== undefined && ['selfCheck', 'choice', 'multiChoice'].includes(q.answerType)) err(qw, 'work n\'a de sens que pour une réponse construite');
    const sol = q.solution;
    if (!sol || !Array.isArray(sol.lines) || sol.lines.length === 0 || sol.lines.some((l) => typeof l !== 'string' || !l.trim())) {
      err(qw, 'solution.lines est obligatoire sur une feuille d\'examen : le corrigé type, ligne par ligne');
    }
    if (sol?.result !== undefined && (typeof sol.result !== 'string' || !sol.result.trim())) err(qw, 'solution.result est une formule LaTeX non vide (encadrée)');
  }
}

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

/**
 * La réponse qu'un élève donnerait s'il recopiait exactement la clé — dans la
 * forme que l'évaluateur reçoit du client (inputs/*.jsx).
 */
function answerFromKey(q) {
  switch (q.answerType) {
    case 'choice': return { choiceId: (q.choices ?? []).find((c) => c.isCorrect)?.id };
    case 'multiChoice': return { choiceIds: (q.choices ?? []).filter((c) => c.isCorrect).map((c) => c.id) };
    case 'rational':
    case 'factorization':
    case 'integerSet': return { value: Array.isArray(q.expectedAnswer) ? q.expectedAnswer.join(', ') : q.expectedAnswer };
    case 'selfCheck': return { selfMark: 'correct' };
    default: return q.expectedAnswer; // affine {a,b}, interval {lo,…}, point {x,y}
  }
}

function checkAnswerKeyRoundTrip(q, qw) {
  if (!SUPPORTED_ANSWER_TYPES.includes(q.answerType)) return;
  let verdict;
  try {
    verdict = evaluateAnswer(answerFromKey(q), q);
  } catch (e) {
    err(qw, `la clé fait lever l'évaluateur : ${e.message}`);
    return;
  }
  if (!isSuccessOutcome(verdict.outcome)) {
    err(qw, `la clé déclarée n'est PAS acceptée par l'évaluateur (issue « ${verdict.outcome} ») — la question serait insoluble`);
  }
  if (q.answerType === 'choice') {
    for (const c of q.choices ?? []) {
      if (c.isCorrect) continue;
      const v = evaluateAnswer({ choiceId: c.id }, q);
      if (isSuccessOutcome(v.outcome)) err(qw, `le distracteur « ${c.id} » est accepté comme juste`);
    }
  }
  // Une signature d'erreur égale à la bonne réponse ne se déclencherait
  // jamais — ou pire, étiquetterait une réponse juste comme une misconception.
  for (const sig of q.misconceptionSignatures ?? []) {
    const probe = q.answerType === 'rational' || q.answerType === 'integerSet' || q.answerType === 'factorization'
      ? { value: Array.isArray(sig.value) ? sig.value.join(', ') : sig.value }
      : sig.value;
    try {
      if (isSuccessOutcome(evaluateAnswer(probe, q).outcome)) {
        err(qw, `la signature « ${sig.id} » (${JSON.stringify(sig.value)}) est une réponse JUSTE`);
      }
    } catch { /* signature illisible : signalée plus bas */ }
  }
}

/* ── Lecture du contenu ──────────────────────────────────────────────── */

function readJson(path) {
  try {
    return { ok: true, data: JSON.parse(readFileSync(path, 'utf-8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function walkExerciseFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkExerciseFiles(full, acc);
    else if (entry.endsWith('.json') && basename(dir).startsWith('level-')) acc.push(full);
  }
  return acc;
}

/* ── Normalisation pour la détection de fuite ────────────────────────── */

/**
 * Réduit un texte à sa substance comparable : sans espaces, sans casse, sans
 * enrobage LaTeX, moins typographique unifié. Attrape « x < 3 » caché dans
 * « x<3 » ou « $x \lt 3$ ».
 */
const flatten = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[−‒–—―]/g, '-')
    .replace(/\\left|\\right|\\,|\\?;|\\!|\\dfrac|\\frac|\\text|[{}$\s]/g, '')
    .replace(/,/g, '.');

/** Les écritures d'une réponse attendue qu'un indice ne doit pas contenir. */
function answerFingerprints(question) {
  const out = new Set();
  const push = (v) => {
    const f = flatten(v);
    // En dessous de 3 caractères, « 4 » ou « -3 » apparaîtrait dans presque
    // tout énoncé : la détection ferait plus de faux positifs que de prises.
    if (f.length >= 3) out.add(f);
  };

  const ea = question.expectedAnswer;
  if (ea === null || ea === undefined) return out;

  if (typeof ea === 'string' || typeof ea === 'number') push(ea);
  // Une décomposition se trahit aussi écrite en LaTeX (« 2^{3} \\times 5 ») ou avec ses exposants (« 2³ × 5 »).
  if (question.answerType === 'factorization') {
    for (const w of [factorizationToLatex(ea), factorizationToPlain(ea)]) if (w) push(w);
  }
  else if (typeof ea === 'object') {
    if ('a' in ea && 'b' in ea) {
      const a = Rational.parse(ea.a);
      const b = Rational.parse(ea.b);
      if (a && b) {
        const bs = b.sign < 0 ? `-${b.abs()}` : `+${b}`;
        push(`${a}x${bs}`);
      }
    }
    if ('x' in ea && 'y' in ea) push(`(${ea.x};${ea.y})`);
  }
  for (const c of question.choices ?? []) if (c.isCorrect) push(c.content);
  return out;
}

/* ── Analyse de la réponse attendue par le VRAI évaluateur ───────────── */

function expectedAnswerParses(question) {
  const ea = question.expectedAnswer;
  switch (question.answerType) {
    case 'choice':
    case 'multiChoice':
      return true; // porté par les choix, vérifié séparément
    case 'rational':
      return Rational.parse(ea) !== null;
    case 'affine':
      return parseAffineAnswer(ea) !== null;
    case 'interval':
      return parseInterval(ea) !== null;
    case 'point':
      return !!(ea && Rational.parse(ea.x) && Rational.parse(ea.y));
    case 'integerSet':
      return parseIntegerSet(ea) !== null;
    case 'factorization':
      return factorizationKeyProblem(ea) === null;
    case 'selfCheck':
      return true; // pas de clé : l'élève se note après le corrigé type
    default:
      return false;
  }
}

function signatureParses(answerType, value) {
  switch (answerType) {
    case 'choice':
    case 'multiChoice': return true;
    case 'rational': return Rational.parse(value) !== null;
    case 'affine': return parseAffineAnswer(value) !== null;
    case 'interval': return parseInterval(value) !== null;
    case 'point': return !!(value && Rational.parse(value.x) && Rational.parse(value.y));
    case 'integerSet': return parseIntegerSet(value) !== null;
    case 'factorization': return parseFactorization(value) !== null;
    default: return false;
  }
}

/* ── Taille rendue d'une figure ──────────────────────────────────────── */

/** CoordPlane multiplie l'amplitude par les pixels-par-unité : ses défauts. */
const DEFAULT_UNIT = 34;
/** Au-delà, la figure pousse la question sous la ligne de flottaison. */
const MAX_PLOT_PX = 460;

/**
 * CoordPlane dimensionne son SVG en PIXELS PAR UNITÉ, pas en pixels totaux :
 * `height = (yMax − yMin) × unitY`. Une amplitude de 1800 avec l'unitY par
 * défaut donne donc un tracé de plus de 61 000 px de haut — c'est arrivé, et
 * seule l'ouverture de la page l'a montré.
 *
 * La convention maison (Module01Recette, Module06LaboSciences…) est de
 * calculer `unitY` pour viser ~200 px. Ce contrôle ne l'impose pas ; il
 * refuse seulement les figures qui déborderaient.
 */
function checkVisualSize(visual, where) {
  const range = visual?.range;
  if (!range) return;

  const unit = visual.unit ?? DEFAULT_UNIT;
  const unitY = visual.unitY ?? unit;
  const height = (range.yMax - range.yMin) * unitY;
  const width = (range.xMax - range.xMin) * unit;

  if (height > MAX_PLOT_PX) {
    err(where, `figure haute de ${Math.round(height)} px (max ${MAX_PLOT_PX}) — `
      + `l'amplitude en y est ${range.yMax - range.yMin} et unitY vaut ${unitY}. `
      + `Posez unitY: ${(200 / (range.yMax - range.yMin)).toFixed(4)} pour viser 200 px.`);
  }
  if (width > MAX_PLOT_PX) {
    err(where, `figure large de ${Math.round(width)} px (max ${MAX_PLOT_PX}) — `
      + `posez unit: ${(320 / (range.xMax - range.xMin)).toFixed(2)}.`);
  }
}

/* ── Validation d'un exercice ────────────────────────────────────────── */

function validateExercise(file, data, ctx) {
  const rel = relative(repoRoot, file);
  const where = rel;

  for (const field of ['id', 'lessonCode', 'level', 'metadata', 'statement', 'questions']) {
    if (data[field] === undefined) err(where, `champ obligatoire manquant : ${field}`);
  }
  if (!data.id || !data.questions) return;

  /* Identité */
  if (!/^ex-[a-z0-9]+(-[a-z0-9]+)*-l[1-5]-[0-9]{3}$/.test(data.id)) {
    err(where, `id « ${data.id} » ne suit pas le motif ex-<slug>-l<niveau>-<nnn>`);
  }
  if (ctx.seenIds.has(data.id)) err(where, `id « ${data.id} » déjà utilisé par ${ctx.seenIds.get(data.id)}`);
  else ctx.seenIds.set(data.id, rel);

  const idLevel = Number(data.id.match(/-l([1-5])-/)?.[1]);
  if (idLevel && idLevel !== data.level) err(where, `l'id annonce le niveau ${idLevel} mais level vaut ${data.level}`);

  const dirLevel = Number(basename(join(file, '..')).replace('level-', ''));
  if (dirLevel !== data.level) err(where, `le fichier est dans level-${dirLevel} mais level vaut ${data.level}`);

  if (!LEVELS.includes(data.level)) err(where, `level doit valoir 1 à 5 (reçu ${JSON.stringify(data.level)})`);

  /* Leçon */
  const lessonEntry = [...ctx.lessonIndex.entries()].find(([key]) => key.endsWith(`:${data.lessonCode}`));
  if (!lessonEntry) {
    err(where, `lessonCode « ${data.lessonCode} » est inconnu du catalogue`);
    return;
  }
  const [lessonKey, lesson] = lessonEntry;
  const gradeSegment = relative(CONTENT_ROOT, file).split('/')[0]; // <racine>/<grade>/…
  if (!lessonKey.startsWith(`${gradeSegment}:`)) {
    err(where, `le dossier annonce le niveau « ${gradeSegment} » mais la leçon appartient à « ${lessonKey.split(':')[0]} »`);
  }

  /* Les deux étiquettes du brevet (conseil du propriétaire, plan §7bis) : obligatoires en 3e. */
  for (const e of brevetTagErrors(data, gradeSegment)) err(where, e);

  /* Typographie française et écriture mathématique de tout texte lu (FRENCH_LANGUAGE_CONTRACT.md §4, §5, §7). */
  for (const e of exerciseTypographyErrors(data)) err(where, `${e.path} : typographie « ${e.kind} » (« ${e.at} »)`);

  /* Mastery V2 — gabarit et provenance (exercices générés, §20 du plan) */
  if (data.templateId !== undefined) {
    if (typeof data.templateId !== 'string' || !TEMPLATE_ID_PATTERN.test(data.templateId)) {
      err(rel, `templateId « ${data.templateId} » doit suivre tpl-<mots-en-kebab>`);
    } else {
      // Les variantes d'un gabarit testent la MÊME compétence de la même
      // façon : même learning point principal, même answerType. Sinon ce
      // n'est pas une variante, c'est un autre exercice.
      const primary = (data.questions ?? []).map((q) => (q.learningPoints ?? []).find((lp) => lp.role === 'primary')?.code ?? null);
      const types = (data.questions ?? []).map((q) => q.answerType ?? null);
      const signature = JSON.stringify({ lesson: data.lessonCode, primary, types });
      const seen = ctx.templates.get(data.templateId);
      if (seen && seen.signature !== signature) {
        err(rel, `templateId « ${data.templateId} » : les variantes doivent partager learning point principal et answerType par question (voir ${seen.rel})`);
      } else if (!seen) {
        ctx.templates.set(data.templateId, { rel, signature });
      }
    }
  }
  if (data.variantOf !== undefined && (typeof data.variantOf !== 'string' || !/^ex-[a-z0-9]+(-[a-z0-9]+)*-l[1-5]-[0-9]{3}$/.test(data.variantOf))) {
    err(rel, `variantOf doit être l'identifiant d'un exercice existant (reçu ${JSON.stringify(data.variantOf)})`);
  }
  if (data.generator !== undefined && (typeof data.generator !== 'object' || data.generator === null || typeof data.generator.tool !== 'string')) {
    err(rel, 'generator doit être un objet { tool, version?, seed? } — la provenance d\'un exercice généré');
  }

  /* Questions */
  const seenQuestionIds = new Set();
  for (const q of data.questions) {
    const qw = `${rel} · ${q.id ?? '(sans id)'}`;
    if (!q.id) { err(qw, 'question sans id'); continue; }
    if (seenQuestionIds.has(q.id)) err(qw, `id de question dupliqué dans l'exercice`);
    seenQuestionIds.add(q.id);

    /* Learning Points */
    const lps = q.learningPoints ?? [];
    if (lps.length === 0) err(qw, 'aucun learning point — toute question évaluative doit en porter un (invariant 6)');
    const primaries = lps.filter((lp) => lp.role === 'primary');
    if (primaries.length !== 1) {
      err(qw, `il faut exactement un learning point « primary » (reçu ${primaries.length})`);
    }
    for (const lp of lps) {
      if (!lesson.learningPointIds.has(lp.code)) {
        err(qw, `le learning point « ${lp.code} » n'appartient pas à la leçon « ${data.lessonCode} »`);
      } else if (lp.role === 'primary') {
        ctx.primaryCoverage.get(lessonKey)?.add(lp.code);
      }
    }

    if (q.counted !== undefined && typeof q.counted !== 'boolean') err(qw, 'counted est un booléen (false = jugée mais hors maîtrise)');

    /* Mastery V2 — métadonnées du registre d'items (facultatives, typées) */
    if (q.difficulty !== undefined && !(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 5)) {
      err(qw, `difficulty doit être un entier de 1 à 5 (reçu ${JSON.stringify(q.difficulty)})`);
    }
    if (q.cognitiveDemand !== undefined && !COGNITIVE_DEMANDS.has(q.cognitiveDemand)) {
      err(qw, `cognitiveDemand « ${q.cognitiveDemand} » inconnu (attendus : ${[...COGNITIVE_DEMANDS].join(', ')})`);
    }

    /* Type de réponse */
    if (!SUPPORTED_ANSWER_TYPES.includes(q.answerType)) {
      err(qw, `answerType « ${q.answerType } » n'est pas géré par answerEvaluator.js (attendus : ${SUPPORTED_ANSWER_TYPES.join(', ')})`);
      continue;
    }

    /* QCM */
    if (q.answerType === 'choice' || q.answerType === 'multiChoice') {
      const choices = q.choices ?? [];
      if (choices.length < 2) err(qw, 'un QCM a besoin d\'au moins deux choix');
      const ids = new Set();
      for (const c of choices) {
        if (ids.has(c.id)) err(qw, `choix « ${c.id} » dupliqué`);
        ids.add(c.id);
        if (c.misconceptionId && !ctx.misconceptions.has(c.misconceptionId)) {
          err(qw, `misconceptionId « ${c.misconceptionId} » absent de misconceptions.json`);
        }
        if (c.isCorrect && c.misconceptionId) err(qw, `le choix juste « ${c.id} » ne peut pas porter une misconception`);
      }
      const correct = choices.filter((c) => c.isCorrect);
      if (q.answerType === 'choice' && correct.length !== 1) {
        err(qw, `un QCM à réponse unique doit déclarer exactement une bonne réponse (reçu ${correct.length})`);
      }
      if (q.answerType === 'multiChoice' && correct.length < 1) {
        err(qw, 'un QCM à réponses multiples doit déclarer au moins une bonne réponse');
      }
      const wrongWithout = choices.filter((c) => !c.isCorrect && !c.misconceptionId);
      if (wrongWithout.length) {
        warn(qw, `distracteurs sans misconception : ${wrongWithout.map((c) => c.id).join(', ')} — la cible §25 les veut porteurs de sens`);
      }
    } else if (q.answerType === 'selfCheck') {
      /* Auto-évaluation : pas de clé, un corrigé type obligatoire */
      if (q.expectedAnswer !== undefined) err(qw, 'une question selfCheck n\'a pas d\'expectedAnswer : l\'élève se note sur le corrigé type');
      if (!Array.isArray(q.solution?.lines) || q.solution.lines.length === 0) err(qw, 'une question selfCheck exige solution.lines (le corrigé type)');
      if (q.counted === true) err(qw, 'une question selfCheck ne compte jamais pour la maîtrise : retirer counted: true');
    } else {
      /* Réponse construite */
      if (q.expectedAnswer === undefined || q.expectedAnswer === null) {
        err(qw, 'expectedAnswer est obligatoire pour une réponse construite');
      } else if (q.answerType === 'factorization' && factorizationKeyProblem(q.expectedAnswer)) {
        // La clé d'une décomposition est CANONIQUE (bases premières croissantes, exposant 1 omis : « 2^3*3^2*5 »).
        err(qw, `expectedAnswer ${JSON.stringify(q.expectedAnswer)} n'est pas une décomposition canonique : ${factorizationKeyProblem(q.expectedAnswer)}`);
      } else if (!expectedAnswerParses(q)) {
        err(qw, `expectedAnswer ${JSON.stringify(q.expectedAnswer)} est ILLISIBLE par l'évaluateur — la question serait insoluble en production`);
      }
      // `requiredForm: 'powers'` : chaque premier une fois avec son exposant — un mode de la décomposition seulement,
      // et sa réponse partielle (`powersExpected`) a besoin de SON message, sinon l'élève lirait celui d'une erreur.
      if (q.evaluationPolicy?.requiredForm === 'powers') {
        if (q.answerType !== 'factorization') err(qw, 'requiredForm « powers » ne vaut que pour answerType « factorization »');
        else if (!q.feedback?.powersExpected) err(qw, 'requiredForm « powers » exige feedback.powersExpected (la réponse juste mais sans puissances)');
      }
      if (!q.answerFormat || !String(q.answerFormat).trim()) {
        err(qw, 'answerFormat est obligatoire : l\'élève doit savoir COMMENT saisir (invariant 7)');
      }
    }

    /* Aller-retour de la clé (intégrité du contenu, 2026-09-24).
       La clé déclarée doit être ACCEPTÉE par l'évaluateur réel, et toute
       autre option refusée. C'est ce qui garantit qu'une question n'est
       jamais insoluble — « aucun choix n'est accepté » — et qu'aucune
       mauvaise réponse n'est comptée juste par construction. */
    checkAnswerKeyRoundTrip(q, qw);

    /* Signatures de misconception */
    for (const sig of q.misconceptionSignatures ?? []) {
      if (!ctx.misconceptions.has(sig.id)) err(qw, `misconceptionId « ${sig.id} » absent de misconceptions.json`);
      if (!signatureParses(q.answerType, sig.value)) {
        err(qw, `la signature ${JSON.stringify(sig.value)} est illisible : elle ne pourra jamais se déclencher`);
      }
    }

    /* Indices */
    const hints = q.hints ?? [];
    if (hints.length > 3) err(qw, `au plus 3 indices (reçu ${hints.length})`);
    hints.forEach((h, i) => {
      if (h.type !== HINT_ORDER[i]) {
        err(qw, `l'indice ${i + 1} est de type « ${h.type} » ; l'ordre attendu est ${HINT_ORDER.join(' → ')}`);
      }
    });

    /* Fuite de réponse — invariants 8 et 10 */
    const prints = answerFingerprints(q);
    const leakIn = (text, label) => {
      const flat = flatten(text);
      for (const p of prints) {
        if (flat.includes(p)) err(qw, `${label} divulgue la réponse (« ${p} ») — indices et formats guident, ils ne révèlent pas`);
      }
    };
    hints.forEach((h, i) => leakIn(h.content, `l'indice ${i + 1}`));
    if (q.answerFormat) leakIn(q.answerFormat, 'answerFormat');
    if (q.feedback?.incorrect) leakIn(q.feedback.incorrect, 'le retour « incorrect »');

    /* Visuel et laboratoire */
    for (const key of Object.keys(q.visual ?? {})) {
      if (!COORDPLANE_PROPS.has(key)) err(qw, `visual.${key} n'est pas une prop de CoordPlane`);
    }
    checkVisualSize(q.visual, qw);
    if (q.support && !SUPPORT_LABS.has(q.support.lab)) {
      err(qw, `support.lab « ${q.support.lab} » hors du registre fermé (${[...SUPPORT_LABS].join(', ')})`);
    }

    /* Retours */
    if (!q.feedback?.correct || !q.feedback?.incorrect) {
      err(qw, 'feedback.correct et feedback.incorrect sont obligatoires');
    }
  }

  for (const key of Object.keys(data.statement?.visual ?? {})) {
    if (!COORDPLANE_PROPS.has(key)) err(where, `statement.visual.${key} n'est pas une prop de CoordPlane`);
  }
  checkVisualSize(data.statement?.visual, where);
  if (data.statement?.figure !== undefined) {
    for (const e of validateStatementFigure(data.statement.figure)) err(where, `statement.figure : ${e}`);
    // Une feuille d'EXAMEN (2026-10-08, avant la géométrie : unités 9–13) : la figure plane doit être LISIBLE —
    // pas de bande étroite, pas d'étiquette sur une autre (« figures du manuel : analyser puis redessiner »).
    const fig = data.statement.figure;
    if (data.metadata?.exam && fig && !fig.kind && validateStatementFigure(fig).length === 0) {
      for (const e of figureQuality(fig)) err(where, `statement.figure illisible : ${e} — redessiner (même concept, réponses recalculées)`);
    }
  }
  validateExamPresentation(data, where);
  if (data.statement?.support && !SUPPORT_LABS.has(data.statement.support.lab)) {
    err(where, `statement.support.lab « ${data.statement.support.lab} » hors du registre fermé`);
  }
}

/* ── Programme principal ─────────────────────────────────────────────── */

function main() {
  if (!existsSync(CONTENT_ROOT)) {
    console.log('validate-exercises: aucun contenu de pratique — rien à valider.');
    return 0;
  }

  const misconceptionsRead = readJson(join(CONTENT_ROOT, 'misconceptions.json'));
  if (!misconceptionsRead.ok) {
    console.error(`content/practice/misconceptions.json illisible : ${misconceptionsRead.error}`);
    return 1;
  }
  const misconceptions = new Set(Object.keys(misconceptionsRead.data).filter((k) => !k.startsWith('_')));

  const activeRead = readJson(join(CONTENT_ROOT, 'active.json'));
  const active = activeRead.ok && Array.isArray(activeRead.data) ? activeRead.data : [];

  const lessonIndex = buildLessonIndex();

  // Les misconceptions citent des codes de LP : ils doivent exister eux aussi.
  const allLpCodes = new Set();
  for (const entry of lessonIndex.values()) for (const id of entry.learningPointIds) allLpCodes.add(id);
  for (const [id, m] of Object.entries(misconceptionsRead.data)) {
    if (id.startsWith('_')) continue;
    for (const code of m.relatedLearningPoints ?? []) {
      if (!allLpCodes.has(code)) err('misconceptions.json', `« ${id} » cite le learning point inconnu « ${code} »`);
    }
  }

  const primaryCoverage = new Map();
  for (const lessonCode of active) {
    const entry = [...lessonIndex.entries()].find(([key]) => key.endsWith(`:${lessonCode}`));
    if (!entry) err('active.json', `leçon activée « ${lessonCode} » inconnue du catalogue`);
    else primaryCoverage.set(entry[0], new Set());
  }

  const ctx = { seenIds: new Map(), lessonIndex, misconceptions, primaryCoverage, templates: new Map() };
  const files = walkExerciseFiles(CONTENT_ROOT);
  const byLessonLevel = new Map();
  const examCount = new Map();

  for (const file of files) {
    const read = readJson(file);
    if (!read.ok) { err(relative(repoRoot, file), `JSON illisible : ${read.error}`); continue; }
    validateExercise(file, read.data, ctx);
    const key = read.data.lessonCode;
    if (!byLessonLevel.has(key)) byLessonLevel.set(key, new Map());
    const levels = byLessonLevel.get(key);
    if (!levels.has(read.data.level)) levels.set(read.data.level, []);
    levels.get(read.data.level).push(read.data.id);
    if (read.data.metadata?.exam) examCount.set(key, (examCount.get(key) ?? 0) + 1);
  }

  /* Minimum de contenu et couverture — mode strict seulement, pour que le tout
     premier exercice écrit ne fasse pas rougir la CI. */
  const policy = readPolicy();
  for (const [lessonCode, rule] of Object.entries(policy.lessons)) {
    if (!active.includes(lessonCode)) warn('policy.json', `« ${lessonCode} » a une politique mais n'est pas activée`);
    if (!Number.isInteger(rule.minPerLevel) || rule.minPerLevel < 1) err('policy.json', `« ${lessonCode} » : minPerLevel doit être un entier ≥ 1`);
    if (typeof rule.source !== 'string' || !rule.source) err('policy.json', `« ${lessonCode} » : une politique dérogatoire nomme sa source (manuel, pages)`);
  }
  for (const lessonCode of active) {
    const levels = byLessonLevel.get(lessonCode) ?? new Map();
    const minPerLevel = policy.lessons[lessonCode]?.minPerLevel ?? policy.defaultMinPerLevel;
    for (const level of LEVELS) {
      const n = (levels.get(level) ?? []).length;
      if (n < minPerLevel) {
        const msg = `leçon « ${lessonCode} » : niveau ${level} n'a que ${n} exercice(s), il en faut ${minPerLevel} (invariant 12${policy.lessons[lessonCode] ? ', politique dérogatoire' : ''})`;
        STRICT ? err('couverture', msg) : warn('couverture', msg);
      }
    }
    const entry = [...lessonIndex.entries()].find(([key]) => key.endsWith(`:${lessonCode}`));
    if (entry) {
      const covered = primaryCoverage.get(entry[0]) ?? new Set();
      const missing = [...entry[1].learningPointIds].filter((c) => !covered.has(c));
      if (missing.length) {
        const msg = `leçon « ${lessonCode} » : learning points sans exercice « primary » — ${missing.join(', ')}`;
        STRICT ? err('couverture', msg) : warn('couverture', msg);
      }
    }
  }

  /* Feuille d'examen (sujet de brevet) (content/practice/exam-style.json) : la bascule d'une
     leçon vers la page des niveaux « examen ». Une leçon listée est activée et
     TOUS ses exercices portent `metadata.exam` (sinon la page des niveaux
     examen ouvrirait un exercice classique) ; en strict, 10 par niveau, la
     norme du déploiement. Une leçon non listée dont la banque est déjà
     convertie (en partie ou en totalité) n'est qu'avertie : elle garde la page
     classique jusqu'à sa bascule. */
  const examRead = existsSync(join(CONTENT_ROOT, 'exam-style.json')) ? readJson(join(CONTENT_ROOT, 'exam-style.json')) : { ok: true, data: [] };
  const examStyle = examRead.ok && Array.isArray(examRead.data) ? examRead.data : null;
  if (examStyle === null) err('exam-style.json', 'doit être un tableau de codes de leçon');
  for (const lessonCode of examStyle ?? []) {
    if (typeof lessonCode !== 'string') { err('exam-style.json', `entrée invalide ${JSON.stringify(lessonCode)}`); continue; }
    if (!active.includes(lessonCode)) err('exam-style.json', `« ${lessonCode} » est au format examen mais sa pratique n'est pas activée (active.json)`);
    const levels = byLessonLevel.get(lessonCode) ?? new Map();
    const total = [...levels.values()].reduce((n, ids) => n + ids.length, 0);
    const exam = examCount.get(lessonCode) ?? 0;
    if (exam !== total) err('exam-style.json', `« ${lessonCode} » : ${total - exam} exercice(s) sur ${total} sans metadata.exam — convertir toute la banque avant la bascule`);
    for (const level of LEVELS) {
      const n = (levels.get(level) ?? []).length;
      if (STRICT && n < EXAM_PER_LEVEL) err('exam-style.json', `« ${lessonCode} » : niveau ${level} n'a que ${n} feuille(s), il en faut ${EXAM_PER_LEVEL}`);
    }
  }
  for (const [lessonCode, n] of examCount) {
    if (!(examStyle ?? []).includes(lessonCode)) {
      const total = [...(byLessonLevel.get(lessonCode) ?? new Map()).values()].reduce((m, ids) => m + ids.length, 0);
      warn('exam-style.json', `« ${lessonCode} » : ${n}/${total} exercice(s) au format examen, leçon pas encore basculée (page classique)`);
    }
  }

  /* Index généré */
  const index = {};
  for (const [lessonCode, levels] of byLessonLevel) {
    index[lessonCode] = {};
    for (const level of [...levels.keys()].sort()) index[lessonCode][level] = levels.get(level).sort();
  }
  const serialized = `${JSON.stringify(index, null, 2)}\n`;
  if (STRICT) {
    const current = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : '';
    if (current !== serialized) err('index.generated.json', 'périmé — relance `npm run validate:exercises` pour le régénérer');
  } else {
    writeFileSync(INDEX_PATH, serialized);
  }

  if (AS_JSON) {
    console.log(JSON.stringify({ files: files.length, errors, warnings }, null, 2));
  } else {
    console.log(`validate-exercises: ${files.length} exercice(s) lu(s)${STRICT ? ' [strict]' : ''}`);
    if (warnings.length) {
      console.warn(`\n${warnings.length} avertissement(s) :`);
      for (const w of warnings) console.warn(`  - ${w}`);
    }
    if (errors.length) {
      console.error(`\n${errors.length} erreur(s) :`);
      for (const e of errors) console.error(`  - ${e}`);
    } else {
      console.log('Validation passed');
    }
  }
  return errors.length ? 1 : 0;
}

process.exit(main());
