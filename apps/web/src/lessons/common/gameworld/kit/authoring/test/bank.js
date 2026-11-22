/**
 * THE AUTHORING KIT, Node side — what a lesson's numbers must never collide with, read from the disk (tests and the CLI
 * `scripts/lesson-bank-numbers.mjs` only: it reads files, the app never imports it). Plain Node ESM: every import has
 * its extension, so the CLI runs it without Vite.
 *
 *   the lesson's exercise bank   content/practice/<grade>/<id>/level-*\/*.json, used AS IT IS (owner, 2026-11-18): the
 *                                world's numbers are the platform's own, never a pair the bank names, never two numbers
 *                                that stand on one line of it (its solutions chain operations: « 161 − 115 = 46 »)
 *   the other lessons' stories   apps/web/src/lessons/<…>/world/story.js: no island name, no headline number of theirs
 *
 * It names no lesson: the lesson is an argument.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** The repository's root (this file is apps/web/src/lessons/common/gameworld/kit/authoring/test/bank.js). */
const ROOT = join(here, '../../../../../../../../..');
const PRACTICE = join(ROOT, 'content/practice');
const LESSONS = join(ROOT, 'apps/web/src/lessons');

/** « 85;119 » — a pair in either order, as a key (the same as forgeBlocks.js › pairKey). */
const keyOf = (x, y) => [x, y].sort((p, q) => p - q).join(';');
/** A number standing alone in a text (not a piece of a longer number). */
export const alone = (n) => new RegExp(`(?<![0-9])${n}(?![0-9])`);

/** The grade folder of a lesson's bank (« 4am »), or null when it has none. */
export function gradeOf(id) {
  if (!existsSync(PRACTICE)) return null;
  return readdirSync(PRACTICE).find((g) => existsSync(join(PRACTICE, g, id))) ?? null;
}

/** A lesson's bank: every sheet of every level, as its raw text (one JSON line = one line of the bank). */
export function readBank(id, grade = gradeOf(id)) {
  const dir = grade && join(PRACTICE, grade, id);
  if (!dir || !existsSync(dir)) throw new Error(`no exercise bank for « ${id} » under content/practice/`);
  const sheets = readdirSync(dir)
    .filter((lvl) => statSync(join(dir, lvl)).isDirectory())
    .sort()
    .flatMap((lvl) =>
      readdirSync(join(dir, lvl))
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => ({ file: join(lvl, f), level: lvl, text: readFileSync(join(dir, lvl, f), 'utf8') })),
    );
  return { id, grade, dir, sheets };
}

/**
 * The pairs the bank NAMES: « PGCD(a ; b) » however it is written (`\\text{PGCD}(…)`, `\\mathrm{PGCD}(…)`, plain), and
 * « (لل|ال)عددين (الطبيعيين) a و b ». A Set of keys « a;b » (smaller first).
 */
const PAIR_RE = /PGCD\}?\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|(?:لل|ال)عددين(?:\s+الطبيعيين)?\s+(\d+)\s+و\s+(\d+)/g;
export function bankPairs(bank) {
  return new Set(
    bank.sheets.flatMap((s) =>
      [...s.text.matchAll(PAIR_RE)].map((m) => keyOf(Number(m[1] ?? m[3]), Number(m[2] ?? m[4]))),
    ),
  );
}

/**
 * The lines where x and y BOTH stand alone — a pair a line chains, even unnamed (« 161 − 115 = 46 »). A line that lists
 * more than `most` numbers (the divisors of 360…) is a list, not a pair: it is skipped.
 */
export const pairLines = (text, x, y, most = 6) =>
  text.split('\n').filter((l) => alone(x).test(l) && alone(y).test(l) && (l.match(/\d+/g) ?? []).length <= most);
/** The lines of the bank where x and y stand together (`pairLines`), with their sheet. */
export const linesWithBoth = (bank, x, y) =>
  bank.sheets.flatMap((s) => pairLines(s.text, x, y).map((l) => `${s.file}: ${l.trim()}`));

/** The sheets where n stands alone. */
const sheetsWith = (bank, n) => bank.sheets.filter((s) => alone(n).test(s.text)).map((s) => s.file);

/** Every `world/story.js` of the lessons, but `exceptId`'s: { file, text }. */
export function storiesOf({ exceptId = null } = {}) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name !== 'node_modules') walk(path);
      } else if (name === 'story.js' && dir.endsWith('/world')) out.push(path);
    }
  };
  walk(join(LESSONS, 'moyen'));
  return out
    .filter((file) => !exceptId || !file.includes(`/${exceptId}/world/`))
    .sort()
    .map((file) => ({ file: relative(LESSONS, file), text: readFileSync(file, 'utf8') }));
}

/** The island names a story file declares (`name: '…'`). */
export const islandNamesIn = (text) => [...text.matchAll(/name: '([^']+)'/g)].map((m) => m[1]);

/**
 * Do these numbers collide? For a pair [x, y]: named by the bank, standing on one line of the bank, standing on one line
 * of another lesson's story; for every number ≥ `headline` (100): present anywhere in the bank or in another story.
 * → { pair, named, bankLines, storyLines, numbers: [{ n, sheets, stories }] } — `clear` when all are empty.
 */
export function collisions(bank, nums, { stories = storiesOf({ exceptId: bank.id }), pairs = bankPairs(bank) } = {}) {
  const [x, y] = nums;
  const pair = nums.length === 2;
  const named = pair && pairs.has(keyOf(x, y));
  const bankLines = pair ? linesWithBoth(bank, x, y) : [];
  const storyLines = pair ? stories.flatMap((s) => pairLines(s.text, x, y).map((l) => `${s.file}: ${l.trim()}`)) : [];
  const numbers = nums
    .filter((n) => n >= 100)
    .map((n) => ({
      n,
      sheets: sheetsWith(bank, n),
      stories: stories.filter((s) => alone(n).test(s.text)).map((s) => s.file),
    }));
  const clear =
    !named && !bankLines.length && !storyLines.length && numbers.every((r) => !r.sheets.length && !r.stories.length);
  return { pair: nums, named, bankLines, storyLines, numbers, clear };
}
