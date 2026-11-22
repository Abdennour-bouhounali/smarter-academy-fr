// « أرخبيل القواسم: سوق الزهور » — walk of the game world of lesson `qasim-mushtarak-akbar` (lesson 4) as a STUDENT: its
// own story in the unit's world, PLAYED through its screens from the title to the end screen. Keys 1 and 2 are found ON THE
// ISLANDS (owner, 2026-11-19): two CONVOYS — the planks of island A build the bridges 198 and 234 (island B has none):
// he takes the plank of the first gap only, the second gap refuses it, he WALKS BACK holding « back » (the camera turns
// round) and takes the plank of both, and the first bridge goes back; on island C every plank fills 266 and 322 and a
// purse pays a coin per plank: a shorter plank runs out of coins on the second bridge, he walks back, the longest builds
// both. Forges 1 and 2 have no experiment screen and ask no prediction: they open on the TILES (the step « تنبّأ » is not
// shown), the mirror tests his rule on the planks he fired on the islands, and every case of theirs is a PAIR — the
// mirror draws two bridges, the plank laid on each, and the log line names both gaps. Forges 3 and 4 open on experiments of their own kind (GAME_WORLD.md
// « استكشف », spec shapes): `deal` (the florist's roses and lilies dealt into vases, then the most vases and what one
// holds), `nest` (the longest plank GIVEN; each probe judged by looking at it alone). In each forge: a false rule refuted by the mirror on HIS evidence, the attacks, the seal, the last step typed wrong
// then right, the tablet. On every world screen of islands A–E: the instruction is there, big, uncovered; the « اضغط E »
// prompt never covers a bridge's equation or its verdict.
// The ✕ is CLICKED twice — in the world (island B, after the refusal) and inside forge 1 (a tile picked) — and each
// time he comes back where he was: the same island with its bridge built and the planks he carries; the same mirror, on
// its tiles. The page is RELOADED on island D (the second island of the second convoy): he still carries his planks.
// Walking back: one press on « back » turns the camera AND the robot; then, pressed again twice, he walks back after
// only 0.4 s and stays on the bridge's axis (once on each convoy).
// Then the gate dash (lanes computed here from each sentence), the bridges the keys read, the stone's baskets (a wrong
// pick, then the right set), the store of the last bridge (a wrong shelf, wrong divisions, the price, its way out) and the
// market.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas left to
// right on one line, no word or number of lessons 1–3 (nor of the 1AM / 2AM lessons of the world), a way out reachable,
// no text under 12 px. Every investigation screen also: nothing leaves its frame, no button is covered (inquiryFits), and
// nothing in it names the rule its key is about to forge.
// The answers are computed HERE from the numbers on screen (state hooks are read for the question, never for the answer).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-mushtarak.mjs [outDir]
import { createWalk, FLOOR_PX, lessonUrl } from './lib/walk.mjs';
import { ID as SHARED_ID, MUSHTARAK_FOREIGN, MUSHTARAK_NUMBERS, gcd, divisors, common } from './lib/mushtarak.mjs';

// the lesson this walk plays, named here (scripts/lesson-v2-status.mjs finds a lesson's world walk by its id) — the same id
// the lesson's other walks share through lib/mushtarak.mjs
const ID = 'qasim-mushtarak-akbar';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
if (ID !== SHARED_ID) throw new Error(`this walk plays ${ID}, lib/mushtarak.mjs names ${SHARED_ID}`);

// the 12 px floor is on by default (lib/walk.mjs): every screenshot checks it
const w = createWalk('gameworld-mushtarak', { foreign: MUSHTARAK_FOREIGN, foreignNumbers: MUSHTARAK_NUMBERS });
const { expect, check } = w;
/** The way out of any screen of the world: the top bar's ✕, the forge's own ✕, the ✕ drawn over a dialog. */
const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
const fills = (n, d) => n % d === 0;
const both = (a, b, d) => fills(a, d) && fills(b, d);
const kindOf = (a, b, d) => (both(a, b, d) ? 'both' : fills(a, d) ? 'a' : fills(b, d) ? 'b' : 'none');

await w.run(async () => {
  const { page } = await w.student({ uid: 9841, lessonId: ID, url: URL });
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
  /** Forges on bridge i with the held mould; a prediction is answered with the remainder computed HERE. */
  const forge = async (i) => {
    await toAltar(i);
    await act();
    if ((await st()).overlay === 'predict') {
      const o = (await st()).o;
      await page.click(`[data-di-predict="${o.a % o.b}"]`);
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
  /** A bridge built from its altar: `wrong` first (it must crumble), then `right` (it must hold). */
  const bridge = async (i, id, a, wrong, right) => {
    if (wrong != null) {
      expect(
        a % wrong !== 0,
        `sanity: ${wrong} does not fill ${a} (${a} = ${wrong} × ${Math.floor(a / wrong)} + ${a % wrong})`,
      );
      await take(wrong);
      await forge(i);
      await ff(8);
      // many short planks take longer to lay (Game.js › forge: 0.1 s each at least): game time runs until he plays again
      for (let k = 0; k < 20 && (await st()).phase !== 'play'; k += 1) await ff(1);
      await page.waitForTimeout(300);
      expect(
        !(await st()).stars[id],
        `planks of ${wrong} leave cells over ${a} (${a} = ${wrong} × ${Math.floor(a / wrong)} + ${a % wrong}): the bridge crumbles`,
      );
    }
    expect(a % right === 0, `sanity: ${right} fills ${a}`);
    await take(right);
    await forge(i);
    await ff(8);
    expect((await st()).stars[id] >= 1, `bridge ${a} holds with planks of ${right} (${a} = ${right} × ${a / right})`);
  };
  /** The moulds offered on the island of segment i. */
  const mouldsOf = (i) => page.evaluate((k) => window.__world.isl[k].pedestals.map((p) => p.b), i);

  // ── the forges: what all four share ──
  const fg = () => page.evaluate(() => window.__forge);
  const iq = () => page.evaluate(() => window.__inquiry);
  const fact = async () => (await page.textContent('[data-iq-fact]')) ?? '';
  const iqText = async () => (await page.textContent('.iq')) ?? '';
  /** Waits until the experiment's stage is one of `stages`. */
  const iqAt = (stages, timeout = 20000) =>
    page.waitForFunction((ss) => ss.includes(window.__inquiry?.stage), stages, { timeout });
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
  const fillUse = async (vals) => {
    for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
    await page.click('[data-rf-use-check]');
    await page.waitForSelector('[data-rf-use-fb]');
    return page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb');
  };
  /**
   * From the mirror's attacks: each answered as the rule says — what the case IS, computed HERE by `truth(case)` from the
   * case's own numbers — then the seal and the last step, up to the tablet.
   */
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
      // the mirror builds it in front of him, stroke by stroke, then what the world did (computed here)
      check(
        heard.at(-1) === (yes ? 'success' : 'crumble'),
        `${name}: attack ${i + 1} — the mirror builds it, then ${yes ? 'success' : 'crumble'} (${[...new Set(heard)].join(', ')})`,
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
  /**
   * The mirror: a FALSE rule first (its tiles), refuted on the case of his evidence the walk computes (`expectId`); then
   * the right rule, its attacks, the seal, the last step.
   */
  const mirror = async (name, falseTiles, expectId, why, rightTiles, truth, last, onMirror) => {
    for (const t of falseTiles) await page.click(`[data-rf-tile="${t}"]`);
    await shot(`${name}-build`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    const got = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
    expect(
      got === expectId,
      `${name}: the rule « ${falseTiles.join(' + ')} » is refuted by a case HE made — ${why} (${got})`,
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
        'button, input, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-scene, .iq-found li, .iq-chips, .iq-shelf, .iq-tpl, .iq-askline, .iq-gknown, .iq-lists, .iq-sum-chips, .iqd-tab',
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
      // the words drawn in the scene (SVG text) are read too — at the size they are DRAWN: their font size in the units of
      // the scene × the scale the scene is drawn at (a scene squeezed by the rows around it shrinks its numbers)
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
      // two numbers drawn in the scene must not print on each other
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
      `${name}: the investigation fits its frame — nothing cut, covered, scrolled, overlapping or too small${bad.length ? ' — ' + bad.join(' | ') : ''}`,
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
  /** Nothing in the experiment names what its key is about to forge (`words`): the rule comes with the tablet. */
  const tellsNothing = async (kind, words) => {
    const t = await iqText();
    const said = words.filter((x) => t.includes(x));
    check(
      said.length === 0,
      `${kind}: the experiment names nothing of the rule it leads to${said.length ? ' — ' + said.join(', ') : ''}`,
    );
  };

  /**
   * His evidence: the forge keeps every line of what HE did (`expected`, computed by the walk); its column shows as many
   * as fit, the newest last (RuleForge.jsx: the oldest leave first) — at least one, never a line of the mirror's.
   */
  const ownRows = async (expected, msg) => {
    const rows = (await fg()).rows;
    const shown = await page.locator('[data-rf-row]').count();
    const own = await page.locator('[data-rf-row][data-rf-own="1"]').count();
    expect(
      rows.length === expected && rows.every((r) => !r.mirror) && shown >= 1 && own === shown,
      `${msg} (${rows.length} lines kept, ${expected} computed; ${shown} on screen)`,
    );
  };
  /**
   * The ✕ is CLICKED: the student really leaves the lesson (the world is gone, the address is another page). Then he
   * opens the lesson again and presses the title's button, which now offers to RESUME.
   */
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
    (await page.textContent('.di-title h1')).includes('سوق الزهور') &&
      (await page.textContent('.di-title__eyebrow')).includes('القاسم المشترك الأكبر لعددين طبيعيين'),
    'the title screen is this lesson’s own story (« سوق الزهور », « القاسم المشترك الأكبر لعددين طبيعيين »)',
  );
  await shot('title');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  await shot('start');

  // ══════════════════════════ islands A–E: the two CONVOYS are the experiments of keys 1 and 2 ══════════════════════════
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
        segs: g.segs.slice(0, 4).map((x) => ({ id: x.id, a: x.a, complete: x.complete, builtWith: x.builtWith })),
        names: g.isl.slice(0, 5).map((x) => x.name),
      };
    });
  /**
   * The checks of every WORLD screen while he plays the convoys: the instruction is on screen, big (16 px at least) and
   * nothing of the HUD covers it; while a bridge's equation is up, the floating « اضغط E » covers neither it nor its
   * verdict. Then the screenshot.
   */
  /** The words of the keys not forged yet: none may be said on the islands (A1) — 🤝 then 👑. */
  let forbid = /قاسم|مشترك|PGCD|الأكبر/;
  const worldShot = async (label) => {
    await page.waitForTimeout(250);
    console.log(`  · ${label}: falls ${(await road()).falls}`);
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
        // five points of the instruction: the element drawn on top is the instruction itself (or inside it)
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
    // what the islands SAY (the instruction, the card, Zero) names no rule before its tablet
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
    for (let k = 0; k < 40 && (await st()).phase !== 'play'; k += 1) await ff(1);
    await page.waitForTimeout(250);
  };
  /** The bridge i stands, built with planks of b (the world's own record of it). */
  const standsWith = async (i, b) => {
    const s = (await road()).segs[i];
    return s.complete && s.builtWith === b;
  };
  /**
   * Standing at the altar of a bridge that stands on the planks he carries, nothing is offered: no « اضغط E » prompt
   * over its result (2026-11-19: it covered the equation and the verdict).
   */
  const noPromptOnBuilt = async (label) => {
    await ff(0.3);
    const shown = await page.evaluate(() => {
      const el = document.querySelector('[data-di-wprompt]');
      if (!el) return false;
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });
    check(!shown, `${label}: at the altar of a bridge built with the planks he carries, no « اضغط E » prompt`);
  };
  /** Taking planks starts something new: the equation and the verdict of the bridge before have left. */
  const resultCleared = async (label) => {
    const r = await page.evaluate(() => {
      const s = window.__world.getState();
      return { eq: s.equation, v: s.verdict, shown: document.querySelectorAll('.di-eq, .di-verdict').length };
    });
    check(
      r.eq == null && r.v == null && r.shown === 0,
      `${label}: taking planks clears the equation and the verdict of the bridge before (${JSON.stringify(r)})`,
    );
  };
  /** Runs game time until `test(road)` holds (or `sec` seconds of game time have passed). */
  const until = async (test, sec = 30) => {
    for (let t = 0; t < sec * 4; t += 1) {
      if (test(await road())) return true;
      await ff(0.25);
    }
    return test(await road());
  };
  /**
   * HE WALKS BACK, as a student does (the owner's control, 2026-11-19): ONE press on « back » (ArrowDown) turns him round
   * — `facing` -1, the camera swings toward the previous island AND the robot turns on the spot (WorldRuntime ›
   * `turning`: within ~1.5 s, with no other key held, its yaw is the world's `heading()`); it never walks him. A second
   * press turns both to the road ahead again. A third turns him round once more, and only 0.4 s later — the lens still
   * swinging — he HOLDS « forward » (ArrowUp), which walks him the way he faces, over the bridge he built, to island
   * `to`, steering with « left » / « right » toward the bridge when he is off its line (he stands where he was: at an
   * altar, not on the road's axis). He must stay on the bridge's axis (his keys follow the road until the lens is
   * within ~15° of it: 2026-11-19, he drifted off before). No teleport.
   */
  const walkBack = async (to, label) => {
    const before = await road();
    /** Where he is across the bridge he walks back on (0 = its axis), and how the lens looks against the road back. */
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
    /** How far the ROBOT faces from where the world says he looks (`heading()`), in radians. */
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
    const yaw0 = await robotOff();
    await press();
    expect((await road()).facing === -1, `${label}: « back » turns him round (facing ${(await road()).facing})`);
    await ff(1.4);
    {
      const a = await across();
      expect(
        a.lens < 0.2,
        `${label}: the camera has swung behind him, looking back along the road (${a.lens.toFixed(2)} rad off)`,
      );
      const off = await robotOff();
      expect(
        off < 0.2,
        `${label}: the ROBOT has turned round too, on the spot (${off.toFixed(2)} rad from the view's heading, 1.5 s after the press; ${yaw0.toFixed(2)} before)`,
      );
      await worldShot(`${label}-turned`);
    }
    // a second press: the view and the robot face the road ahead again
    await press();
    await ff(1.4);
    {
      const off = await robotOff();
      expect(
        (await road()).facing === 1 && off < 0.2,
        `${label}: a second press turns the view and the robot to the road ahead (${off.toFixed(2)} rad)`,
      );
    }
    // a third: he turns round and walks back at once — 0.4 s after the press, the lens still swinging
    await press();
    await ff(0.3);
    expect((await road()).facing === -1, `${label}: pressed again, he faces back (walks 0.4 s after the press)`);
    await page.keyboard.down('ArrowUp');
    let worst = 0;
    let shotTaken = false;
    let steer = null;
    // which of « left » / « right » brings him back toward the bridge's line, found by trying (as a student does)
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
      if (steer && Math.abs(a.v) > Math.abs(was.v) + 0.05) toward = { pos: toward.neg, neg: toward.pos }; // that key pushed him away: the other one
      // on the bridge itself (its two ends are where he steps on and off it)
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
    // the bridge is 2 × 1.15 wide (Game.js › BRIDGE_HALF): starting to walk 0.4 s after the turn, he stays near its axis
    expect(
      worst <= 0.6,
      `${label}: walking 0.4 s after the turn, he stays on the bridge's axis (at most ${worst.toFixed(2)})`,
    );
  };
  /**
   * He turns to the road ahead again — one more press on « back » (ArrowDown) swings the camera to the front, `facing` 1
   * — lets the camera swing, then crosses bridge i without falling.
   */
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
  /** The instruction's fold: folds it, then opens it again (owner: he may hide it himself, and display it again). */
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

  // ── island A: four planks, two gaps — the instruction names both BEFORE he picks ──
  const [T1, T2] = [198, 234];
  {
    const r = await road();
    expect(
      r.segs[0].a === T1 && r.segs[1].a === T2,
      `the road starts with two gaps, ${T1} then ${T2} (${r.segs[0].a}, ${r.segs[1].a})`,
    );
    expect(
      (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'open' &&
        r.objective.includes(String(T1)) &&
        r.objective.includes(String(T2)),
      `island A: the instruction is open and names both gaps (« ${r.objective} »)`,
    );
    const m = await mouldsOf(0);
    const kinds = new Set(m.map((d) => kindOf(T1, T2, d)));
    expect(
      m.length === 4 && kinds.size === 4,
      `island A offers ${m.join(', ')}: one plank fills neither gap, one the first only, one the second only, one both — computed here`,
    );
    expect((await mouldsOf(1)).length === 0, 'island B holds no plank: the planks of A build both bridges');
    await worldShot('island-a');
    await foldAndOpen('island-a');
  }
  // ── he takes the plank that fills the FIRST gap only (computed here): the first bridge holds ──
  const firstOnly = (await mouldsOf(0)).find((d) => kindOf(T1, T2, d) === 'a');
  const bothPlank = (await mouldsOf(0)).find((d) => kindOf(T1, T2, d) === 'both');
  await take(firstOnly);
  await fire(0, async () => {
    await ff(0.7);
    await worldShot('g198-building');
  });
  expect(await standsWith(0, firstOnly), `${T1} = ${firstOnly} × ${T1 / firstOnly}: the first bridge holds`);
  await noPromptOnBuilt('g198 held');
  await worldShot('g198-held');
  await cross(0);
  await page.waitForTimeout(400);
  {
    const r = await road();
    expect(r.stage === 1 && r.held === firstOnly, `island B: he still carries the planks ${firstOnly} (${r.held})`);
    expect((await mouldsOf(1)).length === 0, 'island B: no pedestal, no plank');
    const card = (await page.textContent('[data-di-recall]').catch(() => '')) ?? '';
    expect(
      card.includes(String(T1)) && card.includes(String(firstOnly)) && card.includes(String(T2)),
      `the card on the right recalls the first bridge (${T1} with ${firstOnly}) and the gap ahead (« ${card.trim().slice(0, 80)} »)`,
    );
    expect(
      r.objective.includes(String(T2)) && r.objective.includes(String(firstOnly)),
      `island B: the instruction names the gap ${T2} and the planks he carries (« ${r.objective} »)`,
    );
    await worldShot('island-b');
  }
  // ── the second gap refuses them: 234 = 11 × 21 + 3 ──
  await fire(1, async () => {
    expect(await until((r) => r.verdict != null, 12), 'the world shows its verdict on the second bridge');
    const v = (await road()).verdict;
    expect(
      !v.holds && v.r === T2 % firstOnly,
      `${T2} = ${firstOnly} × ${Math.floor(T2 / firstOnly)} + ${T2 % firstOnly}: the second bridge does not hold (${JSON.stringify(v)})`,
    );
    await worldShot('g234-refused');
  });
  {
    const r = await road();
    expect(!r.segs[1].complete, 'the second bridge fell');
    expect(
      r.objective.includes(r.names[0]),
      `the instruction now sends him back to « ${r.names[0]} » (« ${r.objective} »)`,
    );
  }
  // ── the ✕ of the WORLD, clicked on island B after the refusal: he leaves, comes back, and is where he was ──
  await leaveAndReturn('in the world, on island B', ['.di-top a.di-icon', '.di-top [data-di-exit]']);
  {
    const s = await st();
    const r = await road();
    expect(
      s.phase === 'play' && s.stage === 1 && s.overlay == null && (await standsWith(0, firstOnly)),
      `he is back WHERE HE WAS: island B, the first bridge still built with ${firstOnly} (${JSON.stringify({ phase: s.phase, stage: s.stage, overlay: s.overlay })})`,
    );
    expect(
      s.held === firstOnly,
      `back on island B he still carries the planks ${firstOnly} — they were saved (${s.held})`,
    );
    await ff(0.3);
    const at = await page.evaluate(() => window.__world.hero.island);
    expect(at === 1, `the hero stands on island B (island ${at})`);
    expect(r.objective.includes(r.names[0]), `the instruction still sends him back to « ${r.names[0]} »`);
    await worldShot('back-on-island-b');
  }
  // ── he WALKS BACK to island A, holding « back » ──
  await walkBack(0, 'walk-back-to-a');
  // ── on A he takes the plank of both: the first bridge, built with the other planks, goes back ──
  await take(bothPlank);
  {
    const r = await road();
    expect(
      r.stage === 0 && !r.segs[0].complete && r.segs[0].builtWith == null,
      `planks of ${bothPlank} taken on A: the bridge of ${firstOnly} goes back, the road starts again from A (stage ${r.stage})`,
    );
    await resultCleared(`planks of ${bothPlank} taken on A`);
    await worldShot('bridge-goes-back');
  }
  await ff(1.5);
  await fire(0);
  expect(await standsWith(0, bothPlank), `${T1} = ${bothPlank} × ${T1 / bothPlank}: the first bridge holds again`);
  await crossAgain(0, 'A → B again');
  await page.waitForTimeout(300);
  expect((await road()).held === bothPlank, `island B: he carries the planks ${bothPlank}`);
  await fire(1);
  expect(await standsWith(1, bothPlank), `${T2} = ${bothPlank} × ${T2 / bothPlank}: the second bridge holds`);
  await noPromptOnBuilt('g234 held');
  await worldShot('g234-held');
  await cross(1);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 1 🤝 « القواسم المشتركة » — on what he did on the islands ══════════════════════════
  /** His planks on a pair of gaps, in the order he first fired them — computed from what the walk did. */
  const firstForge = [firstOnly, bothPlank];
  /**
   * The forge opens on its TILES (no experiment screen, no prediction: the islands held them) — the step « تنبّأ » is
   * not shown — and his evidence is what HE fired on a and b: one line per plank, none of the mirror's.
   */
  const opensOnTiles = async (key, a, b, mine) => {
    const f = await fg();
    const steps = await page.locator('.rf-steps li').allTextContents();
    expect(
      f.key === key &&
        f.phase === 'build' &&
        (await page.locator('.iq').count()) === 0 &&
        (await page.locator('[data-rf-guess]').count()) === 0 &&
        (await page.locator('[data-rf-tile]').count()) > 0,
      `the forge of « ${key} » opens on its TILES — no experiment screen, no prediction: the islands were it (${f.phase})`,
    );
    expect(
      steps.length === 3 && !steps.some((t) => t.includes('تنبّأ')) && steps[0].includes('اكتب قاعدتك'),
      `the steps shown are the steps played: ${steps.map((t) => t.trim()).join(' → ')}`,
    );
    expect(
      f.rows.map((r) => r.d).join() === mine.join() && f.rows.every((r) => r.A === a && r.B === b && !r.mirror),
      `his evidence is what HE fired on ${a} and ${b}: the planks ${mine.join(', ')} (${f.rows.map((r) => r.d).join(', ')})`,
    );
  };
  /**
   * A case of forges 1 and 2 is a PAIR: the log's lines name both gaps and the plank, each on ONE line with a mini of
   * two bars, inside the column; while the mirror shows a case (an attack), it draws TWO bridges — the plank laid on
   * each, each holding or falling by itself (computed HERE) — fitting the mirror's box, its words at 12 px at least.
   */
  const pairChecks = async (where) => {
    // a refuting line shakes for 0.4 s (ruleForge.css › rf-shake): it is measured once it stands still
    await page.waitForTimeout(450);
    const f = await fg();
    const m = await page.evaluate((FLOOR) => {
      const out = { bad: [] };
      const log = document.querySelector('.rf-log ul').getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit').style.zoom) || 1;
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
        // one line: no taller than one line of its biggest text (the gaps' numbers)
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
        out.zoom = zoom;
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
    // the first attack once dealt: two bridges, each with its own look (looked at with the eyes)
    if (m.stage === 'done' && where.endsWith('attack 1 dealt')) await shot(`${where.split(',')[0]}-attack-dealt`);
    if (m.stage === 'done')
      for (const [n, f1, cls] of m.fills) {
        const yes = n % c.d === 0;
        check(
          f1 === (yes ? '1' : '0') && cls.includes(yes ? 'is-held' : 'is-fell'),
          `${where}: the bridge of ${n} ${yes ? 'holds' : 'falls'} with planks of ${c.d} — ${n} = ${c.d} × ${Math.floor(n / c.d)} + ${n % c.d} (${cls})`,
        );
      }
  };
  expect(
    (await st()).stage === 2 && (await st()).overlay === 'forge',
    'island C « جزيرة الياقوت » opens the first forge',
  );
  await opensOnTiles('qawasim-mushtaraka', T1, T2, firstForge);
  await forgeTools('forge 1, the tiles');
  await pairChecks('forge 1, the tiles');
  await shot('forge1-tiles');
  // ── the ✕ of the FORGE, clicked after he picked a tile: he leaves; back, the same mirror waits for him ──
  await page.click('[data-rf-tile="act:fill"]');
  await leaveAndReturn('inside forge 1', ['.rf-root [data-di-exit]']);
  await ff(1.5);
  await page.waitForSelector('[data-rf="build"]', { timeout: 15000 });
  {
    const s = await st();
    expect(
      s.stage === 2 && s.overlay === 'forge' && s.keys.length === 0 && (await standsWith(1, bothPlank)),
      'he is back WHERE HE WAS: island C, in front of its mirror — the forge opens again by itself, no key skipped',
    );
    await opensOnTiles('qawasim-mushtaraka', T1, T2, firstForge);
  }
  {
    // a false rule: « it fills the first gap » — the first plank of HIS where it says otherwise, computed here
    const bad = firstForge.find((d) => fills(T1, d) !== both(T1, T2, d));
    await mirror(
      'forge1',
      ['act:fill', 'where:first'],
      `${T1}:${T2}:${bad}`,
      `${bad} fills ${T1}, and ${T2} = ${bad} × ${Math.floor(T2 / bad)} + ${T2 % bad}`,
      ['act:fill', 'where:each'],
      (c) => both(c.A, c.B, c.d),
      async (u) => {
        const set = common(u.A, u.B);
        const boxes = await page.locator('[data-rf-use]').count();
        expect(
          boxes === set.length,
          `the last step: ${boxes} boxes for the planks of ${u.A} and ${u.B} (${set.length} computed here)`,
        );
        const intruder = divisors(u.A).find((d) => u.B % d !== 0);
        const wrong = Object.fromEntries(set.map((d, i) => [`d${i + 1}`, i === set.length - 1 ? intruder : d]));
        expect(
          (await fillUse(wrong)) === 'intruder',
          `the last step: ${intruder} fills ${u.A} and not ${u.B} — refused`,
        );
        await shot('forge1-use');
        expect(
          (await fillUse(Object.fromEntries(set.map((d, i) => [`d${i + 1}`, d])))) === 'ok',
          `the planks of both ${u.A} and ${u.B}: ${set.join(', ')}, without laying one`,
        );
      },
      pairChecks,
    );
  }
  await shot('tablet-1');
  expect(
    (await page.textContent('[data-di-my-rule]')).includes('كلّ هوّة من الهوّتين') &&
      (await page.textContent('.di-card')).includes('القواسم المشتركة'),
    'the tablet names the rule after HIS own: « القواسم المشتركة »',
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 1, 'one key earned');
  forbid = /PGCD|الأكبر/;

  // ── island C: every plank fills both gaps; a purse of a coin per plank ──
  const [C1, C2] = [266, 322];
  let purseOf = 0;
  {
    await ff(0.5);
    const r = await road();
    purseOf = r.purse?.of ?? 0;
    const m = await mouldsOf(2);
    expect(
      r.segs[2].a === C1 && r.segs[3].a === C2 && m.length === 3 && m.every((d) => both(C1, C2, d)),
      `island C offers ${m.join(', ')}: every one fills ${C1} and ${C2} — computed here`,
    );
    expect(
      purseOf > 0 &&
        r.purse.left === purseOf &&
        (await page.getAttribute('[data-di-purse]', 'data-di-purse')) === String(purseOf),
      `the purse chip shows ${purseOf} coins`,
    );
    // with the coins, only ONE of them builds both bridges: the walk computes which (a coin per plank)
    const fit = m.filter((d) => C1 / d + C2 / d <= purseOf);
    expect(fit.length === 1, `with ${purseOf} coins, ONE plank builds both bridges (${fit.join()})`);
    expect(
      r.objective.includes(String(C1)) && r.objective.includes(String(C2)) && r.objective.includes(String(purseOf)),
      `island C: the instruction names both gaps and the purse (« ${r.objective} »)`,
    );
    expect((await mouldsOf(3)).length === 0, 'island D holds no plank');
    await worldShot('island-c');
  }
  const crownPlanks = await mouldsOf(2);
  const cheap = crownPlanks.find((d) => C1 / d + C2 / d <= purseOf);
  // a plank of both, shorter, whose coins last the first bridge and run out on the second — computed here
  const short = crownPlanks.find((d) => d !== cheap && C1 / d <= purseOf && C1 / d + C2 / d > purseOf);
  expect(short != null, `a shorter plank that pays the first bridge and not the second: ${short}`);
  await take(short);
  await fire(2, async () => {
    await ff(1.2);
    await worldShot('g266-building');
  });
  {
    const left = purseOf - C1 / short;
    expect(await standsWith(2, short), `${C1} = ${short} × ${C1 / short}: the first bridge holds`);
    await noPromptOnBuilt('g266 held');
    expect(
      (await page.getAttribute('[data-di-purse]', 'data-di-purse')) === String(left),
      `${C1 / short} coins spent: ${left} left in the purse`,
    );
  }
  await cross(2);
  await page.waitForTimeout(400);
  {
    const r = await road();
    const left = purseOf - C1 / short;
    expect(r.stage === 3 && r.held === short, `island D: he carries the planks ${short}`);
    const card = (await page.textContent('[data-di-recall]').catch(() => '')) ?? '';
    expect(
      card.includes(String(C1 / short)) && card.includes(String(left)),
      `the card on the right: the coins of the first bridge (${C1 / short}) and what is left (${left}) (« ${card.trim().slice(0, 90)} »)`,
    );
    await worldShot('island-d');
  }
  // ── the second bridge: the coins run out — the purse at 0, the sentence of the world ──
  await fire(3, async () => {
    expect(await until((r) => r.verdict?.purse === true, 20), 'the purse runs out before the second bridge is full');
    const r = await road();
    const paid = purseOf - C1 / short;
    expect(
      r.purse?.left === 0 && (await page.getAttribute('[data-di-purse]', 'data-di-purse')) === '0',
      'the purse chip shows 0',
    );
    const v = (await page.textContent('.di-verdict__bridge')) ?? '';
    expect(
      v.includes(String(C2 / short)) && v.includes(String(paid)),
      `the verdict: ${paid} planks laid of ${C2 / short} (« ${v.trim()} »)`,
    );
    // what is still open is not a remainder (it is longer than the plank): the legend says so, and the gap's own 3D
    // label hides behind the result panel
    const open = C2 - short * paid;
    const legend = (await page.textContent('.di-eq__legend').catch(() => '')) ?? '';
    check(
      legend.includes(`خانات بلا ألواح: ${open}`) && !legend.includes('الباقي'),
      `the purse out: the legend says « خانات بلا ألواح: ${open} », not « الباقي » (« ${legend.trim()} »)`,
    );
    const label3d = await page.evaluate(() => {
      const seg = window.__world.segs[3];
      return { label: seg.label ? seg.label.visible : null, count: seg.count ? seg.count.visible : null };
    });
    check(
      label3d.label !== true && label3d.count !== true,
      `the purse out: the gap's 3D label and count are hidden behind the result (${JSON.stringify(label3d)})`,
    );
    await worldShot('purse-out');
  });
  {
    const r = await road();
    expect(
      !r.segs[3].complete && /انتهت القطع/.test(r.say) && r.objective.includes(r.names[2]),
      `the second bridge goes back, Zero says the coins ran out, and the instruction sends him back to « ${r.names[2]} » (« ${r.say} »)`,
    );
    expect(r.purse?.left === purseOf - C1 / short, `the coins of the second bridge come back: ${r.purse?.left}`);
  }
  // ── the page is RELOADED on island D (the second island of the convoy): the planks he carries were saved ──
  {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
    await ff(0.5);
    const r = await road();
    expect(
      r.phase === 'play' && r.stage === 3 && r.island === 3 && (await standsWith(2, short)),
      `after a reload he is on island D, the bridge of ${short} standing behind him (stage ${r.stage}, island ${r.island})`,
    );
    expect(r.held === short, `after a reload on island D he still carries the planks ${short} (${r.held})`);
    expect(
      r.purse?.left === purseOf - C1 / short && r.objective.includes(r.names[2]),
      `after a reload: the purse (${r.purse?.left}) and the instruction sending him back to « ${r.names[2]} » (« ${r.objective} »)`,
    );
    await worldShot('reload-on-d');
  }
  await walkBack(2, 'walk-back-to-c');
  await take(cheap);
  {
    const r = await road();
    expect(
      r.stage === 2 && !r.segs[2].complete && r.purse?.left === purseOf,
      `planks of ${cheap} taken on C: the bridge of ${short} goes back and the purse is full again (${r.purse?.left})`,
    );
    await resultCleared(`planks of ${cheap} taken on C`);
    await worldShot('crown-goes-back');
  }
  await ff(1.5);
  await fire(2);
  expect(await standsWith(2, cheap), `${C1} = ${cheap} × ${C1 / cheap}: the first bridge holds`);
  await noPromptOnBuilt('g266 held again');
  await crossAgain(2, 'C → D again');
  await page.waitForTimeout(300);
  await fire(3, async () => {
    expect(await until((r) => r.verdict?.holds === true, 20), 'the second bridge holds');
    expect(
      (await page.getAttribute('[data-di-purse]', 'data-di-purse').catch(() => null)) === '0',
      'the last plank laid takes the last coin: the purse chip shows 0',
    );
    await worldShot('g322-held');
  });
  expect(
    (await standsWith(3, cheap)) && (await road()).purse == null,
    `${C2} = ${cheap} × ${C2 / cheap}: both bridges stand with ${C1 / cheap + C2 / cheap} coins — the whole purse; the chip leaves`,
  );
  await cross(3);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 2 👑 « القاسم المشترك الأكبر » — on what he did on the islands ══════════════════════════
  expect(
    (await st()).stage === 4 && (await st()).overlay === 'forge',
    'island E « جزيرة التاج » opens the second forge',
  );
  await opensOnTiles('al-akbar', C1, C2, [short, cheap]);
  {
    const f = await fg();
    const need = f.rows.map((r) => `${r.d}:${r.need}`).join();
    expect(
      need === [short, cheap].map((d) => `${d}:${C1 / d + C2 / d}`).join(),
      `each line says how many planks the plank needs for both bridges, computed (${need})`,
    );
  }
  {
    // each line says it in the log itself: « 24 لوحًا » — the planks the two bridges need, computed here
    const tags = await page.locator('.rf-root [data-rf-row] em').allTextContents();
    expect(
      [short, cheap].every((d) => tags.some((t) => t.includes(String(C1 / d + C2 / d)))),
      `forge 2: the log's lines write the planks each plank needs for both bridges (${tags.join(' | ')})`,
    );
  }
  await forgeTools('forge 2, the tiles');
  await pairChecks('forge 2, the tiles');
  await shot('forge2-tiles');
  const noName = async (where) => {
    const t = (await page.textContent('.rf-root')) ?? '';
    check(!/PGCD|القاسم المشترك الأكبر/.test(t), `${where}: the mirror names nothing before the tablet`);
  };
  await noName('forge 2, the tiles');
  // a false rule: « any plank of both: they all cost the same » — his shorter plank refutes it
  await mirror(
    'forge2',
    ['pick:any', 'among:both'],
    `${C1}:${C2}:${short}`,
    `${short} fills both, and needs ${C1 / short + C2 / short} planks — ${cheap} needs ${C1 / cheap + C2 / cheap}`,
    ['pick:longest', 'among:both'],
    (c) => c.d === gcd(c.A, c.B),
    async (u) => {
      await noName('forge 2, the last step');
      const g = gcd(u.A, u.B);
      const smaller = common(u.A, u.B)
        .filter((d) => d < g)
        .at(-1);
      expect(
        (await fillUse({ g: smaller, x: u.A / smaller, h: smaller, y: u.B / smaller })) === 'longer',
        `the last step: ${u.A} = ${smaller} × ${u.A / smaller}, ${u.B} = ${smaller} × ${u.B / smaller} — a longer plank fills both: refused`,
      );
      await shot('forge2-use');
      expect(
        (await fillUse({ g, x: u.A / g, h: g, y: u.B / g })) === 'ok',
        `${u.A} = ${g} × ${u.A / g} and ${u.B} = ${g} × ${u.B / g}: the longest plank, without laying one`,
      );
    },
    pairChecks,
  );
  await shot('tablet-2');
  expect(
    (await page.textContent('.di-card')).includes('القاسم المشترك الأكبر'),
    'the tablet: « القاسم المشترك الأكبر »',
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 2, 'two keys earned');

  // ── 342 with the longest plank of the twins, then the dash of island F ──
  {
    const m = await mouldsOf(4);
    const g = gcd(198, 234);
    expect(
      m.includes(g) && m.filter((b) => 342 % b === 0).join() === String(g),
      `island E offers ${m.join(', ')}: the longest plank of the twins (${g}) alone fills 342`,
    );
    await bridge(
      4,
      'g342',
      342,
      m.find((b) => 342 % b !== 0),
      g,
    );
  }
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
      say && say.trim().length > 5,
      `the dash says this lesson’s sentence over the rail (« ${say?.trim().slice(0, 50)} »)`,
    );
    await shot('dash');
    /** The gate a wave's sentence asks, computed HERE from its two numbers: the PGCD, or a divisor of both. */
    const laneOf = (x) => {
      const [a, b] = (x.say.match(/\d+/g) ?? []).map(Number);
      const asksMax = /PGCD|أطول/.test(x.say);
      const ok = x.gates.map((n) => (asksMax ? n === gcd(a, b) : a % n === 0 && b % n === 0));
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
  await ff(6);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 3 💐 « الباقات المتماثلة » — DEAL ══════════════════════════
  expect(
    (await st()).stage === 6 && (await st()).overlay === 'forge',
    'island G « جزيرة الباقات » opens the third forge',
  );
  await opensOnQuestion('baqat-mutamathila', 'deal');
  const R = 40;
  const L = 56;
  const dealtRows = [];
  {
    const lead = (await page.textContent('.iq-lead')) ?? '';
    expect(
      lead.includes(String(R)) && lead.includes(String(L)),
      `the florist's ${R} roses and ${L} lilies are in the question`,
    );
    expect(
      Number(await page.getAttribute('[data-iq-pile="a"]', 'data-iq-count')) === R &&
        Number(await page.getAttribute('[data-iq-pile="b"]', 'data-iq-count')) === L &&
        (await page.locator('[data-iq-pile="a"] use').count()) === R &&
        (await page.locator('[data-iq-pile="b"] use').count()) === L,
      `the table draws ${R} roses and ${L} lilies, one by one`,
    );
    await tellsNothing('deal', ['PGCD', 'القاسم المشترك', 'قاسم مشترك', 'الباقات المتماثلة']);
    await inquiryFits('deal-start');
    // the choices he tries: 6 (leaves both), 5 (leaves lilies — he says « all shared »: a wrong prediction), 4, 8
    for (const [i, k] of [6, 5, 4, 8].entries()) {
      await page.click(`[data-iq-choice="${k}"]`);
      await iqAt(['guess']);
      const truth = both(R, L, k);
      const say = k === 5 ? !truth : truth;
      if (i === 0) await inquiryFits('deal-guess');
      await page.click(`[data-iq-say="${say ? 'yes' : 'no'}"]`);
      await iqAt(['pick']);
      dealtRows.push(k);
      const holds = await page.locator('[data-iq-lot]').evaluateAll((els) => els.map((e) => e.dataset.iqHolds));
      expect(
        holds.length === k && holds.every((h) => h === `${Math.floor(R / k)},${Math.floor(L / k)}`),
        `${k} vases drawn, each holding ${Math.floor(R / k)} roses and ${Math.floor(L / k)} lilies (${holds[0]})`,
      );
      expect(
        Number(await page.getAttribute('[data-iq-pile="a"]', 'data-iq-count')) === R % k &&
          Number(await page.getAttribute('[data-iq-pile="b"]', 'data-iq-count')) === L % k &&
          (await page.locator('[data-iq-pile="a"] use').count()) === R % k &&
          (await page.locator('[data-iq-pile="b"] use').count()) === L % k,
        `${k} vases: ${R % k} roses and ${L % k} lilies stay on the table, drawn apart`,
      );
      const f = await fact();
      expect(
        f.includes(say === truth ? 'كما توقّعت' : 'لم يكن هذا توقّعك'),
        `${k} vases: the fact beside his prediction (« ${f.trim().slice(0, 80)} »)`,
      );
      expect(
        (await page.getAttribute(`[data-iq-try="${k}"]`, 'data-iq-ok')) === (truth ? '1' : '0'),
        `${k} vases: its column in the table says ${truth ? 'everything shared' : 'flowers left'}`,
      );
      if (k === 5) await inquiryFits('deal-wrong-pick');
      if (k === 8) await inquiryFits('deal-shared');
    }
    // a number already tried shows its row again — nothing is dealt twice
    await page.click('[data-iq-choice="6"]');
    await page.waitForTimeout(200);
    expect(
      (await iq()).stage === 'pick' && (await fact()).includes('جرّبتَ هذا العدد'),
      'a number already tried: its deal shown again, not dealt twice',
    );
    await tellsNothing('deal (table)', ['PGCD', 'القاسم المشترك', 'قاسم مشترك']);
    await page.click('[data-iq-to-answer]');
    await iqAt(['answer']);
    await inquiryFits('deal-answer');
    // a wrong answer: 4 vases share everything, but 8 of HIS table did too
    await page.fill('[data-iq-in="k"]', '4');
    await page.fill('[data-iq-in="x"]', String(R / 4));
    await page.fill('[data-iq-in="y"]', String(L / 4));
    await page.click('[data-iq-check]');
    await iqAt(['pick']);
    {
      const f = await fact();
      expect(
        f.includes('8') && (await iq()).k === 8,
        `4 vases: answered by HIS row of 8 vases, which shares everything too (« ${f.trim().slice(0, 80)} »)`,
      );
      await inquiryFits('deal-answer-miss');
    }
    const g = gcd(R, L);
    await page.click('[data-iq-to-answer]');
    await iqAt(['answer']);
    await page.fill('[data-iq-in="k"]', String(g));
    await page.fill('[data-iq-in="x"]', String(R / g));
    await page.fill('[data-iq-in="y"]', String(L / g));
    await page.click('[data-iq-check]');
    await iqAt(['seen']);
    expect(
      (await fact()).includes(String(R / g)),
      `${g} vases, ${R / g} roses and ${L / g} lilies in each: no flower left`,
    );
    await inquiryFits('deal-found');
    await page.click('[data-iq-next]');
  }
  await page.waitForSelector('[data-rf="build"]');
  {
    // his rows: each vase count he dealt, the most and what one holds, and his wrong answer (most 4, 10 and 14)
    await ownRows(dealtRows.length + 2 + 2, 'only now he WRITES his rule — on what HE dealt and answered');
  }
  {
    // a false rule: « the number of vases divides ONE of the two numbers at least » — his first deal where it is wrong
    const firstBad = dealtRows.find((k) => (R % k === 0 || L % k === 0) !== both(R, L, k));
    await mirror(
      'forge3',
      ['must:one', 'most:gcd', 'holds:quot'],
      `deal:${R}:${L}:${firstBad}`,
      `${firstBad} vases: ${R} = ${firstBad} × ${Math.floor(R / firstBad)} + ${R % firstBad}, ${L} = ${firstBad} × ${Math.floor(L / firstBad)} + ${L % firstBad}`,
      ['must:both', 'most:gcd', 'holds:quot'],
      (c) =>
        c.kind === 'deal'
          ? both(c.nA, c.nB, c.k)
          : c.kind === 'most'
            ? c.k === gcd(c.nA, c.nB)
            : both(c.nA, c.nB, c.k) && c.x * c.k === c.nA && c.y * c.k === c.nB,
      async (u) => {
        const gg = gcd(u.nA, u.nB);
        const smaller = common(u.nA, u.nB)
          .filter((d) => d < gg)
          .at(-1);
        expect(
          (await fillUse({ k: smaller, x: u.nA / smaller, y: u.nB / smaller })) === 'more',
          `the last step: ${smaller} shares ${u.nA} and ${u.nB}, but a bigger number does too — refused`,
        );
        await shot('forge3-use');
        expect(
          (await fillUse({ k: gg, x: u.nA / gg, y: u.nB / gg })) === 'ok',
          `${gg} lots, ${u.nA / gg} and ${u.nB / gg} in each`,
        );
      },
      // the mirror of THIS forge shows a sharing — roses and lilies dealt into vases — never a bridge, and no word of
      // its screen (the mirror, the panel, his evidence) is a plank
      async (where) => {
        const m = await page.evaluate(() => ({
          deal: document.querySelectorAll('.rf-root [data-rf-deal]').length,
          bridge: document.querySelectorAll('.rf-root [data-rf-bridge]').length,
          lots: document.querySelectorAll('.rf-root [data-rf-deal] [data-iq-lot]').length,
          k: Number(document.querySelector('.rf-root [data-rf-deal]')?.dataset.rfDeal.split(':')[2]),
          text: document.querySelector('.rf-root')?.innerText ?? '',
        }));
        if (where.includes('attack'))
          expect(
            m.deal === 1 && m.bridge === 0 && m.lots === m.k,
            `${where}: the mirror draws a SHARING (${m.k} vases), not a bridge (${JSON.stringify({ ...m, text: undefined })})`,
          );
        else check(m.bridge === 0, `${where}: no bridge is drawn in the vases' forge`);
        expect(!m.text.includes('لوح'), `${where}: no text of the vases' forge says « لوح »`);
      },
    );
  }
  await shot('tablet-3');
  expect((await page.textContent('.di-card')).includes('الباقات المتماثلة'), 'the tablet: « الباقات المتماثلة »');
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 3, 'three keys earned');

  // ── 228, the dates of the next island ──
  {
    const m = await mouldsOf(6);
    const right = m.filter((b) => 228 % b === 0);
    expect(right.length === 1, `island G offers ${m.join(', ')}: ONE fills 228 (${right.join()})`);
    await bridge(
      6,
      'g228',
      228,
      m.find((b) => 228 % b !== 0),
      right[0],
    );
    await shot('g228');
  }
  await cross(6);
  await ff(2.5);
  await page.waitForTimeout(400);
  {
    const s = await st();
    expect(
      s.stage === 7 && s.overlay === 'quiz' && s.o.id === 'baskets',
      'island H « جزيرة السلال »: the stone asks its baskets first',
    );
    const opts = await page
      .locator('[data-di-option]')
      .evaluateAll((els) => els.map((e) => Number(e.dataset.diOption)));
    const prompt = (await page.textContent('.di-card')) ?? '';
    const [dates, figs] = (prompt.match(/\d+/g) ?? []).map(Number);
    expect(dates === 228 && figs === 276, `the stone's question is about ${dates} dates and ${figs} figs`);
    const right = opts.filter((n) => both(dates, figs, n));
    expect(
      right.length >= 2 && right.length < opts.length,
      `the stone offers ${opts.join(', ')}: ${right.join(', ')} share both, computed here`,
    );
    await shot('stone');
    const odd = opts.find((v) => !right.includes(v));
    await page.click(`[data-di-option="${odd}"]`);
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    expect(
      (await page.textContent('.di-feedback')).includes(String(odd)),
      `${odd} chosen: the stone says what ${odd} baskets leave — never the answer`,
    );
    await shot('stone-wrong');
    await page.click(`[data-di-option="${odd}"]`);
    for (const v of right) await page.click(`[data-di-option="${v}"]`);
    await page.click('[data-di-check]');
    await page.waitForTimeout(500);
  }

  // ══════════════════════════ forge 4 🧩 « قواسم القاسم المشترك الأكبر » — NEST ══════════════════════════
  expect((await st()).overlay === 'forge', 'the stone answered: its mirror opens');
  await opensOnQuestion('qawasim-al-pgcd', 'nest');
  {
    const s0 = await iq();
    const g = gcd(s0.a, s0.b);
    expect(
      s0.a === 228 && s0.b === 276 && s0.g === g,
      `the dates and the figs: 228 and 276, their longest plank GIVEN — ${g} (computed here)`,
    );
    const divs = (await page.getAttribute('[data-iq-divs]', 'data-iq-divs')).split(',').map(Number);
    expect(divs.join() === divisors(g).join(), `the planks of ${g} are drawn as chips (${divs.join(', ')})`);
    await tellsNothing('nest', ['قواسم القاسم المشترك الأكبر', 'بالضبط', 'هي نفسها']);
    await inquiryFits('nest-start');
    let n = 0;
    const probes = [];
    while ((await iq()).stage === 'guess') {
      const p = Number(await page.getAttribute('.iq--nest', 'data-iq-probe'));
      const truth = both(228, 276, p);
      // looking at g alone: p fills both exactly when it fills g — the walk computes both and checks they agree
      expect(truth === (g % p === 0), `probe ${p}: it fills 228 and 276 ⇔ it fills ${g} (computed here)`);
      const say = n === 1 ? !truth : truth;
      await page.click(`[data-iq-say="${say ? 'yes' : 'no'}"]`);
      await iqAt(['guess', 'compare']);
      probes.push(p);
      const f = await fact();
      if ((await iq()).stage === 'guess')
        expect(
          f.includes(String(p)) && f.includes(String(g)),
          `probe ${p}: the fact says what it did on 228, 276 and ${g} (« ${f.trim().slice(0, 70)} »)`,
        );
      if (n === 1) {
        expect(
          f.includes('لم يكن هذا توقّعك'),
          `probe ${p}: he said the opposite of what the gaps did — the fact beside it`,
        );
        await inquiryFits('nest-wrong-pick');
      }
      if (n === 3) await inquiryFits('nest-probe');
      n += 1;
    }
    expect((await iq()).stage === 'compare' && n >= 6, `${n} probes judged; then the two lists stand side by side`);
    const listOf = async (k) =>
      (await page.locator(`[data-iq-list="${k}"] .iq-chip`).allTextContents()).map((x) => Number(x.trim()));
    expect(
      (await listOf('common')).join() === common(228, 276).join() && (await listOf('g')).join() === divisors(g).join(),
      `the planks of both gaps (${common(228, 276).join(', ')}) beside the planks of ${g} (${divisors(g).join(', ')}) — computed here`,
    );
    await inquiryFits('nest-compare');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    await ownRows(probes.length, `his rule is tested on his ${probes.length} probes`);
    // a false rule: « the divisors of the smaller number » — the first probe of HIS where it says otherwise
    const firstBad = probes.find((p) => (228 % p === 0) !== both(228, 276, p));
    await mirror(
      'forge4',
      ['which:div', 'of:min'],
      `228:276:${firstBad}`,
      `${firstBad} divides 228, and 276 = ${firstBad} × ${Math.floor(276 / firstBad)} + ${276 % firstBad}`,
      ['which:div', 'of:g'],
      (c) => both(c.A, c.B, c.d),
      async (u) => {
        const set = divisors(gcd(u.A, u.B));
        const boxes = await page.locator('[data-rf-use]').count();
        expect(
          boxes === set.length,
          `the last step: ${boxes} boxes — the divisors of PGCD(${u.A} ; ${u.B}) = ${gcd(u.A, u.B)} (${set.length})`,
        );
        const twice = Object.fromEntries(set.map((d, i) => [`d${i + 1}`, i === 1 ? set[0] : d]));
        expect((await fillUse(twice)) === 'twice', 'the last step: a common divisor written twice — refused');
        await shot('forge4-use');
        expect(
          (await fillUse(Object.fromEntries(set.map((d, i) => [`d${i + 1}`, d])))) === 'ok',
          `the common divisors of ${u.A} and ${u.B}: ${set.join(', ')} — without their own lists`,
        );
      },
    );
  }
  await shot('tablet-4');
  expect(
    (await page.textContent('.di-card')).includes('قواسم القاسم المشترك الأكبر'),
    'the tablet: « قواسم القاسم المشترك الأكبر »',
  );
  await page.click('[data-di-tablet]');
  await ff(0.5);
  expect((await st()).keys.length === 4, 'four keys earned, all forged');

  // ═══════════════ the last bridge: two stretches, 364 (roses) then 286 (lilies) — planks of 28 or 26 ═══════════════
  // ONE kind of plank must fill EACH stretch, the longest there is: 28 fills the roses' stretch only, 26 fills both. The
  // store still divides the whole walkway (650 = 28 × 23 + 6: the same 6 cells the lilies' stretch leaves).
  const RS = 364;
  const LS = 286;
  const A = RS + LS;
  await toAltar(7);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  expect(
    (await st()).overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes(String(A)),
    `the store opens on the lesson’s problem: ${A} cells, one per flower of the market`,
  );
  const moulds = await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
  const good = moulds.filter((b) => A % b === 0);
  expect(
    moulds.length === 2 && good.length === 1,
    `the store offers ${moulds.join(' and ')}: ONE fills ${A} (${good.join()})`,
  );
  const bad = moulds.find((b) => A % b !== 0);
  {
    const mission = (await page.textContent('[data-di-boss-mission]')) ?? '';
    const ask = (await page.textContent('.di-card h2')) ?? '';
    expect(
      [mission, ask].every((t) => t.includes(String(RS)) && t.includes(String(LS))) && !/بالقسمة|PGCD/.test(ask),
      `the mission and the question name the two stretches ${RS} and ${LS}: the longest plank of BOTH is asked (« ${ask.trim().slice(0, 80)} »)`,
    );
    // the walk's own arithmetic: the wrong kind is the LONGER one, and fills one stretch alone — one division never chooses
    expect(
      good[0] === gcd(RS, LS) && bad > good[0] && RS % bad === 0 && LS % bad !== 0 && A % bad === LS % bad,
      `${bad} fills the roses' stretch alone (${LS} = ${bad} × ${Math.floor(LS / bad)} + ${LS % bad}); ${good[0]} is the longest plank of both`,
    );
  }
  await shot('boss');
  await page.click(`[data-di-mould="${bad}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  expect(
    (await page.textContent('[data-di-boss-a]')).trim() === String(A),
    `the division to write starts with THIS gap: ${A} = ${bad} × ▢ + ▢`,
  );
  const bossErr = async (q, r) => {
    if (q !== '') await page.fill('[data-di-q]', String(q));
    if (r !== '') await page.fill('[data-di-r]', String(r));
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    return (await page.textContent('[data-di-boss-error]')) ?? '';
  };
  expect(
    (await bossErr('', '')).includes('عدد الألواح'),
    'an empty division is refused, in the words of this lesson (planks)',
  );
  {
    const q = Math.floor(A / bad) + 1;
    const e = await bossErr(q, 0);
    expect(
      e.includes(String(q * bad)) && e.includes(`(${A})`),
      `${q} planks of ${bad}: « ${q * bad} cells, longer than the gap (${A}) » (${e.trim().slice(0, 70)})`,
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
  }
  await shot('boss-tried');
  await page.click(`[data-di-mould="${good[0]}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(A / good[0]));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  await ff(12);
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
      'the amount is typed in its own shape: its unit « دج » is printed',
    );
  }
  await shot('boss-cost');
  {
    await page.fill('[data-di-cost]', '4000');
    await page.click('[data-di-check]');
    await page.waitForTimeout(300);
    const e = await page.textContent('[data-di-boss-error]');
    expect(
      e.includes('4000') && e.includes('ثمن اللوح'),
      'a wrong price is refused with a sentence, in the words of this lesson',
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
      o?.type === 'boss' && o.view === 'cost' && o.q === Q,
      `the store opens again on the price of the ${Q} planks`,
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-cost]', String(Q * price));
  await page.click('[data-di-check]');
  await ff(0.5);
  expect(
    (await st()).overlay == null && (await st()).objective.includes('اعبر إلى سوق الزهور'),
    `paid ${Q * price} دج (${Q} × ${price}): the objective says to cross to the flower market`,
  );
  await cross(7);
  await ff(3);
  await page.waitForTimeout(500);
  await shot('finale');
  await ff(6);
  await page.waitForTimeout(600);
  await shot('end');
  expect(
    (await st()).overlay === 'end',
    'the market is reached and the end screen shows: the story is played to its end',
  );
});
