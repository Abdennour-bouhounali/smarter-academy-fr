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
const keyOf = (x, y) => [x, y].sort((p, q) => valueOf(p) - valueOf(q)).join(';');
const COMMA_TEXT = /\{,\}|,/;
/** A decimal comma as a bank writes it: « 7,5 », LaTeX « 7{,}5 ». */
const COMMA = String.raw`(?:,|\{,\})`;
/** A fraction as a bank writes it: « 5/6 », `\dfrac{5}{6}`, `\frac{5}{6}`, `\tfrac{5}{6}`. */
const fractionRe = (p, q) =>
  String.raw`(?:(?<![0-9])${p}\s*/\s*${q}|\\[dt]?frac\s*\{\s*${p}\s*\}\s*\{\s*${q}\s*\})(?![0-9])`;
/**
 * A number standing alone in a text (not a piece of a longer number). A whole number keeps its old reading (it still
 * stands in « 0,49 »: the check errs on the side of a collision). A DECIMAL (57.5, or the text « 57,5 ») stands in
 * « 57,5 » or « 57{,}5 » — never in « 157,5 », « 57,55 », nor in a figure's coordinates (« 57.5 », JSON points). A
 * FRACTION « 5/6 » stands as « 5/6 » or `\dfrac{5}{6}`.
 */
export const alone = (n) => {
  const t = String(n).trim().replace(COMMA_TEXT, '.');
  const frac = /^(\d+)\/(\d+)$/.exec(t);
  if (frac) return new RegExp(fractionRe(frac[1], frac[2]));
  const dec = /^(\d+)\.(\d+)$/.exec(t);
  if (dec) return new RegExp(String.raw`(?<![0-9])(?<![0-9]${COMMA})${dec[1]}${COMMA}${dec[2]}(?![0-9])`);
  return new RegExp(`(?<![0-9])${n}(?![0-9])`);
};
/**
 * A number of the authoring kit: a whole number (85), a decimal (57.5, '57,5', '57{,}5') or a fraction ('5/6').
 * → its value as a JS number, to sort and to compare with the headline floor (100) — never to decide an answer.
 */
export function valueOf(n) {
  const t = String(n).trim().replace(COMMA_TEXT, '.');
  const frac = /^(\d+)\/(\d+)$/.exec(t);
  return frac ? Number(frac[1]) / Number(frac[2]) : Number(t);
}
/** A number as a bank writes it: « 85 », « 57,5 », « 5/6 ». */
export const shown = (n) => String(n).trim().replace(COMMA_TEXT, '.').replace('.', ',');

/** The grade folder of a lesson's bank (« 3e »), or null when it has none. */
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
        .map((f) => {
          const text = readFileSync(join(dir, lvl, f), 'utf8');
          return { file: join(lvl, f), level: lvl, text, body: withoutMetadata(text) };
        }),
    );
  return { id, grade, dir, sheets };
}

/**
 * A sheet's text WITHOUT the textbook's bookkeeping of its `"metadata"`: the `"source"` block (« page: 104 », the
 * activity's number) and every field whose value is a bare number (« estimatedMinutes », « points: "03" »). The
 * metadata's WORDS stay (its title is shown on the sheet and names the exercise's numbers). A sheet is pretty-printed
 * JSON: a block ends at the first line indented as it opened. `body` is what is searched for a number; `text` stays
 * whole (the named pairs are read from it, as before).
 */
export function withoutMetadata(text) {
  const lines = text.split('\n');
  const at = lines.findIndex((l) => /^ {2}"metadata": \{\s*$/.test(l));
  const end = at < 0 ? -1 : lines.findIndex((l, i) => i > at && /^ {2}\},?\s*$/.test(l));
  if (end < 0) return text;
  const drop = new Set();
  for (let i = at + 1; i < end; i += 1) {
    const open = /^( +)"source": \{\s*$/.exec(lines[i]);
    if (open) {
      const close = new RegExp(`^${open[1]}\\},?\\s*$`);
      for (; i < end && !close.test(lines[i]); i += 1) drop.add(i);
      drop.add(i);
    } else if (/^\s*"[^"]+": (?:"?\d+"?|null),?\s*$/.test(lines[i])) drop.add(i);
  }
  return lines.filter((_, i) => !drop.has(i)).join('\n');
}

/** What is searched in a sheet: its `body`, or its whole `text` for a bank built by hand (tests, `{ text }` only). */
const bodyOf = (s) => s.body ?? withoutMetadata(s.text);

/** A decimal « 7,5 » / « 7{,}5 », a fraction « \dfrac{5}{6} » / « 5/6 », or a whole number, as written in a text. */
const NUMBER_RE =
  /\\[dt]?frac\s*\{\s*(\d+)\s*\}\s*\{\s*(\d+)\s*\}|(?<![0-9.])(\d+)\s*\/\s*(\d+)(?![0-9.])|(?<![0-9.])(\d+)(?:,|\{,\})(\d+)(?![0-9])|(?<![0-9.,])(\d+)(?![0-9])(?!\.[0-9])/g;
/**
 * Every number the bank WRITES (its body: statements, questions, solutions, figure labels; never the metadata nor a
 * figure's coordinates, nor the sheet's bookkeeping — its ids, its steps « 01 », its answer-format hint): a Map « 57,5 » → the sheets where it stands, the decimals
 * and fractions written as the bank writes them. A whole number that is the piece of a decimal or a fraction is not
 * counted again.
 */
const NOT_WRITTEN = /^\s*"(?:id|lessonCode|code|step|level|difficulty|timeSeconds|answerFormat|maxWidth)":/;
/** A JSON number on its own (a figure's coordinate, `"arrows": 1`): not a number the sheet writes. */
const JSON_NUMBER = /^\s*(?:"[^"]+":\s*)?-?\d+(?:\.\d+)?,?\s*$/;
export function bankNumbers(bank) {
  const out = new Map();
  for (const s of bank.sheets) {
    const written = bodyOf(s)
      .split('\n')
      .filter((l) => !NOT_WRITTEN.test(l) && !JSON_NUMBER.test(l))
      .join('\n');
    for (const m of written.matchAll(NUMBER_RE)) {
      const n = m[1] ? `${m[1]}/${m[2]}` : m[3] ? `${m[3]}/${m[4]}` : m[5] ? `${m[5]},${m[6]}` : m[7];
      if (!out.has(n)) out.set(n, new Set());
      out.get(n).add(s.file);
    }
  }
  return new Map(
    [...out]
      .sort(([p], [q]) => valueOf(p) - valueOf(q) || p.localeCompare(q))
      .map(([n, sheets]) => [n, [...sheets].sort()]),
  );
}

/**
 * The pairs the bank NAMES: « PGCD(a ; b) » however it is written (`\\text{PGCD}(…)`, `\\mathrm{PGCD}(…)`, plain), and
 * « les (deux) nombres (entiers) a et b » (« des », « aux »). A Set of keys « a;b » (smaller first).
 */
const PAIR_RE =
  /PGCD\}?\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|\b(?:les|des|aux)\s+(?:deux\s+)?nombres(?:\s+entiers(?:\s+naturels)?)?\s+(\d+)\s+et\s+(\d+)/g;
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
  bank.sheets.flatMap((s) => pairLines(bodyOf(s), x, y).map((l) => `${s.file}: ${l.trim()}`));

/** The sheets where n stands alone. */
const sheetsWith = (bank, n) => bank.sheets.filter((s) => alone(n).test(bodyOf(s))).map((s) => s.file);

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
  // no lesson folder exists before the first French lesson: no story to compare with
  if (existsSync(join(LESSONS, 'college'))) walk(join(LESSONS, 'college'));
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
    .filter((n) => valueOf(n) >= 100)
    .map((n) => ({
      n,
      sheets: sheetsWith(bank, n),
      stories: stories.filter((s) => alone(n).test(s.text)).map((s) => s.file),
    }));
  const clear =
    !named && !bankLines.length && !storyLines.length && numbers.every((r) => !r.sheets.length && !r.stories.length);
  return { pair: nums, named, bankLines, storyLines, numbers, clear };
}
