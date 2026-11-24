#!/usr/bin/env node
/**
 * Checks a road's numbers against a lesson's exercise bank and the other lessons' stories — in seconds, before a number
 * is used anywhere (.claude/skills/lesson-v2/defects.md A9, D7; the authoring kit's README).
 *
 *   node scripts/lesson-bank-numbers.mjs <id>                       the bank's pairs (sorted), and its sheets
 *   node scripts/lesson-bank-numbers.mjs <id> --check 119,85 1833,546 962
 *                                                                   for each group: a pair the bank names, a line of the
 *                                                                   bank or of another story that holds both numbers,
 *                                                                   every number ≥ 100 found in the bank or a story
 *   node scripts/lesson-bank-numbers.mjs <id> --js                  the pairs as the line a `forges.js` pastes
 *                                                                   (`BANK_PAIRS`, the mirror never draws one)
 *   node scripts/lesson-bank-numbers.mjs <id> --numbers             every number the bank writes (whole, decimal
 *                                                                   « 7,5 » / `7{,}5`, fraction « 5/6 » / `\dfrac`),
 *                                                                   with the sheets where it stands
 * A decimal is given to --check with a POINT (the comma separates a group): `--check 57.5,77.5 1/38`. The textbook's
 * metadata of a sheet (its page…) is never searched.
 * Exit code 1 when a checked group collides.
 */
import {
  bankNumbers,
  bankPairs,
  collisions,
  readBank,
  shown,
  storiesOf,
} from '../apps/web/src/lessons/common/gameworld/kit/authoring/test/bank.js';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--') && !/^\d/.test(a));
if (!id) {
  console.error('usage: node scripts/lesson-bank-numbers.mjs <lesson id> [--check a,b …] [--js]');
  process.exit(2);
}
const at = args.indexOf('--check');
const groups =
  at < 0
    ? []
    : args
        .slice(at + 1)
        .filter((a) => /^\d+(?:\.\d+|\/\d+)?(?:,\d+(?:\.\d+|\/\d+)?)*$/.test(a))
        .map((a) => a.split(',').map((n) => (/^\d+$/.test(n) ? Number(n) : n)));

const bank = readBank(id);
const pairs = bankPairs(bank);
const sorted = [...pairs].sort((p, q) => Number(p.split(';')[0]) - Number(q.split(';')[0]) || p.localeCompare(q));

if (args.includes('--js')) {
  console.log(
    `// ${sorted.length} pairs named by content/practice/${bank.grade}/${id} (scripts/lesson-bank-numbers.mjs)`,
  );
  console.log(`const BANK_PAIRS = new Set('${sorted.join(' ')}'.split(' '));`);
  process.exit(0);
}

if (args.includes('--numbers')) {
  const nums = bankNumbers(bank);
  console.log(
    `${id} — content/practice/${bank.grade}/${id}: ${bank.sheets.length} sheets, ${nums.size} numbers written`,
  );
  for (const [n, sheets] of nums) console.log(`${n}\t${sheets.length}\t${sheets.join(' ')}`);
  process.exit(0);
}

console.log(`${id} — content/practice/${bank.grade}/${id}: ${bank.sheets.length} sheets, ${pairs.size} pairs named`);
if (!groups.length) {
  console.log(sorted.join('  '));
  process.exit(0);
}

const stories = storiesOf({ exceptId: id });
let bad = 0;
for (const nums of groups) {
  const r = collisions(bank, nums, { stories, pairs });
  console.log(`\n${nums.map(shown).join(' ; ')}  ${r.clear ? 'CLEAR' : 'COLLIDES'}`);
  if (r.named) console.log('  the bank names this pair');
  for (const l of r.bankLines.slice(0, 5)) console.log(`  both on a line of the bank — ${l.slice(0, 160)}`);
  for (const l of r.storyLines.slice(0, 5)) console.log(`  both on a line of a story — ${l.slice(0, 160)}`);
  for (const { n, sheets, stories: in_ } of r.numbers) {
    if (sheets.length)
      console.log(`  ${shown(n)} is in the bank: ${sheets.slice(0, 4).join(', ')}${sheets.length > 4 ? ' …' : ''}`);
    if (in_.length) console.log(`  ${shown(n)} is in another story: ${in_.join(', ')}`);
  }
  if (!r.clear) bad += 1;
}
process.exit(bad ? 1 : 0);
