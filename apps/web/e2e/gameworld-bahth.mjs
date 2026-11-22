// « أرخبيل القواسم: مرسى الممرّين » — walk of the game world of lesson `bahth-pgcd` (lesson 6) as a STUDENT, from the title
// to the end screen, through its screens. It walks what is NEW in this lesson (.claude/skills/lesson-v2/SKILL.md §6); the
// proven frames (trusted.md) are not re-proved here beyond what the story needs to go on:
//   A → B → C → D  the convoy of THREE bridges (152, 95, 57; the planks 8, 19, 5, 3 on island A): 8 holds 152 and is
//                  refused on 95, he WALKS BACK to A (turning round), takes 19 — the bridge of 8 goes back —, builds 152
//                  and 95; the page is RELOADED on C (the convoy restored), 57; island A's long instruction (folded and
//                  opened). D: the mirror ➖ — a false rule refuted, the attacks, the seal, the last step (a box between
//                  « PGCD(… ; » and « ) »), the tablet; the ✕ inside this forge; then the card « من الجزيرة السابقة ».
//   D → E → F      the workshop of D and its bench « دفتر الطرح » (the `ladder` kind, `subtract`, `plain`: no column of
//                  common planks, no gold): two rows written, LEFT by its back button half-way, reopened (rows kept), the
//                  count, the end; 37 builds 259 and 185 with the 12 coins. F: the mirror 🪜, then the mirror 🧮 and its
//                  fold experiment (a wrong fold first).
//   F → G → H      the bench « دفتر القسمة » (`divide`, `plain`); 13 — the purse runs out on 1833 (61 planks laid); 39
//                  builds 1833 (47 planks) and 546. H: the mirror 🔁, its last step of 4 lines.
//   H → I → J      the bench of both notebooks (`both`): « دفتر القسمة », by 29, run: 31 rows against 2 on one screen;
//                  17 builds 1003 (59 planks) and 34. J: the mirror ⏱️, its last step (a 146-character question).
//   J → K          the gate dash (lanes computed here);  K → L  the store (56 first: it fills the first lane only; 28; the
//                  price), the end.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas on one
// line, no word or number of the other lessons, a way out reachable, no text under 12 px. On every world screen: the
// instruction is there, uncovered, and names no rule before its tablet. The answers are computed HERE.
// The seconds a student WAITS while the world lays a long bridge are printed (« WAIT »).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-bahth.mjs [outDir]
import { createWalk, FLOOR_PX, lessonUrl } from './lib/walk.mjs';
import { ID as SHARED_ID, TITLES, BAHTH_FOREIGN, BAHTH_NUMBERS, gcd, divisions, subtractions } from './lib/bahth.mjs';

// the lesson this walk plays, named here (scripts/lesson-v2-status.mjs finds a lesson's world walk by its id)
const ID = 'bahth-pgcd';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
if (ID !== SHARED_ID) throw new Error(`this walk plays ${ID}, lib/bahth.mjs names ${SHARED_ID}`);

const w = createWalk('gameworld-bahth', { foreign: BAHTH_FOREIGN, foreignNumbers: BAHTH_NUMBERS });
const { expect, check } = w;
const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
const fills = (n, d) => n % d === 0;
const T0 = Date.now();
const lap = (what) => console.log(`TIME  ${what}: ${Math.round((Date.now() - T0) / 1000)} s`);
const waits = [];

await w.run(async () => {
  const { page } = await w.student({ uid: 9961, lessonId: ID, url: URL });
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
  /** Goes to the pedestal of plank b on the current island and takes it. */
  const take = async (b) => {
    const p = await page.evaluate((bb) => {
      const g = window.__world;
      const i = g.hero.island;
      const ped = g.isl[i].pedestals.find((q) => q.b === bb);
      const d = g.exitDir(i);
      return ped ? [ped.x - d.dx * 1.5, ped.z - d.dz * 1.5] : null;
    }, b);
    expect(p, `the plank ${b} lies on a pedestal of this island`);
    await tp(p[0], p[1]);
    await ff(0.15);
    await act();
    expect((await st()).held === b, `he holds the planks ${b}`);
  };
  const toAnvil = async (i) => {
    const p = await page.evaluate((k) => {
      const isl = window.__world.isl[k];
      if (!isl.anvil) return null;
      const v = isl.anvil.position.clone();
      isl.anvil.getWorldPosition(v);
      return [v.x, v.z, isl.x, isl.z];
    }, i);
    expect(p != null, `island ${i} has a workshop (an anvil)`);
    const d = Math.hypot(p[2] - p[0], p[3] - p[1]) || 1;
    await tp(p[0] + ((p[2] - p[0]) / d) * 1.7, p[1] + ((p[3] - p[1]) / d) * 1.7);
    await ff(0.2);
  };
  const openWorkshop = async (i) => {
    await toAnvil(i);
    await act();
    await page.waitForSelector('[data-di-workshop="typed"]', { timeout: 8000 });
    await page.waitForTimeout(150);
  };
  const craft = async (b) => {
    await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', String(b));
    await page.click('[data-di-workshop="typed"] [data-di-craft]');
    await ff(0.3);
    const s = await st();
    expect(s.held === b && s.overlay == null, `the workshop makes a plank of ${b} and closes`);
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
  const road = () =>
    page.evaluate(() => {
      const g = window.__world;
      const s = g.getState();
      return {
        stage: s.stage,
        phase: s.phase,
        held: s.held,
        falls: s.falls,
        facing: g.facing,
        island: g.hero.island,
        objective: s.objective,
        recall: s.recall,
        purse: s.purse,
        say: s.say?.text ?? '',
        verdict: s.verdict,
        segs: g.segs.map((x) => ({ id: x.id, a: x.a, complete: x.complete, builtWith: x.builtWith })),
        names: g.isl.map((x) => x.name),
      };
    });
  const standsWith = async (i, b) => {
    const s = (await road()).segs[i];
    return s.complete && s.builtWith === b;
  };
  const until = async (test, sec = 30) => {
    for (let t = 0; t < sec * 4; t += 1) {
      if (test(await road())) return true;
      await ff(0.25);
    }
    return test(await road());
  };
  const chip = () => page.getAttribute('[data-di-purse]', 'data-di-purse').catch(() => null);

  /** The words of the rules not forged yet: none may be said on the islands (A1). Narrowed after each tablet. */
  let forbid = /PGCD|يحفظ|خوارزمي|إقليدس|أسرع/;
  const worldShot = async (label) => {
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const shown = (el) => {
        if (!el) return false;
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      };
      const ins = document.querySelector('[data-di-instruction]');
      const out = { has: shown(ins), state: ins?.dataset.diInstruction ?? null, covered: [], px: null };
      if (out.has) {
        const b = ins.getBoundingClientRect();
        for (const [fx, fy] of [
          [0.5, 0.5],
          [0.15, 0.3],
          [0.85, 0.3],
          [0.15, 0.75],
          [0.85, 0.75],
        ]) {
          const top = document.elementFromPoint(b.left + b.width * fx, b.top + b.height * fy);
          if (top && !ins.contains(top) && !top.contains(ins))
            out.covered.push(String(top.className?.baseVal ?? top.className).split(' ')[0] || top.tagName);
        }
        const text = ins.querySelector('.di-objective');
        if (text) out.px = parseFloat(getComputedStyle(text).fontSize);
        // the instruction and the card on the right never overlap
        const rc = document.querySelector('[data-di-recall]');
        if (shown(rc)) {
          const c = rc.getBoundingClientRect();
          const ox = Math.min(b.right, c.right) - Math.max(b.left, c.left);
          const oy = Math.min(b.bottom, c.bottom) - Math.max(b.top, c.top);
          out.overlap = ox > 1 && oy > 1;
          out.recallLines = rc.querySelectorAll('li, p').length;
        }
      }
      out.texts = ['[data-di-instruction]', '[data-di-recall]']
        .map((sel) => document.querySelector(sel)?.textContent ?? '')
        .join(' ');
      return out;
    });
    check(
      r.has && r.covered.length === 0 && !r.overlap,
      `${label}: the instruction is on screen (${r.state}), nothing covers it, the card on the right beside it${r.covered.length ? ' — ' + r.covered.join(', ') : ''}${r.overlap ? ' — overlaps the card' : ''}`,
    );
    if (r.state === 'open') check(r.px >= 16, `${label}: the instruction is written at 16 px at least (${r.px} px)`);
    if (forbid) {
      const said = `${r.texts} ${(await road()).say}`;
      check(!forbid.test(said), `${label}: the islands name no rule before its tablet (${forbid})`);
    }
    await shot(label);
    return r;
  };
  /** Fires the held plank on bridge i; returns the GAME seconds he waited until the world was his again. */
  const fire = async (i, during) => {
    await toAltar(i);
    await act();
    expect((await st()).overlay !== 'predict', `bridge ${i}: a convoy asks no prediction before it builds`);
    let waited = 0.2;
    if (during) waited += (await during()) ?? 0;
    for (let k = 0; k < 400 && (await st()).phase !== 'play'; k += 1) {
      await ff(0.5);
      waited += 0.5;
    }
    await page.waitForTimeout(250);
    return waited;
  };
  const leaveAndReturn = async (where, exits) => {
    const sel = await w.reachable(page, exits);
    expect(sel !== null, `${where}: the ✕ is on screen and nothing covers it (${exits.join(' / ')})`);
    await page.click(sel);
    await page
      .waitForFunction((id) => !location.pathname.endsWith(`/${id}`) && !document.querySelector('.di-root'), ID, {
        timeout: 15000,
      })
      .catch(() => {});
    const gone = await page.evaluate(() => ({
      path: location.pathname,
      world: Boolean(document.querySelector('.di-root')),
    }));
    expect(!gone.path.endsWith(`/${ID}`) && !gone.world, `${where}: the ✕ leaves the lesson (${gone.path})`);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
  };
  /** HE WALKS BACK over the bridge `to` (lesson 5's walk: three presses on « back », never a teleport). */
  const walkBack = async (to, label) => {
    const before = await road();
    const across = () =>
      page.evaluate((k) => {
        const g = window.__world;
        const h = g.hero;
        const s = g.segs[k];
        const u = (h.pos.x - s.sx) * s.dx + (h.pos.z - s.sz) * s.dz;
        const v = (h.pos.x - s.sx) * s.rx + (h.pos.z - s.sz) * s.rz;
        const off = Math.atan2(g.camDir.x, g.camDir.y) - g.heading();
        return { u, v, len: s.len, lens: Math.abs(Math.atan2(Math.sin(off), Math.cos(off))) };
      }, to);
    const press = async () => {
      await page.keyboard.down('ArrowDown');
      await ff(0.1);
      await page.keyboard.up('ArrowDown');
    };
    await press();
    expect((await road()).facing === -1, `${label}: « back » turns him round`);
    await ff(1.4);
    {
      const a = await across();
      check(a.lens < 0.2, `${label}: the camera has swung behind him (${a.lens.toFixed(2)} rad off)`);
      await worldShot(`${label}-turned`);
    }
    await press();
    await ff(1.4);
    await press();
    await ff(0.3);
    expect((await road()).facing === -1, `${label}: pressed again, he faces back`);
    await page.keyboard.down('ArrowUp');
    let worst = 0;
    let steer = null;
    let toward = { pos: 'ArrowRight', neg: 'ArrowLeft' };
    let r = await road();
    for (let k = 0; k < 80 && r.island !== to; k += 1) {
      const was = await across();
      const want = Math.abs(was.v) > 0.35 ? (was.v > 0 ? toward.pos : toward.neg) : null;
      if (want !== steer) {
        if (steer) await page.keyboard.up(steer);
        if (want) await page.keyboard.down(want);
        steer = want;
      }
      await ff(0.15);
      const a = await across();
      if (steer && Math.abs(a.v) > Math.abs(was.v) + 0.05) toward = { pos: toward.neg, neg: toward.pos };
      if (a.u > 0.6 && a.u < a.len - 0.6) worst = Math.max(worst, Math.abs(a.v));
      r = await road();
    }
    await page.keyboard.up('ArrowUp');
    if (steer) await page.keyboard.up(steer);
    await ff(0.3);
    r = await road();
    expect(
      r.island === to && r.falls === before.falls,
      `${label}: he walked back over his bridge to « ${r.names[to]} » without falling (island ${r.island}; at most ${worst.toFixed(2)} from its axis)`,
    );
  };
  const crossAgain = async (i, label) => {
    const before = (await road()).falls;
    await page.keyboard.down('ArrowDown');
    await ff(0.1);
    await page.keyboard.up('ArrowDown');
    await ff(1.6);
    expect((await road()).facing === 1, `${label}: « back » again turns him to the road ahead`);
    await cross(i);
    expect((await road()).falls === before, `${label}: he crosses without falling`);
  };

  // ── forges ──
  const fg = () => page.evaluate(() => window.__forge);
  const iq = () => page.evaluate(() => window.__inquiry);
  const fillUse = async (vals) => {
    for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
    await page.click('[data-rf-use-check]');
    await page.waitForSelector('[data-rf-use-fb]');
    return page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb');
  };
  const forgeTools = async (where, root = '.rf-root') => {
    const t = await page.evaluate((R) => {
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
      return { exit: seen(`${R} [data-di-exit]`), sound: seen(`${R} [data-di-sound]`) };
    }, root);
    check(t.exit && t.sound, `${where}: its own ✕ and sound button, uncovered (${JSON.stringify(t)})`);
  };
  /** The forge's tiles: no tile, no chip, no heading leaves its column or is cut; tiles of a column on one line each. */
  const tilesFit = async (where) => {
    const bad = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll(
        '.rf-root [data-rf-tile], .rf-root .rf-slot > *:first-child, .rf-root .rf-chip',
      )) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (el.scrollWidth > el.clientWidth + 1) out.push(`cut: « ${el.textContent.trim().slice(0, 30)} »`);
        if (r.left < -1 || r.right > window.innerWidth + 1)
          out.push(`off screen: « ${el.textContent.trim().slice(0, 30)} »`);
      }
      return out;
    });
    check(
      bad.length === 0,
      `${where}: every tile, heading and chip whole on screen${bad.length ? ' — ' + bad.join(' | ') : ''}`,
    );
  };
  /** The last step's lines: each on ONE row (its boxes share a top), nothing leaves the forge. */
  const useLayout = async (where) => {
    const m = await page.evaluate(() => {
      const lines = [...document.querySelectorAll('.rf-root .rf-use')];
      const lefts = new Set(lines.map((l) => Math.round(l.getBoundingClientRect().left / 8)));
      const root = document.querySelector('.rf-root').getBoundingClientRect();
      const bad = [];
      lines.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        const boxes = [...l.querySelectorAll('[data-rf-use]')].map((b) => b.getBoundingClientRect());
        const tops = boxes.map((b) => b.top);
        if (tops.length && Math.max(...tops) - Math.min(...tops) > 6) bad.push(`line ${i + 1}: its boxes wrap`);
        const bh = boxes.length ? boxes[0].height : 30;
        if (r.height > bh * 1.9) bad.push(`line ${i + 1}: ${Math.round(r.height)} px tall (a box ${Math.round(bh)})`);
        if (r.right > root.right + 1 || r.left < root.left - 1 || r.bottom > root.bottom + 1)
          bad.push(`line ${i + 1} leaves the forge`);
      });
      const q = document.querySelector('.rf-root .rf-q');
      return {
        n: lines.length,
        columns: lefts.size,
        boxes: lines.map((l) => l.querySelectorAll('[data-rf-use]').length),
        q: q ? Math.round(q.getBoundingClientRect().height) : 0,
        bad,
      };
    });
    check(
      m.bad.length === 0,
      `${where}: the last step's ${m.n} lines (${m.columns} column(s), boxes ${m.boxes.join('/')}, question ${m.q} px tall) each on one row${m.bad.length ? ' — ' + m.bad.join(' | ') : ''}`,
    );
    return m;
  };
  const noName = async (where, re) => {
    const t = (await page.textContent('.rf-root')) ?? '';
    check(!re.test(t), `${where}: the mirror names nothing before the tablet (${re})`);
  };
  /** A false rule: refuted on his evidence, or (his evidence agrees) broken by the mirror's first attack. */
  const falseRule = async (name, tiles, truth) => {
    for (const t of tiles) await page.click(`[data-rf-tile="${t}"]`);
    await tilesFit(`${name}, the tiles`);
    await shot(`${name}-build`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted], [data-rf-agreed]', { timeout: 20000 });
    if (await page.locator('[data-rf-refuted]').count()) {
      const id = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
      const fb = (await page.textContent('[data-rf-refuted]')) ?? '';
      check(
        (await page.locator(`[data-rf-row="${id}"][data-rf-mark="refute"]`).count()) === 1 && !/خطأ|خاطئ/.test(fb),
        `${name}: « ${tiles.join(' + ')} » REFUTED on his own line ${id}, marked; said as a fact (« ${fb.trim().slice(0, 90)} »)`,
      );
      await shot(`${name}-refuted`);
    } else {
      await page.click('[data-rf-dare]');
      await page.waitForSelector('[data-rf-say]');
      const c = (await fg()).atk.list[0];
      const yes = truth(c);
      await page.click(`[data-rf-say="${yes ? 'yes' : 'no'}"]`);
      await page.click('[data-rf-fire]');
      await page.waitForSelector('[data-rf-broken]', { timeout: 20000 });
      const fb = (await page.textContent('[data-rf-broken]')) ?? '';
      check(
        !/خطأ|خاطئ/.test(fb) && (await page.locator('[data-rf-attack-next], [data-rf-seal]').count()) === 0,
        `${name}: « ${tiles.join(' + ')} » agrees with his lines, BROKEN by the mirror's attack ${JSON.stringify({ A: c.A, B: c.B, d: c.d, kind: c.kind, k: c.k })} (« ${fb.trim().slice(0, 90)} »)`,
      );
      await shot(`${name}-broken`);
    }
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
  };
  /** The right rule, its attacks (answered as the world does, computed by `truth`), the seal, the last step. */
  const rightRule = async (name, tiles, truth, last) => {
    for (const t of tiles) await page.click(`[data-rf-tile="${t}"]`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]', { timeout: 20000 });
    await shot(`${name}-agreed`);
    await page.click('[data-rf-dare]');
    await page.waitForSelector('[data-rf="attack"]');
    for (let i = 0; i < 6; i += 1) {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      const yes = truth(c);
      await page.click(`[data-rf-say="${yes ? 'yes' : 'no'}"]`);
      await page.click('[data-rf-fire]');
      await page.waitForSelector('[data-rf-survived]', { timeout: 20000 });
      check(
        true,
        `${name}: attack ${i + 1} ${JSON.stringify({ A: c.A, B: c.B, d: c.d, kind: c.kind, k: c.k })} answered « ${yes ? 'yes' : 'no'} » — the rule survives`,
      );
      if (i === 0) await shot(`${name}-attack`);
      const end = a.i + 1 >= a.list.length;
      await page.click('[data-rf-attack-next]');
      if (end) break;
      await page.waitForSelector('[data-rf-say]');
      await page.waitForTimeout(80);
    }
    await page.waitForSelector('[data-rf-sealed]');
    await page.click('[data-rf-seal]');
    await page.waitForSelector('[data-rf="use"]');
    await page.waitForTimeout(120);
    await last((await fg()).use.c);
    await page.waitForSelector('[data-di-my-rule]');
  };
  const tablet = async (key, n) => {
    await shot(`tablet-${n}`);
    check((await page.textContent('.di-card')).includes(TITLES[key]), `the tablet: « ${TITLES[key]} »`);
    await page.click('[data-di-tablet]');
    await ff(0.4);
    expect((await st()).keys.includes(key), `the key « ${key} » earned`);
  };
  /** The world's verdicts on a case, computed HERE. */
  const both = (c) => c.A % c.d === 0 && c.B % c.d === 0; // ➖, 🧮: the plank builds both gaps
  const longest = (c) => c.d === gcd(c.A, c.B); // 🪜, 🔁: the plank built both with the purse
  const notebooks = (c) => {
    const D = divisions(c.A, c.B);
    return { S: subtractions(c.A, c.B).length, D: D.length };
  };
  const race = (c) => {
    const { S, D } = notebooks(c);
    return c.kind === 'pick' ? D > S : S - D === c.k;
  };

  // ── the benches ──
  const BENCH_FORBIDDEN = ['PGCD', 'خوارزمي', 'إقليدس', 'أسرع', 'أطول', 'الأكبر', 'قاسم', 'آخر فرق', 'آخر باق'];
  const tellsNothing = async (where) => {
    const t = (await page.textContent('.iq')) ?? '';
    const said = BENCH_FORBIDDEN.filter((x) => t.includes(x));
    check(
      said.length === 0,
      `${where}: the bench names nothing of the rule it leads to${said.length ? ' — ' + said.join(', ') : ''}`,
    );
  };
  const inquiryFits = async (name, exit = ['[data-di-exit]', '[data-di-bench-back]']) => {
    await page.waitForTimeout(250);
    const bad = await page.evaluate((FLOOR) => {
      const out = [];
      const frame = document.querySelector('.iq');
      if (!frame) return ['no investigation on screen'];
      const box = frame.getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit')?.style.zoom) || 1;
      for (const el of frame.querySelectorAll(
        'button, input, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-askline, .iq-tpl, .iq-rung, .iq-both__col, .iq-found li',
      )) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)
          out.push(String(el.className?.baseVal ?? el.className).split(' ')[0] + ' leaves the frame');
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (top && !el.contains(top) && !top.contains(el))
            out.push('covered: « ' + (el.textContent.trim() || el.tagName).slice(0, 18) + ' »');
        }
        if (
          el.textContent.trim() &&
          !el.querySelector('*:not(.katex):not(.katex *)') &&
          parseFloat(getComputedStyle(el).fontSize) * zoom < FLOOR
        )
          out.push('text under 12 px: ' + String(el.className).split(' ')[0]);
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
      `${name}: the bench fits its frame — nothing cut, covered, scrolled or too small${bad.length ? ' — ' + bad.join(' | ') : ''}`,
    );
    await shot(name, { exit, numbers: true });
  };
  const stage = () => page.getAttribute('.iq [data-iq-stage], .iq[data-iq-stage]', 'data-iq-stage');
  const waitStage = (want, ms = 30000) =>
    page.waitForFunction((s) => document.querySelector('.iq')?.dataset.iqStage === s, want, { timeout: ms });
  const openBench = async (mode) => {
    await page.click('[data-di-bench-open]');
    await page.waitForSelector(`[data-di-bench="ladder"] .iq[data-iq-mode="${mode}"]`, { timeout: 8000 });
    await page.waitForTimeout(300);
  };
  /** A one-mode notebook (subtract / divide), plain: rows typed, left half-way, reopened, counted, ended. */
  const oneMode = async (label, mode, a, b) => {
    const rows =
      mode === 'divide'
        ? divisions(a, b).map((s) => ({ next: s.r ? [s.b, s.r] : null }))
        : subtractions(a, b).map((s) => ({ next: s.d ? [Math.max(s.y, s.d), Math.min(s.y, s.d)] : null }));
    await openBench(mode);
    const plain = await page.evaluate(() => ({
      plain: document.querySelector('.iq').hasAttribute('data-iq-plain'),
      ticks: document.querySelectorAll('.iq [data-iq-ticks]').length,
      head: document.querySelector('.iq .iq-rung--head small')?.textContent ?? null,
    }));
    check(
      plain.plain && plain.ticks === 0 && plain.head == null,
      `${label}: the bench is PLAIN — no column of common planks, no heading for it (${JSON.stringify(plain)})`,
    );
    await forgeTools(`${label}, the bench`, '.di-bench');
    await tellsNothing(`${label}, start`);
    await inquiryFits(`${label}-start`);
    const write = async (i) => {
      const [x, y] = rows[i].next;
      await page.fill('[data-iq-in="x"]', String(x));
      await page.fill('[data-iq-in="y"]', String(y));
      await page.click('[data-iq-write]');
      await page.waitForFunction(
        () => ['guess', 'count'].includes(document.querySelector('.iq')?.dataset.iqStage),
        null,
        {
          timeout: 8000,
        },
      );
      await page.waitForTimeout(120);
    };
    await write(0);
    const fact = (await page.textContent('[data-iq-fact]')) ?? '';
    check(
      fact.includes('كما كتبتَ'),
      `${label}: row 1 written, the fact says « as you wrote » (« ${fact.trim().slice(0, 80)} »)`,
    );
    await inquiryFits(`${label}-row1`);
    // he LEAVES half-way by the bench's back button, and reopens it
    const before = (await iq()).written;
    await page.click('[data-di-bench-back]');
    await page.waitForSelector('[data-di-workshop="typed"]');
    check(
      (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'kept',
      `${label}: back to the workshop half-way, the bench says it is KEPT`,
    );
    await openBench(mode);
    const now = await iq();
    check(
      now.written === before && now.written >= 1,
      `${label}: reopened, his ${before} written row(s) are still there (${now.written})`,
    );
    await write(1);
    expect((await stage()) === 'count', `${label}: two rows predicted, the notebook asks how many rows in all`);
    await tellsNothing(`${label}, the count`);
    await inquiryFits(`${label}-count`);
    await page.fill('[data-iq-in="count"]', String(rows.length));
    await page.click('[data-iq-count]');
    await waitStage('seen', 60000);
    await page.waitForTimeout(300);
    const end = await page.evaluate(() => ({
      gold: document.querySelector('.iq-ladder').innerHTML.includes('fbbf24'),
      isEnd: document.querySelectorAll('.iq-ladder .is-end').length,
      rows: document.querySelectorAll('.iq-ladder [data-iq-row]').length,
      fold: document.querySelector('.iq-ladder [data-iq-fold]')?.dataset.iqFold ?? null,
      // the grid's columns: the fourth (the planks') is empty on a plain bench — how wide is it?
      cols: getComputedStyle(document.querySelector('.iq-ladder .iq-rung')).gridTemplateColumns,
      ladder: (() => {
        const l = document.querySelector('.iq-ladder').getBoundingClientRect();
        const rows = [...document.querySelectorAll('.iq-ladder [data-iq-row]')].map((r) => {
          const kids = [...r.children].map((k) => k.getBoundingClientRect());
          return {
            left: Math.round(Math.min(...kids.map((k) => k.left)) - l.left),
            right: Math.round(l.right - Math.max(...kids.map((k) => k.right))),
          };
        });
        return { width: Math.round(l.width), rows };
      })(),
    }));
    check(
      !end.gold && end.isEnd === 0,
      `${label}: the end lights NO value gold (${JSON.stringify({ gold: end.gold, isEnd: end.isEnd })})`,
    );
    const gap = end.ladder.rows[0];
    check(
      gap.right <= gap.left + 24,
      `${label}: the rows fill the notebook — no empty column on the right (columns « ${end.cols} »; ${gap.left} px left, ${gap.right} px right of ${end.ladder.width})`,
    );
    await tellsNothing(`${label}, the end`);
    await inquiryFits(`${label}-end`);
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-di-workshop="typed"]');
    return end;
  };

  // ══════════════════════════ the title ══════════════════════════
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(1200);
  expect(
    (await page.textContent('.di-title h1')).includes('مرسى الممرّين'),
    'the title screen is this lesson’s own story (« مرسى الممرّين »)',
  );
  await shot('title');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  lap('title');

  // ══════════════════ islands A–D: the convoy of THREE bridges, 152, 95, 57; planks 8, 19, 5, 3 on A ══════════════════
  const [D1, D2, D3] = [152, 95, 57];
  {
    const r = await road();
    const peds = await page.evaluate(() => window.__world.isl[0].pedestals.map((p) => p.b));
    expect(
      r.segs[0].a === D1 && r.segs[1].a === D2 && r.segs[2].a === D3 && D1 - D2 === D3,
      `the road starts with three gaps, ${D1}, ${D2}, ${D3} = ${D1} − ${D2}`,
    );
    const three = peds.filter((b) => [D1, D2, D3].every((a) => fills(a, b)));
    expect(
      peds.length === 4 && three.length === 1,
      `island A offers ${peds.join(', ')}: ONE builds the three (${three}) — computed here`,
    );
    check(
      r.objective.length > 200 && [D1, D2, D3].every((n) => r.objective.includes(String(n))),
      `island A: the instruction names the three gaps (${r.objective.length} characters)`,
    );
    await worldShot('island-a');
    await page.click('[data-di-instruction-fold]');
    await page.waitForTimeout(200);
    check(
      (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'folded',
      'island A: the instruction folds',
    );
    await worldShot('island-a-folded');
    await page.click('[data-di-instruction-fold]');
    await page.waitForTimeout(200);
  }
  const PLANK_A = 19;
  const firstOnly = 8;
  expect(fills(D1, firstOnly) && !fills(D2, firstOnly), `sanity: ${firstOnly} fills ${D1}, not ${D2}`);
  await take(firstOnly);
  await worldShot('a-holds-8');
  await fire(0);
  expect(await standsWith(0, firstOnly), `${D1} = ${firstOnly} × ${D1 / firstOnly}: the first bridge holds`);
  await cross(0);
  await page.waitForTimeout(300);
  {
    const r = await road();
    expect(r.stage === 1 && r.held === firstOnly, `island B: he carries the planks ${firstOnly}`);
    await worldShot('island-b');
  }
  await fire(1, async () => {
    expect(await until((r) => r.verdict != null, 12), 'the world shows its verdict on 95');
    const v = (await road()).verdict;
    expect(
      !v.holds && v.r === D2 % firstOnly,
      `${D2} = ${firstOnly} × ${Math.floor(D2 / firstOnly)} + ${D2 % firstOnly}: refused (${JSON.stringify(v)})`,
    );
    await worldShot('g95-refused');
    return 0;
  });
  {
    const r = await road();
    check(
      !r.segs[1].complete && r.objective.includes(r.names[0]),
      `95 fell; the instruction sends him back to « ${r.names[0]} » (« ${r.objective} »)`,
    );
    await worldShot('back-to-a-instruction');
  }
  await walkBack(0, 'walk-back-to-a');
  await take(PLANK_A);
  {
    const r = await road();
    check(!r.segs[0].complete, `planks of ${PLANK_A} taken on A: the bridge of ${firstOnly} goes back`);
    await worldShot('a-holds-19');
  }
  await ff(1.2);
  await fire(0);
  expect(await standsWith(0, PLANK_A), `${D1} = ${PLANK_A} × ${D1 / PLANK_A}: the first bridge holds`);
  await crossAgain(0, 'A → B with 19');
  await page.waitForTimeout(300);
  await fire(1);
  expect(await standsWith(1, PLANK_A), `${D2} = ${PLANK_A} × ${D2 / PLANK_A}: the second bridge holds`);
  await cross(1);
  await page.waitForTimeout(300);
  // ── the page is RELOADED on island C, inside the convoy ──
  {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
    await ff(0.5);
    const r = await road();
    expect(
      r.phase === 'play' &&
        r.stage === 2 &&
        r.island === 2 &&
        (await standsWith(0, PLANK_A)) &&
        (await standsWith(1, PLANK_A)) &&
        r.held === PLANK_A,
      `after a reload he is on island C, two bridges of ${PLANK_A} behind him, the planks in hand (stage ${r.stage}, island ${r.island}, held ${r.held})`,
    );
    const card = (await page.textContent('[data-di-recall]').catch(() => '')) ?? '';
    check(
      card.includes(String(D3)),
      `after a reload: the card on the right recalls the third gap ${D3} (« ${card.trim().slice(0, 100)} »)`,
    );
    await worldShot('reload-on-c');
  }
  await fire(2);
  expect(await standsWith(2, PLANK_A), `${D3} = ${PLANK_A} × ${D3 / PLANK_A}: the third bridge holds`);
  await cross(2);
  await page.waitForTimeout(600);
  lap('convoy diff');

  // ══════════════════════════ forge ➖ « الفرق يحفظ الألواح المشتركة » — island D ══════════════════════════
  expect((await st()).stage === 3 && (await st()).overlay === 'forge', 'island D opens the mirror ➖');
  {
    const f = await fg();
    const ids = f.rows.map((r) => `${r.A}:${r.B}:${r.d}`);
    check(
      f.phase === 'build' && ids.includes(`${D1}:${D2}:${firstOnly}`) && ids.includes(`${D1}:${D2}:${PLANK_A}`),
      `forge ➖ opens on its tiles; his lines are the planks he laid (${ids.join(', ')})`,
    );
  }
  await forgeTools('forge ➖, the tiles');
  await tilesFit('forge ➖');
  await noName('forge ➖, the tiles', /يحفظ|PGCD/);
  await shot('forge1-tiles');
  await page.click('[data-rf-tile="how:all"]');
  await leaveAndReturn('inside forge ➖', ['.rf-root [data-di-exit]']);
  await ff(1.5);
  await page.waitForSelector('[data-rf="build"]', { timeout: 15000 });
  check(
    (await st()).stage === 3 && (await st()).overlay === 'forge',
    'back from the forge’s ✕: the same mirror waits on D',
  );
  await falseRule('forge1', ['how:all', 'look:diff'], both);
  await rightRule('forge1', ['how:all', 'look:pair'], both, async (u) => {
    const D = u.A - u.B;
    const g = gcd(u.A, u.B);
    await useLayout('forge ➖, the last step');
    // the second line: a box between « PGCD(B ; » and « ) »
    const box = await page.evaluate(() => {
      const line = document.querySelectorAll('.rf-root .rf-use')[1];
      const kids = [...line.children];
      const i = kids.findIndex((k) => k.querySelector('[data-rf-use="p"]'));
      const r = (el) => el?.getBoundingClientRect();
      return {
        before: kids[i - 1]?.textContent ?? null,
        after: kids[i + 1]?.textContent ?? null,
        inOrder: r(kids[i - 1]).right <= r(kids[i]).left + 3 && r(kids[i]).right <= r(kids[i + 1]).left + 3,
      };
    });
    check(
      /PGCD\(\d+ ;$/.test(box.before?.trim() ?? '') && box.after?.trim() === ')' && box.inOrder,
      `forge ➖: the box of the second line sits between « ${box.before} » and « ${box.after} », left to right`,
    );
    expect((await fillUse({ d: D, p: D, g: D === g ? D + 1 : D })) !== 'ok' || D !== g, 'a wrong PGCD is refused');
    await shot('forge1-use-wrong');
    expect(
      (await fillUse({ d: D, p: D, g })) === 'ok',
      `${u.A} − ${u.B} = ${D}; PGCD(${u.A} ; ${u.B}) = ${g} — computed here`,
    );
  });
  await tablet('farq-yabqi', 1);
  forbid = /خوارزمي|إقليدس|أسرع|الباقي يحفظ/;
  {
    const r = await worldShot('island-d');
    console.log(
      `NOTE  island D: the card on the right shows ${r.recallLines} line(s): « ${(await page.textContent('[data-di-recall]').catch(() => ''))?.trim()} »`,
    );
  }
  lap('forge ➖');

  // ══════════════════ islands D–F: the convoy « tarh » — 259 then 185, 12 coins, the subtraction notebook ══════════════════
  const [T1, T2] = [259, 185];
  await openWorkshop(3);
  check(
    (await page.getAttribute('[data-di-gaps]', 'data-di-gaps')) === `${T1},${T2}`,
    `the workshop of D names ${T1} and ${T2}`,
  );
  await shot('workshop-d', { exit: ['.di-veil [data-di-exit]'], numbers: true });
  await oneMode('bench-subtract', 'subtract', T1, T2);
  const P_T = gcd(T1, T2);
  await craft(P_T);
  await fire(3);
  expect(await standsWith(3, P_T), `${T1} = ${P_T} × ${T1 / P_T}`);
  await cross(3);
  await page.waitForTimeout(300);
  await fire(4);
  expect(await standsWith(4, P_T), `${T2} = ${P_T} × ${T2 / P_T}; ${T1 / P_T} + ${T2 / P_T} coins`);
  await cross(4);
  await page.waitForTimeout(600);
  lap('convoy tarh');

  // ══════════════════════════ forge 🪜 « خوارزمية الفروق » — island F ══════════════════════════
  expect((await st()).stage === 5 && (await fg())?.key === 'khawarizmiyat-al-tarh', 'island F opens the mirror 🪜');
  await forgeTools('forge 🪜, the tiles');
  await tilesFit('forge 🪜');
  await noName('forge 🪜, the tiles', /خوارزمي/);
  await shot('forge2-tiles');
  await falseRule('forge2', ['next:sd', 'stop:zero', 'make:first'], longest);
  await rightRule('forge2', ['next:sd', 'stop:zero', 'make:last'], longest, async (u) => {
    const S = subtractions(u.A, u.B);
    await useLayout('forge 🪜, the last step');
    const vals = { d1: S[0].d };
    for (const i of [2, 3])
      Object.assign(vals, { [`x${i}`]: S[i - 1].x, [`y${i}`]: S[i - 1].y, [`d${i}`]: S[i - 1].d });
    expect(
      (await fillUse({ ...vals, g: 0 })) === 'zero',
      'the last step: 0 as the plank is refused with its own sentence',
    );
    await shot('forge2-use-wrong');
    expect(
      (await fillUse({ ...vals, g: gcd(u.A, u.B) })) === 'ok',
      `${u.A} and ${u.B}: three subtractions, PGCD ${gcd(u.A, u.B)}`,
    );
  });
  await tablet('khawarizmiyat-al-tarh', 2);
  forbid = /إقليدس|أسرع|الباقي يحفظ/;

  // ══════════════════════════ forge 🧮 « الباقي يحفظ الألواح المشتركة » — island F, its fold ══════════════════════════
  await page.waitForSelector('.rf-root .iq[data-iq-mode="fold"]', { timeout: 15000 });
  expect((await fg())?.key === 'baqi-yabqi', 'the second mirror of F opens on its experiment: the fold');
  await inquiryFits('fold-writing', ['.rf-root [data-di-exit]']);
  {
    const [F1, F2] = [962, 296];
    const runs = divisions(F1, F2);
    for (let k = 0; k < runs.length; k += 1) {
      const got = await page
        .waitForFunction(() => ['fold', 'seen'].includes(document.querySelector('.iq')?.dataset.iqStage), null, {
          timeout: 30000,
        })
        .then(() => stage());
      if (got === 'seen') break;
      const run = runs[(await iq()).run];
      if (k === 0) {
        await inquiryFits('fold-ask', ['.rf-root [data-di-exit]']);
        await page.fill('[data-iq-in="q"]', String(run.q - 1));
        await page.fill('[data-iq-in="r"]', String(run.r + run.b));
        await page.click('[data-iq-fold-go]');
        await page.waitForTimeout(400);
        check(
          (await stage()) === 'fold' && (await page.locator('[data-iq-counted]').count()) > 0,
          `the fold: ${run.q - 1} and ${run.r + run.b} — the rows are counted on screen, he folds again`,
        );
        await inquiryFits('fold-miss', ['.rf-root [data-di-exit]']);
      }
      await page.fill('[data-iq-in="q"]', String(run.q));
      await page.fill('[data-iq-in="r"]', String(run.r));
      await page.click('[data-iq-fold-go]');
      await page.waitForTimeout(400);
    }
    await waitStage('seen', 30000);
    await page.waitForTimeout(300);
    await tellsNothing('the fold, its end');
    await inquiryFits('fold-seen', ['.rf-root [data-di-exit]']);
  }
  await page.click('.rf-root [data-iq-next]');
  await page.waitForSelector('[data-rf="build"]', { timeout: 15000 });
  await tilesFit('forge 🧮');
  await noName('forge 🧮, the tiles', /الباقي يحفظ/);
  await shot('forge3-tiles');
  await falseRule('forge3', ['look:br', 'zero:none'], both);
  await rightRule('forge3', ['look:br', 'zero:any'], both, async (u) => {
    const [d] = divisions(u.A, u.B);
    await useLayout('forge 🧮, the last step');
    expect((await fillUse({ q: d.q, r: d.r, p: d.r, g: 1 })) !== 'ok', 'a wrong PGCD is refused');
    expect(
      (await fillUse({ q: d.q, r: d.r, p: d.r, g: gcd(u.A, u.B) })) === 'ok',
      `${u.A} = ${u.B} × ${d.q} + ${d.r}; PGCD ${gcd(u.A, u.B)}`,
    );
  });
  await tablet('baqi-yabqi', 3);
  forbid = /إقليدس|أسرع/;
  await worldShot('island-f');
  lap('forges 🪜 🧮');

  // ══════════════════ islands F–H: the convoy « iqlidis » — 1833 then 546, 61 coins, the division notebook ══════════════════
  const [I1, I2] = [1833, 546];
  await openWorkshop(5);
  await oneMode('bench-divide', 'divide', I1, I2);
  // 13 fills 1833, but 141 planks: the purse (61) runs out — computed here
  const cheap = 13;
  expect(
    fills(I1, cheap) && I1 / cheap > 61,
    `sanity: ${cheap} fills ${I1} with ${I1 / cheap} planks, more than 61 coins`,
  );
  await craft(cheap);
  {
    const t = await fire(5, async () => {
      let s = 0;
      for (let k = 0; k < 400 && !(await road()).verdict; k += 1) {
        await ff(0.5);
        s += 0.5;
      }
      const v = (await road()).verdict;
      check(v?.purse === true, `${cheap} on ${I1}: the coins run out (${JSON.stringify(v)})`);
      await worldShot('purse-out-1833');
      return s;
    });
    waits.push(`13 on 1833 (61 planks, the purse runs out): ${t.toFixed(1)} s`);
  }
  await openWorkshop(5);
  const P_I = gcd(I1, I2);
  await craft(P_I);
  {
    const t = await fire(5, async () => {
      await ff(3);
      await worldShot('g1833-building');
      return 3;
    });
    waits.push(`39 on 1833 (47 planks): ${t.toFixed(1)} s`);
  }
  expect(await standsWith(5, P_I), `${I1} = ${P_I} × ${I1 / P_I}`);
  await worldShot('g1833-held');
  await cross(5);
  await page.waitForTimeout(300);
  {
    const t = await fire(6);
    waits.push(`39 on 546 (14 planks): ${t.toFixed(1)} s`);
  }
  expect(await standsWith(6, P_I), `${I2} = ${P_I} × ${I2 / P_I}`);
  await cross(6);
  await page.waitForTimeout(600);
  lap('convoy iqlidis');

  // ══════════════════════════ forge 🔁 « خوارزمية إقليدس » — island H ══════════════════════════
  expect((await st()).stage === 7 && (await fg())?.key === 'iqlidis', 'island H opens the mirror 🔁');
  await tilesFit('forge 🔁');
  await noName('forge 🔁, the tiles', /إقليدس/);
  await shot('forge4-tiles');
  await falseRule('forge4', ['next:sr', 'stop:zero', 'make:count'], longest);
  await rightRule('forge4', ['next:sr', 'stop:zero', 'make:last'], longest, async (u) => {
    const D = divisions(u.A, u.B);
    const m = await useLayout('forge 🔁, the last step');
    check(m.n === 4, `forge 🔁: the last step has 4 lines (${m.n}), in ${m.columns} column(s)`);
    const vals = { q1: D[0].q, r1: D[0].r };
    for (const i of [2, 3])
      Object.assign(vals, {
        [`a${i}`]: D[i - 1].a,
        [`b${i}`]: D[i - 1].b,
        [`q${i}`]: D[i - 1].q,
        [`r${i}`]: D[i - 1].r,
      });
    expect((await fillUse({ ...vals, g: 0 })) === 'zero', 'the last step: 0 refused with its sentence');
    await shot('forge4-use-wrong');
    expect(
      (await fillUse({ ...vals, g: gcd(u.A, u.B) })) === 'ok',
      `${u.A} and ${u.B}: three divisions, PGCD ${gcd(u.A, u.B)}`,
    );
  });
  await tablet('iqlidis', 4);
  forbid = /أسرع/;
  lap('forge 🔁');

  // ══════════════════ islands H–J: the convoy « sibaq » — 1003 then 34, 61 coins, both notebooks ══════════════════
  const [S1, S2] = [1003, 34];
  await openWorkshop(7);
  await page.click('[data-di-bench-open]');
  await page.waitForSelector('[data-di-bench="ladder"] .iq[data-iq-mode="both"]', { timeout: 8000 });
  await page.waitForTimeout(300);
  {
    const nb = notebooks({ A: S1, B: S2 });
    await tellsNothing('bench both, start');
    await inquiryFits('bench-both-start');
    await page.click('[data-iq-shorter="divide"]');
    await page.fill('[data-iq-in="by"]', String(nb.S - nb.D));
    await inquiryFits('bench-both-said');
    const t0 = Date.now();
    await page.click('[data-iq-run]');
    await waitStage('seen', 90000);
    console.log(
      `NOTE  the two notebooks of ${S1} and ${S2} ran in ${((Date.now() - t0) / 1000).toFixed(1)} s (real time)`,
    );
    await page.waitForTimeout(300);
    const steps = await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll('[data-iq-col]')].map((c) => [c.dataset.iqCol, Number(c.dataset.iqSteps)]),
      ),
    );
    check(
      steps.subtract === nb.S && steps.divide === nb.D,
      `the two notebooks: ${nb.S} subtractions against ${nb.D} divisions — computed here (${JSON.stringify(steps)})`,
    );
    check(
      ((await page.textContent('[data-iq-fact]')) ?? '').includes('كما قلتَ'),
      'his prediction (divide, by 29) is said back « كما قلتَ »',
    );
    await tellsNothing('bench both, the end');
    await inquiryFits('bench-both-seen');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-di-workshop="typed"]');
  }
  const P_S = gcd(S1, S2);
  await craft(P_S);
  {
    const t = await fire(7);
    waits.push(`17 on 1003 (59 planks): ${t.toFixed(1)} s`);
  }
  expect(await standsWith(7, P_S), `${S1} = ${P_S} × ${S1 / P_S}`);
  await cross(7);
  await page.waitForTimeout(300);
  await fire(8);
  expect(await standsWith(8, P_S), `${S2} = ${P_S} × ${S2 / P_S}; ${S1 / P_S} + ${S2 / P_S} = 61 coins`);
  {
    const left = (await road()).purse?.left;
    check(
      left === 0 || left == null,
      `the last plank takes the last coin (the purse: ${left}, its chip « ${await chip()} »)`,
    );
  }
  await cross(8);
  await page.waitForTimeout(600);
  lap('convoy sibaq');

  // ══════════════════════════ forge ⏱️ « أيّ الخوارزميتين أسرع » — island J ══════════════════════════
  expect((await st()).stage === 9 && (await fg())?.key === 'aqall-khutuwat', 'island J opens the mirror ⏱️');
  await tilesFit('forge ⏱️');
  await noName('forge ⏱️, the tiles', /أسرع/);
  {
    const log = await page.evaluate(() =>
      [...document.querySelectorAll('.rf-root [data-rf-row]')].map((r) => r.textContent.trim()),
    );
    console.log(`NOTE  forge ⏱️, his evidence as the log writes it: ${log.map((l) => `« ${l} »`).join(' | ')}`);
    check(
      !log.some((l) => /لوح/.test(l)),
      `forge ⏱️ is about notebooks: no line of its log says « لوح » (A10) — ${log.join(' | ')}`,
    );
  }
  await shot('forge5-tiles');
  await falseRule('forge5', ['gather:q', 'pick:small'], race);
  await rightRule('forge5', ['gather:q', 'pick:divide'], race, async (u) => {
    const D = divisions(u.A, u.B);
    const S = subtractions(u.A, u.B).length;
    const q = ((await page.textContent('.rf-root .rf-q')) ?? '').trim();
    const m = await useLayout('forge ⏱️, the last step');
    console.log(`NOTE  forge ⏱️: the last step's question has ${q.length} characters, drawn ${m.q} px tall`);
    const vals = { q1: D[0].q, r1: D[0].r, b2: D[1].b, q2: D[1].q, r2: D[1].r };
    expect(
      (await fillUse({ ...vals, s: D.length, g: gcd(u.A, u.B) })) === 'count',
      'the last step: counting the divisions as rows is refused',
    );
    await shot('forge5-use-wrong');
    expect(
      (await fillUse({ ...vals, s: S, g: gcd(u.A, u.B) })) === 'ok',
      `${u.A} and ${u.B}: ${S} subtractions, the piece ${gcd(u.A, u.B)}`,
    );
  });
  await tablet('aqall-khutuwat', 5);
  forbid = null;
  await worldShot('island-j');
  lap('forge ⏱️');

  // ══════════════════════════ the gate dash: island J → K ══════════════════════════
  {
    const p = await page.evaluate(() => [window.__world.boardHome.x, window.__world.boardHome.z]);
    await tp(p[0], p[1] + 0.2);
    await ff(0.3);
    await act();
    await ff(0.6);
    expect(Boolean(await page.evaluate(() => window.__world.getState().dash)), 'the board moves');
    await ff(1.5);
    await shot('dash');
    /** The right gate of a wave, computed HERE from its sentence. */
    const laneOf = (x) => {
      const n = (x.say.match(/\d+/g) ?? []).map(Number);
      let ok;
      if (/الطرح/.test(x.say)) ok = x.gates.map((g) => g === subtractions(n[0], n[1]).length);
      else if (/القسمات/.test(x.say)) ok = x.gates.map((g) => g === divisions(n[0], n[1]).length);
      else if (/\\square\)/.test(x.say)) ok = x.gates.map((g) => g >= 1 && gcd(n[2], g) === gcd(n[0], n[1]));
      else ok = x.gates.map((g) => g === gcd(n[0], n[1]));
      check(ok.filter(Boolean).length === 1, `wave « ${x.say} »: exactly one gate is right (${x.gates.join(', ')})`);
      return ok.indexOf(true);
    };
    const waves = await page.evaluate(() => window.__world.dash.waves.map((x) => ({ say: x.say, gates: x.gates })));
    const lanes = waves.map(laneOf);
    for (let k = 0; k < 400 && (await page.evaluate(() => Boolean(window.__world.getState().dash))); k += 1) {
      await page.evaluate((ls) => {
        const d = window.__world.dash;
        if (d && d.waves[d.wave]) d.lane = ls[d.wave];
      }, lanes);
      await ff(0.25);
    }
  }
  for (let k = 0; k < 30 && (await st()).stage !== 10; k += 1) await ff(1);
  await page.waitForTimeout(500);
  expect((await st()).stage === 10, `island K: the dash is ridden (stage ${(await st()).stage})`);
  lap('dash');

  // ═══════════════ the last bridge: two lanes, 1176 then 868 — planks of 56 or 28 ═══════════════
  const [P1, P2] = [1176, 868];
  const A = P1 + P2;
  await worldShot('island-k');
  await toAltar(10);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  expect(
    (await st()).overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes(String(A)),
    `the store opens on the lesson’s problem: ${A} cells, the two lanes end to end`,
  );
  const moulds = await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
  const good = moulds.filter((b) => fills(P1, b) && fills(P2, b));
  const bad = moulds.find((b) => !good.includes(b));
  expect(
    moulds.length === 2 && good.length === 1 && good[0] === gcd(P1, P2) && fills(P1, bad) && !fills(P2, bad),
    `the store offers ${moulds.join(' and ')}: ${good} = PGCD(${P1} ; ${P2}); ${bad} fills the first lane alone — computed here`,
  );
  await shot('boss');
  await page.click(`[data-di-mould="${bad}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(Math.floor(A / bad)));
  await page.fill('[data-di-r]', String(A % bad));
  await page.click('[data-di-check]');
  await ff(15);
  await page.waitForTimeout(400);
  {
    const o = (await st()).o;
    check(
      o?.type === 'boss' && o.view === 'choose' && o.tried[bad] === A % bad,
      `planks of ${bad} leave ${A % bad} cells: he chooses again`,
    );
    const say = (await road()).say;
    check(
      say.includes(String(P2)) && say.includes(String(P2 % bad)),
      `the world says WHICH lane is not filled (« ${say.slice(0, 100)} »)`,
    );
  }
  await shot('boss-tried');
  await page.click(`[data-di-mould="${good[0]}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(A / good[0]));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  {
    let s = 0;
    for (let k = 0; k < 120 && (await st()).o?.view !== 'cost'; k += 1) {
      await ff(0.5);
      s += 0.5;
    }
    waits.push(`the last bridge, ${A / good[0]} planks of ${good[0]}: ${s.toFixed(1)} s`);
  }
  const Q = A / good[0];
  expect((await st()).o?.view === 'cost', `the bridge of ${A} holds with ${Q} planks: the store asks their price`);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  const price = Number((await page.textContent('[data-di-boss-price]')).trim());
  await shot('boss-cost');
  await page.fill('[data-di-cost]', String(Q * price + 1));
  await page.click('[data-di-check]');
  await page.waitForTimeout(300);
  check(
    ((await page.textContent('[data-di-boss-error]')) ?? '').includes('ثمن اللوح'),
    'a wrong price is refused with a sentence',
  );
  await page.fill('[data-di-cost]', String(Q * price));
  await page.click('[data-di-check]');
  await ff(0.5);
  expect((await st()).overlay == null, `paid ${Q * price} دج (${Q} × ${price})`);
  await cross(10);
  await ff(3);
  await page.waitForTimeout(500);
  await shot('finale');
  await ff(6);
  await page.waitForTimeout(600);
  await shot('end');
  expect((await st()).overlay === 'end', 'the landing is reached and the end screen shows');
  lap('the end');
  for (const x of waits) console.log(`WAIT  ${x}`);
});
