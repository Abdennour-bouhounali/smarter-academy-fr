// The pyramids world (`gameworld/nilePyramids/`, GAME_WORLD.md §2ter-4, PYRAMIDS_WORLD_PLAN.md §2.5) in the lesson walk: its
// gestures, its STORY played from the world's own stages (`Game.js › stageData`, read for the QUESTION: which step, from
// which stake, towards which — never its target), the felucca's legs and the practice levels on the kit's rail
// (../gateRun.mjs), the forges (../forge.mjs) and their experiments (./nilePyramidsExperiments.mjs).
//
// BY HAND, as a student: the start button; E at a stake, a table, a dock, the ramp, the box; ← → TAPPED and HELD on the rope until
// the knot stands where the walk computed it — and released THERE (a hand stops on a knot); the order's box; the
// mission's and the box's lines; the top view's button; the keys that walk Zero (each stage: → walks him to the right of
// the screen, ← to its left — owner, 2026-11-24). BY THE DEV HANDLE: Zero PLACED beside a place (`hero.pos`); the clock
// fast-forwarded; the state READ for the question (the stage, the step's kind and stakes, the drawn points). Every length
// the walk types or stops at is computed HERE (./thales.mjs, ./exact.mjs) from the record, the register's rows and the
// drawn points — a length read off the drawing is what the rope would read there.
import { createWalk } from '../../walk.mjs';
import { namesOf, WORLD_LESSONS } from '../../lessonWords.mjs';
import * as checks from '../checks.mjs';
import { playForge } from '../forge.mjs';
import { playRail, railPractice } from '../gateRun.mjs';
import { worldOf } from '../world.mjs';
import { q, sub, write } from './exact.mjs';
import { slashFractions } from './rootCourtsTerraces.mjs';
import { solveLength } from './thales.mjs';

// the words are the country's (../checks.mjs): this player holds none
const { worldShot, wordsRe, WRONG_WORD: WRONG_WORDS } = checks;
/** The nouns of the other worlds that this world never says (none where the country's checks list none). */
const OTHER_NOUNS = checks.OTHER_WORLD_NOUNS?.['nile-pyramids'] ?? null;
const STAGES = ['field', 'workshop', 'river', 'summit', 'plateau'];

/** Every string inside a value (functions left out). */
function stringsOf(v, out = [], seen = new Set()) {
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object' && !seen.has(v)) {
    seen.add(v);
    for (const x of Object.values(v)) stringsOf(x, out, seen);
  }
  return out;
}

export const NILE_PYRAMIDS = {
  id: 'nile-pyramids',
  story: (L, D, opts) => npStoryWalk(L, D, opts),
  /** The hub's « continue practising »: a level is a trip of the felucca on the kit's rail, crocodiles in the lanes. */
  practice: (args) => railPractice(args),
  foreignWords(L, extra = []) {
    const own = stringsOf([L.lesson, L.script, L.memo, L.config]).join('\n');
    const out = new Set();
    for (const id of WORLD_LESSONS) for (const n of namesOf(id)) if (!own.includes(n)) out.add(n);
    for (const x of extra) if (!own.includes(x)) out.add(x);
    return [...out];
  },
  textRules: [
    ...(OTHER_NOUNS ? [{ re: OTHER_NOUNS, what: 'no noun of another world (the islands, the root courts)' }] : []),
    { on: slashFractions, what: 'every fraction over a real bar — no text « p/q »' },
  ],
};

// ───────────────────────────── the gestures ─────────────────────────────
export function npWorld(w, page, L) {
  const base = worldOf(w, page, L);
  const { expect, check } = w;
  /** The clock forward — after a tablet's flight to the rules button (real time, kit/Tablet.jsx) has ended. */
  const ff = async (sec) => {
    const flying = await page.evaluate(() =>
      [...document.querySelectorAll('.di-card')].some((c) => c.style.transform.includes('scale(0.05)')),
    );
    if (flying)
      await page
        .waitForFunction(
          () => ![...document.querySelectorAll('.di-card')].some((c) => c.style.transform.includes('scale(0.05)')),
          null,
          { timeout: 3000 },
        )
        .catch(() => {});
    await base.ff(sec);
  };
  const s = () =>
    page.evaluate(() => {
      const g = window.__world;
      const x = g.getState();
      return {
        phase: x.phase,
        at: x.at,
        overlay: x.overlay?.type ?? null,
        o: x.overlay,
        keys: x.keys,
        objective: x.objective ?? '',
        rope: x.rope,
        verdict: x.verdict,
        top: Boolean(x.top),
        say: x.say?.text ?? '',
        onTop: Boolean(g.onTop),
      };
    });
  /** The step he is at — its kind and its places only (never its target, nor an order's truth). */
  const step = () =>
    page.evaluate(() => {
      const g = window.__world;
      const st = g.stepNow();
      if (!st) return null;
      const { id, kind, from, toward, stake, at, order, seg, edge, sight, canal, ghost, stick, shadow, base, key } = st;
      return { id, kind, from, toward, stake, at, order, seg, edge, sight, canal, ghost, stick, shadow, base, key };
    });
  const pts = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__np.points())));
  /** Zero placed beside a place of the stage he stands on (as the islands' walks place him at an altar). */
  const near = async (p, d = 1.1) => {
    await base.tp(p.x + d, p.z + d * 0.4);
    await ff(0.3);
  };
  const promptText = () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-di-wprompt]');
      return el && el.getBoundingClientRect().width ? el.textContent.trim() : null;
    });
  /** E at a place: its prompt shows first (nothing acts without one). */
  const actAt = async (p, what, d) => {
    await near(p, d);
    const pr = await promptText();
    expect(pr, `${what}: the « press E » prompt shows there (« ${pr ?? ''} »)`);
    await base.act();
    await ff(0.2);
  };
  /** The knots the rope's chip shows — null once it is tied (read at once: never waiting for a chip that is gone). */
  const knots = async () => {
    const k = await page.evaluate(() => document.querySelector('[data-np-rope]')?.dataset.npRope ?? null);
    return k == null ? null : Number(k);
  };
  /**
   * The rope in his hand to `target` knots (null: as far as it goes — the edge built so far): one TAP finds which arrow
   * lengthens it, the arrow is HELD until two knots before, released, then tapped knot by knot; released on the stake's
   * knot, it ties. Returns the knots where it tied.
   */
  const slideTo = async (target, label) => {
    await page.waitForSelector('[data-np-rope]', { timeout: 8000 });
    let grow = 'ArrowRight';
    await page.keyboard.press(grow);
    await ff(0.06);
    if ((await knots()) === 0) {
      grow = 'ArrowLeft';
      await page.keyboard.press(grow);
      await ff(0.06);
    }
    expect((await knots()) === 1, `${label}: one tap is one knot (${await knots()})`);
    const back = grow === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
    if (target === 'probe') {
      // the stick's shadow on the ground: knot by knot until the knot stands on its tip (the rope ties there)
      for (let n = 0; n < 12 && (await knots()) != null; n += 1) {
        await page.keyboard.press(grow);
        await ff(0.1);
      }
      await ff(0.3);
      return (await knots()) == null;
    }
    if (target == null || target > 4) {
      const t0 = Date.now();
      await page.keyboard.down(grow);
      // the key held: the world's clock runs in the page until the knot is two before the stake (or stops: the end of
      // what is built), read from the rope's chip — one call, not one per frame
      const k0 = await page.evaluate(
        async (stop) => {
          const g = window.__world;
          let last = -1;
          let still = 0;
          for (let n = 0; n < 900; n += 1) {
            g.step(0.04);
            await null;
            const k = g.getState().rope?.knots;
            if (k == null) return { k: null, n };
            if (stop != null && k >= stop) return { k, n };
            still = k === last ? still + 1 : 0;
            if (stop == null && still >= 8) return { k, n };
            last = k;
          }
          return { k: last, n: 900, phase: g.getState().phase, held: g.hold?.s, axis: g.input.axis() };
        },
        target == null ? null : target - 2,
      );
      console.log(
        `NOTE  ${label}: held ${k0.n} frames to the knot ${k0.k} in ${Date.now() - t0} ms ${k0.n >= 900 ? JSON.stringify(k0) : ''}`,
      );
      await page.keyboard.up(grow);
      await ff(0.08);
    }
    const t1 = Date.now();
    for (let n = 0; n < 400 && (await knots()) != null; n += 1) {
      const k = await knots();
      if (n % 25 === 24) console.log(`NOTE  ${label}: the knot at ${k}, towards ${target}`);
      if (target != null && k === target) {
        await ff(0.08);
        continue;
      }
      await page.keyboard.press(target == null || k < target ? grow : back);
      await ff(0.08);
    }
    console.log(`NOTE  ${label}: tapped to the stake in ${Date.now() - t1} ms`);
    await ff(0.3);
    return (await knots()) == null;
  };
  /** The card of the ONE order: his number typed, sent. */
  const order = async (value, label) => {
    await page.waitForSelector('[data-np-order]', { timeout: 6000 });
    const kind = await page.getAttribute('[data-np-order]', 'data-np-order');
    if (kind === 'capstone') {
      const [n, d] = String(value).split('/');
      await page.fill('[data-np-order-n]', n);
      await page.fill('[data-np-order-d]', d ?? '1');
    } else await page.fill('[data-np-order-in]', String(value));
    await w.shot(page, `${label}-order`, { exit: ['[data-np-order-later]', '[data-di-exit]'], numbers: true });
    await page.click('[data-np-order-send]');
    await ff(0.3);
    return kind;
  };
  /** After an order the world BUILDS (a course, the ferry rope, the capstone): wait for it, read its fact. */
  const built = async () => {
    for (let n = 0; n < 40; n += 1) {
      const x = await s();
      if (x.phase === 'play' && x.verdict) return x.verdict;
      await ff(0.25);
    }
    return (await s()).verdict;
  };
  return { ...base, ff, s, step, pts, near, actAt, knots, slideTo, order, built, promptText, check };
}

const dist = (a, b) => Math.hypot(a.x - b.x, (a.y ?? 0) - (b.y ?? 0), a.z - b.z);

// ───────────────────────────── the story ─────────────────────────────
export async function npStoryWalk(L, D, opts) {
  const w = createWalk(`lesson-${L.id}-story`, opts);
  const { expect, check } = w;
  const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
  const keys = L.lesson.keys;
  const T0 = Date.now();
  const lap = (what) => console.log(`TIME  ${what}: ${Math.round((Date.now() - T0) / 1000)} s`);

  await w.run(async () => {
    const { page } = await w.student({ uid: D.uid ?? 9900, lessonId: L.id, url: L.url, grade: L.grade });
    const W = npWorld(w, page, L);
    const { s, ff } = W;
    const wordsOf = (key) => [...(D.forbidden?.[key] ?? []), L.lesson.rules[key].title];
    let earned = [];
    const forbid = () => wordsRe(keys.filter((k) => !earned.includes(k)).flatMap(wordsOf));
    // every screen of the story: never « wrong »
    const shot0 = w.shot;
    w.shot = async (pg, label, o) => {
      const t = await pg.evaluate(() => {
        const c = document.body.cloneNode(true);
        c.querySelectorAll('.di-title__eyebrow').forEach((e) => e.remove());
        return c.innerText ?? c.textContent;
      });
      const m = t.match(WRONG_WORDS);
      check(!m, `${label}: no screen says « wrong »${m ? ` — « ${m[0]} »` : ''}`);
      return shot0(pg, label, o);
    };
    const shotWorld = (label) => worldShot(w, page, label, forbid(), OUT);
    const ctx = { w, page, W, L, D, OUT, forbid, forbidOf: (k) => wordsRe(wordsOf(k)), startLabel: null, first: true };
    ctx.hook = async (name) => {
      const st = D.steps?.[name];
      if (st) {
        console.log(`NOTE  the lesson's own step « ${name} »`);
        await st(ctx);
      }
    };
    /**
     * The register's rows: id → the length written (« AM = 14 » → '14') — what the field register's card shows (read from
     * the world's state: an order's card covers the register while it is open).
     */
    const register = () =>
      page.evaluate(() =>
        Object.fromEntries(
          (window.__world.getState().register?.rows ?? []).map((r) => [
            r.id,
            r.tex.split('=').pop().replace(/\s/g, ''),
          ]),
        ),
      );

    /**
     * THE KEYS ARE HIS (owner, 2026-11-24): one tap of → turns Zero 5° to his right, one of ← 5° to his left; ↑ walks
     * him along where he faces; the lens stands behind him and turns with him — in every stage, after every framing.
     */
    const steering = async (label) => {
      await ff(1.5);
      const tap = (key, hold = 0.06) =>
        page.evaluate(
          async ([k, h]) => {
            const g = window.__world;
            const v0 = g.view;
            const p0 = { x: g.hero.pos.x, z: g.hero.pos.z };
            window.dispatchEvent(new KeyboardEvent('keydown', { code: k, key: k }));
            for (let t = 0; t < h; t += 0.02) {
              g.step(0.02);
              await null;
            }
            window.dispatchEvent(new KeyboardEvent('keyup', { code: k, key: k }));
            for (let t = 0; t < 1.6; t += 0.04) {
              g.step(0.04);
              await null;
            }
            g.camera.updateMatrixWorld();
            const e = g.camera.matrixWorld.elements; // the lens looks along −z of its own frame
            const look = { x: -e[8], z: -e[10] };
            const l = Math.hypot(look.x, look.z) || 1;
            const d = { x: g.hero.pos.x - p0.x, z: g.hero.pos.z - p0.z };
            const f = { x: Math.sin(g.view), z: Math.cos(g.view) };
            return {
              turned: ((v0 - g.view) * 180) / Math.PI,
              moved: Math.hypot(d.x, d.z),
              along: d.x * f.x + d.z * f.z,
              behind: (look.x * f.x + look.z * f.z) / l,
            };
          },
          [key, hold],
        );
      const r = await tap('ArrowRight');
      check(
        Math.abs(r.turned - 5) <= 0.5 && r.moved < 0.05,
        `${label}: one tap of → turns Zero 5° to his right, on the spot (${r.turned.toFixed(2)}°)`,
      );
      const l = await tap('ArrowLeft');
      check(
        Math.abs(l.turned + 5) <= 0.5 && l.moved < 0.05,
        `${label}: one tap of ← turns him 5° to his left (${l.turned.toFixed(2)}°)`,
      );
      const f = await tap('ArrowUp', 0.4);
      check(
        f.moved > 0.3 && f.along > 0.95 * f.moved && Math.abs(f.turned) < 0.01,
        `${label}: ↑ walks him along where he faces (${f.along.toFixed(2)} of ${f.moved.toFixed(2)} m)`,
      );
      check(f.behind > 0.9, `${label}: the lens stands behind him, looking where he faces (${f.behind.toFixed(2)})`);
    };

    /** The top view of the stage: the whole figure from above, its lengths written, none over another. */
    const topView = async (label) => {
      const btn = '[data-np-top="off"]';
      expect((await page.locator(btn).count()) === 1, `${label}: the top view's button is on screen`);
      await page.click(btn);
      await ff(2.2);
      const x = await s();
      expect(x.top, `${label}: the camera rises over the stage (state top)`);
      const rects = await page.evaluate(() => window.__np.labelRects());
      const meet = (a, b) => Math.abs(a.x - b.x) * 2 < a.w + b.w - 1 && Math.abs(a.y - b.y) * 2 < a.h + b.h - 1;
      const over = [];
      for (let i = 0; i < rects.length; i += 1)
        for (let j = i + 1; j < rects.length; j += 1) if (meet(rects[i], rects[j])) over.push([i, j]);
      check(
        rects.length >= 3 && over.length === 0,
        `${label}: ${rects.length} labels written over the figure, none over another${over.length ? ` (${over.length} pairs meet)` : ''}`,
      );
      // a TRUE view from above: the lens looks straight down, narrow (the plateau's was oblique, the pyramid over the figure)
      const lens = await page.evaluate(() => {
        const c = window.__world.camera;
        const d = c.getWorldDirection(new c.position.constructor());
        return { down: -d.y, fov: c.fov };
      });
      check(
        lens.down > 0.999 && lens.fov <= 20.5,
        `${label}: the lens looks straight down (${lens.down.toFixed(4)}), narrow (${lens.fov.toFixed(1)}°)`,
      );
      // nothing of the page over a label: Zero's bubble is not drawn, the cards and the instruction leave them free
      const hud = await page.evaluate(() => {
        const box = document.querySelector('canvas').getBoundingClientRect();
        return {
          say: document.querySelectorAll('.di-say').length,
          rects: [...document.querySelectorAll('.np-register, .di-recall, .di-instruction, .np-top')]
            .map((e) => e.getBoundingClientRect())
            .filter((r) => r.width > 0)
            .map((r) => ({
              x: r.left - box.left + r.width / 2,
              y: r.top - box.top + r.height / 2,
              w: r.width,
              h: r.height,
            })),
        };
      });
      check(hud.say === 0, `${label}: Zero's bubble is not drawn while the top view is open`);
      const under = rects.filter((r) => hud.rects.some((h) => meet(r, h)));
      check(under.length === 0, `${label}: no label under a card, the instruction or the button (${under.length})`);
      // a label's glyphs: 64 of its 96 canvas rows (scenery.js › makeLabel)
      const small = rects.filter((r) => (r.h * 64) / 96 < 17.5);
      check(
        small.length === 0,
        `${label}: every label's letters 18 px or more (${Math.min(...rects.map((r) => Math.round((r.h * 64) / 96)))} px the smallest)`,
      );
      await w.shot(page, label, { ...OUT, numbers: true });
      const before = await page.evaluate(() => ({ x: window.__world.hero.pos.x, z: window.__world.hero.pos.z }));
      await page.keyboard.down('ArrowUp');
      await ff(0.5);
      await page.keyboard.up('ArrowUp');
      const after = await page.evaluate(() => ({ x: window.__world.hero.pos.x, z: window.__world.hero.pos.z }));
      check(dist(before, after) < 0.05, `${label}: Zero stays where he is while the top view is open`);
      await page.click('[data-np-top-back]');
      await ff(1.5);
      check(!(await s()).top, `${label}: the back-to-Zero button brings the camera back behind him`);
    };

    // ══ the title ══
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    if (L.config?.title)
      check(
        ((await page.textContent('.di-title__eyebrow').catch(() => '')) ?? '').includes(L.config.title),
        `the title names the lesson « ${L.config.title} »`,
      );
    await w.shot(page, 'title', OUT);
    ctx.startLabel = await W.start();
    expect((await s()).phase === 'play', 'the game starts in play phase');
    await ff(0.8);
    lap('title');

    /** Plays the steps of the stage he stands on until only the dock is left. */
    const playStage = async (i) => {
      const P = (await W.pts())[['field', 'ws', 'river', 'summit', 'plateau'][i]];
      const done = {};
      let wrongCourse = false;
      let wrongMission = false;
      let wrongBox = false;
      for (let guard = 0; guard < 40; guard += 1) {
        const st = await W.step();
        if (!st) break;
        const tag = `${STAGES[i]}-${st.id.replace(/\?/g, 'q')}`;
        const obj = (await s()).objective;
        check(obj.length > 10, `${tag}: the instruction says what to do (« ${obj.slice(0, 80)} »)`);
        if (st.kind === 'slide') {
          const from = st.edge ? P.B : P[st.from];
          await W.actAt(from, tag);
          expect((await s()).rope, `${tag}: E at ${st.from}: the rope's end in his hand`);
          // where the hand stops: on the stake (the drawn distance), where S hides F, where the drawn triangle's
          // shadow tip meets A — or as far as what is built
          let target = null;
          if (st.stake && P[st.stake]) target = Math.round(dist(P[st.from], P[st.stake]));
          else if (st.sight) {
            const { E, S, F } = P;
            const u = (E.z - F.z) / (S.z - F.z);
            target = Math.round(F.x + u * (S.x - F.x) - E.x);
          } else if (st.ghost) {
            // the stick's shadow he measured (the register's « AM = … » of this stage)
            const am = await page.evaluate(
              () =>
                window.__world
                  .getState()
                  .register?.rows.find((r) => /^AM =/.test(r.tex))
                  ?.tex.split('=')[1],
            );
            target = Math.round(dist(P[st.from], P[st.toward]) - Number(String(am).trim().replace(',', '.')));
          } else if (st.stick) target = 'probe';
          if (i === 0 && st.id === 'AM') await shotWorld(`${tag}-rope`);
          const tied = await W.slideTo(target, tag);
          expect(tied, `${tag}: released on ${target ?? 'the last built course'}, the rope ties`);
          await ff(0.4);
          const reg = await register();
          if (st.seg && reg[st.id] != null && typeof target === 'number')
            check(
              q(reg[st.id]).n === BigInt(target),
              `${tag}: the register writes ${st.seg} = ${target} (« ${reg[st.id]} »)`,
            );
          if (st.canal) {
            const v = (await s()).verdict;
            const typed = done[`${st.id}?`];
            const want = q(typed).n * q(target).d === q(target).n * q(typed).d ? 'as' : null;
            check(
              v?.kind === 'canal' && (want ? v.fact === 'as' : v.fact !== 'as'),
              `${tag}: the rope reads ${st.seg} = ${target} against his ${typed}: « ${v?.fact} » (computed here)`,
            );
            await shotWorld(`${tag}-read`);
          }
          if (i === 4 && st.ghost) await shotWorld(`${tag}-meet`);
          continue;
        }
        if (st.kind === 'predict' || st.kind === 'order') {
          if (!(await page.locator('[data-np-order]').count())) {
            await page.waitForSelector('[data-np-order]', { timeout: 2500 }).catch(() => {});
            if (!(await page.locator('[data-np-order]').count())) await W.actAt(P[st.at], tag);
          }
          const reg = await register();
          const n = (k) => reg[k];
          let value;
          if (st.kind === 'predict') {
            // the 3AM chain he owns: the canal from the vertex A as BC × AM / AB
            const [m] = st.seg;
            const am = n(`A${m}`);
            const f = solveLength({ VM: am, VB: n('AB'), BC: n('BC') }, 'MN');
            // a length with no finite decimal writing is typed as he would: to one decimal
            value = /\//.test(write(f)) ? (Number(f.n) / Number(f.d)).toFixed(1).replace('.', ',') : write(f);
          } else if (st.order === 'course') {
            const bm = n(st.id === 'course' ? 'BM' : 'BM2');
            value = write(solveLength({ MB: bm, VB: n('SB'), BC: n('BC') }, 'MN'));
            if (!wrongCourse) {
              // first the course of the PIECE (BC × BM / SB): the world lays it, a gap round it
              wrongCourse = true;
              const piece = write(solveLength({ VM: bm, VB: n('SB'), BC: n('BC') }, 'MN'));
              await W.order(piece, `${tag}-piece`);
              const v = await W.built();
              check(v?.fact === 'gap', `${tag}: a course of ${piece} laid at the mark ${bm}: a GAP (${v?.fact})`);
              await shotWorld(`${tag}-gap`);
              await W.actAt(P[st.at], `${tag} again`);
            }
          } else if (st.order === 'mark') {
            const row = n('row');
            value = write(solveLength({ VB: n('SB'), MN: row, BC: n('BC') }, 'MB'));
          } else if (st.order === 'ferry') {
            // S between A and E on the bank, F across and R inland, both square to the bank: SE / SA = ER / AF
            value = write(solveLength({ VM: n('SE'), VB: n('AS'), MN: n('ER') }, 'BC', 'butterfly'));
          } else if (st.order === 'capstone') {
            const k = q(`${n('top')}`);
            const base = q(n('BC'));
            const r = { n: k.n * base.d, d: k.d * base.n };
            const g = (a, b) => (b === 0n ? a : g(b, a % b));
            const c = g(r.n, r.d);
            value = `${r.n / c}/${r.d / c}`;
          }
          const kind = await W.order(value, tag);
          if (st.kind === 'predict') {
            done[st.id] = value;
            const reg2 = await register();
            check(reg2[st.id] != null, `${tag}: his length ${value} is kept in the register for the rope to answer`);
          } else {
            const v = await W.built();
            if (kind === 'capstone') {
              // the capstone sits: Zero comes down the ramp to the masons' table (after 1,8 s of real time)
              await page.waitForTimeout(2200);
              for (let n = 0; n < 40 && ((await s()).onTop || (await s()).phase !== 'play'); n += 1) await ff(0.25);
            }
            check(
              ['fits', 'ties', 'sits'].includes(v?.fact),
              `${tag}: the ${kind} of ${value}, computed here, is built: « ${v?.fact} »`,
            );
            await shotWorld(`${tag}-built`);
          }
          continue;
        }
        if (st.kind === 'climb') {
          await W.actAt(P.ramp, tag);
          for (let n = 0; n < 30 && !(await s()).onTop; n += 1) await ff(0.25);
          expect((await s()).onTop, `${tag}: up the ramp, Zero stands on the summit`);
          await shotWorld(`${tag}-top`);
          continue;
        }
        if (st.kind === 'forge') {
          await W.actAt(P.table, tag);
          expect((await s()).overlay === 'forge', `${tag}: the masons' board opens the forge « ${st.key} »`);
          await playForge(ctx, st.key);
          ctx.first = false;
          earned = (await s()).keys;
          await ff(0.8);
          lap(`forge ${st.key}`);
          continue;
        }
        if (st.kind === 'mission' || st.kind === 'box') {
          await W.actAt(P[st.kind === 'box' ? 'box' : 'A'], tag, 2);
          await page.waitForSelector(`[data-np-${st.kind}]`, { timeout: 5000 });
          const lead = L.lesson.story.mission.lead.join(' ');
          const vals = st.kind === 'mission' ? D.mission(lead) : D.box(L.lesson.story.box.lead.join(' '), lead);
          const fill = async (v) => {
            for (const [nm, x] of Object.entries(v))
              if (await page.locator(`[data-np-${st.kind}] [data-rf-use="${nm}"]`).count())
                await page.fill(`[data-np-${st.kind}] [data-rf-use="${nm}"]`, String(x));
              else await page.click(`[data-np-${st.kind}] [data-kit-choice="${nm}"] [data-kit-option="${x}"]`);
          };
          const names = await page
            .locator(`[data-np-${st.kind}] [data-rf-use], [data-np-${st.kind}] [data-kit-choice]`)
            .evaluateAll((els) => els.map((e) => e.dataset.rfUse ?? e.dataset.kitChoice));
          check(
            names.every((x) => x in vals) && Object.keys(vals).every((x) => names.includes(x)),
            `${tag}: the walk fills every box of the card (${names.join(', ')})`,
          );
          if (st.kind === 'mission' && !wrongMission) {
            wrongMission = true;
            // the ratio upside down (AB / AM): Zero rises to the h he wrote — above the apex — then the card's fact
            const bad = { ...vals, rn: vals.rd, rd: vals.rn };
            await fill(bad);
            await w.shot(page, `${tag}-card`, { exit: ['[data-np-card-later]', '[data-di-exit]'], numbers: true });
            await page.click('[data-np-card-check]');
            for (let n = 0; n < 40 && (await s()).phase !== 'play'; n += 1) await ff(0.25);
            const said = (await s()).say;
            check(
              said.length > 8 && !WRONG_WORDS.test(said),
              `${tag}: the ratio upside down — the world answers with a fact (« ${said.slice(0, 90)} »)`,
            );
            await shotWorld(`${tag}-fact`);
            continue;
          }
          if (st.kind === 'box' && !wrongBox) {
            wrongBox = true;
            const k = Object.keys(vals).at(-1);
            await fill({ ...vals, [k]: write(sub(q(vals[k]), '-1')) });
            await page.click('[data-np-card-check]');
            await page.waitForSelector('[data-np-card-fact]', { timeout: 4000 });
            const f = ((await page.textContent('[data-np-card-fact]')) ?? '').trim();
            check(
              f.length > 8 && !WRONG_WORDS.test(f),
              `${tag}: a wrong last line is answered by a fact (« ${f.slice(0, 80)} »)`,
            );
            await w.shot(page, `${tag}-fact`, { exit: ['[data-np-card-later]', '[data-di-exit]'], numbers: true });
          }
          await fill(vals);
          await w.shot(page, `${tag}-right`, { exit: ['[data-np-card-later]', '[data-di-exit]'], numbers: true });
          await page.click('[data-np-card-check]');
          for (let n = 0; n < 50 && (await s()).phase !== 'play' && (await s()).phase !== 'end'; n += 1) await ff(0.25);
          if (st.kind === 'mission') await shotWorld(`${tag}-noon`);
          continue;
        }
        expect(false, `${tag}: a step the walk knows (${st.kind})`);
      }
    };

    for (let i = 0; i < STAGES.length; i += 1) {
      const x = await s();
      expect(x.at === i, `stage ${i + 1} « ${STAGES[i]} »: he stands at its dock (${x.at})`);
      await shotWorld(`${STAGES[i]}-arrive`);
      await steering(`${STAGES[i]}, on arriving`);
      if (i === 4) {
        // the plateau: its top view before the mission card (after it, noon and the end)
        await playStageUntil(i, 'mission');
        await topView(`top-${STAGES[i]}`);
      }
      await playStage(i);
      lap(`stage ${STAGES[i]}`);
      if (i === 0) {
        // a reload after the first key: he comes back on the field, the key kept
        await W.reload();
        const r = await s();
        check(r.at === 0 && r.keys.includes(keys[0]), `after a reload: on the field, the key « ${keys[0]} » kept`);
      }
      if (i === STAGES.length - 1) break;
      await topView(`top-${STAGES[i]}`);
      if (i === 3) await steering(`${STAGES[i]}, down the ramp`);
      // the dock: the felucca, its leg on the rail
      const dock = await page.evaluate((k) => {
        const p = window.__world.dockSpot(k);
        return { x: p.x, z: p.z };
      }, i);
      await W.actAt(dock, `dock ${i + 1}`, 0.3);
      await page.waitForSelector('[data-gr-start]', { timeout: 8000 });
      await w.shot(page, `leg-${i + 1}-ready`, { exit: ['[data-gr-leave]'], numbers: false });
      await page.click('[data-gr-start]');
      await ff(0.5);
      const res = await playRail(w, page, ff, D.run, {
        miss: i === 0 ? 2 : 0,
        label: `leg ${i + 1}`,
        OUT: { exit: ['[data-gr-leave]'], numbers: false },
        shots: i === 0 ? { 1: 'leg-1-buoy', fact: 'leg-1-fact' } : { 1: `leg-${i + 1}-buoy` },
      });
      check(res.won, `leg ${i + 1}: the felucca reaches the next dock (${res.score} buoys, ${res.hearts} hearts)`);
      await page.waitForSelector('[data-gr-run="over"] [data-gr-leave]', { timeout: 8000 });
      await w.shot(page, `leg-${i + 1}-over`, { exit: ['[data-gr-leave]'], numbers: false });
      await page.click('[data-gr-run="over"] [data-gr-leave]');
      await ff(1);
      lap(`leg ${i + 1}`);
    }

    /** Plays the plateau's slides only (until the step `stop`). */
    async function playStageUntil(i, stop) {
      const save = W.step;
      W.step = async () => {
        const st = await save();
        return st && st.id !== stop && st.kind !== stop ? st : null;
      };
      await playStage(i);
      W.step = save;
    }

    // ══ the end ══
    for (let n = 0; n < 40 && (await s()).overlay !== 'end'; n += 1) await ff(0.25);
    const end = await s();
    expect(end.overlay === 'end', `the box answered: the end (${end.phase}, ${end.overlay})`);
    check(end.keys.length === keys.length, `the four keys earned (${end.keys.join(', ')})`);
    await w.shot(page, 'end', OUT);
    lap('end');
  });
}
