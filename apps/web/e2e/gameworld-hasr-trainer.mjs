// « تدرّب » of lesson `qisma-iqlidiya-hasr` (2AM), as a 2AM STUDENT — copied from lesson 3's gameworld-khawass-trainer.mjs.
// On the full « خريطة المعارف », four cards are trained, one per plan of the lesson's `world/trainer.js` — « القسمة على أيّ
// عدد » (the division), « حصر حاصل القسمة » (the bracket), « انعدام الباقي » (the zero remainder), « القسمة الإقليدية » (the
// mix) — six questions each, so EVERY kind of question is played through its screen: tap (the gates), true / false (game,
// and exam with its reason), division (« a = b × [ ] + [ ] »), bracket (« [ ] < a ÷ b < [ ] »), exact (the division, then
// the sentence chosen inside its line), needed (the full containers and the containers needed). In each session: a wrong
// then a right answer (the hint), a right one at the first try, two wrong (the written correction, the model sheet).
// The right answers are computed HERE from the numbers of the question, never taken from the lesson (a true / false is
// judged by the statement the lesson wrote: its `truth`). What is posted as evidence (exam format, first try) is captured
// and asserted, with the verdict the server will compute — computed here.
// A wrong first try is HALF wrong wherever the answer has two parts (the right upper end of a bracket with a wrong lower
// end, the right boxes needed with the full ones miscounted, the right division under « a يقسم b »): its claim must be
// FALSE — these three once verified true (world/evidence.js).
// BEFORE the training, five cards are READ as cards (opened from the map, their own text and drawn formulas checked): an
// example with a divisor of three digits, a common mistake uncovered (and marked read), the bank's fraction notation,
// a memo sheet, and the one sentence that links « المقسوم عليه » and « قاسم ».
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-hasr-trainer.mjs [outDir]
import { createWalk, TOUCH } from './lib/walk.mjs';
import {
  ID,
  GRADE,
  URL,
  KEYS,
  POINT,
  HASR_FOREIGN,
  HASR_FOREIGN_NUMBERS,
  gateRight,
  sentenceTruth,
  quo,
  ceilDiv,
} from './lib/hasr.mjs';

/** The twelve cards of the lesson's mind map (world/knowledge.js › KNOWLEDGE_GRAPH.nodes). */
const CARDS = [
  'qisma',
  'mufradat',
  'taqdir',
  'mithal-taqdir',
  'khata-baqi',
  'hasr',
  'muqarraba',
  'mithal-hasr',
  'khata-lazim',
  'inidam',
  'siyagh',
  'khulasa',
];
/** The kinds each trained card must show (the plans of world/trainer.js: ay, hasr, zero, mix). */
const TRAIN = {
  taqdir: ['tap', 'tf', 'division'],
  hasr: ['tap', 'tf', 'bracket', 'needed'],
  inidam: ['tap', 'tf', 'exact'],
  qisma: ['tap', 'tf', 'division', 'needed', 'exact'],
};
/** The kinds of exam question whose numbers the server can re-compute (world/evidence.js › trainerEvidence). */
const EVIDENCE_KINDS = ['division', 'exact', 'bracket', 'needed'];
// the 12 px floor is on by default (lib/walk.mjs): every screenshot of this walk checks it, the knowledge map included
const w = createWalk('gameworld-hasr-trainer', {
  foreign: HASR_FOREIGN,
  foreignNumbers: HASR_FOREIGN_NUMBERS,
});
const { expect, check, shot } = w;
/** The option of a choice slot that says « a يقسم b » — the dividend written first: false, whatever the remainder. */
const swapChoice = (q, slot) => {
  const t = q.form.lines.flatMap((l) => l.tokens).find((x) => x && x.choice === slot);
  const hit = t.options.filter((o) => /^\d+ يقسم \d+$/.test(o.text.trim()));
  expect(
    hit.length === 1 && sentenceTruth(hit[0].text) === false,
    `exact ${q.a} ÷ ${q.b}: one sentence says « ${q.a} يقسم ${q.b} », and it is false by the arithmetic`,
  );
  return hit[0].id ?? String(hit[0].value);
};

/** The option of a choice slot of a form whose sentence is TRUE by arithmetic. */
const trueChoice = (q, slot) => {
  const t = q.form.lines.flatMap((l) => l.tokens).find((x) => x && x.choice === slot);
  const hit = t.options.filter((o) => sentenceTruth(o.text) === true);
  expect(
    hit.length === 1,
    `exact ${q.a} ÷ ${q.b}: exactly one sentence is true by the arithmetic (${t.options.map((o) => o.text).join(' | ')})`,
  );
  return hit[0].id ?? String(hit[0].value);
};
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
    case 'division':
      return { q: quo(q.a, q.b), r: q.a % q.b };
    case 'bracket':
      return { lo: quo(q.a, q.b), hi: quo(q.a, q.b) + 1 };
    case 'exact':
      return { q: quo(q.a, q.b), r: q.a % q.b, ph: trueChoice(q, 'ph') };
    case 'needed':
      return { full: quo(q.a, q.b), need: ceilDiv(q.a, q.b) };
    default:
      throw new Error(`unknown kind ${q.kind}`);
  }
}
/**
 * A wrong answer of the same shape — HALF wrong wherever the question has two parts: the part that used to make a TRUE
 * claim is right (the upper end of the bracket, the containers needed, the division under « a يقسم b »), the other is
 * not. Its claim (when it is evidence) must be FALSE: the walk computes that verdict itself, below.
 */
function wrongOf(q) {
  const r = solve(q);
  switch (q.kind) {
    case 'tap':
      return q.options.find((n) => n !== r);
    case 'tf':
      return { truth: !r.truth, reason: r.reason };
    case 'division':
      // a true sum, one plank too few: the remainder is not smaller than the divisor
      return { q: r.q - 1, r: r.r + q.b };
    case 'bracket':
      // the right upper end, a lower end three too small
      return { lo: Math.max(0, r.lo - 3), hi: r.hi };
    case 'exact':
      // the right division, and the sentence that turns the two numbers round
      return { ...r, ph: swapChoice(q, 'ph') };
    case 'needed':
      // the right containers needed, the full ones miscounted
      return { full: r.full - 5, need: r.need };
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
    uid: 9721,
    lessonId: ID,
    url: URL,
    grade: GRADE,
    seed: { [`u_9721_smarter_world_${ID}`]: save },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.click('[data-di-know-open]');
  await page.waitForSelector('[data-di-kmap="full"]');
  await page.waitForTimeout(700);
  expect(
    (await page.locator('[data-di-knode]').count()) === CARDS.length &&
      (await page.locator('[data-di-knode][data-open="true"]').count()) === CARDS.length,
    `« خريطة المعارف »: the ${CARDS.length} cards of the lesson, all open with the three keys`,
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
  /** Answers the question on screen with `v`, through its own controls (a box is typed in, a choice is selected). */
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
      const sel = `[data-di-tr="${k}"]`;
      if ((await page.$eval(sel, (el) => el.tagName)) === 'SELECT') await page.selectOption(sel, String(x));
      else await page.fill(sel, String(x));
    }
    await page.click('[data-di-tr-check]');
  };
  const knode = async (id) => {
    const n = page.locator(`[data-di-knode="${id}"]`);
    if (!(await n.isVisible())) await page.click('[data-di-tab="card"]');
    await n.click();
  };

  // ── the cards READ as cards, before any training: each one opened from the map, its own text and formulas drawn ──
  /** The card now in the panel: its title, its text, how many formulas are drawn, whether a fraction bar is among them. */
  const cardNow = (id) =>
    page.evaluate((cid) => {
      const p = document.querySelector(`[data-di-kpanel="${cid}"]`);
      if (!p) return null;
      const body = p.querySelector('[data-di-kbody]');
      return {
        title: p.querySelector('.di-kpanel__head h3')?.textContent.trim() ?? '',
        head: p.querySelector('.di-kpanel__head')?.textContent ?? '',
        text: body?.textContent ?? '',
        formulas: body?.querySelectorAll('.katex').length ?? 0,
        bars: p.querySelectorAll('.katex .frac-line').length,
        tabs: [...p.querySelectorAll('[data-di-tab]')].map((t) => t.dataset.diTab),
        onCard: p.querySelector('[data-di-tab="card"]')?.getAttribute('aria-selected') === 'true',
        uncover: p.querySelectorAll('[data-di-uncover]').length,
      };
    }, id);
  /** The walk's own arithmetic for what the cards must say (never the lesson's strings): 4576 with 248 and with 365. */
  const [A, B248, B365] = [4576, 248, 365];
  const left = A - B248 * 10;
  {
    // an EXAMPLE card: a divisor of three digits, a digit tried too big (9), then the right one (8)
    await knode('mithal-taqdir');
    await page.waitForTimeout(250);
    const c = await cardNow('mithal-taqdir');
    expect(
      c && c.onCard && c.title === `${A} على ${B248}` && c.tabs.join() === 'card,train',
      `the card « ${c?.title} » opens as a CARD (its own tab, then « تدرّب »): an example with a divisor of three digits`,
    );
    const digit = quo(left, B248);
    expect(
      c.text.includes(String(left)) &&
        c.text.includes(String(B248 * (digit + 1))) &&
        c.text.includes(`نجرّب ${digit + 1}`) &&
        c.text.includes(`ننقص إلى ${digit}`) &&
        c.text.includes(String(A % B248)),
      `it works ${A} ÷ ${B248}: ${left} left after ten planks, ${digit + 1} tried (${B248 * (digit + 1)} passes ${left}), then ${digit} — remainder ${A % B248}`,
    );
    // (that no formula is read raw is checked by `shot`, on every screenshot)
    check(c.formulas >= 4, `its formulas are DRAWN (${c.formulas} on the card)`);
    await shot(page, 'card-example', { exit: ['[data-di-know-close]'], sound: true });
  }
  {
    // a COMMON MISTAKE card: the wrong sentence first, the rest uncovered by the student
    await knode('khata-baqi');
    await page.waitForTimeout(250);
    let c = await cardNow('khata-baqi');
    const [q, r] = [quo(A, B365), A % B365];
    expect(
      c && c.onCard && c.uncover === 1 && c.text.includes(String(r + B365)) && !c.text.includes(`أصغر من ${B365}`),
      `the card « ${c?.title} » shows the wrong division first (${A} = ${B365} × ${q - 1} + ${r + B365}) and hides why`,
    );
    await shot(page, 'card-mistake', { exit: ['[data-di-know-close]'], sound: true });
    await page.click('[data-di-uncover]');
    await page.waitForTimeout(250);
    c = await cardNow('khata-baqi');
    expect(
      c.text.includes(`ليس أصغر من ${B365}`) &&
        c.text.includes(`${r} أصغر من ${B365}`) &&
        c.title.includes('المقسوم عليه'),
      `uncovered: ${r + B365} is not smaller than ${B365}, the division is ${A} = ${B365} × ${q} + ${r} — and b is « المقسوم عليه »`,
    );
    expect(
      (await page.getAttribute('[data-di-knode="khata-baqi"]', 'data-read')) === 'true',
      'the card he uncovered is marked READ on the map',
    );
    await shot(page, 'card-mistake-uncovered', { exit: ['[data-di-know-close]'], sound: true });
  }
  {
    // the card of the two approximate values: the bank's notation of the quotient, with a REAL fraction bar
    await knode('muqarraba');
    await page.waitForTimeout(250);
    const c = await cardNow('muqarraba');
    expect(
      c && c.onCard && c.text.includes('يُكتب أيضًا') && c.bars >= 2,
      `the card « ${c?.title} » writes the quotient as the exercise bank does: ${c?.bars} fraction bars drawn`,
    );
    await shot(page, 'card-fraction', { exit: ['[data-di-know-close]'], sound: true });
  }
  {
    // a card with a MEMO sheet: its four tabs, and the one place that links « المقسوم عليه » and « قاسم »
    await knode('hasr');
    await page.waitForTimeout(250);
    const c = await cardNow('hasr');
    expect(
      c && c.tabs.join() === 'card,memo,quiz,train',
      `the card « ${c?.title} » of a key has its memo sheet and its two questions (${c?.tabs.join(', ')})`,
    );
    await page.click('[data-di-tab="memo"]');
    await page.waitForTimeout(250);
    await shot(page, 'card-memo', { exit: ['[data-di-know-close]'], sound: true });
    await knode('siyagh');
    await page.waitForTimeout(250);
    const s = await cardNow('siyagh');
    expect(
      s && s.text.includes('المقسوم عليه 45 قاسم للعدد 1080') && [1080 % 45, 1080 / 45].join() === '0,24',
      'the card « أربع جمل لمعنى واحد » says once when the divisor of a division is called « قاسم »: 1080 = 45 × 24',
    );
    await shot(page, 'card-sentences', { exit: ['[data-di-know-close]'], sound: true });
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
      const nums = q.kind === 'tap' ? [q.wave.a ?? q.wave.b] : q.kind === 'tf' ? [] : [q.a, q.b];
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
          const inputs = (k) => page.locator('.di-sheet__line').nth(k).locator('input').count();
          if (q.kind === 'division')
            check(
              lines.length === 1 && lines[0].includes(String(q.a)) && lines[0].includes('+') && (await inputs(0)) === 2,
              `${card}: « ${q.a} = ${q.b} × [ ] + [ ] », two boxes in the line`,
            );
          if (q.kind === 'bracket')
            check(
              lines.length === 1 && lines[0].includes('<') && lines[0].includes(String(q.a)) && (await inputs(0)) === 2,
              `${card}: « [ ] < ${q.a} ÷ ${q.b} < [ ] », two boxes around the quotient`,
            );
          if (q.kind === 'exact')
            check(
              lines.length === 2 &&
                (await inputs(0)) === 2 &&
                (await page.locator('.di-sheet__line').nth(1).locator('select').count()) === 1,
              `${card}: « ${q.a} = ${q.b} × [ ] + [ ] », then the sentence chosen inside its line`,
            );
          if (q.kind === 'needed')
            check(
              lines.length === 2 &&
                lines[0].includes('المملوءة') &&
                lines[1].includes('اللازمة') &&
                (await inputs(0)) === 1 &&
                (await inputs(1)) === 1,
              `${card}: « المملوءة تمامًا: [ ] », then « اللازمة: [ ] »`,
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
          // the model sheet belongs to the questions that pose a division (their form names a `model`): never to a « علّل »
          const model = await page.locator('[data-di-tr-model]').count();
          check(
            model === (q.form?.model ? 1 : 0),
            `${card} · question ${i + 1} (${q.kind}): the model sheet is ${q.form?.model ? 'offered beside the correction' : 'not offered'} (found ${model})`,
          );
          if (model) {
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
    const owed = firstTries.filter((x) => x.q.format === 'exam' && EVIDENCE_KINDS.includes(x.q.kind));
    expect(posts.length === owed.length, `${card}: ${owed.length} answers are sent as evidence (sent ${posts.length})`);
    for (const [k, p] of posts.entries()) {
      const x = owed[k];
      const c = p.claim;
      const v = x.value;
      expect(
        p.context === 'trainer' &&
          typeof p.attemptId === 'string' &&
          p.attemptId.length > 6 &&
          p.learningPoint === `${GRADE}_${ID}_${POINT[x.q.key]}`,
        `${card}: evidence ${k + 1} is { attemptId, learningPoint ${GRADE}_${ID}_${POINT[x.q.key]}, context « trainer », claim }`,
      );
      const shapeOk = {
        division: () =>
          c.kind === 'division' && c.a === x.q.a && c.b === x.q.b && c.q === Number(v.q) && c.r === Number(v.r),
        exact: () =>
          v.ph === 'swap'
            ? // « a يقسم b » chosen: the claim is about the SENTENCE — the number written first is the dividend
              c.kind === 'phrase' && c.phrase === 'yaqsim' && c.a === x.q.a && c.b === x.q.b && c.first === x.q.a
            : c.kind === 'division' &&
              c.a === x.q.a &&
              c.b === x.q.b &&
              c.q === Number(v.q) &&
              c.r === Number(v.r) &&
              // « a يقبل القسمة على b » chosen ⇔ the claim says the plank fills the gap
              c.fits === (v.ph === 'yes'),
        // BOTH numbers of the bracket, BOTH counts of the situation: a claim of one part credited a half-wrong answer
        bracket: () =>
          c.kind === 'bracket' && c.a === x.q.a && c.b === x.q.b && c.lo === Number(v.lo) && c.hi === Number(v.hi),
        needed: () =>
          c.kind === 'fullNeeded' &&
          c.a === x.q.a &&
          c.b === x.q.b &&
          c.full === Number(v.full) &&
          c.need === Number(v.need),
      }[x.q.kind]();
      // the verdict the server will compute, computed here: a wrong first try makes a FALSE claim, a right one a TRUE claim
      const verdicts = {
        division: () => c.b * c.q + c.r === c.a && c.r >= 0 && c.r < c.b && c.fits === (c.r === 0),
        bracket: () => c.hi === c.lo + 1 && c.b * c.lo <= c.a && c.a < c.b * c.hi,
        fullNeeded: () => c.full === quo(c.a, c.b) && c.need === ceilDiv(c.a, c.b),
        // « x يقسم y »: true when the number written first is the divisor — the smaller of the two here
        phrase: () => c.phrase === 'yaqsim' && c.first === Math.min(c.a, c.b),
      };
      expect(Boolean(verdicts[c.kind]), `${card}: evidence ${k + 1} is a claim the walk can judge (« ${c.kind} »)`);
      const truth = verdicts[c.kind]();
      expect(
        shapeOk && truth === (x.first === 'right'),
        `${card}: evidence ${k + 1} (${x.q.kind}) carries what he WROTE at the first try — claim ${JSON.stringify(c).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`,
      );
    }
    allPosts.push(...posts);
  }
  expect(
    new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length && allPosts.length === 9,
    `every evidence has its own attempt id (${allPosts.length}: two per card, three for the mix)`,
  );
  await page.click('[data-di-know-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« خريطة المعارف » closes back to the title screen',
  );
});
