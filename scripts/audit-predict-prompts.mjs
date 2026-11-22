#!/usr/bin/env node
/**
 * audit-predict-prompts — « أتوقّع القاعدة » : quelles règles attendent encore
 * leur `predictPrompt` (docs/lessons/PREDICT_PROMPT_GUIDE.md).
 *
 * Une règle est DEMANDÉE à l'élève (gate) quand une <KnowledgeBrick id> non
 * « rappel » (et sans predict={false}) la pose et que son item est d'une sorte
 * qu'on peut conclure (concepts, regles, methodes, memoriser, formules), ou
 * quand une <PredictRule id> l'enveloppe. Sans `predictPrompt` (item, prop
 * `predictPrompt` de la brique, ou `prompt` de PredictRule), l'élève voit la
 * question générique : acceptable, jamais aussi bonne.
 *
 * Informatif (code de sortie 0) tant que la reprise de toutes les leçons n'est
 * pas faite ; `--strict` échoue s'il reste une règle sans prompt.
 *
 *   node scripts/audit-predict-prompts.mjs            # tableau par leçon
 *   node scripts/audit-predict-prompts.mjs --missing  # + la liste des items à écrire
 *   node scripts/audit-predict-prompts.mjs --lesson qasim-adad-tabii
 *   node scripts/audit-predict-prompts.mjs --strict
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findLessonDirs, parseLessonConfig } from './lib/lessonAst.mjs';
import { readKnowledge } from './lib/knowledgeData.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const LESSONS = join(ROOT, 'apps/web/src/lessons/moyen');
const args = process.argv.slice(2);
const showMissing = args.includes('--missing') || args.includes('--lesson');
const strict = args.includes('--strict');
const only = args.includes('--lesson') ? args[args.indexOf('--lesson') + 1] : null;
const PREDICTABLE = new Set(['concepts', 'regles', 'methodes', 'memoriser', 'formules']);

const rows = [];
for (const dir of findLessonDirs(LESSONS)) {
  const { id: code, kind } = parseLessonConfig(dir);
  if (!code || (only && code !== only)) continue;
  if (!existsSync(join(dir, 'knowledge.jsx'))) continue;
  const { items } = readKnowledge(dir);
  const modDir = join(dir, 'modules');
  const sources = existsSync(modDir) ? readdirSync(modDir).filter((f) => f.endsWith('.jsx')).map((f) => readFileSync(join(modDir, f), 'utf8')) : [];
  const gated = new Map(); // id -> { prompted }
  for (const src of sources) {
    for (const m of src.matchAll(/<KnowledgeBrick\b([^>]*)>/g)) {
      const attrs = m[1];
      const id = attrs.match(/\bid="([^"]+)"/)?.[1];
      if (!id || /variant="(rappel|enrichment)"/.test(attrs) || /predict=\{false\}/.test(attrs)) continue;
      const item = items.get(id);
      if (!item || item.predict === false) continue;
      if (!PREDICTABLE.has(item.type) && item.predict !== true && !/predict(=\{true\})?(\s|$)/.test(attrs)) continue;
      const prompted = Boolean(item.predictPrompt) || /predictPrompt=/.test(attrs);
      gated.set(id, { prompted: prompted || gated.get(id)?.prompted, title: item.title, type: item.type, module: item.module });
    }
    for (const m of src.matchAll(/<PredictRule\b([^>]*)>/g)) {
      const attrs = m[1];
      const id = attrs.match(/\bid="([^"]+)"/)?.[1] ?? `(box ${m.index})`;
      const item = items.get(id);
      gated.set(id, { prompted: /\bprompt=/.test(attrs) || Boolean(item?.predictPrompt), title: item?.title ?? '', type: item?.type ?? 'regles', module: item?.module });
    }
  }
  const missing = [...gated].filter(([, v]) => !v.prompted);
  rows.push({ code, kind, dir: relative(ROOT, dir), total: gated.size, missing });
}

rows.sort((a, b) => a.dir.localeCompare(b.dir));
let total = 0, todo = 0;
for (const r of rows) {
  total += r.total; todo += r.missing.length;
  const mark = r.missing.length === 0 ? '✓' : '·';
  console.log(`${mark} ${r.code.padEnd(30)} ${String(r.total - r.missing.length).padStart(3)}/${String(r.total).padEnd(3)} ${r.kind === 'synthesis' ? '(synthèse)' : ''}`);
  if (showMissing) for (const [id, v] of r.missing) console.log(`     - ${id} [${v.type}, module ${v.module ?? '?'}] ${v.title}`);
}
console.log(`\n${total - todo}/${total} règles demandées ont leur predictPrompt — ${todo} à écrire, ${rows.filter((r) => r.missing.length).length} leçon(s).`);
process.exit(strict && todo > 0 ? 1 : 0);
