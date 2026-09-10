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
 * --strict : exige 3 exercices × 5 niveaux pour chaque leçon activée, et
 *            refuse un index généré périmé. Utilisé par check:lessons.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { buildLessonIndex, repoRoot } from './lib/lessonAst.mjs';
import { Rational } from '../packages/core/practice/rational.js';
import { parseAffineAnswer } from '../packages/core/practice/affineCanonical.js';
import { parseInterval } from '../packages/core/practice/intervalCompare.js';
import { SUPPORTED_ANSWER_TYPES } from '../packages/core/practice/answerEvaluator.js';

const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const AS_JSON = argv.includes('--json');

const CONTENT_ROOT = join(repoRoot, 'content/practice');
const INDEX_PATH = join(CONTENT_ROOT, 'index.generated.json');
const LEVELS = [1, 2, 3, 4, 5];
const MIN_PER_LEVEL = 3;

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
const SUPPORT_LABS = new Set(['TankLab', 'RateProbes']);

const HINT_ORDER = ['look', 'direction', 'strategy'];

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

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
    .replace(/\\left|\\right|\\,|\;|\\!|\\dfrac|\\frac|\\text|[{}$\s]/g, '')
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
  const gradeSegment = rel.split('/')[2]; // content/practice/<grade>/…
  if (!lessonKey.startsWith(`${gradeSegment}:`)) {
    err(where, `le dossier annonce le niveau « ${gradeSegment} » mais la leçon appartient à « ${lessonKey.split(':')[0]} »`);
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
    } else {
      /* Réponse construite */
      if (q.expectedAnswer === undefined || q.expectedAnswer === null) {
        err(qw, 'expectedAnswer est obligatoire pour une réponse construite');
      } else if (!expectedAnswerParses(q)) {
        err(qw, `expectedAnswer ${JSON.stringify(q.expectedAnswer)} est ILLISIBLE par l'évaluateur — la question serait insoluble en production`);
      }
      if (!q.answerFormat || !String(q.answerFormat).trim()) {
        err(qw, 'answerFormat est obligatoire : l\'élève doit savoir COMMENT saisir (invariant 7)');
      }
    }

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

  const ctx = { seenIds: new Map(), lessonIndex, misconceptions, primaryCoverage };
  const files = walkExerciseFiles(CONTENT_ROOT);
  const byLessonLevel = new Map();

  for (const file of files) {
    const read = readJson(file);
    if (!read.ok) { err(relative(repoRoot, file), `JSON illisible : ${read.error}`); continue; }
    validateExercise(file, read.data, ctx);
    const key = read.data.lessonCode;
    if (!byLessonLevel.has(key)) byLessonLevel.set(key, new Map());
    const levels = byLessonLevel.get(key);
    if (!levels.has(read.data.level)) levels.set(read.data.level, []);
    levels.get(read.data.level).push(read.data.id);
  }

  /* Minimum de contenu et couverture — mode strict seulement, pour que le tout
     premier exercice écrit ne fasse pas rougir la CI. */
  for (const lessonCode of active) {
    const levels = byLessonLevel.get(lessonCode) ?? new Map();
    for (const level of LEVELS) {
      const n = (levels.get(level) ?? []).length;
      if (n < MIN_PER_LEVEL) {
        const msg = `leçon « ${lessonCode} » : niveau ${level} n'a que ${n} exercice(s), il en faut ${MIN_PER_LEVEL} (invariant 12)`;
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
