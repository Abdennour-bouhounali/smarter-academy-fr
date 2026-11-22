// « أرخبيل القواسم: مرفأ النخيل » — walk of the game world of lesson `qisma-iqlidiya-baqi` (1AM « القسمة الإقليدية ») as
// a STUDENT: its own story in the unit's world, PLAYED through its screens from the title to the end screen. Copied from
// lesson 3's gameworld-khawass.mjs. Its five forges, each of its own nature (GAME_WORLD.md « استكشف », spec shapes):
//   majmuaat-kamila  inquiry `groups`   — planks laid one at a time, « will one more fit? », then how many and what is left;
//   baqi-asghar      inquiry `cycle`    — one plank on a gap that grows cell by cell: what will be left, said before each
//                                         cell (he says « one more » where a plank goes in); then two planks he has not
//                                         laid: the most they leave and « will b cells be left? », said before the world runs;
//   musawat-qisma    inquiry `rebuild`  — the gap under a cloth: three bare rounds, then the template round;
//   taqdir-hasil     inquiry `estimate` — tens of planks on a ruler, then single planks (hundreds first on a big gap);
//   baqi-fi-masala   the mirror ALONE   — sentences about a cable-car station: predictions (one missed), the robot's HELP
//                                         opened and used, a rule refuted on his evidence, a rule that survives it and is
//                                         BROKEN by the mirror's attack (`data-rf-broken`), then the right one.
// In each: a wrong pick and the right one, the sounds the world plays, the mirror refuting a wrong rule, the attacks, the
// seal, the last step, the tablet. Also: the ✕ CLICKED inside a forge and inside the world (he leaves, comes back, and
// finds his place), the gate dash, the store of the last bridge (a wrong plank, the wrong divisions, the price, its way
// out) and the lighthouse.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas left to
// right on one line, no word or number of lessons 1–3 nor of the next 1AM and the 2AM lessons, a way out reachable, no
// text under 12 px. Every investigation screen also: nothing leaves its frame, no button is covered.
// The answers are computed HERE from the numbers on screen (state hooks are read for the question, never for the answer).
// NOT RUN since the lesson's fifth key and its `cycle` experiment were written (2026-11-19): `node --check` only.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-baqi.mjs [outDir]
import { createWalk, lessonUrl } from './lib/walk.mjs';
import { GRADE, BAQI_FOREIGN, BAQI_FOREIGN_NUMBERS } from './lib/baqi.mjs';

const ID = 'qisma-iqlidiya-baqi';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID, GRADE);

// every foreign number is checked on every screen: no screen of this walk draws a number at random that could be one of
// them (the only one under 100 is lesson 2's 96; the mirrors of this lesson draw 14 … 60 travellers, and their other
// cases are fixed or the first of a computed list)
const w = createWalk('gameworld-baqi', { foreign: BAQI_FOREIGN, foreignNumbers: BAQI_FOREIGN_NUMBERS });
const { expect, check } = w;
/** The way out of any screen of the world: the top bar's ✕, the forge's own ✕, the ✕ drawn over a dialog. */
const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
/** The Euclidean division, computed by the walk. */
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });

await w.run(async () => {
  const { page } = await w.student({ uid: 9851, lessonId: ID, url: URL, grade: GRADE });
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
  /** Forges on bridge i with the held mould; a prediction is answered with the true remainder (computed here). */
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
      await take(wrong);
      await forge(i);
      await ff(8);
      await page.waitForTimeout(300);
      const { q, r } = div(a, wrong);
      expect(
        !(await st()).stars[id],
        `planks of ${wrong} leave cells over ${a} (${a} = ${wrong} × ${q} + ${r}): it crumbles`,
      );
    }
    await take(right);
    await forge(i);
    await ff(8);
    expect((await st()).stars[id] >= 1, `bridge ${a} holds with planks of ${right} (${a} = ${right} × ${a / right})`);
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
  /** Waits until the investigation's state passes `test` (a function of window.__inquiry, sent as text). */
  const until = (test, arg) => page.waitForFunction(test, arg, { timeout: 15000 });
  const fillUse = async (vals) => {
    for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
    await page.click('[data-rf-use-check]');
    await page.waitForSelector('[data-rf-use-fb]');
    return page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb');
  };
  /** From the mirror's attacks: each answered as the rule says, then the seal and the last step — up to the tablet. */
  const attackToTablet = async (name, last) => {
    await page.waitForSelector('[data-rf="attack"]');
    await shot(`${name}-attack`);
    for (let i = 0; i < 6; i += 1) {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      await page.click(`[data-rf-say="${c.held ? 'yes' : 'no'}"]`);
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
  /** A wrong rule written with tiles: the mirror refutes it on HIS evidence; `isRow` checks the case that broke it. */
  const refuted = async (name, tiles, isRow, what) => {
    for (const t of tiles) await page.click(`[data-rf-tile="${t}"]`);
    await shot(`${name}-build`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    const id = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
    expect(isRow(id), `${what} — refuted by a case HE made (${id})`);
    await shot(`${name}-refuted`);
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
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
    const bad = await page.evaluate(() => {
      const out = [];
      const frame = document.querySelector('.iq');
      if (!frame) return ['no investigation on screen'];
      const box = frame.getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit').style.zoom) || 1;
      for (const el of frame.querySelectorAll(
        'button, input, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-scene, .iq-found li, .iq-askline, .iq-tpl, .iq-chips',
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
          parseFloat(getComputedStyle(el).fontSize) * zoom < 11.5
        )
          out.push('text under 12 px: ' + String(el.className).split(' ')[0]);
      }
      // the words and numbers drawn in the scene (SVG text) are read too
      for (const el of frame.querySelectorAll('svg text')) {
        const r = el.getBoundingClientRect();
        if (r.width && r.height < 11.5 * 0.9 && el.textContent.trim())
          out.push(`scene text under 12 px: « ${el.textContent.trim().slice(0, 20)} » (${r.height.toFixed(1)} px)`);
      }
      if (box.bottom > window.innerHeight + 1 || box.right > window.innerWidth + 1)
        out.push('the frame leaves the screen');
      for (const el of frame.querySelectorAll('*'))
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2)
          out.push('scrolls: ' + el.className);
      return [...new Set(out)];
    });
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
  const ownRows = () => page.locator('[data-rf-row][data-rf-own="1"]').count();
  /**
   * The ✕ is CLICKED (`sel`): he leaves the lesson for the catalogue. He comes back by the lesson's address and presses
   * the title's button: the world gives him back his island, his keys — and the mirror he had left open.
   */
  const leaveAndReturn = async (sel, where) => {
    const before = await st();
    const path = new globalThis.URL(URL).pathname;
    await page.click(sel);
    await page.waitForFunction((p) => window.location.pathname !== p, path, { timeout: 15000 });
    // the address changes first; the world is unmounted when the catalogue (a lazy page) has arrived: read it once it has
    // had the time to (it was read in the same instant as the address, and found still mounted — the clean measure of
    // 2026-11-19), and say how long it took
    const t0 = Date.now();
    const gone = await page
      .waitForSelector('.di-root', { state: 'detached', timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    expect(
      gone,
      `${where}: the ✕ is clicked — he is out of the world (${await page.evaluate(() => window.location.pathname)}, the world gone after ${Date.now() - t0} ms)`,
    );
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-di-start]', { timeout: 60000 });
    await page.waitForTimeout(1200);
    await shot(`back-${where}`);
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
    await ff(1.6);
    await page.waitForTimeout(300);
    const now = await st();
    expect(
      now.stage === before.stage && now.keys.length === before.keys.length,
      `${where}: back in the lesson he is on the same island with the same keys (island ${now.stage}, ${now.keys.length} key(s))`,
    );
    return now;
  };

  // ══════════════════════════ the title ══════════════════════════
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(1200);
  expect(
    (await page.textContent('.di-title h1')).includes('مرفأ النخيل') &&
      (await page.textContent('.di-title__eyebrow')).includes('القسمة الإقليدية'),
    'the title screen is this lesson’s own story (« مرفأ النخيل », « القسمة الإقليدية »)',
  );
  await shot('title');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  await shot('start');

  // ── island A → B: planks of 7 on 28 (no prediction on the first bridge) ──
  await bridge(0, 'g28', 28, null, 7);
  await shot('g28');
  await cross(0);
  await page.waitForTimeout(400);
  expect(
    (await st()).stage === 1 && (await st()).held == null,
    'on the second island the mould is not kept: he must choose',
  );
  // 30: the plank 4 first (the investigation of island C starts from it), with its prediction
  await take(4);
  await toAltar(1);
  await act();
  expect((await st()).overlay === 'predict', 'bridge 30: the world asks his prediction before it builds');
  await shot('predict');
  {
    const o = (await st()).o;
    await page.click(`[data-di-predict="${o.a % o.b}"]`);
    await ff(9);
  }
  expect(!(await st()).stars.g30, 'planks of 4 leave 2 cells over 30 (30 = 4 × 7 + 2): the bridge crumbles');
  await bridge(1, 'g30', 30, null, 6);
  await cross(1);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 1 🧺 « المجموعات الكاملة » — GROUPS ══════════════════════════
  expect(
    (await st()).stage === 2 && (await st()).overlay === 'forge',
    'island C « جزيرة المجموعات » opens the first forge',
  );
  await opensOnQuestion('majmuaat-kamila', 'groups');
  {
    const s0 = await iq();
    expect(
      s0.ri === 0 && s0.a === 30 && s0.b === 4 && s0.stage === 'guess' && s0.laid === 0,
      'it starts from the gap he has just crossed and the plank that left cells: 30 with planks of 4, nothing laid',
    );
    await forgeTools('forge 1, the investigation');
    await inquiryFits('groups-start');
    // the ✕ of the forge is CLICKED before he has done anything: he leaves, comes back — the mirror waits for him
    {
      const back = await leaveAndReturn('.rf-root [data-di-exit]', 'forge-1');
      expect(
        back.overlay === 'forge' && (await fg()).key === 'majmuaat-kamila' && (await iq()).kind === 'groups',
        'a forge left by its ✕ opens again when he comes back: a key cannot be skipped',
      );
      const s1 = await iq();
      expect(
        s1.ri === 0 && s1.laid === 0 && s1.stage === 'guess',
        '…and its investigation starts again from its first gap',
      );
    }
    let missed = false;
    let finished = false;
    const shown = new Set();
    for (let guard = 0; guard < 80; guard += 1) {
      const s = await iq();
      if (s.kind !== 'groups') break;
      const { q, r } = div(s.a, s.b);
      if (s.stage === 'guess') {
        // a big gap: after his first predictions « أكمل » lets the world lay the rest
        if (s.a >= 10 * s.b && s.guesses >= 3 && q - s.laid > 1) {
          expect(
            (await page.locator('[data-iq-finish]').count()) === 1,
            `${s.a} by ${s.b}: after three predictions « أكمل » is offered`,
          );
          const heard = await hear(async () => {
            await page.click('[data-iq-finish]');
            await until(() => window.__inquiry.stage === 'say');
          });
          const t = await iq();
          expect(t.laid === q, `« أكمل »: the world lays the rest — ${q} planks of ${s.b} on ${s.a}`);
          check(
            heard.filter((x) => x === 'sweep').length === q - s.laid && heard.at(-1) === 'hit',
            `« أكمل »: a sweep per plank laid, a knock for the plank that does not fit (${[...new Set(heard)].join(', ')})`,
          );
          finished = true;
          await inquiryFits('groups-finish');
          continue;
        }
        const k = s.laid + 1;
        const fits = s.b * k <= s.a;
        // the FIRST plank of all: he says « no » — and it fits; every other plank as the arithmetic says
        const say = s.ri === 0 && s.laid === 0 ? !fits : fits;
        const heard = await hear(async () => {
          await page.click(`[data-iq-say="${say ? 'yes' : 'no'}"]`);
          await until((g) => window.__inquiry.guesses === g && window.__inquiry.stage !== 'lay', s.guesses + 1);
        });
        const t = await iq();
        expect(
          fits ? t.laid === k && t.stage === 'guess' : t.laid === s.laid && t.stage === 'say',
          `${s.a} by ${s.b}, plank ${k}: ${fits ? `it fits (${s.a} − ${s.b} × ${k} = ${s.a - s.b * k})` : `it does not (${s.b} > ${s.a - s.b * s.laid})`}`,
        );
        check(
          heard[0] === 'pick' && heard.includes(fits ? 'plank' : 'hit'),
          `${s.a} by ${s.b}, plank ${k}: heard — his pick, then ${fits ? 'the plank laid' : 'the knock'} (${heard.join(', ')})`,
        );
        const f = await fact();
        if (say !== fits) {
          expect(
            f.includes('لم يكن هذا توقّعك'),
            'he said « no » for the first plank: it fits — the fact beside his prediction, never « wrong »',
          );
          await inquiryFits('groups-wrong-pick');
        } else check(f.includes('كما توقّعت'), `${s.a} by ${s.b}, plank ${k}: « كما توقّعت »`);
        if (!fits && !shown.has(`over-${s.ri}`)) {
          shown.add(`over-${s.ri}`);
          if (s.ri === 0 || s.b > s.a || r === 0) await inquiryFits(`groups-over-${s.a}-${s.b}`);
        }
        continue;
      }
      if (s.stage === 'say') {
        if (!missed) {
          // the first count: one plank too many — the strip answers, its planks get their numbers
          missed = true;
          await page.fill('[data-iq-in="q"]', String(q + 1));
          await page.fill('[data-iq-in="r"]', String(r));
          const heard = await hear(async () => {
            await page.click('[data-iq-check]');
            await page.waitForTimeout(150);
          });
          expect(
            (await iq()).stage === 'say' && (await fact()).includes(`كتبتَ ${q + 1}`) && heard.includes('fail'),
            `${q + 1} planks written for ${s.a} by ${s.b}: refused by the strip (« كتبتَ ${q + 1} »), never « wrong »`,
          );
          await inquiryFits('groups-say-miss');
        }
        await page.fill('[data-iq-in="q"]', String(q));
        await page.fill('[data-iq-in="r"]', String(r));
        const heard = await hear(async () => {
          await page.click('[data-iq-check]');
          await until(() => window.__inquiry.stage === 'seen');
        });
        check(heard.includes('key'), `${s.a} = ${s.b} × ${q} + ${r}: his count is checked (key)`);
        continue;
      }
      if (s.stage === 'seen') {
        expect(
          (await page.locator('[data-iq-found] li').count()) === s.ri + 1,
          `${s.a} by ${s.b}: ${q} planks and ${r} cells left, kept in his list`,
        );
        if (r === 0 && q > 0) await inquiryFits('groups-exact');
        if (q === 0) await inquiryFits('groups-none');
        const label = (await page.textContent('[data-iq-next]')) ?? '';
        if (label.includes('أكتب قاعدتي')) break;
        await page.click('[data-iq-next]');
        await page.waitForTimeout(80);
        continue;
      }
      await page.waitForTimeout(100);
    }
    const end = await iq();
    expect(
      end.ri === 3 && end.found.length === 4 && finished && missed,
      'four gaps: one he started, an exact fit, a plank longer than the gap, a long gap finished by the world',
    );
    await inquiryFits('groups-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    expect(
      (await ownRows()) === 5,
      'only now he WRITES his rule — the mirror tests it on the four gaps HE filled and the count he first wrote',
    );
    // « count every plank I tried, with the one that did not fit »: refused by his first gap (30 takes 7 planks, not 8)
    await refuted(
      'forge1',
      ['count:tried', 'stop:noMore'],
      (id) => {
        const [a, b, n] = id.split(':').map(Number);
        return n === Math.floor(a / b);
      },
      '« count the planks I tried » says one plank too many',
    );
    // the tiles of the first key speak of PLANKS only: what is left, and how long it may be, is the second key's
    {
      const tiles = (await page.locator('[data-rf-tile]').allTextContents()).join(' | ');
      expect(
        tiles.includes('عندما لا يدخل لوح آخر') && !/أقصر من|أصغر من|بطوله/.test(tiles),
        `forge 1: no tile states a length for what is left (${tiles.slice(0, 120)}…)`,
      );
    }
    await finishForge('forge1', ['count:full', 'stop:noMore'], async (u) => {
      const { q, r } = div(u.a, u.b);
      expect(
        (await fillUse({ q: q + 1, r })) === 'q',
        `the last step: ${q + 1} planks of ${u.b} in ${u.a} are refused`,
      );
      await shot('forge1-use');
      expect(
        (await fillUse({ q, r })) === 'ok',
        `${u.a} cells, planks of ${u.b}: ${q} planks and ${r} cells, without counting`,
      );
    });
  }
  await shot('tablet-1');
  {
    const mine = await page.textContent('[data-di-my-rule]');
    check(mine.includes('لا يدخل لوح آخر'), 'the tablet keeps HIS rule (« … عندما لا يدخل لوح آخر »)');
    const card = await page.textContent('.di-card');
    expect(card.includes('المجموعات الكاملة'), 'the tablet names the rule: « المجموعات الكاملة »');
    expect(
      !/أقصر من|أصغر من|الباقي/.test(card),
      'the first tablet does not seal the second key: it says nothing of how long the leftover may be',
    );
  }
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 1, 'one key earned');
  // the ✕ of the top bar is CLICKED inside the world: he leaves, comes back, and plays on with his key
  {
    const back = await leaveAndReturn('.di-top a.di-icon', 'world');
    expect(back.phase === 'play' && back.overlay == null, 'back in the world: he plays on, no forge to redo');
  }

  // ── 45: the plank 8 leaves 5, the plank 9 fills it ──
  await bridge(2, 'g45', 45, 8, 9);
  await cross(2);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 2 ⚖️ « الباقي أصغر من المقسوم عليه » — CYCLE ══════════════════════════
  expect(
    (await st()).stage === 3 && (await st()).overlay === 'forge',
    'island D « جزيرة البقايا » opens the second forge',
  );
  expect((await page.textContent('.rf-brand h2')).includes('جزيرة البقايا'), 'the mirror bears the name of ITS island');
  await opensOnQuestion('baqi-asghar', 'cycle');
  {
    const s0 = await iq();
    expect(
      s0.part === 'round' && s0.b === 8 && s0.steps[0].a === 44 && s0.steps[1].a === 45 && s0.stage === 'guess',
      'it starts from the mould 8 of the bridge he has just crossed: 44 cells are shown, 45 (his gap) is the first he predicts',
    );
    expect(
      (await fact()).includes('4 خانات') && (await page.getAttribute('[data-iq-left]', 'data-iq-left')) === '4',
      'the first gap is a FACT, not a question: 5 planks of 8 on 44 cells, 4 cells left',
    );
    await forgeTools('forge 2, the investigation');
    await inquiryFits('cycle-start');
    let fell = 0;
    let probes = 0;
    for (let guard = 0; guard < 60; guard += 1) {
      const s = await iq();
      if (s.kind !== 'cycle') break;
      if (s.part === 'round' && s.stage === 'guess') {
        const cur = s.steps[s.i];
        const next = s.steps[s.i + 1];
        // what will be left, computed HERE: the Euclidean division of the next gap
        const { q, r } = div(next.a, s.b);
        // round 1: he says « one cell more » every time — also where the cells left would be as many as the plank
        const say = s.ri === 0 ? (cur.a % s.b) + 1 : r;
        const chips = await page.locator('[data-iq-say]').count();
        expect(chips === s.b + 2, `plank ${s.b}: the chips go from 0 to ${s.b + 1} — « ${s.b} » can be said`);
        const heard = await hear(async () => {
          await page.click(`[data-iq-say="${say}"]`);
          await until(([i]) => window.__inquiry.i === i + 1 && window.__inquiry.stage !== 'lay', [s.i]);
        });
        const wraps = r === 0;
        expect(
          (await page.getAttribute('[data-iq-strip]', 'data-iq-strip')) === String(next.a) &&
            (await page.locator('[data-iq-stairs]').getAttribute('data-iq-stairs')).split(',').at(-1) === String(r),
          `${next.a} cells, plank ${s.b}: ${q} planks and ${r} left (${next.a} = ${s.b} × ${q} + ${r})${wraps ? ' — the plank went in' : ''}`,
        );
        check(
          heard[0] === 'pick' && heard.at(-1) === (wraps ? 'plank' : 'sweep'),
          `${next.a} by ${s.b}: heard — his pick, then ${wraps ? 'the plank laid' : 'the count that climbs'} (${heard.join(', ')})`,
        );
        const f = await fact();
        if (say !== r) {
          fell += 1;
          expect(
            wraps && say === s.b && f.includes('دخل فيها لوح آخر') && f.includes(`قلتَ ${say}`),
            `he said ${say} cells for ${next.a}: the strip lays one more plank and NOTHING is left — beside his number, never « wrong »`,
          );
          expect(
            (await page.locator('.iq-cyc-plank').count()) >= 1 && (await page.locator('.iq-cyc-said').count()) >= 1,
            'the staircase falls to 0 there, with the mark of the plank and what he had said',
          );
          await inquiryFits(`cycle-fall-${next.a}`);
        } else check(f.includes('كما قلتَ'), `${next.a} by ${s.b}: « كما قلتَ »`);
        continue;
      }
      if (s.part === 'round' && s.stage === 'seen') {
        const lefts = s.steps.map((x) => x.a % s.b);
        expect(
          lefts.includes(s.b - 1) && !lefts.some((x) => x >= s.b) && lefts.includes(0),
          `plank ${s.b} on ${s.steps[0].a} … ${s.steps.at(-1).a}: left ${lefts.join(', ')} — up to ${s.b - 1}, then 0`,
        );
        expect((await page.locator('[data-iq-found] li').count()) === s.ri + 1, `plank ${s.b}: kept in his list`);
        await inquiryFits(`cycle-round-${s.b}`);
        await page.click('[data-iq-next]');
        await page.waitForTimeout(80);
        continue;
      }
      if (s.part === 'probe' && s.stage === 'ask') {
        expect(
          await page.locator('[data-iq-grow]').isDisabled(),
          `a plank he has not laid (${s.b}): the world does not move before he has said both answers`,
        );
        await inquiryFits(`cycle-probe-${s.b}`);
        // the first plank: « b cells, and yes, b cells will be left » — the second: as the walk's arithmetic says
        const first = s.pi === 0;
        const max = first ? s.b : s.b - 1;
        await page.fill('[data-iq-in="max"]', String(max));
        await page.click(`[data-iq-same="${first ? 'yes' : 'no'}"]`);
        const heard = await hear(async () => {
          await page.click('[data-iq-grow]');
          await until(() => window.__inquiry.stage === 'seen');
          await page.waitForTimeout(400);
        });
        probes += 1;
        const stairs = (await page.locator('[data-iq-stairs]').getAttribute('data-iq-stairs')).split(',').map(Number);
        expect(
          JSON.stringify(stairs) === JSON.stringify([...Array.from({ length: s.b }, (_, k) => k), 0, 1]),
          `plank ${s.b}: the gap grows alone — the cells left climb 0 … ${s.b - 1}, fall to 0, start again (${stairs.join(', ')})`,
        );
        check(
          heard.filter((x) => x === 'sweep').length === s.b &&
            heard.filter((x) => x === 'plank').length === 1 &&
            heard.at(-1) === (first ? 'fail' : 'key'),
          `plank ${s.b}: heard — a count per cell, ONE plank at the fall, then ${first ? 'fail' : 'key'} (${[...new Set(heard)].join(', ')})`,
        );
        const f = await fact();
        expect(
          f.includes(`${s.b - 1} `) &&
            f.includes('دخل فيها لوح آخر') &&
            (first ? f.includes(`قلتَ: ${max}`) : f.includes('كما قلتَ')),
          `plank ${s.b}: the most left was ${s.b - 1}; at ${s.b} cells a plank went in — ${first ? 'beside what he said' : '« كما قلتَ »'}`,
        );
        await inquiryFits(`cycle-probe-${s.b}-seen`);
        if ((await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي')) break;
        await page.click('[data-iq-next]');
        await page.waitForTimeout(80);
        continue;
      }
      await page.waitForTimeout(80);
    }
    const end = await iq();
    expect(
      fell === 1 && probes === 2 && end.rounds.length === 2 && end.probes.length === 2,
      'two planks grown cell by cell (one fall missed, then none), two planks said before the world ran',
    );
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    {
      const rows = (await fg()).rows;
      expect(
        rows.length === 10 && rows.every((c) => c.b * c.k + c.n === c.a && c.held === c.n < c.b),
        `only now he WRITES his rule — on what HE saw: for each plank the most it left, b cells that took a plank, a gap it filled (${rows.length} cases)`,
      );
      expect(
        (await ownRows()) >= 1 && (await ownRows()) <= 8,
        'his evidence fits its column (the oldest lines leave first)',
      );
    }
    // « the most a plank leaves is its own length »: he SAW 8 cells take another plank
    await refuted(
      'forge2',
      ['from:zero', 'to:b'],
      (id) => {
        const [b, , n] = id.split(':').map(Number);
        return n === b;
      },
      '« a plank may leave as many cells as its length » is refuted by the cells he saw take a plank',
    );
    await finishForge('forge2', ['from:zero', 'to:bm1'], async (u) => {
      expect(
        (await fillUse({ lo: 0, hi: u.b })) === 'same',
        `the last step: « from 0 to ${u.b} » for planks of ${u.b} is refused — ${u.b} cells take another plank`,
      );
      await shot('forge2-use');
      expect((await fillUse({ lo: 0, hi: u.b - 1 })) === 'ok', `planks of ${u.b} leave from 0 to ${u.b - 1} cells`);
    });
  }
  await shot('tablet-2');
  check((await page.textContent('[data-di-my-rule]')).includes('طول اللوح ناقص 1'), 'the tablet keeps HIS rule');
  {
    const card = await page.textContent('.di-card');
    expect(card.includes('الباقي أصغر من المقسوم عليه'), 'the tablet: « الباقي أصغر من المقسوم عليه »');
    expect(card.includes('أكبر باقٍ ممكن'), 'the tablet names what he found: the biggest remainder');
  }
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 2, 'two keys earned');

  // ── 52: the plank 5 leaves 2, the plank 4 fills it ──
  await bridge(3, 'g52', 52, 5, 4);
  await cross(3);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 3 🟰 « مساواة القسمة الإقليدية » — REBUILD ══════════════════════════
  expect(
    (await st()).stage === 4 && (await st()).overlay === 'forge',
    'island E « جزيرة البنّاء » opens the third forge',
  );
  expect((await page.textContent('.rf-brand h2')).includes('جزيرة البنّاء'), 'the mirror bears the name of ITS island');
  await opensOnQuestion('musawat-qisma', 'rebuild');
  {
    const s0 = await iq();
    expect(
      s0.b === 6 &&
        s0.q === 8 &&
        s0.r === 4 &&
        s0.stage === 'guess' &&
        (await page.getAttribute('[data-iq-cloth]', 'data-iq-cloth')) === 'down',
      'it starts from the gap of island D under a cloth: 8 planks of 6 and a piece of 4 lie on it (52)',
    );
    await inquiryFits('rebuild-start');
    let more = false;
    for (let guard = 0; guard < 6; guard += 1) {
      const s = await iq();
      if (s.kind !== 'rebuild' || s.stage !== 'guess') break;
      const bare = (await page.locator('.iq-tpl .katex').count()) === 0;
      expect(
        bare === s.ri < 3,
        s.ri < 3
          ? `round ${s.ri + 1}: the box ALONE — no « b × q + r = » to spell the rule`
          : 'the last round: the template « b × q + r = □ »',
      );
      if (s.ri === 3) await inquiryFits('rebuild-template');
      const a = s.b * s.q + s.r;
      // the first gap: the planks alone (the piece forgotten) — the cloth answers
      const typed = s.ri === 0 ? s.b * s.q : a;
      await page.fill('[data-iq-in="a"]', String(typed));
      const heard = await hear(async () => {
        await page.click('[data-iq-lift]');
        await page.waitForSelector('[data-iq-next]');
      });
      const t = await iq();
      expect(
        t.stage === 'seen' &&
          t.a === a &&
          t.said === typed &&
          (await page.getAttribute('[data-iq-cloth]', 'data-iq-cloth')) === 'up',
        `${s.q} planks of ${s.b} and ${s.r} cells: the cloth is lifted on ${a} (${s.b} × ${s.q} + ${s.r})`,
      );
      check(
        heard[0] === 'pick' &&
          heard.includes('sweep') &&
          heard.filter((x) => x === 'plank').length === Math.floor(s.r / s.b) &&
          heard.at(-1) === (typed === a ? 'success' : 'crumble'),
        `round ${s.ri + 1}: heard — the cloth, ${Math.floor(s.r / s.b)} plank(s) laid in the piece, ${typed === a ? 'success' : 'crumble'} (${heard.join(', ')})`,
      );
      const f = await fact();
      if (typed !== a) {
        expect(
          f.includes(`قلتَ ${typed}`),
          `he said ${typed} (the planks alone): the gap is ${a} — beside his number, never « wrong »`,
        );
        await inquiryFits('rebuild-wrong-pick');
      } else if (s.r >= s.b) {
        more = true;
        expect(
          f.includes('دخل') && (await page.locator('.iq-plank.is-new').count()) === Math.floor(s.r / s.b),
          `a piece of ${s.r} with planks of ${s.b}: the world lays ${Math.floor(s.r / s.b)} more plank(s) in it — it was not left over`,
        );
        await inquiryFits('rebuild-more');
      } else check(f.includes('كما قلتَ'), `round ${s.ri + 1}: « كما قلتَ »`);
      expect((await page.locator('[data-iq-found] li').count()) === s.ri + 1, `round ${s.ri + 1}: kept in his list`);
      if ((await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي')) break;
      await page.click('[data-iq-next]');
      await page.waitForTimeout(80);
    }
    expect(more && (await iq()).found.length === 4, 'four gaps rebuilt, one with a piece longer than a plank');
    await inquiryFits('rebuild-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    expect(
      (await ownRows()) === 5,
      'only now he WRITES his rule — on the four gaps HE rebuilt and the length he first said',
    );
    // « the planks times their length, and nothing more »: his first gap breaks it (6 × 8 = 48, the gap is 52)
    await refuted(
      'forge3',
      ['first:bq', 'then:none'],
      (id) => {
        const [b, q, r, n] = id.split(':').map(Number);
        return r > 0 && n === b * q + r;
      },
      '« only the planks » forgets the piece',
    );
    await finishForge('forge3', ['first:bq', 'then:plusR'], async (u) => {
      expect(
        (await fillUse({ a: u.b * u.q })) === 'a',
        `the last step: ${u.b} × ${u.q} alone is refused (the piece of ${u.r})`,
      );
      await shot('forge3-use');
      expect(
        (await fillUse({ a: u.b * u.q + u.r })) === 'ok',
        `${u.b} × ${u.q} + ${u.r} = ${u.b * u.q + u.r}, the cloth never lifted`,
      );
    });
  }
  await shot('tablet-3');
  check((await page.textContent('[data-di-my-rule]')).includes('أضيف الخانات الباقية'), 'the tablet keeps HIS rule');
  expect(
    (await page.textContent('.di-card')).includes('مساواة القسمة الإقليدية'),
    'the tablet: « مساواة القسمة الإقليدية »',
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 3, 'three keys earned');

  // ── 63: the plank 8 leaves 7 (the biggest leftover of 8, as his second key says), the plank 7 fills it; then the dash ──
  await bridge(4, 'g63', 63, 8, 7);
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
      say && (say.includes('حاصل') || say.includes('باق') || say.includes('المقسوم')),
      `the dash says this lesson’s sentence over the rail (« ${say?.trim().slice(0, 50)} »)`,
    );
    await shot('dash');
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

  // ══════════════════════════ forge 4 🔭 « تقدير الحاصل » — ESTIMATE ══════════════════════════
  expect(
    (await st()).stage === 6 && (await st()).overlay === 'forge',
    'island G « جزيرة المنظار » opens the fourth forge — no question is asked before the rule exists',
  );
  expect((await page.textContent('.rf-brand h2')).includes('جزيرة المنظار'), 'the mirror bears the name of ITS island');
  expect((await page.locator('[data-di-option]').count()) === 0, 'no quiz stands before the mirror');
  await opensOnQuestion('taqdir-hasil', 'estimate');
  {
    const s0 = await iq();
    expect(
      s0.a === 692 && s0.b === 27 && s0.si === 0,
      'it starts from the spyglass’s old bridge: 692 cells, planks of 27',
    );
    await inquiryFits('estimate-start');
    let wrongDone = false;
    let zeroSeen = false;
    const places = new Set();
    for (let guard = 0; guard < 40; guard += 1) {
      const s = await iq();
      if (s.kind !== 'estimate') break;
      if (s.stage === 'end') {
        const { q, r } = div(s.a, s.b);
        expect(
          (await page.locator('[data-iq-found] li').count()) === s.ri + 1 && (await fact()).includes(String(q)),
          `${s.a} = ${s.b} × ${q} + ${r}: the gap is laid, kept in his list`,
        );
        if ((await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي')) break;
        await page.click('[data-iq-next]');
        await page.waitForTimeout(80);
        continue;
      }
      if (s.stage !== 'guess') {
        await page.waitForTimeout(80);
        continue;
      }
      places.add(s.place);
      const per = 10 ** s.place;
      const unit = s.b * per;
      const k = Math.floor(s.from / unit);
      expect(
        (await page.getAttribute('[data-iq-flag]', 'data-iq-flag')) === String(s.from) &&
          (await page.getAttribute('[data-iq-ruler]', 'data-iq-ruler')) === String(unit),
        `${s.a} by ${s.b}: the ruler counts ${per === 1 ? 'single planks' : `${per} planks`} a mark (${unit} cells), the flag stands at ${s.from}`,
      );
      if (!wrongDone && k >= 1 && k <= 8) {
        wrongDone = true;
        // a mark past the flag, then a mark that leaves room for the next one — both answered by the ruler
        let heard = await hear(async () => {
          await page.click(`[data-iq-mark="${(k + 1) * per}"]`);
          await page.waitForTimeout(150);
        });
        expect(
          (await iq()).pick?.kind === 'passes' && heard.includes('fail') && (await iq()).si === s.si,
          `${(k + 1) * per} planks pressed: ${s.b} × ${(k + 1) * per} = ${(k + 1) * unit}, past ${s.from} — the ruler says so, nothing is laid`,
        );
        await inquiryFits('estimate-passes');
        heard = await hear(async () => {
          await page.click(`[data-iq-mark="${(k - 1) * per}"]`);
          await page.waitForTimeout(150);
        });
        expect(
          (await iq()).pick?.kind === 'short' && heard.includes('fail'),
          `${(k - 1) * per} planks pressed: ${s.b} × ${k * per} = ${k * unit} still fits in ${s.from} — the ruler says so`,
        );
        await inquiryFits('estimate-short');
      }
      const heard = await hear(async () => {
        await page.click(`[data-iq-mark="${k * per}"]`);
        await until(([si]) => window.__inquiry.si === si + 1 && window.__inquiry.stage !== 'lay', [s.si]);
      });
      check(
        heard.includes('sweep') && heard.includes('plank'),
        `${k * per} planks of ${s.b} laid on ${s.from} (${heard.join(', ')})`,
      );
      if (k === 0 && !zeroSeen) {
        zeroSeen = true;
        // the step of 0 is written in the calculation (« from − b × 0 = from »); its own sentence (`laid`) shows only
        // when another step follows — when it is the last step the round's sum takes its place
        const calc = await page.$$eval('.iq-calc annotation', (els) => els.map((e) => e.textContent));
        const said = await fact();
        expect(
          calc.some((t) => t.includes(`${s.from} - ${s.b} \\times 0 = ${s.from}`)) || said.includes('لم يدخل شيء'),
          `a 0 among the planks: ${s.from} < ${unit}, the step is there and nothing is laid (${calc.join(' · ')})`,
        );
        await inquiryFits('estimate-zero');
      }
      if (s.place === 2) await inquiryFits('estimate-hundreds');
    }
    expect(
      wrongDone && zeroSeen && places.has(2) && (await iq()).found.length === 4,
      `four long gaps on the ruler: a wrong mark each way, a 0 in the quotient, hundreds of planks (places ${[...places].join(', ')})`,
    );
    await inquiryFits('estimate-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    expect((await ownRows()) === 4, 'only now he WRITES his rule — on the four long gaps HE laid');
    // « the tens, and nothing after them »: his first gap breaks it (692 takes 25 planks of 27, not 20)
    await refuted(
      'forge4',
      ['tens:big', 'units:none'],
      (id) => {
        const [a, b, n] = id.split(':').map(Number);
        return n === Math.floor(a / b) && n % 10 !== 0;
      },
      '« the tens alone » forgets the single planks',
    );
    await forgeTools('forge 4, the build');
    await finishForge('forge4', ['tens:big', 'units:big'], async (u) => {
      const { q, r } = div(u.a, u.b);
      expect(
        (await fillUse({ q: q - 1, r: r + u.b })) === 'big',
        `the last step: ${u.a} = ${u.b} × ${q - 1} + ${r + u.b} is refused`,
      );
      await shot('forge4-use');
      expect((await fillUse({ q, r })) === 'ok', `${u.a} = ${u.b} × ${q} + ${r}, tens first`);
    });
  }
  await shot('tablet-4');
  check((await page.textContent('[data-di-my-rule]')).includes('يتّسع له ما بقي'), 'the tablet keeps HIS rule');
  expect((await page.textContent('.di-card')).includes('تقدير الحاصل'), 'the tablet: « تقدير الحاصل »');
  await page.click('[data-di-tablet]');
  await ff(0.5);
  expect((await st()).keys.length === 4, 'four keys earned');

  // ── 78 with a plank of two digits, then the stone of island H ──
  await bridge(6, 'g78', 78, 9, 13);
  // the store of the last bridge stays shut until the LAST key is his
  expect(
    !(await page.evaluate(() => window.__world.flags.key4)),
    'before the fifth key the store of the harbour is shut',
  );
  await cross(6);
  await ff(2.5);
  await page.waitForTimeout(400);

  // ══════════════════════════ forge 5 🚡 « الباقي في مسألة » — the MIRROR alone ══════════════════════════
  expect(
    (await st()).stage === 7 && (await st()).overlay === 'forge',
    'island H « جزيرة التليفريك »: its stone opens the fifth forge — no quiz before the rule exists',
  );
  expect(
    (await page.textContent('.rf-brand h2')).includes('جزيرة التليفريك'),
    'the mirror bears the name of ITS island',
  );
  /** What the division answers to the question of a sentence — computed HERE from its numbers. */
  const truthOf = (c) => {
    const { q, r } = div(c.a, c.b);
    return { full: q, need: q + (r > 0 ? 1 : 0), left: r }[c.t];
  };
  {
    const f0 = await fg();
    expect(
      f0.key === 'baqi-fi-masala' &&
        f0.phase === 'predict' &&
        (await page.locator('.iq').count()) === 0 &&
        (await page.locator('[data-rf-tile]').count()) === 0 &&
        (await page.locator('[data-rf-guess]').count()) === 2,
      'one decision on a case: no investigation — the mirror asks his predictions first, no tile yet',
    );
    await forgeTools('forge 5, the predictions');
    const sentence = (await page.textContent('[data-rf-sentence]')) ?? '';
    expect(
      sentence.includes('مسافر') && sentence.includes('عربة') && (await page.locator('[data-rf-bridge]').count()) === 0,
      `a sentence about the cable-car station is asked ALONE, before the mirror fills the cabins (${sentence.trim().slice(0, 60)})`,
    );
    await shot('forge5-predict');
    let n = 0;
    while ((await fg()).phase === 'predict' && n < 8) {
      const c = (await fg()).show.c;
      const holds = c.n === truthOf(c);
      // the first sentence: he says the opposite — the station answers
      const say = n === 0 ? !holds : holds;
      const heard = await hear(async () => {
        await page.click(`[data-rf-guess="${say ? 'yes' : 'no'}"]`);
        await page.waitForSelector('[data-rf-predicted]');
      });
      const verdict = await page.getAttribute('[data-rf-predicted]', 'data-rf-predicted');
      const { q, r } = div(c.a, c.b);
      expect(
        verdict === (say === holds ? 'right' : 'miss') && c.held === holds,
        `prediction ${n + 1}: ${c.a} travellers, cabins of ${c.b} (${c.a} = ${c.b} × ${q} + ${r}) — « ${c.t}: ${c.n} » is ${holds ? 'true' : 'false'} (${verdict})`,
      );
      check(
        heard.at(-1) === (holds ? 'success' : 'crumble'),
        `prediction ${n + 1}: heard (${[...new Set(heard)].join(', ')})`,
      );
      const said = (await page.textContent('[data-rf-predicted]')) ?? '';
      // the station carries out the number of the sentence: a cabin too few leaves travellers, a cabin too many is empty
      if (c.t === 'need' && c.n < truthOf(c))
        check(said.includes('لا تكفي'), `prediction ${n + 1}: « لا تكفي … » — travellers stay`);
      if (c.t === 'need' && c.n > truthOf(c))
        check(said.includes('دون أيّ مسافر'), `prediction ${n + 1}: a cabin leaves empty`);
      if (n === 0) await shot('forge5-predict-miss');
      if (n === 1) await shot('forge5-predict-seen');
      n += 1;
      await page.click('[data-rf-next]');
      await page.waitForTimeout(120);
    }
    expect(
      (await fg()).phase === 'build' && n === 4,
      `after ${n} predictions (one missed, then three right in a row) he writes his rule`,
    );
    expect(
      (await page.locator('[data-rf-tile]').count()) === 10,
      'three questions, ten tiles: full (3), needed (4), left out (3)',
    );
    // ── the robot's HELP is opened and USED: two more stations in the mirror, never a rule ──
    {
      const before = (await fg()).rows.length;
      await page.click('[data-rf-help]');
      await page.waitForSelector('[data-rf-nudge="experiment"]');
      await page.waitForFunction(() => window.__forge.help && window.__forge.help.running === false, null, {
        timeout: 20000,
      });
      const f = await fg();
      const [x, y] = f.help.cases;
      expect(
        f.nudges === 1 && f.rows.length === before + 2 && x.b === y.b && y.a === x.a + 1,
        `« ساعدني يا زيرو »: the mirror fills two stations — the same cabins (${x.b}), one traveller more (${x.a}, then ${y.a}) — and both join his evidence`,
      );
      expect(
        (await page.locator('[data-rf-choice]').count()) === 0 &&
          (await page.locator('[data-rf-bridge]').count()) === 1,
        'the help shows the world, never a choice between written rules',
      );
      expect(
        (await page.getAttribute('.rf-root', 'data-rf-nudges')) === '1',
        'the help is counted (how the rule was found is kept)',
      );
      await shot('forge5-help');
    }
    // « as many cabins as the quotient »: refuted by a station HE saw, where travellers stayed
    await refuted(
      'forge5',
      ['full:q', 'need:q', 'left:r'],
      (id) => {
        const [t, a, b, k] = id.split(':');
        return t === 'need' && Number(k) !== truthOf({ t, a: Number(a), b: Number(b) });
      },
      '« the cabins needed are the quotient » leaves travellers at a station he saw',
    );
    // « who stays out is the quotient »: nothing he saw contradicts it — the mirror ATTACKS it with its own answer
    {
      for (const t of ['full:q', 'need:cond', 'left:q']) await page.click(`[data-rf-tile="${t}"]`);
      await page.click('[data-rf-test]');
      await page.waitForSelector('[data-rf-agreed]');
      await page.click('[data-rf-dare]');
      await page.waitForSelector('[data-rf="attack"]');
      const c = (await fg()).atk.list[0];
      const { q, r } = div(c.a, c.b);
      expect(
        c.t === 'left' && c.n === q && q !== r,
        `the attack is the rule's OWN answer on a new station: ${c.a} travellers, cabins of ${c.b} — « left out: ${c.n} » (the quotient; ${r} stay)`,
      );
      await shot('forge5-attack-wrong');
      await page.click('[data-rf-say="yes"]');
      expect(
        (await page.getAttribute('[data-rf-rule-says]', 'data-rf-rule-says')) === 'yes',
        'his rule says « true » — he has it carried out',
      );
      const heard = await hear(async () => {
        await page.click('[data-rf-fire]');
        await page.waitForSelector('[data-rf-broken]');
      });
      expect(
        (await page.getAttribute('[data-rf-broken]', 'data-rf-broken')) === `left:${c.a}:${c.b}:${c.n}` &&
          heard.includes('crumble'),
        `the station shows ${r} traveller(s) left, not ${c.n}: his rule is BROKEN in front of him (never « wrong »)`,
      );
      await shot('forge5-broken');
      await page.click('[data-rf-fix]');
      await page.waitForSelector('[data-rf="build"]');
    }
    await finishForge('forge5', ['full:q', 'need:cond', 'left:r'], async (u) => {
      const { q, r } = div(u.a, u.b);
      // the classic slip of this key: the quotient when somebody is left (or one cabin more when nobody is)
      const slip = r > 0 ? q : q + 1;
      expect(
        (await fillUse({ q, r, n: slip })) === (r > 0 ? 'few' : 'need'),
        `the last step: ${u.a} = ${u.b} × ${q} + ${r} — ${slip} cabins are refused`,
      );
      await shot('forge5-use');
      const need = q + (r > 0 ? 1 : 0);
      expect((await fillUse({ q, r, n: need })) === 'ok', `${u.a} travellers, cabins of ${u.b}: ${need} cabins`);
    });
  }
  await shot('tablet-5');
  check((await page.textContent('[data-di-my-rule]')).includes('وأزيد 1 إذا بقي أحد'), 'the tablet keeps HIS rule');
  expect((await page.textContent('.di-card')).includes('الباقي في مسألة'), 'the tablet: « الباقي في مسألة »');
  await page.click('[data-di-tablet]');
  await ff(0.5);
  expect((await st()).keys.length === 5, 'five keys earned, all forged');
  expect(Boolean(await page.evaluate(() => window.__world.flags.key4)), 'the fifth key opens the store of the harbour');

  // ══════════════════════════ the last bridge: 864 cells, planks of 34 or 36 ══════════════════════════
  await toAltar(7);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  const A = Number(((await page.textContent('[data-di-boss-mission]')).match(/(\d{3,})/) ?? [])[1]);
  expect((await st()).overlay === 'boss' && A === 864, `the store opens on the lesson’s problem: ${A} cells`);
  const moulds = await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
  expect(
    moulds.join() === '34,36',
    `the store offers the lesson’s two planks — ${moulds.join(' and ')} — and no other`,
  );
  const fills = moulds.find((m) => A % m === 0);
  const other = moulds.find((m) => A % m !== 0);
  expect(fills && other, `the walk’s own arithmetic: ${fills} fills ${A}, ${other} leaves ${A % other}`);
  await shot('boss');
  await page.click(`[data-di-mould="${other}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  expect(
    (await page.textContent('[data-di-boss-a]')).trim() === String(A),
    `the division to write starts with the gap of THIS lesson: ${A} = ${other} × ▢ + ▢`,
  );
  const bossErr = async (q, r) => {
    await page.fill('[data-di-q]', q === '' ? '' : String(q));
    await page.fill('[data-di-r]', r === '' ? '' : String(r));
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    return (await page.textContent('[data-di-boss-error]')) ?? '';
  };
  expect(
    (await bossErr('', '')).includes('عدد الألواح'),
    'an empty division is refused, in the words of this lesson (planks)',
  );
  {
    const { q } = div(A, other);
    const e = await bossErr(q + 1, 0);
    expect(
      e.includes(String(other * (q + 1))) && e.includes(`(${A})`),
      `${q + 1} planks of ${other}: « ${other * (q + 1)} cells, longer than the gap (${A}) » (${e.trim().slice(0, 60)})`,
    );
    const e2 = await bossErr(q - 1, A - other * (q - 1));
    expect(
      e2.includes(`أصغر من ${other}`),
      `${q - 1} planks and ${A - other * (q - 1)} left: « room for another plank »`,
    );
  }
  await shot('boss-divide');
  {
    const { q, r } = div(A, other);
    await page.fill('[data-di-q]', String(q));
    await page.fill('[data-di-r]', String(r));
    await page.click('[data-di-check]');
    await ff(15);
    await page.waitForTimeout(400);
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'choose' && o.tried[other] === r,
      `planks of ${other} leave ${r} cells: the store shows it tried and lets him choose again`,
    );
  }
  await shot('boss-tried');
  await page.click(`[data-di-mould="${fills}"]`);
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  const Q = A / fills;
  await page.fill('[data-di-q]', String(Q));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  await ff(12);
  await page.waitForTimeout(300);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'cost' && o.q === Q,
      `the bridge of ${A} holds with ${Q} planks of ${fills}: the store asks their price`,
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  const price = Number((await page.textContent('[data-di-boss-price]')).trim());
  {
    const asked = await page.textContent('.di-card h2');
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
    const bad = Q * price - price;
    await page.fill('[data-di-cost]', String(bad));
    await page.click('[data-di-check]');
    await page.waitForTimeout(300);
    const e = await page.textContent('[data-di-boss-error]');
    expect(
      e.includes(String(bad)) && e.includes('ثمن اللوح'),
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
    (await st()).overlay == null && (await st()).objective.includes('اعبر إلى المرفأ'),
    `paid ${Q * price} دج (${Q} × ${price}): the objective says to cross to the harbour`,
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
