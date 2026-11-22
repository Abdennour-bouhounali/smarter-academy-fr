// The EXPERIMENT KIND `peel` of « قصر الساحات » (`rootCourts/InquiryPeel.jsx`), to register in ../experiments.mjs ›
// EXPERIMENTS as `peel` (the kind `peel` of the islands has no walk player: no clash). It plays the screen through its
// `data-iq-*` hooks; every answer is computed HERE, with the walk's own arithmetic (./exact.mjs, never the world's
// logic.js: defects.md C1), from what the screen SHOWS — the plaque's three numbers (the courts drawn, the pile beside
// them, the plate), written on the scene as `data-iq-courts`, `data-iq-pile`, `data-iq-value`. It ends before the last
// « انتهيت » (`playExperiment` clicks it).
import { inquiryFits, tellsNothing } from '../checks.mjs';
import { q, write, rootOf, cmp, eq } from './exact.mjs';

/** The frame of this kind, for checks.mjs › inquiryFits (its drawings hold no SVG text). */
export const PEEL_FRAME = {
  frame: '.rq-iq',
  parts:
    'button, input, .rq-iq__lead, .rq-iq__goal, .rq-ask, .rq-fact, .rq-table, .rq-pl__scene, .rq-pl__say, .rq-pl__op, .rq-pl__rodblock, .rq-pl__names',
  scene: 'svg',
};
const MISS = 'توقّعك لم يصب';
const WRONG = /خطأ|خاطئ|غلط/;
/** A fraction is never written « p/q » as text (it is drawn over a real bar); no letter x before a round is solved. */
const SLASH = /\d\s*\/\s*\d/;
const stage = (page) => page.getAttribute('.rq-iq', 'data-iq-stage');
const waitStage = (page, want, ms = 20000) =>
  page.waitForFunction((w) => w.includes(document.querySelector('.rq-iq')?.dataset.iqStage), want, { timeout: ms });
const fact = async (page) => ((await page.textContent('.rq-iq [data-iq-fact]').catch(() => '')) ?? '').trim();
const fits = (ctx, label) => inquiryFits(ctx.w, ctx.page, label, ['.rf-root [data-di-exit]'], PEEL_FRAME);

/** The plaque the scene shows: { courts, pile, plaque } as the walk reads them (fractions of BigInt). */
async function shown(page) {
  const a = await page.evaluate(() => {
    const s = document.querySelector('.rq-iq [data-iq-scene="plaque"]');
    return s ? { courts: s.dataset.iqCourts, pile: s.dataset.iqPile, plaque: s.dataset.iqValue } : null;
  });
  return a && { courts: q(a.courts), pile: q(a.pile), plaque: q(a.plaque) };
}
const absq = (x) => ({ n: x.n < 0n ? -x.n : x.n, d: x.d });
const div = (a, k) => q(`${a.n}/${a.d * BigInt(k)}`);
const mul = (a, k) => q(`${a.n * BigInt(k)}/${a.d}`);
const add = (a, t) => q(`${a.n * t.d + t.n * a.d}/${a.d * t.d}`);
const sub = (a, t) => add(a, { n: -t.n, d: t.d });
/** What the walk expects a peel to do (the world's law, re-derived): share k, multiply by k, add t, take t. */
function expectPeel(pl, op, n) {
  if (op === 'share') return { courts: div(pl.courts, n), pile: div(pl.pile, n), plaque: div(pl.plaque, n) };
  if (op === 'grow') return { courts: mul(pl.courts, n), pile: mul(pl.pile, n), plaque: mul(pl.plaque, n) };
  if (op === 'add') return { courts: pl.courts, pile: add(pl.pile, n), plaque: add(pl.plaque, n) };
  return { courts: pl.courts, pile: sub(pl.pile, n), plaque: sub(pl.plaque, n) };
}
const same = (a, b) => eq(a.courts, b.courts) && eq(a.pile, b.pile) && eq(a.plaque, b.plaque);
const str = (pl) => `${write(pl.courts)} courts, pile ${write(pl.pile)}, plate ${write(pl.plaque)}`;

/** Types a number into a box of the screen: one box, or its two boxes over a bar (« -num », « -den »). */
async function typeIn(page, hook, x) {
  const t = write(x);
  if (await page.locator(`.rq-iq [data-iq-in="${hook}-num"]`).count()) {
    const [n, d = '1'] = t.split('/');
    await page.fill(`.rq-iq [data-iq-in="${hook}-num"]`, n);
    await page.fill(`.rq-iq [data-iq-in="${hook}-den"]`, d);
  } else await page.fill(`.rq-iq [data-iq-in="${hook}"]`, t);
  return t;
}

/** One peel through the screen: its card's box, its button, until the world has done it (or answered with a fact). */
async function doPeel(page, op, n) {
  await typeIn(page, `op-${op}`, n);
  await page.click(`.rq-iq [data-iq-op-go="${op}"]`);
  await page.waitForTimeout(80);
  await waitStage(page, ['peel', 'alone']);
}

/**
 * `peel` — for each round: the plaque is read from the scene; ONCE (the first round that has several courts) he shares
 * by a number that does not split them (the slip this key fights — dividing by what is not there) and meets the fact,
 * the plaque unchanged; then the walk peels by its own road — the pile first (take what was added, add back what was
 * taken), then the courts (share by their pieces, multiply by their part) — checking after each peel that the plaque is
 * what the walk computed. When one court stands alone, its area is the plate: the walk computes its rods (two — a number
 * or the court's wall —, one of length 0, or none) and types them; on the first round that ends with no court or one
 * rod he says TWO rods (the belief « every area has its side ») and meets the fact. The world's end, the table's row and
 * the round's writing (shown only now) are checked.
 */
export async function peelExperiment(ctx, spec = {}) {
  const { w, page } = ctx;
  // the kind name `peel` is also one of the islands' (divisorIsles, lesson khawass-qawasim): this player is the courts'
  w.expect(
    (await page.locator('.rq-iq[data-iq="peel"]').count()) === 1,
    `${ctx.name}: the experiment on screen is the \`peel\` of « قصر الساحات » (the islands' \`peel\` has no player here)`,
  );
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.rq-iq');
  await fits(ctx, `${ctx.name}-open`);
  const rounds = await page.locator('.rq-iq .rq-pl__dot').count();
  w.expect(rounds >= 1, `${ctx.name}: the rounds are on screen (${rounds})`);
  let shareSlip = false;
  let endSlip = false;
  for (let r = 0; r < rounds; r += 1) {
    const ri = Number(await page.getAttribute('.rq-iq', 'data-iq-round'));
    w.expect(ri === r, `${ctx.name}: round ${r + 1} is on screen (data-iq-round ${ri})`);
    const text = (await page.textContent('.rq-iq')) ?? '';
    w.check(
      !SLASH.test(text) && !/x/.test(text.replace(/[^ -~]/g, '')),
      `${ctx.name}, round ${r + 1}: no fraction « p/q » as text, no letter x before the round is solved`,
    );
    let pl = await shown(page);
    const given = pl;
    // the walk's own lone area: (plate − pile) / courts
    const lone = pl && q(`${sub(pl.plaque, pl.pile).n * pl.courts.d}/${sub(pl.plaque, pl.pile).d * pl.courts.n}`);
    if ((await stage(page)) === 'peel') {
      // the slip: a share by a number that does not split the courts' pieces
      const pieces = pl.courts.n;
      if (!shareSlip && pieces >= 2n) {
        let k = pieces + 1n;
        while (pieces % k === 0n) k += 1n;
        if (k <= 12n) {
          shareSlip = true;
          await doPeel(page, 'share', q(String(k)));
          const f = await fact(page);
          const after = await shown(page);
          w.check(
            (await stage(page)) === 'peel' && same(after, pl) && f.length > 5 && !WRONG.test(f),
            `${ctx.name}, round ${r + 1}: shared by ${k} while ${pieces} pieces stand — not done, the plaque unchanged, the fact answers (« ${f.slice(0, 80)} »)`,
          );
          await fits(ctx, `${ctx.name}-r${r + 1}-split`);
        }
      }
      const road = [];
      if (pl.pile.n > 0n) road.push(['take', absq(pl.pile)]);
      if (pl.pile.n < 0n) road.push(['add', absq(pl.pile)]);
      // the pile is peeled first, so the courts' pieces are read from the plaque as given
      if (pl.courts.n > 1n) road.push(['share', q(String(pl.courts.n))]);
      if (pl.courts.d > 1n) road.push(['grow', q(String(pl.courts.d))]);
      for (const [op, n] of road) {
        const want = expectPeel(pl, op, n);
        await doPeel(page, op, n);
        const after = await shown(page); // at « alone » too: the lone court under its plate
        w.check(
          same(after, want),
          `${ctx.name}, round ${r + 1}: « ${op} ${write(n)} » on ${str(pl)} → ${str(want)} — computed here (the screen: ${str(after)})`,
        );
        const f = await fact(page);
        w.check(
          f.length > 5 && !WRONG.test(f),
          `${ctx.name}, round ${r + 1}: the fact of « ${op} » (« ${f.slice(0, 80)} »)`,
        );
        pl = want;
        if (road.length > 1 && op === road[0][0]) await fits(ctx, `${ctx.name}-r${r + 1}-${op}`);
      }
    }
    w.expect((await stage(page)) === 'alone', `${ctx.name}, round ${r + 1}: ONE court stands alone (${str(given)})`);
    const area = q(await plate(page));
    w.check(
      eq(area, lone),
      `${ctx.name}, round ${r + 1}: the lone court holds ${write(lone)} — computed here (plate ${write(area)})`,
    );
    await fits(ctx, `${ctx.name}-r${r + 1}-alone`);
    // the walk's rods
    const s = cmp(area, '0');
    const n = s > 0 ? 2 : s === 0 ? 1 : 0;
    const slip = !endSlip && n < 2;
    if (slip) endSlip = true;
    const say = slip ? 2 : n;
    await page.click(`.rq-iq [data-iq-count="${say}"]`);
    await page.waitForTimeout(80);
    const side = rootOf(area);
    if (say >= 1) {
      const sides = say === 2 ? ['right', 'left'] : ['right'];
      for (const k of sides) {
        if (slip) await typeIn(page, k, q('2'));
        else if (n === 1) await typeIn(page, k, q('0'));
        else if (side) await typeIn(page, k, side);
        else {
          await page.click(`.rq-iq [data-iq-form="${k}:wall"]`);
          await page.waitForTimeout(60);
          await typeIn(page, `${k}-wall`, area);
        }
      }
      if (say === 2) {
        const sign = await page.locator('.rq-iq [data-iq-rodblock="left"] [data-iq-sign]').count();
        w.check(sign === 1, `${ctx.name}, round ${r + 1}: the left rod carries its printed sign`);
      }
    }
    await fits(ctx, `${ctx.name}-r${r + 1}-rods`);
    await page.click('.rq-iq [data-iq-build]');
    await waitStage(page, ['seen']);
    const end = n === 2 ? 'two' : n === 1 ? 'one' : 'none';
    const got = await page.evaluate((i) => {
      const row = document.querySelector(`.rq-iq [data-iq-row="${i}"]`);
      return {
        end: document.querySelector('.rq-iq [data-iq-end]')?.dataset.iqEnd,
        row: row?.dataset.iqRowEnd,
        lone: row?.querySelector('[data-iq-cell-lone]')?.dataset.iqCellLone,
        tex: document.querySelectorAll('.rq-iq [data-iq-tex]').length,
      };
    }, r);
    w.check(
      got.end === end && got.row === end && got.lone != null && eq(got.lone, area),
      `${ctx.name}, round ${r + 1}: a court of ${write(area)} — ${end === 'two' ? `two rods, ${side ? write(side) : `the wall of ${write(area)}`} each way` : end === 'one' ? 'one rod, of length 0' : 'no court'} — the world and the table say what the walk computed (${got.end}, row ${got.row})`,
    );
    const wantTex = spec.rounds?.[r]?.tex ? 1 : 0;
    w.check(got.tex === wantTex, `${ctx.name}, round ${r + 1}: the round's writing is shown once solved (${got.tex})`);
    const f = await fact(page);
    w.check(
      (slip ? f.startsWith(MISS) : !f.startsWith(MISS)) && !WRONG.test(f),
      `${ctx.name}, round ${r + 1}: he said ${say} rod(s) — the world answers with what rides, never « wrong » (« ${f.slice(0, 90)} »)`,
    );
    await tellsNothing(w, page, `${ctx.name}, after round ${r + 1}`, ctx.forbid(), '.rq-iq');
    await fits(ctx, `${ctx.name}-r${r + 1}-seen`);
    if (r + 1 >= rounds) break; // « انتهيت »: left for playExperiment
    await page.click('.rq-iq [data-iq-next]');
    await page.waitForTimeout(250);
  }
  await fits(ctx, `${ctx.name}-table`);
}

/** The number on the plate (the lone court's area, at « alone »). */
const plate = (page) => page.getAttribute('.rq-iq [data-iq-plate]', 'data-iq-plate');
