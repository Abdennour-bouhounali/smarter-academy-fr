#!/usr/bin/env node
/**
 * check-textbook-coverage — la TRAÇABILITÉ manuel → plateforme.
 *
 * Pour chaque unité qui déclare une extraction canonique du manuel
 * (docs/sources/<classe>/<unité>/extraction.json), vérifie que :
 *
 *   1. chaque élément extrait (activité, savoir, méthode, exercice, QCM,
 *      situation…) a EXACTEMENT UNE destination déclarée dans l'extraction,
 *      et qu'un contenu de cette leçon le cite bien (`src('<id>', …)` ou
 *      `sourceElementIds`) — un élément du manuel sans destination est une
 *      partie du livre qu'on a cessé d'enseigner sans le décider ;
 *   2. un élément n'est cité par AUCUNE autre leçon que sa destination, sauf
 *      (a) une seconde utilisation déclarée `duplicatedIn`, (a') une COPIE ADAPTÉE
 *      d'un exercice de pratique d'une autre leçon, déclarée dans l'exercice même
 *      (`adaptedFrom` = l'id de l'original : la citation compte pour la leçon
 *      d'origine — feuilles BEM, 2026-10-06), (b) une reprise
 *      dans le module d'ÉVALUATION ou le contenu de PRATIQUE de la MÊME leçon
 *      (les épreuves reprennent les exercices du درس), (c) un élément déclaré
 *      pour l'unité (page d'unité) — tout le reste est une duplication non
 *      déclarée, donc une dérive ;
 *   3. tout `src('<id>')` cité par un contenu existe dans l'extraction : on ne
 *      cite pas le manuel de mémoire ;
 *   4. tout `type: 'platform_addition'` reste visible comme tel (compteur) ;
 *   5. une destination vers une leçon encore `coming_soon` du catalogue (1AM–3AM, générées leçon par leçon depuis
 *      la phase 3 du cycle moyen, 2026-10-14) est EN ATTENTE : elle n'a pas encore à être citée (comptée à part),
 *      elle doit nommer une vraie leçon du catalogue, et aucune autre leçon ne peut citer l'élément. Le jour où la
 *      leçon est générée et publiée (`available`), la règle 1 s'applique à nouveau.
 *
 *   node scripts/check-textbook-coverage.mjs [--json]
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repoRoot } from './lib/lessonAst.mjs';

const SOURCES = join(repoRoot, 'docs/sources');

/**
 * Une COPIE ADAPTÉE déclarée (feuilles BEM, 2026-10-06) : un exercice de pratique d'une
 * leçon qui reprend l'exercice d'une AUTRE leçon et le dit (`adaptedFrom` : l'id de
 * l'original). Sa citation compte pour la leçon d'origine — la duplication est déclarée
 * dans l'exercice même, pas une dérive. Rend le code de cette leçon, ou null.
 */
function adaptedOriginLesson(data) {
  const from = data.metadata?.source?.adaptedFrom ?? data.metadata?.adaptedFrom;
  const m = typeof from === 'string' ? /^ex-[a-z0-9]+-(.+)-l\d-\d{3}$/.exec(from) : null;
  return m && m[1] !== data.lessonCode ? m[1] : null;
}
const problems = [];
const report = [];

/** Les leçons du catalogue, toutes années : code → statut (`available` / `coming_soon`). */
const CATALOGUE_STATUS = new Map();
for (const f of readdirSync(join(repoRoot, 'packages/core/curriculum/dz')).filter((n) => /^lessons_\d?[a-z]*_2026_2027\.json$/.test(n))) {
  for (const l of JSON.parse(readFileSync(join(repoRoot, 'packages/core/curriculum/dz', f), 'utf8')).lessons ?? []) CATALOGUE_STATUS.set(l.code, l.status);
}
/** Une destination EN ATTENTE : une leçon du catalogue pas encore générée. */
const isPending = (lesson) => CATALOGUE_STATUS.get(lesson) === 'coming_soon';

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Toute valeur `source.elementId` / `sourceElementId` trouvée en profondeur dans une donnée. */
function collectFromData(value, out = new Set()) {
  if (Array.isArray(value)) { for (const v of value) collectFromData(v, out); return out; }
  if (value && typeof value === 'object') {
    if (typeof value.elementId === 'string' && value.type === 'textbook') out.add(value.elementId);
    if (typeof value.sourceElementId === 'string') out.add(value.sourceElementId);
    for (const v of Object.values(value)) collectFromData(v, out);
  }
  return out;
}

/**
 * Les fichiers content/*.js d'une leçon sont des modules ES PURS (aucun JSX) :
 * on les importe et on lit les `source` résolus — la seule lecture fidèle,
 * puisqu'un fichier de contenu construit ses sources via des aides (`S(17)`)
 * qu'une expression régulière ne verrait pas.
 */
async function citedByContentModule(file) {
  try {
    const mod = await import(pathToFileURL(file).href);
    return collectFromData(Object.values(mod));
  } catch (e) {
    problems.push(`${relative(repoRoot, file)} : import impossible — ${e.message}`);
    return new Set();
  }
}

/** Les ids d'éléments cités par un fichier JSX/JSON : src('id', …), sourceElementIds: ['a','b'], "elementId": "id". */
function citedIds(text) {
  const ids = new Set();
  for (const m of text.matchAll(/\bsrc\(\s*'([a-z0-9-]+)'/g)) ids.add(m[1]);
  for (const m of text.matchAll(/sourceElementIds:\s*\[([^\]]*)\]/g)) for (const s of m[1].matchAll(/'([a-z0-9-]+)'/g)) ids.add(s[1]);
  for (const m of text.matchAll(/"sourceElementId":\s*"([a-z0-9-]+)"/g)) ids.add(m[1]);
  for (const m of text.matchAll(/"elementId":\s*"([a-z0-9-]+)"/g)) ids.add(m[1]);
  return ids;
}

for (const gradeDir of existsSync(SOURCES) ? readdirSync(SOURCES) : []) {
  for (const unitDir of readdirSync(join(SOURCES, gradeDir))) {
    const file = join(SOURCES, gradeDir, unitDir, 'extraction.json');
    if (!existsSync(file)) continue;
    const extraction = JSON.parse(readFileSync(file, 'utf8'));
    const unitCode = extraction.unitCode ?? readUnitCode(gradeDir, unitDir);
    const elements = new Map(extraction.elements.map((e) => [e.id, e]));
    let pending = 0;
    const destinations = extraction.destinations ?? {};

    // Où vit le contenu : le dossier de l'unité côté web, la pratique, les unités du catalogue.
    const unitLessonsDir = findUnitDir(unitCode);
    const practiceDir = join(repoRoot, 'content/practice', gradeDir);
    const unitsJson = join(repoRoot, `packages/core/curriculum/dz/units_${gradeDir}_2026_2027.json`);

    // Citations par leçon : { lessonCode: { all: Set, evaluation: Set, practice: Set } }
    const byLesson = new Map();
    const cite = (lesson, id, bucket) => {
      if (!byLesson.has(lesson)) byLesson.set(lesson, { all: new Set(), evaluation: new Set(), practice: new Set(), other: new Set() });
      const b = byLesson.get(lesson);
      b.all.add(id); b[bucket].add(id);
    };
    if (unitLessonsDir) {
      for (const f of walk(unitLessonsDir)) {
        const rel = relative(unitLessonsDir, f).split('/');
        const lesson = rel[0].startsWith('_') ? 'unit' : rel[0];
        const isEvaluation = /modules\/Module\d+.*(Itqan|Boss|Ahill)/.test(f);
        const isContentData = rel[1] === 'content' && f.endsWith('.js') && !f.endsWith('.test.js'); // un test (vitest) n'est pas une donnée
        const ids = isContentData ? await citedByContentModule(f) : citedIds(readFileSync(f, 'utf8'));
        for (const id of ids) cite(lesson, id, isEvaluation ? 'evaluation' : 'other');
      }
    }
    // Les leçons de CETTE unité : la pratique d'une autre unité cite les ids
    // de SON extraction (act-3, ex-11… existent dans les deux manuels).
    const unitLessonCodes = new Set(unitLessonsDir ? readdirSync(unitLessonsDir).filter((d) => !d.startsWith('_')) : []);
    for (const f of walk(practiceDir)) {
      if (!f.endsWith('.json')) continue;
      const data = JSON.parse(readFileSync(f, 'utf8'));
      if (!unitLessonCodes.has(data.lessonCode)) continue;
      // Une fiche d'exercices (worksheet) n'est PAS le manuel : ses éléments
      // sont vérifiés à part, contre docs/sources/…/worksheet-<id>.json.
      if (data.metadata?.source?.type === 'worksheet') continue;
      const owner = adaptedOriginLesson(data) ?? data.lessonCode ?? 'unknown';
      for (const id of citedIds(readFileSync(f, 'utf8'))) cite(owner, id, 'practice');
    }
    if (existsSync(unitsJson)) {
      const units = JSON.parse(readFileSync(unitsJson, 'utf8')).units.filter((u) => u.code === unitCode);
      for (const u of units) {
        for (const id of citedIds(JSON.stringify(u))) cite('unit', id, 'other');
        if (u.objectivesAr?.length) cite('unit', 'objectives', 'other');
      }
    }

    // 1 + 2 — chaque élément : une destination, citée là, et nulle part ailleurs (hors exceptions).
    for (const [id, el] of elements) {
      const dest = destinations[id];
      if (!dest) { problems.push(`${unitCode}: l'élément « ${id} » (p. ${el.page}) n'a AUCUNE destination déclarée`); continue; }
      // Un élément du manuel déclaré NON INTÉGRÉ par décision du propriétaire (`notIntegrated` = la raison) :
      // aucun contenu ne doit le citer — il est sorti du parcours en le disant, pas par oubli.
      if (dest.notIntegrated) {
        const users = [...byLesson.entries()].filter(([, b]) => b.all.has(id)).map(([l]) => l);
        if (users.length) problems.push(`${unitCode}: « ${id} » est déclaré non intégré mais cité par ${users.join(', ')}`);
        continue;
      }
      const allowed = new Set([dest.lesson, ...(dest.duplicatedIn ?? []).map((d) => d.lesson)]);
      for (const sub of Object.values(dest.items ?? {})) allowed.add(sub.lesson);
      const citedBy = [...byLesson.entries()].filter(([, b]) => b.all.has(id)).map(([l]) => l);
      for (const l of allowed) {
        if (l != null && l !== 'unit' && !CATALOGUE_STATUS.has(l)) problems.push(`${unitCode}: « ${id} » est destiné à « ${l} », qui n'est pas une leçon du catalogue`);
      }
      if (isPending(dest.lesson)) {
        pending += 1;
      } else if (!citedBy.includes(dest.lesson)) {
        problems.push(`${unitCode}: « ${id} » est destiné à « ${dest.lesson} » (module ${dest.module}) mais aucun contenu de cette leçon ne le cite`);
      }
      for (const l of citedBy) {
        if (allowed.has(l)) continue;
        problems.push(`${unitCode}: « ${id} » est cité par « ${l} » alors que sa destination est « ${dest.lesson} » — duplication non déclarée (ajoutez duplicatedIn dans extraction.json ou retirez la citation)`);
      }
    }
    // 3 — toute citation existe.
    for (const [lesson, b] of byLesson) {
      for (const id of b.all) if (!elements.has(id)) problems.push(`${unitCode}: « ${lesson} » cite l'élément inconnu « ${id} »`);
    }
    // 4 — les ajouts de la plateforme, comptés.
    let additions = 0;
    if (unitLessonsDir) for (const f of walk(unitLessonsDir)) additions += (readFileSync(f, 'utf8').match(/addition\(/g) ?? []).length;

    report.push({ unit: unitCode, elements: elements.size, lessons: byLesson.size, platformAdditions: additions, pending });
  }
}

/*
 * 5. Les FICHES d'exercices (source non-manuel) : docs/sources/<classe>/<unité>/worksheet-<id>.json.
 *    Chaque élément a au plus UNE destination (un exercice de pratique) ou déclare
 *    `notIntegrated` avec sa raison ; l'exercice de destination existe et cite cet
 *    élément ; tout exercice qui cite une fiche cite un élément qui y existe.
 */
const worksheetCitations = new Map(); // `${worksheetId}:${elementId}` → [exerciseId]
const adaptedWorksheetCopies = new Map(); // idem, copies adaptées déclarées (`adaptedFrom`)
for (const f of walk(join(repoRoot, 'content/practice'))) {
  if (!f.endsWith('.json') || !/\/level-\d\//.test(f)) continue;
  const data = JSON.parse(readFileSync(f, 'utf8'));
  const src = data.metadata?.source;
  if (src?.type !== 'worksheet') continue;
  if (!src.worksheetId || !src.elementId) { problems.push(`${relative(repoRoot, f)} : source « worksheet » sans worksheetId ou elementId`); continue; }
  const key = `${src.worksheetId}:${src.elementId}`;
  // Copie adaptée déclarée d'un exercice d'une autre leçon : elle cite un élément qui doit
  // exister, mais ne compte pas comme une seconde destination.
  if (adaptedOriginLesson(data)) { adaptedWorksheetCopies.set(key, [...(adaptedWorksheetCopies.get(key) ?? []), data.id]); continue; }
  worksheetCitations.set(key, [...(worksheetCitations.get(key) ?? []), data.id]);
}
const knownWorksheetKeys = new Set();
for (const file of walk(SOURCES).filter((p) => /\/worksheet-[a-z0-9-]+\.json$/.test(p))) {
  const ws = JSON.parse(readFileSync(file, 'utf8'));
  let integrated = 0;
  for (const el of ws.elements ?? []) {
    const key = `${ws.worksheetId}:${el.id}`;
    knownWorksheetKeys.add(key);
    const citedBy = worksheetCitations.get(key) ?? [];
    if (!el.destination) {
      if (!el.notIntegrated) problems.push(`fiche ${ws.worksheetId}: « ${el.id} » n'a ni destination ni raison « notIntegrated »`);
      if (citedBy.length) problems.push(`fiche ${ws.worksheetId}: « ${el.id} » est déclaré non intégré mais cité par ${citedBy.join(', ')}`);
      continue;
    }
    integrated += 1;
    if (citedBy.length !== 1 || citedBy[0] !== el.destination.exercise) {
      problems.push(`fiche ${ws.worksheetId}: « ${el.id} » doit être cité par ${el.destination.exercise} seulement (cité par : ${citedBy.join(', ') || 'aucun'})`);
    }
  }
  report.push({ worksheet: ws.worksheetId, elements: (ws.elements ?? []).length, integrated });
}
for (const [key, exercises] of [...worksheetCitations, ...adaptedWorksheetCopies]) {
  if (!knownWorksheetKeys.has(key)) problems.push(`${exercises.join(', ')} : cite l'élément de fiche inconnu « ${key} »`);
}

function readUnitCode(gradeDir, unitDir) {
  // docs/sources/4am/unit1 → le code de l'unité n°1 de la classe dans le catalogue.
  const n = Number(unitDir.replace(/\D/g, ''));
  const unitsJson = join(repoRoot, `packages/core/curriculum/dz/units_${gradeDir}_2026_2027.json`);
  if (!existsSync(unitsJson)) return unitDir;
  return JSON.parse(readFileSync(unitsJson, 'utf8')).units.find((u) => u.number === n)?.code ?? unitDir;
}

function findUnitDir(unitCode) {
  const root = join(repoRoot, 'apps/web/src/lessons');
  for (const p of walk(root)) {
    if (p.endsWith('/lesson.config.js') && p.includes(`/${unitCode}/`)) return p.slice(0, p.indexOf(`/${unitCode}/`) + unitCode.length + 1);
  }
  return null;
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ report, problems }, null, 2));
} else {
  for (const r of report) {
    if (r.worksheet) console.log(`fiche « ${r.worksheet} » : ${r.elements} éléments, ${r.integrated} intégrés, ${r.elements - r.integrated} non intégré(s) avec raison`);
    else console.log(`unité « ${r.unit} » : ${r.elements} éléments du manuel, ${r.lessons} destinations, ${r.platformAdditions} ajout(s) de la plateforme déclaré(s)${r.pending ? `, ${r.pending} en attente (leçons coming_soon)` : ''}`);
  }
  if (problems.length) {
    console.error(`\n${problems.length} problème(s) de couverture :`);
    for (const p of problems) console.error(`  ✗ ${p}`);
    process.exit(1);
  }
  console.log('✅ Couverture du manuel : chaque élément extrait a une destination unique, et rien n\'est cité de mémoire.');
}
