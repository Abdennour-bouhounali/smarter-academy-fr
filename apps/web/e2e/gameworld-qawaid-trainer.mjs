// « تدرّب » of lesson `qawaid-qabiliyat-qisma` (1AM « قواعد قابلية القسمة »), as a STUDENT — copied from lesson 3's
// gameworld-khawass-trainer.mjs. On the full « خريطة المعارف », four cards are trained — رقم الآحاد, مجموع الأرقام,
// الرقمان الأخيران, الباقي معدوم — six questions each, so EVERY kind of question of the lesson's `world/trainer.js` is
// played through its screen: tap (the gates), true / false (game, and exam with its reason), judge (« الرقم … هو [ ] »
// then « [يقبل / لا يقبل] »), digit (the box where □ is), rest (« a = b × [ ] + [ ] » then the verdict), phrase (three
// sentences chosen in their lines). In each session: a wrong then a right answer (the hint), a right one at the first try,
// two wrong (the written correction, the model sheet when the question has one).
// The right answers are computed HERE from the numbers of the question (a reading, a division, which number divides),
// never taken from the lesson (a true / false is judged by the statement the lesson wrote: its `truth`). What is posted as
// evidence (exam format, first try) is captured and its claim re-computed here.
// Before the training, three cards are OPENED and checked AS CARDS: a rule card with its memo sheet (the rule drawn in
// words, each row read right to left, inside its panel; its two questions answered wrong, then right: the seal), a
// « common mistake » card (the wrong sentence first, the rest uncovered by him), and the takeaway.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-qawaid-trainer.mjs [outDir]
import { createWalk, TOUCH } from './lib/walk.mjs';
import {
  GRADE,
  KEYS,
  POINT,
  pageOf,
  QAWAID_FOREIGN,
  QAWAID_FOREIGN_NUMBERS,
  digitSum,
  gateRight,
  withDigit,
} from './lib/qawaid.mjs';

const ID = 'qawaid-qabiliyat-qisma';
const URL = pageOf(ID);
/** The cards of the lesson's knowledge map (world/knowledge.js › KNOWLEDGE_GRAPH). */
const CARDS = [
  'qabiliya',
  'ahad',
  'khata-sifr',
  'majmu',
  'mithal-majmu',
  'khata-3-9',
  'akhirayn',
  'limatha-100',
  'khata-zawji',
  'baqi',
  'siyagh',
  'khulasa',
];
/** The kinds each trained card must show (the plans of world/trainer.js: ahad, majmu, akhir, baqi). */
const TRAIN = {
  ahad: ['tap', 'tf', 'judge'],
  majmu: ['tap', 'tf', 'judge', 'digit'],
  akhirayn: ['tap', 'tf', 'judge', 'digit'],
  baqi: ['tap', 'tf', 'rest', 'phrase'],
};
/** The kinds whose exam answer is evidence (world/evidence.js): never a true / false. */
const EVIDENCE = ['judge', 'digit', 'rest', 'phrase'];
const w = createWalk('gameworld-qawaid-trainer', { foreign: QAWAID_FOREIGN, foreignNumbers: QAWAID_FOREIGN_NUMBERS });
/** The memo rule of a key as a card must DRAW it: its rows, each an Arabic sentence (world/knowledge.js, `words`). */
const MEMO_RULE = {
  ahad: ['رقم الآحاد 0، 2، 4، 6 أو 8: يقبل القسمة على 2', 'رقم الآحاد 0 أو 5: يقبل القسمة على 5'],
  akhirayn: ['العدد المشكّل من رقمَي الآحاد والعشرات', 'يقبل القسمة على 4: العدد كلّه كذلك'],
};
const { expect, check, shot } = w;

/** What a key reads in n for the divisor b (the walk's own): its slot on the sheet and its value. */
const reading = (n, b) =>
  b === 2 || b === 5
    ? { slot: 'u', value: n % 10 }
    : b === 3 || b === 9
      ? { slot: 's', value: digitSum(n) }
      : { slot: 't', value: n % 100 };
/** The number a « missing digit » question makes with the digit d. */
const digitValue = (q, d) => withDigit(q.b === 4 ? 'tens' : 'units', q.pre, q.post, d);
/** The right answer of a question, from its numbers. */
function solve(q) {
  switch (q.kind) {
    case 'tap': {
      const ok = q.options.filter((n) => gateRight(q.wave, n));
      expect(ok.length === 1, `tap « ${q.wave.type} » (${q.options.join(', ')}): exactly one gate is right`);
      return ok[0];
    }
    case 'tf':
      return { truth: q.truth, reason: q.reasons ? q.reasons.findIndex((r) => r.ok) : null };
    case 'judge': {
      const r = reading(q.n, q.b);
      return { [r.slot]: r.value, v: q.n % q.b === 0 ? 'yes' : 'no' };
    }
    case 'digit': {
      const d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((x) => digitValue(q, x) % q.b === 0);
      expect(d != null, `digit: some digit makes ${q.pre}□${q.post ?? ''} divisible by ${q.b}`);
      return d;
    }
    case 'rest': {
      const r = q.a % q.b;
      return { q: Math.floor(q.a / q.b), r, v: r === 0 ? 'yes' : 'no' };
    }
    case 'phrase': {
      // « big يقبل القسمة على small », « big مضاعف للعدد small », « small يقسم big »: the option value is the number written first
      const [big, small] = [Math.max(q.a, q.b), Math.min(q.a, q.b)];
      return { yaqbal: String(big), mudaaf: String(big), yaqsim: String(small) };
    }
    default:
      throw new Error(`unknown kind ${q.kind}`);
  }
}
/** A wrong answer of the same shape — one whose claim (when it is evidence) is FALSE. */
function wrongOf(q) {
  const r = solve(q);
  switch (q.kind) {
    case 'tap':
      return q.options.find((n) => n !== r);
    case 'tf':
      return { truth: !r.truth, reason: r.reason };
    case 'judge':
      return { ...r, v: r.v === 'yes' ? 'no' : 'yes' };
    case 'digit':
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((x) => digitValue(q, x) % q.b !== 0);
    case 'rest':
      return { ...r, r: r.r + 1 };
    case 'phrase':
      return { ...r, yaqsim: String(Math.max(q.a, q.b)) };
    default:
      return null;
  }
}
/** The claim the evidence must carry for the answer `v` of question q, and whether the server will find it true. */
function claimOf(q, v) {
  switch (q.kind) {
    case 'judge':
      return {
        want: { kind: 'divisible', a: q.n, b: q.b, fits: v.v === 'yes' },
        truth: (q.n % q.b === 0) === (v.v === 'yes'),
      };
    case 'digit': {
      const a = digitValue(q, Number(v));
      return { want: { kind: 'divisible', a, b: q.b, fits: true }, truth: a % q.b === 0 };
    }
    case 'rest': {
      const [qq, r] = [Number(v.q), Number(v.r)];
      return {
        want: { kind: 'division', a: q.a, b: q.b, q: qq, r, fits: v.v === 'yes' },
        truth: q.b * qq + r === q.a && r >= 0 && r < q.b && (v.v === 'yes') === (r === 0),
      };
    }
    case 'phrase': {
      // three sentences, ONE claim: the first sentence he put the wrong way round — or, when the three are right, « يقسم »
      const [big, small] = [Math.max(q.a, q.b), Math.min(q.a, q.b)];
      const rightFirst = { yaqbal: big, mudaaf: big, yaqsim: small };
      const wrong = ['yaqbal', 'mudaaf', 'yaqsim'].find((k) => Number(v[k]) !== rightFirst[k]);
      const phrase = wrong ?? 'yaqsim';
      return { want: { kind: 'phrase', phrase, first: Number(v[phrase]), a: q.a, b: q.b }, truth: !wrong };
    }
    default:
      return null;
  }
}
const same = (c, want) => Object.entries(want).every(([k, x]) => c?.[k] === x);

await w.run(async () => {
  const know = { found: CARDS, read: [], sealed: [], trained: {} };
  const practice = Object.fromEntries(KEYS.map((k) => [`${k}:1`, { stars: 2, best: 800 }]));
  const save = {
    v: 1,
    stage: 8,
    stars: {},
    gems: [],
    keys: KEYS,
    keysEver: KEYS,
    falls: 0,
    flags: {},
    finished: true,
    practice,
    know,
  };
  const { page } = await w.student({
    uid: 9871,
    lessonId: ID,
    url: URL,
    grade: GRADE,
    seed: { [`u_9871_smarter_world_${ID}`]: save },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.click('[data-di-know-open]');
  await page.waitForSelector('[data-di-kmap="full"]');
  await page.waitForTimeout(700);
  expect(
    (await page.locator('[data-di-knode]').count()) === CARDS.length &&
      (await page.locator('[data-di-knode][data-open="true"]').count()) === CARDS.length,
    `« خريطة المعارف »: the ${CARDS.length} cards of the lesson, all open with the four keys`,
  );
  await shot(page, 'know-full', { exit: ['[data-di-know-close]'], sound: true, numbers: true });

  /** Opens a card from the map (the map is hidden while a memo, a quiz or a training is on screen: back to the card first). */
  const knode = async (id) => {
    const n = page.locator(`[data-di-knode="${id}"]`);
    if (!(await n.isVisible())) await page.click('[data-di-tab="card"]');
    await n.click();
  };

  // ══ three cards OPENED and checked as cards ══
  const KNOW = { exit: ['[data-di-know-close]'], sound: true, numbers: true };
  const pill = async (name) => Number(await page.getAttribute(`[data-di-know-${name}]`, `data-di-know-${name}`));
  /** The rule of the memo sheet as it is DRAWN: its pieces of text with their place, and whether it stays in its panel. */
  const ruleDrawn = () =>
    page.evaluate(() => {
      const dd = document.querySelector('.di-memo .is-rule dd');
      const html = dd?.querySelector('.katex-html');
      if (!html) return null;
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      };
      const k = box(dd.querySelector('.katex'));
      const p = box(document.querySelector('[data-di-kpanel]'));
      return {
        pieces: [...html.querySelectorAll('.mord.text')].map((el) => ({
          t: el.textContent.replace(/ /g, ' '),
          ...box(el),
        })),
        inside: k.left >= p.left - 1 && k.right <= p.right + 1 && k.top >= p.top - 1 && k.bottom <= p.bottom + 1,
        raw: /\\|begin\{|\{array\}|\$/.test(html.textContent),
        wide: Math.round(k.right - k.left),
        room: Math.round(p.right - p.left),
      };
    });
  /** A rule card: its page, its memo sheet with the rule in `rows`, read right to left. */
  const memoCard = async (id, title, rows) => {
    await knode(id);
    await page.waitForSelector(`[data-di-kpanel="${id}"]`);
    await page.waitForTimeout(250);
    const tabs = await page.locator('[data-di-tab]').evaluateAll((els) => els.map((e) => e.dataset.diTab));
    expect(
      (await page.textContent(`[data-di-kpanel="${id}"] h3`)).includes(title) &&
        tabs.join() === 'card,memo,quiz,train' &&
        (await page.locator(`[data-di-knode="${id}"][data-read="true"].is-sel`).count()) === 1,
      `card « ${id} »: opened from the map, it shows its own page (« ${title} ») with its four tabs, and is marked read`,
    );
    await page.click('[data-di-tab="memo"]');
    await page.waitForSelector('.di-memo .is-rule .katex-html');
    await page.waitForTimeout(250);
    const d = await ruleDrawn();
    const perRow = d.pieces.length / rows.length;
    const lines = rows.map((_, r) => d.pieces.slice(r * perRow, (r + 1) * perRow));
    expect(
      Number.isInteger(perRow) && lines.every((line, r) => line.map((x) => x.t).join('') === rows[r]) && !d.raw,
      `card « ${id} »: the memo rule is written in WORDS — ${rows.map((r) => `« ${r} »`).join(' / ')} — no letter for a digit, no raw formula (drawn: ${d.pieces.map((x) => x.t).join(' | ')})`,
    );
    check(
      lines.every((line) => line.every((x, k) => k === 0 || x.right <= line[k - 1].left + 1)) &&
        lines.every((line, r) => r === 0 || line[0].top >= lines[r - 1][0].bottom - 2),
      `card « ${id} »: each row is READ RIGHT TO LEFT (its first words on the right) and the rows follow each other downwards (${JSON.stringify(lines.map((line) => line.map((x) => Math.round(x.left))))})`,
    );
    check(d.inside, `card « ${id} »: the rule stays inside its panel (${d.wide} px of ${d.room})`);
    const memo = (await page.textContent('.di-memo')).replace(/\s+/g, ' ');
    check(
      (await page.locator('.di-memo > div').count()) === 5 && memo.length > 60,
      `card « ${id} »: the memo sheet has its five lines — the rule, what to repeat, a worked number, the trap, the exam`,
    );
    await shot(page, `know-card-${id}-memo`, KNOW);
  };

  // 1. a rule card whose rule has three pieces a row: the red digits sit BETWEEN the words, read right to left
  await memoCard('ahad', 'رقم الآحاد', MEMO_RULE.ahad);
  // 2. the card of the plank 4: the bank's words, then its two questions — wrong first, then right: the seal
  await memoCard('akhirayn', 'الرقمان الأخيران', MEMO_RULE.akhirayn);
  await page.click('[data-di-tab="quiz"]');
  await page.waitForSelector('[data-di-quiz-check]');
  {
    const options = await page.locator('[data-di-quiz]').evaluateAll((els) =>
      els.map((e) => ({
        at: e.dataset.diQuiz,
        text: (e.querySelector('.katex-html')?.textContent ?? '') + ' ' + e.textContent,
        number: Number((e.querySelector('.katex-html')?.textContent ?? '').replace(/\D/g, '')),
      })),
    );
    const q0 = options.filter((o) => o.at.startsWith('0-'));
    const q1 = options.filter((o) => o.at.startsWith('1-'));
    // the walk's own answers: the number divisible by 4; the reason that speaks of 100 = 4 × 25
    const r0 = q0.filter((o) => o.number > 0 && o.number % 4 === 0);
    const r1 = q1.filter((o) => o.text.includes('100'));
    expect(
      q0.length === 3 && q1.length === 3 && r0.length === 1 && r1.length === 1,
      `card « akhirayn »: two questions of three options; by the walk's arithmetic one number is divisible by 4 (${r0.map((o) => o.number).join()}) and one reason speaks of 100`,
    );
    const sealed0 = await pill('sealed');
    const w0 = q0.find((o) => o !== r0[0] && o.number % 2 === 0) ?? q0.find((o) => o !== r0[0]);
    await page.click(`[data-di-quiz="${w0.at}"]`);
    await page.click(`[data-di-quiz="${r1[0].at}"]`);
    await page.click('[data-di-quiz-check]');
    await page.waitForTimeout(200);
    expect(
      (await page.locator('.di-quiz .di-feedback').count()) === 1 &&
        (await page.locator('.di-quiz__gold').count()) === 0 &&
        (await pill('sealed')) === sealed0,
      `card « akhirayn »: ${w0.number} (even, not divisible by 4) is refused — no seal, he may try again`,
    );
    await shot(page, 'know-card-akhirayn-quiz-wrong', KNOW);
    await page.click(`[data-di-quiz="${r0[0].at}"]`);
    await page.click('[data-di-quiz-check]');
    await page.waitForTimeout(200);
    expect(
      (await page.locator('.di-quiz__gold').count()) === 1 &&
        (await pill('sealed')) === sealed0 + 1 &&
        (await page.evaluate(() => window.__world.getState().know.sealed)).includes('raqmayn-akhirayn'),
      'card « akhirayn »: both answers right — the rule is SEALED in gold, and the seal is saved',
    );
    await shot(page, 'know-card-akhirayn-sealed', KNOW);
  }
  // 3. a « common mistake »: the wrong sentence alone first — he uncovers why, and only then the card is read
  await knode('khata-zawji');
  await page.waitForSelector('[data-di-kpanel="khata-zawji"]');
  await page.waitForTimeout(250);
  {
    const tabs = await page.locator('[data-di-tab]').evaluateAll((els) => els.map((e) => e.dataset.diTab));
    const read0 = await pill('read');
    expect(
      tabs.join() === 'card,train' &&
        (await page.locator('.di-parts .is-wrong').count()) === 1 &&
        (await page.locator('.di-parts .is-why, .di-parts .is-right').count()) === 0 &&
        (await page.locator('[data-di-uncover]').count()) === 1 &&
        (await page.locator('[data-di-knode="khata-zawji"][data-read="false"]').count()) === 1,
      'card « khata-zawji »: a mistake students make is shown ALONE first (no memo, no question): not read yet',
    );
    const wrong = (await page.textContent('.di-parts .is-wrong')).replace(/\s+/g, ' ');
    const n = Number((wrong.match(/\d+/) ?? [0])[0]);
    expect(
      n % 2 === 0 && n % 4 !== 0 && wrong.includes('زوجي'),
      `card « khata-zawji »: the sentence is really false — ${n} is even and ${n} = 4 × ${Math.floor(n / 4)} + ${n % 4}`,
    );
    await shot(page, 'know-card-mistake', KNOW);
    await page.click('[data-di-uncover]');
    await page.waitForSelector('.di-parts .is-right');
    expect(
      (await page.locator('.di-parts .is-why').count()) === 1 &&
        (await page.locator('[data-di-knode="khata-zawji"][data-read="true"]').count()) === 1 &&
        (await pill('read')) === read0 + 1,
      'card « khata-zawji »: he uncovers why it is false and what is right — the card is read now',
    );
    await shot(page, 'know-card-mistake-uncovered', KNOW);
  }
  // 4. the takeaway: the three readings, in the bank's words
  await knode('khulasa');
  await page.waitForSelector('[data-di-kpanel="khulasa"]');
  await page.waitForTimeout(250);
  {
    const card = (await page.textContent('[data-di-kpanel="khulasa"]')).replace(/\s+/g, ' ');
    expect(
      card.includes('العدد المشكّل من رقمَي الآحاد والعشرات') && !card.includes('المكوّن'),
      'card « khulasa »: the plank 4 is said in the words of the exercise bank (« العدد المشكّل من رقمَي الآحاد والعشرات »)',
    );
    await shot(page, 'know-card-takeaway', KNOW);
  }

  const tr = () =>
    page.evaluate(() => ({
      q: window.__trainer?.q,
      index: window.__trainer?.index,
      dom: document.querySelector('[data-di-trainer]')?.dataset.diTrainer,
      fb: document.querySelector('[data-di-tr-fb]')?.dataset.diTrFb ?? null,
      fbText: document.querySelector('[data-di-tr-fb]')?.textContent ?? '',
    }));
  const trainerText = () => page.textContent('[data-di-trainer]');
  /** Answers the question on screen with `v`, through its own controls (a box is filled, a choice is selected). */
  const reply = async (q, v) => {
    if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]'); // « كتبتُ على ورقتي »
    if (q.kind === 'tap') {
      await page.click(`[data-di-tr-opt="${v}"]`);
      return;
    }
    if (q.kind === 'tf') {
      await page.click(`[data-di-tr-tf="${v.truth}"]`);
      if (q.format === 'exam') {
        await page.click(`[data-di-tr-reason="${v.reason}"]`);
        await page.click('[data-di-tr-check]');
      }
      return;
    }
    const entries = typeof v === 'object' ? Object.entries(v) : [[q.form.single, v]];
    for (const [k, x] of entries) {
      const sel = `[data-di-tr="${k}"]`;
      const tag = await page.evaluate((s) => document.querySelector(s)?.tagName ?? null, sel);
      expect(tag !== null, `${q.kind}: the box « ${k} » is on the sheet`);
      if (tag === 'SELECT') await page.selectOption(sel, String(x));
      else await page.fill(sel, String(x));
    }
    await page.click('[data-di-tr-check]');
  };
  const allPosts = [];
  for (const card of Object.keys(TRAIN)) {
    await knode(card);
    await page.waitForTimeout(200);
    await page.click('[data-di-know-train]');
    await page.waitForSelector('[data-di-trainer]');
    const seen = new Set();
    const formats = [];
    const sent0 = (await page.evaluate(() => window.__posts ?? [])).length;
    const firstTries = [];
    for (let i = 0; i < 6; i += 1) {
      const t = await tr();
      const { q } = t;
      formats.push(t.dom);
      expect(
        t.index === i && q.format === t.dom,
        `${card} · question ${i + 1}: « ${q.kind} » in the ${q.format} format`,
      );
      const text = await trainerText();
      const nums = { tap: q.options, judge: [q.n], digit: [q.pre], rest: [q.a, q.b], phrase: [q.a, q.b] }[q.kind] ?? [];
      check(
        nums.every((x) => text.includes(String(x))),
        `${card} · question ${i + 1}: the screen says the question’s own numbers${nums.length ? ` (${nums.join(', ')})` : ''}`,
      );
      if (q.format === 'exam') {
        check(
          await page.evaluate(() => window.__world.getState().paper === true),
          `${card} · question ${i + 1}: the exam format is answered in PAPER MODE`,
        );
        if (q.kind !== 'tf') {
          if (await page.locator('[data-di-pgate-go]').count()) {
            await page.click('[data-di-pgate-go]');
            await page.waitForTimeout(1200);
          }
          const shape = await page.evaluate(() =>
            [...document.querySelectorAll('.di-sheet input, .di-sheet select')].map((el) => ({
              inLine: Boolean(el.closest('.di-sheet__line')),
            })),
          );
          expect(
            shape.length > 0 && shape.every((x) => x.inLine),
            `${card} · question ${i + 1}: the answer boxes sit inside the template of the answer (${shape.length} boxes)`,
          );
          const look = () =>
            page.evaluate(() => {
              const b = document.querySelector('[data-di-tr-check]');
              if (!b) return null;
              const r = b.getBoundingClientRect();
              const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              let op = 1;
              for (let x = b; x; x = x.parentElement) op *= Number(getComputedStyle(x).opacity);
              const m = getComputedStyle(b)
                .backgroundColor.match(/[\d.]+/g)
                .map(Number);
              const alpha = m.length > 3 ? m[3] : 1;
              const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
              return {
                onTop: Boolean(top && (top === b || b.contains(top))),
                op: Number(op.toFixed(2)),
                bg: getComputedStyle(b).backgroundColor,
                dark: alpha >= 0.6 && lum < 0.5,
                h: Math.round(r.height),
              };
            });
          await page.mouse.move(2, 2);
          const rest = await look();
          await page.hover('[data-di-tr-check]', { force: true });
          const hovered = await look();
          await page.mouse.move(2, 2);
          check(
            rest && rest.onTop && rest.op >= 0.35 && rest.dark && rest.h >= 28,
            `${card} · question ${i + 1} (${q.kind}): the « تحقّق » button is seen on the sheet (${JSON.stringify(rest)})`,
          );
          if (!TOUCH)
            check(
              hovered && hovered.dark,
              `${card} · question ${i + 1} (${q.kind}): under the mouse, « تحقّق » keeps its dark background (hovered: ${hovered?.bg})`,
            );
          const lines = await page.locator('.di-sheet__line').allTextContents();
          const inputs = await page.locator('.di-sheet__line input').count();
          const selects = await page.locator('.di-sheet__line select').count();
          if (q.kind === 'judge')
            check(
              lines.length === 2 && inputs === 1 && selects === 1 && lines[1].includes(`القسمة على ${q.b}`),
              `${card}: « the reading = [ ] », then « ${q.n} [يقبل / لا يقبل] القسمة على ${q.b} » — one box, one choice`,
            );
          if (q.kind === 'digit')
            check(
              lines.length === 1 && inputs === 1 && lines[0].includes(String(q.pre)),
              `${card}: « ${q.pre}[ ]${q.post ?? ''} » — the box sits where the digit is missing`,
            );
          if (q.kind === 'rest')
            check(
              lines.length === 2 &&
                (await page.locator('.di-sheet__line').first().locator('input').count()) === 2 &&
                lines[0].includes(String(q.a)) &&
                selects === 1,
              `${card}: « ${q.a} = ${q.b} × [ ] + [ ] », then the verdict`,
            );
          if (q.kind === 'phrase')
            check(lines.length === 3 && selects === 3, `${card}: three lines, a sentence chosen in each`);
        }
      }
      if (!seen.has(`${q.kind}:${q.format}`)) {
        seen.add(`${q.kind}:${q.format}`);
        await shot(page, `tr-${card}-${i + 1}-${q.kind}-${q.format}`, { exit: ['[data-di-know-close]'] });
      }
      const plan = i === 0 || i === 2 ? 'wrong-right' : i === 4 ? 'wrong-wrong' : 'right';
      firstTries.push({
        q,
        first: plan === 'right' ? 'right' : 'wrong',
        value: plan === 'right' ? solve(q) : wrongOf(q),
      });
      if (plan === 'right') {
        await reply(q, solve(q));
        await page.waitForTimeout(150);
        expect(
          (await tr()).fb === 'ok',
          `${card} · question ${i + 1} (${q.kind}): the right answer is accepted at once`,
        );
      } else {
        await reply(q, wrongOf(q));
        await page.waitForTimeout(150);
        let f = await tr();
        expect(
          f.fb === 'hint',
          `${card} · question ${i + 1} (${q.kind}): a wrong answer gets a HINT first (« ${f.fbText.trim().slice(0, 70)} »)`,
        );
        if (i === 0 || i === 2) await shot(page, `tr-${card}-hint-${q.kind}`, { exit: ['[data-di-know-close]'] });
        if (plan === 'wrong-right') {
          await reply(q, solve(q));
          await page.waitForTimeout(150);
          f = await tr();
          expect(f.fb === 'ok', `${card} · question ${i + 1} (${q.kind}): …then the right answer is accepted`);
        } else {
          await reply(q, wrongOf(q));
          await page.waitForTimeout(150);
          f = await tr();
          expect(
            f.fb === 'fix' && f.fbText.includes('التصحيح'),
            `${card} · question ${i + 1} (${q.kind}): a second wrong answer gets the written correction`,
          );
          await shot(page, `tr-${card}-fix-${q.kind}`, { exit: ['[data-di-know-close]'] });
          if (await page.locator('[data-di-tr-model]').count()) {
            await page.click('[data-di-tr-model]');
            await page.waitForSelector('[data-di-model]');
            for (let k = 0; k < 12 && (await page.locator('[data-di-model-next]').count()); k += 1)
              await page.click('[data-di-model-next]');
            await shot(page, `tr-${card}-model`, { exit: ['[data-di-model-close]'] });
            await page.click('[data-di-model-close]');
          }
        }
      }
      if (i === 5)
        expect(
          (await page.locator('[data-di-tr-next]').count()) === 1,
          `${card}: after the last answer, « أنهِ التدريب »`,
        );
      await page.click('[data-di-tr-next]');
      await page.waitForTimeout(150);
    }
    expect(
      formats.join(',') === 'game,game,exam,game,exam,exam',
      `${card}: the formats alternate and end on the exam: ${formats.join(', ')}`,
    );
    const kinds = new Set(firstTries.map((x) => x.q.kind));
    expect(
      TRAIN[card].every((k) => kinds.has(k)),
      `${card}: the session asked ${[...kinds].join(', ')}`,
    );
    expect(
      (await page.locator('[data-di-trainer="done"][data-di-tr-stars="1"]').count()) === 1,
      `${card}: three right at the first try of six — 1 star`,
    );
    await shot(page, `tr-${card}-done`, { exit: ['[data-di-know-close]'] });
    expect(
      (await page.evaluate(() => window.__world.getState().know.trained))[card] === 1,
      `${card}: the star is saved on the card`,
    );
    // الكفاءات: the FIRST try of every exam question whose claim the server can re-compute — right or wrong — is sent;
    // never a true / false, never a second try
    const posts = (await page.evaluate(() => window.__posts ?? [])).slice(sent0).map((p) => p.body);
    const owed = firstTries.filter((x) => x.q.format === 'exam' && EVIDENCE.includes(x.q.kind));
    expect(posts.length === owed.length, `${card}: ${owed.length} answers are sent as evidence (sent ${posts.length})`);
    for (const [k, p] of posts.entries()) {
      const x = owed[k];
      const { want, truth } = claimOf(x.q, x.value);
      expect(
        p.context === 'trainer' &&
          typeof p.attemptId === 'string' &&
          p.attemptId.length > 6 &&
          p.learningPoint === `${GRADE}_${ID}_${POINT[x.q.key]}` &&
          same(p.claim, want) &&
          truth === (x.first === 'right'),
        `${card}: evidence ${k + 1} (${x.q.kind}, ${p.learningPoint}) carries what he WROTE at the first try — claim ${JSON.stringify(p.claim).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`,
      );
    }
    allPosts.push(...posts);
  }
  expect(
    new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length && allPosts.length === 8,
    `every evidence has its own attempt id (${allPosts.length}: two per card — the reading, the digit, the division, the sentence)`,
  );
  await page.click('[data-di-know-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« خريطة المعارف » closes back to the title screen',
  );
});
