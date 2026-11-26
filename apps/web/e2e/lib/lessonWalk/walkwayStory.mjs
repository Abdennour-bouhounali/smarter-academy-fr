// The road pieces of « L’archipel des diviseurs » first met in the fourth French lesson (`multiples-et-diviseurs-communs`,
// 2026-11-26), played from story.mjs › the road: the segment `walkway` (divisorIsles/walkway.js, Chantier.jsx,
// walkwayGame.js — HE places the pillar, two crews lay), a lone standing bridge (a gap of 0 between two islands, no
// pedestal), and the final mission whose answer is a DAY (`story.mission` with `lines()` and `posters`, no `write`).
// Every verdict is computed HERE (the crews' planks, the purse, who works on a day); the world's own is cross-checked.
import { WRONG_WORD } from './checks.mjs';
import { playExperiment } from './experiments.mjs';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const lcmOfAll = (xs) => xs.reduce(lcm, 1);
const bare = (t) => String(t ?? '').replace(/[\s  ]/g, '');
const writes = (t, n) => new RegExp(`(^|[^0-9])${n}([^0-9]|$)`).test(bare(t));

/** What two (or more) crews do toward a pillar at d with `left` coins — the walk's own arithmetic. */
export function layOf(crews, d, left) {
  const lanes = crews.map((b) => ({ b, planks: Math.floor(d / b), short: d % b }));
  const holds = d > 0 && lanes.every((l) => l.short === 0);
  const cost = lanes.reduce((n, l) => n + l.planks, 0);
  const verdict = d === 0 ? 'shore' : !holds ? 'short' : left == null || cost <= left ? 'paid' : 'ruins';
  return { d, lanes, holds, cost, verdict };
}

/**
 * The players, bound to the story walk's closures: env = { w, page, W, L, D, segs, islands, convoys, OUT, shotWorld,
 * lap, hook, forbid (experiments' words), islandsForbid }.
 */
export function walkwayPlayers(env) {
  const { w, page, W, L, D, segs, islands, convoys, OUT, shotWorld, lap, hook } = env;
  const { check, expect } = w;
  const S = D.story ?? {};
  const panelExit = { exit: ['.di-veil [data-di-exit]', '[data-di-walkway] [data-di-exit]'], numbers: true };

  /** The panel on screen: inside the screen, no text under its words naming a rule not forged yet. */
  const panelFits = async (label) => {
    const r = await page.evaluate(() => {
      const root = document.querySelector('[data-di-walkway]');
      if (!root) return { none: true };
      const b = root.getBoundingClientRect();
      const out = [];
      if (b.left < -1 || b.top < -1 || b.right > innerWidth + 1 || b.bottom > innerHeight + 1)
        out.push('the panel leaves the screen');
      for (const el of root.querySelectorAll('svg')) {
        const s = el.getBoundingClientRect();
        if (s.right > innerWidth + 1 || s.left < -1) out.push('the lanes leave the screen');
      }
      const post = root.querySelector('[data-di-post]')?.getBoundingClientRect();
      if (post && (post.left < -1 || post.right > innerWidth + 1)) out.push('the post leaves the screen');
      return { out, text: root.textContent };
    });
    check(
      !r.none && r.out.length === 0,
      `${label}: the chantier stands on screen${r.out?.length ? ` — ${r.out.join(' | ')}` : ''}`,
    );
    const re = env.islandsForbid();
    const m = re && r.text ? r.text.match(re) : null;
    check(!m, `${label}: the chantier names no rule before its tablet${m ? ` — « ${m[0]} »` : ''}`);
    await w.shot(page, label, panelExit);
  };

  /** He goes to an interactable `{ x, z }` on island k and presses E: the prompt shown (or not). */
  const toThing = async (k, it, open, what) => {
    const p = await page.evaluate(
      ([i, at]) => {
        const g = window.__world;
        const x = at === 'mission' ? g.missionIt : g.segs[i].postIt;
        const isl = g.isl[at === 'mission' ? i : g.segs[i].index];
        return x ? [x.x, x.z, isl.x, isl.z] : null;
      },
      [k, it],
    );
    expect(p, `${what} stands on « ${islands[k].name} »`);
    const d = Math.hypot(p[2] - p[0], p[3] - p[1]) || 1;
    await W.tp(p[0] + ((p[2] - p[0]) / d) * 1.6, p[1] + ((p[3] - p[1]) / d) * 1.6);
    await W.ff(0.4);
    // `ff` steps the world without drawing: the « E » bubble just mounted is placed on the runtime's next drawn frame
    // (WorldRuntime.placePrompt) — wait for two drawn frames before reading it, as story.mjs › toBoard (2026-11-26: read
    // hidden at the day mission's board, though E opened it)
    await page.evaluate(
      () =>
        new Promise((done) => {
          requestAnimationFrame(() => requestAnimationFrame(done));
          setTimeout(done, 1000);
        }),
    );
    check((await W.promptShown()) === open, `at ${what}: the « E » prompt is ${open ? 'shown' : 'NOT shown'}`);
    await W.act();
    await page.waitForTimeout(300);
  };

  /** ONE pillar at d: typed, planted (the post at d), the crews lay; lanes, verdict, facts and purse checked. */
  const tryPillar = async (seg, d, left) => {
    const want = layOf(seg.crews, d, left);
    const box = '[data-di-walkway] [data-di-in="pillar"]';
    await page.fill(box, String(d));
    await page.click('[data-di-walkway] [data-di-plant]');
    await page.waitForFunction(() => window.__walkway?.stage === 'planted', null, { timeout: 8000 });
    check(
      (await page.getAttribute('[data-di-walkway] [data-di-post]', 'data-di-post').catch(() => null)) === String(d),
      `${seg.id}: the pillar stands at ${d} before any crew lays`,
    );
    const ticks = await page.$$eval('[data-di-walkway] [data-cl-tick]', (els) =>
      els.map((e) => Number(e.dataset.clTick)),
    );
    check(
      ticks.length >= 2 && Math.max(...ticks) * 1.4 >= d,
      `${seg.id}: the ruler reaches the pillar ${d} (labels ${ticks.join(', ')})`,
    );
    await page.click('[data-di-walkway] [data-di-lay]');
    await page.waitForFunction(() => window.__walkway?.stage === 'laid', null, { timeout: 20000 });
    await page.waitForTimeout(250);
    const seen = await page.evaluate(() => ({
      lanes: [...document.querySelectorAll('[data-di-walkway] [data-di-lane]')].map((e) => ({
        lane: e.dataset.diLane,
        planks: Number(e.dataset.diPlanks),
        short: Number(e.dataset.diShort),
      })),
      verdict: document.querySelector('[data-di-walkway-verdict]')?.dataset.diWalkwayVerdict ?? null,
      facts: [...document.querySelectorAll('[data-di-walkway] .ch-facts p:not(.ch-purse)')].map((p) => p.textContent),
      purse: document.querySelector('[data-di-walkway] .ch-purse')?.dataset.diPurse ?? null,
    }));
    const lanesOk = want.lanes.every(
      (l, i) =>
        seen.lanes[i]?.planks === l.planks && seen.lanes[i]?.short === l.short && seen.lanes[i]?.lane === 'AB'[i],
    );
    check(
      lanesOk && seen.verdict === want.verdict,
      `${seg.id} at ${d}: ${want.lanes.map((l, i) => `${'AB'[i]} ${l.planks} × ${l.b}${l.short ? `, ${l.short} short` : ''}`).join('; ')} → ${want.verdict} (cost ${want.cost}${left == null ? '' : `, ${left} coins`}) — computed here (the world: ${JSON.stringify(seen.lanes)} ${seen.verdict})`,
    );
    // the facts read back: one per lane, then the verdict (the shore alone)
    const n = want.verdict === 'shore' ? 1 : want.lanes.length + 1;
    const lanesSaid =
      want.verdict === 'shore' ||
      want.lanes.every(
        (l, i) =>
          (l.planks === 0 || writes(seen.facts[i], l.planks)) && (l.short === 0 || writes(seen.facts[i], l.short)),
      );
    const verdictSaid =
      want.verdict === 'paid'
        ? writes(seen.facts.at(-1), want.cost) && writes(seen.facts.at(-1), left - want.cost)
        : want.verdict === 'ruins'
          ? writes(seen.facts.at(-1), want.cost)
          : true;
    check(
      seen.facts.length === n && lanesSaid && verdictSaid && !seen.facts.some((f) => WRONG_WORD.test(f)),
      `${seg.id} at ${d}: ${n} fact(s), each lane's planks and shortfall, the verdict's planks and coins — never « faux » (« ${seen.facts.join(' | ').slice(0, 160)} »)`,
    );
    if (left != null)
      check(
        Number(seen.purse) === (want.verdict === 'paid' ? left - want.cost : left),
        `${seg.id} at ${d}: the purse shows ${want.verdict === 'paid' ? left - want.cost : left} coins (${seen.purse}) — a refused walkway costs nothing`,
      );
    await panelFits(`walkway-${seg.id}-${d}`);
    return want;
  };

  /**
   * A WALKWAY from island k: the instruction (its crews and purse), the lit post; the bench if it has one (played,
   * kept, reopened); the pillars of the descriptor's plan (`story.walkway[seg.id]`, default: the first multiple of the
   * longer plank that is not common, then 0), each refused and taken back; then the first common multiple, paid; the
   * panel closed, the walkway standing with it, he crosses. Returns the island he stands on.
   */
  const walkway = async (k) => {
    const seg = segs[k];
    await hook(`walkway:${seg.id}:before`);
    const purse = seg.convoy ? (convoys[seg.convoy]?.purse ?? null) : null;
    const first = lcmOfAll(seg.crews);
    const long = Math.max(...seg.crews);
    const notCommon =
      Array.from({ length: 50 }, (_, i) => long * (i + 1)).find((d) => d < first && seg.crews.some((b) => d % b)) ??
      null;
    const plan = S.walkway?.[seg.id] ?? [notCommon, 0].filter((x) => x != null);
    console.log(
      `NOTE  walkway « ${seg.id} » (${seg.crews.join(' and ')}${purse != null ? `, ${purse} coins` : ''}): first pillar ${first} (${seg.crews.map((b) => first / b).join(' + ')} planks); tried first ${plan.join(', ')} (computed)`,
    );
    {
      const o = bare((await W.road()).objective);
      check(
        seg.crews.every((b) => o.includes(String(b))) && (purse == null || o.includes(String(purse))),
        `island « ${islands[k].name} »: the instruction names the crews ${seg.crews.join(', ')}${purse != null ? ` and the ${purse} coins` : ''}`,
      );
    }
    await shotWorld(`island-${islands[k].id}`);
    await toThing(k, 'post', true, 'the post of the walkway');
    expect((await W.st()).overlay === 'walkway', `E at the post opens the chantier of « ${seg.id} »`);
    await page.waitForSelector(`[data-di-walkway="${seg.id}"]`, { timeout: 8000 });
    if (purse != null)
      check(
        (await page.getAttribute('[data-di-walkway] .ch-purse', 'data-di-purse').catch(() => null)) === String(purse),
        `the chantier's purse: ${purse} coins`,
      );
    await panelFits(`walkway-${seg.id}`);
    // ── its bench (lesson 1's spreadsheet on the second walkway) ──
    if (seg.bench) {
      check(
        (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'new',
        `the chantier of « ${seg.id} » offers its bench, new`,
      );
      const open = async () => {
        await page.click('[data-di-bench-open]');
        await page.waitForSelector(`[data-di-bench="${seg.bench.kind}"] .iq`, { timeout: 8000 });
        await page.waitForTimeout(300);
      };
      await open();
      await playExperiment({ w, page, name: `bench-${islands[k].id}`, where: 'bench', forbid: env.forbid }, seg.bench);
      await page.waitForSelector(`[data-di-walkway="${seg.id}"]`, { timeout: 8000 });
      const kept = async () =>
        Number(await page.getAttribute('[data-di-bench-kept]', 'data-di-bench-kept').catch(() => 0));
      const rounds = seg.bench.rounds?.length ?? 1;
      check(
        (await kept()) === rounds && (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'kept',
        `the bench closes to the chantier: its card keeps ${rounds} line(s) under the box (${await kept()})`,
      );
      await panelFits(`walkway-${seg.id}-kept`);
      await open();
      await page.click('[data-di-bench-back]');
      await page.waitForSelector(`[data-di-walkway="${seg.id}"]`, { timeout: 8000 });
      check((await kept()) === rounds, `reopened and left, the bench is still kept (${await kept()} lines)`);
    }
    // ── the pillars refused, then the first that holds and is paid ──
    let left = purse;
    for (const d of plan) {
      const t = await tryPillar(seg, d, left);
      expect(t.verdict !== 'paid', `the plan's pillar ${d} is not paid (the walk tries the paid one last)`);
      await page.click('[data-di-walkway] [data-di-take]');
      await page.waitForFunction(() => window.__walkway?.stage === 'place', null, { timeout: 8000 });
    }
    const t = await tryPillar(seg, first, left);
    expect(t.verdict === 'paid', `the pillar at ${first} holds and the purse pays its ${t.cost} planks`);
    await page.keyboard.press('Escape');
    await W.ff(0.6);
    const r = await W.road();
    expect(
      r.overlay == null && r.segs[k].complete && r.segs[k].builtWith === first,
      `the chantier closes, the walkway stands at ${first}`,
    );
    await shotWorld(`walkway-${seg.id}-stands`);
    await W.cross(k);
    await page.waitForTimeout(400);
    expect((await W.road()).island === k + 1, `over the walkway he reaches « ${islands[k + 1].name} »`);
    // the card on the right (under a mirror that opens on arrival): the pillar and its equalities
    const card = (await page.textContent('[data-di-recall]').catch(() => null)) ?? null;
    if (card != null)
      check(
        writes(card, first) && seg.crews.every((b) => writes(card, first / b)),
        `on « ${islands[k + 1].name} » the card recalls the pillar ${first} = ${seg.crews.map((b) => `${b} × ${first / b}`).join(' = ')} (« ${card.slice(0, 80)} »)`,
      );
    else console.log(`NOTE  on « ${islands[k + 1].name} » no card on the right was found (a mirror may cover it)`);
    lap(`walkway ${seg.id}`);
    return k + 1;
  };

  /** Is segment k a lone standing bridge (a gap of 0, no convoy, no mark) on an island with no pedestal? */
  const isLoneStanding = async (k) => {
    const seg = segs[k];
    if (!(seg.kind === 'bridge' && seg.standing && !seg.convoy && !seg.mark)) return false;
    if (L.lesson.story.mission?.opens === seg.id) return false;
    return (await page.evaluate((i) => (window.__world.isl[i].pedestals ?? []).length, k)) === 0;
  };
  /** A lone standing bridge: standing from the start, nothing to build at its altar; the instruction names where it leads. */
  const standing = async (k) => {
    const r = await W.road();
    expect(r.segs[k].complete, `the bridge « ${segs[k].id} » (0 cases) stands from the start`);
    check(r.objective.includes(islands[k + 1].name), `the instruction leads to « ${islands[k + 1].name} »`);
    await W.toAltar(k);
    await W.ff(0.3);
    check(!(await W.promptShown()), `at the head of « ${segs[k].id} »: no « Appuie sur E » — nothing to build`);
    await shotWorld(`island-${islands[k].id}`);
    await W.cross(k);
    await page.waitForTimeout(300);
    expect((await W.road()).island === k + 1, `over « ${segs[k].id} » he reaches « ${islands[k + 1].name} »`);
    return k + 1;
  };

  /**
   * The final mission whose answer is a DAY (`story.mission` with `lines`, `posters`, `window`): the rests read from its
   * own lead (« … puis reste au port 7 jours »), the day computed here (1 + the smallest common multiple of the cycles).
   * Played: the trap of the rest days (1 + their common multiple), the day before the answer, a later meeting (the answer
   * + the multiple) — each a fact that names who is at port, never the answer, a poster spent, the window around the day;
   * the run over; the board reopened with its posters; the right day; a module marked; the finale follows.
   */
  const dayMission = async (k) => {
    await hook('mission:before');
    const m = L.lesson.story.mission;
    const of = m.posters ?? m.plaques;
    const text = m.lead.join(' ');
    const rests = [...text.matchAll(/(?:reste au port|se repose|dort)\s+(\d+)\s+jours?/g)].map((x) => Number(x[1]));
    expect(rests.length >= 2, `the mission's text gives the rests (${rests.join(', ')})`);
    const cycles = rests.map((x) => x + 1);
    check(
      JSON.stringify(m.window?.cycles ?? cycles) === JSON.stringify(cycles),
      `the mission's window runs the cycles the text says (${cycles.join(', ')})`,
    );
    const M = lcmOfAll(cycles);
    const answer = 1 + M;
    const tries = (S.missionTries ?? [1 + lcmOfAll(rests), answer - 1, answer + M]).filter((d) => d !== answer);
    console.log(
      `NOTE  the mission: cycles ${cycles.join(', ')} → day ${answer}; refused first ${tries.join(', ')} (computed)`,
    );
    await shotWorld(`island-${islands[k].id}`);
    await toThing(k, 'mission', true, 'the board of the mission');
    expect((await W.st()).overlay === 'mission', 'E at the board opens the mission');
    await page.waitForSelector('[data-di-mission="open"]', { timeout: 8000 });
    const boxes = await page.$$eval('[data-di-mission] [data-rf-use]', (els) => els.map((e) => e.dataset.rfUse));
    expect(boxes.length === 1, `ONE box, the day (${boxes.join(', ')})`);
    const box = `[data-di-mission] [data-rf-use="${boxes[0]}"]`;
    const left = async () => Number(await page.getAttribute('[data-di-posters]', 'data-di-posters'));
    check(
      (await left()) === of && (await page.getAttribute('[data-di-mission-check]', 'disabled')) != null,
      `${of} posters, « check » waiting for the box (${await left()})`,
    );
    await w.shot(page, 'mission', OUT);
    const works = (c, d) => (d - 1) % c === 0;
    const facts = [];
    for (const [n, day] of tries.slice(0, of).entries()) {
      await page.fill(box, String(day));
      await page.click('[data-di-mission-check]');
      await page.waitForSelector('[data-di-mission-fact]', { timeout: 15000 });
      await page.waitForTimeout(250);
      const f = ((await page.textContent('[data-di-mission-fact]')) ?? '').trim();
      facts.push(f);
      const idle = cycles.filter((c) => !works(c, day)).length;
      const win = await page.getAttribute('[data-di-window]', 'data-di-window').catch(() => null);
      check(
        f.length > 5 && !writes(f, answer) && !WRONG_WORD.test(f) && (idle === 0 || writes(f, day)),
        `day ${day} (${idle} of ${cycles.length} at port — computed here): refused by a fact that names the day, never ${answer} (« ${f} »)`,
      );
      check(win === `${Math.max(1, day - 15)}:${day}`, `the window runs the 31 days around ${day} (${win})`);
      check((await left()) === of - n - 1, `${of - n - 1} poster(s) left (${await left()})`);
      await w.shot(page, `mission-refused-${day}`, OUT);
    }
    check(new Set(facts).size === facts.length, 'each refused day gets its own sentence');
    if (tries.length >= of) {
      check(
        (await page.getAttribute('[data-di-mission]', 'data-di-mission')) === 'over' &&
          (await page.locator('[data-di-mission-over]').count()) === 1 &&
          (await page.locator('[data-di-mission-check], [data-di-mission] [data-rf-use]').count()) === 0,
        'no poster left: the run is over, its sentence shown, no box',
      );
      await w.shot(page, 'mission-spent', OUT);
      await page.click('[data-di-mission-later]');
      await W.ff(0.5);
      await toThing(k, 'mission', true, 'the board of the mission');
      await page.waitForSelector('[data-di-mission="open"]', { timeout: 8000 });
      check((await left()) === of, `the board reopened: ${of} new posters (${await left()})`);
    }
    await page.evaluate(() => {
      const gw = window.__world;
      window.__modulesDone = [];
      const real = gw.onModule;
      gw.onModule = (n) => {
        window.__modulesDone.push(String(n));
        return real.call(gw, n);
      };
    });
    await page.fill(box, String(answer));
    await page.click('[data-di-mission-check]');
    await W.ff(0.8);
    const solved = await page.evaluate(() => Boolean(window.__world.flags.mission));
    const mods = await page.evaluate(() => window.__modulesDone ?? []);
    expect(solved, `day ${answer}: the three cross together — the mission is solved`);
    check(mods.length >= 1, `solving the mission marks a module (${mods.join(', ') || 'none'})`);
    lap('the mission');
  };

  return { walkway, isLoneStanding, standing, dayMission };
}
