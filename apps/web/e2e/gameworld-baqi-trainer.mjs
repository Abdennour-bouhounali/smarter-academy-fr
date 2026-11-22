// « تدرّب » of lesson `qisma-iqlidiya-baqi` (1AM « القسمة الإقليدية »), as a STUDENT — copied from lesson 3's
// gameworld-khawass-trainer.mjs. On the full « خريطة المعارف », first TWO CARDS ARE READ AS CARDS (the memo sheet of the
// fifth key and its two-question test — a wrong pick, then the right ones: the rule is sealed; a « common mistake » card,
// uncovered). Then five cards are trained — المجموعات الكاملة, الباقي أصغر من المقسوم عليه, مساواة القسمة, تقدير الحاصل,
// الباقي في مسألة — six questions each, so EVERY kind of question of the lesson's
// `world/trainer.js` is played through its screen: tap (the gates), true / false (game, and exam with its reason), division
// (« a = b × [ ] + [ ] », by one digit and by two), fix (a verdict chosen inside its sentence, then the division), dividend
// (« [ ] = b × q + r », then the biggest remainder), problem (the division, then ONE of three questions: how many are
// full, how many are needed, how many are left out). In each session: a wrong then a right
// answer (the hint), a right one at the first try, two wrong (the written correction, the model sheet when the question
// has one). The right answers are computed HERE from the numbers of the question, never taken from the lesson. What is
// posted as evidence (exam format, first try) is captured and asserted: a wrong first try is a FALSE claim.
// NOT RUN since the lesson's fifth key was written (2026-11-19): `node --check` only.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-baqi-trainer.mjs [outDir]
import { createWalk, TOUCH } from './lib/walk.mjs';
import { ID, GRADE, URL, KEYS, BAQI_FOREIGN, BAQI_FOREIGN_NUMBERS } from './lib/baqi.mjs';

/** The الكفاءة each key proves (world/evidence.js › POINTS). */
const POINT = {
  'majmuaat-kamila': 'P1',
  'baqi-asghar': 'P2',
  'musawat-qisma': 'P2',
  'taqdir-hasil': 'P1',
  'baqi-fi-masala': 'P3',
};
/** The cards of the lesson's mind map (world/knowledge.js › KNOWLEDGE_GRAPH). */
const CARDS = [
  'qisma',
  'kamila',
  'rappel',
  'mithal-kamila',
  'asghar',
  'khata-baqi',
  'musawat',
  'asmaa',
  'mithal-musawat',
  'taqdir',
  'mithal-taqdir',
  'masala',
  'khata-masala',
  'khulasa',
];
/** The kinds each trained card must show (the plans of world/trainer.js: kamila, asghar, musawat, taqdir, masala). */
const TRAIN = {
  kamila: ['tap', 'tf', 'division'],
  asghar: ['tap', 'tf', 'fix'],
  musawat: ['tap', 'tf', 'dividend'],
  taqdir: ['tap', 'tf', 'division'],
  masala: ['tap', 'tf', 'problem'],
};
/** The kinds whose first try is evidence (the server re-computes them): every exam kind but the true / false. */
const EVIDENCE = ['division', 'fix', 'dividend', 'problem'];
/** The answer of a problem: the number of the division its question (`ask`) reads — computed HERE. */
const problemAnswer = (q) => ({ full: Math.floor(q.a / q.b), need: Math.ceil(q.a / q.b), left: q.a % q.b })[q.ask];
// the 12 px floor is on by default (lib/walk.mjs); a question draws its numbers at random, so the foreign numbers are
// read only where a screen passes `numbers` (the map, never a question)
const w = createWalk('gameworld-baqi-trainer', { foreign: BAQI_FOREIGN, foreignNumbers: BAQI_FOREIGN_NUMBERS });
const { expect, check, shot } = w;

const quo = (a, b) => Math.floor(a / b);
/** Is gate value n right for this wave? Computed HERE (the Euclidean division of a by b). */
const gateRight = (x, n) =>
  ({
    quotient: () => n === quo(x.a, x.b),
    quotientBig: () => n === quo(x.a, x.b),
    fixDivision: () => n === quo(x.a, x.b),
    remainder: () => n === x.a % x.b,
    missingRest: () => n === x.a % x.b,
    missingQuotient: () => n * x.b + x.r === x.a,
    dividend: () => n === x.b * x.q + x.r,
    possibleRest: () => n >= 0 && n < x.b,
    maxRest: () => n === x.b - 1,
    tensOf: () => n === Math.floor(quo(x.a, x.b) / 10),
    cabinsNeeded: () => n === Math.ceil(x.a / x.b),
    cabinsFull: () => n === quo(x.a, x.b),
    leftOut: () => n === x.a % x.b,
  })[x.type]();
/** The option of a choice slot (`verdict`) whose text passes `test`. */
const choiceOf = (q, slot, test) => {
  const t = q.form.lines.flatMap((l) => l.tokens).find((x) => x && x.choice === slot);
  const hit = t.options.filter((o) => test(o.text));
  expect(
    hit.length === 1,
    `${q.kind}, slot ${slot}: exactly one option fits (${t.options.map((o) => o.text).join(' | ')})`,
  );
  return hit[0].id ?? String(hit[0].value);
};
/** The right answer of a question, from its numbers. (A true / false is judged by the statement the lesson wrote: its `truth`.) */
function solve(q) {
  switch (q.kind) {
    case 'tap': {
      const ok = q.options.filter((n) => gateRight(q.wave, n));
      expect(ok.length === 1, `tap « ${q.wave.type} » (${q.options.join(', ')}): exactly one gate is right`);
      return ok[0];
    }
    case 'tf':
      return { truth: q.truth, reason: q.reasons ? q.reasons.findIndex((r) => r.ok) : null };
    case 'division':
      return { q: quo(q.a, q.b), r: q.a % q.b };
    case 'fix': {
      // the shown equality is right in its sum, but its remainder is not smaller than b: the option that says so
      const verdict = choiceOf(q, 'verdict', (t) => t.includes(String(q.shown.r)) && t.includes(String(q.b)));
      return { verdict, q: quo(q.a, q.b), r: q.a % q.b };
    }
    case 'dividend':
      return { a: q.b * q.quo + q.r, m: q.b - 1 };
    case 'problem':
      expect(['full', 'need', 'left'].includes(q.ask), `problem: it asks one of the three questions (${q.ask})`);
      return { q: quo(q.a, q.b), r: q.a % q.b, n: problemAnswer(q) };
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
    case 'division':
      return { q: r.q, r: r.r + 1 };
    case 'fix':
      return { ...r, r: r.r + 1 };
    case 'dividend':
      // the remainder forgotten
      return { a: q.b * q.quo, m: r.m };
    case 'problem':
      // the division right, the DECISION wrong: the quotient for the containers needed when something is left (one more
      // when nothing is), one too many for the full ones, one too many for those left out
      if (q.ask === 'need') return { ...r, n: r.r > 0 ? r.q : r.q + 1 };
      return { ...r, n: r.n + 1 };
    default:
      return null;
  }
}

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
    `« خريطة المعارف »: the ${CARDS.length} cards of the lesson, all open with the five keys`,
  );
  await shot(page, 'know-full', { exit: ['[data-di-know-close]'], sound: true, numbers: true });

  const tr = () =>
    page.evaluate(() => ({
      q: window.__trainer?.q,
      index: window.__trainer?.index,
      dom: document.querySelector('[data-di-trainer]')?.dataset.diTrainer,
      fb: document.querySelector('[data-di-tr-fb]')?.dataset.diTrFb ?? null,
      fbText: document.querySelector('[data-di-tr-fb]')?.textContent ?? '',
    }));
  const trainerText = () => page.textContent('[data-di-trainer]');
  /** Answers the question on screen with `v`, through its own controls. */
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
    for (const [k, x] of Object.entries(v)) {
      if (k === 'verdict') await page.selectOption(`[data-di-tr="${k}"]`, x);
      else await page.fill(`[data-di-tr="${k}"]`, String(x));
    }
    await page.click('[data-di-tr-check]');
  };
  const knode = async (id) => {
    const n = page.locator(`[data-di-knode="${id}"]`);
    if (!(await n.isVisible())) await page.click('[data-di-tab="card"]');
    await n.click();
  };

  // ── a card is READ AS A CARD before it is trained: the memo sheet of the fifth key, its test, a common mistake ──
  {
    // the numbers an element WRITES, in order — read from its formulas' source (a drawn formula repeats its digits)
    const numbersIn = (sel) =>
      page.$$eval(sel, (els) =>
        els.map((e) =>
          [...e.querySelectorAll('annotation')].flatMap((x) => (x.textContent.match(/\d+/g) ?? []).map(Number)),
        ),
      );
    await knode('masala');
    await page.waitForSelector('[data-di-kpanel="masala"]');
    expect(
      (await page.textContent('[data-di-kpanel="masala"]')).includes('الباقي في مسألة') &&
        (await page.locator('[data-di-tab="memo"]').count()) === 1 &&
        (await page.locator('[data-di-tab="quiz"]').count()) === 1,
      'the card « الباقي في مسألة » opens with its memo sheet and its test (it carries the fifth key)',
    );
    await page.click('[data-di-tab="memo"]');
    await page.waitForTimeout(250);
    {
      const memo = await page.textContent('[data-di-kbody]');
      expect(
        memo.includes('الممتلئة') && memo.includes('اللازمة') && !memo.includes('عشرات الحاصل'),
        'its memo sheet is the sheet of the PROBLEMS (full, needed, left out) — not the estimate of a quotient',
      );
    }
    await shot(page, 'card-masala-memo', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click('[data-di-tab="quiz"]');
    await page.waitForSelector('[data-di-quiz-check]');
    const sealed0 = Number(await page.getAttribute('[data-di-know-sealed]', 'data-di-know-sealed'));
    // each question writes its numbers (travellers, a cabin's load) first: the walk computes the cabins needed itself
    const asked = await numbersIn('.di-quiz__q > p');
    expect(
      asked.length === 2 && asked.every((x) => x.length >= 2),
      `the test asks two questions (${JSON.stringify(asked)})`,
    );
    const picks = [];
    for (let i = 0; i < 2; i += 1) {
      const [a, b] = asked[i];
      const need = Math.ceil(a / b);
      const opts = await numbersIn(`[data-di-quiz^="${i}-"]`);
      const right = opts.map((x) => x[0]).filter((x) => x === need);
      expect(
        right.length === 1,
        `question ${i + 1}: ${a} travellers, cabins of ${b} — exactly one option is ${need} (${opts.map((x) => x[0]).join(', ')})`,
      );
      picks.push(opts.findIndex((x) => x[0] === need));
    }
    // a wrong pick first (the quotient for the first question): the sheet is not sealed
    {
      const [a, b] = asked[0];
      const opts = await numbersIn('[data-di-quiz^="0-"]');
      const slip = opts.findIndex((x) => x[0] === Math.floor(a / b));
      expect(slip >= 0 && slip !== picks[0], `question 1 offers the classic slip: the quotient ${Math.floor(a / b)}`);
      await page.click(`[data-di-quiz="0-${slip}"]`);
      await page.click(`[data-di-quiz="1-${picks[1]}"]`);
      await page.click('[data-di-quiz-check]');
      await page.waitForTimeout(250);
      expect(
        (await page.locator('.di-quiz .di-feedback').count()) === 1 &&
          Number(await page.getAttribute('[data-di-know-sealed]', 'data-di-know-sealed')) === sealed0,
        'the quotient chosen for the cabins needed: the test asks him to look again, nothing is sealed',
      );
      await shot(page, 'card-masala-quiz-miss', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    }
    await page.click(`[data-di-quiz="0-${picks[0]}"]`);
    await page.click('[data-di-quiz-check]');
    await page.waitForTimeout(300);
    expect(
      Number(await page.getAttribute('[data-di-know-sealed]', 'data-di-know-sealed')) === sealed0 + 1 &&
        (await page.textContent('[data-di-tab="quiz"]')).includes('★'),
      'both answers right: the rule is sealed in gold (one more seal, a star on its test)',
    );
    await shot(page, 'card-masala-quiz', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    // a « common mistake » card: the wrong sentence first, the rest uncovered by HIM — then the card counts as read
    await knode('khata-masala');
    await page.waitForSelector('[data-di-kpanel="khata-masala"]');
    const read0 = Number(await page.getAttribute('[data-di-know-read]', 'data-di-know-read'));
    const alone = {
      uncover: await page.locator('[data-di-uncover]').count(),
      wrong: await page.locator('.di-parts .is-wrong').count(),
      right: await page.locator('.di-parts .is-right').count(),
    };
    expect(
      alone.uncover === 1 && alone.wrong === 1 && alone.right === 0,
      `the card of the mistake shows the wrong sentence alone: the correction is his to uncover (${JSON.stringify(alone)})`,
    );
    await page.click('[data-di-uncover]');
    await page.waitForTimeout(250);
    expect(
      (await page.locator('.di-parts .is-right').count()) === 1 &&
        Number(await page.getAttribute('[data-di-know-read]', 'data-di-know-read')) === read0 + 1 &&
        (await page.getAttribute('[data-di-knode="khata-masala"]', 'data-read')) === 'true',
      'uncovered: why it is wrong and the right answer — the card is read (one more on the counter)',
    );
    await shot(page, 'card-khata-masala', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
  }

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
      // a tap shows its divisor (a « □ = b × q + r » hides a); a dividend question gives b, q and r; the others show a
      const nums =
        q.kind === 'tap' ? [q.wave.b] : q.kind === 'tf' ? [] : q.kind === 'dividend' ? [q.b, q.quo] : [q.a, q.b];
      check(
        nums.every((x) => text.includes(String(x))),
        `${card} · question ${i + 1}: the screen says the question’s own number${nums.length ? ` (${nums.join(', ')})` : ''}`,
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
          const boxes = (i2) => page.locator('.di-sheet__line').nth(i2).locator('input').count();
          if (q.kind === 'division')
            check(
              lines.length === 1 && lines[0].includes(String(q.a)) && lines[0].includes('+') && (await boxes(0)) === 2,
              `${card}: « ${q.a} = ${q.b} × [ ] + [ ] », two boxes in the line`,
            );
          if (q.kind === 'fix')
            check(
              lines.length === 2 &&
                (await page.locator('.di-sheet__line').first().locator('select').count()) === 1 &&
                (await boxes(1)) === 2,
              `${card}: the verdict chosen INSIDE its sentence, then « a = b × [ ] + [ ] »`,
            );
          if (q.kind === 'dividend')
            check(
              lines.length === 2 && (await boxes(0)) === 1 && (await boxes(1)) === 1 && lines[1].includes('أكبر باقٍ'),
              `${card}: « [ ] = ${q.b} × ${q.quo} + ${q.r} », then « أكبر باقٍ ممكن = [ ] »`,
            );
          if (q.kind === 'problem')
            check(
              lines.length === 2 &&
                (await boxes(0)) === 2 &&
                (await boxes(1)) === 1 &&
                lines[1].includes(q.words[q.ask]) &&
                text.includes(q.words[q.ask]),
              `${card}: the division, then the question it asks — « ${q.words[q.ask]} = [ ] » (${q.ask})`,
            );
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
    // الكفاءات: the FIRST try of every exam question whose numbers the server can re-compute — right or wrong — is sent;
    // never a true / false, never a second try
    const posts = (await page.evaluate(() => window.__posts ?? [])).slice(sent0).map((p) => p.body);
    const owed = firstTries.filter((x) => x.q.format === 'exam' && EVIDENCE.includes(x.q.kind));
    expect(posts.length === owed.length, `${card}: ${owed.length} answers are sent as evidence (sent ${posts.length})`);
    if (owed.length)
      expect(
        posts.every(
          (p) =>
            p.context === 'trainer' &&
            typeof p.attemptId === 'string' &&
            p.attemptId.length > 6 &&
            p.learningPoint === `${GRADE}_${ID}_${POINT[owed[0].q.key]}`,
        ),
        `${card}: each is { attemptId, learningPoint ${GRADE}_${ID}_${POINT[owed[0].q.key]}, context « trainer », claim }`,
      );
    for (const [k, p] of posts.entries()) {
      const x = owed[k];
      const c = p.claim;
      const v = x.value;
      const written = () =>
        c.kind === 'division' && c.a === x.q.a && c.b === x.q.b && c.q === Number(v.q) && c.r === Number(v.r);
      const shapeOk = {
        division: written,
        fix: written,
        dividend: () =>
          c.kind === 'division' && c.a === Number(v.a) && c.b === x.q.b && c.q === x.q.quo && c.r === x.q.r,
        // a problem whose division is right claims the DECISION its question asks for
        problem: () =>
          c.a === x.q.a &&
          c.b === x.q.b &&
          {
            need: () => c.kind === 'fullNeeded' && c.full === Number(v.q) && c.need === Number(v.n),
            full: () => c.kind === 'bracket' && c.lo === Number(v.n) && c.hi === Number(v.n) + 1,
            left: () => c.kind === 'division' && c.q === Number(v.q) && c.r === Number(v.n),
          }[x.q.ask](),
      }[x.q.kind]();
      // the verdict the server will compute, computed here: a wrong first try makes a FALSE claim, a right one a TRUE claim
      const truth = {
        division: () => c.b * c.q + c.r === c.a && c.r >= 0 && c.r < c.b,
        fullNeeded: () => c.full === Math.floor(c.a / c.b) && c.need === Math.ceil(c.a / c.b),
        bracket: () => c.hi === c.lo + 1 && c.b * c.lo <= c.a && c.a < c.b * c.hi,
      }[c.kind]();
      expect(
        shapeOk && truth === (x.first === 'right'),
        `${card}: evidence ${k + 1} (${x.q.kind}) carries what he WROTE at the first try — claim ${JSON.stringify(c).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`,
      );
    }
    allPosts.push(...posts);
  }
  expect(
    new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length && allPosts.length === 10,
    `every evidence has its own attempt id (${allPosts.length}: two per card, none for a true / false)`,
  );
  await page.click('[data-di-know-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« خريطة المعارف » closes back to the title screen',
  );
});
