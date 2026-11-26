// The experiment kind `crews` of « L’archipel des diviseurs » (divisorIsles/crews.js, InquiryCrews.jsx — fourth French
// lesson `multiples-et-diviseurs-communs`, 2026-11-26), registered in experiments.mjs › EXPERIMENTS as `crews:story` and
// `crews:days`. Every answer is computed HERE from the spec's numbers and the words on screen; the spec's own `value` of
// a read-back is only CROSS-CHECKED against the walk's arithmetic.
import { inquiryFits, tellsNothing, WRONG_WORD } from './checks.mjs';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
export const lcmOfAll = (xs) => xs.reduce(lcm, 1);
/** A text as seen: every white space (the no-break ones included) dropped. */
const bare = (t) => String(t ?? '').replace(/[\s  ]/g, '');
/** Does a text write the number n (not inside a longer number)? */
const writes = (t, n) => new RegExp(`(^|[^0-9])${n}([^0-9]|$)`).test(bare(t));
const iq = (page) => page.evaluate(() => window.__inquiry);
const fact = async (page) => (await page.textContent('.iq [data-iq-fact]').catch(() => '')) ?? '';
const waitIq = (page, test, arg, ms = 15000) => page.waitForFunction(test, arg, { timeout: ms });
/** « 6 h 10 » in a story's text → [6, 10]. */
const clockIn = (text) => {
  const m = String(text).match(/(\d{1,2})\s*h\s*(\d{2})/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/**
 * What a question of the story asks, read from its label (as the student reads it): the turns of the crew whose number
 * the label names (« La roue de 32 dents a fait » → L ÷ 32), else the first meeting L; a clock time: the story's start
 * (« à 6 h 10 ») + L minutes.
 */
function askValue(q, round, L) {
  if (q.clock) {
    const start = clockIn(Array.isArray(round.text) ? round.text.join(' ') : round.text);
    if (!start) return null;
    const t = start[0] * 60 + start[1] + L;
    return { h: Math.floor(t / 60), min: t % 60 };
  }
  const who = round.crews.find((b) => writes(q.label, b));
  return who ? L / who : L;
}
const sameAnswer = (q, a, b) => (q.clock ? Number(a?.h) === b.h && Number(a?.min) === b.min : Number(a) === Number(b));
const clockText = (v) => `${v.h}h${String(v.min).padStart(2, '0')}`;

/**
 * `crews`, `story`: a story TRANSLATED into two crews. Each round: the story card (its two numbers written, no chip
 * holding a result — the first meeting nor a count of turns); « Traduis »; the unit chip; on round 1 a crew chip that is
 * not a number of the story's crews first (its fact, the chip back, no result written); the two crews; the pillar at the
 * walk's own first common multiple (both lanes end on it, the facts counted); « Reviens à l’histoire »; the read-backs —
 * on round 1 the first count of turns given the OTHER crew's turns first, a clock time given the duration first (« 3 h 50 »
 * for 230 min): each refused with the story's fact, which never writes the answer —, then all right.
 */
export async function crewsStory(ctx, spec) {
  const { w, page, name } = ctx;
  const exit = ctx.where === 'forge' ? ['.rf-root [data-di-exit]'] : undefined;
  const next = ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]';
  for (const [ri, round] of spec.rounds.entries()) {
    const tag = `${name}-r${ri + 1}`;
    if (ri > 0) {
      await page.click(next);
      await waitIq(page, (r) => window.__inquiry?.ri === r && window.__inquiry?.stage === 'read', ri);
    }
    const [A, B] = round.crews;
    const L = lcm(A, B);
    const q0 = await iq(page);
    w.expect(
      q0.kind === 'crews' && q0.mode === 'story' && q0.stage === 'read',
      `${tag}: the story card (the world: ${q0.kind} ${q0.mode} ${q0.stage})`,
    );
    const story = (await page.textContent('.iq [data-iq-story]').catch(() => '')) ?? '';
    w.check(writes(story, A) && writes(story, B), `${tag}: the story writes its two rhythms ${A} and ${B}`);
    await tellsNothing(w, page, `${tag}, the story`, ctx.forbid());
    await inquiryFits(w, page, `${tag}-read`, exit);
    await page.click('.iq [data-iq-read]');
    await waitIq(page, () => window.__inquiry?.stage === 'map');
    const chips = await page.$$eval('.iq [data-iq-chip]', (els) => els.map((e) => e.dataset.iqChip));
    const results = [L, L / A, L / B];
    w.check(
      !chips.some((c) => {
        const [slot, v] = c.split(':');
        return slot !== 'unit' && results.includes(Number(v));
      }),
      `${tag}: no chip holds a result (${results.join(', ')}) — computed here (${chips.join(' ')})`,
    );
    const placed = (slot) => page.getAttribute(`.iq [data-iq-slot="${slot}"]`, 'data-iq-chosen');
    // the unit: the story's own (its options are words; the right one is the story's, read from the spec)
    await page.click(`.iq [data-iq-chip="unit:${round.unit.right}"]`);
    await waitIq(page, () => window.__inquiry?.map?.unit != null);
    // a crew chip that is not a rhythm of the story, on round 1
    if (ri === 0) {
      const bad = round.numbers.find((v) => !round.crews.includes(v));
      if (bad != null) {
        await page.click(`.iq [data-iq-chip="A:${bad}"]`);
        await page.waitForTimeout(250);
        const f = await fact(page);
        w.check(
          !(await placed('A')) && f.trim().length > 5 && !WRONG_WORD.test(f) && !results.some((v) => writes(f, v)),
          `${tag}: ${bad} on crew A is not a rhythm of the story — the chip goes back, the story's fact, no result written (« ${f.trim().slice(0, 90)} »)`,
        );
        await inquiryFits(w, page, `${tag}-chip-${bad}`, exit);
      }
    }
    await page.click(`.iq [data-iq-chip="A:${A}"]`);
    await page.click(`.iq [data-iq-chip="B:${B}"]`);
    await waitIq(page, () => window.__inquiry?.stage === 'pillar');
    // the tallest facts first (walk 2026-11-26: the panel left the window): a pillar short of both planks — no crew lays,
    // each lane writes its shortfall, the whole distance; it fits; « Reviens à l’histoire » stays shut; taken back
    {
      const d = Math.min(A, B) - 1;
      await page.fill('.iq [data-iq-in="pillar"]', String(d));
      await page.click('.iq [data-iq-plant]');
      await waitIq(page, () => window.__inquiry?.pillar?.stage === 'planted');
      await page.click('.iq [data-iq-lay]');
      await waitIq(page, () => window.__inquiry?.pillar?.stage === 'laid', undefined, 30000);
      const seen = await page.$$eval('.iq .ch-facts p:not(.ch-purse)', (els) => els.map((e) => e.textContent));
      w.check(
        seen.length === 3 && seen.slice(0, 2).every((f) => writes(f, d)) && !seen.some((f) => WRONG_WORD.test(f)),
        `${tag}: the pillar at ${d}, short of both planks — each lane writes its ${d} cases, never « faux » (« ${seen.join(' | ').slice(0, 140)} »)`,
      );
      w.check(
        await page.isDisabled('.iq [data-iq-back]'),
        `${tag}: at ${d} nothing holds — « back to the story » stays shut`,
      );
      await inquiryFits(w, page, `${tag}-pillar-${d}`, exit);
      await page.click('.iq [data-iq-take]');
      await waitIq(page, () => window.__inquiry?.pillar?.stage === 'place');
    }
    // the pillar at the first common multiple, computed here
    await page.fill('.iq [data-iq-in="pillar"]', String(L));
    await page.click('.iq [data-iq-plant]');
    await waitIq(page, () => window.__inquiry?.pillar?.stage === 'planted');
    await page.click('.iq [data-iq-lay]');
    await waitIq(page, () => window.__inquiry?.pillar?.stage === 'laid', undefined, 30000);
    await page.waitForTimeout(200);
    const lanes = await page.$$eval('.iq [data-di-lane]', (els) =>
      els.map((e) => ({ lane: e.dataset.diLane, planks: Number(e.dataset.diPlanks), short: e.dataset.diShort })),
    );
    const facts = (await page.$$eval('.iq .ch-facts p:not(.ch-purse)', (els) => els.map((e) => e.textContent))).join(
      ' | ',
    );
    w.check(
      lanes.length === 2 &&
        lanes[0].planks === L / A &&
        lanes[1].planks === L / B &&
        lanes.every((l) => l.short === '0') &&
        writes(facts, L / A) &&
        writes(facts, L / B),
      `${tag}: the pillar at ${L} = ${A} × ${L / A} = ${B} × ${L / B} — both crews end on it, the facts count ${L / A} and ${L / B} planks — computed here (${JSON.stringify(lanes)}; « ${facts.slice(0, 120)} »)`,
    );
    w.check(
      (await page.getAttribute('.iq [data-di-post]', 'data-di-post').catch(() => null)) === String(L),
      `${tag}: the post stands at ${L}`,
    );
    await tellsNothing(w, page, `${tag}, the pillar`, ctx.forbid());
    await inquiryFits(w, page, `${tag}-pillar-${L}`, exit);
    await page.click('.iq [data-iq-back]');
    await waitIq(page, () => window.__inquiry?.stage === 'back');
    // the read-backs, computed here (the spec's own value only cross-checked)
    const asks = round.ask.map((q) => ({ q, v: askValue(q, round, L) }));
    for (const { q, v } of asks)
      w.check(
        v != null && sameAnswer(q, q.clock ? { h: q.value[0], min: q.value[1] } : q.value, v),
        `${tag}: « ${q.label} » — the walk reads ${q.clock ? clockText(v ?? { h: '?', min: 0 }) : v} (the lesson: ${q.clock ? q.value.join(' h ') : q.value})`,
      );
    const fill = async (q, v) => {
      if (q.clock) {
        await page.fill(`.iq [data-iq-in="${q.id}:h"]`, String(v.h));
        await page.fill(`.iq [data-iq-in="${q.id}:min"]`, String(v.min));
      } else await page.fill(`.iq [data-iq-in="${q.id}"]`, String(v));
    };
    // one wrong read-back: the other crew's turns on round 1, the duration read as a clock time
    const turns = asks.find(({ q }) => !q.clock && round.crews.some((b) => writes(q.label, b)));
    const clock = asks.find(({ q }) => q.clock);
    const wrong =
      ri === 0 && turns
        ? { ...turns, bad: turns.v === L / A ? L / B : L / A }
        : clock
          ? { ...clock, bad: { h: Math.floor(L / 60), min: L % 60 } }
          : null;
    for (const { q, v } of asks) await fill(q, wrong && wrong.q === q ? wrong.bad : v);
    if (wrong && !sameAnswer(wrong.q, wrong.bad, wrong.v)) {
      await page.click('.iq [data-iq-check]');
      await page.waitForTimeout(300);
      const f = await fact(page);
      const leaks = wrong.q.clock ? bare(f).includes(clockText(wrong.v)) : writes(f, wrong.v);
      w.check(
        (await iq(page)).stage === 'back' && f.trim().length > 5 && !leaks && !WRONG_WORD.test(f),
        `${tag}: « ${wrong.q.label} » ${wrong.q.clock ? clockText(wrong.bad) : wrong.bad} is refused by the story's fact, which never writes the answer (« ${f.trim().slice(0, 100)} »)`,
      );
      const kept = await page.$$eval('.iq [data-iq-ask].is-ok', (els) => els.map((e) => e.dataset.iqAsk));
      w.check(
        asks.filter(({ q }) => q !== wrong.q).every(({ q }) => kept.includes(q.id)),
        `${tag}: the right read-backs are kept (${kept.join(', ')})`,
      );
      await inquiryFits(w, page, `${tag}-back-refused`, exit);
      await fill(wrong.q, wrong.v);
    }
    await page.click('.iq [data-iq-check]');
    await waitIq(page, () => window.__inquiry?.stage === 'seen');
    const f = await fact(page);
    w.check(writes(f, L), `${tag}: the end says the meeting, ${L} (« ${f.trim().slice(0, 100)} »)`);
    await tellsNothing(w, page, `${tag}, the end`, ctx.forbid());
    await inquiryFits(w, page, `${tag}-seen`, exit);
  }
}

/**
 * `crews`, `days`: teams that work 1 day then sleep (`team.sleep`), all at work on day 1. A stage `ask: 'zero'`: a wrong
 * chip first (its fact, he picks again), then 0 — every team's day 1 lit. Each other stage: the walk's own day (1 + the
 * smallest common multiple of the asked teams' cycles) typed; a `step` run clicked day by day to it; a `fast` run that
 * stops — with `stopOn: 'all-but-one'` — on every day where all teams but one work (computed here, the sleeper named,
 * the answer never written), resumed each time; the met day lit for every asked team, the fact naming it.
 */
export async function crewsDays(ctx, spec) {
  const { w, page, name } = ctx;
  const exit = ctx.where === 'forge' ? ['.rf-root [data-di-exit]'] : undefined;
  const next = ctx.where === 'forge' ? '.rf-root [data-iq-next]' : '[data-iq-next]';
  const cycles = spec.teams.map((t) => (t.work ?? 1) + t.sleep);
  const works = (c, d) => (d - 1) % c === 0;
  for (const [si, st] of spec.stages.entries()) {
    const tag = `${name}-s${si + 1}`;
    if (si > 0) {
      await page.click(next);
      await waitIq(page, (s) => window.__inquiry?.si === s && window.__inquiry?.phase === 'say', si);
    }
    await tellsNothing(w, page, `${tag}, start`, ctx.forbid());
    if (st.ask === 'zero') {
      const bad = (st.options ?? [0, 1]).find((v) => v !== 0);
      await inquiryFits(w, page, `${tag}-zero`, exit);
      if (bad != null) {
        await page.click(`.iq [data-iq-zero="${bad}"]`);
        await page.waitForTimeout(250);
        const f = await fact(page);
        w.check(
          (await iq(page)).phase === 'say' && f.trim().length > 5 && !WRONG_WORD.test(f),
          `${tag}: ${bad} day(s) on day 1 — refused with a fact, he picks again (« ${f.trim().slice(0, 80)} »)`,
        );
      }
      await page.click('.iq [data-iq-zero="0"]');
      await waitIq(page, () => window.__inquiry?.phase === 'met');
      const lit = await page.$$eval('.iq [data-iq-cell$=":1"]', (els) => els.map((e) => e.dataset.iqOn));
      w.check(
        lit.length === cycles.length && lit.every((x) => x === '1'),
        `${tag}: 0 days on day 1 — every team at work that day (${lit.join('')})`,
      );
      await inquiryFits(w, page, `${tag}-zero-met`, exit);
      continue;
    }
    const asked = st.teams.map((t) => cycles[t - 1]);
    const meet = 1 + lcmOfAll(asked);
    w.expect(meet <= spec.days, `${tag}: day ${meet} is drawn (${spec.days} days)`);
    // the days where every team but one works, before the meeting — computed here
    const stops = [];
    if (st.stopOn === 'all-but-one')
      for (let d = 2; d < meet; d += 1) {
        const idle = cycles.map((c, i) => (works(c, d) ? -1 : i + 1)).filter((i) => i > 0);
        if (idle.length === 1) stops.push({ day: d, team: idle[0] });
      }
    console.log(
      `NOTE  ${tag}: teams ${st.teams.join(', ')} (cycles ${asked.join(', ')}) meet on day ${meet}${stops.length ? `; the run stops on ${stops.map((s) => `${s.day} (team ${s.team})`).join(', ')}` : ''} (computed)`,
    );
    await page.fill('.iq [data-iq-in="day"]', String(meet));
    await inquiryFits(w, page, `${tag}-say`, exit);
    await page.click('.iq [data-iq-say]');
    await waitIq(page, () => ['run', 'stop', 'met'].includes(window.__inquiry?.phase));
    if (st.run === 'step') {
      let clicks = 0;
      for (let k = 0; k < spec.days && (await iq(page)).phase !== 'met'; k += 1) {
        const before = (await iq(page)).day;
        await page.click('.iq [data-iq-step]');
        await waitIq(page, (b) => window.__inquiry?.day === b + 1, before);
        clicks += 1;
      }
      w.check(clicks === meet - 1, `${tag}: « Jour suivant » ${clicks} times, day 1 to day ${meet}`);
    } else {
      const seen = [];
      for (let k = 0; k < stops.length + 2; k += 1) {
        await waitIq(page, () => ['stop', 'met'].includes(window.__inquiry?.phase), undefined, 60000);
        const q = await iq(page);
        if (q.phase === 'met') break;
        const stop = q.stops.at(-1);
        seen.push(stop);
        const f = await fact(page);
        const want = stops[seen.length - 1];
        w.check(
          want &&
            stop.day === want.day &&
            stop.team === want.team &&
            writes(f, want.day) &&
            writes(f, want.team) &&
            !writes(f, meet),
          `${tag}: the run stops on day ${stop.day}, team ${stop.team} asleep — the walk: ${want ? `${want.day}, team ${want.team}` : 'no stop'}; the fact names them, never day ${meet} (« ${f.trim().slice(0, 80)} »)`,
        );
        if (seen.length === 1) await inquiryFits(w, page, `${tag}-stop-${stop.day}`, exit);
        await page.click('.iq [data-iq-fast]');
        await waitIq(page, (d) => window.__inquiry?.phase !== 'stop' || window.__inquiry?.day > d, stop.day);
      }
      w.check(
        seen.length === stops.length,
        `${tag}: ${stops.length} stop(s) on the way, each resumed (${seen.map((s) => s.day).join(', ') || '—'})`,
      );
    }
    await waitIq(page, () => window.__inquiry?.phase === 'met', undefined, 60000);
    await page.waitForTimeout(250);
    const q = await iq(page);
    const on = await page.$$eval(
      '.iq [data-iq-cell]',
      (els, d) => els.filter((e) => e.dataset.iqCell.endsWith(`:${d}`)).map((e) => e.dataset.iqOn),
      meet,
    );
    const f = await fact(page);
    w.check(
      q.day === meet &&
        st.teams.every((t) => on[t - 1] === '1') &&
        on.every((x, i) => (x === '1') === works(cycles[i], meet)) &&
        writes(f, meet),
      `${tag}: day ${meet} — teams ${st.teams.join(', ')} at work, the column lit as the walk computes it (${on.join('')}), the fact says it (« ${f.trim().slice(0, 90)} »)`,
    );
    const fits = await page.evaluate(() => {
      const frame = document.querySelector('.iq')?.getBoundingClientRect();
      const svg = document.querySelector('.iq [data-iq-days] svg')?.getBoundingClientRect();
      return frame && svg ? { right: Math.round(svg.right - frame.right), w: Math.round(svg.width) } : null;
    });
    w.check(fits && fits.right <= 1, `${tag}: the ${spec.days} days stand inside the frame (${JSON.stringify(fits)})`);
    await tellsNothing(w, page, `${tag}, met`, ctx.forbid());
    await inquiryFits(w, page, `${tag}-met-${meet}`, exit);
  }
}
