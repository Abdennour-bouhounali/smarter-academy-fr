// The EXPERIMENT KINDS of the pyramids world (`nilePyramids/InquiryPlan.jsx`, `InquiryHalfturn.jsx`, `InquiryScale.jsx`),
// registered in ../experiments.mjs › EXPERIMENTS under `plan`, `halfturn` and `scale`. Each plays its screen through its
// `data-iq-*` hooks; every answer is computed HERE (./thales.mjs, ./exact.mjs) from what the round GIVES — the spec is
// the question (the lengths shown, the triangles fed), never what comes out (defects.md C1) — and each ends before its
// last « next » (`playExperiment` clicks it).
import { inquiryFits, tellsNothing, WRONG_WORD as WRONG } from '../checks.mjs';
import { cmp, eq, mul, q, sub, write } from './exact.mjs';
import { chainHolds, solveLength } from './thales.mjs';

/** The frame of this world's investigations, for checks.mjs › inquiryFits. */
export const NP_FRAME = {
  frame: '.np-iq',
  parts:
    'button, input, .np-iq__lead, .np-iq__ask, .np-iq__fact, .np-iq__chain, .np-iq__dial, .np-iq__refused, .np-iq__type, svg',
  scene: 'svg',
  lines: 0.5,
};
const stage = (page) => page.getAttribute('.np-iq', 'data-iq-stage');
const fits = (ctx, label) => inquiryFits(ctx.w, ctx.page, label, ['.rf-root [data-di-exit]'], NP_FRAME);
const iq = (page) => page.evaluate(() => window.__inquiry);
const add = (a, b) => sub(a, mul(b, '-1'));
const PIECES = { MB: ['VB', 'VM'], NC: ['VC', 'VN'] };

/** The card a plan needs for an unknown, and the card wholly known once the pieces are joined. */
function planCards(known, unknown) {
  const CARDS = [
    { id: 'VB', top: 'VM', bottom: 'VB' },
    { id: 'VC', top: 'VN', bottom: 'VC' },
    { id: 'BC', top: 'MN', bottom: 'BC' },
  ];
  const side = PIECES[unknown] ? PIECES[unknown][1] : unknown; // a piece is found through its part from the vertex
  const withIt = CARDS.find((c) => c.top === side || c.bottom === side);
  const whole = CARDS.find((c) => c !== withIt && known.has(c.top) && known.has(c.bottom));
  return { withIt, whole };
}

/**
 * `plan` — per round: the lengths GIVEN (and the joins the walk makes: two pieces of a side end to end), the two cards
 * of a plan, the unknown computed here and typed, laid: it FITS. On the first round a course of the WRONG length first
 * (the piece's ratio: the length times MB / VB), laid as a gap or an overhang, then the button for another course (`data-iq-next`).
 */
export async function planExperiment(ctx, spec) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.np-iq');
  for (const [i, r] of spec.rounds.entries()) {
    await page.waitForFunction((u) => document.querySelector('.np-iq')?.dataset.iqUnknown === u, r.unknown, {
      timeout: 10000,
    });
    const len = { ...r.fig.len };
    if (len.VB && len.VM) len.MB = write(sub(len.VB, len.VM));
    if (len.VC && len.VN) len.NC = write(sub(len.VC, len.VN));
    const given = Object.fromEntries(r.given.map((k) => [k, len[k]]));
    const want = solveLength(given, r.unknown);
    // the joins: a side from the vertex given in two pieces is joined end to end
    const known = new Set(r.given);
    for (const [whole, a, b] of [
      ['VB', 'VM', 'MB'],
      ['VC', 'VN', 'NC'],
    ])
      if (known.has(a) && known.has(b) && !known.has(whole)) {
        await page.click(`.np-iq [data-iq-join="${a}+${b}"]`);
        known.add(whole);
      } else if (known.has(whole) && known.has(b) && !known.has(a)) {
        // a whole side less its piece: the part from the vertex
        await page.click(`.np-iq [data-iq-join="${whole}-${b}"]`);
        known.add(a);
      }
    const { withIt, whole } = planCards(known, r.unknown);
    w.expect(withIt && whole, `${ctx.name}, round ${i + 1}: two cards make a plan for ${r.unknown} (computed here)`);
    await page.click(`.np-iq [data-iq-card="${withIt.id}"]`);
    await page.click(`.np-iq [data-iq-card="${whole.id}"]`);
    if (i === 0) await fits(ctx, `${ctx.name}-plan`);
    const lay = async (x) => {
      await page.fill('.np-iq [data-iq-in]', write(x));
      await page.click('.np-iq [data-iq-lay]');
      await page.waitForSelector('.np-iq [data-iq-laid]');
      return page.getAttribute('.np-iq [data-iq-laid]', 'data-iq-laid');
    };
    if (i === 0) {
      const off = add(want, '1');
      const fact = await lay(off);
      const said = ((await page.textContent('.np-iq [data-iq-fact]')) ?? '').trim();
      w.check(
        fact === 'overhang' && said.length > 5 && !WRONG.test(said),
        `${ctx.name}, round 1: a course of ${write(off)} for ${r.unknown} = ${write(want)} OVERHANGS by 1, said as a fact (« ${said.slice(0, 70)} »)`,
      );
      await fits(ctx, `${ctx.name}-overhang`);
      await page.click('.np-iq [data-iq-next]');
      await page.waitForFunction(() => !document.querySelector('.np-iq [data-iq-laid]'));
      // the cards stay picked, the joins made: only the length is typed again
      const s = await iq(page);
      w.check(s.picked.length === 2 && s.typed === '', `${ctx.name}: « again » keeps his plan, clears his number`);
    }
    const fact = await lay(want);
    w.check(fact === 'fits', `${ctx.name}, round ${i + 1}: ${r.unknown} = ${write(want)}, computed here — it fits`);
    if (i === 0) await ctx.w.shot(page, `${ctx.name}-fits`, { exit: ['.rf-root [data-di-exit]'] });
    await tellsNothing(w, page, `${ctx.name}, round ${i + 1}`, ctx.forbid(), '.np-iq');
    if (i < spec.rounds.length - 1) await page.click('.np-iq [data-iq-next]');
  }
  await fits(ctx, `${ctx.name}-end`);
}

/**
 * `halfturn` — per round: BEFORE the turn, on which line M lands (a half-turn round V keeps every line through V: on
 * (VB) — the walk says (VC) once, on the second round, and meets the fact); the turn by ← → (the keys on round 1, the
 * buttons after) up to 180°; it lands on (VB), and the gauge stands aligned exactly when the three ratios are equal
 * (computed here; the river's roots ratio by their coefficients).
 */
export async function halfturnExperiment(ctx, spec) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.np-iq');
  for (const [i, r] of spec.rounds.entries()) {
    await page.waitForFunction((n) => window.__inquiry?.i === n && window.__inquiry.stage === 'predict', i, {
      timeout: 10000,
    });
    if (i === 0) await fits(ctx, `${ctx.name}-predict`);
    const say = i === 1 ? 'C' : 'B';
    await page.click(`.np-iq [data-iq-predict="${say}"]`);
    await page.waitForFunction(() => document.querySelector('.np-iq')?.dataset.iqStage === 'turn');
    for (let n = 0; n < 8 && (await stage(page)) === 'turn'; n += 1) {
      if (i === 0) await page.keyboard.press('ArrowRight');
      else await page.click('.np-iq [data-iq-turn="1"]');
      await page.waitForTimeout(60);
      if (i === 0 && n === 2) await fits(ctx, `${ctx.name}-turning`);
    }
    w.expect((await stage(page)) === 'landed', `${ctx.name}, round ${i + 1}: turned half a turn (180°), it lands`);
    const out = await page.evaluate(() => {
      const o = document.querySelector('.np-iq [data-iq-landed]');
      return {
        landed: o?.dataset.iqLanded,
        aligned: o?.dataset.iqAligned,
        fact: document.querySelector('.np-iq [data-iq-fact]')?.dataset.iqFact,
        said: document.querySelector('.np-iq [data-iq-fact]')?.textContent.trim() ?? '',
      };
    });
    const holds = chainHolds(r.fig.len);
    w.check(
      out.landed === 'B' && out.fact === (say === 'B' ? 'hit' : 'miss') && !WRONG.test(out.said),
      `${ctx.name}, round ${i + 1}: M lands on (VB); said (V${say}) — « ${out.said.slice(0, 70)} »`,
    );
    if (holds != null)
      w.check(
        out.aligned === (holds ? 'yes' : 'no'),
        `${ctx.name}, round ${i + 1}: the gauge ${holds ? 'aligns' : 'stands apart'} — the three ratios ${holds ? 'are' : 'are not'} equal, computed here (${out.aligned})`,
      );
    await fits(ctx, `${ctx.name}-landed-${i + 1}`);
    if (i < 3) await ctx.w.shot(page, `${ctx.name}-landed-${i + 1}`, { exit: ['.rf-root [data-di-exit]'] });
    await tellsNothing(w, page, `${ctx.name}, round ${i + 1}`, ctx.forbid(), '.np-iq');
    if (i < spec.rounds.length - 1) await page.click('.np-iq [data-iq-next]');
  }
}

/**
 * `scale` — the capstone's fact, then each round: the copy of the triangle fed at k, against the OTHER one — its sides
 * × k computed here: larger, exact or smaller (said BEFORE; once, on the second copy, the walk says « exact » and meets
 * the fact); k set by him: first 6/5 the wrong way, then target / fed; the perimeter: × k.
 */
export async function scaleExperiment(ctx, spec) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.np-iq');
  const per = (t) => t.sides.reduce((s, x) => add(s, x), q('0'));
  const image = (feed, k) => {
    const [fed, target] = feed === 'small' ? [spec.tri.small, spec.tri.big] : [spec.tri.big, spec.tri.small];
    const c = cmp(mul(fed.sides[0], k), target.sides[0]);
    return c === 0 ? 'exact' : c < 0 ? 'inside' : 'outside';
  };
  const SAY = { inside: 'smaller', exact: 'exact', outside: 'larger' };
  let copies = 0;
  for (const [i, r] of spec.rounds.entries()) {
    await page.waitForFunction((n) => window.__inquiry?.i === n, i, { timeout: 10000 });
    const st = await stage(page);
    if (r.fact) {
      w.check(st === 'fact', `${ctx.name}, round ${i + 1}: the capstone comes in as the world's FACT`);
      await fits(ctx, `${ctx.name}-fact`);
      await page.click('.np-iq [data-iq-next]');
      continue;
    }
    const copy = async () => {
      await page.click('.np-iq [data-iq-copy]');
      await page.waitForSelector('.np-iq [data-iq-image]');
      return page.evaluate(() => {
        const o = document.querySelector('.np-iq [data-iq-image]');
        return {
          image: o.dataset.iqImage,
          perimeter: o.dataset.iqPerimeter,
          fact: document.querySelector('.np-iq [data-iq-fact]')?.dataset.iqFact ?? null,
        };
      });
    };
    if (st === 'predict') {
      const k = await page.getAttribute('.np-iq', 'data-iq-k');
      const want = image(r.feed, k);
      copies += 1;
      const say = copies === 2 ? (want === 'exact' ? 'larger' : 'exact') : SAY[want];
      await page.click(`.np-iq [data-iq-predict="${say}"]`);
      const out = await copy();
      w.check(
        out.image === want && out.fact === (say === SAY[want] ? 'hit' : 'miss'),
        `${ctx.name}, round ${i + 1}: fed ${r.feed} at k = ${k}, the copy is ${want} (computed here); said « ${say} » — ${out.fact}`,
      );
      if (copies === 2) await fits(ctx, `${ctx.name}-miss`);
    } else if (st === 'set') {
      const [fed, target] = r.feed === 'small' ? [spec.tri.small, spec.tri.big] : [spec.tri.big, spec.tri.small];
      const k = q(mul(target.sides[0], { n: q(fed.sides[0]).d, d: q(fed.sides[0]).n }));
      // first the number the other way round: the copy goes beyond (or stays inside) — « try another number »
      await page.fill('.np-iq [data-iq-kn]', String(k.d));
      await page.fill('.np-iq [data-iq-kd]', String(k.n));
      let out = await copy();
      w.check(
        out.image === image(r.feed, { n: k.d, d: k.n }),
        `${ctx.name}, round ${i + 1}: k = ${k.d}/${k.n} (upside down) — the copy is ${out.image}`,
      );
      await fits(ctx, `${ctx.name}-set-wrong`);
      await page.click('.np-iq [data-iq-next]');
      await page.waitForSelector('.np-iq [data-iq-kn]');
      await page.fill('.np-iq [data-iq-kn]', String(k.n));
      await page.fill('.np-iq [data-iq-kd]', String(k.d));
      out = await copy();
      w.check(
        out.image === 'exact',
        `${ctx.name}, round ${i + 1}: k = ${k.n}/${k.d} = ${r.feed === 'small' ? 'big' : 'small'} / fed, computed here — the copy is exact`,
      );
    } else if (st === 'perimeter') {
      const k = await page.getAttribute('.np-iq', 'data-iq-k');
      const fed = spec.tri[r.feed];
      const want = mul(per(fed), k);
      await page.click('.np-iq [data-iq-choose="times"]');
      const out = await copy();
      w.check(
        eq(q(out.perimeter), want) && out.fact === 'hit',
        `${ctx.name}, round ${i + 1}: the perimeter of the copy is the perimeter × k = ${write(want)}, computed here (${out.perimeter})`,
      );
      await fits(ctx, `${ctx.name}-perimeter`);
    } else w.expect(false, `${ctx.name}, round ${i + 1}: a stage the walk knows (${st})`);
    await tellsNothing(w, page, `${ctx.name}, round ${i + 1}`, ctx.forbid(), '.np-iq');
    if (i < spec.rounds.length - 1) await page.click('.np-iq [data-iq-next]');
  }
}
