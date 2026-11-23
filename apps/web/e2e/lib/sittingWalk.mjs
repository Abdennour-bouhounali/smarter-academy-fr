// « Espace brevet » of a v2 lesson, walked from the lesson's EXERCISE BANK AS IT IS ON DISK (content/practice/<grade>/<id>/).
// What every lesson's sitting walk shares (gameworld-<lesson>-sitting.mjs, and the pilot's gameworld-sitting.mjs):
//
//   levelFive   « Ma progression » before; ONE sitting of level 5 answered right from its first step to its copy handed back; what the
//               hand-in posts; the model copy, the notebook, the champion's promotion; « Ma progression » after (readiness computed
//               HERE from the copy), and a reload keeps it.
//   copies      four copies, each asserted by what the screen says: a BLANK copy handed in (level 1), a WRONG copy (level 2:
//               every step wrong — « Guide-moi » never gives the answer, « Explique-moi » shows the bank's real correction, the
//               notebook names the rules, the retry screen), a copy QUIT half-way (the similar sheet: nothing counted, nothing
//               sent), a RIGHT copy (level 3: full marks, three stars); then « Ma progression »'s readiness from these copies.
//   everySheet  EVERY sheet of EVERY level of the bank: opened through the ladder (the DEV hook `localStorage['di.dev.sheet']`
//               makes the sitting draw that sheet), its statement and every step checked against the disk (words, formulas
//               drawn, the table, its money in euros), its answer boxes in their shape, each screen through `shot` (nothing scrolls or is
//               cut, 12 px, no raw formula), then « Quitter » — or, for an answer sheet shown in LEAVES (too long for its
//               box), every leaf looked at, every answer typed on its leaf, and the copy handed in (`everyLeaf`).
//               No story is played: the save opens the five levels at once.
//               About 3 s a sheet: ~2.5–3 min for the 50 sheets of a lesson at one size.
//
// The answer key is always the bank's on disk (`fromDisk`), the points are shared HERE from `metadata.exam.points` (quarter
// points, as GAME_WORLD.md documents), never read from the page. `E2E_PARTS=five,copies,sheets` runs a part only (a debugging
// aid: a run that skips a part prints it, and is not a full run).
import { rightOf, wrongOf, fillStep, ON, bankOnDisk, fromDisk, bankWrites, sittableOnDisk } from './bankSheet.mjs';
import { createWalk, PHONE } from './walk.mjs';

export const NB = ' / ';
export const SHEET_OUT = { exit: ['[data-xs-quit]', '[data-xs-close]'] };
const fmt = (n) => String(n).replace('.', ',');
/** Two answers the same — a decimal compared as the same number, comma or point (the screen sends « 7,2 », the bank writes 7.2: defects.md C18). */
/** A decomposition as the walk reads it — « 2^{2}\\times3^2 », « 2^2*3^2 » → « 2^2.3^2 » (its powers, in order), or null. */
const decompOf = (v) => {
  const t = String(v ?? '')
    .replace(/\\times|×|\*/g, '*')
    .replace(/[{}\s]/g, '');
  if (!/^\d+(\^\d+)?(\*\d+(\^\d+)?)*$/.test(t) || !t.includes('*')) return null;
  return t
    .split('*')
    .map((f) => (f.includes('^') ? f : `${f}^1`))
    .join('.');
};
/**
 * The answer sent is the one planned: as the same JSON (a decimal point or comma alike), or — a decomposition typed in
 * MathLive sends its LaTeX « 2^2\\times3^2 » for the bank's « 2^2*3^2 » — as the same product of powers (C18: compare what
 * the answer IS, never its spelling).
 */
const sameAnswer = (a, b) =>
  JSON.stringify(a)?.replace(/\./g, ',') === JSON.stringify(b)?.replace(/\./g, ',') ||
  // a MathLive field sends its LaTeX beside its value ({ value, latex }): the value is what he wrote
  (a?.latex != null && String(a.value) === String(b?.value)) ||
  (decompOf(a?.value) != null && decompOf(a?.value) === decompOf(b?.value));
/** The words of a sentence outside its formulas (`$…$`): what must be read on screen as it is written. */
export const words = (t) =>
  String(t ?? '')
    .split(/\$[^$]*\$/)
    .map((x) => x.replace(/\s+/g, ' ').trim())
    .filter((x) => x.length > 2);
/**
 * A string of the bank as the screen must show it (GAME_WORLD.md, kit/bankSitting.js — the rules, written again here):
 *   money is the bank's own, in euros, shown as the bank writes it (the Algerian rewrite of « DA » left with the dinar);
 *   a « PGCD(a ; b) » (« = n » with it) written in the words is drawn as a formula (it reads left to right, upright).
 */
const PGCD_IN_WORDS = /(?<![A-Za-z\\])(PGCD|PPCM)\s*\(([^()$]*)\)((?:\s*=\s*\d+)?)/g;
const pgcdDrawn = (t) =>
  t
    .split(/(\$[^$]*\$)/)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(PGCD_IN_WORDS, (_, f, args, eq) => `$\\mathrm{${f}}(${args.trim()})${eq.replace(/\s+/g, ' ')}$`),
    )
    .join('');
const asShown = (t) => pgcdDrawn(String(t ?? ''));
const formulasIn = (t) => (String(t ?? '').match(/\$[^$]+\$/g) ?? []).length;
/** A result of the bank that is WORDS (« oui », « Le pont tient »), not a formula: three letters or more, no LaTeX command. */
const RESULT_WORDS = /(?<![\\A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ]{3,}/;
/** Money is in euros: « DA » (a dinar), glued to a number or not, is never on screen. */
const DA_ON_SCREEN = /(?<![A-Za-z])DA(?![A-Za-z])/;

// ───────────────────────────── the rules of a sitting, as GAME_WORLD.md documents them ─────────────────────────────
export const PASS = 0.8;
/** Stars: none under 80 %; 1; 2 from 90 %; 3 for a full paper. */
export const starsFor = (m, total) => (m >= total ? 3 : m >= total * 0.9 ? 2 : m >= total * PASS ? 1 : 0);
/** The appreciation written on the copy. */
export const appreciationFor = (m, total) =>
  m >= total * 0.9
    ? 'Excellent'
    : m >= total * 0.7
      ? 'Bien'
      : m >= total * 0.5
        ? 'Assez bien\u00a0: revois tes erreurs'
        : 'À retravailler\u00a0: ne lâche rien';
/** « Pas encore d’essai » on a row of « Ma progression » (kit/text.js › TX.progress.noTry), either apostrophe. */
const NO_TRY = /Pas encore d[’']essai/;
/** « Prêt pour le brevet »: half the ladder (levels passed of five), half the first tries on paper once there are four. */
export const readinessFor = (passed, ok, n) => Math.round(100 * (0.5 * (passed / 5) + 0.5 * (n >= 4 ? ok / n : 0)));
/** « Montrer que » steps are written on paper: no points. A sheet's points are shared between its typed steps in quarters. */
export function diskPoints(sheet) {
  const typed = sheet.questions.filter((q) => q.answerType !== 'selfCheck');
  const total = typed.length ? Number(String(sheet.metadata?.exam?.points ?? '').replace(',', '.')) || 0 : 0;
  const quarters = Math.round(total * 4);
  const base = typed.length ? Math.floor(quarters / typed.length) : 0;
  let t = 0;
  return sheet.questions.map((q) =>
    q.answerType === 'selfCheck' ? 0 : (base + (t++ < quarters - base * typed.length ? 1 : 0)) / 4,
  );
}
/** The steps of a drawn subject, each with its bank question and its points taken from the DISK. */
export function stepsOf(subject, bank) {
  return subject.exercises.flatMap((e) => {
    const sheet = bank.get(e.bankId);
    const pts = sheet ? diskPoints(sheet) : [];
    return e.questions.map((q) => {
      const d = fromDisk(q, sheet ?? { questions: [] });
      return {
        ...d,
        exercise: e,
        sheet,
        diskPoints: pts[sheet ? sheet.questions.findIndex((x) => x.id === q.qid) : -1] ?? 0,
      };
    });
  });
}
/** The mark a copy must get: each step's disk points when its answer is the key, 0 otherwise. */
export const markOf = (steps, plan) =>
  steps.reduce(
    (t, q) =>
      t + (!q.paper && plan[q.id] && JSON.stringify(plan[q.id]) === JSON.stringify(rightOf(q)) ? q.diskPoints : 0),
    0,
  );
export const totalOf = (steps) => steps.reduce((t, q) => t + q.diskPoints, 0);

// ───────────────────────────── reading a sheet on the screen ─────────────────────────────
/** What the paper must show of a disk sheet: its words, how many formulas, its table, its steps. */
function onPaper(sheet) {
  const st = sheet.statement ?? {};
  const texts = [
    ...String(st.content ?? '').split('\n\n'),
    ...sheet.questions.flatMap((q) => [q.lead ?? '', q.statement ?? '']),
  ];
  const cells = st.table ? [...st.table.head, ...st.table.rows.flat()].map(String) : [];
  return {
    words: texts.map(asShown).flatMap(words),
    formulas:
      texts.reduce((t, x) => t + formulasIn(x), 0) +
      (st.formulas?.length ?? 0) +
      cells.reduce((t, x) => t + formulasIn(x), 0),
    table: st.table ? { head: st.table.head.length, rows: st.table.rows.length } : null,
    steps: sheet.questions.length,
  };
}

/** The visible box `sel` read as the student sees it: its text (no MathML), its plain text, its formulas, its table. */
const readBox = (page, sel) =>
  page.evaluate((sel) => {
    const box = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length > 0);
    if (!box) return null;
    let text = '';
    let plain = '';
    const tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      const p = t.parentElement;
      if (!p || p.closest('.katex-mathml')) continue;
      text += t.nodeValue;
      if (!p.closest('.katex')) plain += `${t.nodeValue} `;
    }
    const tb = box.querySelector('[data-problem-table] table');
    // the bidi isolates MathText puts around an equality written in the words (utils/bidi.js › isolateMathRuns: « largeur ×
    // 14 = 56 ») are invisible: they are not part of what the student reads, and a bank sentence is compared without them
    const bare = (x) => x.replace(/[\u2066-\u2069\u200e\u200f]/g, '').replace(/\s+/g, ' ');
    return {
      text: bare(text),
      plain: bare(plain),
      katex: box.querySelectorAll('.katex').length,
      errors: box.querySelectorAll('.katex-error').length,
      table: tb ? { head: tb.querySelectorAll('thead th').length, rows: tb.querySelectorAll('tbody tr').length } : null,
      steps: box.querySelectorAll(':scope > ol > li').length,
    };
  }, sel);

/** The sheet `sheet` on the paper inside `scope`: every word of the disk, its formulas drawn, its table, no « DA », its steps. */
export async function checkPaper(w, page, scope, sheet, where) {
  const want = onPaper(sheet);
  const got = await readBox(page, `${scope} .xs-ex[data-xs-bank="${sheet.id}"]`);
  if (!w.check(Boolean(got), `${where}: the sheet ${sheet.id} is on the paper`)) return;
  const missing = want.words.filter((t) => !got.text.includes(t));
  w.check(
    missing.length === 0,
    `${where}: every sentence of the bank is on the paper, word for word${missing.length ? ' — missing: ' + missing.slice(0, 4).join(' | ') : ''}`,
  );
  w.check(
    got.katex >= want.formulas && got.errors === 0,
    `${where}: its ${want.formulas} formula(s) drawn (${got.katex} on screen, ${got.errors} error)`,
  );
  w.check(!/\$|\\[a-zA-Z]{2,}/.test(got.plain), `${where}: no raw formula on the paper`);
  w.check(!DA_ON_SCREEN.test(got.plain), `${where}: money in euros as the bank writes it, never « DA » (glued to a number included)`);
  w.check(
    JSON.stringify(got.table) === JSON.stringify(want.table),
    `${where}: ${want.table ? `its table (${want.table.head} columns, ${want.table.rows} rows)` : 'no table'} — on screen ${JSON.stringify(got.table)}`,
  );
  w.check(got.steps === want.steps, `${where}: its ${want.steps} steps numbered (${got.steps})`);
}

/** The answer sheet of exercise `e` on screen: each step's box in the shape of its answer type, a choice's words as written. */
export async function checkFields(w, page, steps, where) {
  for (const q of steps) {
    if (q.paper) {
      w.check(
        (await page.locator(`${ON} [data-xs-paper-only="${q.id}"]`).count()) === 1,
        `${where} ${q.qid}: a « Montrer que » step is written on the paper only — no box`,
      );
      continue;
    }
    // a decomposition's field is MathLive, a chunk of its own loaded with the first sheet: wait for it (its placeholder
    // line stands in its place until then — lazy.jsx)
    if (q.answerType === 'factorization')
      await page.waitForSelector(`[data-xs-field="${q.id}"] math-field`, { timeout: 20000 }).catch(() => {});
    const f = await page.evaluate((id) => {
      const el = document.querySelector(`[data-xs-field="${id}"]`);
      if (!el) return null;
      let text = '';
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let t = tw.nextNode(); t; t = tw.nextNode())
        if (!t.parentElement.closest('.katex-mathml')) text += t.nodeValue;
      return {
        template: el.querySelector('[data-template]')?.dataset.template ?? null,
        // a decomposition: its own field (MathLive, the exponents raised) and its pad
        factorization: Boolean(el.querySelector('[data-factorization-answer] math-field')),
        buttons: el.querySelectorAll('button').length,
        area: Boolean(el.querySelector('textarea')),
        // read as SEEN (C11): white space as one space, and no bidi isolate (U+2066–U+2069) — `utils/bidi.js` still
        // wraps « N / d » in invisible LTR marks inside a French sentence (an Algerian leftover, reported)
        text: text.replace(/[\u2066-\u2069]/g, '').replace(/\s+/g, ' '),
      };
    }, q.id);
    const shape = !f
      ? false
      : q.answerType === 'choice'
        ? f.buttons === q.bank.choices.length
        : q.answerType === 'integerSet'
          ? f.area
          : q.answerType === 'factorization'
            ? f.factorization
            : Boolean(f.template);
    w.check(
      shape,
      `${where} ${q.qid} (${q.answerType}): answered in its own shape (${JSON.stringify(f && { ...f, text: undefined })})`,
    );
    if (f && q.answerType === 'choice') {
      const missing = q.bank.choices.flatMap((c) => words(asShown(c.content))).filter((t) => !f.text.includes(t));
      w.check(
        missing.length === 0 && !DA_ON_SCREEN.test(f.text),
        `${where} ${q.qid}: its choices read as the bank writes them, never « DA »${missing.length ? ' — missing: ' + missing.join(' | ') : ''}`,
      );
    }
  }
}

// ───────────────────────────── moving through the world ─────────────────────────────
/** From the title screen to « Espace brevet ». */
export async function toLadder(page) {
  await page.click('[data-di-map]');
  await page.waitForSelector('[data-di-space="exam"]');
  await page.click('[data-di-space="exam"]');
  await page.waitForSelector('[data-di-ladder="open"]');
}
/**
 * Opens a sitting of `level` from the ladder, the DEV hook asking for the sheet `id` (null: the sitting draws as it does
 * for a student). Returns the subject the page drew (to know WHICH sheets — never to read their key).
 */
export async function openSitting(page, level, id = null) {
  await page.evaluate((x) => {
    window.__sitting = null;
    if (x) localStorage.setItem('di.dev.sheet', x);
    else localStorage.removeItem('di.dev.sheet');
  }, id);
  await page.click(`[data-di-exam-level="${level}"]`);
  await page.waitForSelector('[data-xs="read"]', { timeout: 20000 });
  await page.waitForFunction(() => window.__sitting?.subject, null, { timeout: 10000 });
  await page.waitForTimeout(250);
  return page.evaluate(() => window.__sitting.subject);
}
/** « Quitter » → « Oui, je quitte »: back on the ladder. */
export async function quitSitting(page) {
  await page.click('[data-xs-quit]');
  await page.waitForSelector('[data-xs-quit-box]');
  await page.click('[data-xs-quit-yes]');
  await page.waitForSelector('[data-di-ladder="open"]');
}
// ───────────────────────────── an answer sheet in leaves (kit/ExamSittingLeaves.jsx) ─────────────────────────────
/** The answer sheet on screen: how many leaves, the one shown, and the leaf of each step (by its sitting id). */
export const leavesOnScreen = (page) =>
  page.evaluate((on) => {
    const col = document.querySelector(`${on} [data-xs-leaves]`);
    if (!col) return null;
    const at = {};
    for (const li of col.querySelectorAll('li[data-xs-leaf]')) {
      const f = li.querySelector('[data-xs-field], [data-xs-paper-only]');
      if (f) at[f.dataset.xsField ?? f.dataset.xsPaperOnly] = Number(li.dataset.xsLeaf);
    }
    return {
      n: Number(col.dataset.xsLeaves),
      on: Number(col.dataset.xsLeafOn),
      count: col.querySelector('[data-xs-leaf-count]')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
      at,
    };
  }, ON);
/** Turns the answer sheet on screen to leaf `l`, with its « Suivante » / « Précédente » — as the student does. */
export async function turnTo(page, l) {
  for (let k = 0; k < 12; k += 1) {
    const s = await leavesOnScreen(page);
    if (!s || s.on === l) return;
    await page.click(`${ON} ${s.on < l ? '[data-xs-leaf-next]' : '[data-xs-leaf-prev]'}`);
    await page.waitForTimeout(120);
  }
}
/** Types step `q` (bankSheet › fillStep) after turning to the leaf that holds it. */
export async function typeStep(page, q, v) {
  if (!v) return;
  const s = await leavesOnScreen(page);
  if (s && s.at[q.id] !== undefined) await turnTo(page, s.at[q.id]);
  await fillStep(page, q, v);
}
/** The fit box of the answer sheet on screen at its leaf: it holds its content (not cut), its scale. */
const sheetBox = (page) =>
  page.evaluate((on) => {
    const box = document.querySelector(`${on} [data-xs-leaves] > [data-di-fitbox]`);
    const o = box.getBoundingClientRect();
    const i = box.firstElementChild.getBoundingClientRect();
    return { have: Math.round(o.height), need: Math.round(i.height), z: box.dataset.diFitz };
  }, ON);

const practicePosts = (page) =>
  page.evaluate(() => (window.__api ?? []).filter((x) => x.method === 'POST' && x.url.includes('/practice/')));
const bodyOf = (p) => (typeof p?.body === 'string' ? JSON.parse(p.body) : p?.body);
const examState = (page) => page.evaluate(() => window.__world.getState().exam);
const short = (id) => id.replace(/^ex-[^-]+-/, '').replace(/-(l\d-\d{3})$/, '·$1');

/**
 * A save with the lesson played and the five levels passed: the ladder is open at every level. `stage`: the lesson's
 * last island (lesson 8 has eight, 0–7: the stage 8 the walk wrote for every lesson crashed its world, 2026-11-20).
 */
const openSave = (keys, stage = 8) => {
  const one = { stars: 3, mark: 1, total: 1 };
  return {
    v: 1,
    stage,
    stars: {},
    gems: [],
    keys,
    keysEver: keys,
    falls: 0,
    flags: {},
    finished: true,
    practice: Object.fromEntries(keys.map((k) => [`${k}:1`, { stars: 2, best: 800 }])),
    exam: { best: { 1: one, 2: one, 3: one, 4: one, 5: one }, fails: {}, weak: {}, sittings: 5 },
  };
};

/** Fills every step of the subject on screen with `plan` (page by page). */
async function fill(page, subject, steps, plan) {
  for (const [i, e] of subject.exercises.entries()) {
    await page.click(`[data-xs-page="${i}"]`);
    await page.waitForTimeout(150);
    for (const q of steps.filter((x) => x.exercise.id === e.id)) await typeStep(page, q, plan[q.id]);
  }
}
/**
 * Hands the copy in and waits for it to come back. Every copy handed in here has no sheet left untouched off screen (one
 * sheet, or every sheet filled), so the hand-in is asked for confirmation at once — the « forgotten sheet » reminder
 * (sitting.js › forgotten) is walked by the pilot's walk.
 */
async function handIn(page) {
  await page.click('[data-xs-hand]');
  await page.waitForSelector('[data-xs-hand-yes]', { timeout: 5000 });
  await page.click('[data-xs-hand-yes]');
  await page.waitForSelector('[data-xs="back"]');
  await page.waitForTimeout(500);
}

// ───────────────────────────── « Guide-moi » and « Explique-moi » ─────────────────────────────
/** The numbers written anywhere in the sheet (its statement, its table, every step): a hint may repeat them. */
const numbersOfSheet = (sheet) => {
  const st = sheet.statement ?? {};
  const all = [
    st.content,
    ...(st.formulas ?? []),
    ...(st.table ? [...st.table.head, ...st.table.rows.flat()] : []),
    ...sheet.questions.flatMap((x) => [x.lead, x.statement]),
  ].join(' ');
  return new Set(all.match(/\d+(?:[.,]\d+)?/g) ?? []);
};
/** What of the answer a « Guide-moi » text would give away: a number of the answer the sheet itself never writes, the right choice's words. */
export function leaksOf(guideText, q) {
  const seen = numbersOfSheet(q.sheet);
  const inGuide = new Set(guideText.match(/\d+(?:[.,]\d+)?/g) ?? []);
  const out = [];
  if (q.answerType === 'rational' || q.answerType === 'integerSet') {
    const nums =
      String(Array.isArray(q.bank.expectedAnswer) ? q.bank.expectedAnswer.join(' ') : q.bank.expectedAnswer).match(
        /\d+(?:[.,]\d+)?/g,
      ) ?? [];
    // 0 and 1 are said in any hint about divisors (« 1 divise tout nombre »): they give nothing away
    const own = nums.filter((n) => !seen.has(n) && n !== '0' && n !== '1');
    // a set is given away when every one of its numbers the sheet does not write is in the hint
    if (
      q.answerType === 'integerSet'
        ? own.length > 0 && own.every((n) => inGuide.has(n))
        : own.some((n) => inGuide.has(n))
    )
      out.push(own.join(', '));
  }
  if (q.answerType === 'choice') {
    const right = asShown(q.bank.choices.find((c) => c.isCorrect).content);
    const nums = (right.match(/\d+(?:[.,]\d+)?/g) ?? []).filter((n) => !seen.has(n) && n !== '0' && n !== '1');
    if (nums.some((n) => inGuide.has(n))) out.push(right);
    const plain = right
      .replace(/\$[^$]*\$/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (plain.length >= 6 && guideText.includes(plain)) out.push(right);
  }
  // the model copy's conclusion is the answer written out
  const last = (q.bank.solution?.lines ?? []).at(-1);
  for (const t of words(asShown(last))) if (t.length >= 25 && guideText.includes(t)) out.push(`« ${t} »`);
  return out;
}
/** « Explique-moi » is the bank's real correction: every line of its solution, word for word, its formulas drawn, its result. */
export async function checkExplain(w, page, q, where) {
  const lines = (q.bank.solution?.lines ?? []).map(asShown);
  const result = q.bank.solution?.result ?? null;
  const got = await readBox(page, '[data-xs-help="explain"]');
  if (!w.check(Boolean(got), `${where}: « Explique-moi » opens the model copy`)) return;
  const missing = lines.flatMap(words).filter((t) => !got.text.includes(t));
  const resultFormula = result && !(RESULT_WORDS.test(result) && !/\\text\{/.test(result)) ? 1 : 0;
  const want = lines.reduce((t, x) => t + formulasIn(x), 0) + resultFormula;
  const resultText = result && !resultFormula ? asShown(result).trim() : null;
  w.check(
    lines.length > 0 &&
      missing.length === 0 &&
      got.katex >= want &&
      got.errors === 0 &&
      (!resultText || got.text.includes(resultText)) &&
      !DA_ON_SCREEN.test(got.plain),
    `${where}: « Explique-moi » shows the bank's model solution — its ${lines.length} line(s) word for word, ${want} formula(s) drawn (${got.katex}), its result${resultText ? ` « ${resultText} »` : ''}${missing.length ? ' — missing: ' + missing.slice(0, 3).join(' | ') : ''}`,
  );
}
/** « Guide-moi »: the bank's hints (or, with none, the rule) and « Refais cette question sur ta copie » — never the answer. */
export async function checkGuide(w, page, q, where) {
  const got = await readBox(page, '[data-xs-help="guide"]');
  if (!w.check(Boolean(got), `${where}: « Guide-moi » opens`)) return;
  const hints = (q.bank.hints ?? []).map((h) => asShown(h.content));
  const missing = hints.flatMap(words).filter((t) => !got.text.includes(t));
  const leaks = leaksOf(got.text, q);
  w.check(
    // kit/text.js › EXAM.redo
    got.text.includes('Refais cette question') && missing.length === 0,
    `${where}: « Guide-moi » gives the bank's ${hints.length} hint(s) and sends back to the paper${missing.length ? ' — missing: ' + missing.join(' | ') : ''}`,
  );
  w.check(
    leaks.length === 0,
    `${where}: « Guide-moi » does not give the answer${leaks.length ? ' — it shows ' + leaks.join(' | ') : ''}`,
  );
}

// ───────────────────────────── the parts ─────────────────────────────
/** « Ma progression » read: the road's exam station, the readiness, the next thing, the rows per savoir-faire. */
const progress = (page) =>
  page.evaluate(() => ({
    exam: document.querySelector('[data-di-road-step="exam"] b')?.textContent ?? '',
    ready: Number(document.querySelector('[data-di-ready]')?.dataset.diReady),
    next: document.querySelector('[data-di-next-step]')?.dataset.diNextStep,
    rows: Object.fromEntries(
      [...document.querySelectorAll('[data-di-prow]')].map((r) => [r.dataset.diProw, r.textContent]),
    ),
  }));

/** The first sheet of a level on disk (by id) that the sitting can draw: the walk's choice, made from the disk alone. */
export const firstSheet = (bank, level, pick = () => true) =>
  sittableOnDisk(bank, level)
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .find(pick) ?? sittableOnDisk(bank, level)[0];
/** A sheet whose typed number step has hints and an answer the sheet never writes: « Guide-moi » can be tested on it. */
export const guideTestable = (s) =>
  s.questions.some(
    (q) =>
      q.answerType === 'rational' &&
      (q.hints ?? []).length &&
      (String(q.expectedAnswer).match(/\d+/g) ?? []).some((n) => !numbersOfSheet(s).has(n)),
  );

/** The level-5 sitting answered right, with « Ma progression » before and after (four levels passed in the save). */
export async function levelFive(w, { uid, id, grade, url, keys, bank, allow, stage }) {
  const { expect, shot } = w;
  const one = (m) => ({ stars: 3, mark: m, total: m });
  const save = {
    ...openSave(keys, stage),
    exam: { best: { 1: one(1), 2: one(1), 3: one(1), 4: one(1) }, fails: {}, weak: {}, sittings: 4 },
  };
  const { page, ctx } = await w.student({
    uid,
    lessonId: id,
    url,
    grade,
    seed: { [`u_${uid}_smarter_world_${id}`]: save },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });

  // « Ma progression » BEFORE: four levels of five, no first try yet → readiness = ½ × 4/5
  await page.click('[data-di-progress-open]');
  await page.waitForSelector('[data-di-progress]');
  await page.waitForTimeout(400);
  const before = await progress(page);
  expect(
    before.exam === `4${NB}5` &&
      before.next === 'exam' &&
      (await page.textContent('[data-di-next-step]')).includes('5'),
    `« Ma progression » before: four exam levels of five passed, the next thing « passe le palier 5 du brevet » (exam=${JSON.stringify(before.exam)} next=${before.next})`,
  );
  expect(
    before.ready === readinessFor(4, 0, 0),
    `the readiness before is ½ × 4/5 = ${readinessFor(4, 0, 0)}% (shown ${before.ready}%)`,
  );
  expect(
    // kit/text.js › TX.progress.noTry
    Object.keys(before.rows).join() === keys.join() && keys.every((k) => NO_TRY.test(before.rows[k])),
    'no answer given as in an exam yet: each savoir-faire says « Pas encore d’essai »',
  );
  await shot(page, 'progress-before', { exit: ['[data-di-progress-close]'], sound: true, numbers: true });
  await page.click('[data-di-progress-close]');
  await page.waitForSelector('[data-di-start]');

  await toLadder(page);
  expect(
    (await page.locator('.di-rungs li.is-passed').count()) === 4 &&
      (await page.locator('.di-rungs li.is-next [data-di-exam-level="5"]').count()) === 1,
    '« Espace brevet »: four levels passed, level 5 lit',
  );
  await shot(page, 'ladder', { exit: ['[data-di-map-close]'], numbers: true });
  const S = firstSheet(bank, 5);
  const subject = await openSitting(page, 5, S.id);
  expect(
    subject.level === 5 &&
      subject.exercises.length === 1 &&
      subject.exercises[0].bankId === S.id &&
      // kit/bankSitting.js: a sheet whose exam heading names a « problème » is titled « Problème » (kit/text.js ›
      // BANK.problem), any other « Exercice 1 » — read from the sheet ON DISK (the Algerian level 5 was always a « Problème »;
      // the first French bank heads its level 5 « Exercice »)
      subject.exercises[0].title === (/probl[eè]me/i.test(S.metadata?.exam?.heading ?? '') ? 'Problème' : 'Exercice 1'),
    `level 5: ONE sheet, the one the walk asked for, titled as its heading says (${S.id}, heading « ${S.metadata?.exam?.heading} »; drawn ${subject.exercises.map((e) => `${e.bankId} « ${e.title} »`).join(', ')})`,
  );
  const steps = stepsOf(subject, bank);
  expect(
    steps.every(
      (q) =>
        JSON.stringify(q.bank) ===
        JSON.stringify(subject.exercises.flatMap((e) => e.questions).find((x) => x.id === q.id).bank),
    ) && steps.length === S.questions.length,
    `the sheet served is the bank's file as it is on disk (${S.questions.length} steps, their keys unchanged)`,
  );
  expect(
    (await page.locator('.xs-root input, .xs-root textarea, [data-xs-field]').count()) === 0,
    'reading time: the sheet is on the paper, and no answer box exists yet',
  );
  await checkPaper(w, page, '.xs-paper', S, 'read');
  expect(
    await page.evaluate(() => window.__world.getState().paper === true),
    'the sitting is silent: paper mode, no music',
  );
  await shot(page, 'read', { ...SHEET_OUT, allow }); // silent by design (« Sans musique »): no sound button is asked of it
  await page.click('[data-xs-start]');
  await page.waitForSelector('[data-xs="sit"]');

  const typed = steps.filter((q) => !q.paper);
  const plan = Object.fromEntries(typed.map((q) => [q.id, rightOf(q)]));
  await page.click('[data-xs-page="0"]');
  await checkFields(w, page, steps, 'sit');
  for (const q of typed) await typeStep(page, q, plan[q.id]);
  {
    // a sheet in leaves: every leaf is a screen of its own, looked at like the others
    const s = await leavesOnScreen(page);
    for (let l = 0; s && l < s.n; l += 1) {
      await turnTo(page, l);
      await shot(page, s.n > 1 ? `sit-1-leaf${l + 1}` : 'sit-1', { ...SHEET_OUT, allow });
    }
  }
  expect(
    (await page.locator('.xs-pen, .xs-total, .xs-red, [data-xs-mark]').count()) === 0,
    'during the sitting there is NO verdict of any kind',
  );
  expect(
    (await practicePosts(page)).length === 0 && (await page.evaluate(() => window.__posts ?? [])).length === 0,
    'nothing is sent before the paper is handed in',
  );
  await page.click('[data-xs-hand]');
  await page.waitForSelector('[data-xs-hand-yes]');
  await shot(page, 'confirm', { ...SHEET_OUT, allow });
  await page.click('[data-xs-hand-yes]');
  await page.waitForSelector('[data-xs="back"]');
  await page.waitForTimeout(600);

  const want = totalOf(steps);
  const total = Number(await page.getAttribute('[data-xs-total]', 'data-xs-total'));
  expect(
    want > 0 && total === want && markOf(steps, plan) === want,
    `a full paper: ${total} / ${want} (the points of ${S.id} on disk)`,
  );
  expect(
    (await page.textContent('[data-xs-appreciation]')).trim() === appreciationFor(want, want),
    `the copy reads « ${appreciationFor(want, want)} »`,
  );
  expect(
    (await page.locator('[data-xs-row]').evaluateAll((els) => els.map((e) => e.dataset.xsMark))).join() ===
      steps.map((q) => (q.paper ? 'paper' : 'ok')).join(),
    'every typed step carries its red tick (a step on paper: ✎)',
  );
  {
    const posts = await practicePosts(page);
    const path = (p) => p.url.split('?')[0];
    const answers = posts.filter((p) => /\/answers$/.test(path(p)));
    const sessions = posts.filter((p) => /\/practice\/sessions$/.test(path(p)) && p.url.includes(`/lessons/${id}/`));
    expect(
      sessions.length === 1 && bodyOf(sessions[0])?.sessionId?.length === 36 && bodyOf(sessions[0])?.level === 5,
      `the hand-in opens ONE practice session at level 5: POST /lessons/${id}/practice/sessions`,
    );
    const opened = posts.filter((p) => /\/questions$/.test(path(p))).map(bodyOf);
    expect(
      opened.length === typed.length &&
        typed.every((q, k) => opened[k]?.questionId === q.qid && opened[k]?.exerciseId === S.id),
      `one question attempt per typed step, named by the bank's ids (× ${typed.length})`,
    );
    expect(
      answers.length === typed.length &&
        typed.every((q, k) => {
          const b = bodyOf(answers[k]);
          return (
            b?.attemptUuid?.length === 36 &&
            sameAnswer(b.answer, plan[q.id]) &&
            b.outcome === 'correct'
          );
        }),
      `one answer per typed step (${answers.length} of ${typed.length}): the raw answer, its own attempt, the browser's guess only as a prediction${(() => {
        const k = typed.findIndex((q, i) => {
          const b = bodyOf(answers[i]);
          return !(b?.attemptUuid?.length === 36 && sameAnswer(b.answer, plan[q.id]) && b.outcome === 'correct');
        });
        return k < 0 ? '' : ` — step ${typed[k].id}: sent ${JSON.stringify(bodyOf(answers[k]))?.slice(0, 200)}, planned ${JSON.stringify(plan[typed[k].id])}`;
      })()}`,
    );
    expect(
      posts.some((p) => /\/exercise-completions$/.test(path(p))) && posts.some((p) => /\/complete$/.test(path(p))),
      'the sheet and the session are closed: POST …/exercise-completions, then …/complete',
    );
    expect((await page.evaluate(() => window.__posts ?? [])).length === 0, 'no game claim is sent by a sitting');
  }
  await shot(page, 'back', { exit: ['[data-xs-close]'], allow });
  await page.click(`[data-xs-row="${typed[0].id}"]`);
  await page.waitForSelector(`[data-xs-detail="${typed[0].id}"]`);
  expect(
    (await page.locator('[data-xs-guide]').count()) === 0,
    'a full-mark question opens its model copy directly (no « Guide-moi »)',
  );
  await checkExplain(w, page, typed[0], 'back');
  await shot(page, 'back-model', { exit: ['[data-xs-close]'], allow });
  await page.locator('[data-xs-notebook-open]').first().click();
  await page.waitForSelector('[data-xs-notebook]');
  expect(
    (await page.locator('[data-xs-notebook] li').count()) === 0 &&
      // kit/text.js › EXAM.perfect
      (await page.textContent('[data-xs-notebook]')).includes('Copie parfaite'),
    'the notebook: a full paper, nothing to write in it',
  );
  await shot(page, 'notebook', { exit: ['[data-xs-close]', '[data-xs-finish]'], allow });
  await page.click('[data-xs-finish]');
  await page.waitForSelector('[data-di-promotion]');
  await page.waitForTimeout(600);
  {
    const kind = await page.getAttribute('[data-di-promotion]', 'data-di-promotion');
    const ex = await examState(page);
    expect(
      kind === 'champion' && ex.best[5]?.stars === starsFor(want, want) && ex.best[5].mark === want,
      `the last level passed with a full paper: the champion's promotion (${kind}), ${starsFor(want, want)} stars saved`,
    );
    expect(
      (await page.locator('.di-confetti i').count()) > 10 &&
        (await page.locator('[data-di-promotion] .di-stars3 .is-on').count()) === starsFor(want, want),
      'the promotion is a moment of GAME: confetti, three stars',
    );
    expect(
      (await page.textContent('.di-promo__mark b')).trim() === `${fmt(want)}${NB}${fmt(want)}`,
      `the promotion writes the mark ${fmt(want)} / ${fmt(want)}`,
    );
  }
  await shot(page, 'promotion', { exit: ['[data-di-promo-ladder]', '[data-di-exit]'] });
  await page.click('[data-di-promo-ladder]');
  await page.waitForSelector('[data-di-ladder="open"]');
  expect(
    (await page.locator('.di-rungs li.is-passed').count()) === 5,
    'back on the ladder: the five levels are passed',
  );
  await shot(page, 'ladder-after', { exit: ['[data-di-map-close]'], numbers: true });
  await page.click('[data-di-map-close]');
  await page.waitForSelector('[data-di-start]');

  // « Ma progression » AFTER: what the copy earned, per savoir-faire — counted HERE from the steps the sheet maps to a key
  const counted = typed.filter((q) => q.key && q.counted);
  const per = Object.fromEntries(keys.map((k) => [k, counted.filter((q) => q.key === k).length]));
  await page.click('[data-di-progress-open]');
  await page.waitForSelector('[data-di-progress]');
  await page.waitForTimeout(400);
  const after = await progress(page);
  expect(after.exam === `5${NB}5`, `the road: the exam station reads 5 / 5 (was ${before.exam.replace(/ /g, ' ')})`);
  expect(
    counted.length > 0,
    `the sheet's steps are mapped to the lesson's keys (${counted.length} counted step(s)) — a sheet that maps none would prove nothing below`,
  );
  expect(
    keys.every((k) =>
      per[k]
        ? // « 2 réussites sur 2 » (kit/text.js › TX.progress.tries; the space before the noun may be a no-break one)
          new RegExp(`(^|[^0-9])${per[k]}\\s+réussites?\\s+sur\\s+${per[k]}([^0-9]|$)`).test(after.rows[k])
        : NO_TRY.test(after.rows[k]),
    ),
    `per savoir-faire, the steps answered as in an exam, all right: ${keys.map((k) => `${k} ${per[k]} of ${per[k]}`).join(', ')}`,
  );
  const ready = readinessFor(5, counted.length, counted.length);
  expect(
    after.ready === ready,
    `the readiness counts the ladder (5 of 5) and these ${counted.length} first tries, all right: ${ready}% (shown ${after.ready}%, was ${before.ready}%)`,
  );
  expect(after.next !== 'exam', `the next thing is no longer an exam level (« ${after.next} »)`);
  await shot(page, 'progress-after', { exit: ['[data-di-progress-close]'], numbers: true });
  await page.click('[data-di-progress-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« Ma progression » closes back to the title screen',
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-di-start]');
  {
    const st = await page.evaluate(() => window.__world.getState());
    const n = Object.values(st.tally ?? {}).reduce((t, x) => t + x.n, 0);
    const ok = Object.values(st.tally ?? {}).reduce((t, x) => t + x.ok, 0);
    expect(
      st.exam.best[5]?.stars === 3 && n === counted.length && ok === counted.length,
      `after a reload the ladder and the tally (${ok} right of ${n}) are still there`,
    );
  }
  if (PHONE)
    console.log('    (phone held sideways: the answer sheet may slide inside its box — GAME_WORLD.md « On a phone »)');
  await ctx.close();
}

/** Four copies, each asserted by what the screen says (the five levels open in the save). */
export async function copies(w, { uid, id, grade, url, keys, bank, allow, stage }) {
  const { expect, check, shot } = w;
  const { page, ctx } = await w.student({
    uid,
    lessonId: id,
    url,
    grade,
    seed: { [`u_${uid}_smarter_world_${id}`]: openSave(keys, stage) },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await toLadder(page);
  let tally = { ok: 0, n: 0 };

  // ── a BLANK copy handed in (level 1): nothing answered, nothing sent ──
  {
    const S = firstSheet(bank, 1);
    const subject = await openSitting(page, 1, S.id);
    expect(
      subject.exercises.map((e) => e.bankId).join() === S.id,
      `blank copy: level 1 draws the sheet asked (${S.id})`,
    );
    const steps = stepsOf(subject, bank);
    const want = totalOf(steps);
    const before = await examState(page);
    await page.click('[data-xs-start]');
    await page.waitForSelector('[data-xs="sit"]');
    await handIn(page);
    expect(Number(await page.getAttribute('[data-xs-total]', 'data-xs-total')) === 0, `blank copy: 0 / ${want}`);
    expect(
      (await page.textContent('[data-xs-appreciation]')).trim() === appreciationFor(0, want),
      `blank copy: the copy reads « ${appreciationFor(0, want)} »`,
    );
    const rows = await page
      .locator('[data-xs-row]')
      .evaluateAll((els) => els.map((e) => ({ m: e.dataset.xsMark, t: e.textContent })));
    expect(
      rows.length === steps.length &&
        steps.every((q, k) => (q.paper ? rows[k].m === 'paper' : rows[k].m === 'ko' && rows[k].t.includes('Pas de réponse'))),
      'blank copy: every typed step is crossed and says « Pas de réponse »',
    );
    expect(
      (await practicePosts(page)).length === 0,
      'blank copy: nothing is sent to the practice engine (no answered step)',
    );
    await shot(page, 'blank-back', { exit: ['[data-xs-close]'], allow });
    await page.click('[data-xs-close]');
    await page.waitForSelector('[data-di-promotion="retry"]');
    const ex = await examState(page);
    expect(
      ex.fails[1] === 1 &&
        JSON.stringify(ex.best[1]) === JSON.stringify(before.best[1]) &&
        ex.weak[1].includes(`ex:${S.id}`),
      'blank copy: the level is not passed again, the sheet is remembered as missed',
    );
    expect(
      (await page.textContent('.di-promo__mark b')).trim() === `0${NB}${fmt(want)}` &&
        (await page.locator('.di-confetti').count()) === 0,
      `blank copy: « Pas encore… », the mark 0 / ${fmt(want)}, no celebration`,
    );
    await shot(page, 'blank-retry', { exit: ['[data-di-promo-ladder]'] });
    await page.click('[data-di-promo-ladder]');
    await page.waitForSelector('[data-di-ladder="open"]');
  }

  // ── a WRONG copy (level 2): every typed step wrong; the two helps; the notebook; the retry ──
  {
    const S = firstSheet(bank, 2, guideTestable);
    const subject = await openSitting(page, 2, S.id);
    expect(
      subject.exercises.some((e) => e.bankId === S.id),
      `wrong copy: level 2 draws the sheet asked (${S.id}) beside ${subject.exercises
        .filter((e) => e.bankId !== S.id)
        .map((e) => e.bankId)
        .join(', ')}`,
    );
    const steps = stepsOf(subject, bank);
    const typed = steps.filter((q) => !q.paper);
    const plan = Object.fromEntries(typed.map((q) => [q.id, wrongOf(q)]));
    const want = totalOf(steps);
    await page.click('[data-xs-start]');
    await page.waitForSelector('[data-xs="sit"]');
    await fill(page, subject, steps, plan);
    await handIn(page);
    const got = markOf(steps, plan);
    expect(
      got === 0 && Number(await page.getAttribute('[data-xs-total]', 'data-xs-total')) === 0,
      `wrong copy: 0 / ${want}`,
    );
    expect(
      (await page.locator('[data-xs-row]').evaluateAll((els) => els.map((e) => e.dataset.xsMark))).join() ===
        steps.map((q) => (q.paper ? 'paper' : 'ko')).join(),
      'wrong copy: every typed step carries a red cross',
    );
    {
      const posts = await practicePosts(page);
      const answers = posts.filter((p) => /\/answers$/.test(p.url.split('?')[0])).map(bodyOf);
      expect(
        answers.length === typed.length &&
          typed.every(
            (q, k) =>
              // a decimal is sent in the sheet's writing (« 2,2 » for the « 2.2 » typed — the first bank with decimal
              // answers, jidhr-tarbii, 2026-11-21): compared as the same number, comma or point
              sameAnswer(answers[k]?.answer, plan[q.id]) && answers[k]?.outcome !== 'correct',
          ),
        `wrong copy: each of the ${typed.length} answers is sent as he wrote it, never as right`,
      );
    }
    await shot(page, 'wrong-back', { exit: ['[data-xs-close]'], allow });
    const q =
      typed.find((x) => x.sheet.id === S.id && x.answerType === 'rational' && (x.bank.hints ?? []).length) ?? typed[0];
    await page.click(`[data-xs-row="${q.id}"]`);
    await page.waitForSelector(`[data-xs-detail="${q.id}"]`);
    const schemeN = q.answerType === 'integerSet' ? 3 : 2;
    expect(
      (await page.locator(`[data-xs-detail="${q.id}"] .xs-scheme input`).count()) === schemeN &&
        (await page.locator('[data-xs-help]').count()) === 0,
      `wrong copy ${q.qid}: a lost point opens the scheme (${schemeN} lines) to tick against the paper — and no answer yet`,
    );
    await page.click('[data-xs-guide]');
    await checkGuide(w, page, q, `wrong copy ${q.qid}`);
    await shot(page, 'wrong-guide', { exit: ['[data-xs-close]'], allow });
    await page.click('[data-xs-explain]');
    await checkExplain(w, page, q, `wrong copy ${q.qid}`);
    await shot(page, 'wrong-explain', { exit: ['[data-xs-close]'], allow });
    await page.locator('[data-xs-notebook-open]').first().click();
    await page.waitForSelector('[data-xs-notebook]');
    const lostKeys = new Set(typed.map((x) => x.key).filter(Boolean));
    expect(
      lostKeys.size > 0 && (await page.locator('[data-xs-notebook] li').count()) === lostKeys.size,
      `wrong copy: the notebook lists one line per rule that lost points (${lostKeys.size}: ${[...lostKeys].join(', ') || 'NO step mapped to a key'})`,
    );
    await shot(page, 'wrong-notebook', { exit: ['[data-xs-close]', '[data-xs-finish]'], allow });
    await page.click('[data-xs-finish]');
    await page.waitForSelector('[data-di-promotion="retry"]');
    const ex = await examState(page);
    const missed = subject.exercises
      .filter((e) => steps.some((x) => x.exercise.id === e.id && !x.paper))
      .map((e) => `ex:${e.bankId}`);
    expect(
      ex.fails[2] === 1 && missed.every((m) => ex.weak[2].includes(m)),
      `wrong copy: the level stays failed once, the sheets missed are remembered (${missed.join(', ')})`,
    );
    expect(
      (await page.locator('[data-di-promo-similar]').count()) === 1 &&
        (await page.locator('[data-di-promo-next]').count()) === 0 &&
        (await page.locator('.di-confetti').count()) === 0 &&
        (await page.textContent('.di-promo__mark b')).trim() === `0${NB}${fmt(want)}`,
      `wrong copy: no celebration, « Un sujet du même genre », the mark 0 / ${fmt(want)}`,
    );
    await shot(page, 'wrong-retry', { exit: ['[data-di-promo-ladder]'] });
    tally = { ok: 0, n: typed.filter((x) => x.key && x.counted).length };

    // ── a copy QUIT half-way: the similar sheet, one step answered, then « Quitter » ──
    await page.evaluate(() => {
      window.__sitting = null;
      localStorage.removeItem('di.dev.sheet');
    });
    await page.click('[data-di-promo-similar]');
    await page.waitForSelector('[data-xs="read"]');
    await page.waitForFunction(() => window.__sitting?.subject);
    const second = await page.evaluate(() => window.__sitting.subject);
    expect(
      second.level === 2 && second.exercises.every((e) => !missed.includes(`ex:${e.bankId}`)),
      `the similar sheet is of level 2 and leaves out the sheets he missed (${second.exercises.map((e) => e.bankId).join(', ')})`,
    );
    const st2 = stepsOf(second, bank);
    const sent = (await practicePosts(page)).length;
    const exBefore = JSON.stringify(await examState(page));
    await page.click('[data-xs-start]');
    await page.waitForSelector('[data-xs="sit"]');
    const one = st2.find((x) => !x.paper);
    await page.click(`[data-xs-page="${second.exercises.findIndex((e) => e.id === one.exercise.id)}"]`);
    await typeStep(page, one, rightOf(one));
    await page.click('[data-xs-quit]');
    await page.waitForSelector('[data-xs-quit-box]');
    expect(
      // kit/text.js › EXAM.quitTitle
      (await page.textContent('[data-xs-quit-box]')).includes('Quitter le brevet blanc') &&
        (await page.locator('[data-xs="sit"]').count()) === 1,
      'quit half-way: « Quitter » asks first, the sitting still behind the question',
    );
    await shot(page, 'quit-ask', { exit: ['[data-xs-quit-no]', '[data-xs-quit-yes]'], allow });
    await page.click('[data-xs-quit-yes]');
    await page.waitForSelector('[data-di-ladder="open"]');
    await page.waitForTimeout(300);
    expect(
      JSON.stringify(await examState(page)) === exBefore &&
        (await practicePosts(page)).length === sent &&
        (await page.evaluate(() => window.__world.getState().paper)) !== true,
      'quit half-way: back on the ladder, nothing marked, nothing sent, the paper mode off',
    );
  }

  // ── a RIGHT copy (level 3): full marks, three stars ──
  {
    const S = firstSheet(bank, 3);
    const subject = await openSitting(page, 3, S.id);
    expect(
      subject.exercises.some((e) => e.bankId === S.id),
      `right copy: level 3 draws the sheet asked (${S.id})`,
    );
    const steps = stepsOf(subject, bank);
    const typed = steps.filter((q) => !q.paper);
    const plan = Object.fromEntries(typed.map((q) => [q.id, rightOf(q)]));
    const want = totalOf(steps);
    await page.click('[data-xs-start]');
    await page.waitForSelector('[data-xs="sit"]');
    await fill(page, subject, steps, plan);
    await handIn(page);
    expect(
      Number(await page.getAttribute('[data-xs-total]', 'data-xs-total')) === want && markOf(steps, plan) === want,
      `right copy: ${want} / ${want} (the points of its sheets on disk)`,
    );
    expect(
      (await page.textContent('[data-xs-appreciation]')).trim() === appreciationFor(1, 1),
      `right copy: « ${appreciationFor(1, 1)} »`,
    );
    await shot(page, 'right-back', { exit: ['[data-xs-close]'], allow });
    await page.click('[data-xs-close]');
    await page.waitForSelector('[data-di-promotion]');
    const kind = await page.getAttribute('[data-di-promotion]', 'data-di-promotion');
    expect(
      kind === 'passed' &&
        (await page.locator('[data-di-promotion] .di-stars3 .is-on').count()) === starsFor(want, want) &&
        (await page.textContent('.di-promo__mark b')).trim() === `${fmt(want)}${NB}${fmt(want)}`,
      `right copy: a level already passed is passed again (${kind}), ${starsFor(want, want)} stars, ${fmt(want)} / ${fmt(want)}`,
    );
    await shot(page, 'right-promotion', { exit: ['[data-di-promo-ladder]'] });
    tally = {
      ok: tally.ok + typed.filter((x) => x.key && x.counted).length,
      n: tally.n + typed.filter((x) => x.key && x.counted).length,
    };
    await page.click('[data-di-promo-ladder]');
    await page.waitForSelector('[data-di-ladder="open"]');
    await page.click('[data-di-map-close]');
    await page.waitForSelector('[data-di-start]');
  }

  // « Ma progression »: the readiness from these copies (the blank and the quit count nothing)
  await page.click('[data-di-progress-open]');
  await page.waitForSelector('[data-di-progress]');
  await page.waitForTimeout(400);
  {
    const p = await progress(page);
    const st = await page.evaluate(() => window.__world.getState().tally ?? {});
    const n = Object.values(st).reduce((t, x) => t + x.n, 0);
    const ok = Object.values(st).reduce((t, x) => t + x.ok, 0);
    check(
      n === tally.n && ok === tally.ok,
      `the tally counts the wrong copy and the right one only: ${ok} right of ${n} (computed ${tally.ok} of ${tally.n})`,
    );
    check(
      p.ready === readinessFor(5, tally.ok, tally.n),
      `the readiness: ½ × 5/5 + ½ × ${tally.ok}/${tally.n} = ${readinessFor(5, tally.ok, tally.n)}% (shown ${p.ready}%)`,
    );
    await shot(page, 'copies-progress', { exit: ['[data-di-progress-close]'], numbers: true });
  }
  await ctx.close();
}

/**
 * An answer sheet that does not fit at the 12 px floor is shown in LEAVES (GAME_WORLD.md §2quater): never cut, never
 * scrolled. For such a sheet: the count « 1 / n » is shown, every step is on exactly one leaf, each leaf is a screen of its
 * own (`shot`: not cut, 12 px), every answer is TYPED on its leaf with « Suivante », and back on the first leaf what he typed
 * there is still in its box and the sheet's progress counts every leaf; then the copy is handed in and comes back whole,
 * each answer marked right (true: the sitting is over, the ladder is back). A sheet that fits has ONE leaf and no control.
 */
async function everyLeaf(w, page, steps, tag, allow) {
  const { check, shot } = w;
  const s = await leavesOnScreen(page);
  if (!check(Boolean(s), `${tag} sit: the answer sheet says how many leaves it has`)) return false;
  if (s.n === 1) {
    check(
      (await page.locator(`${ON} [data-xs-leaf-nav]`).count()) === 0,
      `${tag} sit: the answer sheet fits on one leaf — no page control`,
    );
    return false;
  }
  console.log(`    ${tag}: the answer sheet is shown in ${s.n} leaves`);
  check(
    s.count === `1 / ${s.n}` && steps.every((q) => s.at[q.id] !== undefined),
    `${tag} sit: ${s.n} leaves, the count « ${s.count} », every step on one leaf (${steps.map((q) => `${q.qid}→${s.at[q.id] + 1}`).join(' ')})`,
  );
  const typed = steps.filter((q) => !q.paper);
  for (let l = 0; l < s.n; l += 1) {
    await turnTo(page, l);
    const box = await sheetBox(page);
    const mine = steps.filter((q) => s.at[q.id] === l);
    const visible = await page.evaluate(
      (ids) =>
        ids.every((id) => {
          const el = document.querySelector(`[data-xs-field="${id}"], [data-xs-paper-only="${id}"]`);
          return el && el.getClientRects().length > 0;
        }),
      mine.map((q) => q.id),
    );
    check(
      visible && box.need <= box.have + 3,
      `${tag} sit leaf ${l + 1}/${s.n}: its ${mine.length} answer(s) on screen, the column whole (${box.need} in ${box.have}, scale ${box.z})`,
    );
    for (const q of typed.filter((x) => s.at[x.id] === l)) await typeStep(page, q, rightOf(q));
    await shot(page, `${tag}-sit-leaf${l + 1}`, { ...SHEET_OUT, allow });
  }
  await turnTo(page, 0);
  const first = typed.find((q) => s.at[q.id] === 0 && q.answerType !== 'choice');
  if (first) {
    const kept = await page.evaluate(
      (id) =>
        [...document.querySelectorAll(`[data-xs-field="${id}"] input, [data-xs-field="${id}"] textarea`)].some(
          (x) => x.value !== '',
        ),
      first.id,
    );
    check(kept, `${tag} sit: back on leaf 1, what he typed in ${first.qid} is still in its box`);
  }
  const progress = (await page.textContent(`[data-xs-page].is-on i`)).trim();
  check(
    progress === `${typed.length}/${typed.length}`,
    `${tag} sit: the sheet's count reads every leaf: ${progress} (${typed.length} typed steps)`,
  );
  // the copy handed back: the same answers with their corrections, never cut either (`shot`), every step marked right
  await page.click('[data-xs-hand]');
  if (await page.waitForSelector('[data-xs-forgot-go]', { timeout: 1500 }).catch(() => null)) {
    await page.click('[data-xs-forgot-go]'); // another exercise of the subject left empty: the walk hands in anyway
    await page.click('[data-xs-hand]');
  }
  await page.waitForSelector('[data-xs-hand-yes]', { timeout: 5000 });
  await page.click('[data-xs-hand-yes]');
  await page.waitForSelector('[data-xs="back"]');
  await page.waitForTimeout(500);
  const marks = await page
    .locator('[data-xs-row]')
    .evaluateAll((els) => Object.fromEntries(els.map((e) => [e.dataset.xsRow, e.dataset.xsMark])));
  check(
    steps.every((q) => marks[q.id] === (q.paper ? 'paper' : 'ok')),
    `${tag} back: every answer typed on its leaf is on the copy, marked right`,
  );
  await shot(page, `${tag}-back`, { exit: ['[data-xs-close]'], allow });
  await page.click('[data-xs-close]');
  await page.waitForSelector('[data-di-promotion]');
  await page.click('[data-di-promo-ladder]');
  await page.waitForSelector('[data-di-ladder="open"]');
  return true;
}

/** EVERY sheet of EVERY level: opened, checked against the disk, each screen through `shot`, then « Quitter ». */
export async function everySheet(w, { uid, id, grade, url, keys, bank, allow, stage }) {
  const { expect, check, shot } = w;
  const { page, ctx } = await w.student({
    uid,
    lessonId: id,
    url,
    grade,
    seed: { [`u_${uid}_smarter_world_${id}`]: openSave(keys, stage) },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await toLadder(page);
  expect(
    (await page.locator('[data-di-exam-level]:not([disabled])').count()) === 5,
    'every sheet: the five levels are open',
  );
  const t0 = Date.now();
  let first = true;
  let n = 0;
  // `E2E_SHEETS=l5-005,l3-001` opens only those sheets (a debugging aid, like E2E_PARTS: it prints a NOTE and is not a full run)
  const only = (process.env.E2E_SHEETS || '').split(',').filter(Boolean);
  if (only.length) console.log(`NOTE: only the sheet(s) ${only.join(', ')} of the bank — NOT a full run`);
  const wanted = (s) => !only.length || only.some((o) => s.id.endsWith(`-${o}`));
  for (let level = 1; level <= 5; level += 1) {
    const all = [...bank.values()].filter((s) => s.level === level && wanted(s)).sort((a, b) => (a.id < b.id ? -1 : 1));
    const can = sittableOnDisk(bank, level);
    for (const sheet of all) {
      const tag = short(sheet.id);
      if (
        !check(
          can.includes(sheet),
          `${tag}: a sheet the sitting can draw (an exam sheet, every step of a type the sitting draws)`,
        )
      )
        continue;
      const subject = await openSitting(page, level, sheet.id);
      const drawn = subject.exercises.some((e) => e.bankId === sheet.id);
      if (first)
        expect(
          drawn,
          `the DEV hook localStorage['di.dev.sheet'] draws the sheet asked (${sheet.id}; drawn ${subject.exercises.map((e) => e.bankId).join(', ')})`,
        );
      else check(drawn, `${tag}: drawn at level ${level}`);
      first = false;
      if (!drawn) {
        await quitSitting(page);
        continue;
      }
      n += 1;
      await checkPaper(w, page, '.xs-paper', sheet, `${tag} read`);
      await shot(page, `${tag}-read`, { ...SHEET_OUT, allow });
      await page.click('[data-xs-start]');
      await page.waitForSelector('[data-xs="sit"]');
      const steps = stepsOf(subject, bank);
      const i = subject.exercises.findIndex((e) => e.bankId === sheet.id);
      await page.click(`[data-xs-page="${i}"]`);
      await page.waitForTimeout(150);
      await checkPaper(w, page, `${ON} .xs-paper`, sheet, `${tag} sit`);
      await checkFields(
        w,
        page,
        steps.filter((q) => q.exercise.bankId === sheet.id),
        `${tag} sit`,
      );
      await shot(page, `${tag}-sit`, { ...SHEET_OUT, allow });
      // a sheet in leaves is handed in (its copy comes back, then the ladder); any other leaves by « Quitter »
      if (
        !(await everyLeaf(
          w,
          page,
          steps.filter((q) => q.exercise.bankId === sheet.id),
          tag,
          allow,
        ))
      )
        await quitSitting(page);
    }
  }
  if (only.length) console.log(`NOTE: ${n} sheet(s) opened of the ${bank.size} of the bank`);
  else
    check(
      n === bank.size,
      `every sheet of the bank was opened and read (${n} of ${bank.size}) in ${Math.round((Date.now() - t0) / 1000)} s`,
    );
  await page.evaluate(() => localStorage.removeItem('di.dev.sheet'));
  await ctx.close();
}

/**
 * The whole sitting walk of a v2 lesson: `levelFive`, `copies`, `everySheet`, each in its own session.
 * `foreign` / `foreignNumbers`: the words and numbers of OTHER lessons; on the screens that show the bank's own text they
 * are allowed only where the bank writes them (`bankWrites`).
 */
export async function sittingWalk({
  name,
  grade,
  id,
  url,
  keys,
  uid,
  foreign = [],
  foreignNumbers = [],
  pilot = false,
  stage = 8,
}) {
  const bank = bankOnDisk(grade, id);
  const allow = bankWrites(bank, { words: foreign, numbers: foreignNumbers });
  const w = createWalk(name, { foreign, foreignNumbers, pilot });
  const parts = (process.env.E2E_PARTS || 'five,copies,sheets').split(',');
  if (parts.length < 3) console.log(`NOTE: only the part(s) ${parts.join(', ')} of ${name} — NOT a full run`);
  const ctx = { id, grade, url, keys, bank, allow, stage };
  await w.run(async () => {
    if (parts.includes('five')) await levelFive(w, { ...ctx, uid });
    if (parts.includes('copies')) await copies(w, { ...ctx, uid: uid + 1 });
    if (parts.includes('sheets')) await everySheet(w, { ...ctx, uid: uid + 2 });
  });
  return w;
}
