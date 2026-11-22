#!/usr/bin/env node
/**
 * generate-compass-index — la banque de questions de « بوصلتي » (P1), lue dans
 * la banque de pratique et le réseau des الكفاءات.
 *
 *   node scripts/generate-compass-index.mjs           # écrit content/compass/index.generated.json
 *   node scripts/generate-compass-index.mjs --check   # échoue si le fichier écrit n'est plus à jour
 *
 * Une question entre dans la banque si :
 *  - son exercice est au niveau 1 (→ niveau 1 de la jauge) ou 2 (→ niveau 2) ;
 *  - son type de réponse est `choice` ou `rational` (corrigés par AnswerEvaluator) ;
 *  - c'est la 1re question de l'exercice, ou une sous-question qui ne renvoie pas
 *    à une réponse précédente (« استنتج », « السابق », « السؤال »…) ;
 *  - sa leçon déclare EXACTEMENT un item du programme (`programmeItems`) : sinon
 *    on ne sait pas quelle كفاءة elle mesure (compté dans `gaps.multiItemLessons`).
 *
 * Le fichier est lu par le SERVEUR seulement (Domain/Compass/CompassBank) : il ne
 * contient que des références, aucune réponse, et n'entre jamais dans le bundle.
 * Contrat : docs/architecture/YEAR_COMPASS.md §4.1.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS, ITEMS } from '../packages/core/curriculum/dz/net/learningNet.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRACTICE = join(ROOT, 'content/practice');
const OUT = join(ROOT, 'content/compass/index.generated.json');
const TYPES = new Set(['choice', 'rational']);
const DEPENDS = /استنتج|السابق|السابقة|من السؤال|من الجواب|باستعمال النتيجة|بالاستعانة|أعلاه|ما سبق|السؤال/;

const NEEDS_VISUAL = /المقابل|الشكل|المخطط|الجدول|البيان/;
const LETTER = /\$\s*([A-Z])\s*\$/g;

/**
 * Une question ne quitte jamais le serveur sans ses DONNÉES (propriétaire, 2026-11-09 :
 * « A يساوي ماذا؟ »). Refusée quand :
 *  - l'énoncé renvoie à une figure / un schéma / un tableau qu'il ne porte pas ;
 *  - elle nomme une lettre ($A$, $C$…) que rien ne définit : ni une formule de l'énoncé
 *    (`A = …`), ni le texte (« A = … »), ni une figure (où les lettres sont des points).
 *
 */
export function missingData(ex, q) {
  const st = ex.statement ?? {};
  const text = `${st.content ?? ''}\n${q.lead ?? ''}\n${q.statement ?? ''}`;
  if (NEEDS_VISUAL.test(text) && !st.figure && !st.table) return 'visual';
  if (st.figure) return null;
  const defined = new Set();
  for (const f of st.formulas ?? []) {
    for (const m of f.matchAll(/(?:^|[,;]\s*)([A-Z])\s*=/g)) defined.add(m[1]);
  }
  for (const m of text.matchAll(/([A-Z])\s*=/g)) defined.add(m[1]);
  if (st.table) for (const m of JSON.stringify(st.table).matchAll(/\b([A-Z])\b/g)) defined.add(m[1]);
  for (const m of `${q.lead ?? ''} ${q.statement ?? ''}`.matchAll(LETTER)) {
    if (!defined.has(m[1])) return `letter:${m[1]}`;
  }
  return null;
}

export function buildIndex() {
  const items = {};
  const gaps = { multiItemLessons: [], dependentSubQuestions: 0, missingData: 0 };
  for (const lesson of LESSONS) {
    const pi = lesson.programmeItems ?? [];
    if (!pi.length) continue;
    for (const level of [1, 2]) {
      const dir = join(PRACTICE, lesson.grade, lesson.code, `level-${level}`);
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir).sort()) {
        if (!file.endsWith('.json')) continue;
        const ex = JSON.parse(readFileSync(join(dir, file), 'utf8'));
        ex.questions.forEach((q, i) => {
          if (!TYPES.has(q.answerType)) return;
          if (i > 0 && DEPENDS.test(q.statement ?? '')) {
            gaps.dependentSubQuestions += 1;
            return;
          }
          if (missingData(ex, q)) {
            gaps.missingData += 1;
            return;
          }
          if (pi.length !== 1) {
            if (!gaps.multiItemLessons.includes(lesson.code)) gaps.multiItemLessons.push(lesson.code);
            return;
          }
          const id = pi[0];
          items[id] ??= { grade: lesson.grade, lessons: [], 1: [], 2: [] };
          if (!items[id].lessons.includes(lesson.code)) items[id].lessons.push(lesson.code);
          items[id][level].push(`${lesson.code}/${ex.id}/${q.id}`);
        });
      }
    }
  }
  const sorted = Object.fromEntries(Object.keys(items).sort().map((k) => [k, items[k]]));
  const coverage = {};
  for (const g of ['1am', '2am', '3am', '4am']) {
    const all = ITEMS.filter((it) => it.grade === g).length;
    const both = Object.values(sorted).filter((v) => v.grade === g && v[1].length && v[2].length).length;
    coverage[g] = { items: all, withBothLevels: both };
  }
  gaps.multiItemLessons.sort();
  return {
    _comment: 'GÉNÉRÉ par scripts/generate-compass-index.mjs — ne pas éditer. Lu par le serveur seulement (aucune réponse ici). Contrat : docs/architecture/YEAR_COMPASS.md §4.1.',
    coverage,
    gaps,
    items: sorted,
  };
}

const text = `${JSON.stringify(buildIndex(), null, 1)}\n`;
if (process.argv.includes('--check')) {
  const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (cur !== text) {
    console.error('✗ content/compass/index.generated.json n’est plus à jour : node scripts/generate-compass-index.mjs');
    process.exit(1);
  }
  console.log('✓ compass index à jour');
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, text);
  const idx = JSON.parse(text);
  console.log('compass index :', JSON.stringify(idx.coverage), '— leçons multi-items exclues :', idx.gaps.multiItemLessons.length);
}
