// The EXPERIMENT KINDS of the pyramids world (`nilePyramids/InquiryPlan.jsx`, `InquiryHalfturn.jsx`, `InquiryScale.jsx`,
// `InquiryPair.jsx`, `InquiryAngles.jsx`), registered in ../experiments.mjs › EXPERIMENTS under `plan`, `halfturn`,
// `scale`, `pair` and `angles`. Each plays its screen through its
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
    'button, input, .np-iq__lead, .np-iq__ask, .np-iq__fact, .np-iq__chain, .np-iq__dial, .np-iq__refused, .np-iq__type, svg, .np-pair__said, .np-pair__quotients, .np-pair__again, .np-iq__angle',
  scene: 'svg',
  lines: 0.5,
};
const stage = (page) => page.getAttribute('.np-iq', 'data-iq-stage');
const fits = (ctx, label) => inquiryFits(ctx.w, ctx.page, label, ['.rf-root [data-di-exit]'], NP_FRAME);
const iq = (page) => page.evaluate(() => window.__inquiry);
const add = (a, b) => sub(a, mul(b, '-1'));
const PIECES = { MB: ['VB', 'VM'], NC: ['VC', 'VN'] };
/**
 * Per figure kind, each line through the vertex as [whole, first part, second part] (`plan.js` names its joins so: a join
 * `a+b` gives the whole, a cut `whole-a` gives b) and the two of them that are lengths FROM THE VERTEX — the ones a ratio
 * card holds: on a NESTED figure a side VB and its pieces VM, MB; on a BUTTERFLY the length across the vertex VMB and its
 * two lengths from the vertex VM, VB.
 */
const LINES = {
  nested: [
    { whole: 'VB', a: 'VM', b: 'MB', vertex: ['VB', 'VM'] },
    { whole: 'VC', a: 'VN', b: 'NC', vertex: ['VC', 'VN'] },
  ],
  butterfly: [
    { whole: 'VMB', a: 'VM', b: 'VB', vertex: ['VM', 'VB'] },
    { whole: 'VNC', a: 'VN', b: 'VC', vertex: ['VN', 'VC'] },
  ],
};
/** A length the round SHOWS that its figure does not write: a nested figure's piece, a butterfly's length across. */
function derived(len, key, kind) {
  for (const l of LINES[kind]) {
    if (key !== l.whole && key !== l.b) continue;
    if (kind === 'nested' && key === l.b && len[l.whole] != null && len[l.a] != null)
      return write(sub(len[l.whole], len[l.a]));
    if (kind === 'butterfly' && key === l.whole && len[l.a] != null && len[l.b] != null)
      return write(add(len[l.a], len[l.b]));
  }
  return null;
}

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
 * `plan` — per round: the lengths GIVEN, then the joins and cuts the walk makes so that the lengths FROM THE VERTEX of a
 * line are known (a nested side from its two pieces end to end, `VM+MB`; a butterfly's length from the vertex cut off the
 * length across it, `VMB-VM`), the two cards of a plan, the unknown computed here and typed, laid: it FITS, laid where the
 * world lays that length (`data-iq-laid-on`: on a butterfly a length on a line through the vertex is a rope from the
 * vertex, every other length a course). On the first round a course of the WRONG length first (one more than the
 * truth), an overhang, then the button for another course (`data-iq-next`).
 */
export async function planExperiment(ctx, spec) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), '.np-iq');
  for (const [i, r] of spec.rounds.entries()) {
    await page.waitForFunction((u) => document.querySelector('.np-iq')?.dataset.iqUnknown === u, r.unknown, {
      timeout: 10000,
    });
    const kind = r.fig.kind === 'butterfly' ? 'butterfly' : 'nested';
    // only what the round SHOWS is read (a river's lengths not given are roots the walk never needs)
    const known = Object.fromEntries(r.given.map((k) => [k, r.fig.len[k] ?? derived(r.fig.len, k, kind)]));
    w.expect(
      Object.values(known).every((v) => v != null),
      `${ctx.name}, round ${i + 1}: every length given is known (${JSON.stringify(known)})`,
    );
    for (const l of LINES[kind]) {
      const has = { whole: known[l.whole] != null, a: known[l.a] != null, b: known[l.b] != null };
      if (l.vertex.every((k) => known[k] != null)) continue;
      if (kind === 'nested' && has.a && has.b && !has.whole) {
        await page.click(`.np-iq [data-iq-join="${l.a}+${l.b}"]`);
        known[l.whole] = write(add(known[l.a], known[l.b]));
      } else if (kind === 'nested' && has.whole && has.b && !has.a) {
        await page.click(`.np-iq [data-iq-join="${l.whole}-${l.b}"]`);
        known[l.a] = write(sub(known[l.whole], known[l.b]));
      } else if (kind === 'butterfly' && has.whole && has.a && !has.b) {
        await page.click(`.np-iq [data-iq-join="${l.whole}-${l.a}"]`);
        known[l.b] = write(sub(known[l.whole], known[l.a]));
      } else if (kind === 'butterfly' && has.whole && has.b && !has.a) {
        await page.click(`.np-iq [data-iq-join="${l.whole}-${l.b}"]`);
        known[l.a] = write(sub(known[l.whole], known[l.b]));
      }
    }
    const fromVertex = Object.fromEntries(
      ['VM', 'VB', 'VN', 'VC', 'MN', 'BC', 'MB', 'NC'].filter((k) => known[k] != null).map((k) => [k, known[k]]),
    );
    const want = solveLength(fromVertex, r.unknown, kind);
    const { withIt, whole } = planCards(new Set(Object.keys(known)), r.unknown);
    w.expect(withIt && whole, `${ctx.name}, round ${i + 1}: two cards make a plan for ${r.unknown} (computed here)`);
    await page.click(`.np-iq [data-iq-card="${withIt.id}"]`);
    await page.click(`.np-iq [data-iq-card="${whole.id}"]`);
    if (i === 0) await fits(ctx, `${ctx.name}-plan`);
    const on = kind === 'butterfly' && r.unknown !== 'MN' && r.unknown !== 'BC' ? 'line' : 'course';
    const lay = async (x) => {
      await page.fill('.np-iq [data-iq-in]', write(x));
      await page.click('.np-iq [data-iq-lay]');
      await page.waitForSelector('.np-iq [data-iq-laid]');
      const laidOn = await page.getAttribute('.np-iq [data-iq-laid-on]', 'data-iq-laid-on');
      w.check(laidOn === on, `${ctx.name}, round ${i + 1}: ${r.unknown} is laid as a ${on} (${laidOn})`);
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

// ─────────────────────────── `pair` and `angles` (triangles-semblables, K1 and K2, 2026-11-27) ───────────────────────────
const inv = (b) => ({ n: q(b).d, d: q(b).n });
const div = (a, b) => mul(a, inv(b));
const ROOT = '.np-iq';
/** What a screen SHOWS, as one text: every drawn text node, a KaTeX formula as its drawn text (its MathML left out). */
const shownText = (page, sel = ROOT) =>
  page.evaluate((s) => {
    const root = document.querySelector(s);
    if (!root) return '';
    const out = [];
    const seen = new Set();
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const el = n.parentElement;
      if (!el || el.closest('.katex-mathml')) continue;
      const k = el.closest('.katex');
      if (k) {
        if (!seen.has(k)) {
          seen.add(k);
          out.push(k.querySelector('.katex-html')?.textContent ?? '');
        }
        continue;
      }
      if (!el.getClientRects().length) continue;
      out.push(n.textContent);
    }
    return out.join('\n');
  }, sel);
/** Seen text, flat: no-break spaces as spaces, true minus as « - », the KaTeX degree « ∘ » as « ° ». */
const flat = (t) =>
  String(t ?? '')
    .replace(/[\s   ]+/g, ' ')
    .replace(/[−–]/g, '-')
    .replace(/∘/g, '°')
    .trim();
const tight = (t) => flat(t).replace(/ /g, '');
/** The numbers of a seen text, as numbers (« 3,8 » = 3.8; « 2 121 » grouped by thousands is ONE number, C26). */
const numbersOf = (t) =>
  String(t)
    .replace(/(\d)[   ](?=\d{3}(?!\d))/g, '$1')
    .match(/\d+(?:,\d+)?/g) ?? [];
/** A whole number under 10: a constant of the world on every screen (UNIT_3E_THALES_DESIGN.md, Lesson 1, K2). */
const small = (x) => q(x).d === 1n && q(x).n < 10n;
/**
 * The screen's numbers are the round's (computed here) and nothing else — no evaluated quotient, no partial sum, no
 * number of an earlier round (one round per screen); and no NAME of an earlier round's triangle that this round does not
 * use. Returns the seen text.
 */
async function roundScreen(ctx, where, allowed, names, earlier) {
  const text = await shownText(ctx.page);
  const extra = [...new Set(numbersOf(text))].filter((x) => !small(x) && !allowed.some((a) => eq(a, x)));
  ctx.w.check(
    extra.length === 0,
    `${where}: every number on screen is one of the round's (${[...new Set(allowed.map(write))].join(' ; ')}, computed here)${extra.length ? ' — also ' + extra.join(', ') : ''}`,
  );
  const letters = new Set(names.join(''));
  const old = earlier.filter((n) => !names.includes(n) && new RegExp(`(?<![A-Za-z])${n}(?![A-Za-z])`).test(text));
  const svgLetters = await ctx.page.evaluate(
    (s) =>
      [...document.querySelectorAll(`${s} svg text`)].map((e) => e.textContent.trim()).filter((t) => /^[A-Z]$/.test(t)),
    ROOT,
  );
  const stray = svgLetters.filter((x) => !letters.has(x));
  ctx.w.check(
    old.length === 0 && stray.length === 0,
    `${where}: one round per screen — nothing of an earlier round (its triangles ${earlier.join(', ') || 'none'})${old.length || stray.length ? ' — ' + [...old, ...stray].join(', ') : ''}`,
  );
  const left = await ctx.page.$$eval(`${ROOT} [data-iq-laid], ${ROOT} [data-iq-verdict]`, (els) => els.length);
  return { text, left };
}
const waitIq = (page, fn, arg) => page.waitForFunction(fn, arg, { timeout: 10000 });

// ── pair: the walk's own arithmetic ──
const ranksOf = (sides) => [0, 1, 2].sort((i, j) => cmp(sides[i], sides[j]) || i - j);
/** The ranked sides proportional: the stone, scaled, covers the template. */
const shapeOf = (T, S) => {
  const [rt, rs] = [ranksOf(T), ranksOf(S)];
  const k = div(S[rs[0]], T[rt[0]]);
  return [1, 2].every((n) => eq(div(S[rs[n]], T[rt[n]]), k));
};
/** Two of the three ranked quotients equal, the third not (the tile « deux des trois quotients »). */
const twoEqualOf = (T, S) => {
  const [rt, rs] = [ranksOf(T), ranksOf(S)];
  const k = [0, 1, 2].map((n) => div(S[rs[n]], T[rt[n]]));
  const same = [eq(k[0], k[1]), eq(k[1], k[2]), eq(k[0], k[2])].filter(Boolean).length;
  return same === 1;
};
/** template side t → stone side, by size. */
const bySize = (T, S) => {
  const [rt, rs] = [ranksOf(T), ranksOf(S)];
  const links = [];
  rt.forEach((t, n) => (links[t] = rs[n]));
  return links;
};
const marksOf = (T, S, links) =>
  [0, 1].map((i) => (eq(div(S[links[i]], T[i]), div(S[links[i + 1]], T[i + 1])) ? 'eq' : 'ne'));

/** The middle of a side of the drawing, on screen, and whether the student's pointer reaches it there. */
const sidePoint = (page, id) =>
  page.evaluate(
    ([s, id]) => {
      const g = document.querySelector(`${s} [data-iq-side="${id}"]`);
      const l = g?.querySelector('line');
      if (!l) return null;
      const m = l.ownerSVGElement.getScreenCTM();
      const p = new DOMPoint(
        (l.x1.baseVal.value + l.x2.baseVal.value) / 2,
        (l.y1.baseVal.value + l.y2.baseVal.value) / 2,
      ).matrixTransform(m);
      const top = document.elementFromPoint(p.x, p.y);
      return {
        x: p.x,
        y: p.y,
        free: Boolean(top && g.contains(top)),
        by: top ? String(top.className?.baseVal ?? top.tagName) : '',
      };
    },
    [ROOT, id],
  );

/**
 * `pair` — per round, as a student: his prediction (the truth computed here — the ranked sides proportional, exactly —
 * except on purpose on round 2 and on the first round where only two ranked quotients are equal: the misses the design
 * plays); the links: in a `world-first` round the world's first link (shortest ↔ shortest, locked, « premier lien »)
 * then his two by size; in a `given` round the mason's links as given (by default by the names), laid as they are,
 * then relinked by size AFTER the verdict (the TURN story). Checked: each chip « stone ÷ template » never evaluated, the
 * « = / ≠ » marks, « attendu / mesuré » (lengths, computed here) in world-first rounds only, the world's verdict
 * (`data-iq-laid`, `data-iq-image`: covers | apart) and his hit / miss, the screen's numbers, one round per screen.
 */
export async function pairExperiment(ctx, spec) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), ROOT);
  const T = spec.template.sides;
  const earlier = [];
  let fooled = false;
  /** He taps a template side then a stone side, with the pointer (the keyboard when the pointer cannot reach it). */
  const link = async (tag, t, s) => {
    for (const id of [`t${t}`, `s${s}`]) {
      const p = await sidePoint(page, id);
      w.expect(p, `${tag}: the side ${id} is drawn and can be tapped (data-iq-side)`);
      w.check(
        p.free,
        `${tag}: the side ${id} is reached by the pointer at its middle${p.free ? '' : ` — covered by ${p.by}`}`,
      );
      if (p.free) await page.mouse.click(p.x, p.y);
      else {
        await page.focus(`${ROOT} [data-iq-side="${id}"]`);
        await page.keyboard.press('Enter');
      }
    }
    await waitIq(page, ([t, s]) => window.__inquiry?.links?.[t] === s && !window.__inquiry.pick, [t, s]);
  };
  /** The chips, the marks and the « attendu / mesuré » line against the links (computed here). */
  const readLinks = async (tag, r, S, links, locked) => {
    const seen = await page.evaluate((s) => {
      const chips = [...document.querySelectorAll(`${s} [data-iq-quotient]`)].map((e) => ({
        t: Number(e.dataset.iqQuotient),
        text: e.querySelector('span')?.textContent ?? '',
        first: e.hasAttribute('data-iq-first'),
      }));
      const marks = [...document.querySelectorAll(`${s} .np-pair__mark`)].map((e) => e.dataset.iqMark ?? null);
      const em = document.querySelector(`${s} [data-iq-expected]`);
      return {
        chips,
        marks,
        equal: document.querySelector(`${s} [data-iq-equal]`)?.dataset.iqEqual,
        expected: em?.dataset.iqExpected ?? null,
        measured: em?.dataset.iqMeasured ?? null,
        emText: em?.textContent ?? '',
      };
    }, ROOT);
    const chipsOk =
      seen.chips.length === 3 &&
      seen.chips.every((c) => {
        const parts = flat(c.text)
          .split('÷')
          .map((x) => x.trim());
        return parts.length === 2 && !/=/.test(c.text) && eq(parts[0], S[links[c.t]]) && eq(parts[1], T[c.t]);
      });
    w.check(
      chipsOk,
      `${tag}: each link is written « tracé ÷ gabarit », never evaluated (« ${seen.chips.map((c) => flat(c.text)).join(' | ')} »)`,
    );
    const want = marksOf(T, S, links);
    w.check(
      seen.marks.join() === want.join() && seen.equal === (want.every((m) => m === 'eq') ? 'yes' : 'no'),
      `${tag}: the marks between the quotients are ${want.map((m) => (m === 'eq' ? '=' : '≠')).join(' ')}, computed here (${seen.marks.join(' ')}, equal ${seen.equal})`,
    );
    if (r.link === 'world-first') {
      w.check(
        seen.chips
          .filter((c) => c.first)
          .map((c) => c.t)
          .join() === String(locked),
        `${tag}: the world's first link is captioned on its chip, alone`,
      );
      const k = div(S[links[locked]], T[locked]);
      const others = [0, 1, 2].filter((t) => t !== locked);
      const expected = others.map((t) => mul(T[t], k));
      const measured = others.map((t) => q(S[links[t]]));
      const got = (x) => (x ?? '').split(';').filter(Boolean);
      const same = (xs, ys) => xs.length === ys.length && xs.every((x, i) => eq(x, ys[i]));
      w.check(
        same(got(seen.expected), expected) &&
          same(got(seen.measured), measured) &&
          [...expected, ...measured].every((x) => numbersOf(seen.emText).some((y) => eq(y, x))),
        `${tag}: « attendu ${expected.map(write).join(' ; ')} — mesuré ${measured.map(write).join(' ; ')} », lengths computed here (« ${flat(seen.emText).slice(0, 80)} »)`,
      );
      return expected;
    }
    w.check(seen.expected == null, `${tag}: a round of given links writes no « attendu / mesuré » — only the marks`);
    return [];
  };
  for (const [i, r] of spec.rounds.entries()) {
    const tag = `${ctx.name}, round ${i + 1}`;
    await waitIq(
      page,
      (n) => window.__inquiry?.kind === 'pair' && window.__inquiry.i === n && window.__inquiry.stage === 'predict',
      i,
    );
    const S = r.stone.sides;
    const names = [spec.template.names, r.stone.names];
    const allowed = [...T, ...S].map(q);
    const truth = shapeOf(T, S);
    // one round per screen: nothing of an earlier round, no verdict left
    const open = await roundScreen(ctx, `${tag}, the prediction`, allowed, names, earlier);
    w.check(open.left === 0, `${tag}: the round opens with no verdict on screen`);
    if (i === 0) await fits(ctx, `${ctx.name}-predict`);
    let say = truth ? 'shape' : 'not';
    if (i === 1) say = truth ? 'not' : 'shape';
    else if (!fooled && !truth && twoEqualOf(T, S)) {
      say = 'shape';
      fooled = true;
    }
    await page.click(`${ROOT} [data-iq-predict="${say}"]`);
    await waitIq(page, () => window.__inquiry?.stage === 'link');
    let s = await iq(page);
    const size = bySize(T, S);
    let locked = null;
    if (r.link === 'world-first') {
      locked = ranksOf(T)[0];
      w.check(
        s.locked === locked && s.links[locked] === ranksOf(S)[0] && s.links.filter((x) => x != null).length === 1,
        `${tag}: the world lays the FIRST link, shortest side ↔ shortest side (computed here), and only it`,
      );
      const lk = await page.$(`${ROOT} [data-iq-side="t${locked}"][data-iq-locked]`);
      w.check(Boolean(lk), `${tag}: the first link's side of the template is locked`);
      for (const t of ranksOf(T).filter((x) => x !== locked)) await link(tag, t, size[t]);
    } else {
      const given = r.given ?? [0, 1, 2];
      w.check(
        s.links.join() === given.join() && s.locked == null,
        `${tag}: the mason's links stand as given (${given.join(',')})`,
      );
    }
    s = await iq(page);
    const expected = await readLinks(`${tag}, his links`, r, S, s.links, locked);
    if (i === 0) await fits(ctx, `${ctx.name}-links`);
    const asLaid = [...s.links];
    await page.click(`${ROOT} [data-iq-lay]`);
    await page.waitForSelector(`${ROOT} [data-iq-laid]`);
    const out = await page.evaluate((x) => {
      const f = document.querySelector(`${x} [data-iq-fact]`);
      return {
        laid: document.querySelector(`${x} [data-iq-laid]`)?.dataset.iqLaid,
        image: document.querySelector(`${x} [data-iq-image]`)?.dataset.iqImage,
        fact: f?.dataset.iqFact,
        said: document.querySelector(`${x} [data-iq-laid]`)?.textContent.trim() ?? '',
      };
    }, ROOT);
    const verdict = truth ? 'covers' : 'apart';
    w.check(
      out.laid === verdict && out.image === verdict,
      `${tag}: the world lays the tracé — it ${truth ? 'COVERS' : 'does not cover'} the template (ranked sides ${truth ? '' : 'not '}proportional, computed here; ${out.laid} / ${out.image})`,
    );
    w.check(
      out.fact === ((say === 'shape') === truth ? 'hit' : 'miss') && !WRONG.test(out.said),
      `${tag}: said « ${say} » — ${out.fact}, said as a fact (« ${flat(out.said).slice(0, 80)} »)`,
    );
    if (r.link === 'given') {
      const byNames = marksOf(T, S, asLaid).every((m) => m === 'eq');
      w.check(
        truth && !byNames,
        `${tag}: the mason's links clash with the world — their quotients are not all equal, yet the tracé covers the template (computed here)`,
      );
    }
    await roundScreen(ctx, `${tag}, laid`, [...allowed, ...expected], names, earlier);
    await fits(ctx, `${ctx.name}-laid-${i + 1}`);
    if (r.link === 'given') {
      // he relinks by size, after the verdict
      for (const t of ranksOf(T)) if ((await iq(page)).links[t] !== size[t]) await link(`${tag}, relinked`, t, size[t]);
      s = await iq(page);
      await readLinks(`${tag}, relinked by size`, r, S, s.links, null);
      const sets = s.rows.at(-1)?.sets ?? [];
      w.check(
        sets.length >= 2 && sets[0].equal === false && sets.at(-1).equal === true,
        `${tag}: his round keeps both sets of links — by the names (≠), then by size (= =)`,
      );
      await fits(ctx, `${ctx.name}-relinked-${i + 1}`);
    }
    await tellsNothing(w, page, tag, ctx.forbid(), ROOT);
    earlier.push(...names.filter((n) => !earlier.includes(n)));
    if (i < spec.rounds.length - 1) await page.click(`${ROOT} [data-iq-next]`);
  }
}

// ── angles: the walk's own arithmetic ──
/** A triangle of a round as the spec GIVES it: its three angles (the third 180 − x − y, or a's × a number), or two sides and the angle between. */
function triOfRound(r, which) {
  const t = r[which];
  const names = t.names;
  if (t.between)
    return { names, between: { sides: t.between.sides.map(q), angle: q(t.between.angle) }, closes: true, given: [] };
  let angles;
  if (t.times != null) angles = triOfRound(r, 'a').angles.map((x) => mul(x, t.times));
  else if (t.angles.length === 3) angles = t.angles.map(q);
  else angles = [...t.angles.map(q), sub(sub('180', t.angles[0]), t.angles[1])];
  const sum = angles.reduce((a, x) => add(a, x), q('0'));
  return {
    names,
    angles,
    sum,
    closes: eq(sum, '180'),
    side: t.side == null ? null : q(t.side),
    opp: t.opp ?? 2,
    given: t.times != null ? [q(t.times)] : [],
  };
}
const sortedEq = (xs, ys) => {
  const s = (l) => [...l].sort(cmp);
  const [a, b] = [s(xs), s(ys)];
  return a.every((x, i) => eq(x, b[i]));
};
/** What the slide does: open (a triangle does not close), covers (one shape, the written sides homologous) or apart. */
function slideFact(A, B) {
  if (!A.closes || !B.closes) return { fact: 'open' };
  if (A.between && B.between) {
    const [p, qq] = A.between.sides;
    const [p2, q2] = B.between.sides;
    const covers = eq(A.between.angle, B.between.angle) && eq(mul(qq, div(p2, p)), q2);
    return { fact: covers ? 'covers' : 'apart', top: p2, bottom: p };
  }
  const has = A.side != null && B.side != null;
  const covers = sortedEq(A.angles, B.angles) && has && eq(A.angles[A.opp], B.angles[B.opp]);
  return { fact: covers ? 'covers' : 'apart', top: has ? B.side : null, bottom: has ? A.side : null };
}
const measuredIn = (r) => (!r.measure ? [] : r.drawn ? ['a'] : ['a', 'b']);
const needleNow = async (page) => (await iq(page)).needle;

/** The needle dragged onto n degrees: from its handle, along the protractor drawn at the vertex, let go there. */
async function dragNeedle(page, n) {
  const pts = await page.evaluate(
    ([s, n]) => {
      const svg = document.querySelector(`${s} .np-iq-ang__svg`);
      const needle = svg?.querySelector('.np-iq-ang__needle');
      const tick = svg?.querySelector('.np-iq-ang__tick');
      const handle = svg?.querySelector('.np-iq-ang__handle');
      if (!needle || !tick || !handle) return null;
      const p = [needle.x1.baseVal.value, needle.y1.baseVal.value];
      const z = Math.atan2(-(tick.y2.baseVal.value - p[1]), tick.x2.baseVal.value - p[0]);
      const a = z + (n * Math.PI) / 180;
      const R = Math.hypot(handle.cx.baseVal.value - p[0], handle.cy.baseVal.value - p[1]);
      const m = svg.getScreenCTM();
      const to = (x, y) => {
        const d = new DOMPoint(x, y).matrixTransform(m);
        return [d.x, d.y];
      };
      return {
        from: to(handle.cx.baseVal.value, handle.cy.baseVal.value),
        to: to(p[0] + R * Math.cos(a), p[1] - R * Math.sin(a)),
      };
    },
    [ROOT, n],
  );
  if (!pts) return false;
  await page.mouse.move(...pts.from);
  await page.mouse.down();
  await page.mouse.move(...pts.to, { steps: 10 });
  await page.mouse.up();
  return true;
}

/**
 * `angles` — per round, as a student: on each triangle he measures, the protractor on two vertices of whole degrees
 * (a's first two, b's last two: the world writes a different third), the needle set by the ‹ › « » buttons (round 1,
 * with a reading one degree short first: « l'aiguille n'est pas sur le côté »), by a DRAG let go on the side, by ← → and
 * by the range input's keys; then his prediction (the truth computed here, wrong on purpose on round 2) and the slide.
 * Checked: the third angle always « Ĉ = 180° − a° − b° = c° » in the order he read (computed here, never a partial sum),
 * a drawn triangle's sum with its three terms, a round without protractor writes its one angle and no third side; the
 * slide's verdict (`data-iq-verdict` covers | apart | open, `data-iq-ghost`), its quotient « b ÷ a » never evaluated,
 * his hit / miss; the screen's numbers, one round per screen.
 */
export async function anglesExperiment(ctx, spec) {
  const { w, page } = ctx;
  await tellsNothing(w, page, `${ctx.name}, the opening`, ctx.forbid(), ROOT);
  const earlier = [];
  let way = 0;
  for (const [i, r] of spec.rounds.entries()) {
    const tag = `${ctx.name}, round ${i + 1}`;
    await waitIq(
      page,
      (n) => window.__inquiry?.kind === 'angles' && window.__inquiry.i === n && window.__inquiry.stage !== 'slid',
      i,
    );
    const tri = { a: triOfRound(r, 'a'), b: triOfRound(r, 'b') };
    const names = [tri.a.names, tri.b.names];
    const allowed = [q('180')];
    for (const t of Object.values(tri)) {
      if (t.between) allowed.push(...t.between.sides, t.between.angle);
      else allowed.push(...t.angles, ...(t.side ? [t.side] : []), ...(t.closes ? [] : [t.sum]));
      allowed.push(...t.given);
    }
    const open = await roundScreen(ctx, `${tag}, its opening`, allowed, names, earlier);
    w.check(open.left === 0, `${tag}: the round opens with no verdict on screen`);
    for (const t of measuredIn(r)) {
      const T = tri[t];
      w.expect(T.closes, `${tag}: a triangle he measures closes (${write(T.sum)}°)`);
      const order = (t === 'a' ? [0, 1, 2] : [1, 2, 0]).filter((v) => q(T.angles[v]).d === 1n).slice(0, 2);
      w.expect(order.length === 2, `${tag}: two angles of ${T.names} are whole degrees — the protractor can read them`);
      for (const v of order) {
        const n = Number(q(T.angles[v]).n);
        const at = `${tag}, ${T.names[v]} = ${n}°`;
        await page.click(`${ROOT} [data-iq-vertex="${T.names[v]}"][data-iq-tri="${t}"]`);
        await waitIq(page, ([t, v]) => window.__inquiry?.at?.t === t && window.__inquiry.at.v === v, [t, v]);
        const read = (await iq(page)).read[t].length;
        const how = way % 4;
        way += 1;
        if (how === 0) {
          for (let k = 0; k < Math.floor(n / 10); k += 1) await page.click(`${ROOT} [data-iq-turn="10"]`);
          for (let k = 0; k < n % 10; k += 1) await page.click(`${ROOT} [data-iq-turn="1"]`);
          if (i === 0 && read === 0 && t === 'a') {
            // one degree short, read: the needle is not on the side — a fact, then one more degree
            await page.click(`${ROOT} [data-iq-turn="-1"]`);
            await waitIq(page, (x) => window.__inquiry?.needle === x, n - 1);
            await fits(ctx, `${ctx.name}-protractor`);
            await page.click(`${ROOT} [data-iq-read]`);
            await page.waitForSelector(`${ROOT} [data-iq-off]`);
            const said = (await page.textContent(`${ROOT} [data-iq-off]`)) ?? '';
            const s = await iq(page);
            w.check(
              s.read[t].length === 0 && s.misreads === 1 && !WRONG.test(said),
              `${at}: read at ${n - 1}°, the needle is not on the side — said as a fact (« ${flat(said)} »), nothing read`,
            );
            await page.click(`${ROOT} [data-iq-turn="1"]`);
          }
        } else if (how === 1) {
          const ok = await dragNeedle(page, n);
          w.check(ok, `${at}: the protractor's needle can be dragged`);
          await page.waitForFunction((x) => window.__inquiry?.needle === x, n, { timeout: 2000 }).catch(() => {});
          const got = await needleNow(page);
          w.check(got === n, `${at}: the needle dragged onto the side and let go reads ${n}° (${got}°)`);
        } else if (how === 2) {
          for (let k = 0; k < n; k += 1) await page.keyboard.press('ArrowRight');
        } else {
          await page.focus(`${ROOT} [data-iq-needle]`);
          await page.keyboard.press('Home');
          for (let k = 0; k < n; k += 1) await page.keyboard.press('ArrowRight');
        }
        if ((await needleNow(page)) !== n) {
          // the way he tried did not land: the range input's keys, so the walk goes on (the check above says it)
          await page.focus(`${ROOT} [data-iq-needle]`);
          await page.keyboard.press('Home');
          for (let k = 0; k < n; k += 1) await page.keyboard.press('ArrowRight');
        }
        await waitIq(page, (x) => window.__inquiry?.needle === x, n);
        const shown = await page.getAttribute(`${ROOT} [data-iq-reading]`, 'data-iq-reading');
        w.check(Number(shown) === n, `${at}: the protractor shows ${n}° (${shown})`);
        await page.click(`${ROOT} [data-iq-read]`);
        await waitIq(page, ([t, k]) => window.__inquiry?.read?.[t]?.length === k, [t, read + 1]);
      }
      // the world writes the third angle, its three terms, in the order he read
      const k = [0, 1, 2].find((x) => !order.includes(x));
      const line = await page.evaluate(
        ([s, t]) => {
          const el = document.querySelector(`${s} [data-iq-line="${t}"]`);
          return { third: el?.dataset.iqThird ?? '', text: el?.querySelector('.katex-html')?.textContent ?? '' };
        },
        [ROOT, t],
      );
      const want = `${T.names[k]}=180°-${write(T.angles[order[0]])}°-${write(T.angles[order[1]])}°=${write(T.angles[k])}°`;
      w.check(
        tight(line.text).includes(want) &&
          !tight(line.text).includes('+') &&
          line.third !== '' &&
          eq(line.third, T.angles[k]),
        `${tag}: the world writes the third angle of ${T.names} as « ${want} », computed here (« ${tight(line.text)} »)`,
      );
    }
    // the lines of the triangles he does not measure: drawn (three angles and their sum) or one angle between two sides
    for (const t of ['a', 'b'].filter((x) => !measuredIn(r).includes(x))) {
      const T = tri[t];
      const text = tight(
        await page.evaluate(
          ([s, t]) => document.querySelector(`${s} [data-iq-line="${t}"] .katex-html`)?.textContent ?? '',
          [ROOT, t],
        ),
      );
      if (T.between) {
        const want = `${T.names[0]}=${write(T.between.angle)}°`;
        w.check(
          text === want,
          `${tag}: ${T.names}: the masons write only the angle between its two sides, « ${want} » (« ${text} »)`,
        );
      } else {
        const want = `=${T.angles.map((x) => `${write(x)}°`).join('+')}=${write(T.sum)}°`;
        w.check(
          text.endsWith(want),
          `${tag}: ${T.names} drawn by the world, its sum with three terms « …${want} », computed here (« ${text} »)`,
        );
      }
    }
    await waitIq(page, () => window.__inquiry?.stage === 'predict');
    await roundScreen(ctx, `${tag}, before the slide`, allowed, names, earlier);
    if (i === 0) await fits(ctx, `${ctx.name}-predict`);
    const slid = slideFact(tri.a, tri.b);
    let say = slid.fact === 'covers' ? 'same' : 'other';
    if (i === 1) say = say === 'same' ? 'other' : 'same';
    await page.click(`${ROOT} [data-iq-say="${say}"]`);
    await page.click(`${ROOT} [data-iq-slide]`);
    await page.waitForSelector(`${ROOT} [data-iq-verdict]`);
    // the slide drawn over the triangles, its animation ended before anything is measured
    await page
      .waitForFunction(
        (s) => {
          const g = document.querySelector(`${s} [data-iq-ghost]`);
          return !g || g.getAnimations().every((a) => a.playState === 'finished');
        },
        ROOT,
        { timeout: 5000 },
      )
      .catch(() => {});
    const out = await page.evaluate((s) => {
      const v = document.querySelector(`${s} [data-iq-verdict]`);
      return {
        verdict: v?.dataset.iqVerdict,
        fact: v?.querySelector('[data-iq-fact]')?.dataset.iqFact,
        ghost: document.querySelector(`${s} [data-iq-ghost]`)?.dataset.iqGhost ?? null,
        said: v?.textContent ?? '',
      };
    }, ROOT);
    w.check(
      out.verdict === slid.fact && out.ghost === (slid.fact === 'open' ? null : slid.fact),
      `${tag}: the slide ${slid.fact === 'open' ? 'cannot happen — a triangle does not close' : slid.fact === 'covers' ? 'COVERS the other triangle' : 'does not cover the other triangle'} (computed here; ${out.verdict}, ghost ${out.ghost})`,
    );
    w.check(
      out.fact === ((say === 'same') === (slid.fact === 'covers') ? 'hit' : 'miss') && !WRONG.test(out.said),
      `${tag}: said « ${say} » — ${out.fact}, said as a fact (« ${flat(out.said).slice(0, 80)} »)`,
    );
    const chain = tight(await shownText(page, `${ROOT} [data-iq-verdict] .np-iq__chain`));
    if (slid.fact !== 'open' && slid.top != null)
      w.check(
        chain.includes(`${write(slid.top)}÷${write(slid.bottom)}`),
        `${tag}: the slide multiplies by « ${write(slid.top)} ÷ ${write(slid.bottom)} », never evaluated (« ${chain} »)`,
      );
    else {
      // a triangle that cannot close shows its sum against 180° (« 225° ≠ 180° », `data-iq-open-sum` — gate B,
      // 2026-11-27): that line is not a quotient; KaTeX's « ≠ » reads as « = » in the page's text
      const open = tight(await shownText(page, `${ROOT} [data-iq-verdict] [data-iq-open-sum]`));
      const rest = open ? chain.replace(open, '') : chain;
      w.check(
        rest === '' && (!open || /^\d+(?:,\d+)?°\D{1,3}180°$/u.test(open)),
        `${tag}: no slide, no quotient written (« ${chain} » — the open sum « ${open} », ${JSON.stringify([...open].map((c) => c.codePointAt(0).toString(16)))})`,
      );
    }
    await roundScreen(ctx, `${tag}, slid`, allowed, names, earlier);
    await fits(ctx, `${ctx.name}-slid-${i + 1}`);
    await tellsNothing(w, page, tag, ctx.forbid(), ROOT);
    earlier.push(...names.filter((n) => !earlier.includes(n)));
    if (i < spec.rounds.length - 1) await page.click(`${ROOT} [data-iq-next]`);
  }
}
