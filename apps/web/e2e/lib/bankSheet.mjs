// « brevet blanc » served from the lesson's bank (kit/bankSitting.js): what a walk needs to fill a copy through the SAME
// widgets the student uses — ChoiceInput (a button per choice), TemplateInput (the answer templates: boxes in the shape of the
// answer), IntegerSetInput (a textarea). The subject is read from `window.__sitting.subject` (dev only) to know WHICH sheets
// were drawn; the answer key is always read from the bank ON DISK (`bankOnDisk` + `fromDisk`), never from the page's `q.bank`.
import { readdirSync, readFileSync } from 'node:fs';

/** The answer the bank's key expects for a step (null for a step written on the paper only). */
export const rightOf = (q) =>
  q.paper
    ? null
    : q.answerType === 'choice'
      ? { choiceId: q.bank.choices.find((c) => c.isCorrect).id }
      : { value: String(q.bank.expectedAnswer) };

/**
 * A WRONG answer of the same shape, never partly right: another choice; the expected number plus one (an integer, a
 * decimal's integer part, a fraction's numerator — the denominator kept, so the box of a fraction is complete); for a set,
 * ONE number that is in none of the expected set (its largest plus one).
 */
export const wrongOf = (q) => {
  if (q.paper) return null;
  if (q.answerType === 'choice') return { choiceId: q.bank.choices.find((c) => !c.isCorrect).id };
  if (q.answerType === 'integerSet') {
    const set = (Array.isArray(q.bank.expectedAnswer) ? q.bank.expectedAnswer : String(q.bank.expectedAnswer).match(/-?\d+/g) ?? [0]).map(Number);
    return { value: String(Math.max(...set) + 1) };
  }
  const v = String(q.bank.expectedAnswer);
  let m;
  // one digit stays one digit (a « digit » template offers 0–9 only): 9 → 0
  if (/^\d$/.test(v)) return { value: String((Number(v) + 1) % 10) };
  if ((m = /^(-?\d+)$/.exec(v))) return { value: String(Number(m[1]) + 1) };
  if ((m = /^(-?\d+)\/(\d+)$/.exec(v))) return { value: `${Number(m[1]) + 1}/${m[2]}` };
  if ((m = /^(-?\d+)([.,]\d+)$/.exec(v))) return { value: `${Number(m[1]) + 1}${m[2]}` };
  return { value: '9999' };
};

/** Types an answer into the step's widget on the page shown (`[data-xs-field="<id>"]`). */
export async function fillStep(page, q, v) {
  if (!v) return;
  const field = page.locator(`[data-xs-field="${q.id}"]`);
  if (q.answerType === 'choice') {
    const i = q.bank.choices.findIndex((c) => c.id === v.choiceId);
    await field.locator('button').nth(i).click();
    return;
  }
  if (q.answerType === 'integerSet') {
    await field.locator('textarea').fill(v.value);
    return;
  }
  const kind = await field.locator('[data-template]').first().getAttribute('data-template');
  let value = String(v.value);
  if (kind === 'digit') {
    await field.locator('[role="radio"]').nth(Number(value)).click();
    return;
  }
  if (value.startsWith('-') && (await field.locator('[data-template-sign]').count())) {
    await field.locator('[data-template-sign]').click();
    value = value.slice(1);
  }
  if (kind === 'fraction') {
    const [num, den = ''] = value.split('/');
    await field.locator('[data-template-box="num"]').fill(num);
    if (den) await field.locator('[data-template-box="den"]').fill(den);
    return;
  }
  await field.locator('[data-template-box="value"]').fill(value);
}

/** The points a copy should get: each answered step's points when right, 0 when wrong or blank (no partial planned). */
export const expectedMark = (subject, plan) =>
  subject.exercises
    .flatMap((e) => e.questions)
    .reduce((t, q) => t + (plan[q.id] && JSON.stringify(plan[q.id]) === JSON.stringify(rightOf(q)) ? q.points : 0), 0);

/** The selectors of the page on screen (the others stay mounted, hidden, so a box keeps what was typed). */
export const ON = '.xs-body:not([hidden])';

/** The five levels of « Espace brevet »: the bank's levels, with the names the practice space gives them
 * (`student.json › levelNames`, kit/text.js › BANK.levels). */
const BANK_LEVEL_NAMES = ['Je reprends les bases', 'J’applique', 'Je m’exerce', 'J’approfondis', 'Défi'];

/**
 * The rungs of the exam ladder as the student sees them. A rung writes its minutes and points only once the bank is loaded
 * (kit/Spaces.jsx › ExamLadder): wait for them (a timeout leaves them empty, and the walk's check says so).
 */
export async function readLadder(page) {
  await page
    .waitForFunction(
      () => {
        const r = [...document.querySelectorAll('[data-di-exam-level]')];
        return r.length > 0 && r.every((e) => e.querySelector('small'));
      },
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  return page.locator('[data-di-exam-level]').evaluateAll((els) =>
    els.map((e) => ({
      n: Number(e.dataset.diExamLevel),
      title: e.querySelector('strong')?.textContent.trim() ?? '',
      small: e.querySelector('small')?.textContent ?? '',
      disabled: e.disabled,
    })),
  );
}

/** The steps a sitting draws (kit/bankSitting.js › SITTING_TYPES, as GAME_WORLD.md « Espace brevet » documents it). */
const SITTING_TYPES = ['choice', 'rational', 'integerSet', 'selfCheck'];
/** How many sheets a sitting of each level draws (the documented ladder: 1, 2, 2, 2, 1). */
const SHEETS_PER_LEVEL = [1, 2, 2, 2, 1];
/** « 02,5 » → 2.5: the points as the bank's exam paper writes them. */
const pointsOf = (sheet) => Number(String(sheet.metadata?.exam?.points ?? '').replace(',', '.')) || 0;
/** The sheets of a level the sitting can draw: an exam sheet whose every step is of a type the sitting draws. */
export const sittableOnDisk = (bank, level) =>
  [...bank.values()].filter(
    (s) =>
      s.level === level &&
      Boolean(s.metadata?.exam) &&
      s.questions?.length > 0 &&
      s.questions.every((q) => SITTING_TYPES.includes(q.answerType)),
  );

/**
 * What each rung of the ladder must write, computed HERE from the bank on disk — never the product's own numbers: the
 * level's name, the minutes (`metadata.estimatedMinutes`, 5 when absent) and the points (`metadata.exam.points`) — a range « lo–hi » when the sheets a sitting of
 * that level may draw differ (the k smallest … the k largest, k = the sheets per sitting). Decimals with a comma.
 */
export function ladderFromDisk(bank) {
  const comma = (n) => String(n).replace('.', ',');
  const span = (vals, k, fmt) => {
    if (!vals.length) return null;
    const v = [...vals].sort((a, b) => a - b);
    const sum = (xs) => xs.reduce((t, x) => t + x, 0);
    const lo = k === 1 ? v[0] : sum(v.slice(0, Math.min(k, v.length)));
    const hi = k === 1 ? v.at(-1) : sum(v.slice(-Math.min(k, v.length)));
    return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
  };
  return BANK_LEVEL_NAMES.map((title, i) => {
    const sheets = sittableOnDisk(bank, i + 1);
    const k = SHEETS_PER_LEVEL[i];
    return {
      fromDisk: true,
      n: i + 1,
      title,
      minutes: span(sheets.map((s) => s.metadata?.estimatedMinutes ?? 5), k, String),
      points: span(sheets.map(pointsOf), k, comma),
    };
  });
}

/**
 * Does a rung show its level as the bank ON DISK says (`D` = `ladderFromDisk(bank)[i]`): the practice space's name, the
 * minutes and the points (« 5–8 minutes · 2–2,5 points », « 5 minutes · 1 point »). A level computed by the product itself
 * is refused: the walk would compare the screen with the code that drew it. French agreement, written HERE (never the
 * kit's helper): a range is plural, a single value under 2 is singular; the space between the number and its noun may be
 * a no-break one, so it is matched as any white space.
 */
const shownWith = (shown, [one, many]) => {
  const s = String(shown);
  const v = Number(s.replace(',', '.'));
  const noun = !s.includes('–') && Number.isFinite(v) && Math.abs(v) < 2 ? one : many;
  return new RegExp(`(^|[^0-9,])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s${noun}(?![a-z])`);
};
export const rungShows = (r, D, i) =>
  D?.fromDisk === true &&
  r.title === BANK_LEVEL_NAMES[i] &&
  r.title === D.title &&
  D.points != null &&
  D.minutes != null &&
  shownWith(D.minutes, ['minute', 'minutes']).test(r.small) &&
  shownWith(D.points, ['point', 'points']).test(r.small);

const BANK_ROOT = new URL('../../../../content/practice/', import.meta.url);

/**
 * The lesson's bank AS IT IS ON DISK (`content/practice/<grade>/<lesson>/level-N/*.json`): every sheet of its five levels,
 * by id. A walk reads its answer key HERE — the bank's own data, never the page's — and types it through the widgets.
 */
export function bankOnDisk(grade, lesson) {
  const sheets = new Map();
  for (let n = 1; n <= 5; n++) {
    const dir = new URL(`${grade}/${lesson}/level-${n}/`, BANK_ROOT);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const sheet = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
      sheets.set(sheet.id, sheet);
    }
  }
  return sheets;
}

/** A step of the subject with its bank question taken from the disk (`sheet` = the disk sheet of its exercise). */
export const fromDisk = (q, sheet) => ({ ...q, bank: sheet.questions.find((x) => x.id === q.qid) });

/**
 * The words and numbers of OTHER lessons that this lesson's bank WRITES itself (a word such as « diviseurs communs », 96 …): the bank is
 * served as it is, so on a screen that SHOWS the bank's text (a sheet read, sat, handed back) they are its own text — pass
 * the result as `shot(…, { allow })` on those screens ONLY. Every other screen (the ladder, a promotion, « Ma progression »…) is
 * checked against the whole list. `metadata.source` is left out: it is never shown.
 */
export function bankWrites(bank, { words = [], numbers = [] }) {
  const text = [...bank.values()]
    .map((s) => JSON.stringify({ ...s, metadata: { ...s.metadata, source: undefined } }))
    .join('\n');
  return {
    words: words.filter((x) => text.includes(x)),
    numbers: numbers.filter((k) => new RegExp(`(^|[^0-9])${k}([^0-9]|$)`).test(text)),
  };
}
