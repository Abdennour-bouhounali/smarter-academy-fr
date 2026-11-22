// The EXPERIMENT KINDS of « Le palais des dalles » (`rootCourts/InquiryCalc.jsx`, `rootCourts/InquiryRoundtrip.jsx`,
// `rootCourts/InquiryChase.jsx`), registered in ../experiments.mjs › EXPERIMENTS under `calc`, `roundtrip` and `chase`. Each plays its screen through its
// `data-iq-*` hooks; every answer is computed HERE from what the screen shows (the court's area, the rod's number, what
// goes into a station — `window.__inquiry` gives the question, never what comes out: defects.md C1), and each ends
// before its last « next » (`playExperiment` clicks it).
import { inquiryFits, tellsNothing, WRONG_WORD } from '../checks.mjs';
import { platform, q, rootOf, sq, write, eq, mul, cmp, absq, sub } from './exact.mjs';

/** The frame of this world's investigations, for checks.mjs › inquiryFits. */
export const RC_FRAME = {
  frame: '.rq-iq',
  parts: 'button, input, .rq-iq__lead, .rq-iq__goal, .rq-ask, .rq-fact, .rq-table, .rq-strips, .rq-ch__card, svg',
  scene: 'svg',
  // stacked lines of one label (« 30 » over « dalles » on the gate, « √30 = » over the calculator's ten digits): their
  // boxes are the font's whole em and meet by up to ~40 % of a line while the glyphs stand apart (crop enlarged ×4 on
  // 2026-11-21: nothing touches) — an overlap counts beyond half a line
  lines: 0.5,
};
/**
 * The opening of the fact when his prediction missed — a sentence of the LESSON's inquiry (`spec.text`), so its French
 * wording is the kit's (kit/text.js › FORGE.miss « Ta prédiction n’a pas vu juste cette fois. »): a lesson that words it
 * otherwise must start its miss with these words, or this constant follows it.
 */
const MISS = 'Ta prédiction n’a pas vu juste';
/** A sentence that calls an answer wrong (../checks.mjs › WRONG_WORD). */
const WRONG = WRONG_WORD;
const stage = (page) => page.getAttribute('.rq-iq', 'data-iq-stage');
const waitStage = (page, want, ms = 20000) =>
  page.waitForFunction((w) => w.includes(document.querySelector('.rq-iq')?.dataset.iqStage), want, { timeout: ms });
const fact = async (page) => ((await page.textContent('[data-iq-fact]').catch(() => '')) ?? '').trim();
const fits = (ctx, label) => inquiryFits(ctx.w, ctx.page, label, ['.rf-root [data-di-exit]'], RC_FRAME);

/**
 * `calc` — the court of `spec.a` and the rods lying ready: for each rod he says BEFORE whether its platform rides (the
 * walk computes it; on the calculator's rod he says « it rides », the belief this key fights, and meets the fact); the
 * platform comes down; when the band is too thin to see he presses « Agrandis » until it is seen; the row stays in the table
 * with what the walk computed. Last, the rod clamped on the wall rides and its cell has no number.
 */
export async function calcExperiment(ctx) {
  const { w, page } = ctx;
  const area = await page.getAttribute('.rq-iq', 'data-iq-area');
  w.expect(area != null, `${ctx.name}: the court of the experiment is on screen (${area} tiles)`);
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.rq-iq');
  await fits(ctx, `${ctx.name}-open`);
  for (let k = 0; k < 8; k += 1) {
    const st = await stage(page);
    if (st === 'wall') break;
    w.expect(st === 'say', `${ctx.name}, rod ${k + 1}: he is asked BEFORE the platform comes down (stage ${st})`);
    const key = await page.getAttribute('.rq-iq', 'data-iq-rod'); // « q5,47 »
    const rod = key.slice(1);
    const calc = (await page.locator(`[data-iq-rackrod="${k}"] .rq-calcicon`).count()) > 0;
    const out = platform({ q: rod }, area);
    const rides = out.kind === 'ride';
    // the calculator's rod: he believes the screen (the error this key fights) — the world answers with its fact
    const said = calc ? true : rides;
    if (k === 0) await fits(ctx, `${ctx.name}-ask`);
    await page.click(`.rq-iq [data-iq-say="${said ? 'yes' : 'no'}"]`);
    await waitStage(page, ['zoom', 'seen']);
    let zooms = 0;
    if ((await stage(page)) === 'zoom') {
      const thin = await fact(page);
      w.check(
        thin.length > 10 && !WRONG.test(thin),
        `${ctx.name}, ${rod}: too thin to see — the screen asks him to magnify (« ${thin.slice(0, 80)} »)`,
      );
      await fits(ctx, `${ctx.name}-zoom`);
      for (; zooms < 14 && (await stage(page)) === 'zoom'; zooms += 1) {
        await page.click('.rq-iq [data-iq-zoomin]');
        await page.waitForTimeout(120);
      }
      w.check(
        (await stage(page)) === 'seen',
        `${ctx.name}, ${rod}: magnified ${zooms} times by his hand, the band is SEEN`,
      );
    }
    const row = await page.evaluate((i) => {
      const r = document.querySelector(`.rq-iq [data-iq-row="${i}"]`);
      return r ? { kind: r.dataset.iqRowKind, text: r.textContent } : null;
    }, k);
    const f = await fact(page);
    w.check(
      row?.kind === out.kind &&
        row.text.replace(/\s/g, '').includes(out.covers) &&
        (rides || row.text.replace(/\s/g, '').includes(out.diff)),
      `${ctx.name}, ${rod}² = ${out.covers} against ${area}: ${out.kind}${rides ? '' : `, ${out.diff} tile`} — the row of the table says what the walk computed (« ${row?.text.trim().slice(0, 70)} »)`,
    );
    w.check(
      (said === rides ? !f.startsWith(MISS) : f.startsWith(MISS)) && !WRONG.test(f),
      `${ctx.name}, ${rod}: his prediction (${said ? 'it rides' : 'it does not'}) is answered by the fact, never « wrong » (« ${f.slice(0, 90)} »)`,
    );
    await tellsNothing(w, page, `${ctx.name}, after ${rod}`, ctx.forbid(), '.rq-iq');
    await fits(ctx, `${ctx.name}-${calc ? 'calculator' : `rod-${rod}`}`);
    await page.click('.rq-iq [data-iq-next]');
    await page.waitForTimeout(200);
  }
  // the wall: clamped corner to corner, it rides — and its cell has no number
  w.expect(
    (await stage(page)) === 'wall',
    `${ctx.name}: no rod of the rack rode — the screen asks to clamp the rod on the wall`,
  );
  await fits(ctx, `${ctx.name}-wall-ask`);
  await page.click('.rq-iq [data-iq-clamp]');
  await waitStage(page, ['say', 'seen']);
  if ((await stage(page)) === 'say') {
    // the clamped rod is asked like any other: what its platform does is computed here (the wall's own length)
    await page.click(`.rq-iq [data-iq-say="${platform({ root: area }, area).kind === 'ride' ? 'yes' : 'no'}"]`);
    await waitStage(page, ['seen']);
  }
  const wall = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.rq-iq [data-iq-row]')];
    const last = rows.at(-1);
    return {
      kind: last?.dataset.iqRowKind ?? null,
      cell: document.querySelector('.rq-iq [data-iq-wallcell]')?.textContent.trim() ?? null,
      note: document.querySelector('.rq-iq [data-iq-wallnote]')?.textContent ?? '',
    };
  });
  w.check(
    wall.kind === 'ride' && wall.cell === (ctx.unknownCell ?? '?') && wall.note.includes(area),
    `${ctx.name}: the rod clamped on the wall of ${area} RIDES; its cell is « ${ctx.unknownCell ?? '?'} » — a length with no number (« ${wall.note.trim().slice(0, 70)} »)`,
  );
  await tellsNothing(w, page, `${ctx.name}, the end`, ctx.forbid(), '.rq-iq');
  await fits(ctx, `${ctx.name}-wall`);
}

/** What a station gives, computed HERE: « build » a court on a rod (its area), « take » the side of a court. */
function stationOut(op, thing) {
  if (op === 'build') {
    const rod = thing.rod ?? { q: thing.walk };
    return { court: rod.root != null ? write(q(rod.root)) : write(sq(rod.q)) };
  }
  const r = rootOf(thing.court);
  return r ? { rod: { q: write(r) } } : { rod: { root: write(q(thing.court)) } };
}

/**
 * `roundtrip` — for each journey, station after station: he TYPES what will come out before the station runs (the walk
 * computes it from what goes in); on the walk to the LEFT he types the side WITH its sign (the error this key fights) and
 * meets the fact; the station runs, and what came out is what the walk computed.
 */
export async function roundtripExperiment(ctx) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.rq-iq');
  let shots = 0;
  for (let k = 0; k < 20; k += 1) {
    const st = await stage(page);
    w.expect(
      st === 'ask',
      `${ctx.name}, station ${k + 1}: he is asked what will come out BEFORE it runs (stage ${st})`,
    );
    const iq = await page.evaluate(() => ({
      ri: window.__inquiry.ri,
      si: window.__inquiry.si,
      op: window.__inquiry.op,
      in: window.__inquiry.in,
    }));
    const want = stationOut(iq.op, iq.in);
    const fromWalk = iq.in.walk != null || (iq.op === 'take' && k > 0 && ctx.lastIn?.walk != null);
    let typed;
    let right = true;
    if (iq.op === 'build') {
      typed = want.court;
      await page.fill('.rq-iq [data-iq-in="plaque"]', typed);
    } else if (want.rod.q != null) {
      // the walk to the left: he keeps the sign of the walk once (the slip), the station answers with its fact
      const slip = fromWalk && !ctx.slipped;
      typed = slip ? `-${want.rod.q}` : want.rod.q;
      right = !slip;
      if (slip) ctx.slipped = true;
      if (await page.locator('.rq-iq [data-iq-form="number"]').count())
        await page.click('.rq-iq [data-iq-form="number"]');
      await page.fill('.rq-iq [data-iq-in="rod"]', typed);
    } else {
      typed = `the side of the court of ${want.rod.root}`;
      await page.click('.rq-iq [data-iq-form="wall"]');
      await page.fill('.rq-iq [data-iq-in="area"]', want.rod.root);
    }
    ctx.lastIn = iq.op === 'build' ? iq.in : ctx.lastIn;
    if (shots < 2 || !right) {
      await fits(ctx, `${ctx.name}-r${iq.ri + 1}-${iq.si + 1}-${iq.op}-ask`);
      shots += 1;
    }
    await page.click('.rq-iq [data-iq-run]');
    await waitStage(page, ['seen']);
    const out = await page.evaluate(() => ({ stage: window.__inquiry.stage, ri: window.__inquiry.ri }));
    const f = await fact(page);
    const strip = await page.evaluate(() =>
      [...document.querySelectorAll('.rq-iq [data-rt-plaque], .rq-iq [data-rt-rod]')].map(
        (e) => e.dataset.rtPlaque ?? e.dataset.rtRod,
      ),
    );
    const shown = want.court ?? (want.rod.q != null ? want.rod.q : `wall:${want.rod.root}`);
    w.check(
      out.stage === 'seen' &&
        strip.some((x) => x === shown || (want.court && /^[\d,/-]+$/.test(x) && eq(x, want.court))),
      `${ctx.name}, journey ${iq.ri + 1}, « ${iq.op} » of ${JSON.stringify(iq.in)}: out comes ${shown} — computed here (the scene draws ${strip.join(', ')})`,
    );
    w.check(
      (right ? !f.startsWith(MISS) : f.startsWith(MISS)) && !WRONG.test(f),
      `${ctx.name}, journey ${iq.ri + 1}: he typed ${typed}; the station answers with what came out, never « wrong » (« ${f.slice(0, 90)} »)`,
    );
    if (!right) await fits(ctx, `${ctx.name}-r${iq.ri + 1}-slip`);
    const last = await page.evaluate(() => (document.querySelector('.rq-iq [data-iq-next]')?.textContent ?? '').trim());
    const ending = await page.evaluate(() => {
      const s = window.__inquiry;
      return s.stage === 'seen' && document.querySelectorAll('.rq-iq [data-iq-strips] > li').length >= 1 && s.ri >= 0;
    });
    // the last station of the last journey ends on « J’ai fini » (the lesson's `text.done`): left for playExperiment
    if (ending && last === (ctx.doneWord ?? 'J’ai fini')) break;
    await page.click('.rq-iq [data-iq-next]');
    await page.waitForTimeout(250);
  }
  await tellsNothing(w, page, `${ctx.name}, the end`, ctx.forbid(), '.rq-iq');
  await fits(ctx, `${ctx.name}-strips`);
}

/** A fraction is never written « p/q » as text on the screen of `chase` (it is drawn over a real bar). */
const SLASH = /\d\s*\/\s*\d/;

/**
 * `chase` — the court of `spec.a` and a list of fractions p/q, better and better. For each one he PREDICTS what its
 * platform will do (band / jam / ride) before it comes down; the walk computes the fact HERE from what the screen shows
 * (the area, p and q of the rod drawn over its bar): p × p small tiles against a × q × q. On the LAST fraction he says
 * « it rides » — the belief this key fights (« a fine enough fraction will close the gap ») — and meets the fact. Then
 * the closing question: in how many did it ride? — tapped from the walk's own count. Ends before « J’ai fini ».
 */
export async function chaseExperiment(ctx) {
  const { w, page } = ctx;
  const area = await page.getAttribute('.rq-iq', 'data-iq-area');
  w.expect(area != null, `${ctx.name}: the court of the experiment is on screen (${area} tiles)`);
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.rq-iq');
  await fits(ctx, `${ctx.name}-open`);
  const n = await page.locator('.rq-iq .rq-ch__dot').count();
  const kinds = [];
  for (let k = 0; k < 8; k += 1) {
    const st = await stage(page);
    if (st === 'count') break;
    w.expect(st === 'say', `${ctx.name}, fraction ${k + 1}: he is asked BEFORE the platform comes down (stage ${st})`);
    const p = await page.getAttribute('.rq-iq', 'data-iq-p');
    const d = await page.getAttribute('.rq-iq', 'data-iq-q');
    // the rod is drawn over its bar: p above, q below — and nothing of the facts is shown before his prediction
    const shown = await page.evaluate(() => {
      const f = document.querySelector('.rq-iq .rq-fr--big');
      return {
        n: f?.children[0]?.textContent.trim(),
        d: f?.children[1]?.textContent.trim(),
        bar: f ? getComputedStyle(f.children[0]).borderBottomWidth : '0px',
        before: document.querySelector('.rq-iq [data-iq-platform]')?.dataset.iqPlatform ?? null,
      };
    });
    w.check(
      shown.n === p && shown.d === d && parseFloat(shown.bar) >= 1 && shown.before === '',
      `${ctx.name}, ${p}/${d}: the rod is drawn over a real bar (${shown.n} over ${shown.d}, bar ${shown.bar}) and no number of the fact is shown before he predicts`,
    );
    const platformN = write(mul(p, p));
    const courtN = write(mul(mul(area, d), d));
    const c = cmp(platformN, courtN);
    const kind = c === 0 ? 'ride' : c < 0 ? 'band' : 'jam';
    const gap = write(absq(sub(courtN, platformN)));
    const last = k + 1 >= n;
    const said = last ? 'ride' : kind;
    if (k === 0) await fits(ctx, `${ctx.name}-ask`);
    await page.click(`.rq-iq [data-iq-say="${said}"]`);
    await waitStage(page, ['seen']);
    const got = await page.evaluate((i) => {
      const r = document.querySelector(`.rq-iq [data-iq-row="${i}"]`);
      const box = document.querySelector('.rq-iq');
      return {
        platform: document.querySelector('.rq-iq [data-iq-platform]')?.dataset.iqPlatform,
        court: document.querySelector('.rq-iq [data-iq-courtline]')?.dataset.iqCourtline,
        relation: document.querySelector('.rq-iq [data-iq-relation]')?.dataset.iqRelation,
        row: r ? { kind: r.dataset.iqRowKind, text: r.textContent.replace(/\s/g, '') } : null,
        lens: document.querySelector('.rq-iq [data-iq-lens]')?.dataset.iqLens ?? null,
        text: box.textContent,
      };
    }, k);
    const f = await fact(page);
    w.check(
      got.platform === platformN &&
        got.court === courtN &&
        got.relation === kind &&
        got.row?.kind === kind &&
        got.row.text.includes(platformN) &&
        got.row.text.includes(courtN) &&
        (kind === 'ride' || got.row.text.endsWith(gap)),
      `${ctx.name}, ${p}/${d} on ${area}: ${p} × ${p} = ${platformN} against ${area} × ${d} × ${d} = ${courtN} small tiles — ${kind}${kind === 'ride' ? '' : `, ${gap} apart`} — the card and the row say what the walk computed (« ${got.row?.text.slice(0, 40)} »${got.lens ? `, lens ×10^${got.lens}` : ''})`,
    );
    w.check(
      (said === kind ? !f.startsWith(MISS) : f.startsWith(MISS)) && !WRONG.test(f),
      `${ctx.name}, ${p}/${d}: his prediction (${said}) is answered by the fact, never « wrong » (« ${f.slice(0, 90)} »)`,
    );
    w.check(!SLASH.test(got.text), `${ctx.name}, ${p}/${d}: no fraction is written « p/q » as text on the screen`);
    kinds.push(kind);
    await tellsNothing(w, page, `${ctx.name}, after ${p}/${d}`, ctx.forbid(), '.rq-iq');
    await fits(ctx, `${ctx.name}-${p}-${d}`);
    await page.click('.rq-iq [data-iq-next]');
    await page.waitForTimeout(200);
  }
  // the closing question: a fact to observe — the walk counts the rides it computed itself
  w.expect((await stage(page)) === 'count', `${ctx.name}: after the last fraction, ONE closing question`);
  w.check(kinds.length === n, `${ctx.name}: every fraction of the list was tried (${kinds.length} of ${n})`);
  const rides = kinds.filter((x) => x === 'ride').length;
  const tap = rides === 0 ? '0' : rides === kinds.length ? 'all' : rides === 1 ? '1' : null;
  w.expect(tap != null, `${ctx.name}: the rides (${rides} of ${kinds.length}) are one of none / one / all`);
  await fits(ctx, `${ctx.name}-count`);
  await page.click(`.rq-iq [data-iq-count="${tap}"]`);
  await waitStage(page, ['counted']);
  const f = await fact(page);
  w.check(
    f.length > 3 && !f.startsWith(MISS) && !WRONG.test(f),
    `${ctx.name}: he taps « ${tap} » — the world answers with its count (« ${f.slice(0, 90)} »)`,
  );
  await tellsNothing(w, page, `${ctx.name}, the end`, ctx.forbid(), '.rq-iq');
  await fits(ctx, `${ctx.name}-counted`);
}
