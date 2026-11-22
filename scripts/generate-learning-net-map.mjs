#!/usr/bin/env node
/**
 * generate-learning-net-map — la CARTE LISIBLE du réseau des compétences du collège.
 *
 * Écrit docs/curriculum/LEARNING_NET_MAP.md, learning-net-map.html et LEARNING_NET_WEIGHTS.md depuis les données du
 * réseau (packages/core/curriculum/fr/net/*.json + lessons_<g>_*.json via le résolveur). Ces fichiers ne sont JAMAIS
 * édités à la main : on corrige le JSON, on relance ce script. `--check` échoue s'ils ne sont plus à jour (gate de
 * `npm run check:lessons`). Un réseau vide donne des documents qui le disent.
 *
 *   node scripts/generate-learning-net-map.mjs [--check]
 *
 * Contrat : docs/architecture/LEARNING_NET.md.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  reviewLinksForLesson,
  GRADES, SEGMENTS, ITEMS, THREADS, LINKS, LESSONS, UNITS,
  homeLessonOf, linksInto, getItem, toolsForLesson, WEIGHTED_GRADES,
} from '../packages/core/curriculum/fr/net/learningNet.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs/curriculum/LEARNING_NET_MAP.md');
const OUT_HTML = join(ROOT, 'docs/curriculum/learning-net-map.html');
const OUT_WEIGHTS = join(ROOT, 'docs/curriculum/LEARNING_NET_WEIGHTS.md');
const TEMPLATE = join(ROOT, 'scripts/learning-net-map.template.html');
// The thèmes are read from the programme itself: the resolver does not export them.
const DOMAINS = JSON.parse(readFileSync(join(ROOT, 'packages/core/curriculum/fr/net/official_programme_college.json'), 'utf8')).domains;

const gradeLabel = new Map(GRADES.map((g) => [g.id, g.label]));
const TYPE_FR = { requires: 'requiert', extends: 'prolonge', consolidates: 'consolide' };
const plain = (s) => s.replace(/\$/g, '').replace(/\\(dfrac|frac)\{([^}]*)\}\{([^}]*)\}/g, '$2/$3')
  .replace(/\\left|\\right/g, '').replace(/\\mapsto/g, '↦').replace(/\\times/g, '×').replace(/\\div/g, '÷')
  .replace(/\\ldots/g, '…').replace(/\\pm/g, '±').replace(/\\(cos|sin|tan)/g, '$1').replace(/\^2/g, '²')
  .replace(/\^3/g, '³').replace(/[{}\\]/g, '');
const short = (s, n = 48) => { const p = plain(s); return p.length > n ? `${p.slice(0, n - 1)}…` : p; };
const node = (id) => `n_${id.replace(/\./g, '_')}`;
const lessonCell = (l) => (l ? `\`${l.code}\`${l.status === 'planned' ? ' _(prévue)_' : ''}` : '—');

const lines = [];
const out = (s = '') => lines.push(s);

const counts = LINKS.reduce((m, k) => ({ ...m, [k.type]: (m[k.type] ?? 0) + 1 }), {});
const available = LESSONS.filter((l) => l.status === 'available').length;
const planned = LESSONS.filter((l) => l.status === 'planned').length;

out('# Carte du réseau des compétences — collège (6e–3e)');
out();
out('> **Généré** par `scripts/generate-learning-net-map.mjs` — ne pas éditer à la main.');
out('> Contrat et règles : [`docs/architecture/LEARNING_NET.md`](../architecture/LEARNING_NET.md).');
out('> Données : `packages/core/curriculum/fr/net/`.');
out();
if (ITEMS.length === 0) {
  out('**Réseau vide.** Le programme officiel du collège n’est pas encore transcrit : aucun item, aucun fil, aucun lien, aucune leçon. '
    + 'Cette carte se remplit d’elle-même quand les données du réseau sont écrites.');
  out();
}
out(`**${ITEMS.length}** items du programme officiel · **${SEGMENTS.length}** séquences · **${THREADS.length}** fils conceptuels · `
  + `**${LINKS.length}** liens${LINKS.length ? ` (${Object.entries(counts).map(([t, n]) => `${n} ${t}`).join(', ')})` : ''} · `
  + `**${available}** leçons publiées · **${planned}** leçons prévues (${UNITS.length} unités).`);
out();
out('Légende des liens : `requires` (requiert) — prérequis, lien de révision ; `extends` (prolonge) — même notion plus loin dans la spirale, '
  + 'la leçon n’enseigne QUE la valeur ajoutée ; `consolidates` (consolide) — le programme répète l’item, la leçon le rappelle sans le reconstruire.');
out();
out('## 1. Les fils conceptuels (la spirale, classe par classe)');
out();
if (THREADS.length === 0) { out('_Aucun fil._'); out(); }
for (const t of THREADS) {
  const items = t.items.map(getItem);
  const ids = new Set(t.items);
  out(`### ${t.title} — \`${t.id}\``);
  out();
  out('```mermaid');
  out('flowchart LR');
  for (const g of GRADES) {
    const inGrade = items.filter((i) => i.grade === g.id);
    if (inGrade.length === 0) continue;
    out(`  subgraph g_${g.id}["${g.label}"]`);
    out('    direction TB');
    for (const i of inGrade) out(`    ${node(i.id)}["${i.id}<br/>${short(i.text).replace(/"/g, '\'')}"]`);
    out('  end');
  }
  for (const k of LINKS.filter((l) => ids.has(l.to) && ids.has(l.from))) {
    const arrow = k.type === 'requires' ? '-->' : k.type === 'extends' ? `==>|${TYPE_FR.extends}|` : `-.->|${TYPE_FR.consolidates}|`;
    out(`  ${node(k.from)} ${arrow} ${node(k.to)}`);
  }
  out('```');
  const external = LINKS.filter((l) => ids.has(l.to) && !ids.has(l.from));
  if (external.length) {
    out();
    out(`Prérequis venus d’autres fils : ${[...new Set(external.map((k) => `\`${k.from}\``))].join(', ')}.`);
  }
  out();
}

out('## 2. Le programme, séquence par séquence');
out();
for (const g of GRADES) {
  out(`### ${g.label} (\`${g.id}\`)`);
  out();
  const segments = SEGMENTS.filter((x) => x.grade === g.id);
  if (segments.length === 0) { out('_Aucune séquence._'); out(); }
  for (const s of segments) {
    out(`#### Séquence ${s.number} — ${s.title} (\`${s.id}\`, ${s.weeks} semaines)`);
    out();
    out('| item | texte du programme | leçon d’accueil | part de |');
    out('|---|---|---|---|');
    for (const i of ITEMS.filter((x) => x.segment === s.id)) {
      const from = linksInto(i.id).map((k) => `${k.type === 'requires' ? '' : `${TYPE_FR[k.type]} `}\`${k.from}\``).join(', ') || '—';
      const parts = i.parts ? ` (${i.parts.map(plain).join(' ; ')})` : '';
      out(`| \`${i.id}\` | ${plain(i.text)}${parts} | ${lessonCell(homeLessonOf(i.id))} | ${from} |`);
    }
    out();
  }
}

out('## 3. Les leçons et leurs items');
out();
for (const g of GRADES) {
  out(`### ${g.label}`);
  out();
  const gradeLessons = LESSONS.filter((l) => l.grade === g.id);
  if (gradeLessons.length === 0) { out('_Aucune leçon._'); out(); continue; }
  out('| # | leçon | statut | items |');
  out('|---:|---|---|---|');
  gradeLessons.forEach((l, k) => {
    const status = l.kind === 'synthesis' ? 'synthèse' : l.status === 'available' ? 'publiée' : 'prévue';
    out(`| ${k + 1} | \`${l.code}\` — ${plain(l.title)} | ${status} | ${l.programmeItems.map((id) => `\`${id}\``).join(' ') || '—'} |`);
  });
  out();
}

const text = `${lines.join('\n')}\n`;

// La page interactive autonome : mêmes données, rendues par le gabarit.
const data = {
  grades: GRADES.map((g) => ({ id: g.id, label: g.label })),
  domains: DOMAINS.map((d) => ({ id: d.id, t: d.title })),
  segments: SEGMENTS.map((s) => ({ id: s.id, g: s.grade, n: s.number, t: s.title, d: s.domain, w: s.weeks })),
  threads: THREADS.map((t) => ({ id: t.id, t: t.title, d: t.domain, items: t.items })),
  items: Object.fromEntries(ITEMS.map((i) => [i.id, {
    g: i.grade, s: i.segment, t: plain(i.text), p: i.parts?.map(plain), d: i.domain,
    h: homeLessonOf(i.id)?.code ?? null,
  }])),
  links: LINKS.map((k) => [k.from, k.to, k.type[0], plain(k.addedValue ?? k.note ?? '')]),
  lessons: Object.fromEntries(LESSONS.map((l) => [l.code, {
    g: l.grade, u: l.unit, t: plain(l.title), k: l.kind === 'synthesis' ? 's' : 'l', st: l.status === 'available' ? 'a' : 'p',
    items: l.programmeItems,
    rev: reviewLinksForLesson(l.code).map((gr) => [gr.lesson?.code ?? null, gr.items.map((i) => i.id)]),
  }])),
};
const html = readFileSync(TEMPLATE, 'utf8').replace('/*DATA*/', () => JSON.stringify(data).replace(/<\//g, '<\\/'));

// ── La table de RELECTURE des poids (propriétaire) : pour chaque leçon d'une classe pondérée, ses outils dans l'ordre du lancement ──
const W = [];
const classified = LINKS.filter((k) => k.weight);
W.push('# Learning net — weights of the links (review table)');
W.push('');
W.push('> GENERATED by `npm run generate:learning-net` from `packages/core/curriculum/fr/net/learning_net_college.json` — do not edit by');
W.push('> hand: correct a weight in the JSON (`weight`, and `weightNote` for a support link), then regenerate. Contract: `docs/architecture/LEARNING_NET.md` §2.2bis.');
W.push('');
if (WEIGHTED_GRADES.length === 0) {
  W.push('**No grade is weighted yet** (`WEIGHTED_GRADES` is empty): the collège net has no link. Stage 2 weights 3e first; this table fills itself then.');
  W.push('');
}
W.push('**How to read it.** One block per lesson, in catalogue order. Each line is an earlier competence the lesson stands on, in the');
W.push('order a launch would measure it: at most four are measured, the others are listed after the cut.');
W.push('');
W.push('- **core** — a student cannot pass the exercises of the lesson while failing this one. It can be NAMED as the cause of a difficulty, and a success on the lesson lets us deduce it « looks solid ».');
W.push('- **support** — it helps, explains or serves a proof, but the lesson can be passed without it. The reason is written. Nothing is deduced through it.');
W.push('');
W.push(`Classified links: **${classified.length}** (${classified.filter((k) => k.weight === 'core').length} core, ${classified.filter((k) => k.weight === 'support').length} support). Classified grades: ${WEIGHTED_GRADES.join(', ') || 'none'}.`);
for (const unit of UNITS.filter((u) => WEIGHTED_GRADES.includes(u.grade))) {
  const unitLessons = LESSONS.filter((l) => l.unit === unit.code && l.kind !== 'synthesis');
  if (!unitLessons.length) continue;
  W.push('', `## ${unit.title}`);
  for (const lesson of unitLessons) {
    const all = toolsForLesson(lesson.code, { max: 99 });
    W.push('', `### ${lesson.title} — \`${lesson.code}\``, '');
    W.push('| # | Weight | Earlier competence | Its lesson | Why (support only) |', '|---|---|---|---|---|');
    all.forEach((t, i) => {
      const notes = lesson.programmeItems.flatMap((own) => linksInto(own)).filter((k) => k.from === t.id && k.weightNote).map((k) => k.weightNote);
      const cut = i >= 4 ? ' _(after the cut)_' : '';
      W.push(`| ${i + 1}${cut} | ${t.weight === 'core' ? '**core**' : t.weight ?? '_not classified_'} | ${plain(t.text).replace(/\|/g, '/')} (\`${t.id}\`) | ${t.lesson ? `${plain(t.lesson.title)} — ${gradeLabel.get(t.lesson.grade)}${t.lesson.status === 'planned' ? ' _(not published)_' : ''}` : '—'} | ${t.weight === 'support' ? [...new Set(notes)].join(' ') : ''} |`);
    });
  }
}
const weightsText = `${W.join('\n')}\n`;

const targets = [[OUT, text], [OUT_HTML, html], [OUT_WEIGHTS, weightsText]];
if (process.argv.includes('--check')) {
  const stale = targets.filter(([f, t]) => (existsSync(f) ? readFileSync(f, 'utf8') : '') !== t).map(([f]) => f.replace(`${ROOT}/`, ''));
  if (stale.length) {
    console.error(`✗ ${stale.join(', ')} n’est plus à jour : node scripts/generate-learning-net-map.mjs`);
    process.exit(1);
  }
  console.log(`✓ carte du réseau des compétences à jour (md + html + poids) — ${ITEMS.length} items, ${LINKS.length} liens, ${LESSONS.length} leçons`);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  for (const [f, t] of targets) writeFileSync(f, t);
  console.log(`✓ docs/curriculum/LEARNING_NET_MAP.md + learning-net-map.html + LEARNING_NET_WEIGHTS.md (${ITEMS.length} items, ${LINKS.length} liens, ${LESSONS.length} leçons)`);
}
