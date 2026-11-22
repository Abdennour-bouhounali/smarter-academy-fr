// « تدرّب » of lesson `qasim-mushtarak-akbar` (lesson 4), as a STUDENT — copied from lesson 3's gameworld-khawass-trainer.mjs.
// On the full « خريطة المعارف », four cards are trained — القواسم المشتركة, القاسم المشترك الأكبر, الباقات المتماثلة, قواسم
// القاسم المشترك الأكبر — six questions each, so EVERY kind of question of the lesson's `world/trainer.js` is played through
// its screen: tap (the gates: a common divisor, the PGCD / the longest plank, a possible / the most bouquets, the roses of
// one bouquet, a divisor of the given PGCD, how many common divisors), true / false (game, and exam with its reason),
// commonList (« عيّن القواسم المشتركة »: six boxes), pgcd (« PGCD(a ; b) = [ ] »), bouquets (three boxes, one a line),
// nestList (the common divisors from the given PGCD). In each session: a wrong then a right answer (the hint), a right one
// at the first try, two wrong (the written correction — no model sheet: no question of this lesson poses a division).
// Before the sessions, ONE CARD is read as a card: a common mistake (the wrong sentence first, the rest uncovered by him,
// its division computed here), then the memo sheet of a key and its two questions — answered wrong, then right: sealed.
// The right answers are computed HERE from the numbers of the question (a gate, a list, a PGCD, the bouquets; a true / false
// from its statement), never taken from the lesson. What is posted as evidence (exam format, first try) is captured and
// asserted: a HALF-right first try (five right divisors and an intruder; the most bouquets right and the roses of one
// wrong) must be sent as a FALSE claim.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-mushtarak-trainer.mjs [outDir]
import { createWalk } from './lib/walk.mjs';
import { ID, URL, KEYS, POINT, MUSHTARAK_FOREIGN, MUSHTARAK_NUMBERS, gcd, divisors, common } from './lib/mushtarak.mjs';

const CARDS = [
  'fikra',
  'mushtaraka',
  'tadhkir',
  'khata-wahid',
  'akbar',
  'mithal-akbar',
  'khata-asghar',
  'baqat',
  'mithal-baqat',
  'kulluha',
  'nest',
  'khulasa',
];
/** The kinds each trained card must show (the plans of world/trainer.js: com, akbar, baqat, nest). */
const TRAIN = {
  mushtaraka: ['tap', 'tf', 'commonList'],
  akbar: ['tap', 'tf', 'pgcd'],
  baqat: ['tap', 'tf', 'bouquets'],
  nest: ['tap', 'tf', 'nestList'],
};
const BOXES = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
// the 12 px floor is on by default (lib/walk.mjs), the knowledge map included
const w = createWalk('gameworld-mushtarak-trainer', { foreign: MUSHTARAK_FOREIGN, foreignNumbers: MUSHTARAK_NUMBERS });
const { expect, check, shot } = w;

/** Is gate value n right for this wave? Computed HERE (the same table as the hub walk's). */
const gateRight = (x, n) =>
  ({
    commonDivisor: () => n >= 1 && x.a % n === 0 && x.b % n === 0,
    possibleBouquets: () => n >= 1 && x.a % n === 0 && x.b % n === 0,
    pgcd: () => n === gcd(x.a, x.b),
    longest: () => n === gcd(x.a, x.b),
    mostBouquets: () => n === gcd(x.a, x.b),
    perBouquet: () => n * x.g === x.a,
    divisorOfPgcd: () => n >= 1 && x.g % n === 0,
    countCommon: () => n === divisors(x.g).length,
  })[x.type]();
/**
 * The truth of a statement of « صحيح أم خطأ؟ », computed HERE from its own words and numbers (the TeX of the screen is read
 * without its `$` and `\mathrm`).
 */
function statementTruth(text) {
  const t = text
    .replace(/\$/g, '')
    .replace(/\\mathrm\{PGCD\}/g, 'PGCD')
    .replace(/\s+/g, ' ')
    .trim();
  let m = /^PGCD\(a ; b\) = (\d+)، إذن (\d+) قاسم مشترك للعددين a و b$/.exec(t);
  if (m) return Number(m[1]) % Number(m[2]) === 0;
  m = /^PGCD\((\d+) ; (\d+)\) = (\d+)$/.exec(t);
  if (m) return gcd(Number(m[1]), Number(m[2])) === Number(m[3]);
  m = /^(\d+) قاسم مشترك للعددين (\d+) و (\d+)$/.exec(t);
  if (m) return Number(m[2]) % Number(m[1]) === 0 && Number(m[3]) % Number(m[1]) === 0;
  m = /^نصنع من (\d+) وردة و (\d+) زنبقة، دون أن يبقى شيء، باقات متماثلة عددها (\d+)$/.exec(t);
  if (m) return Number(m[1]) % Number(m[3]) === 0 && Number(m[2]) % Number(m[3]) === 0;
  m = /^أكبر عدد من الباقات المتماثلة بـ (\d+) وردة و (\d+) زنبقة هو (\d+)$/.exec(t);
  if (m) return gcd(Number(m[1]), Number(m[2])) === Number(m[3]);
  expect(false, `the walk can read the statement « ${t} »`);
  return null;
}
/** Every equality « x = y × z (+ r) » written in a reason holds (a reason that proves something states no false equality). */
const equalitiesHold = (text) =>
  [...text.replace(/\\times/g, '×').matchAll(/(\d+) = (\d+) × (\d+)(?: \+ (\d+))?/g)].every(
    (m) => Number(m[1]) === Number(m[2]) * Number(m[3]) + Number(m[4] ?? 0),
  );
/** The right answer of a question, from its numbers. */
function solve(q) {
  switch (q.kind) {
    case 'tap': {
      const ok = q.options.filter((n) => gateRight(q.wave, n));
      expect(ok.length === 1, `tap « ${q.wave.type} » (${q.options.join(', ')}): exactly one gate is right`);
      return ok[0];
    }
    case 'tf': {
      const truth = statementTruth(q.statement);
      // the reason: the lesson marks the one that proves; the walk checks that every equality it writes holds
      const reason = q.reasons ? q.reasons.findIndex((r) => r.ok) : null;
      if (q.reasons)
        expect(
          equalitiesHold(q.reasons[reason].t),
          `tf « ${q.statement.slice(0, 40)} »: its reason writes only true equalities`,
        );
      return { truth, reason };
    }
    case 'commonList':
    case 'nestList': {
      const list = common(q.a, q.b);
      expect(
        list.length === BOXES.length,
        `${q.kind} ${q.a} and ${q.b}: ${list.length} common divisors for ${BOXES.length} boxes`,
      );
      return Object.fromEntries(list.map((d, i) => [BOXES[i], d]));
    }
    case 'pgcd':
      return { g: gcd(q.a, q.b) };
    case 'bouquets': {
      const g = gcd(q.a, q.b);
      return { n: g, x: q.a / g, y: q.b / g };
    }
    default:
      throw new Error(`unknown kind ${q.kind}`);
  }
}
/**
 * A wrong answer of the same shape — one whose claim (when it is evidence) must be FALSE. The lists and the bouquets are
 * HALF-right on purpose: five right divisors and one that divides one number only; the most bouquets right, the roses not.
 */
function wrongOf(q) {
  const r = solve(q);
  switch (q.kind) {
    case 'tap':
      return q.options.find((n) => n !== r);
    case 'tf':
      return { truth: !r.truth, reason: r.reason };
    case 'commonList':
    case 'nestList': {
      const stray = divisors(q.a).find((d) => q.b % d !== 0) ?? q.a + 1;
      return { ...r, c5: stray };
    }
    case 'pgcd': {
      const g = gcd(q.a, q.b);
      return {
        g: common(q.a, q.b)
          .filter((d) => d < g)
          .at(-1),
      };
    }
    case 'bouquets':
      return { ...r, x: r.x + 1 };
    default:
      return null;
  }
}

/**
 * « خريطة المعارف » laid out (lesson 4's POSITIONS, kit/KnowledgePage.jsx): every card inside the map box, no card on
 * another, no link's label under a card — and the page's subtitle shown WHOLE, never cut by an ellipsis (2026-11-19: at
 * 1840 × 900 it lost its last words; below 1101 px the page hides it on purpose, which is not a cut).
 */
const mapLaidOut = async (page, where) => {
  const bad = await page.evaluate(() => {
    const out = [];
    const map = document.querySelector('[data-di-kmap="full"]');
    if (!map) return ['no map on screen'];
    const box = map.getBoundingClientRect();
    const meet = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const shown = (el) => el.getClientRects().length > 0;
    const nodes = [...map.querySelectorAll('[data-di-knode]')].filter(shown).map((el) => ({
      id: el.dataset.diKnode,
      r: el.getBoundingClientRect(),
    }));
    const labels = [...map.querySelectorAll('.di-kmap__edge')].filter(shown).map((el) => ({
      t: el.textContent.trim(),
      r: el.getBoundingClientRect(),
    }));
    for (const n of nodes)
      if (n.r.left < box.left - 1 || n.r.right > box.right + 1 || n.r.top < box.top - 1 || n.r.bottom > box.bottom + 1)
        out.push(`card ${n.id} cut by the map's edge`);
    for (let i = 0; i < nodes.length; i += 1)
      for (let j = i + 1; j < nodes.length; j += 1)
        if (meet(nodes[i].r, nodes[j].r)) out.push(`cards ${nodes[i].id} / ${nodes[j].id} overlap`);
    for (const l of labels) for (const n of nodes) if (meet(l.r, n.r)) out.push(`label « ${l.t} » under card ${n.id}`);
    const sub = document.querySelector('.di-page__head p');
    if (sub && sub.getClientRects().length) {
      const r = sub.getBoundingClientRect();
      const holder = sub.parentElement.getBoundingClientRect();
      // in height, Arabic glyphs hang a few pixels outside their line box (measured 2026-11-19: a whole one-line
      // subtitle had scrollHeight > clientHeight): only HALF A LINE or more of hidden text is a cut sentence
      const line = parseFloat(getComputedStyle(sub).lineHeight) || r.height;
      if (sub.scrollWidth > sub.clientWidth + 1 || sub.scrollHeight > sub.clientHeight + line / 2)
        out.push(
          `the subtitle overflows its box (${sub.scrollWidth}×${sub.scrollHeight} in ${sub.clientWidth}×${sub.clientHeight})`,
        );
      if (r.right > holder.right + 1 || r.left < holder.left - 1 || r.bottom > holder.bottom + 1)
        out.push('the subtitle is clipped by its header');
      if (getComputedStyle(sub).textOverflow === 'ellipsis' && sub.scrollWidth > sub.clientWidth)
        out.push('the subtitle ends on an ellipsis');
    }
    return out;
  });
  check(
    bad.length === 0,
    `${where}: the map's cards are inside it and apart, no label under a card, the subtitle whole${bad.length ? ' — ' + bad.join(' | ') : ''}`,
  );
};

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
    uid: 9861,
    lessonId: ID,
    url: URL,
    seed: { [`u_9861_smarter_world_${ID}`]: save },
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
  await mapLaidOut(page, 'the knowledge map, a card open in its panel');

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
    // a common mistake: 11 divides 198, « so it is a common divisor of 198 and 234 »
    // what is already read when the map opens (the card it opens on is read by being shown)
    const before = (await kstate()).read;
    await page.click('[data-di-knode="khata-wahid"]');
    await page.waitForSelector('[data-di-kpanel="khata-wahid"]');
    await page.waitForTimeout(250);
    const P = '[data-di-kpanel="khata-wahid"]';
    expect(
      (await page.locator(`${P} [data-di-tab]`).count()) === 2 &&
        (await page.getAttribute(`${P} [data-di-tab="card"]`, 'aria-selected')) === 'true' &&
        ((await page.textContent(`${P} .di-kpanel__head h3`)) ?? '').trim().length > 2,
      'a card opens in its panel: its kind, its title, its two tabs (the card, « تدرّب ») — the card first',
    );
    const wrong = (await page.textContent(`${P} .di-parts .is-wrong`)) ?? '';
    // « d يقسم a، إذن d قاسم مشترك للعددين a و b »: its numbers read from the sentence, judged here
    const said = (wrong.match(/\d+/g) ?? []).map(Number);
    const [d0, a0, b0] = [said[0], said[1], said.at(-1)];
    expect(
      a0 === 198 && b0 === 234 && a0 % d0 === 0 && b0 % d0 !== 0,
      `the card of a common mistake shows the WRONG sentence first, with the story's twins: ${d0} divides ${a0}, not ${b0} (« ${wrong.trim().slice(0, 60)} »)`,
    );
    expect(
      (await page.locator(`${P} [data-di-uncover]`).count()) === 1 &&
        (await page.locator(`${P} .di-parts .is-why, ${P} .di-parts .is-right`).count()) === 0 &&
        (await page.getAttribute('[data-di-knode="khata-wahid"]', 'data-read')) === 'false' &&
        !(await kstate()).read.includes('khata-wahid'),
      'the reason and the right sentence are NOT shown before he asks: the card is not read yet',
    );
    await shot(page, 'know-card-mistake', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click(`${P} [data-di-uncover]`);
    await page.waitForSelector(`${P} .di-parts .is-right`);
    const why = await texIn(`${P} .di-parts .is-why`);
    expect(
      why.some((f) => f.replace(/\s/g, '') === `${b0}=${d0}\\times${Math.floor(b0 / d0)}+${b0 % d0}`),
      `uncovered, the card proves it with the division, computed here: ${b0} = ${d0} × ${Math.floor(b0 / d0)} + ${b0 % d0} (${why.join(' · ')})`,
    );
    expect(
      (await page.locator(`${P} [data-di-uncover]`).count()) === 0 &&
        (await page.locator(`${P} .di-parts .is-right`).count()) === 1 &&
        (await page.getAttribute('[data-di-knode="khata-wahid"]', 'data-read')) === 'true' &&
        (await kstate()).read.join() === [...before, 'khata-wahid'].join() &&
        (await page.getAttribute('[data-di-know-read]', 'data-di-know-read')) === String(before.length + 1),
      `the card is now READ: ticked on the map, counted at the top of the page, saved (${JSON.stringify({
        read: (await kstate()).read,
        counted: await page.getAttribute('[data-di-know-read]', 'data-di-know-read'),
      })})`,
    );
    await shot(page, 'know-card-mistake-read', { exit: ['[data-di-know-close]'], sound: true, numbers: true });

    // the card of a key: its memo sheet, then its two questions — wrong, then right
    await page.click('[data-di-knode="mushtaraka"]');
    await page.waitForSelector('[data-di-kpanel="mushtaraka"]');
    const K = '[data-di-kpanel="mushtaraka"]';
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
      // the example is the story's twins: 198, 234 and their common divisors — computed here
      expect(
        tex.some((f) => ['198', '234', ...common(198, 234).map(String)].every((x) => f.includes(x))),
        `its example says the common divisors of 198 and 234 are ${common(198, 234).join(', ')} (${tex.join(' · ').slice(0, 90)})`,
      );
      check(!plain.some((t) => /\$|\\[a-zA-Z]{2,}/.test(t)), 'no raw formula in the sentences of the memo sheet');
    }
    await shot(page, 'know-card-memo', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click(`${K} [data-di-tab="quiz"]`);
    await page.waitForSelector(`${K} [data-di-quiz-check]`);
    const options = await page.locator(`${K} [data-di-quiz]`).evaluateAll((els) =>
      els.map((e) => ({
        id: e.dataset.diQuiz,
        tex: [...e.querySelectorAll('annotation')].map((x) => x.textContent.replace(/\\displaystyle\s*/, '')),
      })),
    );
    expect(
      options.length === 6 && (await page.locator(`${K} [data-di-quiz-check][disabled]`).count()) === 1,
      'two questions of three choices; « تحقّق » waits until both are answered',
    );
    // question 1: a common divisor of 198 and 234 — the walk divides; question 2: the number that divides every number
    const n = (o) => Number(o.tex[0]);
    const q1 = options.filter((o) => o.id.startsWith('0-'));
    const right1 = q1.filter((o) => n(o) > 0 && 198 % n(o) === 0 && 234 % n(o) === 0);
    expect(
      right1.length === 1,
      `question 1: exactly one choice divides 198 and 234 (${q1.map(n).join(' | ')} → ${right1.map(n)})`,
    );
    const q2 = options.filter((o) => o.id.startsWith('1-'));
    // two numbers that share nothing but 1: what divides every number divides them both
    const right2 = q2.filter((o) => n(o) > 0 && 7 % n(o) === 0 && 9 % n(o) === 0);
    expect(
      right2.length === 1 && n(right2[0]) === 1,
      `question 2: the one number that divides every number (${q2.map(n).join(' | ')})`,
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
      (await kstate()).sealed.join() === 'qawasim-mushtaraka' &&
        (await page.getAttribute('[data-di-know-sealed]', 'data-di-know-sealed')) === '1' &&
        (await page.locator('[data-di-knode="mushtaraka"].is-gold').count()) === 1,
      'both right: the memo sheet of « القواسم المشتركة » is SEALED — gold on the map, counted, saved',
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
    for (const [k, x] of Object.entries(v)) await page.fill(`[data-di-tr="${k}"]`, String(x));
    await page.click('[data-di-tr-check]');
  };
  const knode = async (id) => {
    const nd = page.locator(`[data-di-knode="${id}"]`);
    if (!(await nd.isVisible())) await page.click('[data-di-tab="card"]');
    await nd.click();
  };
  /** The claim this lesson's evidence makes of an answer, decided HERE from the question and what he wrote. */
  const claimOf = (q, v) => {
    const g = gcd(q.a, q.b);
    if (q.kind === 'commonList' || q.kind === 'nestList') {
      const list = BOXES.map((s) => v[s])
        .filter((x) => x !== '' && x != null)
        .map(Number);
      const stray = list.find((d) => d >= 1 && (q.a % d !== 0 || q.b % d !== 0));
      return stray != null
        ? { kind: 'commonDivisor', a: q.a, b: q.b, d: stray }
        : { kind: 'divisors', a: g, list, b: list.length };
    }
    if (q.kind === 'pgcd') return { kind: 'pgcd', a: q.a, b: q.b, g: Number(v.g) };
    // bouquets: a wrong number of bouquets is claimed as the PGCD; then a wrong content as the product he wrote
    const [m, x, y] = [Number(v.n), Number(v.x), Number(v.y)];
    if (m !== g) return { kind: 'pgcd', a: q.a, b: q.b, g: m };
    if (m * x !== q.a) return { kind: 'pair', a: q.a, b: m, e: x };
    if (m * y !== q.b) return { kind: 'pair', a: q.b, b: m, e: y };
    return { kind: 'pgcd', a: q.a, b: q.b, g: m };
  };
  /** The verdict the server computes of a claim, computed here. */
  const truthOf = (c) =>
    ({
      commonDivisor: () => c.d >= 1 && c.a % c.d === 0 && c.b % c.d === 0,
      divisors: () =>
        c.b === c.list.length &&
        new Set(c.list).size === c.list.length &&
        c.list.length === divisors(c.a).length &&
        c.list.every((d) => c.a % d === 0),
      pgcd: () => c.g === gcd(c.a, c.b),
      pair: () => c.e > 0 && c.b * c.e === c.a,
    })[c.kind]();
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

  const allPosts = [];
  let halfRight = 0;
  for (const card of Object.keys(TRAIN)) {
    await knode(card);
    await page.waitForTimeout(200);
    await page.click('[data-di-know-train]');
    await page.waitForSelector('[data-di-trainer]');
    // the panel widens for « تدرّب » and the map is drawn smaller (trainer.css): still laid out
    if (card === Object.keys(TRAIN)[0]) await mapLaidOut(page, `the knowledge map beside « تدرّب » (${card})`);
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
      const nums = q.kind === 'tap' ? [q.wave.a ?? q.wave.g] : q.kind === 'tf' ? [] : [q.a, q.b];
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
          const lines = await page.locator('.di-sheet__line').allTextContents();
          const inputs = await page.locator('.di-sheet__line input').count();
          if (q.kind === 'commonList' || q.kind === 'nestList')
            check(
              inputs === 6 &&
                (await page.locator('.di-sheet__line').nth(1).locator('input').count()) === 3 &&
                (await page.locator('.di-sheet__line').nth(2).locator('input').count()) === 3,
              `${card}: six boxes for the list, in two lines of three (${inputs})`,
            );
          if (q.kind === 'pgcd')
            check(
              lines.length === 1 && lines[0].includes('PGCD') && inputs === 1,
              `${card}: « PGCD(a ; b) = [ ] », one box`,
            );
          if (q.kind === 'bouquets')
            check(
              lines.length === 3 && inputs === 3 && lines.every((l) => (l.match(/=/g) ?? []).length === 1),
              `${card}: the most bouquets, the roses, the lilies — one box a line`,
            );
          // the « تحقّق » button is seen on the sheet, uncovered
          const b = await page.evaluate(() => {
            const el = document.querySelector('[data-di-tr-check]');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return { onTop: Boolean(top && (top === el || el.contains(top))), h: Math.round(r.height) };
          });
          check(
            b && b.onTop && b.h >= 28,
            `${card} · question ${i + 1} (${q.kind}): « تحقّق » is on the sheet, uncovered (${JSON.stringify(b)})`,
          );
        }
      }
      if (!seen.has(`${q.kind}:${q.format}`)) {
        seen.add(`${q.kind}:${q.format}`);
        await shot(page, `tr-${card}-${i + 1}-${q.kind}-${q.format}`, { exit: ['[data-di-know-close]'] });
      }
      // questions 1, 3 and 5 are missed at the first try; question 5 twice (the written correction)
      const plan = i === 4 ? 'wrong-wrong' : i === 0 || i === 2 ? 'wrong-right' : 'right';
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
        if (q.kind !== 'tap' && q.kind !== 'tf') {
          // the hint never gives the answer away. Not « no owed number at all » — a hint may write a true division whose
          // quotient happens to be it (27 = 3 × 9 when PGCD = 9) — but never the answer AS an answer: no « PGCD(a ; b) = g »,
          // not the whole list of common divisors, not the right count of roses beside its bouquets
          const r = solve(q);
          const g = gcd(q.a, q.b);
          const hint = f.fbText.replace(/\s+/g, '');
          const gives = {
            pgcd: () => hint.includes(`PGCD(${q.a};${q.b})=${g}`),
            commonList: () => common(q.a, q.b).every((d) => new RegExp(`(^|[^0-9])${d}([^0-9]|$)`).test(f.fbText)),
            nestList: () => common(q.a, q.b).every((d) => new RegExp(`(^|[^0-9])${d}([^0-9]|$)`).test(f.fbText)),
            bouquets: () => hint.includes(`${g}×${r.x}=${q.a}`) || hint.includes(`${q.a}=${g}×${r.x}`),
          }[q.kind];
          check(
            !gives(),
            `${card} · question ${i + 1} (${q.kind}): the hint does not write the answer (« ${f.fbText.trim().slice(0, 80)} »)`,
          );
        }
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
          expect(
            (await page.locator('[data-di-tr-model]').count()) === 0,
            `${card} · question ${i + 1} (${q.kind}): no model sheet — no question of this lesson poses a division`,
          );
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
    const owed = firstTries.filter(
      (x) => x.q.format === 'exam' && ['commonList', 'nestList', 'pgcd', 'bouquets'].includes(x.q.kind),
    );
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
      const want = claimOf(x.q, x.value);
      const truth = truthOf(p.claim);
      expect(
        same(p.claim, want) && truth === (x.first === 'right'),
        `${card}: evidence ${k + 1} (${x.q.kind}) carries what he WROTE at the first try — claim ${JSON.stringify(p.claim).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`,
      );
      if (x.first === 'wrong' && x.q.kind !== 'pgcd') {
        halfRight += 1;
        expect(
          truth === false,
          `${card}: a HALF-right first try (${x.q.kind}: ${x.q.kind === 'bouquets' ? 'the most bouquets right, the roses of one wrong' : 'five common divisors and one that divides one number only'}) is sent as a FALSE claim — no الكفاءة is credited`,
        );
      }
    }
    allPosts.push(...posts);
  }
  expect(
    new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length && allPosts.length === 8,
    `every evidence has its own attempt id (${allPosts.length}: two per card)`,
  );
  expect(
    halfRight >= 3,
    `half-right first tries were sent and judged false: lists with an intruder, bouquets with a wrong content (${halfRight})`,
  );
  await page.click('[data-di-know-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« خريطة المعارف » closes back to the title screen',
  );
});
