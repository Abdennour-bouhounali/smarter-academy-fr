// « تدرّب » of lesson `tayin-pgcd` (lesson 5), as a STUDENT — copied from lesson 4's gameworld-mushtarak-trainer.mjs.
// On the full « خريطة المعارف », four cards are trained — احصر ثم قاطع (hasr), نتائج مباشرة (nataij), الأصغر يقسم الأكبر
// (yaqsim) and the takeaway كيف أعيّنه؟ (mix) — six questions each, so EVERY kind of question of the lesson's
// `world/trainer.js` is played through its screen: tap (the gates: the PGCD, a common divisor, the missing factor of
// « a = b × ؟ »), true / false (game, and exam with its reason), hasr (the two lists and the PGCD), direct (three lines
// « دون أيّ حساب »), yaqsim (« a = b × [ ] » then the PGCD). In each session: a wrong then a right answer (the hint), a right
// one at the first try, two wrong (the written correction — no model sheet).
// Before the sessions, ONE CARD is read as a card: a common mistake (the wrong sentence first, the rest uncovered by him),
// then the memo sheet of a key and its two questions — answered wrong, then right: sealed.
// The right answers are computed HERE from the numbers of the question (a gate, a list, a PGCD; a true / false and its
// reason from their statements), never taken from the lesson. What is posted as evidence (exam format, first try) is
// captured and asserted: a HALF-right first try (the lists right and a wrong PGCD; k right and a wrong PGCD; the first
// line right and « PGCD(a ; 0) = 0 ») must be sent as a FALSE claim.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-tayin-trainer.mjs [outDir]
import { createWalk } from './lib/walk.mjs';
import { ID, URL, KEYS, POINT, TAYIN_FOREIGN, TAYIN_NUMBERS, gcd, divisors, common } from './lib/tayin.mjs';

const CARDS = [
  'pgcd-maana',
  'hasr',
  'rappel-qawasim',
  'mithal-32-44',
  'khata-laysa-akbar',
  'nataij',
  'tabaduli',
  'khata-sifr',
  'yaqsim',
  'mithal-76-19',
  'tahaqquq-awwalan',
  'khulasa',
];
/** The kinds each trained card must show (the plans of world/trainer.js: hasr, nataij, yaqsim, mix). */
const TRAIN = {
  hasr: ['tap', 'tf', 'hasr'],
  nataij: ['tap', 'tf', 'direct'],
  yaqsim: ['tap', 'tf', 'yaqsim'],
  khulasa: ['tap', 'tf', 'hasr', 'yaqsim', 'direct'],
};
/** The lines a list of the divisors of n takes on the sheet: one, or two when it has more than three boxes. */
const linesOf = (n) => (divisors(n).length > 3 ? 2 : 1);
/** The kinds whose exam answer is evidence (world/evidence.js › trainerEvidence). */
const EVIDENCE = ['hasr', 'direct', 'yaqsim'];
// the 12 px floor is on by default (lib/walk.mjs), the knowledge map included
const w = createWalk('gameworld-tayin-trainer', { foreign: TAYIN_FOREIGN, foreignNumbers: TAYIN_NUMBERS });
const { expect, check, shot } = w;

/** Is gate value n right for this wave? Computed HERE (the same table as the hub walk's). */
const gateRight = (x, n) =>
  ({
    commonDivisor: () => n >= 1 && x.a % n === 0 && x.b % n === 0,
    pgcd: () => n === gcd(x.a, x.b),
    missing: () => n * x.b === x.a,
  })[x.type]();
/** A statement as the screen writes it, read without its `$` and `\mathrm`. */
const plain = (text) =>
  text
    .replace(/\$/g, '')
    .replace(/\\mathrm\{PGCD\}/g, 'PGCD')
    .replace(/\\times/g, '×')
    .replace(/\s+/g, ' ')
    .trim();
/** The truth of a statement of « صحيح أم خطأ؟ », computed HERE from its own words and numbers. */
function statementTruth(text) {
  const t = plain(text);
  let m = /^PGCD\((\d+) ; (\d+)\) = PGCD\((\d+) ; (\d+)\)$/.exec(t);
  if (m) return gcd(Number(m[1]), Number(m[2])) === gcd(Number(m[3]), Number(m[4]));
  m = /^PGCD\((\d+) ; (\d+)\) = (\d+)$/.exec(t);
  if (m) return gcd(Number(m[1]), Number(m[2])) === Number(m[3]);
  m = /^(\d+) يقسم (\d+)، إذن PGCD\((\d+) ; (\d+)\) = (\d+)$/.exec(t);
  if (m) {
    const [b, a, x, y, g] = m.slice(1).map(Number);
    return a % b === 0 && gcd(x, y) === g;
  }
  expect(false, `the walk can read the statement « ${t} »`);
  return null;
}
/**
 * Is a reason TRUE? Every equality « x = y × z (+ r) » holds, every « d يقسم n » / « d لا يقسم n » is so, and a list
 * « القواسم المشتركة للعددين a و b هي … » is exactly the common divisors — computed here.
 */
function reasonTrue(text) {
  const t = plain(text);
  for (const m of t.matchAll(/(\d+) = (\d+) × (\d+)(?: \+ (\d+))?/g))
    if (Number(m[1]) !== Number(m[2]) * Number(m[3]) + Number(m[4] ?? 0)) return false;
  for (const m of t.matchAll(/(\d+) (لا )?يقسم (\d+)/g)) {
    const divides = Number(m[3]) % Number(m[1]) === 0;
    if (divides === Boolean(m[2])) return false;
  }
  return true;
}
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
      if (!q.reasons) return { truth, reason: null };
      // the reason that proves: the ONE whose every claim holds — computed here, never the lesson's mark
      const good = q.reasons.map((r, i) => (reasonTrue(r.t) ? i : -1)).filter((i) => i >= 0);
      expect(
        good.length === 1,
        `tf « ${plain(q.statement).slice(0, 40)} »: exactly one reason states only true facts (${good.join()})`,
      );
      return { truth, reason: good[0] };
    }
    case 'hasr':
      return {
        ...Object.fromEntries(divisors(q.a).map((d, i) => [`x${i}`, d])),
        ...Object.fromEntries(divisors(q.b).map((d, i) => [`y${i}`, d])),
        g: gcd(q.a, q.b),
      };
    case 'direct': {
      const [x, y] = q.third.pair;
      return { s: q.a, z: q.a, o: gcd(x, y) };
    }
    case 'yaqsim':
      expect(q.a % q.b === 0, `yaqsim: ${q.b} divides ${q.a}`);
      return { k: q.a / q.b, g: q.b };
    default:
      throw new Error(`unknown kind ${q.kind}`);
  }
}
/**
 * A wrong answer of the same shape — HALF-right on purpose where it is evidence: the two lists right and a smaller
 * common divisor as PGCD; « PGCD(a ; a) » right and « PGCD(a ; 0) = 0 »; k right and the PGCD 1.
 */
function wrongOf(q) {
  const r = solve(q);
  switch (q.kind) {
    case 'tap':
      return q.options.find((n) => n !== r);
    case 'tf':
      return { truth: !r.truth, reason: r.reason };
    case 'hasr':
      return {
        ...r,
        g: common(q.a, q.b)
          .filter((d) => d < r.g)
          .at(-1),
      };
    case 'direct':
      return { ...r, z: 0 };
    case 'yaqsim':
      return { ...r, g: 1 };
    default:
      return null;
  }
}

/**
 * « خريطة المعارف » laid out (the lesson's POSITIONS, kit/KnowledgePage.jsx): every card inside the map box, no card on
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
    stage: 10,
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
    uid: 9961,
    lessonId: ID,
    url: URL,
    seed: { [`u_9961_smarter_world_${ID}`]: save },
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
  await mapLaidOut(page, 'the knowledge map, a card open in its panel');

  // ══════════════════════════ one CARD, read as a card ══════════════════════════
  const kstate = () =>
    page.evaluate(() => {
      const k = window.__world.getState().know;
      return { read: k.read, sealed: k.sealed };
    });
  const texIn = (sel) =>
    page.evaluate(
      (s) =>
        [...document.querySelectorAll(`${s} annotation`)].map((x) => x.textContent.replace(/\\displaystyle\s*/, '')),
      sel,
    );
  const [W1, W2] = [32, 44];
  const G = gcd(W1, W2);
  {
    // a common mistake: a common divisor of 32 and 44 that is not the greatest, « so it is the PGCD »
    const before = (await kstate()).read;
    await page.click('[data-di-knode="khata-laysa-akbar"]');
    await page.waitForSelector('[data-di-kpanel="khata-laysa-akbar"]');
    await page.waitForTimeout(250);
    const P = '[data-di-kpanel="khata-laysa-akbar"]';
    expect(
      (await page.locator(`${P} [data-di-tab]`).count()) === 2 &&
        (await page.getAttribute(`${P} [data-di-tab="card"]`, 'aria-selected')) === 'true',
      'a card opens in its panel: its two tabs (the card, « تدرّب ») — the card first',
    );
    const wrongTex = (await texIn(`${P} .di-parts .is-wrong`)).join(' ');
    const wrongText = (await page.textContent(`${P} .di-parts .is-wrong`)) ?? '';
    const d0 = Number((wrongText.match(/\d+/) ?? [])[0]);
    expect(
      wrongText.includes(String(W1)) &&
        wrongText.includes(String(W2)) &&
        W1 % d0 === 0 &&
        W2 % d0 === 0 &&
        d0 < G &&
        wrongTex.replace(/\s/g, '').includes(`=${d0}`),
      `the card of a common mistake shows the WRONG sentence first: ${d0} divides ${W1} and ${W2}, « so PGCD = ${d0} » — but ${G} > ${d0} divides both (computed here)`,
    );
    expect(
      (await page.locator(`${P} [data-di-uncover]`).count()) === 1 &&
        (await page.locator(`${P} .di-parts .is-why, ${P} .di-parts .is-right`).count()) === 0 &&
        !(await kstate()).read.includes('khata-laysa-akbar'),
      'the reason and the right sentence are NOT shown before he asks: the card is not read yet',
    );
    await shot(page, 'know-card-mistake', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click(`${P} [data-di-uncover]`);
    await page.waitForSelector(`${P} .di-parts .is-right`);
    const why = (await page.textContent(`${P} .di-parts .is-why`)) ?? '';
    expect(
      why.includes(String(G)),
      `uncovered, the card names the greater common divisor, ${G} — computed here (« ${why.trim()} »)`,
    );
    expect(
      (await page.getAttribute('[data-di-knode="khata-laysa-akbar"]', 'data-read')) === 'true' &&
        (await kstate()).read.join() === [...before, 'khata-laysa-akbar'].join(),
      'the card is now READ: ticked on the map, saved',
    );
    await shot(page, 'know-card-mistake-read', { exit: ['[data-di-know-close]'], sound: true, numbers: true });

    // the card of a key: its memo sheet, then its two questions — wrong, then right
    await page.click('[data-di-knode="hasr"]');
    await page.waitForSelector('[data-di-kpanel="hasr"]');
    const K = '[data-di-kpanel="hasr"]';
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
      const plainRows = await page
        .locator(`${K} .di-memo dd`)
        .evaluateAll((els) => els.filter((e) => !e.querySelector('.katex')).map((e) => e.textContent));
      expect(
        rows === 5 && tex.length === 2 && plainRows.length === 3,
        `the memo sheet: the rule and its example drawn as formulas, the sentence that sticks, the trap, the exam (${rows} rows)`,
      );
      expect(
        tex.some((f) => [String(W1), String(W2), ...common(W1, W2).map(String)].every((x) => f.includes(x))),
        `its example: the common divisors of ${W1} and ${W2} are ${common(W1, W2).join(', ')} (${tex.join(' · ').slice(0, 90)})`,
      );
      check(!plainRows.some((t) => /\$|\\[a-zA-Z]{2,}/.test(t)), 'no raw formula in the sentences of the memo sheet');
    }
    await shot(page, 'know-card-memo', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click(`${K} [data-di-tab="quiz"]`);
    await page.waitForSelector(`${K} [data-di-quiz-check]`);
    const options = await page.locator(`${K} [data-di-quiz]`).evaluateAll((els) =>
      els.map((e) => ({
        id: e.dataset.diQuiz,
        tex: [...e.querySelectorAll('annotation')].map((x) => x.textContent.replace(/\\displaystyle\s*/, '')),
        text: e.textContent,
      })),
    );
    expect(options.length === 6, 'two questions of three choices');
    // question 1: PGCD(32 ; 44) — the walk computes it; question 2: the method — the choice that writes BOTH lists then
    // the common ones (read by its words: « قواسم a وقواسم b ثمّ المشتركة »)
    const q1 = options.filter((o) => o.id.startsWith('0-'));
    const right1 = q1.filter((o) => Number(o.tex[0]) === G);
    const q2 = options.filter((o) => o.id.startsWith('1-'));
    const right2 = q2.filter((o) => o.text.includes('وقواسم') && o.text.includes('المشتركة'));
    expect(
      right1.length === 1 && right2.length === 1,
      `question 1: ${G} (computed here); question 2: both lists, then the common ones`,
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
      (await kstate()).sealed.join() === 'hasr-wa-taqatu' &&
        (await page.locator('[data-di-knode="hasr"].is-gold').count()) === 1,
      'both right: the memo sheet of « احصر القواسم ثم قاطعها » is SEALED — gold on the map, saved',
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
  const reply = async (q, v) => {
    if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
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
  const allDivisors = (a, list) =>
    list.length === divisors(a).length &&
    new Set(list).size === list.length &&
    list.every((d) => d >= 1 && a % d === 0);
  /** The claim this lesson's evidence makes of an answer, decided HERE from the question and what he wrote. */
  const claimOf = (q, v) => {
    const n = (k) => Number(v[k]);
    if (q.kind === 'hasr') {
      const xs = divisors(q.a).map((_, i) => n(`x${i}`));
      const ys = divisors(q.b).map((_, i) => n(`y${i}`));
      if (!allDivisors(q.a, xs)) return { kind: 'divisors', a: q.a, list: xs, b: xs.length };
      if (!allDivisors(q.b, ys)) return { kind: 'divisors', a: q.b, list: ys, b: ys.length };
      return { kind: 'pgcd', a: q.a, b: q.b, g: n('g') };
    }
    if (q.kind === 'direct') {
      const lines = [
        [q.a, q.a, n('s')],
        [...q.zero, n('z')],
        [...q.third.pair, n('o')],
      ];
      const [a, b, g] = lines.find(([x, y, z]) => z !== gcd(x, y)) ?? lines[1];
      return { kind: 'pgcd', a, b, g };
    }
    const k = n('k');
    if (!(k > 0 && q.b * k === q.a)) return { kind: 'pair', a: q.a, b: q.b, e: k };
    return { kind: 'pgcd', a: q.a, b: q.b, g: n('g') };
  };
  /** The verdict the server computes of a claim, computed here. */
  const truthOf = (c) =>
    ({
      divisors: () => c.b === c.list.length && allDivisors(c.a, c.list),
      pgcd: () => c.g === gcd(c.a, c.b),
      pair: () => c.e > 0 && c.b * c.e === c.a,
    })[c.kind]();
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

  const allPosts = [];
  let halfRight = 0;
  let owedAll = 0;
  for (const card of Object.keys(TRAIN)) {
    await knode(card);
    await page.waitForTimeout(200);
    await page.click('[data-di-know-train]');
    await page.waitForSelector('[data-di-trainer]');
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
      const nums = q.kind === 'tap' ? [q.wave.a] : q.kind === 'tf' || q.kind === 'direct' ? [] : [q.a, q.b];
      check(
        nums.every((x) => text.includes(String(x))),
        `${card} · question ${i + 1}: the screen says the question’s own numbers${nums.length ? ` (${nums.join(', ')})` : ''}`,
      );
      if (q.format === 'exam' && q.kind !== 'tf') {
        check(
          await page.evaluate(() => window.__world.getState().paper === true),
          `${card} · question ${i + 1}: the exam format is answered in PAPER MODE`,
        );
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
        if (q.kind === 'hasr')
          check(
            lines.length === linesOf(q.a) + linesOf(q.b) + 1 &&
              inputs === divisors(q.a).length + divisors(q.b).length + 1 &&
              lines.at(-1).includes('PGCD'),
            `${card}: the list of ${q.a}, the list of ${q.b} (a box per divisor, computed here — more than three on two lines), then « PGCD = [ ] » (${inputs} boxes, ${lines.length} lines)`,
          );
        if (q.kind === 'direct')
          check(
            lines.length === (q.third.kind === 'one' ? 3 : 4) && inputs === 3,
            `${card}: three boxes « PGCD(…) = [ ] » (the pair turned round given on a line of its own: ${lines.length} lines)`,
          );
        if (q.kind === 'yaqsim')
          check(
            lines.length === 2 && inputs === 2 && lines[0].includes(String(q.a)) && lines[0].includes(String(q.b)),
            `${card}: « ${q.a} = ${q.b} × [ ] », then « PGCD = [ ] »`,
          );
        // no line of the sheet wraps (a formula never breaks across two lines)
        const wraps = await page.evaluate(
          () =>
            [...document.querySelectorAll('.di-sheet__line')].filter((l) => {
              const kids = [...l.children].map((k) => k.getBoundingClientRect()).filter((r) => r.height);
              return kids.some((r) => r.top > kids[0].top + kids[0].height * 0.8);
            }).length,
        );
        if (
          !check(
            wraps === 0,
            `${card} · question ${i + 1}: every line of the sheet stays on one line (${wraps} wrapped)`,
          )
        )
          await shot(page, `tr-${card}-${i + 1}-WRAPPED`, { exit: ['[data-di-know-close]'] });
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
      if (!seen.has(`${q.kind}:${q.format}`)) {
        seen.add(`${q.kind}:${q.format}`);
        await shot(page, `tr-${card}-${i + 1}-${q.kind}-${q.format}`, { exit: ['[data-di-know-close]'] });
      }
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
        if (EVIDENCE.includes(q.kind)) {
          // the hint never writes the answer AS an answer: no « PGCD(a ; b) = g » of the question
          const hint = f.fbText.replace(/\s+/g, '');
          const pairs = q.kind === 'direct' ? [[q.a, q.a], q.zero, q.third.pair] : [[q.a, q.b]];
          const gives = pairs.some(([x, y]) => hint.includes(`PGCD(${x};${y})=${gcd(x, y)}`));
          check(
            !gives,
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
    const posts = (await page.evaluate(() => window.__posts ?? [])).slice(sent0).map((p) => p.body);
    const owed = firstTries.filter((x) => x.q.format === 'exam' && EVIDENCE.includes(x.q.kind));
    owedAll += owed.length;
    expect(posts.length === owed.length, `${card}: ${owed.length} answers are sent as evidence (sent ${posts.length})`);
    for (const [k, p] of posts.entries()) {
      const x = owed[k];
      const want = claimOf(x.q, x.value);
      const truth = truthOf(p.claim);
      expect(
        p.context === 'trainer' &&
          typeof p.attemptId === 'string' &&
          p.attemptId.length > 6 &&
          p.learningPoint === `4am_${ID}_${POINT[x.q.key]}`,
        `${card}: evidence ${k + 1} is { attemptId, learningPoint 4am_${ID}_${POINT[x.q.key]}, context « trainer », claim }`,
      );
      expect(
        same(p.claim, want) && truth === (x.first === 'right'),
        `${card}: evidence ${k + 1} (${x.q.kind}) carries what he WROTE at the first try — claim ${JSON.stringify(p.claim).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`,
      );
      if (x.first === 'wrong') {
        halfRight += 1;
        expect(
          truth === false,
          `${card}: a HALF-right first try (${x.q.kind}) is sent as a FALSE claim — no الكفاءة is credited`,
        );
      }
    }
    allPosts.push(...posts);
  }
  expect(
    new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length && allPosts.length === owedAll,
    `every evidence has its own attempt id (${allPosts.length})`,
  );
  expect(halfRight >= 3, `half-right first tries were sent and judged false (${halfRight})`);
  await page.click('[data-di-know-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    '« خريطة المعارف » closes back to the title screen',
  );
});
