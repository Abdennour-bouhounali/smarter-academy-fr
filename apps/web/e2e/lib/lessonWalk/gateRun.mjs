// THE KIT'S RAIL in a lesson walk (`kit/GateRun.js`, `kit/GateRunHud.jsx`, hooks `data-gr-*`): a run of gates — a
// course of « Le palais des dalles », a leg of the pyramids world's felucca, a practice level of either — played gate by gate,
// each gate's right lane computed by the descriptor's own arithmetic from what the rail SHOWS. Shared by every world
// that runs on the rail (moved out of worlds/rootCourts.mjs on 2026-11-24, when the pyramids world came).
//
// Obstacles (`hazards`, the river's crocodiles): the dev handle `window.__gateRun` says the lane of the obstacle ahead
// (never the right gate); the walk leaves that lane before it is met and comes back to the gate's lane after it —
// deterministically, so a heart is lost only on the gate taken wrong on purpose.
import { WRONG_WORD } from './checks.mjs';

/** A sentence that calls an answer wrong (./checks.mjs › WRONG_WORD). */
const WRONG_WORDS = WRONG_WORD;

/**
 * Plays the run open on the kit's rail: each gate's right lane is computed by `judge(ask, tex, gateText)` from what the
 * rail SHOWS (the order, its formula's source, the three numbers); gate `miss` (1-based) is taken wrong on purpose: its
 * fact is read, a heart is lost. Returns { score, hearts, won, total, misses, bumps }.
 */
export async function playRail(w, page, ff, judge, { miss = 2, label, OUT, shots = {} }) {
  const { expect, check } = w;
  const run = () =>
    page.evaluate(() => {
      const r = window.__world.getState().run;
      const g = window.__gateRun;
      return r
        ? {
            stage: r.stage,
            n: r.n,
            lane: r.lane,
            hearts: r.hearts,
            score: r.score,
            won: r.won,
            total: r.total,
            why: r.why,
            bumps: r.bumps ?? 0,
            hazard: g?.hazard ? g.hazard.lane : null,
          }
        : null;
    });
  const seen = {};
  let missed = 0;
  let last = 0;
  let want = null;
  let hazards = false;
  /** ← → until he stands in `lane` (the rail moves one lane a key). */
  const goTo = async (from, lane) => {
    for (let d = from; d !== lane; d += Math.sign(lane - d)) {
      await page.keyboard.press(lane > d ? 'ArrowRight' : 'ArrowLeft');
      await ff(0.05);
    }
  };
  for (let k = 0; k < 4000; k += 1) {
    const r = await run();
    if (!r || r.stage === 'over') break;
    if (r.hazard != null) hazards = true;
    if (r.stage === 'go' && r.n !== last) {
      last = r.n;
      await page.waitForTimeout(60);
      const g = await page.evaluate(() => ({
        // the order in words (its formula read apart, from its source)
        ask: (() => {
          const el = document.querySelector('[data-gr-ask] strong')?.cloneNode(true);
          el?.querySelectorAll('.gr-tex, .katex').forEach((x) => x.remove());
          return el?.textContent.trim() ?? '';
        })(),
        tex: document.querySelector('[data-gr-ask] annotation')?.textContent ?? null,
        gates: [...document.querySelectorAll('[data-gr-gate]')].map(
          (b) => b.querySelector('annotation')?.textContent ?? b.textContent.trim(),
        ),
      }));
      const right = g.gates.map((x) => judge(g.ask, g.tex, x));
      expect(
        right.filter(Boolean).length === 1,
        `${label}, gate ${r.n}: « ${g.ask.replace(/\s+/g, ' ').slice(0, 50)} » ${g.tex ?? ''} — exactly ONE of ${g.gates.join(' / ')} is right, computed here`,
      );
      want = right.indexOf(true);
      if (r.n === miss) {
        want = (want + 1) % 3;
        missed += 1;
      }
      seen[r.n] = { want, right: right.indexOf(true) };
      if (shots[r.n]) seen[r.n].shot = shots[r.n];
    }
    if (r.stage === 'go' && want != null) {
      // the obstacle ahead in the gate's lane: wait in a neighbouring lane until it has passed
      const lane = r.hazard != null && r.hazard === want ? (want === 1 ? 0 : 1) : want;
      if (r.lane !== lane) {
        await goTo(r.lane, lane);
        const now = await run();
        if (now && lane === want && now.n === r.n)
          check(now.lane === want, `${label}, gate ${r.n}: ← → bring him to lane ${want} (${now.lane})`);
      }
      if (seen[r.n]?.shot && r.hazard == null) {
        await w.shot(page, seen[r.n].shot, OUT);
        delete seen[r.n].shot;
      }
    }
    if (r.stage === 'hit' && !seen[`hit${r.n}`]) {
      seen[`hit${r.n}`] = true;
      await page.waitForTimeout(150);
      const why = ((await page.textContent('[data-gr-why]').catch(() => '')) ?? '').trim();
      check(
        r.n === miss && why.length > 4 && !WRONG_WORDS.test(why),
        `${label}, gate ${r.n} (taken wrong on purpose): the run stops on its FACT, never « wrong » (« ${why.slice(0, 90)} »); ${r.hearts} hearts left`,
      );
      if (shots.fact) await w.shot(page, shots.fact, OUT);
    }
    await ff(hazards ? 0.1 : 0.2);
  }
  const end = await run();
  if (hazards)
    check(
      (end?.bumps ?? 0) === 0,
      `${label}: every obstacle in the gate's lane was dodged — none touched (${end?.bumps ?? 0})`,
    );
  return { ...(end ?? {}), misses: missed };
}

/**
 * « Continuer l’entraînement » on the practice hub: the level it proposes is run on the kit's rail (`Game.startPractice`): every gate
 * judged by `descriptor.run`, the second taken wrong on purpose (its fact, a heart), then the kit's result card — its
 * stars are the hearts left — and back to the hub, then to the title screen.
 */
export async function railPractice({ w, page, D, TEXT }) {
  const { expect, check, shot, ff } = w;
  const st = () =>
    page.evaluate(() => ({
      phase: window.__world.getState().phase,
      overlay: window.__world.getState().overlay,
      run: window.__world.getState().run,
    }));
  const nextName = ((await page.textContent('[data-di-next]')) ?? '').trim();
  expect(
    Object.values(TEXT.levels)
      .flat()
      .some((x) => nextName.includes(x)),
    `« Continuer l’entraînement » proposes one of the lesson's levels (« ${nextName} »)`,
  );
  await page.click('[data-di-next]');
  await ff(page, 0.4);
  let x = await st();
  expect(
    x.phase === 'run' && x.run?.stage === 'go' && x.run.hearts === 3,
    `the level runs on the rail: 3 hearts (${x.phase}, ${x.run?.stage}, ${x.run?.total} gates)`,
  );
  const total = x.run.total;
  const res = await playRail(w, page, (sec) => ff(page, sec), D.run, {
    miss: 2,
    label: 'practice',
    OUT: { exit: ['[data-gr-leave]'], numbers: false },
    shots: { 1: 'practice-gate', fact: 'practice-fact' },
  });
  expect(
    await page
      .waitForSelector('[data-di-result]', { timeout: 15000 })
      .then(() => true)
      .catch(() => false),
    'the level is over: the result card of the kit',
  );
  x = await st();
  const o = x.overlay;
  check(
    o?.type === 'result' && o.win && o.stars === 2 && o.mistakes === 1 && res.misses === 1,
    `the result: won, ${o?.stars} stars = the hearts left after ONE gate missed on purpose (${total} gates; ${JSON.stringify({ win: o?.win, stars: o?.stars, mistakes: o?.mistakes })})`,
  );
  await shot(page, 'practice-result', { exit: ['[data-di-result-map]', '[data-di-exit]'], numbers: false });
  await page.click('[data-di-result-map]');
  await page.waitForSelector('[data-di-mapcard]');
  check((await st()).overlay?.type === 'map', '« La carte » on the result card comes back to the hub');
  await page.click('[data-di-map-close]');
  await page.waitForSelector('[data-di-start]');
  expect((await st()).phase === 'title', 'the hub closed: back on the title screen');
}
