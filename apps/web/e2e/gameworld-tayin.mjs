// « أرخبيل القواسم: مرفأ الرصيفين » — walk of the game world of lesson `tayin-pgcd` (lesson 5) as a STUDENT: its own story
// in the unit's world, PLAYED through its screens from the title to the end screen. No plank is offered anywhere: on each
// head island (A, C, E, G) he MAKES his plank in a WORKSHOP — he types its length (Workshop.jsx, the typed form) — and the
// plank builds the bridges of a CONVOY paid by a PURSE (GAME_WORLD.md §2ter-1). Every key is met on the islands:
//   A → B → C  32 then 44, 19 coins: 8 (the second gap refuses it — the ✕ of the world there — he walks back), 2 (the
//              purse runs out on 44 — the page is RELOADED on B — he walks back), the WORKSHOP's ✕, the BENCH « دفتر
//              القوائم » (the `lists` kind with `crown: false`: a length refused, a list said complete too early, both
//              lists built, a wrong link, « all linked » too early, the links, NO crown; the ✕ inside the bench; reopened:
//              his lists are kept), an empty box, a length too long and 0 refused, then 4 typed (Enter) builds both.
//              C: the mirror 📋 — a false rule refuted on HIS planks, the attacks drawn as two bridges, the seal, the last
//              step (lists of 58 and 87, a wrong PGCD first), the tablet; the ✕ inside this forge.
//   C → D → E  27 and 27, 2 coins: 9 (the purse), then 27.
//   E → F → G  27 then a gap of 0 cells whose bridge STANDS: 9 (the purse), 27; the gap of 0 crossed without building — no
//              prompt at its altar, the purse untouched. G: the mirror ⚡ — a false rule broken by the mirror's attack (a
//              gap of one cell), the right one, its attacks, the last step, the tablet.
//   G → H → I  19 then 76, 5 coins: 1 (the purse), then 19. I: the mirror 🎯 — a false rule broken on 90 and 36.
//   I → J      the gate dash (lanes computed here from each sentence);  J → K  the store of the last bridge (22 first,
//              its divisions, the price, its way out), the harbour, the end.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas left to
// right on one line, no word or number of lessons 1–4 (nor of the 1AM / 2AM lessons of the world), a way out reachable,
// no text under 12 px. On every world screen: the instruction is there, big, uncovered, and names no rule before its
// tablet. Every bench screen: nothing leaves its frame, no button covered, SVG text at its real size, nothing names a rule.
// The answers are computed HERE from the numbers on screen (state hooks are read for the question, never for the answer).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-tayin.mjs [outDir]
import { createWalk, FLOOR_PX, lessonUrl } from './lib/walk.mjs';
import { ID as SHARED_ID, TITLES, TAYIN_FOREIGN, TAYIN_NUMBERS, gcd, divisors, common } from './lib/tayin.mjs';

// the lesson this walk plays, named here (scripts/lesson-v2-status.mjs finds a lesson's world walk by its id) — the same id
// the lesson's other walks share through lib/tayin.mjs
const ID = 'tayin-pgcd';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
if (ID !== SHARED_ID) throw new Error(`this walk plays ${ID}, lib/tayin.mjs names ${SHARED_ID}`);

const w = createWalk('gameworld-tayin', { foreign: TAYIN_FOREIGN, foreignNumbers: TAYIN_NUMBERS });
const { expect, check } = w;
/** The way out of any screen of the world: the top bar's ✕, the forge's own ✕, the ✕ drawn over a dialog. */
const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
const fills = (n, d) => n % d === 0;
/** Does plank b build every gap of `gaps` with `purse` coins (a coin per plank)? Computed here. */
const buildsAll = (gaps, purse, b) => gaps.every((a) => fills(a, b)) && gaps.reduce((s, a) => s + a / b, 0) <= purse;

await w.run(async () => {
  const { page } = await w.student({ uid: 9941, lessonId: ID, url: URL });
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
  /** Goes to the anvil of island i (its workshop), between it and the island's centre. */
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
  /** Opens the workshop of island i (E at its anvil): the typed form. */
  const openWorkshop = async (i) => {
    await toAnvil(i);
    await act();
    await page.waitForSelector('[data-di-workshop="typed"]', { timeout: 8000 });
    await page.waitForTimeout(150);
  };
  const workshopError = () => page.textContent('[data-di-workshop-error]').catch(() => null);
  /** He types b in the workshop and makes it (the button, or Enter). */
  const craft = async (b, how = 'button') => {
    await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', String(b));
    if (how === 'enter') await page.press('[data-di-workshop="typed"] [data-di-in="plank"]', 'Enter');
    else await page.click('[data-di-workshop="typed"] [data-di-craft]');
    await ff(0.3);
    expect((await st()).held === b && (await st()).overlay == null, `the workshop makes a plank of ${b} and closes`);
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

  // ── the forges: what all three share ──
  const fg = () => page.evaluate(() => window.__forge);
  const iq = () => page.evaluate(() => window.__inquiry);
  const fact = async () => (await page.textContent('[data-iq-fact]')) ?? '';
  const iqText = async () => (await page.textContent('.iq')) ?? '';
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
  const fillUse = async (vals) => {
    for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
    await page.click('[data-rf-use-check]');
    await page.waitForSelector('[data-rf-use-fb]');
    return page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb');
  };
  /** The forge covers the top bar: its OWN ✕ and sound button are on screen, uncovered, and its header keeps one row. */
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
      const head = document.querySelector(`${R} .rf-head`);
      const kids = [...head.children].map((k) => k.getBoundingClientRect());
      const apart = kids.every((a, i) =>
        kids.every((b, j) => i >= j || a.right <= b.left + 1 || b.right <= a.left + 1),
      );
      return {
        exit: seen(`${R} [data-di-exit]`),
        sound: seen(`${R} [data-di-sound]`),
        apart,
        inScreen: kids.every((k) => k.left >= -1 && k.right <= window.innerWidth + 1),
      };
    }, root);
    check(
      t.exit && t.sound && t.apart && t.inScreen,
      `${where}: the screen shows its ✕ and its sound button, uncovered, beside its title (${JSON.stringify(t)})`,
    );
  };
  /** An investigation screen (the bench): nothing leaves its frame, no button is covered, no text under 12 px. */
  const inquiryFits = async (name) => {
    await page.waitForTimeout(250);
    const bad = await page.evaluate((FLOOR) => {
      const out = [];
      const frame = document.querySelector('.iq');
      if (!frame) return ['no investigation on screen'];
      const box = frame.getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit').style.zoom) || 1;
      for (const el of frame.querySelectorAll(
        'button, input, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-scene, .iq-found li, .iq-chips, .iq-tpl, .iq-askline, .iq-lists',
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
      // the words drawn in the scene (SVG text) at the size they are DRAWN (font × the scene's scale)
      for (const svg of frame.querySelectorAll('svg.iq-scene')) {
        const vb = svg.viewBox.baseVal;
        const sr = svg.getBoundingClientRect();
        if (!vb || !vb.width || !sr.width) continue;
        const k = Math.min(sr.width / vb.width, sr.height / vb.height);
        for (const el of svg.querySelectorAll('text')) {
          if (!el.getClientRects().length) continue;
          const t = el.textContent.trim();
          if (!t) {
            out.push('an empty label drawn in the scene');
            continue;
          }
          const px = parseFloat(getComputedStyle(el).fontSize) * k;
          if (px < FLOOR)
            out.push(`scene text under 12 px: « ${t.slice(0, 20)} » (${px.toFixed(1)} px, scene ×${k.toFixed(2)})`);
        }
      }
      const texts = [...frame.querySelectorAll('svg text')]
        .map((e) => ({ t: e.textContent.trim(), r: e.getBoundingClientRect() }))
        .filter((x) => x.t && x.r.width);
      for (let i = 0; i < texts.length; i += 1)
        for (let j = i + 1; j < texts.length; j += 1) {
          const a = texts[i].r;
          const b = texts[j].r;
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 2 && oy > 2) out.push(`scene texts overlap: « ${texts[i].t} » / « ${texts[j].t} »`);
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
      `${name}: the bench fits its frame — nothing cut, covered, scrolled, overlapping or too small${bad.length ? ' — ' + bad.join(' | ') : ''}`,
    );
    await shot(name, { exit: ['[data-di-exit]', '[data-di-bench-back]'], numbers: true });
  };
  /** Nothing on the bench names what the key of island C is about to forge (A1): no divisor, no « common », no longest. */
  const BENCH_FORBIDDEN = ['قاسم', 'قواسم', 'مشترك', 'PGCD', 'الأكبر', 'أطول', 'احصر', 'قاطع'];
  const tellsNothing = async (where) => {
    const t = await iqText();
    const said = BENCH_FORBIDDEN.filter((x) => t.includes(x));
    check(
      said.length === 0,
      `${where}: the bench names nothing of the rule it leads to${said.length ? ' — ' + said.join(', ') : ''}`,
    );
  };

  /** The ✕ is CLICKED: the student really leaves the lesson; then he opens it again and the title offers to RESUME. */
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
    expect(
      !gone.path.endsWith(`/${ID}`) && !gone.world,
      `${where}: the ✕ leaves the lesson — the world is closed, the page is ${gone.path}`,
    );
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    const label = (await page.textContent('[data-di-start]')).trim();
    expect(
      label.length > 0 && label !== startLabel,
      `${where}: back on the lesson, the title offers to RESUME (« ${label} », not « ${startLabel} »)`,
    );
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
  };

  // ══════════════════════════ the title ══════════════════════════
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(1200);
  const startLabel = (await page.textContent('[data-di-start]')).trim();
  expect(
    (await page.textContent('.di-title h1')).includes('مرفأ الرصيفين') &&
      (await page.textContent('.di-title__eyebrow')).includes('تعيين القاسم المشترك الأكبر لعددين طبيعيين'),
    'the title screen is this lesson’s own story (« مرفأ الرصيفين », « تعيين القاسم المشترك الأكبر لعددين طبيعيين »)',
  );
  await shot('title');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  await shot('start');

  /** What the world shows of the convoys (read for the question, never for the answer). */
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
        segs: g.segs.map((x) => ({
          id: x.id,
          a: x.a,
          complete: x.complete,
          builtWith: x.builtWith,
          standing: Boolean(x.standing),
          moulds: x.moulds?.length ?? 0,
        })),
        names: g.isl.map((x) => x.name),
      };
    });
  /** The words of the keys not forged yet: none may be said on the islands (A1) — 📋, then ⚡, then 🎯. */
  let forbid = /قاسم|قواسم|مشترك|PGCD|احصر|قاطع|مباشرة|يقسم/;
  /** Every WORLD screen: the instruction on screen, 16 px at least, uncovered, naming no rule; the « E » prompt off the result. */
  const worldShot = async (label) => {
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const box = (el) => el && el.getBoundingClientRect();
      const shown = (el) => {
        if (!el) return false;
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      };
      const ins = document.querySelector('[data-di-instruction]');
      const out = { has: shown(ins), state: ins?.dataset.diInstruction ?? null, covered: [], px: null, overlap: [] };
      if (out.has) {
        const b = box(ins);
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
      }
      out.texts = ['[data-di-instruction]', '[data-di-recall]']
        .map((sel) => document.querySelector(sel)?.textContent ?? '')
        .join(' ');
      const prompt = document.querySelector('[data-di-wprompt]');
      if (shown(prompt)) {
        const p = box(prompt);
        for (const sel of ['.di-eq', '.di-verdict']) {
          const el = document.querySelector(sel);
          if (!shown(el)) continue;
          const e = box(el);
          const ox = Math.min(p.right, e.right) - Math.max(p.left, e.left);
          const oy = Math.min(p.bottom, e.bottom) - Math.max(p.top, e.top);
          if (ox > 1 && oy > 1) out.overlap.push(sel);
        }
      }
      return out;
    });
    check(
      r.has && r.covered.length === 0,
      `${label}: the instruction is on screen (${r.state}) and nothing covers it${r.covered.length ? ' — ' + r.covered.join(', ') : ''}`,
    );
    if (r.state === 'open') check(r.px >= 16, `${label}: the instruction is written at 16 px at least (${r.px} px)`);
    const said = `${r.texts} ${(await road()).say}`;
    check(!forbid.test(said), `${label}: the islands name no rule before its tablet (${forbid})`);
    check(
      r.overlap.length === 0,
      `${label}: the « اضغط E » prompt covers neither the equation nor its verdict${r.overlap.length ? ' — ' + r.overlap.join(', ') : ''}`,
    );
    await shot(label);
  };
  /** Fires the held plank on bridge i; the convoys ask no prediction. Returns once the world is his again. */
  const fire = async (i, during) => {
    await toAltar(i);
    await act();
    expect((await st()).overlay !== 'predict', `bridge ${i}: a convoy asks no prediction before it builds`);
    if (during) await during();
    for (let k = 0; k < 60 && (await st()).phase !== 'play'; k += 1) await ff(1);
    await page.waitForTimeout(250);
  };
  const standsWith = async (i, b) => {
    const s = (await road()).segs[i];
    return s.complete && s.builtWith === b;
  };
  const promptShown = () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-di-wprompt]');
      if (!el) return false;
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });
  const noPromptOnBuilt = async (label) => {
    await ff(0.3);
    check(
      !(await promptShown()),
      `${label}: at the altar of a bridge built with the planks he carries, no « اضغط E » prompt`,
    );
  };
  const resultCleared = async (label) => {
    const r = await page.evaluate(() => {
      const s = window.__world.getState();
      return { eq: s.equation, v: s.verdict, shown: document.querySelectorAll('.di-eq, .di-verdict').length };
    });
    check(
      r.eq == null && r.v == null && r.shown === 0,
      `${label}: making planks clears the equation and the verdict of the bridge before (${JSON.stringify(r)})`,
    );
  };
  const until = async (test, sec = 30) => {
    for (let t = 0; t < sec * 4; t += 1) {
      if (test(await road())) return true;
      await ff(0.25);
    }
    return test(await road());
  };
  /** The purse chip, as the screen shows it (null: no chip). */
  const chip = () => page.getAttribute('[data-di-purse]', 'data-di-purse').catch(() => null);
  /**
   * HE WALKS BACK, as a student does (GAME_WORLD.md §2ter-1 rule 3): one press on « back » turns the view and the robot;
   * a second turns both to the road ahead; a third turns him round and, 0.4 s later, he holds « forward » over the bridge
   * he built, steering toward its axis — never a teleport. (Lesson 4's walk, unchanged.)
   */
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
    const robotOff = () =>
      page.evaluate(() => {
        const g = window.__world;
        const off = g.hero.yaw - g.heading();
        return Math.abs(Math.atan2(Math.sin(off), Math.cos(off)));
      });
    const press = async () => {
      await page.keyboard.down('ArrowDown');
      await ff(0.1);
      await page.keyboard.up('ArrowDown');
    };
    await press();
    expect((await road()).facing === -1, `${label}: « back » turns him round (facing ${(await road()).facing})`);
    await ff(1.4);
    {
      const a = await across();
      expect(a.lens < 0.2, `${label}: the camera has swung behind him (${a.lens.toFixed(2)} rad off)`);
      const off = await robotOff();
      expect(off < 0.2, `${label}: the ROBOT has turned round too, on the spot (${off.toFixed(2)} rad)`);
      await worldShot(`${label}-turned`);
    }
    await press();
    await ff(1.4);
    {
      const off = await robotOff();
      expect(
        (await road()).facing === 1 && off < 0.2,
        `${label}: a second press turns the view and the robot to the road ahead (${off.toFixed(2)} rad)`,
      );
    }
    await press();
    await ff(0.3);
    expect((await road()).facing === -1, `${label}: pressed again, he faces back (walks 0.4 s after the press)`);
    await page.keyboard.down('ArrowUp');
    let worst = 0;
    let shotTaken = false;
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
      if (!shotTaken && a.u < a.len * 0.6) {
        shotTaken = true;
        await page.keyboard.up('ArrowUp');
        if (steer) await page.keyboard.up(steer);
        steer = null;
        await worldShot(label);
        await page.keyboard.down('ArrowUp');
      }
      r = await road();
    }
    await page.keyboard.up('ArrowUp');
    if (steer) await page.keyboard.up(steer);
    await ff(0.3);
    r = await road();
    expect(
      r.island === to && r.falls === before.falls && r.facing === -1,
      `${label}: he walked back over his bridge to island « ${r.names[to]} » without falling (island ${r.island}, falls ${before.falls} → ${r.falls}; at most ${worst.toFixed(2)} from its axis)`,
    );
    expect(worst <= 0.6, `${label}: he stays on the bridge's axis (at most ${worst.toFixed(2)})`);
  };
  const crossAgain = async (i, label) => {
    const before = (await road()).falls;
    await page.keyboard.down('ArrowDown');
    await ff(0.1);
    await page.keyboard.up('ArrowDown');
    await ff(1.6);
    expect((await road()).facing === 1, `${label}: a second press on « back » turns him to the road ahead (facing 1)`);
    await cross(i);
    const after = (await road()).falls;
    expect(after === before, `${label}: he crosses without falling (falls ${before} → ${after})`);
  };
  const foldAndOpen = async (label) => {
    await page.click('[data-di-instruction-fold]');
    await page.waitForTimeout(200);
    expect(
      (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'folded' &&
        (await page.locator('[data-di-instruction] .di-objective').count()) === 0,
      `${label}: the fold button folds the instruction — its text leaves, its button stays`,
    );
    await worldShot(`${label}-folded`);
    await page.click('[data-di-instruction-fold]');
    await page.waitForTimeout(200);
    expect(
      (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'open',
      `${label}: the same button opens it again`,
    );
  };
  /** The workshop's typed form, checked: the gaps it names, its box and printed unit, its ✕ over the veil. */
  const workshopShows = async (label, gaps) => {
    const g = await page.getAttribute('[data-di-gaps]', 'data-di-gaps');
    expect(g === gaps.join(','), `${label}: the workshop names the gaps its plank builds (${g})`);
    expect(
      (await page.locator('[data-di-workshop="typed"] [data-di-in="plank"]').count()) === 1 &&
        ((await page.textContent('[data-di-workshop="typed"] .di-template')) ?? '').includes('خانة') &&
        (await page.locator('[data-di-workshop="typed"] [data-di-in]').count()) === 1,
      `${label}: ONE box to type the plank's length, its unit « خانة » printed — no plank offered`,
    );
    await shot(label, { exit: ['.di-veil [data-di-exit]'], numbers: true });
  };

  // ══════════════════ islands A–C: the convoy « lists » — 32 then 44, 19 coins, a workshop, its bench ══════════════════
  const [L1, L2] = [32, 44];
  let purseA = 0;
  {
    const r = await road();
    purseA = r.purse?.of ?? 0;
    expect(
      r.segs[0].a === L1 && r.segs[1].a === L2 && r.segs.slice(0, 8).every((s) => s.moulds === 0),
      `the road starts with two gaps, ${L1} then ${L2}, and no plank lies on any pedestal of the convoys`,
    );
    expect(purseA > 0 && (await chip()) === String(purseA), `the purse chip shows ${purseA} coins`);
    const fit = divisors(L1).filter((b) => buildsAll([L1, L2], purseA, b));
    expect(fit.length === 1, `with ${purseA} coins ONE plank length builds both gaps (${fit.join()}) — computed here`);
    expect(
      (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'open' &&
        r.objective.includes(String(L1)) &&
        r.objective.includes(String(L2)) &&
        r.objective.includes(String(purseA)) &&
        r.objective.includes('ورشة'),
      `island A: the instruction is open and names both gaps, the workshop and the purse (« ${r.objective} »)`,
    );
    await worldShot('island-a');
    await foldAndOpen('island-a');
  }
  const PLANK_A = divisors(L1).find((b) => buildsAll([L1, L2], purseA, b));
  // a plank that fills 32 and not 44 (the second gap refuses it), a plank of both the purse cannot pay — computed here
  const firstOnly = [8, 16].find((b) => fills(L1, b) && !fills(L2, b));
  const tooCheap = common(L1, L2).find((b) => b < PLANK_A && L1 / b <= purseA && L1 / b + L2 / b > purseA);
  expect(firstOnly === 8 && tooCheap === 2, `sanity: 8 fills ${L1} only, 2 fills both and costs ${L1 / 2} + ${L2 / 2}`);

  // ── the workshop of A, typed: an empty box, a length too long, 0 — each answered by a sentence ──
  await openWorkshop(0);
  await workshopShows('workshop-a', [L1, L2]);
  {
    await page.click('[data-di-workshop="typed"] [data-di-craft]');
    const e0 = await workshopError();
    expect(
      e0 && e0.trim().length > 5 && (await st()).held == null,
      `an empty box is answered by a sentence (« ${e0?.trim()} »)`,
    );
    await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', '99');
    await page.click('[data-di-workshop="typed"] [data-di-craft]');
    const e1 = (await workshopError()) ?? '';
    expect(
      e1.includes('99') && e1.includes(String(L2)) && (await st()).held == null,
      `99 is longer than every gap: refused, the longest gap named (« ${e1.trim()} »)`,
    );
    await shot('workshop-a-error', { exit: ['.di-veil [data-di-exit]'], numbers: true });
    await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', '0');
    await page.click('[data-di-workshop="typed"] [data-di-craft]');
    const e2 = (await workshopError()) ?? '';
    const typed = await page.inputValue('[data-di-workshop="typed"] [data-di-in="plank"]');
    expect(
      (await st()).held == null && (e2.trim().length > 5 || typed === ''),
      `0 makes no plank (« ${e2.trim()} », box « ${typed} »)`,
    );
  }
  await craft(firstOnly);
  await worldShot('a-holds-8');
  await fire(0, async () => {
    await ff(0.7);
    await worldShot('g32-building');
  });
  expect(await standsWith(0, firstOnly), `${L1} = ${firstOnly} × ${L1 / firstOnly}: the first bridge holds`);
  await noPromptOnBuilt('g32 held');
  expect(
    (await chip()) === String(purseA - L1 / firstOnly),
    `${L1 / firstOnly} coins spent: ${purseA - L1 / firstOnly} left`,
  );
  await worldShot('g32-held');
  await cross(0);
  await page.waitForTimeout(400);
  {
    const r = await road();
    expect(r.stage === 1 && r.held === firstOnly, `island B: he still carries the planks ${firstOnly} (${r.held})`);
    const card = (await page.textContent('[data-di-recall]').catch(() => '')) ?? '';
    expect(
      card.includes(String(L1)) && card.includes(String(firstOnly)) && card.includes(String(purseA - L1 / firstOnly)),
      `the card on the right recalls the first bridge (${L1} with ${firstOnly}) and the coins left (« ${card.trim().slice(0, 90)} »)`,
    );
    expect(
      r.objective.includes(String(L2)) && r.objective.includes(String(firstOnly)),
      `island B: the instruction names the gap ${L2} and the planks he carries (« ${r.objective} »)`,
    );
    await worldShot('island-b');
  }
  await fire(1, async () => {
    expect(await until((r) => r.verdict != null, 12), 'the world shows its verdict on the second bridge');
    const v = (await road()).verdict;
    expect(
      !v.holds && v.r === L2 % firstOnly,
      `${L2} = ${firstOnly} × ${Math.floor(L2 / firstOnly)} + ${L2 % firstOnly}: the second bridge does not hold (${JSON.stringify(v)})`,
    );
    await worldShot('g44-refused');
  });
  {
    const r = await road();
    expect(
      !r.segs[1].complete && r.objective.includes(r.names[0]) && r.objective.includes('ورشت'),
      `the second bridge fell; the instruction sends him back to the workshop of « ${r.names[0]} » (« ${r.objective} »)`,
    );
  }
  // ── the ✕ of the WORLD, on island B after the refusal ──
  await leaveAndReturn('in the world, on island B', ['.di-top a.di-icon', '.di-top [data-di-exit]']);
  {
    const s = await st();
    expect(
      s.phase === 'play' &&
        s.stage === 1 &&
        s.overlay == null &&
        (await standsWith(0, firstOnly)) &&
        s.held === firstOnly,
      `he is back WHERE HE WAS: island B, the first bridge built with ${firstOnly}, the planks in hand (${JSON.stringify({ phase: s.phase, stage: s.stage, held: s.held })})`,
    );
    await worldShot('back-on-island-b');
  }
  await walkBack(0, 'walk-back-to-a');
  // ── on A, the plank 2: the bridge of 8 goes back, 2 builds 32 and runs out of coins on 44 ──
  await openWorkshop(0);
  await craft(tooCheap);
  {
    const r = await road();
    expect(
      r.stage === 0 && !r.segs[0].complete && (await chip()) === String(purseA),
      `planks of ${tooCheap} made on A: the bridge of ${firstOnly} goes back and the purse is full again (${await chip()})`,
    );
    await resultCleared(`planks of ${tooCheap} made on A`);
    await worldShot('bridge-goes-back');
  }
  await ff(1.5);
  await fire(0);
  expect(await standsWith(0, tooCheap), `${L1} = ${tooCheap} × ${L1 / tooCheap}: the first bridge holds`);
  await crossAgain(0, 'A → B again');
  await page.waitForTimeout(300);
  await fire(1, async () => {
    expect(await until((r) => r.verdict?.purse === true, 25), `the purse runs out before ${L2} is full`);
    const left = purseA - L1 / tooCheap;
    const v = (await page.textContent('.di-verdict__bridge')) ?? '';
    expect(
      (await chip()) === '0' && v.includes(String(left)) && v.includes(String(L2 / tooCheap)),
      `the purse chip shows 0; the verdict: ${left} planks laid of ${L2 / tooCheap} (« ${v.trim()} »)`,
    );
    const legend = (await page.textContent('.di-eq__legend').catch(() => '')) ?? '';
    check(
      legend.includes(`خانات بلا ألواح: ${L2 - tooCheap * left}`) && !legend.includes('الباقي'),
      `the purse out: the legend says « خانات بلا ألواح: ${L2 - tooCheap * left} », not « الباقي » (« ${legend.trim()} »)`,
    );
    await worldShot('purse-out-44');
  });
  // ── the page is RELOADED on island B (inside the convoy): the planks 2 are still in hand ──
  {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
    await ff(0.5);
    const r = await road();
    expect(
      r.phase === 'play' && r.stage === 1 && r.island === 1 && (await standsWith(0, tooCheap)) && r.held === tooCheap,
      `after a reload he is on island B, the bridge of ${tooCheap} behind him, the planks in hand (stage ${r.stage}, island ${r.island}, held ${r.held})`,
    );
    expect(
      r.purse?.left === purseA - L1 / tooCheap && r.objective.includes(r.names[0]),
      `after a reload: the purse (${r.purse?.left}) and the instruction sending him back to « ${r.names[0]} » (« ${r.objective} »)`,
    );
    await worldShot('reload-on-b');
  }
  await walkBack(0, 'walk-back-to-a-2');
  // ── the ✕ of the WORKSHOP: he leaves from the open workshop; back, he is on A, his planks in hand ──
  await openWorkshop(0);
  await leaveAndReturn('in the workshop of A', ['.di-veil [data-di-exit]']);
  {
    await ff(0.4);
    const s = await st();
    const at = await page.evaluate(() => window.__world.hero.island);
    expect(
      s.overlay == null && s.phase === 'play' && s.held === tooCheap && (await standsWith(0, tooCheap)),
      `back from the workshop's ✕: the workshop closed, the planks ${tooCheap} in hand, the bridge of ${tooCheap} standing (${JSON.stringify({ stage: s.stage, overlay: s.overlay, held: s.held })})`,
    );
    // where he stood: island A, at its workshop — the save keeps the furthest island of the road (B) and the page opens
    // again there (Game.js › restore: the same as lesson 4's ✕ on island B). Reported to the main session, not asserted:
    // GAME_WORLD.md does not say which island a resumed page opens on.
    if (at !== 0)
      console.log(`NOTE  back from the workshop's ✕ on island A, the page opens on island ${at} (the save's stage)`);
    await worldShot('back-from-workshop-x');
    if (at !== 0) await walkBack(0, 'walk-back-to-a-3');
  }

  // ── THE BENCH « دفتر القوائم »: facts on both gaps, and it stops there ──
  const benchStage = () => page.getAttribute('[data-iq-stage]', 'data-iq-stage');
  const items = async (side) =>
    ((await page.getAttribute(`[data-iq-list="${side}"]`, 'data-iq-items')) ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number);
  /** He types d on the bench and lays it; returns once the world has laid it. */
  const benchLay = async (d) => {
    await page.fill('[data-iq-in="plank"]', String(d));
    await page.click('[data-iq-lay]');
    await page.waitForTimeout(120);
    await page.waitForFunction(
      () => ['build', 'closed'].includes(document.querySelector('[data-iq-stage]')?.dataset.iqStage),
      null,
      { timeout: 8000 },
    );
    await page.waitForTimeout(80);
  };
  const benchTap = async (side, d) => {
    await page.click(`[data-iq-list="${side}"] [data-iq-chip="${d}"]`);
    await page.waitForTimeout(120);
    await page.waitForFunction(() => document.querySelector('[data-iq-stage]')?.dataset.iqStage !== 'linkLay', null, {
      timeout: 8000,
    });
    await page.waitForTimeout(80);
  };
  /** Builds the list of gap n from where it stands: the planks still missing, each typed, until the world closes it. */
  const buildRest = async (side, n) => {
    for (let k = 0; k < 20 && (await benchStage()) === 'build'; k += 1) {
      const have = await items(side);
      const d = divisors(n).find((x) => !have.includes(x));
      await benchLay(d);
    }
    expect(
      (await benchStage()) === 'closed' && (await items(side)).join() === divisors(n).join(),
      `the list of ${n} is every plank that fills it: ${divisors(n).join(', ')} — the world closes it`,
    );
  };
  await openWorkshop(0);
  expect(
    (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'new',
    'the workshop of A offers its bench, never opened yet (« new »)',
  );
  await page.click('[data-di-bench-open]');
  await page.waitForSelector('[data-di-bench="lists"] [data-iq-stage]');
  await page.waitForTimeout(300);
  {
    const q = await iq();
    expect(
      q.kind === 'lists' && q.a === L1 && q.b === L2 && (await benchStage()) === 'build' && q.side === 'a',
      `the bench opens on the two gaps of the convoy, ${L1} and ${L2}, the list of ${L1} first`,
    );
    await forgeTools('the bench', '.di-bench');
    await tellsNothing('bench, start');
    await inquiryFits('bench-start');
    // a length outside 1 … 32: a fact, nothing laid
    await benchLay(99);
    expect(
      (await benchStage()) === 'build' && (await items('a')).length === 0 && (await fact()).includes(String(L1)),
      `99 on the bench: refused as a fact (« ${(await fact()).trim().slice(0, 60)} »), nothing in the list`,
    );
    await inquiryFits('bench-bound');
    // 8 fills 32: it comes with its partner
    await benchLay(8);
    expect((await items('a')).join() === [4, 8].join(), `8 fills ${L1}: 8 and its partner ${L1 / 8} join the list`);
    await inquiryFits('bench-8');
    // « the list is complete » too early: ONE missing plank shown, the list unchanged
    await page.click('[data-iq-complete]');
    await page.waitForTimeout(300);
    const missingOne = divisors(L1).find((d) => ![4, 8].includes(d));
    expect(
      (await benchStage()) === 'build' &&
        (await items('a')).join() === '4,8' &&
        (await fact()).includes(String(missingOne)),
      `« السطر كامل » too early: the world shows ONE plank missing (${missingOne}), the list unchanged`,
    );
    await inquiryFits('bench-missing');
    await benchLay(3);
    expect((await items('a')).join() === '4,8', `3 does not fill ${L1}: its division written, nothing added`);
    await inquiryFits('bench-miss');
    await benchLay(1);
  }
  // ── the ✕ inside the bench: he leaves with a list half-built ──
  const half = await items('a');
  await leaveAndReturn('inside the bench', ['.di-bench [data-di-exit]', '[data-di-exit]']);
  await ff(0.4);
  {
    const at = await page.evaluate(() => window.__world.hero.island);
    if (at !== 0) {
      console.log(`NOTE  back from the bench's ✕ on island A, the page opens on island ${at} (the save's stage)`);
      await walkBack(0, 'walk-back-to-a-4');
    }
  }
  await openWorkshop(0);
  {
    const kept = await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open');
    await page.click('[data-di-bench-open]');
    await page.waitForSelector('[data-di-bench="lists"] [data-iq-stage]');
    await page.waitForTimeout(300);
    const now = await items('a');
    check(
      kept === 'kept' && now.join() === half.join(),
      `back from the bench's ✕, his half-built list is still there (${kept}; ${now.join(', ') || 'empty'} — he had ${half.join(', ')})`,
    );
  }
  await buildRest('a', L1);
  await inquiryFits('bench-closed-a');
  await tellsNothing('bench, a list closed');
  await page.click('[data-iq-go]');
  await page.waitForTimeout(200);
  expect((await iq()).side === 'b' && (await benchStage()) === 'build', `on to the list of ${L2}`);
  await benchLay(3);
  await buildRest('b', L2);
  await inquiryFits('bench-closed-b');
  await page.click('[data-iq-go]');
  await page.waitForTimeout(200);
  expect((await benchStage()) === 'link', 'both lists built: he links the planks found in both');
  await inquiryFits('bench-link');
  {
    // a wrong link: 8 is in the list of 32, and 44 = 8 × 5 + 4 — computed here
    const stray = (await items('a')).find((d) => !fills(L2, d));
    await benchTap('a', stray);
    expect(
      (await iq()).links.length === 0 && (await fact()).includes(String(L2 % stray)),
      `${stray} tapped: ${L2} = ${stray} × ${Math.floor(L2 / stray)} + ${L2 % stray} — no link`,
    );
    await inquiryFits('bench-unlinked');
    // « all linked » too early: ONE missing link shown on both gaps
    await page.click('[data-iq-all-linked]');
    await page.waitForTimeout(300);
    expect(
      (await benchStage()) === 'link',
      '« ضغطتها كلّها » with no link made: a missing one is shown, the stage stays',
    );
    await inquiryFits('bench-link-missing');
    for (const d of common(L1, L2)) await benchTap('a', d);
    expect(
      (await iq()).links.join() === common(L1, L2).join(),
      `the links are the planks of both: ${common(L1, L2).join(', ')} — computed here`,
    );
    await page.click('[data-iq-all-linked]');
    await page.waitForTimeout(300);
    const q = await iq();
    expect(
      (await benchStage()) === 'seen' && q.crown == null && (await page.locator('[data-iq-crown]').count()) === 0,
      'all linked: the bench ends on the two lists and their links — NO plank crowned, never asked the longest',
    );
    await tellsNothing('bench, the end');
    await inquiryFits('bench-seen');
  }
  await page.click('[data-iq-next]');
  await page.waitForSelector('[data-di-workshop="typed"]');
  expect(
    (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'kept',
    'the bench closes back to the workshop, and what he did is KEPT',
  );
  await page.click('[data-di-bench-open]');
  await page.waitForSelector('[data-di-bench="lists"] [data-iq-stage]');
  await page.waitForTimeout(300);
  expect(
    (await benchStage()) === 'seen' &&
      (await items('a')).join() === divisors(L1).join() &&
      (await items('b')).join() === divisors(L2).join(),
    'reopened, the bench shows HIS lists and links, not an empty bench',
  );
  await inquiryFits('bench-reopened');
  await page.click('[data-di-bench-back]');
  await page.waitForSelector('[data-di-workshop="typed"]');
  // ── 4, typed, Enter: it builds both bridges with the 19 coins ──
  await craft(PLANK_A, 'enter');
  await ff(1.2);
  await fire(0);
  expect(await standsWith(0, PLANK_A), `${L1} = ${PLANK_A} × ${L1 / PLANK_A}: the first bridge holds`);
  await crossAgain(0, 'A → B with 4');
  await page.waitForTimeout(300);
  await fire(1, async () => {
    expect(await until((r) => r.verdict?.holds === true, 20), `the second bridge holds with ${PLANK_A}`);
    check((await chip()) === '0', 'the last plank takes the last coin: the purse chip shows 0');
    await worldShot('g44-held');
  });
  expect(
    (await standsWith(1, PLANK_A)) && L1 / PLANK_A + L2 / PLANK_A === purseA,
    `${L1 / PLANK_A} + ${L2 / PLANK_A} = ${purseA}: both bridges stand with the whole purse`,
  );
  await cross(1);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 1 📋 « احصر القواسم ثم قاطعها » — on the planks he MADE ══════════════════════════
  const opensOnTiles = async (key, a, b, mine) => {
    const f = await fg();
    const steps = await page.locator('.rf-steps li').allTextContents();
    expect(
      f.key === key &&
        f.phase === 'build' &&
        (await page.locator('.iq').count()) === 0 &&
        (await page.locator('[data-rf-guess]').count()) === 0 &&
        (await page.locator('[data-rf-tile]').count()) > 0,
      `the forge of « ${key} » opens on its TILES — no experiment screen, no prediction (${f.phase})`,
    );
    expect(
      steps.length === 3 && !steps.some((t) => t.includes('تنبّأ')) && steps[0].includes('اكتب قاعدتك'),
      `the steps shown are the steps played: ${steps.map((t) => t.trim()).join(' → ')}`,
    );
    const ids = f.rows.map((r) => `${r.A}:${r.B}:${r.d}`);
    expect(
      ids.join() === mine.join() && f.rows.every((r) => !r.mirror),
      `his evidence is what HE made: ${mine.join(', ')} (${ids.join(', ')})`,
    );
  };
  /** A case is a PAIR: the log's lines name both gaps and the plank, one line each; an attack draws TWO bridges. */
  const pairChecks = async (where) => {
    await page.waitForTimeout(450);
    const f = await fg();
    const m = await page.evaluate((FLOOR) => {
      const out = { bad: [] };
      const log = document.querySelector('.rf-log ul').getBoundingClientRect();
      const rows = [...document.querySelectorAll('.rf-root [data-rf-row]')];
      out.rows = rows.length;
      for (const li of rows) {
        const head = li.querySelector(':scope > div');
        const id = li.dataset.rfRow;
        if (!head.classList.contains('rf-line--pair')) out.bad.push(`${id}: not a pair line`);
        if (li.querySelectorAll('svg.rf-mini--pair > g').length !== 2) out.bad.push(`${id}: its mini is not two bars`);
        const [A, B, d] = id.split(':');
        const t = head.textContent;
        if (!t.includes(A) || !t.includes(B) || !t.includes(`لوح ${d}`)) out.bad.push(`${id}: « ${t} »`);
        const lh = Math.max(
          ...[...head.querySelectorAll('strong, span, em')].map((e) => e.getBoundingClientRect().height),
        );
        if (head.getBoundingClientRect().height > lh * 1.35) out.bad.push(`${id}: its line wraps`);
        const r = li.getBoundingClientRect();
        if (r.left < log.left - 1 || r.right > log.right + 1) out.bad.push(`${id}: leaves the column`);
        if (head.scrollWidth > head.clientWidth + 1) out.bad.push(`${id}: its line is cut`);
      }
      const svg = document.querySelector('.rf-root [data-rf-pair]');
      out.pair = svg?.dataset.rfPair ?? null;
      out.bridge = document.querySelectorAll('.rf-root [data-rf-bridge]').length;
      if (svg) {
        out.stage = svg.dataset.rfStage;
        out.fills = [...svg.querySelectorAll('[data-rf-pair-row]')].map((g) => [
          Number(g.dataset.rfPairRow),
          g.dataset.rfFills,
          g.getAttribute('class'),
        ]);
        const vb = svg.viewBox.baseVal;
        const sr = svg.getBoundingClientRect();
        const k = Math.min(sr.width / vb.width, sr.height / vb.height);
        const box = document.querySelector('.rf-mirror').getBoundingClientRect();
        if (sr.top < box.top - 1 || sr.bottom > box.bottom + 1 || sr.left < box.left - 1 || sr.right > box.right + 1)
          out.bad.push('the two bridges leave the mirror');
        const texts = [];
        for (const el of svg.querySelectorAll('text')) {
          const px = parseFloat(getComputedStyle(el).fontSize) * k;
          if (px < FLOOR) out.bad.push(`« ${el.textContent} » drawn at ${px.toFixed(1)} px`);
          const r = el.getBoundingClientRect();
          if (r.top < box.top - 1 || r.bottom > box.bottom + 1) out.bad.push(`« ${el.textContent} » leaves the mirror`);
          texts.push({ t: el.textContent, r });
        }
        for (let i = 0; i < texts.length; i += 1)
          for (let j = i + 1; j < texts.length; j += 1) {
            const a = texts[i].r;
            const b = texts[j].r;
            if (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
            )
              out.bad.push(`« ${texts[i].t} » over « ${texts[j].t} »`);
          }
        out.minPx = Math.min(
          ...[...svg.querySelectorAll('text')].map((e) => parseFloat(getComputedStyle(e).fontSize) * k),
        );
      }
      return out;
    }, FLOOR_PX);
    check(
      m.rows >= 1 && m.bad.length === 0,
      `${where}: ${m.rows} log lines and the mirror drawn as pairs, whole, in their boxes${m.bad.length ? ' — ' + m.bad.join(' | ') : ''}`,
    );
    if (f.phase !== 'attack') return;
    const c = f.atk.list[f.atk.i];
    expect(
      m.pair === `${c.A}:${c.B}:${c.d}` && m.bridge === 0 && m.fills?.length === 2,
      `${where}: the mirror draws TWO bridges, ${c.A} and ${c.B}, the plank ${c.d} on each (${m.pair}; min text ${m.minPx?.toFixed(1)} px)`,
    );
    if (m.stage === 'done' && /attack 1 dealt|broken/.test(where)) await shot(`${where.split(',')[0]}-attack-dealt`);
    if (m.stage === 'done')
      for (const [n, f1, cls] of m.fills) {
        const yes = n % c.d === 0;
        check(
          f1 === (yes ? '1' : '0') && cls.includes(yes ? 'is-held' : 'is-fell'),
          `${where}: the bridge of ${n} ${yes ? 'holds' : 'falls'} with planks of ${c.d} — ${n} = ${c.d} × ${Math.floor(n / c.d)} + ${n % c.d} (${cls})`,
        );
      }
  };
  /** The words of a key's name, never in its mirror before the tablet. */
  const noName = async (where, re) => {
    const t = (await page.textContent('.rf-root')) ?? '';
    check(!re.test(t), `${where}: the mirror names nothing before the tablet (${re})`);
  };
  /** The attacks, each answered as the rule says (computed HERE by `truth(case)`), the seal and the last step. */
  const attackToTablet = async (name, truth, last, onMirror) => {
    await page.waitForSelector('[data-rf="attack"]');
    if (onMirror) await onMirror(`${name}, first attack`);
    await shot(`${name}-attack`);
    for (let i = 0; i < 6; i += 1) {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      const yes = truth(c);
      await page.click(`[data-rf-say="${yes ? 'yes' : 'no'}"]`);
      const heard = await hear(async () => {
        await page.click('[data-rf-fire]');
        await page.waitForSelector('[data-rf-survived]');
      });
      check(
        heard.at(-1) === (yes ? 'success' : 'crumble'),
        `${name}: attack ${i + 1} (${c.A} and ${c.B}, the plank ${c.d}) — the mirror builds it, then ${yes ? 'success' : 'crumble'} (${[...new Set(heard)].join(', ')})`,
      );
      if (onMirror) await onMirror(`${name}, attack ${i + 1} dealt`);
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
  /** A false rule REFUTED on his evidence (`expectId`, computed here), then the right one, its attacks, the seal. */
  const mirrorRefuted = async (name, falseTiles, expectId, why, rightTiles, truth, last, onMirror) => {
    for (const t of falseTiles) await page.click(`[data-rf-tile="${t}"]`);
    await shot(`${name}-build`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    const got = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
    expect(
      got === expectId,
      `${name}: the rule « ${falseTiles.join(' + ')} » is refuted by a plank HE made — ${why} (${got})`,
    );
    check(
      (await page.locator(`[data-rf-row="${expectId}"][data-rf-mark="refute"]`).count()) === 1,
      `${name}: the line that refutes it is on screen, marked`,
    );
    const fb = (await page.textContent('[data-rf-refuted]')) ?? '';
    check(
      !/خطأ|خاطئ/.test(fb),
      `${name}: the refutation says what he saw, never « wrong » (« ${fb.trim().slice(0, 70)} »)`,
    );
    await forgeTools(`${name}, the mirror`);
    if (onMirror) await onMirror(`${name}, refuted`);
    await shot(`${name}-refuted`);
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    for (const t of rightTiles) await page.click(`[data-rf-tile="${t}"]`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]');
    await shot(`${name}-agreed`);
    await page.click('[data-rf-dare]');
    await attackToTablet(name, truth, last, onMirror);
  };
  /**
   * A false rule his evidence AGREES with, BROKEN by the mirror's first attack (`expectId`): he answers what the world
   * will do (computed here) and is told his rule says otherwise; the bridges break it; only « أصلح قاعدتي ».
   */
  const mirrorBroken = async (name, falseTiles, expectId, rightTiles, truth, last, onMirror) => {
    for (const t of falseTiles) await page.click(`[data-rf-tile="${t}"]`);
    await shot(`${name}-build`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]');
    await page.click('[data-rf-dare]');
    await page.waitForSelector('[data-rf-say]');
    const c = (await fg()).atk.list[0];
    expect(
      `${c.A}:${c.B}:${c.d}` === expectId,
      `${name}: the mirror attacks « ${falseTiles.join(' + ')} » with a NEW pair, ${expectId} (${c.A}:${c.B}:${c.d})`,
    );
    const yes = truth(c);
    await page.click(`[data-rf-say="${yes ? 'yes' : 'no'}"]`);
    await page.waitForSelector('[data-rf-rule-says]');
    expect(
      (await page.getAttribute('[data-rf-rule-says]', 'data-rf-rule-says')) === (yes ? 'no' : 'yes'),
      `${name}: he said what the world will do (${yes ? 'it builds them' : 'it does not'}): his rule says the opposite, on screen`,
    );
    await shot(`${name}-attack-not-his-rule`);
    const heard = await hear(async () => {
      await page.click('[data-rf-fire]');
      await page.waitForSelector('[data-rf-broken]');
    });
    const broken = (await page.textContent('[data-rf-broken]')) ?? '';
    expect(
      (await page.getAttribute('[data-rf-broken]', 'data-rf-broken')) === expectId &&
        (await page.locator('[data-rf-attack-next], [data-rf-seal]').count()) === 0,
      `${name}: the rule BREAKS on ${expectId}: no seal, no next challenge — only « أصلح قاعدتي »`,
    );
    check(
      !/خطأ|خاطئ/.test(broken),
      `${name}: the verdict is what the bridges did, never « wrong » (« ${broken.trim().slice(0, 70)} »)`,
    );
    check(
      heard.includes(yes ? 'success' : 'crumble'),
      `${name}: the broken rule is heard (${[...new Set(heard)].join(', ')})`,
    );
    if (onMirror) await onMirror(`${name}, broken`);
    await forgeTools(`${name}, the broken rule`);
    await shot(`${name}-broken`);
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    for (const t of rightTiles) await page.click(`[data-rf-tile="${t}"]`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]');
    await shot(`${name}-agreed`);
    await page.click('[data-rf-dare]');
    await attackToTablet(name, truth, last, onMirror);
  };
  /** The world's verdict on a case: the plank builds both gaps with the purse — it is their longest common plank. */
  const held = (c) => c.d === gcd(c.A, c.B);

  expect(
    (await st()).stage === 2 && (await st()).overlay === 'forge',
    `island C « ${(await road()).names[2]} » opens the first forge`,
  );
  const madeA = [firstOnly, tooCheap, PLANK_A].map((d) => `${L1}:${L2}:${d}`);
  await opensOnTiles('hasr-wa-taqatu', L1, L2, madeA);
  await forgeTools('forge 1, the tiles');
  await pairChecks('forge 1, the tiles');
  await noName('forge 1, the tiles', /قاسم|قواسم|PGCD/);
  await shot('forge1-tiles');
  // ── the ✕ of the FORGE, clicked after he picked a tile: back, the same mirror waits for him ──
  await page.click('[data-rf-tile="rows:each"]');
  await leaveAndReturn('inside forge 1', ['.rf-root [data-di-exit]']);
  await ff(1.5);
  await page.waitForSelector('[data-rf="build"]', { timeout: 15000 });
  {
    const s = await st();
    expect(
      s.stage === 2 && s.overlay === 'forge' && s.keys.length === 0 && (await standsWith(1, PLANK_A)),
      'he is back WHERE HE WAS: island C, in front of its mirror — the forge opens again by itself, no key skipped',
    );
    await opensOnTiles('hasr-wa-taqatu', L1, L2, madeA);
  }
  {
    const [U1, U2] = [58, 87];
    await mirrorRefuted(
      'forge1',
      ['rows:short', 'keep:every', 'make:longest'],
      `${L1}:${L2}:${PLANK_A}`,
      `the planks of the shorter gap alone make ${L1}; ${PLANK_A} built both with the purse`,
      ['rows:each', 'keep:every', 'make:longest'],
      held,
      async (u) => {
        expect(u.A === U1 && u.B === U2, `the last step is about ${U1} and ${U2} (${u.A}, ${u.B})`);
        const [da, db, dc] = [divisors(u.A), divisors(u.B), common(u.A, u.B)];
        const boxes = await page.locator('[data-rf-use]').count();
        expect(
          boxes === da.length + db.length + dc.length + 1,
          `the last step: ${boxes} boxes — ${da.length} + ${db.length} divisors, ${dc.length} common, the PGCD (computed here)`,
        );
        const vals = {
          ...Object.fromEntries(da.map((d, i) => [`a${i + 1}`, d])),
          ...Object.fromEntries(db.map((d, i) => [`b${i + 1}`, d])),
          ...Object.fromEntries(dc.map((d, i) => [`c${i + 1}`, d])),
        };
        const smaller = dc.filter((d) => d < gcd(u.A, u.B)).at(-1);
        expect(
          (await fillUse({ ...vals, g: smaller })) === 'longer',
          `the last step: ${smaller} is in both lists, a longer one is too — refused`,
        );
        await shot('forge1-use');
        expect(
          (await fillUse({ ...vals, g: gcd(u.A, u.B) })) === 'ok',
          `the lists of ${u.A} and ${u.B}, their common divisors ${dc.join(', ')}, the longest ${gcd(u.A, u.B)}`,
        );
      },
      pairChecks,
    );
  }
  await shot('tablet-1');
  expect(
    (await page.textContent('.di-card')).includes(TITLES['hasr-wa-taqatu']),
    `the tablet: « ${TITLES['hasr-wa-taqatu']} »`,
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 1, 'one key earned');
  forbid = /مباشرة|يقسم/;

  // ══════════════════ islands C–E: the convoy « same » — 27 and 27, 2 coins ══════════════════
  const S = 27;
  {
    await ff(0.5);
    const r = await road();
    const p = r.purse?.of ?? 0;
    expect(
      r.segs[2].a === S &&
        r.segs[3].a === S &&
        p === 2 &&
        r.objective.includes(String(S)) &&
        r.objective.includes('ورشة'),
      `island C: two gaps of ${S}, a purse of ${p} coins, the workshop named (« ${r.objective} »)`,
    );
    await worldShot('island-c');
  }
  await openWorkshop(2);
  await workshopShows('workshop-c', [S, S]);
  // 9 fills 27, but takes 3 coins of 2: the purse runs out on the first bridge — computed here
  expect(S / 9 > 2, `sanity: planks of 9 need ${S / 9} coins for one gap of ${S}`);
  await craft(9);
  await fire(2, async () => {
    expect(
      await until((r) => r.verdict?.purse === true, 20),
      `planks of 9: the purse runs out on the first gap of ${S}`,
    );
    await worldShot('purse-out-27-c');
  });
  expect(!(await road()).segs[2].complete, 'the bridge of 9 goes back');
  await openWorkshop(2);
  await craft(S);
  await resultCleared(`planks of ${S} made on C`);
  await fire(2);
  expect(await standsWith(2, S), `${S} = ${S} × 1: one plank, one coin`);
  await cross(2);
  await page.waitForTimeout(400);
  {
    const r = await road();
    expect(
      r.stage === 3 && r.held === S && (await chip()) === '1',
      `island D: he carries the plank ${S}, one coin left`,
    );
    await worldShot('island-d');
  }
  await fire(3);
  expect(await standsWith(3, S), `the second gap of ${S}: one plank, the last coin`);
  await cross(3);
  await page.waitForTimeout(500);

  // ══════════════════ islands E–G: 27, then a gap of 0 cells whose bridge STANDS; 1 coin ══════════════════
  {
    await ff(0.5);
    const r = await road();
    expect(
      r.segs[4].a === S && r.segs[5].a === 0 && r.segs[5].standing && r.segs[5].complete && (r.purse?.of ?? 0) === 1,
      `island E: a gap of ${S}, then a gap of 0 cells whose bridge stands from the start, a purse of 1 coin`,
    );
    await worldShot('island-e');
  }
  await openWorkshop(4);
  await workshopShows('workshop-e', [S]);
  await craft(9);
  await fire(4, async () => {
    expect(
      await until((r) => r.verdict?.purse === true, 20),
      'planks of 9: one coin, three planks — the purse runs out',
    );
    await worldShot('purse-out-27-e');
  });
  await openWorkshop(4);
  await craft(S);
  await fire(4);
  expect(await standsWith(4, S), `${S} = ${S} × 1 with the one coin`);
  await cross(4);
  await page.waitForTimeout(500);
  {
    // the gap of 0 cells: nothing to build — no prompt at its altar, the bridge walkable, the purse untouched
    const r = await road();
    expect(r.stage === 5 && r.segs[5].complete, `island F: the bridge over the gap of 0 cells stands`);
    expect(
      r.objective.includes('0') && /قائم/.test(r.objective),
      `island F: the instruction says the bridge of 0 cells stands, cross it (« ${r.objective} »)`,
    );
    const before = await page.evaluate(() => {
      const g = window.__world;
      return { left: g.purseOf(g.segs[5])?.left ?? null, log: g.log.length };
    });
    await toAltar(5);
    await ff(0.3);
    check(!(await promptShown()), 'at the altar of the gap of 0 cells: no « اضغط E » prompt — nothing to build');
    await worldShot('gap-0');
    await act();
    check(
      (await st()).overlay == null && (await st()).phase === 'play',
      'E at the gap of 0: no screen opens, nothing is built',
    );
    await cross(5);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const g = window.__world;
      return {
        left: g.purseOf(g.segs[5])?.left ?? null,
        log: g.log.length,
        zero: g.log.filter((x) => x.a === 0).length,
      };
    });
    expect(
      after.left === before.left && after.log === before.log && after.zero === 0 && (await road()).falls === r.falls,
      `the gap of 0 is crossed without building: the purse untouched (${before.left} → ${after.left}), nothing logged, no fall`,
    );
  }

  // ══════════════════════════ forge 2 ⚡ « نتائج مباشرة » — the convoys « same » and « full » ══════════════════════════
  expect((await st()).stage === 6 && (await st()).overlay === 'forge', `island G opens the second forge`);
  {
    // his rows: every plank he made for the gaps of 27 (each one case of the twins 27 and 27), then the gap of 0 he lived
    const mine = [9, S].map((d) => `${S}:${S}:${d}`);
    const f = await fg();
    const ids = f.rows.map((r) => `${r.A}:${r.B}:${r.d}`);
    expect(
      f.phase === 'build' && f.key === 'nataij-mubashira' && (await page.locator('[data-rf-guess]').count()) === 0,
      'the forge of « nataij-mubashira » opens on its TILES',
    );
    expect(
      ids.join() === [...mine, `${S}:0:${S}`].join() && f.rows.every((r) => !r.mirror),
      `his evidence: the planks he made for ${S} and ${S} (${mine.join(', ')}), then ${S} and 0 (${ids.join(', ')})`,
    );
  }
  await forgeTools('forge 2, the tiles');
  await pairChecks('forge 2, the tiles');
  await noName('forge 2, the tiles', /مباشرة/);
  {
    // four columns: each heading whole, on its column (looked at too, at 1024 × 768)
    const heads = await page.evaluate(() =>
      [...document.querySelectorAll('.rf-tiles[data-rf-slots] > div')].map((col) => {
        const h = col.querySelector('h4');
        const r = h?.getBoundingClientRect();
        const c = col.getBoundingClientRect();
        return {
          t: h?.textContent.trim(),
          cut: !h || h.scrollWidth > h.clientWidth + 1 || r.left < c.left - 1 || r.right > c.right + 1,
        };
      }),
    );
    check(
      heads.length === 4 && heads.every((h) => h.t && !h.cut),
      `forge 2: four columns, each heading whole (${heads.map((h) => h.t).join(' | ')})`,
    );
  }
  await shot('forge2-tiles');
  await mirrorBroken(
    'forge2',
    ['same:their', 'zero:other', 'one:other', 'turn:same'],
    `${S}:1:${S}`,
    ['same:their', 'zero:other', 'one:unit', 'turn:same'],
    held,
    async (u) => {
      const t = gcd(u.turn[0], u.turn[1]);
      expect(
        (await fillUse({ s: u.same, z: 0, o: 1, t })) === 'zero',
        `the last step: PGCD(${u.zero} ; 0) = 0 — refused (every plank fills a gap of 0)`,
      );
      await shot('forge2-use');
      expect(
        (await fillUse({ s: u.same, z: u.zero, o: 1, t })) === 'ok',
        `PGCD(${u.same} ; ${u.same}) = ${u.same}, PGCD(${u.zero} ; 0) = ${u.zero}, PGCD(1 ; ${u.one}) = 1, PGCD(${u.turn.join(' ; ')}) = ${t}`,
      );
    },
    pairChecks,
  );
  await shot('tablet-2');
  expect(
    (await page.textContent('.di-card')).includes(TITLES['nataij-mubashira']),
    `the tablet: « ${TITLES['nataij-mubashira']} »`,
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 2, 'two keys earned');
  forbid = /يقسم/;

  // ══════════════════ islands G–I: the convoy « nest » — 19 then 76, 5 coins ══════════════════
  const [N1, N2] = [19, 76];
  {
    await ff(0.5);
    const r = await road();
    const p = r.purse?.of ?? 0;
    expect(r.segs[6].a === N1 && r.segs[7].a === N2 && p === 5, `island G: ${N1} then ${N2}, ${p} coins`);
    const fit = divisors(N1).filter((b) => buildsAll([N1, N2], p, b));
    expect(
      fit.join() === String(N1),
      `with ${p} coins only the plank ${N1} builds both (${fit.join()}) — computed here`,
    );
    await worldShot('island-g');
  }
  await openWorkshop(6);
  await workshopShows('workshop-g', [N1, N2]);
  await craft(1);
  await fire(6, async () => {
    expect(await until((r) => r.verdict?.purse === true, 30), `planks of 1: ${N1} coins needed, the purse runs out`);
    await worldShot('purse-out-19');
  });
  await openWorkshop(6);
  await craft(N1);
  await fire(6);
  expect(await standsWith(6, N1), `${N1} = ${N1} × 1`);
  await cross(6);
  await page.waitForTimeout(400);
  {
    const r = await road();
    const card = (await page.textContent('[data-di-recall]').catch(() => '')) ?? '';
    expect(r.stage === 7 && r.held === N1, `island H: he carries the plank ${N1}`);
    check(
      card.includes(String(N1)),
      `the card on the right recalls the bridge of ${N1} (« ${card.trim().slice(0, 80)} »)`,
    );
    await worldShot('island-h');
  }
  await fire(7);
  expect(await standsWith(7, N1), `${N2} = ${N1} × ${N2 / N1}: the second bridge holds`);
  await cross(7);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 3 🎯 « عندما يقسم الأصغر الأكبر » ══════════════════════════
  expect((await st()).stage === 8 && (await st()).overlay === 'forge', 'island I opens the third forge');
  {
    const f = await fg();
    const ids = f.rows.map((r) => `${r.A}:${r.B}:${r.d}`);
    expect(
      f.phase === 'build' && ids.join() === [1, N1].map((d) => `${N1}:${N2}:${d}`).join(),
      `the forge opens on its tiles, his evidence the planks he made for ${N1} and ${N2} (${ids.join(', ')})`,
    );
  }
  await forgeTools('forge 3, the tiles');
  await pairChecks('forge 3, the tiles');
  await noName('forge 3, the tiles', /يقسم/);
  await shot('forge3-tiles');
  await mirrorBroken(
    'forge3',
    ['fills:short', 'else:short'],
    '90:36:36',
    ['fills:short', 'else:rows'],
    held,
    async (u) => {
      expect(u.A % u.B === 0, `the last step: ${u.B} divides ${u.A} (${u.A} = ${u.B} × ${u.A / u.B}) — computed here`);
      expect(
        (await fillUse({ q: u.A / u.B, g: 1 })) === 'longer',
        `the last step: PGCD(${u.A} ; ${u.B}) = 1 — a common divisor, not the greatest: refused`,
      );
      await shot('forge3-use');
      expect(
        (await fillUse({ q: u.A / u.B, g: u.B })) === 'ok',
        `${u.A} = ${u.B} × ${u.A / u.B}, so PGCD(${u.A} ; ${u.B}) = ${u.B} — one product, no list`,
      );
    },
    pairChecks,
  );
  await shot('tablet-3');
  expect(
    (await page.textContent('.di-card')).includes(TITLES['b-yaqsim-a']),
    `the tablet: « ${TITLES['b-yaqsim-a']} »`,
  );
  await page.click('[data-di-tablet]');
  await ff(0.5);
  expect((await st()).keys.length === 3, 'three keys earned, all forged');

  // ══════════════════════════ the gate dash: island I → J ══════════════════════════
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
    await shot('dash');
    /** The gate a wave's sentence asks, computed HERE from its two numbers: the PGCD, or a divisor of both. */
    const laneOf = (x) => {
      const [a, b] = (x.say.match(/\d+/g) ?? []).map(Number);
      const asksMax = /PGCD/.test(x.say);
      const ok = x.gates.map((n) => (asksMax ? n === gcd(a, b) : n >= 1 && a % n === 0 && b % n === 0));
      expect(ok.filter(Boolean).length === 1, `wave « ${x.say} »: exactly one gate is right (${x.gates.join(', ')})`);
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
  for (let k = 0; k < 30 && (await st()).stage !== 9; k += 1) await ff(1);
  await page.waitForTimeout(500);
  {
    const s = await st();
    const d = await page.evaluate(() => {
      const g = window.__world;
      return { island: g.hero.island, dash: Boolean(g.getState().dash), falls: g.getState().falls };
    });
    expect(
      s.stage === 9,
      `island J: the dash is ridden (${JSON.stringify({ stage: s.stage, phase: s.phase, overlay: s.overlay, ...d })})`,
    );
  }

  // ═══════════════ the last bridge: two piers, 154 then 238 — planks of 22 or 14 ═══════════════
  const [P1, P2] = [154, 238];
  const A = P1 + P2;
  await toAltar(9);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  expect(
    (await st()).overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes(String(A)),
    `the store opens on the lesson’s problem: ${A} cells, the two piers end to end`,
  );
  const moulds = await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
  const good = moulds.filter((b) => fills(P1, b) && fills(P2, b));
  const bad = moulds.find((b) => !good.includes(b));
  {
    const mission = (await page.textContent('[data-di-boss-mission]')) ?? '';
    const ask = (await page.textContent('.di-card h2')) ?? '';
    expect(
      moulds.length === 2 && good.length === 1 && good[0] === gcd(P1, P2),
      `the store offers ${moulds.join(' and ')}: ONE fills both piers, ${good.join()} = the longest plank of both (computed here)`,
    );
    expect(
      [mission, ask].every((t) => t.includes(String(P1)) && t.includes(String(P2))) && !/بالقسمة|PGCD/.test(ask),
      `the mission and the question name the two piers ${P1} and ${P2} (« ${ask.trim().slice(0, 80)} »)`,
    );
    expect(
      bad > good[0] && fills(P1, bad) && !fills(P2, bad) && A % bad === P2 % bad,
      `${bad} fills the first pier alone (${P2} = ${bad} × ${Math.floor(P2 / bad)} + ${P2 % bad}): one division never chooses`,
    );
  }
  await shot('boss');
  await page.click(`[data-di-mould="${bad}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  expect((await page.textContent('[data-di-boss-a]')).trim() === String(A), `the division to write starts with ${A}`);
  const bossErr = async (q, r) => {
    if (q !== '') await page.fill('[data-di-q]', String(q));
    if (r !== '') await page.fill('[data-di-r]', String(r));
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    return (await page.textContent('[data-di-boss-error]')) ?? '';
  };
  expect((await bossErr('', '')).includes('عدد الألواح'), 'an empty division is refused, in the words of this lesson');
  {
    const q = Math.floor(A / bad) + 1;
    const e = await bossErr(q, 0);
    expect(
      e.includes(String(q * bad)) && e.includes(String(A)),
      `${q} planks of ${bad}: « ${q * bad} cells, longer than ${A} » (${e.trim().slice(0, 70)})`,
    );
  }
  {
    const q = Math.floor(A / bad) - 1;
    const e = await bossErr(q, A - q * bad);
    expect(e.includes(`أصغر من ${bad}`), `${q} planks and ${A - q * bad} left: « room for another plank »`);
  }
  await shot('boss-divide');
  await page.fill('[data-di-q]', String(Math.floor(A / bad)));
  await page.fill('[data-di-r]', String(A % bad));
  await page.click('[data-di-check]');
  await ff(15);
  await page.waitForTimeout(400);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'choose' && o.tried[bad] === A % bad,
      `planks of ${bad} leave ${A % bad} cells: the store shows it tried and lets him choose again`,
    );
    const say = (await road()).say;
    check(
      say.includes(String(P2)) && say.includes(String(P2 % bad)),
      `the world says WHICH pier is not filled: ${P2}, ${P2 % bad} cells left (« ${say.slice(0, 90)} »)`,
    );
  }
  await shot('boss-tried');
  await page.click(`[data-di-mould="${good[0]}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(A / good[0]));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  await ff(14);
  await page.waitForTimeout(300);
  const Q = A / good[0];
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'cost' && o.q === Q,
      `the bridge of ${A} holds with ${Q} planks of ${good[0]}: the store asks their price`,
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  let price;
  {
    const asked = await page.textContent('.di-card h2');
    price = Number((await page.textContent('[data-di-boss-price]')).trim());
    expect(
      price > 0 && asked.includes(String(price)) && asked.includes(String(Q)),
      `the price in the sentence and in the equation are the SAME number (${price}), with the ${Q} planks`,
    );
    expect(
      (await page.textContent('.di-template')).includes('دج'),
      'the amount is typed in its own shape: « دج » printed',
    );
  }
  await shot('boss-cost');
  {
    await page.fill('[data-di-cost]', '4000');
    await page.click('[data-di-check]');
    await page.waitForTimeout(300);
    const e = await page.textContent('[data-di-boss-error]');
    expect(e.includes('4000') && e.includes('ثمن اللوح'), 'a wrong price is refused with a sentence');
  }
  expect(
    (await w.reachable(page, ['.di-veil [data-di-exit]'])) !== null,
    'the ✕ that leaves the game is drawn OVER the dialog and a click reaches it',
  );
  await page.click('[data-di-boss-close]');
  await ff(0.3);
  expect(
    (await st()).overlay == null && (await st()).phase === 'play',
    'the payment step can be CLOSED: back in the world',
  );
  await act();
  await page.waitForTimeout(400);
  expect((await st()).o?.view === 'cost', `the store opens again on the price of the ${Q} planks`);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-cost]', String(Q * price));
  await page.click('[data-di-check]');
  await ff(0.5);
  expect(
    (await st()).overlay == null && (await st()).objective.includes('اعبر إلى مرفأ الرصيفين'),
    `paid ${Q * price} دج (${Q} × ${price}): the objective says to cross to the harbour`,
  );
  await cross(9);
  await ff(3);
  await page.waitForTimeout(500);
  await shot('finale');
  await ff(6);
  await page.waitForTimeout(600);
  await shot('end');
  expect(
    (await st()).overlay === 'end',
    'the harbour is reached and the end screen shows: the story is played to its end',
  );
});
