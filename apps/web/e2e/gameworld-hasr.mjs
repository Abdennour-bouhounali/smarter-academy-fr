// « أرخبيل القواسم: ميناء الألواح » — walk of the game world of lesson `qisma-iqlidiya-hasr` (2AM, « القسمة
// الإقليدية وحصر حاصل القسمة ») as a 2AM STUDENT: its own story in the unit's world, PLAYED through its screens from the
// title to the end screen. Copied from lesson 3's gameworld-khawass.mjs.
//   island A (84, plank 12), then the ✕ of the top bar CLICKED inside the world: he leaves, comes back, and is where he was;
//   island B — THE RECALL (912, moulds 17 / 24 / 35, planks of two digits): a right prediction on a plank that leaves
//     cells, a WRONG prediction, the plank that fills it — and NO forge opens after it;
//   island C (4576, LONG moulds 208 / 248 / 365): a plank that leaves cells, the plank that fills it;
//   forge 1 « القسمة على أيّ عدد » opens on the investigation `estimate` (GAME_WORLD.md « استكشف ») — its ✕ is CLICKED
//     first: the forge cannot be skipped, it opens again at « واصل ». Five gaps divided on rulers whose marks are
//     multiples of a plank of three digits. The first ruler is sighted (a mark that PASSES the flag is pressed on it);
//     the four others are BLIND — no product under a mark before he presses — and one blind step is played as a student
//     does: a count too big (the world then writes its product, past what is left), a count too small (the next mark
//     still fits), then the right one; the two products he revealed stay under their marks. A 0 of planks is a step
//     too; his evidence is the single planks he tried; the mirror refutes a wrong rule (« the rounded plank judges ») on one of HIS trials, the robot's
//     experiment, then a rule that survives his evidence (« a whole plank left is fine ») is BROKEN by the mirror's attack
//     (`data-rf-broken`), then the right rule, its attacks, the seal, the last step (a remainder too big, then the
//     division — a gap of five digits, a plank of three);
//   5475 built (208 leaves cells, 365 fills it); forge 2 « حصر حاصل القسمة » opens on `bracket`: five gaps as a flag on a
//     line of multiples — a pair that passes the gap, a pair with a mark between its marks, the right pair, « between » /
//     « on a mark » (one wrong); the mirror refutes « full planks / planks needed » on HIS gap that a plank fills; the
//     right rule, attacks, seal, last step;
//   644 built, the gate dash, 1080 built, the stone's question (the boat's trips: a wrong pick, then the full and the
//     needed); forge 3 « انعدام الباقي » — the mirror ALONE: predictions (a miss, then three right), a wrong rule refuted
//     by one of his crumbled bridges, the right one, its attacks, the seal, the last step (a wrong verdict, then right);
//   the port's store (1872: 130 then 156, the wrong divisions, the price, its way out) and the end screen.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas left to
// right on one line, no word of another lesson (lib/hasr.mjs), a way out reachable, no text under 12 px (on by default).
// The numbers of other lessons are checked on the screens that show no computed number. Every investigation screen also:
// nothing leaves its frame, no button is covered (inquiryFits).
// The answers are computed HERE from the numbers on screen (the flag, the ruler, the gap, the plank); state hooks are read
// for the question (which gap, which step), never for the answer.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-hasr.mjs [outDir]
import { createWalk, FLOOR_PX } from './lib/walk.mjs';
import { ID as LESSON, GRADE, URL, HASR_FOREIGN, HASR_FOREIGN_NUMBERS, quo, ceilDiv } from './lib/hasr.mjs';

// the lesson is named HERE too: scripts/lesson-v2-status.mjs finds the walk that plays its world by its id
const ID = 'qisma-iqlidiya-hasr';
if (ID !== LESSON) throw new Error('lib/hasr.mjs walks another lesson');

const w = createWalk('gameworld-hasr', {
  foreign: HASR_FOREIGN,
  foreignNumbers: HASR_FOREIGN_NUMBERS,
});
const { expect, check } = w;
/** The way out of any screen of the world: the top bar's ✕, the forge's own ✕, the ✕ drawn over a dialog. */
const EXIT = ['[data-di-exit]', '.di-top a.di-icon'];
/** A screen that shows no number the walk did not choose: the numbers of other lessons are checked too. */
const OUT_N = { exit: EXIT, numbers: true };
/** A screen full of computed numbers (a ruler, a line of multiples, the mirror): words only. */
const OUT = { exit: EXIT };
/**
 * Is this written case what the planks really do? The walk's own arithmetic, for every kind of case of the mirrors:
 * a TRIAL (q planks of b tried on a cells left: they do not pass them, and no other plank fits after them), a bracket,
 * a bridge or a sentence about one.
 */
const truthOf = (c) =>
  c.kind === 'trial'
    ? c.a - c.b * c.q >= 0 && c.a - c.b * c.q < c.b
    : c.kind === 'bracket'
      ? c.b * c.n <= c.a && c.a < c.b * c.m && c.m === c.n + 1
      : c.a % c.b === 0;
/**
 * What two WRONG rules of the first forge say of a trial — written here from their tiles, never read from the lesson:
 *   « the rounded plank judges »   the count is multiplied by the plank rounded to its nearest hundred, and judged by it;
 *   « a whole plank left is fine » the plank itself, but the count is too small only when MORE than a plank is left.
 */
const nearSays = (c) => {
  const p = Math.round(c.b / 100) * 100;
  return !(p * c.q > c.a) && !(c.a - p * c.q >= p);
};
const overSays = (c) => !(c.b * c.q > c.a) && !(c.a - c.b * c.q > c.b);
await w.run(async () => {
  const { page } = await w.student({ uid: 9701, lessonId: ID, url: URL, grade: GRADE });
  const shot = (label, opts = OUT) => w.shot(page, label, opts);
  const ff = (sec) => w.ff(page, sec);
  const st = () =>
    page.evaluate(() => {
      const s = window.__world.getState();
      return {
        phase: s.phase,
        stage: s.stage,
        overlay: s.overlay?.type ?? null,
        o: s.overlay,
        held: s.held,
        stars: s.stars,
        keys: s.keys,
        objective: s.objective,
      };
    });
  const tp = (x, z) =>
    page.evaluate(
      ([px, pz]) => {
        const h = window.__world.hero;
        h.pos.set(px, 0, pz);
        h.vel.set(0, 0, 0);
        h.grounded = true;
      },
      [x, z],
    );
  const act = async () => {
    await page.keyboard.press('KeyE');
    await ff(0.2);
  };
  /** Goes to the pedestal of mould b on the current island and takes it. */
  const take = async (b) => {
    const p = await page.evaluate((bb) => {
      const g = window.__world;
      const i = g.hero.island;
      const ped = g.isl[i].pedestals.find((q) => q.b === bb);
      const d = g.exitDir(i);
      return ped ? [ped.x - d.dx * 1.5, ped.z - d.dz * 1.5] : null;
    }, b);
    expect(p, `pedestal ${b} exists on island ${(await st()).stage}`);
    await tp(p[0], p[1]);
    await ff(0.15);
    await act();
    expect((await st()).held === b, `holds mould ${b}`);
  };
  const toAltar = async (i) => {
    const p = await page.evaluate((k) => {
      const g = window.__world;
      const a = g.segs[k].altarWorld;
      const isl = g.isl[k];
      return [a.x, a.z, isl.x, isl.z];
    }, i);
    const d = Math.hypot(p[2] - p[0], p[3] - p[1]);
    await tp(p[0] + ((p[2] - p[0]) / d) * 1.6, p[1] + ((p[3] - p[1]) / d) * 1.6);
    await ff(0.15);
  };
  /**
   * Forges on bridge i with the held mould. A prediction is answered with the true remainder (computed here from the gap
   * and the plank of the question) — or, with `wrongGuess`, with another of the offered remainders.
   */
  const forge = async (i, wrongGuess = false) => {
    await toAltar(i);
    await act();
    // every bridge of the story asks a prediction first — except the very first one (84 with its one plank)
    const asks = (await st()).overlay === 'predict';
    expect(
      asks === (i !== 0),
      `bridge ${i}: ${i === 0 ? 'no prediction is asked on the first bridge' : 'the world asks his prediction before it builds'}`,
    );
    if (asks) {
      const o = (await st()).o;
      const r = o.a % o.b;
      const pick = wrongGuess ? o.options.find((v) => v !== r) : r;
      expect(o.options.includes(r), `the prediction of ${o.a} with the plank ${o.b} offers its true remainder ${r}`);
      await page.click(`[data-di-predict="${pick}"]`);
    }
    await ff(1.5);
  };
  const cross = async (i) => {
    const p = await page.evaluate((k) => {
      const s = window.__world.segs[k];
      return { sx: s.sx, sz: s.sz, dx: s.dx, dz: s.dz, len: s.len };
    }, i);
    await tp(p.sx + p.dx, p.sz + p.dz);
    await ff(0.1);
    await page.keyboard.down('ArrowUp');
    await ff(p.len / 6.2 + 1.2);
    await page.keyboard.up('ArrowUp');
    await ff(0.3);
  };
  /**
   * Plays the world on until the forge is over. A long bridge lays ~50 planks (912 / 17, 95 / 2): with the fall of a wrong
   * one its forge lasts ~10 s of game time, longer than a fixed ff(8) — and an « E » pressed while the phase is still
   * `forge` is dropped by the runtime (kit/WorldRuntime.js › step: `if (ph !== 'play') this.input.take('act')`).
   */
  const settle = async (max = 30) => {
    for (let t = 0; t < max && (await st()).phase === 'forge'; t += 0.5) await ff(0.5);
  };
  /** A bridge built from its altar: `wrong` first (it must crumble), then `right` (it must hold). */
  const bridge = async (i, id, a, wrong, right) => {
    if (wrong != null) {
      await take(wrong);
      await forge(i);
      await ff(8);
      await settle();
      await page.waitForTimeout(300);
      expect(
        !(await st()).stars[id],
        `planks of ${wrong} leave cells over ${a} (${a} = ${wrong} × ${quo(a, wrong)} + ${a % wrong}): the bridge crumbles`,
      );
    }
    await take(right);
    await forge(i);
    await ff(8);
    await settle();
    expect((await st()).stars[id] >= 1, `bridge ${a} holds with planks of ${right} (${a} = ${right} × ${a / right})`);
  };

  // ── the forges: what all three share ──
  const fg = () => page.evaluate(() => window.__forge);
  const iq = () => page.evaluate(() => window.__inquiry);
  const fact = async () => (await page.textContent('[data-iq-fact]')) ?? '';
  /** What the world plays during `fn` (the sounds are recorded — a walk has no ear). */
  const hear = async (fn) => {
    await page.evaluate(() => {
      const a = window.__world.audio;
      window.__heard = [];
      if (!a.__spied) {
        const real = a.play.bind(a);
        a.play = (name, p) => {
          window.__heard.push(name);
          return real(name, p);
        };
        a.__spied = true;
      }
    });
    await fn();
    return page.evaluate(() => window.__heard);
  };
  const fillUse = async (vals, verdict = null) => {
    for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
    if (verdict !== null) await page.click(`[data-rf-use-verdict="${verdict ? 'yes' : 'no'}"]`);
    await page.click('[data-rf-use-check]');
    await page.waitForSelector('[data-rf-use-fb]');
    return page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb');
  };
  /** From the mirror's attacks: each answered as the arithmetic says, then the seal and the last step — up to the tablet. */
  const attackToTablet = async (name, last) => {
    await page.waitForSelector('[data-rf="attack"]');
    await shot(`${name}-attack`);
    for (let i = 0; i < 6; i += 1) {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      await page.click(`[data-rf-say="${truthOf(c) ? 'yes' : 'no'}"]`);
      await page.click('[data-rf-fire]');
      await page.waitForSelector('[data-rf-survived]');
      const end = a.i + 1 >= a.list.length;
      await page.click('[data-rf-attack-next]');
      if (end) break;
      await page.waitForSelector('[data-rf-say]');
      await page.waitForTimeout(80);
    }
    await page.waitForSelector('[data-rf-sealed]');
    await shot(`${name}-sealed`);
    await page.click('[data-rf-seal]');
    await page.waitForSelector('[data-rf="use"]');
    await page.waitForTimeout(80);
    await last((await fg()).use.c);
    await page.waitForSelector('[data-di-my-rule]');
  };
  const finishForge = async (name, tiles, last) => {
    for (const t of tiles) await page.click(`[data-rf-tile="${t}"]`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]');
    await shot(`${name}-agreed`);
    await page.click('[data-rf-dare]');
    await attackToTablet(name, last);
  };
  /** The forge covers the top bar: its OWN ✕ and sound button are on screen, uncovered, and its header keeps one row. */
  const forgeTools = async (where) => {
    const t = await page.evaluate(() => {
      const seen = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return (
          r.width > 0 &&
          r.left >= 0 &&
          r.right <= window.innerWidth + 1 &&
          r.top >= 0 &&
          (el === top || el.contains(top))
        );
      };
      const head = document.querySelector('.rf-head');
      const kids = [...head.children].map((k) => k.getBoundingClientRect());
      const apart = kids.every((a, i) =>
        kids.every((b, j) => i >= j || a.right <= b.left + 1 || b.right <= a.left + 1),
      );
      return {
        exit: seen('.rf-root [data-di-exit]'),
        sound: seen('.rf-root [data-di-sound]'),
        apart,
        inScreen: kids.every((k) => k.left >= -1 && k.right <= window.innerWidth + 1),
      };
    });
    expect(
      t.exit && t.sound && t.apart && t.inScreen,
      `${where}: the forge shows its ✕ and its sound button, uncovered, beside its steps (${JSON.stringify(t)})`,
    );
  };
  /** An investigation screen: nothing leaves its frame, no button is covered, no text under 12 px — then the screenshot. */
  const inquiryFits = async (name) => {
    await page.waitForTimeout(250);
    const bad = await page.evaluate((FLOOR) => {
      const out = [];
      const frame = document.querySelector('.iq');
      if (!frame) return ['no investigation on screen'];
      const box = frame.getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit').style.zoom) || 1;
      for (const el of frame.querySelectorAll(
        'button, input, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-scene, .iq-found li, .iq-chips, .iq-tpl, .iq-askline',
      )) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)
          out.push(String(el.className?.baseVal ?? el.className).split(' ')[0] + ' leaves the frame');
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (top && !el.contains(top) && !top.contains(el))
            out.push(`covered: « ${(el.textContent || el.dataset.iqIn || '').trim().slice(0, 18)} »`);
        }
        if (
          el.textContent.trim() &&
          !el.querySelector('*:not(.katex):not(.katex *)') &&
          parseFloat(getComputedStyle(el).fontSize) * zoom < FLOOR
        )
          out.push('text under 12 px: ' + String(el.className).split(' ')[0]);
      }
      // the words and numbers drawn in the scene (SVG text: the ruler's marks, the flag, the line's marks) are read too
      for (const el of frame.querySelectorAll('svg text')) {
        const r = el.getBoundingClientRect();
        if (r.width && r.height < FLOOR * 0.9 && el.textContent.trim())
          out.push(`scene text under 12 px: « ${el.textContent.trim().slice(0, 20)} » (${r.height.toFixed(1)} px)`);
      }
      if (box.bottom > window.innerHeight + 1 || box.right > window.innerWidth + 1)
        out.push('the frame leaves the screen');
      for (const el of frame.querySelectorAll('*'))
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2)
          out.push('scrolls: ' + el.className);
      return [...new Set(out)];
    }, FLOOR_PX);
    check(
      bad.length === 0,
      `${name}: the investigation fits its frame — nothing cut, covered, scrolled or too small${bad.length ? ' — ' + bad.join(' | ') : ''}`,
    );
    await shot(name);
  };
  /** The investigation opens on its question and its goal, no tile and no prediction before he acts. */
  const opensOnQuestion = async (key, kind) => {
    const f = await fg();
    expect(
      f.key === key && f.phase === 'inquiry' && (await iq()).kind === kind,
      `the forge of « ${key} » opens on an INVESTIGATION (${kind})`,
    );
    expect(
      (await page.locator('[data-rf-tile]').count()) === 0 && (await page.locator('[data-rf-guess]').count()) === 0,
      `${kind}: no tile, no prediction before he acts`,
    );
    expect(
      (await page.textContent('[data-iq-goal]')).includes('الهدف') &&
        ((await page.textContent('.iq-lead')) ?? '').trim().length > 10,
      `${kind}: its question and its goal are on screen`,
    );
  };
  /** The tablet that closes a forge: his own rule, then the name of the key. */
  const tablet = async (n, title, also = null) => {
    await shot(`tablet-${n}`, OUT_N);
    expect(
      (await page.locator('[data-di-my-rule]').count()) === 1 && (await page.textContent('.di-card')).includes(title),
      `the tablet names the rule AFTER his own: « ${title} »`,
    );
    if (also) await also();
    await page.click('[data-di-tablet]');
    await ff(0.3);
    expect((await st()).keys.length === n, `${n} key(s) earned`);
  };

  /** Leaves the lesson by a ✕ (a real click), checks he is out, then comes back to the lesson's title screen. */
  const leaveBy = async (selector, where) => {
    const before = page.url();
    expect((await w.reachable(page, [selector])) !== null, `${where}: its ✕ is on screen and a click reaches it`);
    await page.click(selector);
    await page.waitForFunction((u) => window.location.href !== u, before, { timeout: 15000 });
    await page.waitForTimeout(400);
    expect(
      page.url() !== before && (await page.locator('.di-root canvas, .rf-root').count()) === 0,
      `${where}: the ✕ LEAVES the lesson (now on ${page.url().replace(/^https?:\/\/[^/]+/, '')}) — the world is closed`,
    );
    await page.goto(before, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1000);
  };

  // ══════════════════════════ the title ══════════════════════════
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(1200);
  expect(
    (await page.textContent('.di-title h1')).includes('ميناء الألواح') &&
      (await page.textContent('.di-title__eyebrow')).includes('القسمة الإقليدية وحصر حاصل القسمة'),
    'the title screen is this lesson’s own story (« ميناء الألواح », « القسمة الإقليدية وحصر حاصل القسمة »)',
  );
  await shot('title', OUT_N);
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  await shot('start', OUT_N);

  // ── island A → B: planks of 12 on 84 (no prediction on the first bridge) ──
  await bridge(0, 'g84', 84, null, 12);
  await shot('g84', OUT_N);
  await cross(0);
  await page.waitForTimeout(400);
  expect(
    (await st()).stage === 1 && (await st()).held == null,
    'on the second island the mould is not kept: he must choose',
  );

  // ── the ✕ of the top bar, CLICKED inside the world: he leaves, and finds his place again ──
  await leaveBy('.di-top a.di-icon', 'inside the world (island B)');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  {
    const s = await st();
    expect(
      s.phase === 'play' && s.stage === 1 && s.stars.g84 >= 1 && s.overlay == null,
      `back in the world where he left it: island B, the first bridge still held (${JSON.stringify({ phase: s.phase, stage: s.stage })})`,
    );
  }
  await shot('back-in-the-world', OUT_N);

  // ══════════════════════════ island B — THE RECALL: 912, planks of two digits, no forge ══════════════════════════
  // the plank 17 with a RIGHT prediction of what it leaves, the plank 35 with a WRONG one, then the plank 24
  await take(17);
  await toAltar(1);
  await act();
  expect((await st()).overlay === 'predict', 'bridge 912: the world asks his prediction before it builds');
  await shot('predict', OUT_N);
  {
    const o = (await st()).o;
    expect(
      o.a === 912 && String(o.b).length === 2,
      `the recall asks a division he knows: ${o.a} by a plank of two digits (${o.b})`,
    );
    await page.click(`[data-di-predict="${o.a % o.b}"]`);
    await ff(9);
    await settle();
  }
  expect(!(await st()).stars.g912, `planks of 17 leave ${912 % 17} cells over 912: the bridge crumbles`);
  await take(35);
  await forge(1, true);
  await ff(9);
  await settle();
  expect(
    !(await st()).stars.g912,
    `planks of 35 leave ${912 % 35} cells (his prediction was another number): it crumbles`,
  );
  await bridge(1, 'g912', 912, null, 24);
  await cross(1);
  await page.waitForTimeout(500);
  {
    const s = await st();
    expect(
      s.stage === 2 && s.overlay !== 'forge' && s.keys.length === 0 && (await page.locator('.rf-root').count()) === 0,
      'island C: the first year’s division was only RECALLED — no forge opens, no key is given for it',
    );
  }

  // ── island C: 4576 and LONG moulds (208 / 248 / 365) — a plank that leaves cells, then the one that fills it ──
  {
    const moulds = await page.evaluate(() => {
      const g = window.__world;
      return g.isl[g.hero.island].pedestals.map((p) => p.b).sort((x, y) => x - y);
    });
    expect(
      moulds.length === 3 && moulds.every((b) => String(b).length === 3),
      `what is new: the three moulds of this island have THREE digits (${moulds.join(', ')})`,
    );
  }
  await bridge(2, 'g4576', 4576, 365, 208);
  await shot('g4576', OUT_N);
  await cross(2);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 1 ➗ « القسمة على أيّ عدد » — ESTIMATE, long planks ══════════════════════════
  expect(
    (await st()).stage === 3 && (await st()).overlay === 'forge',
    'island D « جزيرة العلامات » opens the first forge',
  );
  await opensOnQuestion('qisma-ay-adad', 'estimate');
  await forgeTools('forge 1, the investigation');
  // the ✕ of the forge, CLICKED: he leaves — and the forge, which cannot be skipped, opens again at « واصل »
  await leaveBy('.rf-root [data-di-exit]', 'inside the forge');
  await page.click('[data-di-start]');
  await page.waitForSelector('.rf-root', { timeout: 15000 });
  await page.waitForTimeout(600);
  expect(
    (await st()).overlay === 'forge' && (await st()).keys.length === 0,
    'back: the forge he left opens again by itself — a rule is never skipped',
  );
  await opensOnQuestion('qisma-ay-adad', 'estimate');
  /** The single planks he tried and the ruler refused (a mark is ONE plank): they are his evidence too. */
  const unitMisses = [];
  {
    const s0 = await iq();
    expect(
      s0.a === 4576 && s0.b === 208 && s0.si === 0 && s0.stage === 'guess',
      'it starts from the gap he has just crossed: 4576 with the long plank 208',
    );
    await inquiryFits('estimate-start');
    let passed = false;
    let passedUnit = false;
    let short = false;
    let zero = false;
    let hundreds = false;
    let blindSteps = 0;
    const rounds = [];
    for (let guard = 0; guard < 80; guard += 1) {
      const s = await iq();
      if (s.stage === 'end') {
        const got = s.found.at(-1);
        expect(
          got.a === s.a && got.b === s.b && got.q === quo(s.a, s.b) && got.r === s.a % s.b,
          `estimate ${s.ri + 1}: ${s.a} = ${s.b} × ${quo(s.a, s.b)} + ${s.a % s.b}, laid step by step`,
        );
        expect(String(s.b).length === 3, `estimate ${s.ri + 1}: the plank ${s.b} has three digits`);
        check(
          (await fact()).includes(String(s.a)) && (await page.locator('[data-iq-fact] .katex').count()) >= 1,
          `estimate ${s.ri + 1}: the division is written, drawn as a formula`,
        );
        rounds.push(`${s.a}÷${s.b}`);
        if (s.ri === 0 || s.ri === 4) await inquiryFits(`estimate-${s.a}-${s.b}-end`);
        const last = (await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي');
        if (last) break;
        await page.click('[data-iq-next]');
        await page.waitForTimeout(80);
        continue;
      }
      if (s.stage !== 'guess') {
        await page.waitForTimeout(60);
        continue;
      }
      // the step on screen: what is left (the flag), one mark of the ruler, how many planks a mark is
      const from = Number(await page.getAttribute('[data-iq-flag]', 'data-iq-flag'));
      const unit = Number(await page.getAttribute('[data-iq-ruler]', 'data-iq-ruler'));
      const per = 10 ** Number(await page.getAttribute('[data-iq="estimate"]', 'data-iq-place'));
      expect(unit === s.b * per, `the ruler of this step counts marks of ${s.b} × ${per} = ${unit}`);
      const k = Math.floor(from / unit);
      expect(k <= 9, `the right mark is on the ruler (${k} marks of ${unit} under the flag ${from})`);
      if (per === 100) {
        hundreds = true;
        await inquiryFits('estimate-hundreds'); // the widest ruler: marks of 20800 … 208000
      }
      // BLIND (every round but the first): the marks show their count only — a product is written once he has pressed
      const blind = (await page.getAttribute('[data-iq="estimate"]', 'data-iq-blind')) === '1';
      expect(
        blind === s.ri > 0 && Boolean(s.blind) === blind,
        `estimate ${s.ri + 1}, step ${s.si + 1}: the ruler is ${s.ri > 0 ? 'BLIND (the multiples of the long plank are not given)' : 'sighted, this once (he meets the ruler of a long plank)'}`,
      );
      /** The products written under the marks of the ruler now (0 is always written), in order. */
      const written = () =>
        page
          .locator('.iq-ruler .iq-mark__value')
          .evaluateAll((els) => els.map((e) => Number(e.textContent)).sort((x, y) => x - y));
      const calc = async () => (await page.textContent('[data-iq-calc]')) ?? '';
      {
        const w0 = await written();
        if (blind) {
          blindSteps += 1;
          check(
            w0.join() === '0' && (await page.locator('[data-iq-shown]').count()) === 0,
            `blind ruler of ${s.b} × ${per}: no product is written under a mark before he presses (${w0.join(', ')})`,
          );
          check(
            ((await page.textContent('.iq-askline')) ?? '').includes('بعد أن تضغط'),
            'the question says what the blind ruler does: it writes a length once he has pressed',
          );
          if (blindSteps === 1) await inquiryFits('estimate-blind-start');
        } else
          check(
            w0.length === 11 && w0[10] === 10 * unit,
            `sighted ruler of ${s.b} × ${per}: its eleven products are written (0 … ${10 * unit})`,
          );
      }
      /** A count too BIG, pressed: the world writes its product and puts it against what is left. Nothing is laid. */
      const pressPassing = async (name) => {
        const heard = await hear(async () => {
          await page.click(`[data-iq-mark="${(k + 1) * per}"]`);
          await page.waitForTimeout(120);
        });
        const t = await iq();
        expect(
          t.stage === 'guess' && t.pick?.kind === 'passes' && t.si === s.si && heard.includes('fail'),
          `${(k + 1) * per} planks of ${s.b} = ${(k + 1) * unit} > ${from}: refused by the fact, nothing laid`,
        );
        {
          const f = await fact();
          check(
            /(يتجاوز|يتجاوزان|تتجاوز) الراية/.test(f) && f.includes(String((k + 1) * unit)) && f.includes(String(from)),
            `the screen writes the product ${(k + 1) * unit} and says the planks pass the flag ${from} — never « wrong »`,
          );
        }
        if (blind) {
          const c = await calc();
          check(
            c.includes(String((k + 1) * unit)) && c.includes(String(from)) && c.includes('>'),
            `blind: the world writes ${s.b} × ${(k + 1) * per} = ${(k + 1) * unit} and ${(k + 1) * unit} > ${from} AFTER his press`,
          );
          check(
            (await page.locator(`[data-iq-shown="${(k + 1) * per}"]`).count()) === 1 &&
              (await written()).includes((k + 1) * unit),
            `blind: the product he revealed (${(k + 1) * unit}) is now written under its mark`,
          );
        }
        await inquiryFits(name);
      };
      if (!passed && k + 1 <= 9) {
        // a mark that passes the flag (tens of planks, on the sighted ruler of the first round)
        await pressPassing('estimate-passes');
        passed = true;
      } else if (!passedUnit && s.ri === 1 && per === 1 && k >= 2 && k + 1 <= 9) {
        // ── a BLIND step played as a student does: a count too big, a count too small, then the right one ──
        // (single planks of the second gap: each count he tries is his evidence in the mirror)
        await pressPassing('estimate-blind-too-big');
        unitMisses.push({ a: from, b: s.b, q: k + 1 });
        passedUnit = true;
        const heard = await hear(async () => {
          await page.click(`[data-iq-mark="${(k - 1) * per}"]`);
          await page.waitForTimeout(120);
        });
        const t = await iq();
        expect(
          t.stage === 'guess' && t.pick?.kind === 'short' && t.si === s.si && heard.includes('fail'),
          `${(k - 1) * per} planks of ${s.b} = ${(k - 1) * unit}: one more mark (${k * unit}) still fits under ${from} — refused, nothing laid`,
        );
        {
          const f = await fact();
          check(
            f.includes('العلامة التالية') && f.includes(String(k * unit)) && f.includes(String(from)),
            `the screen says the next mark (${k * unit}) does not pass the flag ${from} — a fact, never the rule`,
          );
          const c = await calc();
          check(
            c.includes(String((k - 1) * unit)) && c.includes(String(k * unit)) && c.includes(String(from)),
            `blind: the world writes ${(k - 1) * unit} + ${unit} = ${k * unit} ≤ ${from} AFTER his press`,
          );
          // every product he revealed stays under its mark until the step is laid: the too-big one and this one
          const w2 = await written();
          check(
            w2.join() === [0, (k - 1) * unit, (k + 1) * unit].sort((x, y) => x - y).join(),
            `blind: the two products he revealed stay under their marks (${w2.join(', ')}) — the right one is still hidden`,
          );
        }
        await inquiryFits('estimate-blind-too-small');
        unitMisses.push({ a: from, b: s.b, q: k - 1 });
        short = true;
      }
      if (k === 0) zero = true;
      const heard = await hear(async () => {
        await page.click(`[data-iq-mark="${k * per}"]`);
        await page.waitForFunction(
          ([ri, si]) => {
            const x = window.__inquiry;
            return x && (x.ri !== ri || x.si > si || x.stage === 'end') && x.stage !== 'lay';
          },
          [s.ri, s.si],
        );
      });
      check(
        heard.includes('sweep') && heard.includes('plank'),
        `${s.a} ÷ ${s.b}, step ${s.si + 1}: ${k * per} planks laid — heard ${[...new Set(heard)].join(', ')}`,
      );
      if ((await iq()).stage === 'end')
        check(heard.includes('gate'), `${s.a} ÷ ${s.b}: a chime when the last step is laid`);
    }
    expect(
      rounds.length === 5 && passed && short && (await page.locator('[data-iq-found] li').count()) === 5,
      `five gaps divided by a long plank — ${rounds.join(', ')} — a passing mark and a short mark answered by the facts, all kept on screen`,
    );
    expect(
      passedUnit && unitMisses.length === 2,
      'on a BLIND ruler of single planks he tried a count too big, then one too small, then the right one: the two refused counts are his',
    );
    // the walk's own count of the steps of the four blind gaps: 4576 ÷ 365 and ÷ 248 (two each), 2241 ÷ 365 (one),
    // 22152 ÷ 208 (three)
    expect(blindSteps === 8, `every step after the first gap was played on a blind ruler (${blindSteps} steps)`);
    expect(
      zero && hundreds,
      'a gap of five digits was met: hundreds of planks, then a step of 0 planks — it is a step too',
    );
    await inquiryFits('estimate-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    {
      // his evidence: the single planks he tried — the five counts he laid and the two the ruler refused
      const rows = (await fg()).rows;
      expect(
        rows.length === 5 + unitMisses.length && rows.every((r) => r.kind === 'trial' && String(r.b).length === 3),
        `only now he WRITES his rule — the mirror will judge it on the ${rows.length} counts of planks HE tried (long planks only)`,
      );
      expect(
        rows.every((r) => r.held === truthOf(r)) &&
          unitMisses.every((m) => rows.some((r) => r.a === m.a && r.b === m.b && r.q === m.q && !r.held)),
        'each line of his evidence says what the planks did — the two refused counts among them',
      );
      expect(
        (await page.locator('[data-rf-row][data-rf-own="1"]').count()) >= 1 &&
          (await page.locator('[data-rf-tile]').count()) === 9,
        'the tiles are on screen: three ways to try a digit, three « too big », three « too small »',
      );
      // « the rounded plank judges »: refuted by the first trial of HIS where the rounded plank and the plank disagree
      const firstBad = rows.find((r) => nearSays(r) !== truthOf(r));
      expect(Boolean(firstBad), 'sanity: one of his trials tells the rounded plank from the plank itself');
      await page.click('[data-rf-tile="by:near"]');
      await page.click('[data-rf-tile="big:passes"]');
      await page.click('[data-rf-tile="small:room"]');
      await forgeTools('forge 1, the tiles');
      await shot('forge1-build');
      await page.click('[data-rf-test]');
      await page.waitForSelector('[data-rf-refuted]');
      const id = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
      const want = `${firstBad.a}:${firstBad.b}:${firstBad.q}`;
      expect(
        id === want &&
          (await page.getAttribute(`[data-rf-row="${id}"]`, 'data-rf-own')) === '1' &&
          (await page.getAttribute(`[data-rf-row="${id}"]`, 'data-rf-mark')) === 'refute',
        `« the rounded plank judges » is refuted by a count HE laid: ${firstBad.q} planks of ${firstBad.b} in ${firstBad.a} (rounded to ${Math.round(firstBad.b / 100) * 100}, it would leave room) [${id}]`,
      );
    }
    await shot('forge1-refuted');
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    // the robot: never a rule — the same cells left, two counts of planks in front of him
    await page.click('[data-rf-help]');
    await page.waitForSelector('[data-rf-nudge]');
    expect(
      (await page.getAttribute('[data-rf-nudge]', 'data-rf-nudge')) === 'experiment' &&
        (await page.locator('[data-rf-choice]').count()) === 0,
      'the robot helps with an EXPERIMENT (two counts of planks on the same cells), never a choice between two written rules',
    );
    await page.waitForFunction(() => window.__forge && !window.__forge.help?.running, null, { timeout: 15000 });
    await shot('forge1-nudge');
    // ── an ATTACK that BREAKS his rule: « a whole plank left is fine » agrees with everything he did … ──
    await page.click('[data-rf-tile="by:real"]');
    await page.click('[data-rf-tile="big:passes"]');
    await page.click('[data-rf-tile="small:over"]');
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]');
    expect(
      (await fg()).rows.every((r) => overSays(r) === truthOf(r)),
      'sanity: « too small only when MORE than a plank is left » agrees with every count he tried',
    );
    await page.click('[data-rf-dare]');
    await page.waitForSelector('[data-rf="attack"]');
    {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      expect(
        c.kind === 'trial' && overSays(c) !== truthOf(c) && String(c.b).length === 3,
        `the mirror attacks with a NEW trial his rule gets wrong: ${c.q} planks of ${c.b} in ${c.a} cells (${c.a - c.b * c.q} left)`,
      );
      // he says what HIS rule says (it accepts the count); the planks then do otherwise
      await page.click(`[data-rf-say="${overSays(c) ? 'yes' : 'no'}"]`);
      await page.click('[data-rf-fire]');
      await page.waitForSelector('[data-rf-broken]', { timeout: 20000 });
      expect(
        (await page.getAttribute('[data-rf-broken]', 'data-rf-broken')) === `${c.a}:${c.b}:${c.q}` &&
          (await page.locator('[data-rf-survived]').count()) === 0 &&
          !(await page.textContent('.rf-panel')).includes('خطأ'),
        `his rule is BROKEN in front of him: it accepted ${c.q} planks, and ${c.a - c.b * c.q} cells take one more plank of ${c.b} — never « wrong »`,
      );
      check(
        (await page.locator('[data-rf-eq] .katex').count()) >= 1,
        'the mirror writes what the planks did, drawn as a formula',
      );
      await forgeTools('forge 1, a broken rule');
      await shot('forge1-broken');
      await page.click('[data-rf-fix]');
      await page.waitForSelector('[data-rf="build"]');
      expect(
        (await fg()).phase === 'build' && (await st()).keys.length === 0,
        'a broken rule goes back to the tiles: no key yet',
      );
    }
    await finishForge('forge1', ['by:real', 'big:passes', 'small:room'], async (u) => {
      const [q, r] = [quo(u.a, u.b), u.a % u.b];
      expect(
        String(u.a).length === 5 && String(u.b).length === 3,
        `the last step has no ruler and no mirror: ${u.a} by the long plank ${u.b}`,
      );
      expect(
        (await fillUse({ q: q - 1, r: r + u.b })) === 'big',
        `the last step: ${u.a} = ${u.b} × ${q - 1} + ${r + u.b} is true, but ${r + u.b} cells take one more plank — refused`,
      );
      await shot('forge1-use');
      expect((await fillUse({ q, r })) === 'ok', `${u.a} = ${u.b} × ${q} + ${r}, without laying a plank`);
    });
  }
  await tablet(1, 'القسمة على أيّ عدد', async () => {
    const card = await page.textContent('.di-card');
    // HIS rule first (the three tiles he chose), then the name — and what the lesson adds: a divisor of three digits
    check(
      card.includes('اللوح نفسه') && card.includes('أكبر من اللازم') && card.includes('أصغر من اللازم'),
      'the tablet shows HIS rule: how a digit is tried, when it is too big, when it is too small',
    );
    check(
      card.includes('ثلاثة أرقام') && card.includes('المقسوم عليه') && !card.includes('القاسم'),
      'the tablet names what is new — a divisor of three digits — and calls b « المقسوم عليه »',
    );
    // the walk's own arithmetic: 4576 = 365 × 12 + 196, and a thirteenth plank passes the gap
    check(
      [365 * 12 + 196, 365 * 13 > 4576].join() === '4576,true' && card.includes('4745'),
      'its equalities are true: 4576 = 365 × 12 + 196, and 365 × 13 = 4745 passes 4576',
    );
  });
  check(
    (await st()).keys.length === 1,
    'the first key is his — for the LONG plank; nothing was forged for the first year’s division',
  );

  // ── 5475 (long planks: 208 leaves cells, 365 fills it) ──
  await bridge(3, 'g5475', 5475, 208, 365);
  await cross(3);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 2 📏 « حصر حاصل القسمة » — BRACKET ══════════════════════════
  expect(
    (await st()).stage === 4 && (await st()).overlay === 'forge',
    'island E « جزيرة الرايات » opens the second forge',
  );
  await opensOnQuestion('hasr-hasil', 'bracket');
  {
    // the goal is true of every round and says none of the words of the tiles
    const goal = await page.textContent('[data-iq-goal]');
    check(
      goal.includes('بين أيّ علامتين') && goal.includes('على أيّ علامة') && !/الكاملة|اللازمة|متتالي/.test(goal),
      `the goal of the experiment says where the flag may stand — between two marks or ON one — in no word of the rule (« ${goal.trim()} »)`,
    );
  }
  let firstOn = null; // the first gap HE saw a plank fill (the flag ON a mark)
  {
    const s0 = await iq();
    expect(s0.a === 5475 && s0.b === 208, 'it starts from the gap he has just crossed: 5475, on the line of 208');
    await inquiryFits('bracket-start');
    const typePair = async (lo, hi) => {
      await page.fill('[data-iq-in="lo"]', String(lo));
      await page.fill('[data-iq-in="hi"]', String(hi));
      return hear(async () => {
        await page.click('[data-iq-check]');
        await page.waitForTimeout(120);
      });
    };
    let n = 0;
    for (let guard = 0; guard < 12; guard += 1) {
      const s = await iq();
      const a = Number(await page.getAttribute('[data-iq-flag]', 'data-iq-flag'));
      const b = s.b;
      expect(a === s.a, `bracket ${n + 1}: the flag stands at the gap ${a}`);
      const [lo, hi] = [quo(a, b), quo(a, b) + 1];
      const exact = a % b === 0;
      if (exact && firstOn == null) firstOn = `${a}:${b}:${lo}:${hi}`;
      if (n === 0) {
        // a pair that passes the gap, then a pair with a mark between its marks — each answered by what the line shows
        let heard = await typePair(lo + 1, lo + 2);
        let t = await iq();
        expect(
          t.stage === 'guess' && t.miss && !t.miss.loFits && heard.includes('fail'),
          `${b} × ${lo + 1} = ${b * (lo + 1)} passes ${a}: refused by the products, nothing lit`,
        );
        check((await fact()).includes('يتجاوز'), 'the screen says which product passes the gap — never « wrong »');
        await inquiryFits('bracket-miss-passes');
        heard = await typePair(lo - 1, hi);
        t = await iq();
        expect(
          t.stage === 'guess' && t.miss && t.miss.loFits && t.miss.hiPasses && !t.miss.consecutive,
          `${lo - 1} and ${hi} hold ${a} between them but a mark stands between theirs: refused`,
        );
        {
          const f = await fact();
          check(
            f.includes('تقف علامة واحدة أخرى') && !/متتالي/.test(f),
            `the screen says a mark stands between ${b * (lo - 1)} and ${b * hi} — a fact of the line, never a word of the rule`,
          );
        }
        await inquiryFits('bracket-miss-gap');
      }
      const heard = await typePair(lo, hi);
      expect(
        (await iq()).stage === 'where' && heard.includes('key'),
        `${b} × ${lo} = ${b * lo} ≤ ${a} < ${b * hi} = ${b} × ${hi}: the two marks light up`,
      );
      if (n === 0) await inquiryFits('bracket-where');
      // between two marks, or ON one: the FIRST gap he answers the other way (the line says what it is)
      const right = exact ? 'on' : 'between';
      const say = n === 0 ? (exact ? 'between' : 'on') : right;
      const heard2 = await hear(async () => {
        await page.click(`[data-iq-where="${say}"]`);
        await page.waitForSelector('[data-iq-next]');
      });
      check(
        heard2.at(-1) === (say === right ? 'success' : 'crumble'),
        `bracket ${n + 1}: « ${say} » — heard ${heard2.at(-1)}`,
      );
      const f = await fact();
      if (say !== right) {
        expect(f.includes('لم يكن هذا ما قلته'), `the flag ${a} stands ${right}: the line says it beside his word`);
        await inquiryFits('bracket-wrong-where');
      } else check(f.includes('كما قلت'), `bracket ${n + 1}: « كما قلت »`);
      if (exact && n > 0 && n < 3) await inquiryFits(`bracket-on-mark-${a}-${b}`);
      n += 1;
      if ((await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي')) break;
      await page.click('[data-iq-next]');
      await page.waitForTimeout(80);
    }
    expect(
      n === 5 && (await page.locator('[data-iq-found] li').count()) === 5 && firstOn,
      `five gaps on the line, some flags ON a mark (first: ${firstOn}), all kept on screen`,
    );
    await inquiryFits('bracket-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    {
      const rows = (await fg()).rows;
      const refused = `5475:208:${quo(5475, 208) + 1}:${quo(5475, 208) + 2}`;
      expect(
        rows.length === 6 && rows.some((r) => `${r.a}:${r.b}:${r.n}:${r.m}` === refused && !r.held),
        'only now he WRITES his rule — on the five pairs the line accepted and the pair it refused',
      );
      check(
        (await page.locator(`[data-rf-row="${refused}"].is-fell`).count()) === 1,
        `the pair the line refused (${refused}) is in his log, marked as refused`,
      );
    }
    {
      // before the seal the forge never says the NAME of the key: no « حصر », no « محصور »
      const said = await page.evaluate(() => document.querySelector('.rf-root').innerText);
      check(!/حصر|محصور/.test(said), 'the forge does not say « حصر » before its tablet names it');
    }
    // « the full planks, and the planks needed »: on a gap a plank fills they are the same number — refuted by HIS gap
    await page.click('[data-rf-tile="lo:full"]');
    await page.click('[data-rf-tile="hi:needed"]');
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    expect(
      (await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted')) === firstOn,
      `the « full / needed » rule is refuted by HIS gap where the flag stood ON a mark (${firstOn}): the two numbers are the same`,
    );
    await forgeTools('forge 2, the mirror');
    await shot('forge2-refuted');
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    await finishForge('forge2', ['lo:full', 'hi:next'], async (u) => {
      const lo = quo(u.a, u.b);
      expect(
        (await fillUse({ lo, hi: lo + 2 })) === 'next',
        `the last step: ${u.b} × ${lo} ≤ ${u.a} < ${u.b} × ${lo + 2} is true, but the numbers do not follow — refused`,
      );
      await shot('forge2-use');
      expect(
        (await fillUse({ lo, hi: lo + 1 })) === 'ok',
        `${u.b} × ${lo} ≤ ${u.a} < ${u.b} × ${lo + 1}, without building`,
      );
    });
  }
  await tablet(2, 'حصر حاصل القسمة', async () => {
    const card = await page.textContent('.di-card');
    check(
      card.includes('بالنقصان') && card.includes('بالزيادة') && card.includes('يُكتب أيضًا'),
      'the tablet names the two approximate values, and says the quotient is also written as a fraction',
    );
    // the bank's notation, with a REAL fraction bar (KaTeX draws it): never « \frac » read raw (checked by `shot`)
    check(
      (await page.locator('.di-card .katex .frac-line').count()) >= 2,
      'the fraction bar of the bank’s notation is drawn on the tablet (« a over b », and 5475 over 208)',
    );
    // 26 < 5475 ÷ 208 < 27, computed here
    check(
      [208 * 26 <= 5475, 5475 < 208 * 27].join() === 'true,true' && card.includes('5475'),
      'its bracket is true: 208 × 26 ≤ 5475 < 208 × 27',
    );
  });

  // ── 644 (planks of 28), then the dash of island F ──
  await bridge(4, 'g644', 644, 30, 28);
  await cross(4);
  await page.waitForTimeout(500);
  expect((await st()).stage === 5, 'island F: the board of light');
  {
    const p = await page.evaluate(() => [window.__world.boardHome.x, window.__world.boardHome.z]);
    await tp(p[0], p[1] + 0.2);
    await ff(0.3);
    await act();
    await ff(0.6);
    expect(Boolean(await page.evaluate(() => window.__world.getState().dash)), 'the board moves');
    await ff(1.5);
    const say = await page.textContent('.di-dash__say');
    check(
      say && say.trim().length > 3,
      `the dash says this lesson’s sentence over the rail (« ${say?.trim().slice(0, 50)} »)`,
    );
    await shot('dash', OUT_N);
    for (let k = 0; k < 400 && (await page.evaluate(() => Boolean(window.__world.getState().dash))); k += 1) {
      await page.evaluate(() => {
        const d = window.__world.dash;
        if (!d) return;
        const x = d.waves[d.wave];
        if (x) d.lane = x.good;
      });
      await ff(0.25);
    }
  }
  await ff(6);
  await page.waitForTimeout(500);

  // ── island G: 1080 (planks of 45), then the stone of island H ──
  expect((await st()).stage === 6, 'island G « جزيرة الصدى »');
  await bridge(6, 'g1080', 1080, 64, 45);
  await cross(6);
  await ff(2.5);
  await page.waitForTimeout(400);
  {
    const s = await st();
    expect(
      s.stage === 7 && s.overlay === 'quiz' && s.o.id === 'trips',
      'island H « جزيرة القوارب »: the stone asks the boat’s question first',
    );
    const prompt = await page.textContent('.di-card h2');
    const m = prompt.match(/يحمل (\d+) صندوقًا.*?الرصيف (\d+) صندوقًا/);
    expect(m, `the boat's numbers are read from the stone (« ${prompt.trim().slice(0, 60)} »)`);
    const [boat, boxes] = [Number(m[1]), Number(m[2])];
    const opts = await page
      .locator('[data-di-option]')
      .evaluateAll((els) => els.map((e) => Number(e.dataset.diOption)));
    // the walk's own arithmetic: the trips that leave full, and the trips needed for every box
    const right = [quo(boxes, boat), ceilDiv(boxes, boat)];
    expect(
      opts.length === 5 && right.every((v) => opts.includes(v)),
      `the stone offers ${opts.join(', ')}: ${boxes} = ${boat} × ${right[0]} + ${boxes % boat} — ${right[0]} full trips, ${right[1]} needed`,
    );
    await shot('stone', OUT_N);
    const odd = right[0] - 1;
    expect(opts.includes(odd), `the stone offers ${odd}, one trip fewer than the full ones`);
    await page.click(`[data-di-option="${odd}"]`);
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    expect(
      (await page.textContent('.di-feedback')).includes(String(odd)),
      `${odd} chosen: the stone says what ${odd} trips leave on the quay — never the answer`,
    );
    await shot('stone-wrong', OUT_N);
    await page.click(`[data-di-option="${odd}"]`);
    for (const v of right) await page.click(`[data-di-option="${v}"]`);
    await page.click('[data-di-check]');
    await page.waitForTimeout(500);
  }

  // ══════════════════════════ forge 3 0️⃣ « انعدام الباقي » — the mirror alone ══════════════════════════
  expect((await st()).overlay === 'forge', 'the stone answered: its mirror opens');
  {
    const f0 = await fg();
    expect(
      f0.key === 'inidam-baqi' && f0.phase === 'predict' && (await page.locator('.iq').count()) === 0,
      'the third key is ONE condition on a case: no investigation — the mirror opens on a prediction',
    );
    const own = await page
      .locator('[data-rf-row][data-rf-own="1"]')
      .evaluateAll((els) => els.map((e) => ({ id: e.dataset.rfRow, fell: e.classList.contains('is-fell') })));
    expect(
      own.length === 5 && own.every((r) => r.id.startsWith('bridge:')) && own.some((r) => r.fell),
      `the evidence is his OWN crossing — the last five bridges, held and crumbled (${own.map((r) => r.id).join(' ')})`,
    );
    await forgeTools('forge 3, the prediction');
    await shot('forge3-predict');
    // a missed prediction first, then right ones until « the rule is in your head » — each judged by a % b, computed here
    const guess = async (right) => {
      const c = (await fg()).show.c;
      const fills = c.a % c.b === 0;
      await page.click(`[data-rf-guess="${fills === right ? 'yes' : 'no'}"]`);
      await page.waitForSelector('[data-rf-predicted]');
      return c;
    };
    const c = await guess(false);
    expect(
      (await page.getAttribute('[data-rf-predicted]', 'data-rf-predicted')) === 'miss' &&
        !(await page.textContent('.rf-panel')).includes('خطأ'),
      `a missed prediction (« ${c.text ?? `${c.a} / ${c.b}`} ») is answered by the bridge the mirror builds, never « wrong »`,
    );
    await shot('forge3-miss');
    await page.click('[data-rf-next]');
    for (let i = 0; i < 8 && (await fg()).phase === 'predict'; i += 1) {
      if ((await fg()).show.stage === 'ask') await guess(true);
      await page.click('[data-rf-next]');
      await page.waitForTimeout(80);
    }
    await page.waitForSelector('[data-rf="build"]');
    // « the remainder is smaller than the plank »: always true — one of his crumbled bridges refutes it
    const firstFell = own.find((r) => r.fell).id;
    await page.click('[data-rf-tile="q:r"]');
    await page.click('[data-rf-tile="c:less"]');
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    expect(
      (await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted')) === firstFell,
      `« the remainder is smaller than the plank » is refuted by HIS first crumbled bridge (${firstFell}): every remainder is smaller, and that bridge fell`,
    );
    await shot('forge3-refuted');
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    await finishForge('forge3', ['q:r', 'c:zero'], async (u) => {
      const [q, r] = [quo(u.a, u.b), u.a % u.b];
      const truth = r === 0;
      expect(
        (await fillUse({ q, r }, !truth)) === 'verdict',
        `the last step: ${u.a} = ${u.b} × ${q} + ${r} is right, the verdict on « ${u.text} » is not — refused`,
      );
      await shot('forge3-use');
      expect(
        (await fillUse({ q, r }, truth)) === 'ok',
        `« ${u.text} » is ${truth ? 'true' : 'false'}: the remainder ${r} says it, without building`,
      );
    });
  }
  await tablet(3, 'انعدام الباقي');

  // ══════════════════════════ the port's bridge: 1872, long planks of 130 or 156 ══════════════════════════
  await toAltar(7);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  const GAP = Number((await page.textContent('[data-di-boss-mission]')).match(/(\d{3,})/)?.[1]);
  expect((await st()).overlay === 'boss' && GAP === 1872, `the store opens on the lesson’s problem: ${GAP} cells`);
  const moulds = await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
  expect(
    moulds.join() === '130,156',
    'the store offers the lesson’s two planks — 130 and 156, three digits each — and no other',
  );
  await shot('boss', OUT_N);
  const [bad, good] = [moulds.find((b) => GAP % b), moulds.find((b) => GAP % b === 0)];
  await page.click(`[data-di-mould="${bad}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  expect(
    (await page.textContent('[data-di-boss-a]')).trim() === String(GAP),
    `the division to write starts with the gap of THIS lesson: ${GAP} = ${bad} × ▢ + ▢`,
  );
  const bossErr = async (q, r) => {
    if (q !== '') await page.fill('[data-di-q]', String(q));
    if (r !== '') await page.fill('[data-di-r]', String(r));
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    return (await page.textContent('[data-di-boss-error]')) ?? '';
  };
  expect(
    (await bossErr('', '')).includes('الألواح الكاملة'),
    'an empty division is refused, in the words of this lesson (the full planks)',
  );
  {
    const q = quo(GAP, bad) + 1;
    const e = await bossErr(q, 0);
    expect(
      e.includes(String(bad * q)) && e.includes(`(${GAP})`),
      `${q} planks of ${bad}: « ${bad * q} cells, longer than the gap (${GAP}) » (${e.trim().slice(0, 60)})`,
    );
  }
  {
    const q = quo(GAP, bad) - 1;
    const e = await bossErr(q, GAP - bad * q);
    expect(
      e.includes(`أصغر من ${bad}`),
      `${q} planks and ${GAP - bad * q} left: « room for another plank, the remainder must be smaller than ${bad} »`,
    );
  }
  await shot('boss-divide');
  await page.fill('[data-di-q]', String(quo(GAP, bad)));
  await page.fill('[data-di-r]', String(GAP % bad));
  await page.click('[data-di-check]');
  await ff(15);
  await page.waitForTimeout(400);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'choose' && o.tried[bad] === GAP % bad,
      `planks of ${bad} leave ${GAP % bad} cells: the store shows it tried and lets him choose again`,
    );
  }
  await shot('boss-tried');
  await page.click(`[data-di-mould="${good}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(GAP / good));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  await ff(12);
  await page.waitForTimeout(300);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'cost' && o.q === GAP / good,
      `the bridge of ${GAP} holds with ${GAP / good} planks of ${good}: the store asks their price`,
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  const PRICE = Number((await page.textContent('[data-di-boss-price]')).trim());
  {
    const asked = await page.textContent('.di-card h2');
    expect(
      PRICE > 0 && asked.includes(String(PRICE)) && asked.includes(String(GAP / good)),
      `the price in the sentence and in the equation are the SAME number (${PRICE}), beside the ${GAP / good} planks`,
    );
    expect(
      (await page.textContent('.di-template')).includes('دج'),
      'the amount is typed in its own shape: its unit « دج » is printed',
    );
  }
  await shot('boss-cost');
  {
    const wrongCost = (GAP / good) * PRICE + PRICE;
    await page.fill('[data-di-cost]', String(wrongCost));
    await page.click('[data-di-check]');
    await page.waitForTimeout(300);
    const e = await page.textContent('[data-di-boss-error]');
    expect(
      e.includes(String(wrongCost)) && e.includes('ثمن اللوح'),
      `a wrong price (${wrongCost}) is refused with a sentence, in the words of this lesson`,
    );
  }
  expect(
    (await w.reachable(page, ['.di-veil [data-di-exit]'])) !== null,
    'the ✕ that leaves the game is drawn OVER the dialog and a click reaches it',
  );
  await page.click('[data-di-boss-close]');
  await ff(0.3);
  expect(
    (await st()).overlay == null && (await st()).phase === 'play',
    'the payment step can be CLOSED: back in the world, nothing lost',
  );
  await act();
  await page.waitForTimeout(400);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'cost' && o.q === GAP / good,
      `the store opens again on the price of the ${GAP / good} planks`,
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-cost]', String((GAP / good) * PRICE));
  await page.click('[data-di-check]');
  await ff(0.5);
  expect(
    (await st()).overlay == null && (await st()).objective.includes('اعبر إلى الميناء'),
    `paid ${(GAP / good) * PRICE} دج (${GAP / good} × ${PRICE}): the objective says to cross to the port`,
  );
  await cross(7);
  await ff(3);
  await page.waitForTimeout(500);
  await shot('finale', OUT_N);
  await ff(6);
  await page.waitForTimeout(600);
  await shot('end', OUT_N);
  expect(
    (await st()).overlay === 'end',
    'the port is reached and the end screen shows: the story is played to its end',
  );
});
