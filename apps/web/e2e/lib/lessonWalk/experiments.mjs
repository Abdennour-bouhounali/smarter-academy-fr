// The EXPERIMENT KINDS a walk can play — a workshop's bench or a forge's own experiment (GAME_WORLD.md « Explore »), keyed
// `kind` or `kind:mode` as the lesson's spec names them (`world/inquiries.js`). Each plays its screen through its UI with
// answers computed HERE from the spec's numbers, checks what lessons 5–6 checked on it, and ends by its « next » button.
// A kind the library does not know stops the walk with the sentence to write its handler (README « An experiment kind »).
import { inquiryFits, ownTools, tellsNothing } from './checks.mjs';

/**
 * His prediction SAID BACK by the fact of an experiment when it was right — a sentence of the LESSON's inquiry (its
 * `world/inquiries.js`), so matched by its meaning: « comme tu l’as écrit », « comme tu l’as dit », « comme tu l’avais
 * prédit » (the worlds' own form, rootCourts/strings.js › guessRight). A lesson that words it otherwise passes its own
 * `saidBack` regexp in the experiment's descriptor. (A `data-iq-hit` on the fact would be a better handle: not in the engine.)
 */
const SAID_BACK = /comme tu l[’']a(?:s|vais) (?:écrit|dit|prédit|annoncé)/i;
import { calcExperiment, chaseExperiment, roundtripExperiment } from './worlds/rootCourtsExperiments.mjs';

// ───────────────────────────── the walk's own arithmetic (never the lesson's answers) ─────────────────────────────
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export const divisors = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};
export const common = (a, b) => divisors(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
/** Euclid's divisions of (a ; b), down to the remainder 0. */
export function divisions(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    out.push({ a: x, b: y, q: Math.floor(x / y), r: x % y });
    [x, y] = [y, x % y];
  }
  return out;
}
/** The subtractions of (a ; b): bigger minus smaller, down to 0. */
export function subtractions(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    const d = x - y;
    out.push({ x, y, d });
    [x, y] = [Math.max(y, d), Math.min(y, d)];
  }
  return out;
}

const stageOf = (page) => page.getAttribute('.iq [data-iq-stage], .iq[data-iq-stage]', 'data-iq-stage');
const waitStage = (page, want, ms = 30000) =>
  page.waitForFunction((s) => document.querySelector('.iq')?.dataset.iqStage === s, want, { timeout: ms });
const iq = (page) => page.evaluate(() => window.__inquiry);
const fact = async (page) => (await page.textContent('[data-iq-fact]').catch(() => '')) ?? '';

/**
 * ctx = { w, page, name, where: 'bench' | 'forge', forbid: () => RegExp | null, reopen: async () => {} (a bench: back to
 * its workshop and in again) }.
 */

// ── `ladder`, `subtract` / `divide`: a notebook of one algorithm — rows typed, left half-way, reopened, counted, ended.
// Every round of the spec is played, one after the other (lesson 7's ✅ mirror: two notebooks); a round that is not the
// last ends on its « next » (the notebook of the next pair), the last one is left for `playExperiment`.
async function oneMode(ctx, spec) {
  for (const ri of spec.rounds.keys()) {
    if (ri > 0) {
      await ctx.page.click(ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]');
      await ctx.page.waitForFunction(
        (want) => window.__inquiry?.ri === want && ['guess', 'count'].includes(window.__inquiry?.stage),
        ri,
        { timeout: 15000 },
      );
      await ctx.page.waitForTimeout(200);
    }
    await oneRound(ctx, spec, ri);
  }
}

async function oneRound(ctx, spec, ri) {
  const { w, page } = ctx;
  const name = ri ? `${ctx.name}-r${ri + 1}` : ctx.name;
  const { a, b } = spec.rounds[ri];
  const mode = spec.rounds[ri].mode ?? spec.mode;
  const plain = spec.rounds[ri].plain ?? spec.plain;
  const exit = ctx.where === 'forge' ? ['.rf-root [data-di-exit]'] : undefined;
  const rows =
    mode === 'divide'
      ? divisions(a, b).map((s) => ({ next: s.r ? [s.b, s.r] : null }))
      : subtractions(a, b).map((s) => ({ next: s.d ? [Math.max(s.y, s.d), Math.min(s.y, s.d)] : null }));
  if (plain) {
    const plainSeen = await page.evaluate(() => ({
      plain: document.querySelector('.iq').hasAttribute('data-iq-plain'),
      ticks: document.querySelectorAll('.iq [data-iq-ticks]').length,
      head: document.querySelector('.iq .iq-rung--head small')?.textContent ?? null,
    }));
    w.check(
      plainSeen.plain && plainSeen.ticks === 0 && plainSeen.head == null,
      `${name}: the notebook is PLAIN — no column of common planks (${JSON.stringify(plainSeen)})`,
    );
  }
  await tellsNothing(w, page, `${name}, start`, ctx.forbid());
  await inquiryFits(w, page, `${name}-start`, exit);
  const write = async (i) => {
    const [x, y] = rows[i].next;
    await page.fill('[data-iq-in="x"]', String(x));
    await page.fill('[data-iq-in="y"]', String(y));
    await page.click('[data-iq-write]');
    await page.waitForFunction(
      () => ['guess', 'count'].includes(document.querySelector('.iq')?.dataset.iqStage),
      null,
      { timeout: 8000 },
    );
    await page.waitForTimeout(120);
  };
  if ((await stageOf(page)) === 'guess') {
    await write(0);
    const f = await fact(page);
    w.check(
      (spec.saidBack ?? SAID_BACK).test(f),
      `${name}: row 1 written right, the fact says « comme tu l’as écrit » (« ${f.trim().slice(0, 80)} »)`,
    );
    await inquiryFits(w, page, `${name}-row1`, exit);
  }
  if (ctx.reopen && ri === 0) {
    const before = (await iq(page)).written;
    await ctx.reopen();
    const now = await iq(page);
    w.check(
      now.written === before && now.written >= 1,
      `${name}: left half-way and reopened, his ${before} row(s) are still there (${now.written})`,
    );
  }
  if ((await stageOf(page)) !== 'count' && rows[1]?.next) await write(1);
  w.expect((await stageOf(page)) === 'count', `${name}: rows predicted, the notebook asks how many rows in all`);
  await tellsNothing(w, page, `${name}, the count`, ctx.forbid());
  await inquiryFits(w, page, `${name}-count`, exit);
  await page.fill('[data-iq-in="count"]', String(rows.length));
  await page.click('[data-iq-count]');
  await waitStage(page, 'seen', 60000);
  await page.waitForTimeout(300);
  const end = await page.evaluate(() => {
    const l = document.querySelector('.iq-ladder');
    const lr = l.getBoundingClientRect();
    const first = l.querySelector('[data-iq-row]');
    const kids = first ? [...first.children].map((k) => k.getBoundingClientRect()) : [];
    return {
      gold: l.innerHTML.includes('fbbf24'),
      isEnd: l.querySelectorAll('.is-end').length,
      rows: l.querySelectorAll('[data-iq-row]').length,
      left: kids.length ? Math.round(Math.min(...kids.map((k) => k.left)) - lr.left) : 0,
      right: kids.length ? Math.round(lr.right - Math.max(...kids.map((k) => k.right))) : 0,
    };
  });
  w.check(end.rows === rows.length, `${name}: the notebook wrote ${rows.length} rows — computed here (${end.rows})`);
  if (plain) {
    w.check(!end.gold && end.isEnd === 0, `${name}: the end lights NO value gold`);
    w.check(
      end.right <= end.left + 24,
      `${name}: the rows fill the notebook — no empty column (${end.left} px left, ${end.right} px right)`,
    );
  }
  await tellsNothing(w, page, `${name}, the end`, ctx.forbid());
  await inquiryFits(w, page, `${name}-end`, exit);
}

// ── `ladder`, `both`: the two notebooks of one pair, side by side: which writes fewer rows, by how many, run ──
async function bothMode(ctx, spec) {
  const { w, page, name } = ctx;
  const { a, b } = spec.rounds[0];
  const S = subtractions(a, b).length;
  const D = divisions(a, b).length;
  await tellsNothing(w, page, `${name}, start`, ctx.forbid());
  await inquiryFits(w, page, `${name}-start`);
  const shorter = D < S ? 'divide' : S < D ? 'subtract' : 'same';
  await page.click(`[data-iq-shorter="${shorter}"]`);
  if (shorter !== 'same') await page.fill('[data-iq-in="by"]', String(Math.abs(S - D)));
  await inquiryFits(w, page, `${name}-said`);
  const t0 = Date.now();
  await page.click('[data-iq-run]');
  await waitStage(page, 'seen', 90000);
  console.log(`NOTE  the two notebooks of ${a} and ${b} ran in ${((Date.now() - t0) / 1000).toFixed(1)} s (real time)`);
  await page.waitForTimeout(300);
  const steps = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[data-iq-col]')].map((c) => [c.dataset.iqCol, Number(c.dataset.iqSteps)]),
    ),
  );
  w.check(
    steps.subtract === S && steps.divide === D,
    `${name}: ${S} subtractions against ${D} divisions — computed here (${JSON.stringify(steps)})`,
  );
  w.check((spec.saidBack ?? SAID_BACK).test(await fact(page)), `${name}: his prediction is said back « comme tu l’as dit »`);
  await tellsNothing(w, page, `${name}, the end`, ctx.forbid());
  await inquiryFits(w, page, `${name}-seen`);
}

// ── `ladder`, `fold`: the rows that take away the same number folded into ONE division (a wrong fold first) ──
async function foldMode(ctx, spec) {
  const { w, page, name } = ctx;
  const { a, b } = spec.rounds[0];
  const exit = ['.rf-root [data-di-exit]', '[data-di-exit]'];
  await inquiryFits(w, page, `${name}-writing`, exit);
  const runs = divisions(a, b);
  for (let k = 0; k < runs.length + 2; k += 1) {
    const got = await page
      .waitForFunction(() => ['fold', 'seen'].includes(document.querySelector('.iq')?.dataset.iqStage), null, {
        timeout: 30000,
      })
      .then(() => stageOf(page));
    if (got === 'seen') break;
    const run = runs[(await iq(page)).run];
    if (k === 0) {
      await tellsNothing(w, page, `${name}, the fold`, ctx.forbid());
      await inquiryFits(w, page, `${name}-ask`, exit);
      await page.fill('[data-iq-in="q"]', String(run.q - 1));
      await page.fill('[data-iq-in="r"]', String(run.r + run.b));
      await page.click('[data-iq-fold-go]');
      await page.waitForTimeout(400);
      w.check(
        (await stageOf(page)) === 'fold' && (await page.locator('[data-iq-counted]').count()) > 0,
        `${name}: a wrong fold (${run.q - 1} and ${run.r + run.b}) — the rows are counted on screen, he folds again`,
      );
      await inquiryFits(w, page, `${name}-miss`, exit);
    }
    await page.fill('[data-iq-in="q"]', String(run.q));
    await page.fill('[data-iq-in="r"]', String(run.r));
    await page.click('[data-iq-fold-go]');
    await page.waitForTimeout(400);
  }
  await waitStage(page, 'seen', 30000);
  await page.waitForTimeout(300);
  await tellsNothing(w, page, `${name}, its end`, ctx.forbid());
  await inquiryFits(w, page, `${name}-seen`, exit);
}

// ── `lists`: the planks of each gap typed one by one, the list closed by the world, then the links of both ──
async function listsBench(ctx, spec) {
  const { w, page, name } = ctx;
  const { a, b } = spec.rounds[0];
  const items = async (side) =>
    ((await page.getAttribute(`[data-iq-list="${side}"]`, 'data-iq-items')) ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number);
  const lay = async (d) => {
    await page.fill('[data-iq-in="plank"]', String(d));
    await page.click('[data-iq-lay]');
    await page.waitForTimeout(120);
    await page.waitForFunction(
      () => ['build', 'closed'].includes(document.querySelector('[data-iq-stage]')?.dataset.iqStage),
      null,
      {
        timeout: 8000,
      },
    );
    await page.waitForTimeout(80);
  };
  const tap = async (side, d) => {
    await page.click(`[data-iq-list="${side}"] [data-iq-chip="${d}"]`);
    await page.waitForTimeout(120);
    await page.waitForFunction(() => document.querySelector('[data-iq-stage]')?.dataset.iqStage !== 'linkLay', null, {
      timeout: 8000,
    });
    await page.waitForTimeout(80);
  };
  const buildRest = async (side, n) => {
    for (let k = 0; k < 40 && (await stageOf(page)) === 'build'; k += 1) {
      const have = await items(side);
      await lay(divisors(n).find((x) => !have.includes(x)));
    }
    w.expect(
      (await stageOf(page)) === 'closed' && (await items(side)).join() === divisors(n).join(),
      `${name}: the list of ${n} is every plank that fills it: ${divisors(n).join(', ')} — the world closes it`,
    );
  };
  const q = await iq(page);
  w.expect(
    q.kind === 'lists' && q.a === a && q.b === b && q.side === 'a',
    `${name}: the bench opens on ${a} and ${b}, the list of ${a} first`,
  );
  await tellsNothing(w, page, `${name}, start`, ctx.forbid());
  await inquiryFits(w, page, `${name}-start`);
  await lay(a + 1);
  w.check(
    (await stageOf(page)) === 'build' && (await items('a')).length === 0 && (await fact(page)).includes(String(a)),
    `${name}: ${a + 1} is longer than ${a}: refused as a fact, nothing in the list`,
  );
  const d0 = divisors(a).find((d) => d > 1 && d * d < a) ?? divisors(a)[0];
  await lay(d0);
  w.check(
    (await items('a')).join() === [...new Set([d0, a / d0])].sort((x, y) => x - y).join(),
    `${name}: ${d0} fills ${a}: it comes with its partner ${a / d0}`,
  );
  await inquiryFits(w, page, `${name}-pair`);
  await page.click('[data-iq-complete]');
  await page.waitForTimeout(300);
  w.check(
    (await stageOf(page)) === 'build',
    `${name}: « the list is complete » too early: the world shows a plank missing, the list stays open`,
  );
  await inquiryFits(w, page, `${name}-missing`);
  const miss = [2, 3, 5, 7, 9, 11].find((x) => a % x !== 0 && x < a);
  if (miss) {
    const before = (await items('a')).join();
    await lay(miss);
    w.check(
      (await items('a')).join() === before,
      `${name}: ${miss} does not fill ${a}: its division written, nothing added`,
    );
  }
  if (ctx.reopen) {
    const half = await items('a');
    await ctx.reopen();
    w.check(
      (await items('a')).join() === half.join(),
      `${name}: left half-way and reopened, his half-built list is still there (${half.join(', ')})`,
    );
  }
  await buildRest('a', a);
  await inquiryFits(w, page, `${name}-closed-a`);
  await page.click('[data-iq-go]');
  await page.waitForTimeout(200);
  w.expect((await iq(page)).side === 'b' && (await stageOf(page)) === 'build', `${name}: on to the list of ${b}`);
  await buildRest('b', b);
  await inquiryFits(w, page, `${name}-closed-b`);
  await page.click('[data-iq-go]');
  await page.waitForTimeout(200);
  w.expect((await stageOf(page)) === 'link', `${name}: both lists built: he links the planks found in both`);
  const stray = (await items('a')).find((d) => b % d !== 0);
  if (stray) {
    await tap('a', stray);
    w.check(
      (await iq(page)).links.length === 0 && (await fact(page)).includes(String(b % stray)),
      `${name}: ${stray} tapped: ${b} = ${stray} × ${Math.floor(b / stray)} + ${b % stray} — no link`,
    );
    await inquiryFits(w, page, `${name}-unlinked`);
  }
  await page.click('[data-iq-all-linked]');
  await page.waitForTimeout(300);
  w.check(
    (await stageOf(page)) === 'link',
    `${name}: « all linked » with links missing: one is shown, the stage stays`,
  );
  for (const d of common(a, b)) await tap('a', d);
  w.check(
    (await iq(page)).links.join() === common(a, b).join(),
    `${name}: the links are the planks of both: ${common(a, b).join(', ')} — computed here`,
  );
  await page.click('[data-iq-all-linked]');
  await page.waitForTimeout(300);
  w.expect((await stageOf(page)) === 'seen', `${name}: all linked, the bench ends`);
  if (spec.crown === false)
    w.check(
      (await iq(page)).crown == null && (await page.locator('[data-iq-crown]').count()) === 0,
      `${name}: NO plank crowned, never asked the longest`,
    );
  await tellsNothing(w, page, `${name}, the end`, ctx.forbid());
  await inquiryFits(w, page, `${name}-seen`);
}

// ───────────────────────────── the first French lesson's three kinds (decomposer-en-facteurs-premiers) ─────────────────────────────
export const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};
/** The prime factors of n, increasing (the walk's own trial division). */
export const primeFactorsOf = (n) => {
  const out = [];
  let x = n;
  for (let p = 2; p * p <= x; p += 1)
    while (x % p === 0) {
      out.push(p);
      x /= p;
    }
  if (x > 1) out.push(x);
  return out;
};
const waitIq = (page, test, arg, ms = 15000) => page.waitForFunction(test, arg, { timeout: ms });

// ── `ladder`, `factor`: a gap and a rack of planks; a plank that fills it makes the gap the number of planks laid, a plank
// that does not falls; down to 1 case. Played: the planks of the walk's own prime factors in increasing order, and before
// the third one a plank of the rack that does not fill what is left (a composite one if there is: « 4 » after the 2s).
async function factorMode(ctx, spec) {
  const { w, page, name } = ctx;
  const exit = ctx.where === 'forge' ? ['.rf-root [data-di-exit]'] : undefined;
  const rack = spec.rack;
  for (const [ri, round] of spec.rounds.entries()) {
    const n = round.n;
    if (ri > 0) {
      await page.click(ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]');
      await waitIq(page, (r) => window.__inquiry?.ri === r && window.__inquiry?.stage === 'pick', ri);
    }
    const q = await iq(page);
    w.expect(q.kind === 'ladder' && q.mode === 'factor' && q.n === n && q.gap === n, `${name}: round ${ri + 1} opens on the gap of ${n}`);
    await tellsNothing(w, page, `${name} ${n}, start`, ctx.forbid());
    if (ri === 0) await inquiryFits(w, page, `${name}-${n}-start`, exit);
    const primes = primeFactorsOf(n);
    w.check(
      primes.every((p) => rack.includes(p)),
      `${name}: every prime factor of ${n} (${primes.join(', ')}) lies on the rack ${rack.join(', ')} — computed here`,
    );
    let gap = n;
    let fell = null;
    for (const [k, p] of primes.entries()) {
      if (k === Math.min(2, primes.length - 1) && fell == null) {
        const misses = rack.filter((d) => gap % d !== 0);
        fell = misses.find((d) => !isPrime(d)) ?? misses[0] ?? null;
        if (fell != null) {
          await page.click(`[data-iq-plank="${fell}"]`);
          await waitIq(page, () => window.__inquiry?.stage === 'pick');
          const after = await iq(page);
          const f = await fact(page);
          w.check(
            after.gap === gap && (await page.locator(`[data-iq-plank="${fell}"][data-iq-fell]`).count()) === 1 && f.includes(String(gap % fell)),
            `${name}: ${gap} = ${fell} × ${Math.floor(gap / fell)} + ${gap % fell} — the plank of ${fell} falls, the gap stays ${gap} (« ${f.trim().slice(0, 90)} »)`,
          );
          await tellsNothing(w, page, `${name} ${n}, a fall`, ctx.forbid());
          await inquiryFits(w, page, `${name}-${n}-falls-${fell}`, exit);
        }
      }
      await page.click(`[data-iq-plank="${p}"]`);
      await waitIq(page, () => ['pick', 'seen'].includes(window.__inquiry?.stage));
      gap /= p;
      const now = await iq(page);
      w.check(now.stage === 'seen' ? gap === 1 : now.gap === gap, `${name}: ${gap * p} ÷ ${p} = ${gap} — the gap is ${gap} (the world: ${now.gap})`);
    }
    w.expect((await stageOf(page)) === 'seen', `${name}: the gap of ${n} is down to 1 case`);
    const laid = ((await page.getAttribute('[data-iq-laid]', 'data-iq-laid')) ?? '').split(',').map(Number);
    w.check(laid.join() === primes.join(), `${name}: the planks that held on ${n} are ${primes.join(', ')} — computed here (${laid.join(', ')})`);
    await tellsNothing(w, page, `${name} ${n}, the end`, ctx.forbid());
    await inquiryFits(w, page, `${name}-${n}-end`, exit);
  }
}

// ── `pairs`: the planks of ONE gap tried in order, a plank and its partner walking toward each other. Gap 1: every plank to
// two past the crossing, « maybe » (the world sweeps to the gap), then a pick too early, a pick too late, the right one.
// Gap 2: the guess before trying (the walk's own last plank), the trials, the pick. Gap 3: the table ahead (planks and
// squares, partners « ? »), the guess, the trials, the pick. The last plank is computed here: ⌊√a⌋.
async function pairsMode(ctx, spec) {
  const { w, page, name } = ctx;
  const exit = ctx.where === 'forge' ? ['.rf-root [data-di-exit]'] : undefined;
  const last = (a) => {
    let d = 1;
    while ((d + 1) * (d + 1) <= a) d += 1;
    return d;
  };
  const stage = () => page.evaluate(() => window.__inquiry?.stage);
  for (const [gi, a] of spec.gaps.entries()) {
    const m = last(a);
    const end = m + 2;
    if (gi > 0) {
      await page.click(ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]');
      await waitIq(page, (g) => window.__inquiry?.gi === g, gi);
    }
    const q = await iq(page);
    w.expect(q.kind === 'pairs' && q.a === a, `${name}: gap ${gi + 1} is ${a}`);
    await tellsNothing(w, page, `${name} ${a}, start`, ctx.forbid());
    if (gi > 0) {
      w.expect((await stage()) === 'guess', `${name}: on ${a} he says the last plank BEFORE trying`);
      if (gi >= 2)
        w.check(
          (await page.locator('[data-iq-tried]').count()) === end,
          `${name}: on ${a} the table is there before any trial — ${end} planks with their squares (${await page.locator('[data-iq-tried]').count()})`,
        );
      await inquiryFits(w, page, `${name}-${a}-guess`, exit);
      await page.click(`[data-iq-pick="${m}"]`);
      await waitIq(page, () => window.__inquiry?.stage === 'try');
    } else await inquiryFits(w, page, `${name}-${a}-start`, exit);
    for (let d = 1; d <= end; d += 1) {
      await page.click(`[data-iq-try="${d}"]`);
      await page.waitForTimeout(40);
      if (d === m + 1) {
        const crossed = await page.getAttribute('[data-iq-crossed]', 'data-iq-crossed');
        w.check(crossed === '1', `${name}: ${d} × ${d} = ${d * d} > ${a} — the strip shows the partner BEHIND the plank of ${d}`);
        if (gi === 0) await inquiryFits(w, page, `${name}-${a}-crossed`, exit);
      }
    }
    if (gi === 0) {
      w.expect((await stage()) === 'ask', `${name}: two planks past the crossing, the question is his`);
      await inquiryFits(w, page, `${name}-${a}-ask`, exit);
      await page.click('[data-iq-ask="yes"]');
      await page.waitForSelector('[data-iq-swept]', { timeout: 20000 });
      await inquiryFits(w, page, `${name}-${a}-swept`, exit);
      await page.click('[data-iq-swept]');
      const early = m - 2;
      await page.click(`[data-iq-pick="${early}"]`);
      await page.waitForTimeout(80);
      const fe = await fact(page);
      w.check((await stage()) === 'pick' && fe.includes(String(early)), `${name}: ${early} is too early — said as a fact (« ${fe.trim().slice(0, 90)} »)`);
      await page.click(`[data-iq-pick="${m + 1}"]`);
      await page.waitForTimeout(80);
      const fl = await fact(page);
      w.check((await stage()) === 'pick' && fl.includes(String(m + 1)), `${name}: ${m + 1} is past the last — said as a fact (« ${fl.trim().slice(0, 90)} »)`);
      await inquiryFits(w, page, `${name}-${a}-pick`, exit);
    } else {
      w.expect((await stage()) === 'pick', `${name}: the trials of ${a} done, he picks the last plank`);
      if (gi >= 2) await inquiryFits(w, page, `${name}-${a}-table`, exit);
    }
    await page.click(`[data-iq-pick="${m}"]`);
    await waitIq(page, () => window.__inquiry?.stage === 'found');
    w.check(true, `${name}: the last plank to try for ${a} is ${m} — computed here (${m} × ${m} = ${m * m} ⩽ ${a} < ${(m + 1) ** 2})`);
    await tellsNothing(w, page, `${name} ${a}, found`, ctx.forbid());
    await inquiryFits(w, page, `${name}-${a}-found`, exit);
  }
}

// ── `sheet`: a spreadsheet, column A the primes p with p × p ⩽ the number, column B its remainders, filled by the world;
// he clicks the line he reads (the number becomes the quotient) or says « prime ». Round 1: a line whose remainder is
// not 0 first, « prime » said too early, then the first line of remainder 0 each time, « prime » when no line shows 0.
async function sheetMode(ctx, spec) {
  const { w, page, name } = ctx;
  const exit = ctx.where === 'forge' ? ['.rf-root [data-di-exit]'] : undefined;
  const linesOf = (x) => {
    const out = [];
    for (let p = 2; p * p <= x; p += 1) if (isPrime(p)) out.push(p);
    return out;
  };
  const filled = () => waitIq(page, () => window.__inquiry?.stage === 'pick' || window.__inquiry?.stage === 'seen', null, 30000);
  for (const [ri, round] of spec.rounds.entries()) {
    if (ri > 0) {
      await page.click(ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]');
      await waitIq(page, (r) => window.__inquiry?.ri === r, ri);
    }
    let x = round.n;
    const want = primeFactorsOf(round.n);
    let shots = 0;
    for (let guard = 0; guard < 12 && x > 1; guard += 1) {
      await filled();
      const q = await iq(page);
      const lines = linesOf(x);
      w.check(q.n === x && q.lines.join() === lines.join(), `${name}: the sheet of ${x} holds the primes ${lines[0] ?? '—'} … ${lines.at(-1) ?? '—'} (${lines.length} lines) — computed here`);
      const rests = await page.evaluate(() =>
        Object.fromEntries([...document.querySelectorAll('[data-iq-line]')].map((b) => [b.dataset.iqLine, b.dataset.iqRest])),
      );
      w.check(lines.every((p) => Number(rests[p]) === x % p), `${name}: column B of ${x} is every remainder — computed here`);
      if (shots === 0 || lines.length >= 16) {
        await tellsNothing(w, page, `${name} ${x}, the sheet`, ctx.forbid());
        await inquiryFits(w, page, `${name}-${x}-sheet`, exit);
        shots += 1;
      }
      const zero = lines.find((p) => x % p === 0);
      if (ri === 0 && guard === 0) {
        const miss = lines.find((p) => x % p !== 0);
        await page.click(`[data-iq-line="${miss}"]`);
        await page.waitForTimeout(80);
        const f1 = await fact(page);
        w.check((await iq(page)).n === x && f1.includes(String(x % miss)), `${name}: line ${miss} shows ${x % miss}: ${x} unchanged (« ${f1.trim().slice(0, 80)} »)`);
        await page.click('[data-iq-prime]');
        await page.waitForTimeout(80);
        const f2 = await fact(page);
        w.check((await iq(page)).n === x && f2.includes(String(zero)), `${name}: « prime » said of ${x}: the sheet answers that line ${zero} shows 0 (« ${f2.trim().slice(0, 80)} »)`);
        await inquiryFits(w, page, `${name}-${x}-not-prime`, exit);
      }
      if (zero == null) {
        await page.click('[data-iq-prime]');
        x = 1;
      } else {
        await page.click(`[data-iq-line="${zero}"]`);
        x /= zero;
      }
      await page.waitForTimeout(80);
    }
    await waitIq(page, () => window.__inquiry?.stage === 'seen');
    const got = (await iq(page)).rounds.at(-1)?.factors ?? [];
    w.check([...got].sort((p, q) => p - q).join() === want.join(), `${name}: ${round.n} = ${want.join(' × ')} — computed here (the notebook: ${got.join(', ')})`);
    await tellsNothing(w, page, `${name} ${round.n}, the end`, ctx.forbid());
    await inquiryFits(w, page, `${name}-${round.n}-end`, exit);
  }
}

export const EXPERIMENTS = {
  'ladder:factor': factorMode,
  pairs: pairsMode,
  sheet: sheetMode,
  lists: listsBench,
  'ladder:subtract': oneMode,
  'ladder:divide': oneMode,
  'ladder:both': bothMode,
  'ladder:fold': foldMode,
  // « Le palais des dalles » (worlds/rootCourtsExperiments.mjs)
  calc: calcExperiment,
  roundtrip: roundtripExperiment,
  chase: chaseExperiment,
};

/** Plays the experiment `spec` on the screen now open; ends on its « next » (a bench: back to its workshop). */
export async function playExperiment(ctx, spec) {
  const id = spec.mode ? `${spec.kind}:${spec.mode}` : spec.kind;
  const play = EXPERIMENTS[id] ?? EXPERIMENTS[spec.kind];
  ctx.w.expect(
    play,
    `the library plays the experiment « ${id} » (else: add its handler to lib/lessonWalk/experiments.mjs, README)`,
  );
  if (ctx.where === 'bench') await ownTools(ctx.w, ctx.page, `${ctx.name}, the bench`, '.di-bench');
  await play(ctx, spec);
  await ctx.page.click(ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]');
}
