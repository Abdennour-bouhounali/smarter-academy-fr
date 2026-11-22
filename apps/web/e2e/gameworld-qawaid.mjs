// « أرخبيل القواسم: الآلة المعطّلة » — walk of the game world of lesson `qawaid-qabiliyat-qisma` (1AM « قواعد قابلية
// القسمة ») as a STUDENT: its own story in the unit's world, PLAYED through its screens from the title to the end screen.
// Copied from lesson 3's gameworld-khawass.mjs and lesson 2's chart (gameworld-qawasim.mjs, forge 4).
// Its four forges, each key found by an experiment of its OWN nature (GAME_WORLD.md « استكشف »): `raqm-alahad` on the
// `chart` said « يساوي » (planks 5 then 2), `majmu-arqam` on the `chart` said « يقبل القسمة على » (planks 9 then 3),
// `raqmayn-akhirayn` on `join` (plank 4: a gap of whole hundreds GLUED to a short gap — six rounds, his prediction before
// each, the first one missed on purpose), and `baqi-sifr` is the mirror alone (predictions, then tiles). On every chart
// plank: the gaps tested BY HAND (each division written, its cell green exactly when the rest is 0), the chart filled
// (heard), a lens that does not separate (its dark cells outlined, counted HERE), the lens that does, then the next
// hundred — its first three gaps tested by HIM, the rest by the world. Then in every forge: a wrong rule refuted by the
// mirror on a case where the walk's own arithmetic disagrees with it, the right rule, the attacks, the seal, the last step
// (a wrong answer, then the right one), the tablet. Also played: a rule that SURVIVES his evidence and is BROKEN by the
// attack (forge 2, « the sum is 9 » on 99 — after he first says the opposite of what his own rule predicts), the robot's
// HELP opened and used (forge 3: two bridges built in the mirror, kept in his log), and the ✕ CLICKED — in the world
// (after the first key) and inside a forge (the experiment of key 3): he leaves, comes back, « واصل » resumes where he
// was, and the forge left unfinished opens again. On the way: every bridge (a wrong mould crumbles first), the gate
// dash (each gate chosen by the walk's arithmetic on the sentence it reads), the stone's quiz (which of 2, 3, 4, 5, 9 fill
// 1575 — a wrong pick shows each plank's division, then the right set), the store of the last bridge (a wrong plank, the
// wrong divisions, the price, its way out) and the lighthouse.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas left to
// right on one line, nothing of lessons 1–3 nor of the other two new lessons (lib/qawaid.mjs), a way out reachable, no
// text under 12 px (fontFloor). Every investigation screen also: nothing leaves its frame, no button is covered.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-qawaid.mjs [outDir]
import { createWalk, FLOOR_PX } from './lib/walk.mjs';
import { GRADE, pageOf, QAWAID_FOREIGN, QAWAID_FOREIGN_NUMBERS, digitSum } from './lib/qawaid.mjs';

const ID = 'qawaid-qabiliyat-qisma';
const LESSON_URL = pageOf(ID);
const w = createWalk('gameworld-qawaid', { foreign: QAWAID_FOREIGN, foreignNumbers: QAWAID_FOREIGN_NUMBERS });
const { expect, check } = w;
/** The way out of any screen of the world: the top bar's ✕, the forge's own ✕, the ✕ drawn over a dialog. */
const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };

/** What a chart lens reads in a gap n (computed here). */
const LENS_OF = {
  units: (n) => n % 10,
  tens: (n) => Math.floor(n / 10) % 10,
  sum: (n) => digitSum(n),
};
/** How the chart counts cells in its sentence: in words for one and two, the number after that (computed here). */
const countSaid = (n) => (n === 1 ? 'خانة واحدة' : n === 2 ? 'خانتان' : `${n} ${n <= 10 ? 'خانات' : 'خانة'}`);
/** How many gaps of the next hundred he tests himself before the world finishes it (the chart's default). */
const NEXT_BY_HAND = 3;
/** The gaps 1 … 99 a claim takes in that the plank b does NOT fill — what the chart must outline (computed here). */
const intrudersOf = (b, lens, link, picked) =>
  Array.from({ length: 99 }, (_, i) => i + 1).filter((n) => {
    const v = LENS_OF[lens](n);
    const taken = link === 'divides' ? picked.some((k) => v % k === 0) : picked.includes(v);
    return taken && n % b !== 0;
  });
/** A sentence of the last mirror is true when the bridge it means holds: « x يقسم y » means y ÷ x, the two others x ÷ y. */
const sentenceTrue = (c) => (c.form === 'yaqsim' ? c.y % c.x === 0 : c.x % c.y === 0);

await w.run(async () => {
  const { page } = await w.student({ uid: 9851, lessonId: ID, url: LESSON_URL, grade: GRADE });
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
  /** The planks each gap was filled with in this walk: the chart starts from them (its lead names the gap). */
  const filled = {};
  /**
   * Plays the world on until the forge is over. A long bridge lays ~50 planks (912 / 17, 95 / 2): with the fall of a wrong
   * one its forge lasts ~10 s of game time, longer than a fixed ff(8) — and an « E » pressed while the phase is still
   * `forge` is dropped by the runtime (kit/WorldRuntime.js › step: `if (ph !== 'play') this.input.take('act')`).
   */
  const settle = async (max = 30) => {
    for (let t = 0; t < max && (await st()).phase === 'forge'; t += 0.5) await ff(0.5);
  };
  /** A bridge built from its altar: `wrong` first (it must crumble), then `right` (it must hold). */
  const bridge = async (i, a, wrong, right) => {
    const id = `g${a}`;
    if (wrong != null) {
      await take(wrong);
      await forge(i);
      await ff(8);
      await settle();
      await page.waitForTimeout(300);
      expect(
        !(await st()).stars[id],
        `planks of ${wrong} leave cells over ${a} (${a} = ${wrong} × ${Math.floor(a / wrong)} + ${a % wrong}): the bridge crumbles`,
      );
    }
    await take(right);
    await forge(i);
    await ff(8);
    await settle();
    expect(
      a % right === 0 && (await st()).stars[id] >= 1,
      `bridge ${a} holds with planks of ${right} (${a} = ${right} × ${a / right})`,
    );
    filled[right] ??= a;
  };

  // ── the forges: what all four share ──
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
  /** The last step: writes the answer in its boxes (and the verdict, when the forge asks one), then « تحقّق ». */
  const fillUse = async (vals, verdict = null) => {
    for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
    if (verdict !== null) await page.click(`[data-rf-use-verdict="${verdict ? 'yes' : 'no'}"]`);
    await page.click('[data-rf-use-check]');
    await page.waitForSelector('[data-rf-use-fb]');
    return page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb');
  };
  /**
   * From the mirror's attacks: each answered with what the RIGHT rule says — computed here by `truth` — then the seal and
   * the last step, up to the tablet.
   */
  const attackToTablet = async (name, truth, last) => {
    await page.waitForSelector('[data-rf="attack"]');
    await shot(`${name}-attack`);
    for (let i = 0; i < 6; i += 1) {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      await page.click(`[data-rf-say="${truth(c) ? 'yes' : 'no'}"]`);
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
  /** Builds a rule with its tiles and lets the mirror test it. */
  const tiles = async (list) => {
    for (const t of list) await page.click(`[data-rf-tile="${t}"]`);
    await page.click('[data-rf-test]');
  };
  /**
   * A wrong rule: the mirror must refute it on a case where the walk's own arithmetic says the rule is wrong
   * (`wrongSays(case)` ≠ `truth(case)`); then « أصلح ».
   */
  const refuted = async (name, list, parse, wrongSays, truth, why, reads = null) => {
    await tiles(list);
    await page.waitForSelector('[data-rf-refuted]');
    const id = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
    const c = parse(id);
    expect(
      wrongSays(c) !== truth(c),
      `${name}: the rule « ${why} » is refuted by a case of HIS evidence where it says the wrong thing (${id})`,
    );
    // his rule applied to that case, in words: what it read, and a clause that is said OF that number
    if (reads) {
      const panel = (await page.textContent('.rf-panel')).replace(/\s+/g, ' ');
      check(
        panel.includes(reads(c)) && !/و \d+ عدد[ًا]/.test(panel),
        `${name}: the mirror says what his rule read in that case — « ${reads(c)} » (« ${panel.trim().slice(0, 110)} »)`,
      );
    }
    await shot(`${name}-refuted`);
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
  };
  /**
   * A wrong rule that SURVIVES his evidence: the mirror agrees, then attacks it with a new case chosen to break it. He
   * first says the OPPOSITE of what his own rule predicts (the mirror reads his rule back to him), then the bridge is
   * built and the rule is broken in front of him; then « أصلح ».
   */
  const brokenByAttack = async (name, list, ruleSays, truth, why) => {
    const seen = (await fg()).rows.map((r) => `${r.a}:${r.b}`);
    await tiles(list);
    await page.waitForSelector('[data-rf-agreed]');
    await page.click('[data-rf-dare]');
    await page.waitForSelector('[data-rf="attack"]');
    const a = (await fg()).atk;
    const c = a.list[a.i];
    const says = ruleSays(c);
    expect(
      says !== truth(c) && !seen.includes(`${c.a}:${c.b}`),
      `${name}: « ${why} » agrees with every gap of his chart — the mirror attacks it with a NEW bridge (${c.a} with ${c.b}) where the rule says « ${says ? 'holds' : 'crumbles'} » and the arithmetic says the opposite`,
    );
    await page.click(`[data-rf-say="${says ? 'no' : 'yes'}"]`);
    await page.waitForSelector('[data-rf-rule-says]');
    const note = await page.textContent('[data-rf-rule-says]');
    expect(
      (await page.getAttribute('[data-rf-rule-says]', 'data-rf-rule-says')) === (says ? 'yes' : 'no') &&
        note.includes('قاعدتك تقول غير ذلك'),
      `${name}: he answers the attack WRONGLY (not what his rule predicts) — the mirror reads his own rule back to him (« ${note.trim().slice(0, 80)} »)`,
    );
    await shot(`${name}-attack-misread`);
    await page.click('[data-rf-fire]');
    await page.waitForSelector('[data-rf-broken]');
    expect(
      (await page.getAttribute('[data-rf-broken]', 'data-rf-broken')) === `${c.a}:${c.b}` &&
        (await page.getAttribute('[data-rf-bridge]', 'data-rf-stage')) === 'done',
      `${name}: the bridge ${c.a} with ${c.b} is built and his rule is BROKEN by it (${c.a} = ${c.b} × ${Math.floor(c.a / c.b)} + ${c.a % c.b})`,
    );
    check(
      !(await page.textContent('.rf-panel')).includes('خطأ'),
      `${name}: the rule is broken by what the bridge did — nobody says « wrong »`,
    );
    await shot(`${name}-broken`);
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
  };
  /**
   * The ✕ CLICKED: he leaves the game for the catalogue, comes back to the lesson, and « واصل المغامرة » takes him where
   * he was. `sel` = the ✕ of the screen he is on.
   */
  const leaveAndComeBack = async (sel, where) => {
    expect((await w.reachable(page, [sel])) !== null, `${where}: its ✕ is on screen and a click reaches it`);
    await page.click(sel);
    await page.waitForURL((u) => !u.pathname.includes(ID), { timeout: 15000 });
    // the address changes first; the game is unmounted once the catalogue (a lazy page) has arrived
    await page.waitForSelector('.rf-root, .di-root canvas', { state: 'detached', timeout: 10000 }).catch(() => {});
    expect(
      (await page.locator('.rf-root, .di-root canvas').count()) === 0,
      `${where}: the ✕ LEAVES the game — the page is the catalogue (${new URL(page.url()).pathname})`,
    );
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    expect(
      (await page.textContent('[data-di-start]')).includes('واصل'),
      `${where}: back on the lesson, the title offers « واصل المغامرة » — nothing was lost`,
    );
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
  };
  /** The right rule: the mirror agrees, then attacks it. */
  const agreed = async (name, list) => {
    await tiles(list);
    await page.waitForSelector('[data-rf-agreed]');
    await shot(`${name}-agreed`);
    await page.click('[data-rf-dare]');
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
      const kids = head ? [...head.children].map((k) => k.getBoundingClientRect()) : [];
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
  /**
   * An investigation screen: nothing leaves its frame, no button is covered, no text under 12 px — the words DRAWN in a
   * scene too (SVG text: the chart has none, the gluing of key 3 writes a line under each strip) — then the screenshot.
   */
  const inquiryFits = async (name) => {
    await page.waitForTimeout(250);
    const bad = await page.evaluate((FLOOR) => {
      const out = [];
      const frame = document.querySelector('.iq');
      if (!frame) return ['no investigation on screen'];
      const box = frame.getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit')?.style.zoom) || 1;
      for (const el of frame.querySelectorAll(
        'button, .iq-lead p, .iq-goal, .iq-how, .iq-div, .iq-equals, .iq-fact, .iq-chart, .iq-board__title, .iq-found li, .iq-calc, .iq-scene',
      )) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)
          out.push(String(el.className?.baseVal ?? el.className).split(' ')[0] + ' leaves the frame');
        if (el.tagName === 'BUTTON') {
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (top && !el.contains(top) && !top.contains(el))
            out.push('covered: « ' + el.textContent.trim().slice(0, 18) + ' »');
        }
        if (
          el.textContent.trim() &&
          !el.querySelector('*:not(.katex):not(.katex *)') &&
          parseFloat(getComputedStyle(el).fontSize) * zoom < FLOOR
        )
          out.push('text under 12 px: ' + String(el.className).split(' ')[0]);
      }
      // the words drawn in a scene (SVG text) are read too: their height on screen, and they stay inside the frame
      for (const el of frame.querySelectorAll('svg text')) {
        const r = el.getBoundingClientRect();
        if (!r.width || !el.textContent.trim()) continue;
        const said = el.textContent.trim().slice(0, 20);
        if (r.height < FLOOR * 0.9) out.push(`scene text under 12 px: « ${said} » (${r.height.toFixed(1)} px)`);
        if (r.left < box.left - 1 || r.right > box.right + 1) out.push(`scene text leaves the frame: « ${said} »`);
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
      `${name}: the investigation fits its frame — nothing cut, covered, scrolled or too small${bad.length ? ' — ' + bad.slice(0, 8).join(' | ') : ''}`,
    );
    await shot(name);
  };
  /** The forge opens on its chart: its question and its goal, no tile and no prediction before he acts. */
  const opensOnChart = async (key, b0) => {
    const f = await fg();
    expect(
      f.key === key && f.phase === 'inquiry' && (await iq()).kind === 'chart' && (await iq()).b === b0,
      `the forge of « ${key} » opens on the CHART investigation, plank ${b0} first`,
    );
    expect(
      (await page.locator('[data-rf-tile]').count()) === 0 && (await page.locator('[data-rf-guess]').count()) === 0,
      `${key}: no tile, no prediction before he acts`,
    );
  };
  /**
   * ONE plank of a chart: its question (from the gap it filled in the story) and its goal; the gaps tested by hand until
   * the world may fill the chart; the chart filled (heard); a lens that does not separate, then the right one; the next
   * hundred. `wrong` = [lens, value]; `right` = [lens, values]; `link` = how the claim is said.
   */
  const chartPlank = async (name, b, link, wrong, right, { fits = false } = {}) => {
    const lead = await page.textContent('.iq-lead');
    const goal = await page.textContent('[data-iq-goal]');
    expect(
      lead.includes(`لوح طوله ${b}`) &&
        (filled[b] == null || lead.includes(`ملأ الهوّة ${filled[b]}`)) &&
        goal.includes('الهدف') &&
        goal.includes(`العدد ${b}`) &&
        (await page.textContent('[data-iq-how]')).includes('الباقي 0'),
      `plank ${b}: the chart opens on its QUESTION${filled[b] ? ` (from the gap ${filled[b]} it filled)` : ''} and its GOAL (to know the gaps without dividing by ${b})`,
    );
    let taps = 0;
    while ((await page.locator('[data-iq-fill]').count()) === 0) {
      const n = Number(await page.getAttribute('[data-iq-test]', 'data-iq-test'));
      await page.click('[data-iq-test]');
      taps += 1;
      const d = await page.evaluate((k) => {
        const li = document.querySelector(`[data-iq-div="${k}"]`);
        const cell = document.querySelector(`[data-iq-cell="${k}"]`);
        return {
          rest: li ? Number(li.dataset.iqRest) : null,
          tex: li?.querySelector('annotation')?.textContent ?? '',
          lit: cell?.dataset.iqLit ?? null,
        };
      }, n);
      if (
        !(
          d.rest === n % b &&
          d.tex.includes(`${n} = ${Math.floor(n / b)} \\times ${b} + `) &&
          d.lit === (n % b === 0 ? '1' : '0')
        )
      )
        expect(
          false,
          `plank ${b}, gap ${n}: its division is written (${d.tex}), rest ${d.rest}, cell lit « ${d.lit} »`,
        );
      if (taps > 15)
        expect(false, `plank ${b}: after ${taps} gaps tested, the world still does not offer to fill the chart`);
    }
    const litByHand = await page.locator('.iq-cell.is-lit').count();
    expect(
      taps >= 6 && litByHand >= 2,
      `plank ${b}: ${taps} gaps tested by hand, each with its division « n = q × ${b} + r », its cell green exactly when the rest is 0 (${litByHand} lit) — only then may the world fill the chart`,
    );
    if (fits) await inquiryFits(`${name}-test`);
    const heard = await hear(async () => {
      await page.click('[data-iq-fill]');
      await page.waitForSelector('[data-iq-look]');
    });
    check(
      heard.includes('sweep') && heard.includes('spark') && heard.at(-1) === 'gate',
      `plank ${b}: the chart that fills is heard — a count, the cells that light, a chime when it is full (${[...new Set(heard)].join(', ')})`,
    );
    await page.click('[data-iq-look]');
    // a lens that does not separate: the cells it takes in that the plank does not fill are outlined — counted HERE
    await page.click(`[data-iq-lens="${wrong[0]}"]`);
    await page.click(`[data-iq-value="${wrong[1]}"]`);
    {
      const mine = intrudersOf(b, wrong[0], link, [wrong[1]]);
      const shown = await page.locator('.iq-cell.is-intruder').count();
      expect(
        (await page.getAttribute('[data-iq-fact]', 'data-iq-ok')) === '0' &&
          shown === mine.length &&
          mine.length > 0 &&
          (await page.locator('[data-iq-seal]').count()) === 0,
        `plank ${b}: « ${wrong[0]} ${link === 'divides' ? 'يقبل القسمة على' : '='} ${wrong[1]} » takes in ${mine.length} gaps the plank does not fill (${mine.slice(0, 4).join(', ')}…) — the chart outlines them (${shown}), no seal, nobody says « wrong »`,
      );
      check(
        (await fact()).includes(`${countSaid(mine.length)} غير خضرا`),
        `plank ${b}: the chart says how many dark cells entered his choice — « ${countSaid(mine.length)} » (« ${(await fact()).trim().slice(0, 60)} »)`,
      );
    }
    if (fits) await inquiryFits(`${name}-wrong-lens`);
    await page.click(`[data-iq-lens="${right[0]}"]`);
    for (const v of right[1]) await page.click(`[data-iq-value="${v}"]`);
    expect(
      intrudersOf(b, right[0], link, right[1]).length === 0 &&
        (await page.getAttribute('[data-iq-fact]', 'data-iq-ok')) === '1' &&
        (await page.locator('.iq-cell.is-intruder').count()) === 0 &&
        (await page.locator('.iq-cell.is-lit:not(.is-claimed)').count()) === 0 &&
        (await page.locator('[data-iq-seal]').count()) === 1,
      `plank ${b}: « ${right[0]} ${link === 'divides' ? 'يقبل القسمة على' : '='} ${right[1].join(' أو ')} » holds every lit cell and no dark one — he may seal it`,
    );
    if (fits) {
      const lay = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const L = [...document.querySelectorAll('[data-iq-lens]')].map((e) => e.getBoundingClientRect());
        return {
          stacked: L.every((x, i) => i === 0 || (x.top >= L[i - 1].bottom - 1 && Math.abs(x.left - L[0].left) < 2)),
          order:
            r('[data-iq-values]').right <= r('[data-iq-equals]').left + 1 &&
            r('[data-iq-equals]').right <= r('[data-iq-lenses]').left + 1,
          word: document.querySelector('[data-iq-equals]').textContent.trim(),
        };
      });
      check(
        lay.stacked && lay.order && lay.word === (link === 'divides' ? 'يقبل القسمة على' : 'يساوي'),
        `plank ${b}: his claim is laid right to left — the lenses in a column, « ${link === 'divides' ? 'يقبل القسمة على' : 'يساوي'} », then the ${link === 'divides' ? 'numbers' : 'values'} (${JSON.stringify(lay)})`,
      );
      await inquiryFits(`${name}-claim`);
    }
    // the next hundred: he tests its first gaps HIMSELF (their divisions written, his claim outlined on each), and only
    // then the world finishes it
    await page.click('[data-iq-seal]');
    await page.waitForSelector('[data-iq-test]');
    expect(
      (await iq()).stage === 'confirm' &&
        (await iq()).from === 100 &&
        (await page.locator('[data-iq-next]').count()) === 0 &&
        (await page.locator('.iq-cell.is-lit, .iq-cell.is-dark').count()) === 0,
      `plank ${b}: the next hundred opens EMPTY — nothing is filled before he tests a gap himself`,
    );
    {
      const lead = await page.textContent('.iq-lead');
      check(
        lead.includes('بنفسك') && lead.includes('100') && lead.includes('199'),
        `plank ${b}: the next hundred says he tests its first gaps himself, from 100, and the world goes on to 199 (« ${lead.trim().slice(0, 70)} »)`,
      );
    }
    let heard2 = [];
    for (let k = 0; k < NEXT_BY_HAND; k += 1) {
      const n = Number(await page.getAttribute('[data-iq-test]', 'data-iq-test'));
      expect(n === 100 + k, `plank ${b}: the next hundred is tested in order — gap ${100 + k} (the button says ${n})`);
      // the last of his gaps hands over to the world: what it does alone is heard
      const tap = async () => {
        await page.click('[data-iq-test]');
        if (k === NEXT_BY_HAND - 1) await page.waitForSelector('[data-iq-next]');
      };
      if (k === NEXT_BY_HAND - 1) heard2 = await hear(tap);
      else await tap();
      if (k < NEXT_BY_HAND - 1) {
        const d = await page.evaluate((g) => {
          const li = document.querySelector(`[data-iq-div="${g}"]`);
          const cell = document.querySelector(`[data-iq-cell="${g}"]`);
          return {
            rest: li ? Number(li.dataset.iqRest) : null,
            tex: li?.querySelector('annotation')?.textContent ?? '',
            lit: cell?.dataset.iqLit ?? null,
            claimed: cell?.classList.contains('is-claimed') ?? null,
          };
        }, n);
        const taken =
          link === 'divides'
            ? right[1].some((x) => LENS_OF[right[0]](n) % x === 0)
            : right[1].includes(LENS_OF[right[0]](n));
        expect(
          d.rest === n % b &&
            d.tex.includes(`${n} = ${Math.floor(n / b)} \\times ${b} + `) &&
            d.lit === (n % b === 0 ? '1' : '0') &&
            d.claimed === taken &&
            taken === (n % b === 0),
          `plank ${b}, gap ${n} tested by HIM: ${n} = ${Math.floor(n / b)} × ${b} + ${n % b} written, its cell ${n % b === 0 ? 'green' : 'dark'}, ${taken ? 'inside' : 'outside'} his reading (${JSON.stringify(d)})`,
        );
        if (fits && k === 0) await inquiryFits(`${name}-next-hundred`);
      }
    }
    check(
      heard2.includes('sweep') && heard2.at(-1) === 'gate',
      `plank ${b}: after his ${NEXT_BY_HAND} gaps the world finishes the next hundred, and it is heard (${[...new Set(heard2)].join(', ')})`,
    );
    expect(
      (await iq()).from === 100 &&
        (await page.textContent('.iq-lead')).includes('صمدت') &&
        (await page.locator('.iq-cell.is-lit:not(.is-claimed)').count()) === 0 &&
        (await page.locator('.iq-cell.is-claimed.is-dark').count()) === 0,
      `plank ${b}: his reading is tried on the next hundred (100–199) and holds`,
    );
    if (fits) await inquiryFits(`${name}-confirmed`);
    await page.click('[data-iq-next]');
  };
  /** After the last plank: his readings on screen, then « أكتب قاعدتي » — the tiles, and the mirror on his chart's gaps. */
  const chartDone = async (name, lines, own) => {
    expect(
      (await iq()).stage === 'sealed' && (await page.locator('[data-iq-found] li').count()) === lines.length,
      `${name}: ${lines.length} plank(s), ${lines.length} reading(s) — all found by him, all on screen`,
    );
    const found = await page.textContent('[data-iq-found]');
    expect(
      lines.every((l) => found.includes(l)),
      `${name}: his readings are kept in the chart's words (${lines.map((l) => `« ${l} »`).join(' ')})`,
    );
    await inquiryFits(`${name}-sealed`);
    await page.click('[data-iq-done]');
    await page.waitForSelector('[data-rf="build"]');
    check(
      (await page.locator('[data-rf-row][data-rf-own="1"]').count()) === own,
      `${name}: only now he WRITES his rule — the mirror will test it on ${own} gaps of his chart`,
    );
  };
  const parseBridge = (id) => {
    const [a, b] = id.split(':').map(Number);
    return { a, b };
  };
  const fills = (c) => c.a % c.b === 0;

  // ══════════════════════════ the title ══════════════════════════
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(1200);
  expect(
    (await page.textContent('.di-title h1')).includes('الآلة المعطّلة') &&
      (await page.textContent('.di-title__eyebrow')).includes('قواعد قابلية القسمة'),
    'the title screen is this lesson’s own story (« الآلة المعطّلة », « قواعد قابلية القسمة »)',
  );
  await shot('title');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  await shot('start');

  // ── island A → B: one plank of 5 on 35 (no prediction on the first bridge) ──
  await bridge(0, 35, null, 5);
  await shot('g35');
  await cross(0);
  await page.waitForTimeout(400);
  expect((await st()).stage === 1, 'island B « جزيرة النخيل »');
  // 46 with the moulds 5, 3, 2: the world asks a prediction; 5 crumbles, 2 holds
  await take(5);
  await toAltar(1);
  await act();
  expect((await st()).overlay === 'predict', 'bridge 46: the world asks his prediction before it builds');
  await shot('predict');
  {
    const o = (await st()).o;
    await page.click(`[data-di-predict="${o.a % o.b}"]`);
    await ff(9);
  }
  expect(!(await st()).stars.g46, `planks of 5 leave ${46 % 5} cell over 46: the bridge crumbles`);
  await bridge(1, 46, null, 2);
  await cross(1);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 1 1️⃣ « رقم الآحاد » — the chart of planks 5 then 2 ══════════════════════════
  expect(
    (await st()).stage === 2 && (await st()).overlay === 'forge',
    'island C « جزيرة اللوحة الخضراء » opens the first forge',
  );
  await opensOnChart('raqm-alahad', 5);
  await forgeTools('forge 1, the chart');
  await chartPlank('chart5', 5, 'equals', ['tens', 1], ['units', [0, 5]], { fits: true });
  await chartPlank('chart2', 2, 'equals', ['sum', 4], ['units', [0, 2, 4, 6, 8]]);
  await chartDone('chart-units', ['اللوح 5: رقم الآحاد 0 أو 5', 'اللوح 2: رقم الآحاد 0 أو 2 أو 4 أو 6 أو 8'], 8);
  await shot('forge1-build');
  // « plank 5 fills when the units digit is 5 only; plank 2 when it is even »: a gap ending in 0 breaks it
  await refuted(
    'forge1',
    ['b5:five', 'b2:even'],
    parseBridge,
    (c) => (c.b === 5 ? c.a % 10 === 5 : (c.a % 10) % 2 === 0),
    fills,
    '5 فقط · 0 أو 2 أو 4 أو 6 أو 8',
  );
  await agreed('forge1', ['b5:zeroFive', 'b2:even']);
  await attackToTablet('forge1', fills, async (u) => {
    const unit = u.a % 10;
    // EACH plank is answered — which one fills the gap, which one does not (a count of planks would not say which)
    const yes = [2, 5].filter((b) => u.a % b === 0);
    const no = [2, 5].filter((b) => u.a % b !== 0);
    expect(
      yes.length === 1 && no.length === 1 && (await page.locator('[data-rf-use]').count()) === 3,
      `the last step: ${u.a} — one of the planks 2 and 5 fills it and the other does not; three boxes (the units digit, the plank that fills, the plank that does not)`,
    );
    expect(
      (await fillUse({ u: unit, yes: no[0], no: yes[0] })) === 'which',
      `the last step: the units digit of ${u.a} is ${unit}; the two planks written the wrong way round (${no[0]} fills, ${yes[0]} does not) are refused`,
    );
    await shot('forge1-use');
    expect(
      (await fillUse({ u: unit, yes: yes[0], no: yes[0] })) === 'planks',
      `the last step: the same plank written twice is refused — each box takes one of the two planks`,
    );
    expect(
      (await fillUse({ u: unit, yes: yes[0], no: no[0] })) === 'ok',
      `${u.a}: units digit ${unit} — the plank ${yes[0]} fills it, the plank ${no[0]} does not, without dividing`,
    );
  });
  await shot('tablet-1');
  expect(
    (await page.textContent('.di-card')).includes('رقم الآحاد'),
    'the tablet names the rule after HIS: « رقم الآحاد »',
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 1, 'one key earned');

  // ── the ✕ of the world, CLICKED: he leaves on island C with his first key, and comes back to it ──
  await ff(1);
  await leaveAndComeBack('.di-top a.di-icon', 'the world, island C');
  {
    const s = await st();
    expect(
      s.phase === 'play' && s.stage === 2 && s.keys.length === 1 && s.overlay == null,
      `« واصل »: he is back in the world on island C (stage ${s.stage}) with his key (${s.keys.join()}) — the forge he sealed does not open again`,
    );
  }
  await shot('back-in-world');

  // ── 95 with the moulds 2, 3, 5 (his key answers first), then 81 with 2, 5, 9 ──
  await bridge(2, 95, 2, 5);
  await cross(2);
  await page.waitForTimeout(500);
  expect((await st()).stage === 3, 'island D « جزيرة الرمال »');
  await bridge(3, 81, 5, 9);
  await cross(3);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 2 ➕ « مجموع الأرقام » — the chart of planks 9 then 3 ══════════════════════════
  expect(
    (await st()).stage === 4 && (await st()).overlay === 'forge',
    'island E « جزيرة الزيتون » opens the second forge',
  );
  await opensOnChart('majmu-arqam', 9);
  await chartPlank('chart9', 9, 'divides', ['units', 9], ['sum', [9]], { fits: true });
  await chartPlank('chart3', 3, 'divides', ['units', 3], ['sum', [3]]);
  await chartDone(
    'chart-sum',
    ['اللوح 9: مجموع الأرقام يقبل القسمة على 9', 'اللوح 3: مجموع الأرقام يقبل القسمة على 3'],
    8,
  );
  // « plank 9 when the units digit is 9 »: a gap of his chart (18) breaks it
  await refuted(
    'forge2',
    ['b9:unit9', 'b3:sumBy3'],
    parseBridge,
    (c) => (c.b === 9 ? c.a % 10 === 9 : digitSum(c.a) % 3 === 0),
    fills,
    'رقم آحادها 9 · مجموع أرقامها يقبل القسمة على 3',
  );
  await forgeTools('forge 2, the mirror');
  // « plank 9 when the sum of the digits IS 9 »: true of every gap of his chart — the mirror must go and find 99
  await brokenByAttack(
    'forge2',
    ['b9:sumIs9', 'b3:sumBy3'],
    (c) => (c.b === 9 ? digitSum(c.a) === 9 : digitSum(c.a) % 3 === 0),
    fills,
    'مجموع أرقامها 9 · مجموع أرقامها يقبل القسمة على 3',
  );
  await agreed('forge2', ['b9:sumBy9', 'b3:sumBy3']);
  await attackToTablet('forge2', fills, async (u) => {
    const s = digitSum(u.a);
    const count = [3, 9].filter((b) => u.a % b === 0).length;
    expect(
      (await fillUse({ s, n: count === 2 ? 1 : count + 1 })) === 'count',
      `the last step: the sum of the digits of ${u.a} is ${s}, a wrong count of planks is refused`,
    );
    await shot('forge2-use');
    expect(
      (await fillUse({ s, n: count })) === 'ok',
      `${u.a}: digits sum to ${s} — ${count} of the planks 3 and 9 fill it`,
    );
  });
  await shot('tablet-2');
  expect((await page.textContent('.di-card')).includes('مجموع الأرقام'), 'the tablet: « مجموع الأرقام »');
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 2, 'two keys earned');

  // ── 111 with 2, 9, 3: 9 crumbles (its digits sum to 3), 3 holds; then the dash of island F ──
  await bridge(4, 111, 9, 3);
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
    /** The gate the walk chooses for a sentence of the dash: its own arithmetic on the sentence it reads. */
    const testOf = (s) => {
      let m = s.match(/4 \\times \\square = (\d+)/);
      if (m) return (n) => 4 * n === Number(m[1]);
      m = s.match(/يقبل القسمة على (\d+) ولا يقبل القسمة على (\d+)/);
      if (m) return (n) => n % Number(m[1]) === 0 && n % Number(m[2]) !== 0;
      m = s.match(/يقبل القسمة على (\d+) وعلى (\d+)/);
      if (m) return (n) => n % Number(m[1]) === 0 && n % Number(m[2]) === 0;
      m = s.match(/يقبل القسمة على (\d+)/);
      if (m) return (n) => n % Number(m[1]) === 0;
      return null;
    };
    const seen = new Set();
    let mathShot = false;
    for (let k = 0; k < 400 && (await page.evaluate(() => Boolean(window.__world.getState().dash))); k += 1) {
      const x = await page.evaluate(() => {
        const d = window.__world.dash;
        const v = d?.waves[d.wave];
        return v ? { i: d.wave, say: v.say, gates: v.gates, good: v.good } : null;
      });
      if (x && !seen.has(x.i)) {
        seen.add(x.i);
        const test = testOf(x.say);
        const ok = test ? x.gates.map((g, i) => (test(g) ? i : -1)).filter((i) => i >= 0) : [];
        expect(
          ok.length === 1,
          `dash wave ${x.i + 1} « ${x.say} »: exactly one of ${x.gates.join(', ')} fits (by the walk’s arithmetic)`,
        );
        check(
          ok[0] === x.good,
          `dash wave ${x.i + 1}: the gate the walk computed (${x.gates[ok[0]]}) is the world’s right gate`,
        );
        // not a gap a plank filled: the GATE of the last sentence — the number divisible by 4 key 3 starts from
        if (/القسمة على 4$/.test(x.say)) filled[4] ??= x.gates[ok[0]];
        await page.evaluate((lane) => {
          window.__world.dash.lane = lane;
        }, ok[0]);
        if (!mathShot && x.say.includes('\\square')) {
          mathShot = true;
          await ff(0.6);
          await shot('dash-formula');
        }
      }
      await ff(0.25);
    }
    expect(seen.size === 8, `the dash played its eight sentences (${seen.size})`);
  }
  await ff(6);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 3 🔢 « الرقمان الأخيران » — hundreds and a short gap, GLUED ══════════════════════════
  expect(
    (await st()).stage === 6 && (await st()).overlay === 'forge',
    'island G « جزيرة المئات » opens the third forge',
  );
  /** The forge opens on the gluing: its question (from the dash) and its goal, no tile and no prediction of the mirror. */
  const opensOnGlue = async (when) => {
    const f = await fg();
    const x = await iq();
    expect(
      f.key === 'raqmayn-akhirayn' && f.phase === 'inquiry' && x.kind === 'join' && x.ri === 0 && x.stage === 'guess',
      `${when}: the forge of « raqmayn-akhirayn » opens on the GLUING experiment (join), first round — not on a chart`,
    );
    expect(
      (await page.locator('[data-rf-tile]').count()) === 0 &&
        (await page.locator('[data-rf-guess]').count()) === 0 &&
        (await page.locator('[data-iq-chart]').count()) === 0,
      `${when}: no tile, no prediction of the mirror, no chart before he acts`,
    );
    const lead = await page.textContent('.iq-lead');
    const goal = await page.textContent('[data-iq-goal]');
    expect(
      filled[4] === 28 && lead.includes(`${filled[4]} هو العدد الذي يقبل القسمة على 4`) && !lead.includes('ملأ'),
      `${when}: it starts from what he has just done — the gate ${filled[4]} of the dash, a NUMBER divisible by 4 (no plank ever filled a gap of 28)`,
    );
    expect(goal.includes('الهدف') && goal.includes('اللوح 4'), `${when}: its goal is on screen (« ${goal.trim()} »)`);
  };
  await opensOnGlue('forge 3');
  await forgeTools('forge 3, the experiment');
  // ── the ✕ of the forge, CLICKED in the middle of the experiment: a forge left unfinished opens again ──
  await leaveAndComeBack('.rf-root [data-di-exit]', 'the forge of key 3');
  expect(
    (await st()).stage === 6 && (await st()).overlay === 'forge' && (await st()).keys.length === 2,
    '« واصل »: the forge he left without a key opens again at once — it cannot be skipped',
  );
  await opensOnGlue('forge 3, after he left and came back');

  /** What the walk saw in the six rounds (its own arithmetic): { a, b, v, holds }. */
  const glued = [];
  for (let i = 0; i < 12; i += 1) {
    const x = await iq();
    const total = await page.textContent('.iq-count');
    const rounds = Number(total.replace(/\s/g, '').split('/')[1]);
    expect(
      x.kind === 'join' && x.ri === i && x.stage === 'guess' && x.op === 'sum' && x.d === 4 && rounds >= 6,
      `round ${i + 1} of ${rounds}: two gaps and the plank 4, to be glued (${x.a} then ${x.b})`,
    );
    const v = x.a + x.b;
    const holds = v % 4 === 0;
    expect(
      x.a % 100 === 0 && x.a % 4 === 0 && x.b >= 10 && x.b <= 99 && v !== 136,
      `round ${i + 1}: a gap of whole hundreds (${x.a} = 4 × ${x.a / 4}, always filled) and a gap of two digits (${x.b} = 4 × ${Math.floor(x.b / 4)} + ${x.b % 4}) — never the 136 of the next bridge`,
    );
    // the two facts he predicts from are WRITTEN under the scene and under each strip — and the question does not answer
    {
      const calc = await page.locator('[data-iq-calc] annotation').allTextContents();
      const said = await page.locator('.iq-scene text').allTextContents();
      const ask = await fact();
      expect(
        calc.length === 2 &&
          calc[0].includes(`${x.a} = 4 \\times ${x.a / 4} + `) &&
          calc[1].includes(`${x.b} = 4 \\times ${Math.floor(x.b / 4)} + `) &&
          said.length === 2 &&
          said[0].startsWith(`${x.a}: `) &&
          said[1].startsWith(`${x.b}: `) &&
          said[1].includes('بقيت') === (x.b % 4 !== 0) &&
          !said[0].includes('بقيت'),
        `round ${i + 1}: both divisions are written (« ${calc.join(' » « ')} ») and each strip says what the plank did on it (« ${said.join(' » « ')} »)`,
      );
      expect(
        ask.includes(String(x.a)) && ask.includes(String(x.b)) && !ask.includes(String(v)) && ask.includes('؟'),
        `round ${i + 1}: he is asked BEFORE the gluing, and the question does not say the new gap's length (« ${ask.trim().slice(0, 70)} »)`,
      );
    }
    if (i === 0) await inquiryFits('glue-ask');
    // his prediction: the FIRST one is missed on purpose, the others are what the walk's arithmetic says
    const guess = i === 0 ? !holds : holds;
    const heard = await hear(async () => {
      await page.click(`[data-iq-say="${guess ? 'yes' : 'no'}"]`);
      await page.waitForSelector('[data-iq="join"][data-iq-stage="seen"]');
    });
    {
      const calc = await page.locator('[data-iq-calc] annotation').allTextContents();
      const seen = (await fact()).replace(/\s+/g, ' ');
      const said = await page.locator('.iq-scene text').allTextContents();
      const lines = await page.locator('[data-iq-found] li').allTextContents();
      const world = await iq();
      expect(
        calc.length === 2 &&
          calc[0].includes(`${x.a} + ${x.b} = ${v}`) &&
          calc[1].includes(`${v} = 4 \\times ${Math.floor(v / 4)} + `) &&
          (await page.getAttribute('[data-iq="join"]', 'data-iq-step')) === '2' &&
          said.length === 1 &&
          said[0].startsWith(`${v}: `) &&
          said[0].includes('بقيت') === !holds,
        `round ${i + 1}: the gaps are glued — ${x.a} + ${x.b} = ${v}, and ${v} = 4 × ${Math.floor(v / 4)} + ${v % 4} is written; the strip says « ${said[0]} »`,
      );
      expect(
        world.holds === holds && holds === (x.b % 4 === 0),
        `round ${i + 1}: the plank 4 ${holds ? 'fills' : 'does not fill'} ${v} — exactly as it ${holds ? 'fills' : 'does not fill'} ${x.b} (the hundreds changed nothing)`,
      );
      expect(
        seen.includes(guess === holds ? 'كما توقّعت' : 'لم يكن هذا توقّعك') &&
          seen.includes(holds ? 'ولا خانة باقية' : 'وبقيت') &&
          !seen.includes('خطأ'),
        `round ${i + 1}: his prediction (« ${guess ? 'yes' : 'no'} ») is answered by what the strip did — ${guess === holds ? 'as he said' : 'a missed prediction, never « wrong »'} (« ${seen.trim().slice(0, 80)} »)`,
      );
      expect(
        lines.length === i + 1 &&
          lines[i]
            .replace(/\s+/g, ' ')
            .trim()
            .endsWith(`${holds ? 'يملأ' : 'لا يملأ'} ${v}`),
        `round ${i + 1}: what he found stays on screen — ${lines.length} line(s), the last one about ${v}`,
      );
      check(
        heard.includes('sweep') && heard.includes('plank') && heard.at(-1) === (holds ? 'success' : 'crumble'),
        `round ${i + 1}: the gluing is heard — the strips slide, the planks are laid, ${holds ? 'the bridge holds' : 'a piece is left'} (${[...new Set(heard)].join(', ')})`,
      );
    }
    glued.push({ a: x.a, b: x.b, v, holds });
    // looked at: a missed prediction, a piece left, the longest gap, the last round with its six lines
    if (i <= 2 || i === rounds - 1) await inquiryFits(`glue-${v}`);
    const last = i === rounds - 1;
    expect(
      (await page.textContent('[data-iq-next]')).trim() === (last ? 'أكتب قاعدتي' : 'هوّتان أخريان'),
      `round ${i + 1}: ${last ? 'the last one — « أكتب قاعدتي »' : 'another pair comes'}`,
    );
    await page.click('[data-iq-next]');
    if (last) break;
    await page.waitForSelector('[data-iq="join"][data-iq-stage="guess"]');
  }
  {
    // what the rounds showed him, by the walk's arithmetic
    const hundreds = [...new Set(glued.map((g) => g.a))];
    const sameShort = glued.filter((g) => glued.some((h) => h !== g && h.b === g.b && h.a !== g.a));
    const sameUnits = glued.some((g) => glued.some((h) => h.v % 10 === g.v % 10 && h.holds !== g.holds));
    const tens = (n) => Math.floor(n / 10) % 10;
    const sameTens = glued.some((g) => glued.some((h) => tens(h.v) === tens(g.v) && h.holds !== g.holds));
    expect(
      glued.length === 6 &&
        hundreds.length >= 3 &&
        hundreds.every((h) => new Set(glued.filter((g) => g.a === h).map((g) => g.holds)).size === 2) &&
        sameShort.length >= 4 &&
        sameShort.every((g) => glued.filter((h) => h.b === g.b).every((h) => h.holds === g.holds)) &&
        sameUnits &&
        sameTens &&
        glued.every((g) => g.v % 2 === 0),
      `six rounds (${glued.map((g) => `${g.a}+${g.b}${g.holds ? '✓' : '✗'}`).join(' ')}): each number of hundreds once filled and once not, the same short gap after two different hundreds with the same verdict, two gaps ending with the same digit and two with the same tens digit with opposite verdicts — and every gap even`,
    );
    await page.waitForSelector('[data-rf="build"]');
    const rows = (await fg()).rows;
    const shown = await page
      .locator('[data-rf-row][data-rf-own="1"]')
      .evaluateAll((els) => els.map((e) => e.dataset.rfRow));
    const mine = glued.map((g) => `${g.v}:4`);
    expect(
      JSON.stringify(rows.map((r) => `${r.a}:${r.b}`)) === JSON.stringify(mine) &&
        rows.every((r, k) => r.held === glued[k].holds && !r.mirror),
      `only now he WRITES his rule — the mirror will test it on the six gaps HE glued (${mine.join(', ')}), none built by the mirror`,
    );
    check(
      shown.length >= 4 && JSON.stringify(shown) === JSON.stringify(mine.slice(-shown.length)),
      `his log shows the gaps he glued, the newest kept (${shown.join(', ')})`,
    );
    const tilesOn = await page.locator('[data-rf-tile]').evaluateAll((els) => els.map((e) => e.dataset.rfTile));
    expect(
      tilesOn.filter((t) => t.startsWith('read:')).length === 4 &&
        tilesOn.filter((t) => t.startsWith('cond:')).length === 3 &&
        (await page.textContent('[data-rf-tile="read:last2"]')).includes('العدد المشكّل من رقمَي آحادها وعشراتها'),
      `the tiles: four things to read (${tilesOn.filter((t) => t.startsWith('read:')).join(', ')}) × three conditions — and « العدد المشكّل من رقمَي آحادها وعشراتها » among them`,
    );
  }
  await shot('forge3-build');

  // ── the robot's HELP, opened and used: two bridges built in the mirror — never a rule, never a choice of rules ──
  {
    expect(
      (await page.getAttribute('.rf-root', 'data-rf-nudges')) === '0' &&
        (await page.locator('[data-rf-help]:not([disabled])').count()) === 1,
      'while he writes his rule, « ساعدني يا زيرو » is offered — not used yet',
    );
    await page.click('[data-rf-help]');
    await page.waitForSelector('[data-rf-nudge="experiment"]');
    await page.waitForFunction(() => window.__forge?.help && window.__forge.help.running === false, null, {
      timeout: 20000,
    });
    const f = await fg();
    const [c1, c2] = f.help.cases;
    const bubble = (await page.textContent('[data-rf-nudge]')).replace(/\s+/g, ' ');
    expect(
      f.help.kind === 'experiment' &&
        f.help.cases.length === 2 &&
        (await page.getAttribute('.rf-root', 'data-rf-nudges')) === '1' &&
        (await page.locator('[data-rf-choice]').count()) === 0,
      'the help is an EXPERIMENT of two bridges — counted as one nudge, with no choice between written rules',
    );
    expect(
      c1.b === 4 && c2.b === 4 && c2.a - c1.a === 100 && (c1.a % 4 === 0) === (c2.a % 4 === 0),
      `the two bridges: the same short gap without and with a hundred before it (${c1.a} and ${c2.a}) — the plank 4 does the same on both (${c1.a} = 4 × ${Math.floor(c1.a / 4)} + ${c1.a % 4}, ${c2.a} = 4 × ${Math.floor(c2.a / 4)} + ${c2.a % 4})`,
    );
    check(
      !/يقبل القسمة|المشكّل|الآحاد|العشرات|زوجي/.test(bubble) && bubble.includes('؟'),
      `the robot asks what he sees, and says none of the rule's words (« ${bubble.trim().slice(0, 90)} »)`,
    );
    expect(
      (await page.getAttribute('[data-rf-bridge]', 'data-rf-bridge')) === `${c2.a}:4` &&
        (await page.getAttribute('[data-rf-bridge]', 'data-rf-stage')) === 'done',
      `the mirror has built the second bridge in front of him (${c2.a} with the plank 4)`,
    );
    const kept = f.rows.filter((r) => r.mirror).map((r) => `${r.a}:${r.b}`);
    expect(
      JSON.stringify(kept) === JSON.stringify([`${c1.a}:4`, `${c2.a}:4`]) && f.rows.length === 8,
      `USED: the two bridges join his evidence, marked as the mirror's (${kept.join(', ')}) — the rule he writes next is tested on them too`,
    );
    check(
      (await page.locator('[data-rf-row][data-rf-own="0"]').count()) >= 1,
      'his log shows a bridge the mirror built, with its mark',
    );
    await forgeTools('forge 3, the help');
    await shot('forge3-help');
  }
  // « plank 4 when the units digit is even »: a gap he glued (126) breaks it
  await refuted(
    'forge3',
    ['read:units', 'cond:by2'],
    parseBridge,
    (c) => (c.a % 10) % 2 === 0,
    fills,
    'رقم آحادها · عددًا زوجيًّا',
    (c) => `رقم آحادها، أي ${c.a % 10}، وهو عدد زوجي`,
  );
  // « plank 4 when the tens digit is even »: 126 again — the tens digit alone does not decide either
  await refuted(
    'forge3-tens',
    ['read:tens', 'cond:by2'],
    parseBridge,
    (c) => (Math.floor(c.a / 10) % 10) % 2 === 0,
    fills,
    'رقم عشراتها · عددًا زوجيًّا',
    (c) => `رقم عشراتها، أي ${Math.floor(c.a / 10) % 10}، وهو عدد زوجي`,
  );
  await agreed('forge3', ['read:last2', 'cond:by4']);
  await attackToTablet('forge3', fills, async (u) => {
    const l = u.a % 100;
    const held = u.a % 4 === 0;
    expect(
      (await fillUse({ l }, !held)) === 'verdict',
      `the last step: ${u.a} — its units and tens digits write ${l}, the verdict « ${held ? 'ينهار' : 'يثبت'} » is refused`,
    );
    await shot('forge3-use');
    expect(
      (await fillUse({ l }, held)) === 'ok',
      `${u.a}: ${l} = 4 × ${Math.floor(l / 4)} + ${l % 4} — the plank 4 ${held ? 'fills it' : 'does not fill it'}, read on two digits`,
    );
  });
  await shot('tablet-3');
  {
    const card = (await page.textContent('.di-card')).replace(/\s+/g, ' ');
    expect(
      card.includes('الرقمان الأخيران') && card.includes('العدد المشكّل من رقمَي آحاده وعشراته'),
      'the tablet: « الرقمان الأخيران », said in the words of the exercise bank (« العدد المشكّل من رقمَي آحاده وعشراته »)',
    );
  }
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 3, 'three keys earned');

  // ── 136 with 3, 4, 5: 3 crumbles, 4 holds; then the stone of island H ──
  await bridge(6, 136, 3, 4);
  await cross(6);
  await ff(2.5);
  await page.waitForTimeout(400);
  {
    const s = await st();
    expect(
      s.stage === 7 && s.overlay === 'quiz' && s.o.id === 'stone',
      'island H « جزيرة اللوح الحجري »: the stone asks its question first',
    );
    const opts = await page
      .locator('[data-di-option]')
      .evaluateAll((els) => els.map((e) => Number(e.dataset.diOption)));
    const GAP = 1575;
    // the walk's own reading of 1575: units digit 5, digits sum 18, last two digits 75
    const right = opts.filter((b) =>
      b === 2
        ? (GAP % 10) % 2 === 0
        : b === 5
          ? [0, 5].includes(GAP % 10)
          : b === 4
            ? (GAP % 100) % 4 === 0
            : digitSum(GAP) % b === 0,
    );
    expect(
      opts.join() === '2,3,4,5,9' && right.join() === '3,5,9' && right.every((b) => GAP % b === 0),
      `the stone offers ${opts.join(', ')} for ${GAP}: read without dividing, ${right.join(', ')} fill it`,
    );
    expect((await page.textContent('.di-card h2')).includes(String(GAP)), `the stone’s question names the gap ${GAP}`);
    await shot('stone');
    // a wrong set: 3 and 4 — each chosen plank is answered by its division, the missing ones counted
    await page.click('[data-di-option="3"]');
    await page.click('[data-di-option="4"]');
    await page.click('[data-di-check]');
    await page.waitForSelector('[data-di-marks]');
    const marks = await page.textContent('[data-di-marks]');
    expect(
      (await page.locator('[data-di-option="4"].is-leaves').count()) === 1 &&
        (await page.locator('[data-di-option="3"].is-fits').count()) === 1 &&
        marks.includes(String(GAP)) &&
        marks.includes(String(GAP % 4)),
      `3 and 4 chosen: 3 fills ${GAP}, 4 leaves ${GAP % 4} (${GAP} = 4 × ${Math.floor(GAP / 4)} + ${GAP % 4}) — and two planks are still missing, never named`,
    );
    await shot('stone-wrong');
    await page.click('[data-di-option="4"]');
    await page.click('[data-di-option="5"]');
    await page.click('[data-di-option="9"]');
    await page.click('[data-di-check]');
    await page.waitForTimeout(500);
  }

  // ══════════════════════════ forge 4 0️⃣ « الباقي معدوم » — the mirror alone ══════════════════════════
  {
    const s = await st();
    const f = await fg();
    expect(
      s.overlay === 'forge' && f.key === 'baqi-sifr' && f.phase === 'predict',
      'the stone answered: its mirror opens on PREDICTIONS (a sentence, « صحيحة » or « خاطئة »)',
    );
    expect(
      (await page.locator('[data-rf-tile]').count()) === 0 && (await page.locator('[data-rf-guess]').count()) === 2,
      'no tile before he has predicted: two buttons, and the sentence',
    );
  }
  await forgeTools('forge 4, the mirror');
  await shot('forge4-predict');
  {
    let n = 0;
    for (let i = 0; i < 12 && (await fg()).phase === 'predict'; i += 1) {
      const f = await fg();
      if (f.show.stage === 'ask') {
        const c = f.show.c;
        const truth = sentenceTrue(c);
        // the FIRST sentence: he says the opposite of what the bridge will do
        const say = n === 0 ? !truth : truth;
        await page.click(`[data-rf-guess="${say ? 'yes' : 'no'}"]`);
        await page.waitForSelector('[data-rf-predicted]');
        const said = await page.getAttribute('[data-rf-predicted]', 'data-rf-predicted');
        expect(
          said === (n === 0 ? 'miss' : 'right'),
          `sentence ${n + 1} « ${c.text} » is ${truth ? 'true' : 'false'} (${c.form === 'yaqsim' ? `${c.y} ÷ ${c.x}` : `${c.x} ÷ ${c.y}`}): the mirror marks his prediction « ${said} »`,
        );
        if (n === 0) {
          check(
            !(await page.textContent('.rf-panel')).includes('خطأ'),
            'a missed prediction is said without « wrong »: the bridge the sentence means is built',
          );
          await shot('forge4-miss');
        }
        n += 1;
      }
      await page.click('[data-rf-next]');
      await page.waitForTimeout(80);
    }
    expect((await fg()).phase === 'build', `after ${n} sentences (three right in a row) he WRITES his rule`);
  }
  await shot('forge4-build');
  // « in « يقسم » I divide the first number by the second »: one of his « يقسم » sentences breaks it
  await refuted(
    'forge4',
    ['q:r', 'c:zero', 'dir:first'],
    (id) => {
      const [form, x, y] = id.split(':');
      return { form, x: Number(x), y: Number(y) };
    },
    (c) => c.x % c.y === 0,
    sentenceTrue,
    'الباقي يساوي 0 · العدد الأوّل على العدد الثاني',
    (c) => `باقي القسمة الإقليدية ${c.x % c.y}، ${c.x % c.y === 0 ? 'وهو يساوي 0' : 'وهو لا يساوي 0'}`,
  );
  await agreed('forge4', ['q:r', 'c:zero', 'dir:second']);
  await attackToTablet('forge4', sentenceTrue, async (u) => {
    const [q, r] = [Math.floor(u.a / u.b), u.a % u.b];
    expect(
      (await fillUse({ q, r }, r !== 0)) === 'verdict',
      `the last step: ${u.a} = ${u.b} × ${q} + ${r} is right, the verdict « ${r === 0 ? 'خاطئة' : 'صحيحة'} » is refused`,
    );
    await shot('forge4-use');
    expect(
      (await fillUse({ q, r }, r === 0)) === 'ok',
      `${u.a} = ${u.b} × ${q} + ${r}: the remainder ${r} says the sentence is ${r === 0 ? 'true' : 'false'}`,
    );
  });
  await shot('tablet-4');
  expect((await page.textContent('.di-card')).includes('الباقي معدوم'), 'the tablet: « يقبل القسمة ⇔ الباقي معدوم »');
  await page.click('[data-di-tablet]');
  await ff(0.5);
  expect((await st()).keys.length === 4, 'four keys earned, all forged');

  // ══════════════════════════ the last bridge: 1575 cells, planks of 45 or 50 ══════════════════════════
  await toAltar(7);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  expect(
    (await st()).overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes('1575'),
    'the store opens on the lesson’s problem: 1575 cells',
  );
  expect(
    (await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => e.dataset.diMould))).join() === '45,50',
    'the store offers the lesson’s two planks — 45 and 50 — and no other',
  );
  await shot('boss');
  await page.click('[data-di-mould="50"]');
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  expect(
    (await page.textContent('[data-di-boss-a]')).trim() === '1575',
    'the division to write starts with the gap of THIS lesson: 1575 = 50 × ▢ + ▢',
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
    const q = Math.floor(1575 / 50) + 1;
    const e = await bossErr(q, 0);
    expect(
      e.includes(String(50 * q)) && e.includes('(1575)'),
      `${q} planks of 50: « ${50 * q} cells, longer than the gap (1575) » (${e.trim().slice(0, 60)})`,
    );
  }
  {
    const q = Math.floor(1575 / 50) - 1;
    const e = await bossErr(q, 1575 - 50 * q);
    expect(e.includes('أصغر من 50'), `${q} planks and ${1575 - 50 * q} left: « room for another plank »`);
  }
  await shot('boss-divide');
  await page.fill('[data-di-q]', String(Math.floor(1575 / 50)));
  await page.fill('[data-di-r]', String(1575 % 50));
  await page.click('[data-di-check]');
  await ff(15);
  await page.waitForTimeout(400);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'choose' && o.tried[50] === 1575 % 50,
      `planks of 50 leave ${1575 % 50} cells: the store shows it tried and lets him choose again`,
    );
  }
  await shot('boss-tried');
  await page.click('[data-di-mould="45"]');
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(1575 / 45));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  await ff(12);
  await page.waitForTimeout(300);
  const Q = 1575 / 45;
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'cost' && o.q === Q,
      `the bridge of 1575 holds with ${Q} planks of 45 (1575 = 45 × ${Q} + 0): the store asks their price`,
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  let price = 0;
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
    const wrongCost = Q * price + price;
    await page.fill('[data-di-cost]', String(wrongCost));
    await page.click('[data-di-check]');
    await page.waitForTimeout(300);
    const e = await page.textContent('[data-di-boss-error]');
    expect(
      e.includes(String(wrongCost)) && e.includes('ثمن اللوح'),
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
    (await st()).overlay == null && (await st()).objective.includes('اعبر إلى المنارة'),
    `paid ${Q * price} دج (${Q} × ${price}): the objective says to cross to the lighthouse`,
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
    'the lighthouse is lit and the end screen shows: the story is played to its end',
  );
});
