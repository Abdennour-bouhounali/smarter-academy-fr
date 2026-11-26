#!/usr/bin/env node
/**
 * learning-net-queue — l'ORDRE DE GÉNÉRATION des leçons prévues, lu dans le réseau des compétences.
 *
 * La classe d'ANCRAGE est la dernière du programme (la 3e, l'année du brevet) :
 *
 * Phase A — « ce dont l'élève de la classe d'ancrage a besoin MAINTENANT » : ses unités dans l'ordre du catalogue,
 * leçon par leçon ; pour chacune, ses prérequis DIRECTS dans les classes antérieures (un seul saut, pas de fermeture),
 * pris dans la classe la plus récente : un item qu'une classe plus récente (avant l'ancrage) prolonge (`extends`) est
 * remplacé par ce prolongement. Dans une même leçon, la classe la plus ancienne d'abord, puis l'ordre du catalogue.
 *
 * Phases B… — le reste : depuis chaque leçon de chaque classe, de l'ancrage à la première, TOUTE la chaîne de ses
 * prérequis (requires / extends / consolidates, fermeture transitive), de la plus ancienne à la plus récente. Les
 * leçons ISOLÉES (aucun lien entrant ni sortant hors de leur propre leçon) passent en dernier. Une synthèse entre dans
 * la file juste après la dernière leçon de son unité.
 *
 *   node scripts/learning-net-queue.mjs            # écrit docs/curriculum/GENERATION_QUEUE.md + .json
 *   node scripts/learning-net-queue.mjs --check    # échoue si la file écrite n'est plus à jour
 *
 * Contrat : docs/architecture/LEARNING_NET.md § « Generation order ».
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LESSONS, LINKS, UNITS, GRADES, getItem, homeLessonOf, itemRank, isStub,
} from '../packages/core/curriculum/fr/net/learningNet.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs/curriculum/GENERATION_QUEUE.md');
const OUT_JSON = join(ROOT, 'docs/curriculum/generation-queue.json');
const GRADE_N = Object.fromEntries(GRADES.map((g, i) => [g.id, i + 1]));
const ANCHOR = GRADES.at(-1)?.id ?? null;
const gradeLabel = new Map(GRADES.map((g) => [g.id, g.label]));
// Item ids are `<grade>.m<segment>.r<nn>`: the grade is the first segment.
const gradeOfItem = (id) => id.split('.')[0];

const into = new Map();
for (const k of LINKS) (into.get(k.to) ?? into.set(k.to, []).get(k.to)).push(k.from);
const touched = new Set(LINKS.flatMap((k) => [k.from, k.to]));

/** Toutes les leçons PRÉVUES de classes antérieures dont dépend `lesson` (fermeture). */
function upstreamPlanned(lesson) {
  const seen = new Set();
  const stack = [...lesson.programmeItems];
  while (stack.length) {
    const id = stack.pop();
    for (const from of into.get(id) ?? []) {
      if (seen.has(from)) continue;
      seen.add(from);
      stack.push(from);
    }
  }
  const lessons = new Map();
  for (const id of seen) {
    const home = homeLessonOf(id);
    if (home && home.status === 'planned' && GRADE_N[home.grade] < GRADE_N[lesson.grade]) {
      const rank = Math.min(lessons.get(home.code)?.rank ?? Infinity, ...home.programmeItems.map(itemRank));
      lessons.set(home.code, { lesson: home, rank, via: [...(lessons.get(home.code)?.via ?? []), id] });
    }
  }
  return [...lessons.values()].sort((a, b) => a.rank - b.rank);
}

const planned = LESSONS.filter((l) => l.status === 'planned');
const plannedByUnit = new Map();
for (const l of planned) (plannedByUnit.get(l.unit) ?? plannedByUnit.set(l.unit, []).get(l.unit)).push(l);

const queue = [];
const done = new Set();
function queueSynthesisIfComplete(unit) {
  const items = plannedByUnit.get(unit) ?? [];
  const syn = items.find((l) => l.kind === 'synthesis');
  if (syn && !done.has(syn.code) && items.every((l) => l.kind === 'synthesis' || done.has(l.code))) {
    done.add(syn.code);
    queue.push({ code: syn.code, grade: syn.grade, unit, title: syn.title, kind: 'synthesis', trigger: `unité ${unit} complète`, via: [] });
  }
}
function push(lesson, trigger, via = []) {
  if (done.has(lesson.code) || lesson.status !== 'planned' || lesson.kind === 'synthesis') return;
  done.add(lesson.code);
  queue.push({ code: lesson.code, grade: lesson.grade, unit: lesson.unit, title: lesson.title, kind: lesson.kind, trigger, via });
  // La synthèse suit la dernière leçon de son unité.
  queueSynthesisIfComplete(lesson.unit);
}

const isIsolated = (l) => l.programmeItems.every((id) => !touched.has(id)); // sans item = isolée aussi
const phases = [];

/** L'item le plus récent (avant l'ancrage) qui prolonge `id` par des liens `extends` — `id` lui-même sinon. */
function newestVersion(id) {
  const later = LINKS.filter((k) => k.type === 'extends' && k.from === id && GRADE_N[gradeOfItem(k.to)] < GRADE_N[ANCHOR]);
  return later.map((k) => newestVersion(k.to)).sort((a, b) => GRADE_N[gradeOfItem(b)] - GRADE_N[gradeOfItem(a)])[0] ?? id;
}
const pos = new Map(LESSONS.map((l, k) => [l.code, k]));
const anchorUnits = UNITS.filter((u) => u.grade === ANCHOR).sort((a, b) => a.number - b.number);
for (const u of anchorUnits) {
  const start = queue.length;
  // Direct earlier-grade prerequisites that are stubs: their grade has no lesson yet, so nothing to generate for them.
  const stubGrades = new Set();
  for (const anchor of LESSONS.filter((l) => l.grade === ANCHOR && l.unit === u.code && l.kind !== 'synthesis')) {
    const needed = new Map();
    for (const it of anchor.programmeItems) {
      for (const from of into.get(it) ?? []) {
        if (GRADE_N[gradeOfItem(from)] >= GRADE_N[ANCHOR]) continue;
        const id = newestVersion(from);
        if (isStub(id)) stubGrades.add(gradeOfItem(id));
        const home = homeLessonOf(id);
        if (home) needed.set(home.code, { lesson: home, via: [...(needed.get(home.code)?.via ?? []), id] });
      }
    }
    [...needed.values()]
      .sort((a, b) => GRADE_N[a.lesson.grade] - GRADE_N[b.lesson.grade] || pos.get(a.lesson.code) - pos.get(b.lesson.code))
      .forEach((n) => push(n.lesson, anchor.code, n.via));
  }
  // a unit whose lessons are ALL published pushes nothing above, so nothing called its synthesis: it enters here, in its
  // unit's turn — never at the end of the queue (first met 2026-11-26: « Multiples et diviseurs », its four lessons built)
  queueSynthesisIfComplete(u.code);
  phases.push({ grade: 'now', unit: u, from: start, to: queue.length, stubGrades: [...stubGrades].sort((a, b) => GRADE_N[b] - GRADE_N[a]) });
}
for (const g of GRADES.map((x) => x.id).reverse()) {
  const start = queue.length;
  for (const anchor of LESSONS.filter((l) => l.grade === g && l.kind !== 'synthesis')) {
    if (anchor.status === 'planned' && isIsolated(anchor)) continue;
    for (const up of upstreamPlanned(anchor)) push(up.lesson, anchor.code, up.via);
    if (anchor.status === 'planned') push(anchor, anchor.code);
  }
  // Une unité de la classe dont toutes les leçons sont publiées n'appelle plus `push` : sa synthèse entre ici.
  for (const [unit, items] of plannedByUnit) if (items.some((l) => l.kind === 'synthesis' && l.grade === g)) queueSynthesisIfComplete(unit);
  phases.push({ grade: g, from: start, to: queue.length });
}
const isoStart = queue.length;
for (const l of planned.filter((x) => x.kind !== 'synthesis')) push(l, 'isolée');
phases.push({ grade: 'isolated', from: isoStart, to: queue.length });
// Garde-fou : toute leçon prévue est dans la file, exactement une fois.
const missing = planned.filter((l) => !done.has(l.code)).map((l) => l.code);
if (missing.length) { console.error('✗ leçons prévues hors file :', missing.join(', ')); process.exit(1); }

const lines = [
  '# File de génération des leçons du collège',
  '',
  '> **Généré** par `scripts/learning-net-queue.mjs` depuis le réseau des compétences — ne pas éditer à la main.',
  `> **Phase A d’abord** : ce dont l’élève de la classe d’ancrage (${ANCHOR ? gradeLabel.get(ANCHOR) : '—'}) a besoin MAINTENANT — ses unités dans`,
  '> l’ordre du catalogue ; pour chaque leçon, ses prérequis DIRECTS des classes antérieures, pris dans la classe la plus récente.',
  '> Ensuite : les chaînes complètes des leçons, de la classe d’ancrage à la première ; les leçons isolées en dernier ; chaque',
  '> synthèse juste après la dernière leçon de son unité. Contrat : `docs/architecture/LEARNING_NET.md` §4.',
  '',
];
if (LESSONS.length === 0) {
  lines.push('**File vide.** Le catalogue du collège ne porte encore aucune leçon (ni publiée ni prévue) : rien à générer. '
    + 'La file se remplit d’elle-même quand les leçons et le réseau sont écrits.', '');
}
lines.push(`**${queue.length}** leçons à générer (${queue.filter((q) => q.kind === 'synthesis').length} synthèses).`, '');
const PHASE_TITLE = { isolated: 'Dernière phase — leçons isolées' };
for (const [i, g] of GRADES.map((x) => x.id).reverse().entries()) {
  PHASE_TITLE[g] = `Phase ${String.fromCharCode(66 + i)} — depuis les leçons de ${gradeLabel.get(g)}`;
}
const nowPhases = phases.filter((p) => p.grade === 'now');
const renderRows = (p) => {
  lines.push('| # | leçon | classe | unité | déclenchée par |', '|---:|---|---|---|---|');
  for (let i = p.from; i < p.to; i += 1) {
    const q = queue[i];
    lines.push(`| ${i + 1} | \`${q.code}\` — ${q.title.replace(/\$/g, '')}${q.kind === 'synthesis' ? ' _(synthèse)_' : ''} | ${gradeLabel.get(q.grade)} | \`${q.unit}\` | ${q.trigger === 'isolée' || q.kind === 'synthesis' ? q.trigger : `\`${q.trigger}\``} |`);
  }
  lines.push('');
};
lines.push(`## Phase A — ce dont la classe d’ancrage a besoin maintenant, unité par unité (${nowPhases.reduce((n, p) => n + p.to - p.from, 0)})`, '');
for (const p of phases) {
  const head = p.grade === 'now' ? `### Unité ${p.unit.number} — ${p.unit.title}` : `## ${PHASE_TITLE[p.grade]}`;
  if (p.to === p.from) {
    if (p.grade === 'now') {
      const why = p.stubGrades.length
        ? `ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de ${p.stubGrades.map((g) => gradeLabel.get(g)).join(', ')}) : ils seront générés avec leur classe.`
        : 'ses prérequis directs sont publiés ou déjà dans la file.';
      lines.push(`${head} (0) — rien à générer : ${why}`, '');
    }
    continue;
  }
  lines.push(`${head} (${p.to - p.from})`, '');
  renderRows(p);
}
// Renvois en avant : dans une même classe, un prérequis dont la leçon d'accueil vient PLUS LOIN dans le catalogue.
// Admis (l'ordre du catalogue fait foi), mais la leçon qui le subit doit le rappeler elle-même.
const forward = LINKS.map((k) => ({ k, a: homeLessonOf(k.from), b: homeLessonOf(k.to) }))
  .filter(({ a, b }) => a && b && a.grade === b.grade && a.code !== b.code && pos.get(a.code) > pos.get(b.code));
lines.push(`## Renvois en avant dans une même classe (${forward.length})`, '',
  'La leçon de gauche suppose un item que le catalogue n’enseigne que PLUS LOIN : elle le rappelle elle-même, sans le construire.', '',
  '| leçon | suppose | enseigné plus loin dans |', '|---|---|---|');
for (const { k, a, b } of forward) lines.push(`| \`${b.code}\` (${k.to}) | ${k.from} — ${getItem(k.from).text.replace(/\$/g, '').replace(/\|/g, '/')} | \`${a.code}\` |`);
lines.push('');
const md = `${lines.join('\n')}\n`;
const json = `${JSON.stringify({ _comment: 'Généré par scripts/learning-net-queue.mjs — ne pas éditer.', queue }, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const stale = [[OUT_MD, md], [OUT_JSON, json]].filter(([f, t]) => !existsSync(f) || readFileSync(f, 'utf8') !== t);
  if (stale.length) { console.error('✗ file de génération périmée : node scripts/learning-net-queue.mjs'); process.exit(1); }
  console.log(`✓ file de génération à jour (${queue.length} leçons)`);
} else {
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, json);
  console.log(`✓ docs/curriculum/GENERATION_QUEUE.md (${queue.length} leçons, now:${nowPhases.reduce((n, p) => n + p.to - p.from, 0)} ${phases.filter((p) => p.grade !== 'now').map((p) => `${p.grade}:${p.to - p.from}`).join(' ')})`);
}
