// « تدرّب » of lesson `khawass-qawasim` (lesson 3), as a STUDENT — copied from lesson 2's gameworld-qawasim-trainer.mjs.
// On the full « خريطة المعارف », four cards are trained — المجموع والفرق, المضاعفات, باقي القسمة, البرهان — six questions
// each, so EVERY kind of question of the lesson's `world/trainer.js` is played through its screen: tap (the gates), true /
// false (game, and exam with its reason), sumDiff (« a ± b = d × [ ] »), multiple (« a × n = d × [ ] »), rest (the division
// then « الباقي = d × [ ] »), proof (three words chosen in their sentence). In each session: a wrong then a right answer
// (the hint), a right one at the first try, two wrong (the written correction — and, for the division of « باقي القسمة »,
// its model sheet, opened and read to its end).
// Before the sessions, ONE CARD is read as a card: a common mistake (the wrong sentence first, the rest uncovered by him,
// its numbers computed here), then the memo sheet of a key and its two questions — answered wrong, then right: sealed.
// The right answers are computed HERE from the numbers of the question (a proof's right product: by putting numbers in
// the letters), never taken from the lesson. What is posted as evidence (exam format, first try) is captured and asserted:
// a HALF-right first try (the sum right and the difference wrong; the division right and « الباقي = d × k » wrong) must be
// sent as a FALSE claim.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-khawass-trainer.mjs [outDir]
import { createWalk, lessonUrl, QAWASIM_WORDS, QAWASIM_NUMBERS, TOUCH } from './lib/walk.mjs';

const ID = 'khawass-qawasim';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
const KEYS = ['jam-wal-farq', 'madaaf', 'baqi-qisma', 'burhan'];
const POINT = { 'jam-wal-farq': 'P1', madaaf: 'P2', 'baqi-qisma': 'P3', burhan: 'P4' };
const CARDS = [
  'khawass',
  'majmu',
  'rappel',
  'khata-aks',
  'mudaaf',
  'mithal-1800',
  'baqi',
  'mithal-735',
  'bila-qisma',
  'burhan',
  'khata-mithal',
  'khulasa',
];
/** The kinds each trained card must show (the plans of world/trainer.js: jam, madaaf, baqi, burhan). */
const TRAIN = {
  majmu: ['tap', 'tf', 'sumDiff'],
  mudaaf: ['tap', 'tf', 'multiple'],
  baqi: ['tap', 'tf', 'rest'],
  burhan: ['tap', 'tf', 'proof'],
};
// the 12 px floor is on by default (lib/walk.mjs), the knowledge map included
const w = createWalk('gameworld-khawass-trainer', { foreign: QAWASIM_WORDS, foreignNumbers: QAWASIM_NUMBERS });
const { expect, check, shot } = w;

/** Is gate value n right for this wave? Computed HERE. */
const gateRight = (x, n) =>
  ({
    missing: () => n * x.b === x.a,
    divides: () => n >= 1 && x.a % n === 0,
    multipleOf: () => n >= 1 && n % x.b === 0,
    divisibleBy: () => n >= 1 && n % x.b === 0,
    remainder: () => n === x.a % x.b,
  })[x.type]();
/**
 * A word of a proof written with × and −, evaluated with numbers in the letters. The lesson's letters are k and k′
 * (a = d × k, b = d × k′): k′ is read as `j`.
 */
const evalLetters = (text, v) =>
  Function(
    ...Object.keys(v),
    `return ${text.replace(/k′/g, 'j').replace(/×/g, '*').replace(/−/g, '-')};`,
  )(...Object.values(v));
/** The option of a choice slot of a form whose text passes `test`. */
const choiceOf = (q, slot, test) => {
  const t = q.form.lines.flatMap((l) => l.tokens).find((x) => x && x.choice === slot);
  const hit = t.options.filter((o) => test(o.text));
  expect(
    hit.length === 1,
    `proof « ${q.target} », slot ${slot}: exactly one option fits (${t.options.map((o) => o.text).join(' | ')})`,
  );
  return hit[0].id ?? String(hit[0].value);
};
const otherChoice = (q, slot, right) => {
  const t = q.form.lines.flatMap((l) => l.tokens).find((x) => x && x.choice === slot);
  const o = t.options.find((x) => (x.id ?? String(x.value)) !== right);
  return o.id ?? String(o.value);
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
    case 'sumDiff':
      return { s: (q.a + q.b) / q.d, f: (q.a - q.b) / q.d };
    case 'multiple':
      return { k: (q.a * q.n) / q.d };
    case 'rest': {
      const r = q.a % q.b;
      return { q: Math.floor(q.a / q.b), r, k: r / q.d };
    }
    case 'proof': {
      // the goal, as written on the sheet, and its right product: equal for every number put in the letters
      const goal = q.form.lines[2].tokens[0];
      const tries = [
        { d: 3, k: 7, j: 2, n: 5 },
        { d: 11, k: 4, j: 3, n: 9 },
      ];
      const same = (text) =>
        tries.every((v) => evalLetters(text, v) === evalLetters(goal.replace('a', '(d*k)').replace('b', '(d*j)'), v));
      // one pair of letters in the whole lesson: no p, no q (q is the quotient of a division) in what the sheet writes
      const written = q.form.lines
        .flatMap((l) => l.tokens)
        .flatMap((t) => (t?.options ? t.options.map((o) => o.text) : [String(t)]));
      const second = q.target === 'mult' ? 'k' : 'k′'; // « n × a » has one number to write: a = d × k
      expect(
        written.some((t) => t.includes(second)) && !written.some((t) => /[pq]/.test(t)),
        `proof « ${q.target} »: written with k and k′, never p or q (${written
          .filter((t) => /[a-z]/.test(t))
          .slice(0, 3)
          .join(' | ')})`,
      );
      return {
        start: choiceOf(q, 'start', (t) => t.startsWith('d يقسم') && !/[+−×]/.test(t)),
        k: choiceOf(q, 'k', same),
        nat: choiceOf(q, 'nat', (t) => t.endsWith('عدد طبيعي')),
      };
    }
    default:
      throw new Error(`unknown kind ${q.kind}`);
  }
}
/**
 * A wrong answer of the same shape — one whose claim (when it is evidence) must be FALSE. The answers in several parts
 * are HALF-right on purpose: the first part is right, the part that carries the الكفاءة of the lesson is not.
 */
function wrongOf(q) {
  const r = solve(q);
  switch (q.kind) {
    case 'tap':
      return q.options.find((n) => n !== r);
    case 'tf':
      return { truth: !r.truth, reason: r.reason };
    case 'sumDiff':
      return { s: r.s, f: r.f + 1 }; // the sum is right, the difference is not
    case 'multiple':
      return { k: r.k + 1 };
    case 'rest':
      return { q: r.q, r: r.r, k: r.k + 1 }; // the division is right, « الباقي = d × k » is not
    case 'proof':
      return { ...r, start: otherChoice(q, 'start', r.start) };
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
    uid: 9811,
    lessonId: ID,
    url: URL,
    seed: { [`u_9811_smarter_world_${ID}`]: save },
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

  // ══════════════════════════ one CARD, read as a card ══════════════════════════
  const kstate = () =>
    page.evaluate(() => {
      const k = window.__world.getState().know;
      return { read: k.read, sealed: k.sealed };
    });
  /** The TeX of the formulas drawn inside `sel` (KaTeX keeps it in its annotation). */
  const texIn = (sel) =>
    page.evaluate(
      (s) =>
        [...document.querySelectorAll(`${s} annotation`)].map((x) => x.textContent.replace(/\\displaystyle\s*/, '')),
      sel,
    );
  {
    // a common mistake — the converse: 7 divides 42 = 22 + 20, « so it divides 22 and 20 »
    await page.click('[data-di-knode="khata-aks"]');
    await page.waitForSelector('[data-di-kpanel="khata-aks"]');
    await page.waitForTimeout(250);
    const P = '[data-di-kpanel="khata-aks"]';
    expect(
      (await page.locator(`${P} [data-di-tab]`).count()) === 2 &&
        (await page.getAttribute(`${P} [data-di-tab="card"]`, 'aria-selected')) === 'true' &&
        ((await page.textContent(`${P} .di-kpanel__head h3`)) ?? '').trim().length > 2,
      'a card opens in its panel: its kind, its title, its two tabs (the card, « تدرّب ») — the card first',
    );
    const wrong = (await page.textContent(`${P} .di-parts .is-wrong`)) ?? '';
    const sum = 22 + 20;
    expect(
      sum % 7 === 0 && 22 % 7 !== 0 && 20 % 7 !== 0 && ['7', String(sum), '22', '20'].every((x) => wrong.includes(x)),
      `the card of a common mistake shows the WRONG sentence first, with the story's numbers (7 divides ${sum} = 22 + 20, neither 22 nor 20): « ${wrong.trim().slice(0, 60)} »`,
    );
    expect(
      (await page.locator(`${P} [data-di-uncover]`).count()) === 1 &&
        (await page.locator(`${P} .di-parts .is-why, ${P} .di-parts .is-right`).count()) === 0 &&
        (await page.getAttribute('[data-di-knode="khata-aks"]', 'data-read')) === 'false' &&
        !(await kstate()).read.includes('khata-aks'),
      'the reason and the right sentence are NOT shown before he asks: the card is not read yet',
    );
    await shot(page, 'know-card-mistake', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    // what is read before he uncovers it: opening « خريطة المعارف » reads the card it opens on (the root, since the journey of
    // the knowledge page): this card adds ONE to it
    const readBefore = (await kstate()).read;
    const countedBefore = Number(await page.getAttribute('[data-di-know-read]', 'data-di-know-read'));
    await page.click(`${P} [data-di-uncover]`);
    await page.waitForSelector(`${P} .di-parts .is-right`);
    const why = await texIn(`${P} .di-parts .is-why`);
    expect(
      why.some((f) => f.replace(/\s/g, '') === `22=7\\times${Math.floor(22 / 7)}+${22 % 7}`),
      `uncovered, the card proves it with the division, computed here: 22 = 7 × ${Math.floor(22 / 7)} + ${22 % 7} (${why.join(' · ')})`,
    );
    const nowRead = {
      uncover: await page.locator(`${P} [data-di-uncover]`).count(),
      right: await page.locator(`${P} .di-parts .is-right`).count(),
      ticked: await page.getAttribute('[data-di-knode="khata-aks"]', 'data-read'),
      saved: (await kstate()).read.join(),
      counted: await page.getAttribute('[data-di-know-read]', 'data-di-know-read'),
    };
    expect(
      nowRead.uncover === 0 &&
        nowRead.right === 1 &&
        nowRead.ticked === 'true' &&
        nowRead.saved === [...readBefore, 'khata-aks'].join() &&
        Number(nowRead.counted) === countedBefore + 1,
      `the card is now READ: ticked on the map, counted at the top of the page, saved — one more than before (${readBefore.join() || 'none'}): ${JSON.stringify(nowRead)}`,
    );
    await shot(page, 'know-card-mistake-read', { exit: ['[data-di-know-close]'], sound: true, numbers: true });

    // the card of a key: its memo sheet, then its two questions — wrong, then right
    await page.click('[data-di-knode="majmu"]');
    await page.waitForSelector('[data-di-kpanel="majmu"]');
    const K = '[data-di-kpanel="majmu"]';
    expect(
      (await page.locator(`${K} [data-di-tab]`).evaluateAll((els) => els.map((e) => e.dataset.diTab))).join() ===
        'card,memo,quiz,train',
      'the card of a KEY has four tabs: the card, its memo sheet, its questions, « تدرّب »',
    );
    await page.click(`${K} [data-di-tab="memo"]`);
    await page.waitForSelector(`${K} .di-memo`);
    {
      const rows = await page.locator(`${K} .di-memo > div`).count();
      const tex = await texIn(`${K} .di-memo`);
      const plain = await page
        .locator(`${K} .di-memo dd`)
        .evaluateAll((els) => els.filter((e) => !e.querySelector('.katex')).map((e) => e.textContent));
      expect(
        rows === 5 && tex.length === 2 && plain.length === 3 && plain.every((t) => t.trim().length > 5),
        `the memo sheet: the rule and its example drawn as formulas, the sentence that sticks, the trap, what to do in the exam (${rows} rows)`,
      );
      // the example is the story's: 7 divides 21 and 35, so 56 and 14 — every number computed here
      expect(
        tex.some((f) => ['7', '21', '35', String(21 + 35), String(35 - 21)].every((x) => f.includes(x))),
        `its example says 7 | 21, 7 | 35 ⇒ 7 | ${21 + 35}, 7 | ${35 - 21} (${tex.join(' · ').slice(0, 90)})`,
      );
      check(!plain.some((t) => /\$|\\[a-zA-Z]{2,}/.test(t)), 'no raw formula in the sentences of the memo sheet');
    }
    await shot(page, 'know-card-memo', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click(`${K} [data-di-tab="quiz"]`);
    await page.waitForSelector(`${K} [data-di-quiz-check]`);
    const options = await page.locator(`${K} [data-di-quiz]`).evaluateAll((els) =>
      els.map((e) => ({
        id: e.dataset.diQuiz,
        text: e.textContent,
        tex: [...e.querySelectorAll('annotation')].map((x) => x.textContent.replace(/\\displaystyle\s*/, '')),
      })),
    );
    expect(
      options.length === 6 && (await page.locator(`${K} [data-di-quiz-check][disabled]`).count()) === 1,
      'two questions of three choices; « تحقّق » waits until both are answered',
    );
    // question 1: « 7 divides 21 and 35, so 7 divides… » — the walk evaluates each choice
    const valueOf = (tex) => {
      const t = tex.replace(/\s/g, '');
      if (t.includes('\\div')) return NaN; // a quotient: not a number the key speaks of
      return t.split(/(?=[+-])/).reduce((s, x) => s + Number(x), 0);
    };
    const q1 = options.filter((o) => o.id.startsWith('0-'));
    const right1 = q1.filter((o) => Number.isInteger(valueOf(o.tex[0])) && valueOf(o.tex[0]) % 7 === 0);
    expect(
      right1.length === 1 && valueOf(right1[0].tex[0]) === 35 - 21,
      `question 1: exactly one choice is a number 7 surely divides — 35 − 21 = 14 (${q1.map((o) => o.tex[0]).join(' | ')})`,
    );
    // question 2: « 7 divides 42 = 22 + 20, so… » — a choice that says « 7 divides N » is right only if it does
    const q2 = options.filter((o) => o.id.startsWith('1-'));
    const claims = (o) => (o.text.trim().startsWith('لا') ? null : Number(o.tex.at(-1)));
    const right2 = q2.filter((o) => claims(o) === null || claims(o) % 7 === 0);
    expect(
      right2.length === 1 && claims(right2[0]) === null && q2.filter((o) => claims(o) !== null).length === 2,
      `question 2: 7 divides neither 22 nor 20 — the one right choice is the one that claims nothing (${q2.map((o) => claims(o) ?? '—').join(' | ')})`,
    );
    const wrong1 = q1.find((o) => o.id !== right1[0].id);
    await page.click(`${K} [data-di-quiz="${wrong1.id}"]`);
    await page.click(`${K} [data-di-quiz="${right2[0].id}"]`);
    await page.click(`${K} [data-di-quiz-check]`);
    await page.waitForTimeout(200);
    expect(
      (await page.locator(`${K} .di-quiz .di-feedback`).count()) === 1 &&
        (await page.locator(`${K} .di-quiz__gold`).count()) === 0 &&
        (await kstate()).sealed.length === 0,
      'one wrong choice of two: the sheet is NOT sealed, he is asked to look again',
    );
    await shot(page, 'know-card-quiz-retry', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click(`${K} [data-di-quiz="${right1[0].id}"]`);
    await page.click(`${K} [data-di-quiz-check]`);
    await page.waitForSelector(`${K} .di-quiz__gold`);
    expect(
      (await kstate()).sealed.join() === 'jam-wal-farq' &&
        (await page.getAttribute('[data-di-know-sealed]', 'data-di-know-sealed')) === '1' &&
        (await page.locator('[data-di-knode="majmu"].is-gold').count()) === 1,
      'both right: the memo sheet of « المجموع والفرق » is SEALED — gold on the map, counted, saved',
    );
    await shot(page, 'know-card-quiz-sealed', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
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
      if (q.kind === 'proof') await page.selectOption(`[data-di-tr="${k}"]`, x);
      else await page.fill(`[data-di-tr="${k}"]`, String(x));
    }
    await page.click('[data-di-tr-check]');
  };
  const knode = async (id) => {
    const n = page.locator(`[data-di-knode="${id}"]`);
    if (!(await n.isVisible())) await page.click('[data-di-tab="card"]');
    await n.click();
  };

  const allPosts = [];
  let modelsRead = 0;
  let halfRight = 0;
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
      const nums = q.kind === 'tap' ? [q.wave.a ?? q.wave.b] : q.kind === 'tf' || q.kind === 'proof' ? [] : [q.a];
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
          if (q.kind === 'sumDiff')
            check(
              lines.length === 2 &&
                lines[0].includes('+') &&
                lines[1].includes('−') &&
                (await page.locator('.di-sheet__line input').count()) === 2,
              `${card}: « a + b = d × [ ] » then « a − b = d × [ ] », one box each`,
            );
          if (q.kind === 'multiple')
            check(
              lines.length === 1 &&
                lines[0].includes('×') &&
                (await page.locator('.di-sheet__line input').count()) === 1,
              `${card}: « a × n = d × [ ] », one box`,
            );
          if (q.kind === 'rest')
            check(
              lines.length === 2 &&
                (await page.locator('.di-sheet__line').first().locator('input').count()) === 2 &&
                lines[1].includes('الباقي'),
              `${card}: « a = b × [ ] + [ ] », then « الباقي = d × [ ] »`,
            );
          if (q.kind === 'proof')
            check(
              (await page.locator('.di-sheet__line select').count()) === 3 && lines[0].includes('نبدأ من'),
              `${card}: the proof is three words chosen INSIDE its sentences (« نبدأ من … »)`,
            );
        }
      }
      if (!seen.has(`${q.kind}:${q.format}`)) {
        seen.add(`${q.kind}:${q.format}`);
        await shot(page, `tr-${card}-${i + 1}-${q.kind}-${q.format}`, { exit: ['[data-di-know-close]'] });
      }
      // questions 1, 3 and 5 are missed at the first try (one of them twice: the written correction). On « باقي القسمة »
      // the question missed twice is the DIVISION (question 3), so that its model sheet is opened; elsewhere question 5.
      const twice = card === 'baqi' ? 2 : 4;
      const plan = i === twice ? 'wrong-wrong' : i === 0 || i === 2 || i === 4 ? 'wrong-right' : 'right';
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
          // the model sheet: offered beside the correction of a question that poses a division, and of no other
          const posed = q.kind === 'rest';
          expect(
            ((await page.locator('[data-di-tr-model]').count()) === 1) === posed,
            `${card} · question ${i + 1} (${q.kind}): ${posed ? 'its model sheet is offered beside the correction' : 'no model sheet — it poses no division'}`,
          );
          if (posed) {
            await page.click('[data-di-tr-model]');
            await page.waitForSelector('[data-di-model]');
            expect(
              (await page.getAttribute('[data-di-model]', 'data-di-model')) === 'own' &&
                (await page.getAttribute('[data-di-model]', 'data-di-model-a')) === String(q.a) &&
                (await page.getAttribute('[data-di-model]', 'data-di-model-b')) === String(q.b),
              `${card}: after the correction the model sheet poses HIS division: ${q.a} ÷ ${q.b}`,
            );
            let taps = 0;
            for (; taps < 12 && (await page.locator('[data-di-model-next]').count()); taps += 1)
              await page.click('[data-di-model-next]');
            const final = (await page.textContent('[data-di-model]')) ?? '';
            expect(
              taps >= 1 &&
                (await page.locator('[data-di-model-next]').count()) === 0 &&
                (await page.locator('[data-di-model-close]').count()) === 1 &&
                [Math.floor(q.a / q.b), q.a % q.b].every((x) => final.includes(String(x))),
              `${card}: read step by step (${taps} taps) to its end — the quotient ${Math.floor(q.a / q.b)} and the remainder ${q.a % q.b}, computed here, are on the sheet`,
            );
            await shot(page, `tr-${card}-model`, { exit: ['[data-di-model-close]'] });
            await page.click('[data-di-model-close]');
            await page.waitForTimeout(150);
            expect(
              (await page.locator('[data-di-model]').count()) === 0 && (await tr()).fb === 'fix',
              `${card}: closing the model sheet comes back to the correction`,
            );
            modelsRead += 1;
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
    // never a true / false, never a proof written with letters, never a second try
    const posts = (await page.evaluate(() => window.__posts ?? [])).slice(sent0).map((p) => p.body);
    const owed = firstTries.filter((x) => x.q.format === 'exam' && ['sumDiff', 'multiple', 'rest'].includes(x.q.kind));
    expect(posts.length === owed.length, `${card}: ${owed.length} answers are sent as evidence (sent ${posts.length})`);
    if (owed.length)
      expect(
        posts.every(
          (p) =>
            p.context === 'trainer' &&
            typeof p.attemptId === 'string' &&
            p.attemptId.length > 6 &&
            p.learningPoint === `4am_${ID}_${POINT[owed[0].q.key]}`,
        ),
        `${card}: each is { attemptId, learningPoint 4am_${ID}_${POINT[owed[0].q.key]}, context « trainer », claim }`,
      );
    for (const [k, p] of posts.entries()) {
      const x = owed[k];
      const c = p.claim;
      const v = x.value;
      const { a, b, d } = x.q;
      // which part of what he wrote the claim states, decided HERE from his numbers: the first part that is wrong —
      // or, when the first part is right, the part that is this lesson's الكفاءة (the difference; the remainder = d × k)
      const sumRight = x.q.kind === 'sumDiff' && d * Number(v.s) === a + b;
      const divided = x.q.kind === 'rest' && b * Number(v.q) + Number(v.r) === a && Number(v.r) < b;
      const shapeOk = {
        sumDiff: () =>
          c.kind === 'pair' &&
          c.b === d &&
          (sumRight ? c.a === a - b && c.e === Number(v.f) : c.a === a + b && c.e === Number(v.s)),
        multiple: () => c.kind === 'pair' && c.a === a * x.q.n && c.b === d && c.e === Number(v.k),
        rest: () =>
          divided
            ? c.kind === 'pair' && c.a === a % b && c.b === d && c.e === Number(v.k)
            : c.kind === 'division' && c.a === a && c.b === b && c.q === Number(v.q) && c.r === Number(v.r),
      }[x.q.kind]();
      // the verdict the server will compute, computed here: a wrong first try makes a FALSE claim, a right one a TRUE claim
      const truth = {
        pair: () => c.e > 0 && c.b * c.e === c.a,
        division: () => c.b * c.q + c.r === c.a && c.r >= 0 && c.r < c.b,
      }[c.kind]();
      expect(
        shapeOk && truth === (x.first === 'right'),
        `${card}: evidence ${k + 1} (${x.q.kind}) carries what he WROTE at the first try — claim ${JSON.stringify(c).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`,
      );
      if (x.first === 'wrong' && (sumRight || divided)) {
        halfRight += 1;
        expect(
          truth === false,
          `${card}: a HALF-right first try (${x.q.kind}: ${sumRight ? 'the sum right, the difference wrong' : 'the division right, the remainder not written d × k'}) is sent as a FALSE claim — no الكفاءة is credited`,
        );
      }
    }
    allPosts.push(...posts);
  }
  expect(
    new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length && allPosts.length === 6,
    `every evidence has its own attempt id (${allPosts.length}: two per card, none for the proof)`,
  );
  expect(
    halfRight === 2,
    `two half-right first tries were sent and judged false: a sum without its difference, a division without « الباقي = d × k » (${halfRight})`,
  );
  expect(modelsRead === 1, `the model sheet of a division was opened and read to its end (${modelsRead})`);
  await page.click('[data-di-know-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« خريطة المعارف » closes back to the title screen',
  );
});
