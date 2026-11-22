// « خريطة المعارف » and « تدرّب » of lesson `bahth-pgcd` (lesson 6), as a STUDENT holding the five keys. The map's
// fifteen cards laid out (the lesson's positions: inside the map, apart, no label under a card, the subtitle whole); then
// four cards trained — farq, baqi, muqarana (its « sura » sheet: two boxes and a SELECT, new in this lesson) and the
// takeaway khulasa (the mix) — six questions each, so EVERY kind of the lesson's `world/trainer.js` is played through its
// screen: tap, tf (game, and exam with its reason), farq, furuq, baqi, iqlidis, sura. The first question of each session is
// answered WRONG then right (the hint, then the correction), the others right at the first try.
// Answers are computed HERE from the question's numbers (the two algorithms are the walk's own, lib/bahth.mjs). ONE
// exception, said in the report: the truth of a « صحيح أم خطأ؟ » statement is found by TRYING (true, then false after the
// hint) — its reason (exam) is the one whose every equality and « يقسم » holds, computed here. No evidence is asserted here.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-bahth-trainer.mjs [outDir]
import { createWalk } from './lib/walk.mjs';
import { ID, URL, KEYS, BAHTH_FOREIGN, BAHTH_NUMBERS, gcd, divisions, subtractions } from './lib/bahth.mjs';

const CARDS = [
  'pgcd-tawil',
  'rappel',
  'farq',
  'khata-farq',
  'mithal-152',
  'silsila',
  'khata-sifr',
  'mithal-259',
  'baqi',
  'mithal-962',
  'khata-hasil',
  'iqlidis',
  'mithal-1833',
  'muqarana',
  'khulasa',
];
/** The kinds each trained card must show (world/trainer.js › PLANS through PLAN_OF). */
const TRAIN = {
  farq: ['tap', 'tf', 'farq'],
  baqi: ['tap', 'tf', 'baqi'],
  muqarana: ['tap', 'tf', 'sura'],
  khulasa: ['tap', 'tf', 'furuq', 'iqlidis', 'sura'],
};
const w = createWalk('gameworld-bahth-trainer', { foreign: BAHTH_FOREIGN, foreignNumbers: BAHTH_NUMBERS });
const { expect, check, shot } = w;
const OUT = { exit: ['[data-di-know-close]'], sound: true, numbers: true };
/** A question of « تدرّب » draws its numbers at random: other lessons' numbers may come out (not checked there). */
const DRAWN = { ...OUT, numbers: false };

/** Is gate n right for this wave? Computed HERE (the hub walk's table). */
const gateRight = (x, n) =>
  ({
    pgcdBox: () => n >= 1 && gcd(x.b, n) === gcd(x.a, x.b),
    remainder: () => n === x.a % x.b,
    lastDiff: () => n === gcd(x.a, x.b),
    lastRest: () => n === gcd(x.a, x.b),
    pgcd: () => n === gcd(x.a, x.b),
    divCount: () => n === divisions(x.a, x.b).length,
    subCount: () => n === subtractions(x.a, x.b).length,
  })[x.type]?.();
const plain = (text) =>
  text
    .replace(/\$/g, '')
    .replace(/\\mathrm\{PGCD\}/g, 'PGCD')
    .replace(/\\times/g, '×')
    .replace(/\\left|\\right/g, '')
    .replace(/[⁦⁩]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
/** Is a reason TRUE? Every equality « x = y × z (+ r) », « x − y = z », every « d (لا) يقسم n », every PGCD written. */
function reasonTrue(text) {
  const t = plain(text);
  for (const m of t.matchAll(/(\d+) = (\d+) × (\d+)(?: \+ (\d+))?/g))
    if (Number(m[1]) !== Number(m[2]) * Number(m[3]) + Number(m[4] ?? 0)) return false;
  for (const m of t.matchAll(/(\d+) [-−] (\d+) = (\d+)/g))
    if (Number(m[1]) - Number(m[2]) !== Number(m[3])) return false;
  for (const m of t.matchAll(/(\d+) (لا )?يقسم (\d+)/g)) {
    const divides = Number(m[3]) % Number(m[1]) === 0;
    if (divides === Boolean(m[2])) return false;
  }
  for (const m of t.matchAll(/PGCD\((\d+) ; (\d+)\) = (\d+)(?![\d(])/g))
    if (gcd(Number(m[1]), Number(m[2])) !== Number(m[3])) return false;
  return true;
}
/** The right answer of a question of a FORM, from its numbers. */
function solveForm(q) {
  const [d] = divisions(q.a, q.b);
  switch (q.kind) {
    case 'farq':
      return { e: q.a - q.b, g: gcd(q.a, q.b) };
    case 'furuq':
      return { d: q.a - q.b, g: gcd(q.a, q.b) };
    case 'baqi':
      return { q: d.q, r: d.r, e: d.r };
    case 'iqlidis':
      return { q: d.q, r: d.r, g: gcd(q.a, q.b) };
    case 'sura':
      return { e: divisions(q.a, q.b).length, s: subtractions(q.a, q.b).length, fast: 'euclid' };
    default:
      throw new Error(`unknown kind ${q.kind}`);
  }
}

/** « خريطة المعارف » laid out: every card inside the map box, apart, no label under a card, the subtitle whole. */
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
    const nodes = [...map.querySelectorAll('[data-di-knode]')]
      .filter(shown)
      .map((el) => ({ id: el.dataset.diKnode, r: el.getBoundingClientRect() }));
    const labels = [...map.querySelectorAll('.di-kmap__edge')]
      .filter(shown)
      .map((el) => ({ t: el.textContent.trim(), r: el.getBoundingClientRect() }));
    for (const n of nodes)
      if (n.r.left < box.left - 1 || n.r.right > box.right + 1 || n.r.top < box.top - 1 || n.r.bottom > box.bottom + 1)
        out.push(`card ${n.id} cut by the map's edge`);
    for (let i = 0; i < nodes.length; i += 1)
      for (let j = i + 1; j < nodes.length; j += 1)
        if (meet(nodes[i].r, nodes[j].r)) out.push(`cards ${nodes[i].id} / ${nodes[j].id} overlap`);
    for (const l of labels) for (const n of nodes) if (meet(l.r, n.r)) out.push(`label « ${l.t} » under card ${n.id}`);
    const sub = document.querySelector('.di-page__head p');
    if (sub && sub.getClientRects().length) {
      const line = parseFloat(getComputedStyle(sub).lineHeight) || sub.getBoundingClientRect().height;
      if (sub.scrollWidth > sub.clientWidth + 1 || sub.scrollHeight > sub.clientHeight + line / 2)
        out.push('the subtitle overflows its box');
    }
    return out;
  });
  check(
    bad.length === 0,
    `${where}: the map's cards inside it and apart, no label under a card, the subtitle whole${bad.length ? ' — ' + bad.join(' | ') : ''}`,
  );
};

await w.run(async () => {
  const know = { found: CARDS, read: [], sealed: [], trained: {} };
  const practice = Object.fromEntries(KEYS.map((k) => [`${k}:1`, { stars: 2, best: 800 }]));
  const save = {
    v: 1,
    stage: 11,
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
    uid: 9963,
    lessonId: ID,
    url: URL,
    seed: { [`u_9963_smarter_world_${ID}`]: save },
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
  await mapLaidOut(page, 'the knowledge map');
  await shot(page, 'know-full', OUT);

  const tr = () =>
    page.evaluate(() => ({
      q: window.__trainer?.q,
      index: window.__trainer?.index,
      dom: document.querySelector('[data-di-trainer]')?.dataset.diTrainer,
      fb: document.querySelector('[data-di-tr-fb]')?.dataset.diTrFb ?? null,
      fbText: document.querySelector('[data-di-tr-fb]')?.textContent ?? '',
    }));
  const fill = async (v) => {
    for (const [k, x] of Object.entries(v)) {
      const sel = `[data-di-tr="${k}"]`;
      const tag = await page.evaluate((s) => document.querySelector(s)?.tagName, sel);
      if (tag === 'SELECT') {
        const opt = await page.evaluate(
          ([s, want]) =>
            [...document.querySelector(s).options].find((o) => o.value === want || o.value.endsWith(want))?.value,
          [sel, x],
        );
        await page.selectOption(sel, opt ?? String(x));
      } else await page.fill(sel, String(x));
    }
    await page.click('[data-di-tr-check]');
  };
  const knode = async (id) => {
    const nd = page.locator(`[data-di-knode="${id}"]`);
    if (!(await nd.isVisible())) await page.click('[data-di-tab="card"]');
    await nd.click();
  };
  /** Waits until the feedback changes (a hint or a correction) or the next question comes. */
  const settle = async (index) => {
    await page.waitForTimeout(250);
    for (let k = 0; k < 20; k += 1) {
      const t = await tr();
      if (t.fb || t.index !== index || t.dom === 'done') return t;
      await page.waitForTimeout(150);
    }
    return tr();
  };
  const nextQ = async () => {
    if (await page.locator('[data-di-tr-next]').count()) await page.click('[data-di-tr-next]');
    await page.waitForTimeout(250);
  };

  for (const card of Object.keys(TRAIN)) {
    await knode(card);
    await page.waitForTimeout(200);
    await page.click('[data-di-know-train]');
    await page.waitForSelector('[data-di-trainer]');
    if (card === 'farq') await mapLaidOut(page, `the knowledge map beside « تدرّب » (${card})`);
    const kinds = new Set();
    for (let i = 0; i < 6; i += 1) {
      if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
      const t = await tr();
      const { q } = t;
      expect(t.index === i, `${card} · question ${i + 1}: « ${q.kind} » (${q.format})`);
      kinds.add(q.kind);
      const label = `${card}-q${i + 1}-${q.kind}`;
      if (q.kind === 'tap') {
        const ok = q.options.filter((n) => gateRight(q.wave, n));
        expect(ok.length === 1, `${label}: exactly one gate is right (${q.wave.type}: ${q.options.join(', ')})`);
        if (i === 0) {
          await page.click(`[data-di-tr-opt="${q.options.find((n) => n !== ok[0])}"]`);
          const h = await settle(i);
          check(
            h.fb != null && !/خطأ|خاطئ/.test(h.fbText),
            `${label}: a wrong gate is answered by a hint, never « wrong » (« ${h.fbText.trim().slice(0, 80)} »)`,
          );
          await shot(page, `${label}-hint`, DRAWN);
        }
        await page.click(`[data-di-tr-opt="${ok[0]}"]`);
      } else if (q.kind === 'tf') {
        let reason = null;
        if (q.reasons) {
          const good = q.reasons.map((r, k) => (reasonTrue(r.t) ? k : -1)).filter((k) => k >= 0);
          check(
            good.length === 1,
            `${label}: exactly one reason states only true facts (${good.join()}) — « ${plain(q.statement).slice(0, 60)} »`,
          );
          reason = good[0];
        }
        const answer = async (truth) => {
          await page.click(`[data-di-tr-tf="${truth}"]`);
          if (q.reasons) {
            await page.click(`[data-di-tr-reason="${reason}"]`);
            await page.click('[data-di-tr-check]');
          }
          return settle(i);
        };
        let r = await answer(true);
        if (r.index === i && r.fb && r.fb !== 'ok' && r.fb !== 'right') {
          await shot(page, `${label}-tried`, DRAWN);
          r = await answer(false);
        }
      } else {
        const v = solveForm(q);
        if (i === 2 || q.kind === 'sura') await shot(page, `${label}-sheet`, DRAWN);
        if (q.kind === 'sura') {
          const sel = await page.locator('[data-di-trainer] select').count();
          check(sel === 1, `${label}: the sheet holds ONE select box for « الأسرع » (${sel})`);
        }
        if (i === 2) {
          const wrong = {
            ...v,
            [Object.keys(v).at(-1)]: q.kind === 'sura' ? 'diff' : Number(Object.values(v).at(-1)) + 1,
          };
          await fill(wrong);
          const h = await settle(i);
          check(h.fb != null, `${label}: a wrong last box answered (« ${h.fbText.trim().slice(0, 80)} »)`);
          await shot(page, `${label}-hint`, DRAWN);
        }
        await fill(v);
      }
      const done = await settle(i);
      if (done.fb) await shot(page, `${label}-fb`, DRAWN);
      await nextQ();
    }
    for (const k of TRAIN[card])
      check(kinds.has(k), `${card}: the session shows a « ${k} » question (${[...kinds].join(', ')})`);
    await page.waitForSelector('[data-di-trainer="done"]', { timeout: 8000 }).catch(() => {});
    await shot(page, `${card}-done`, DRAWN);
    if (await page.locator('[data-di-tab="card"]').count()) await page.click('[data-di-tab="card"]');
    await page.waitForTimeout(200);
  }
});
