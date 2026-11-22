#!/usr/bin/env node
/**
 * Locked-prompt leak audit for the « مسائل » (rollout 2026-10-06, lead review of unit 1).
 * A locked sub-step shows its `prompt` from the start (GuidedProblem.jsx). A prompt must
 * therefore never contain a value that an EARLIER (or the same) sub-step asks the student to
 * find: a numeric `expected`, or a number found only in the correct option of a choice.
 * Numbers already given in the statement, the question, or found in an EARLIER question are not leaks.
 *
 * Severity (owner precedent: the validated pilot shows « 268 » = 270 − 2 in a later prompt):
 *   ✗ error   — the value answers a DEMAND (a step with `ask`) or is a division result (a numeric
 *               step whose prompt says باقي / حاصل): e.g. every Euclid line exposing the previous
 *               remainder lets the student skip the algorithm;
 *   · warning — a trivial intermediate (a sum, a difference) re-used as data: acceptable.
 * ALLOW lists reviewed coincidences (`code id label value`).
 *
 *   node docs/sources/4am/masail-rollout/audit-locked-leaks.mjs [lesson-code …]   # exit 1 on a leak
 */
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../../apps/web/src/lessons/moyen/4am/', import.meta.url).pathname;
const only = process.argv.slice(2);
const dirs = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(d, e.name);
    if (existsSync(join(p, 'content/problems.js'))) dirs.push([e.name, p]); else walk(p);
  }
})(ROOT);

const nums = (t = '') => new Set((String(t).replace(/\\[a-zA-Z]+/g, ' ').match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')));
const ALLOW = new Set([
  'qasim-mushtarak-akbar masala-2 1) 6', // 6 is a divisor in the given lists, not the remainder 96 − 90
]);
let leaks = 0;
let warnings = 0;
for (const [code, dir] of dirs.sort()) {
  if (only.length && !only.includes(code)) continue;
  const { PROBLEMS } = await import(join(dir, 'content/problems.js'));
  for (const pb of PROBLEMS) {
    const given = nums(pb.statement);
    const earlier = new Set();
    pb.parts.forEach((part, p) => {
      const known = new Set([...given, ...earlier, ...nums(part.question)]);
      const found = []; // [value, step index]
      part.steps.forEach((s, i) => {
        const strong = s.ask != null || (s.kind === 'numeric' && /(باقي|حاصل) (القسمة|هذه القسمة)/.test(s.prompt ?? ''));
        if (s.kind === 'numeric') found.push([String(s.expected), i, 'numeric', strong]);
        if (s.kind === 'choice' && Array.isArray(s.options)) {
          const wrong = new Set(s.options.filter((_, k) => k !== s.correct).flatMap((o) => [...nums(o)]));
          for (const n of nums(s.options[s.correct])) if (!wrong.has(n)) found.push([n, i, 'choice', strong]);
        }
        if (!s.prompt) return;
        const shown = nums(s.prompt);
        for (const [v, j, kind, strong] of found) {
          if (j > i || known.has(v) || !shown.has(v)) continue;
          if (j === i && kind === 'choice') continue; // a choice's own prompt may name what its options use
          if (ALLOW.has(`${code} ${pb.id} ${part.label} ${v}`)) continue;
          if (strong) leaks++; else warnings++;
          console.log(`${strong ? '✗' : '·'} ${code} ${pb.id} ${part.label} step ${i + 1} prompt shows ${v}, the answer of step ${j + 1}: « ${s.prompt} »`);
        }
      });
      for (const [v] of found) earlier.add(v);
    });
  }
}
console.log(leaks ? `\n${leaks} leak(s), ${warnings} warning(s)` : `✓ no locked prompt reveals a demand's answer or a division result (${warnings} trivial re-use(s))`);
process.exit(leaks ? 1 : 0);
