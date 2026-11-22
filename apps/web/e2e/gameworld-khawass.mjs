// « أرخبيل القواسم: جسور المرفأ » — walk of the game world of lesson `khawass-qawasim` (lesson 3) as a STUDENT: its own
// story in the unit's world, PLAYED through its screens from the title to the end screen. Its four forges open on four
// experiments of their own kind (GAME_WORLD.md « استكشف », spec shapes): `join` (two gaps glued or cut), `stack` (copies of
// one gap), `peel` (the piece a division leaves, then a claim built from the table's columns), `letters` (numbers, then a
// proof assembled from cards). In each: a wrong pick and the right one, the sounds the world plays, the mirror refuting a
// wrong rule (join, stack) or the table refusing a wrong claim (peel), the attacks, the seal, the last step, the tablet.
// Forge 1 also plays what a student who struggles meets: « ساعدني يا زيرو » (two gaps the mirror builds, never a rule), a
// rule his own gaps agree with and that a NEW gap BREAKS (`data-rf-broken`), after he said what the arithmetic says and
// not what his rule says (« قاعدتك تقول غير ذلك »).
// The ✕ is CLICKED twice — in the world (island B) and inside a forge (the first experiment) — and each time he comes
// back where he was: the same island with its bridge built; the same mirror, its experiment from its first gap.
// Then the gate dash (its last wave gives nothing of the next island away), the bridge the third key reads (105: what
// 280 leaves under the piece 175), the stone's question (a wrong pick, then the right set), the store of the last bridge
// (a wrong shelf, the wrong divisions, the price, its way out) and the lighthouse.
// At EVERY screenshot (lib/walk.mjs › shot): nothing scrolls / is cut / leaves the screen, no raw LaTeX, formulas left to
// right on one line, no word or number of lessons 1 and 2, a way out reachable, no text under 12 px (fontFloor).
// Every investigation screen also: nothing leaves its frame, no button is covered (inquiryFits).
// The answers are computed HERE from the numbers on screen (state hooks are read for the question, never for the answer).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-khawass.mjs [outDir]
import { createWalk, lessonUrl, QAWASIM_WORDS, QAWASIM_NUMBERS, FLOOR_PX } from './lib/walk.mjs';

const ID = 'khawass-qawasim';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
// the 12 px floor is on by default (lib/walk.mjs): every screenshot checks it
const w = createWalk('gameworld-khawass', { foreign: QAWASIM_WORDS, foreignNumbers: QAWASIM_NUMBERS });
const { expect, check } = w;
/** The way out of any screen of the world: the top bar's ✕, the forge's own ✕, the ✕ drawn over a dialog. */
const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };

await w.run(async () => {
  const { page } = await w.student({ uid: 9801, lessonId: ID, url: URL });
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
  /** Forges on bridge i with the held mould; a prediction is answered with `guess` (the true remainder when omitted). */
  const forge = async (i, guess) => {
    await toAltar(i);
    await act();
    if ((await st()).overlay === 'predict') {
      const o = (await st()).o;
      await page.click(`[data-di-predict="${guess ?? o.a % o.b}"]`);
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
      expect(
        !(await st()).stars[id],
        `planks of ${wrong} leave cells over ${a} (${a} = ${wrong} × ${Math.floor(a / wrong)} + ${a % wrong}): the bridge crumbles`,
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
        'button, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-scene, .iq-found li, .iq-ptable, .iq-psay, .iq-values-row, .iq-chips, .iq-sheet, .iq-deck, .iq-slot',
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
      // the words drawn in the scene (SVG text) are read too
      for (const el of frame.querySelectorAll('svg text')) {
        const r = el.getBoundingClientRect();
        // the box of a line of text drawn at 12 px is about 0.9 of its size high
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

  /**
   * The ✕ is CLICKED: the student really leaves the lesson (the world is gone, the address is another page). Then he
   * opens the lesson again and presses the title's button, which now offers to RESUME. Where he is then is the caller's
   * to check.
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
    (await page.textContent('.di-title h1')).includes('جسور المرفأ') &&
      (await page.textContent('.di-title__eyebrow')).includes('خواص قواسم عدد طبيعي'),
    'the title screen is this lesson’s own story (« جسور المرفأ », « خواص قواسم عدد طبيعي »)',
  );
  await shot('title');
  await page.click('[data-di-start]');
  await page.waitForTimeout(1200);
  expect((await st()).phase === 'play', 'the game starts in play phase');
  await shot('start');

  // ── island A → B: one plank of 7 on 21 (no prediction on the first bridge) ──
  await bridge(0, 'g21', 21, null, 7);
  await shot('g21');
  await cross(0);
  await page.waitForTimeout(400);
  expect(
    (await st()).stage === 1 && (await st()).held == null,
    'on the second island the mould is not kept: he must choose',
  );
  // ── the ✕ of the WORLD, clicked on island B: he leaves, comes back, and is on island B with his bridge built ──
  await leaveAndReturn('in the world, on island B', ['.di-top a.di-icon', '.di-top [data-di-exit]']);
  {
    const s = await st();
    expect(
      s.phase === 'play' && s.stage === 1 && s.overlay == null && s.stars.g21 >= 1 && s.held == null,
      `he is back WHERE HE WAS: island B, the bridge of 21 still built, no mould in hand (${JSON.stringify({ phase: s.phase, stage: s.stage, overlay: s.overlay, g21: s.stars.g21 })})`,
    );
    await ff(0.3);
    const at = await page.evaluate(() => window.__world.hero.island);
    expect(at === 1, `the hero stands on island B (island ${at})`);
    await shot('back-on-island-b');
  }
  // 35: a wrong mould, then the one that filled 21
  await take(4);
  await toAltar(1);
  await act();
  expect((await st()).overlay === 'predict', 'bridge 35: the world asks his prediction before it builds');
  await shot('predict');
  {
    const o = (await st()).o;
    await page.click(`[data-di-predict="${o.a % o.b}"]`);
    await ff(9);
  }
  expect(!(await st()).stars.g35, 'planks of 4 leave 3 cells over 35: the bridge crumbles');
  await bridge(1, 'g35', 35, null, 7);
  await cross(1);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 1 🧩 « المجموع والفرق » — JOIN ══════════════════════════
  expect(
    (await st()).stage === 2 && (await st()).overlay === 'forge',
    'island C « اللصق والقصّ » opens the first forge',
  );
  await opensOnQuestion('jam-wal-farq', 'join');
  {
    const s0 = await iq();
    expect(
      s0.a === 21 && s0.b === 35 && s0.d === 7 && s0.op === 'sum' && s0.stage === 'guess',
      'it starts from HIS two bridges: 21 and 35 with the plank 7, glued',
    );
    await forgeTools('forge 1, the investigation');
    await inquiryFits('join-start');
    // ── the ✕ of the FORGE, clicked after his first answer: he leaves; back, the same mirror waits for him ──
    await page.click('[data-iq-say="yes"]');
    await page.waitForSelector('[data-iq-next]');
    expect((await page.locator('[data-iq-found] li').count()) === 1, 'he answered the first pair: one line found');
    await leaveAndReturn('inside forge 1', ['.rf-root [data-di-exit]']);
    await ff(1.5);
    await page.waitForSelector('[data-rf="inquiry"]', { timeout: 15000 });
    {
      const s = await st();
      expect(
        s.stage === 2 && s.overlay === 'forge' && s.keys.length === 0 && s.stars.g35 >= 1,
        'he is back WHERE HE WAS: island C, in front of its mirror — the forge opens again by itself, no key skipped',
      );
      await opensOnQuestion('jam-wal-farq', 'join');
      const again = await iq();
      expect(
        again.a === 21 &&
          again.b === 35 &&
          again.stage === 'guess' &&
          (await page.locator('[data-iq-found] li').count()) === 0,
        'the experiment starts again from HIS two bridges (21 and 35): nothing half-done is kept, nothing is given',
      );
      await inquiryFits('join-start-again');
    }
    const fills = (s) => (s.op === 'sum' ? s.a + s.b : s.a - s.b) % s.d === 0;
    let n = 0;
    while ((await iq()).stage === 'guess') {
      const s = await iq();
      const truth = fills(s);
      // the FIRST round: he says « no » — the glued gap is filled anyway; every other round as the arithmetic says
      const say = n === 0 ? !truth : truth;
      const heard = await hear(async () => {
        await page.click(`[data-iq-say="${say ? 'yes' : 'no'}"]`);
        await page.waitForSelector('[data-iq-next]');
      });
      const t = await iq();
      expect(
        t.stage === 'seen' && t.holds === truth && t.value === (s.op === 'sum' ? s.a + s.b : s.a - s.b),
        `join ${n + 1}: ${s.a} ${s.op === 'sum' ? '+' : '−'} ${s.b} = ${t.value} with the plank ${s.d} — ${truth ? 'filled' : 'a piece left'}`,
      );
      check(
        heard.includes('sweep') &&
          heard.includes(s.op === 'sum' ? 'plank' : 'hit') &&
          heard.at(-1) === (truth ? 'success' : 'crumble'),
        `join ${n + 1}: heard — the strips move, the planks are laid again (${s.op === 'sum' ? 'plank' : 'hit'}), ${truth ? 'success' : 'crumble'} (${[...new Set(heard)].join(', ')})`,
      );
      const f = await fact();
      if (n === 0) {
        expect(
          f.includes('لم يكن هذا توقّعك'),
          'join 1: he said « no »: the strips answer with the fact, beside his prediction — never « wrong »',
        );
        await inquiryFits('join-wrong-pick');
      } else check(f.includes('كما توقّعت'), `join ${n + 1}: « كما توقّعت »`);
      if (s.op === 'diff' && n === 1) await inquiryFits('join-cut');
      if (s.a % s.d !== 0 && s.b % s.d !== 0 && truth) {
        check(
          (await page.locator('[data-iq-found] li').count()) === n + 1,
          'a glued gap filled although neither part is: shown, and kept in his list',
        );
        await inquiryFits('join-foil');
      }
      n += 1;
      if ((await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي')) break;
      await page.click('[data-iq-next]');
    }
    expect(
      n === 6 && (await page.locator('[data-iq-found] li').count()) === 6,
      'six pairs of gaps glued or cut, all kept on screen',
    );
    await inquiryFits('join-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    expect(
      (await page.locator('[data-rf-row][data-rf-own="1"]').count()) === 6,
      'only now he WRITES his rule — the mirror will test it on the six gaps HE made',
    );
    // ── « ساعدني يا زيرو »: the robot gives no rule and picks no tile — the mirror builds two gaps to look at ──
    expect(
      (await page.locator('[data-rf-help]:not([disabled])').count()) === 1 &&
        (await page.getAttribute('.rf-root', 'data-rf-nudges')) === '0',
      'while he writes his rule, « ساعدني يا زيرو » is offered — not used yet',
    );
    {
      const heard = await hear(async () => {
        await page.click('[data-rf-help]');
        await page.waitForSelector('[data-rf-nudge="experiment"]');
        await page.waitForFunction(() => window.__forge?.help?.running === false, null, { timeout: 20000 });
      });
      const f = await fg();
      const built = f.rows.filter((r) => r.mirror);
      expect(
        (await page.getAttribute('.rf-root', 'data-rf-nudges')) === '1' &&
          f.help.cases.length === 2 &&
          built.length === 2 &&
          built.every((c) => c.held === ((c.op === 'sum' ? c.A + c.B : c.A - c.B) % c.d === 0)),
        `the help is an EXPERIMENT: the mirror built two gaps in front of him (${built.map((c) => `${c.A} ${c.op === 'sum' ? '+' : '−'} ${c.B} with ${c.d}`).join(' ; ')}) and they joined his evidence`,
      );
      expect(
        (await page.locator('[data-rf-choice]').count()) === 0 && Object.values(f.rule).every((v) => v == null),
        'the help never narrows to a choice of rules, and it picked no tile for him',
      );
      const bubble = (await page.textContent('[data-rf-nudge]')) ?? '';
      expect(
        bubble.trim().length > 20 && !/كلتيهما|قاعدة|القاعدة/.test(bubble),
        `what the robot says is a thing to LOOK at, never the rule (« ${bubble.trim().slice(0, 60)} »)`,
      );
      check(
        (await page.locator('[data-rf-row][data-rf-own="0"]').count()) >= 1,
        'the gaps the mirror built are in his list, marked as the mirror’s',
      );
      check(
        heard[0] === 'crystal' && heard.includes('plank') && heard.includes('success'),
        `the help is heard: the robot, the planks laid, the verdict (${[...new Set(heard)].join(', ')})`,
      );
      await forgeTools('forge 1, the help');
      await shot('forge1-help');
    }
    // « if the plank fills at least one of the gaps, it fills both new gaps »: one of his own gaps breaks it
    await page.click('[data-rf-tile="if:some"]');
    await page.click('[data-rf-tile="then:both"]');
    await shot('forge1-build');
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    expect(
      (await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted')) === 'sum:21:30:7',
      'the « one gap is enough » rule is refuted by a gap HE made: 21 + 30 = 51 with the plank 7 (51 = 7 × 7 + 2)',
    );
    await shot('forge1-refuted');
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    // ── a rule his own gaps AGREE with, broken by a new one: « if the plank fills neither gap, it fills the glued one » —
    //    what 22 + 20 = 42 invites. Only one of his gaps is of that kind, and it held ──
    await page.click('[data-rf-tile="if:none"]');
    await page.click('[data-rf-tile="then:sum"]');
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]');
    expect(
      (await page.locator('[data-rf-refuted]').count()) === 0,
      'the « neither gap » rule agrees with every gap he made: the mirror cannot refute it with HIS evidence',
    );
    await page.click('[data-rf-dare]');
    await page.waitForSelector('[data-rf="attack"]');
    {
      const a = (await fg()).atk;
      const c = a.list[a.i];
      // the walk's own arithmetic on the pair the mirror chose
      const filled = (c.A + c.B) % c.d === 0;
      const id = `sum:${c.A}:${c.B}:${c.d}`;
      expect(
        a.list.length === 1 && c.op === 'sum' && c.A % c.d !== 0 && c.B % c.d !== 0 && !filled,
        `the mirror attacks with a pair the rule speaks of and gets wrong: the plank ${c.d} fills neither ${c.A} nor ${c.B}, and not ${c.A + c.B} either (${c.A + c.B} = ${c.d} × ${Math.floor((c.A + c.B) / c.d)} + ${(c.A + c.B) % c.d})`,
      );
      expect(
        (await page.locator(`[data-rf-row="${id}"]`).count()) === 0 && c.A + c.B >= 11,
        'it is a NEW pair, never one he made — and a gap long enough to lay planks on',
      );
      await shot('forge1-attack-false-rule');
      // he answers what the ARITHMETIC says (« not filled ») — his rule says the opposite, and the screen tells him so
      await page.click('[data-rf-say="no"]');
      await page.waitForSelector('[data-rf-rule-says]');
      expect(
        (await page.getAttribute('[data-rf-rule-says]', 'data-rf-rule-says')) === 'yes' &&
          (await page.textContent('[data-rf-rule-says]')).includes('قاعدتك تقول غير ذلك'),
        'he said « لا يملؤها »: « قاعدتك تقول غير ذلك » — HIS rule says the plank fills it, in its own words',
      );
      await shot('forge1-attack-not-his-rule');
      const heard = await hear(async () => {
        await page.click('[data-rf-fire]');
        await page.waitForSelector('[data-rf-broken]');
      });
      const broken = (await page.textContent('[data-rf-broken]')) ?? '';
      expect(
        (await page.getAttribute('[data-rf-broken]', 'data-rf-broken')) === id &&
          (await page.locator('[data-rf-survived]').count()) === 0 &&
          (await page.locator('[data-rf-attack-next]').count()) === 0 &&
          (await page.locator('[data-rf-seal]').count()) === 0,
        `the rule BREAKS on ${c.A} + ${c.B} with the plank ${c.d}: no seal, no next challenge — only « أصلح قاعدتي »`,
      );
      expect(
        broken.includes('انكسرت') && broken.includes('يملؤها') && !/خطأ|خاطئ/.test(broken),
        `the verdict is what the plank did, never « wrong » (« ${broken.trim().slice(0, 70)} »)`,
      );
      check(heard.at(-1) === 'crumble', `the broken bridge is heard (${[...new Set(heard)].join(', ')})`);
      await forgeTools('forge 1, the broken rule');
      await shot('forge1-broken');
      await page.click('[data-rf-fix]');
      await page.waitForSelector('[data-rf="build"]');
      expect(
        (await fg()).rows.some((r) => r.mirror && r.op === 'sum' && r.A === c.A && r.B === c.B && r.d === c.d),
        'the gap that broke his rule joins his evidence: the next rule will be tested on it too',
      );
    }
    await finishForge('forge1', ['if:both', 'then:both'], async (u) => {
      expect(
        (await page.getAttribute('.rf-root', 'data-rf-tries')) === '3' &&
          (await page.getAttribute('.rf-root', 'data-rf-nudges')) === '1',
        'the forge kept how the rule was found: three rules tested, one help',
      );
      const [p, q] = [u.A / u.d, u.B / u.d];
      expect(
        (await fillUse({ x: p + q, y: p - q + 1 })) === 'diff',
        `the last step: ${u.A} − ${u.B} = ${u.d} × ${p - q + 1} is refused (the count of the cut)`,
      );
      await shot('forge1-use');
      expect(
        (await fillUse({ x: p + q, y: p - q })) === 'ok',
        `${u.A} + ${u.B} = ${u.d} × ${p + q} and ${u.A} − ${u.B} = ${u.d} × ${p - q}, without dividing`,
      );
    });
  }
  await shot('tablet-1');
  expect(
    (await page.textContent('[data-di-my-rule]')).includes('الهوّتين كلتيهما') &&
      (await page.textContent('.di-card')).includes('المجموع والفرق'),
    'the tablet names the rule after HIS own: « المجموع والفرق »',
  );
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 1, 'one key earned');

  // ── 56 (21 and 35 glued) with the plank 7, then 18 ──
  await bridge(2, 'g56', 56, 6, 7);
  await cross(2);
  await page.waitForTimeout(500);
  expect((await st()).stage === 3, 'island D');
  await bridge(3, 'g18', 18, 4, 6);
  await cross(3);
  await page.waitForTimeout(500);

  // ══════════════════════════ forge 2 ✖️ « المضاعفات » — STACK ══════════════════════════
  expect((await st()).stage === 4 && (await st()).overlay === 'forge', 'island E « الأبراج » opens the second forge');
  await opensOnQuestion('madaaf', 'stack');
  {
    const s0 = await iq();
    expect(
      s0.d === 6 && s0.base === 18 && s0.k === 2 && s0.mode === 'full',
      'it starts from the gap he just crossed: 18 with the plank 6, two copies drawn',
    );
    await inquiryFits('stack-start');
    let n = 0;
    const modes = new Set();
    while ((await iq()).stage === 'guess') {
      const s = await iq();
      const truth = (s.k * s.base) % s.d === 0;
      // the wrong pick: two copies of 21 with the plank 14 — he says « no » (14 does not fill 21), and they are filled
      const wrong = s.d === 14 && s.k === 2;
      const heard = await hear(async () => {
        await page.click(`[data-iq-say="${(wrong ? !truth : truth) ? 'yes' : 'no'}"]`);
        await page.waitForSelector('[data-iq-next]');
      });
      const t = await iq();
      modes.add(t.mode);
      expect(
        t.stage === 'seen' && t.holds === truth,
        `stack ${n + 1}: ${s.k} × ${s.base} = ${s.k * s.base} with the plank ${s.d} — ${truth ? 'filled' : 'a piece left'}`,
      );
      check(
        heard.at(-1) === (truth ? 'success' : 'crumble') &&
          (t.mode === 'line' || heard.includes(t.mode === 'full' ? 'plank' : 'sweep')),
        `stack ${n + 1}: heard (${[...new Set(heard)].join(', ')})`,
      );
      if (t.mode === 'line') {
        expect(
          (await page.locator('[data-iq-numline]').count()) === 1,
          `stack: ${s.k} copies are too many to draw — only a number line « ${s.k} × ${s.base} »`,
        );
        await inquiryFits('stack-numline');
      }
      if (t.mode === 'packed') await inquiryFits('stack-packed');
      if (wrong) {
        expect(
          (await fact()).includes('لم يكن هذا توقّعك'),
          'two copies of 21 with the plank 14: he said « no », they are filled (42 = 14 × 3) — the fact beside his prediction',
        );
        await inquiryFits('stack-wrong-pick');
      }
      n += 1;
      if ((await page.textContent('[data-iq-next]')).includes('أكتب قاعدتي')) break;
      await page.click('[data-iq-next]');
    }
    expect(
      n === 6 && modes.has('full') && modes.has('packed') && modes.has('line'),
      `six rows of copies — drawn, packed and on a number line (${[...modes].join(', ')})`,
    );
    await inquiryFits('stack-found');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-rf="build"]');
    expect(
      (await page.locator('[data-rf-row][data-rf-own="1"]').count()) === 6,
      'only now he WRITES his rule — on the six rows HE glued',
    );
    // « if the plank fills two copies glued, it fills any number of them »: 3 copies of 21 with 14 break it (63 = 14 × 4 + 7)
    await page.click('[data-rf-tile="if:two"]');
    await page.click('[data-rf-tile="then:all"]');
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted]');
    expect(
      (await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted')) === '14:21:3',
      'the « two copies are enough » rule is refuted by HIS row: three copies of 21 with the plank 14 (63 = 14 × 4 + 7)',
    );
    await forgeTools('forge 2, the mirror');
    await shot('forge2-refuted');
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');
    await finishForge('forge2', ['if:gap', 'then:all'], async (u) => {
      const k = (u.k * u.base) / u.d;
      expect(
        (await fillUse({ x: k + 1 })) === 'count',
        `the last step: ${u.k} × ${u.base} = ${u.d} × ${k + 1} is refused`,
      );
      await shot('forge2-use');
      expect((await fillUse({ x: k })) === 'ok', `${u.k} × ${u.base} = ${u.d} × ${k}, without dividing`);
    });
  }
  await shot('tablet-2');
  expect((await page.textContent('.di-card')).includes('المضاعفات'), 'the tablet: « المضاعفات »');
  await page.click('[data-di-tablet]');
  await ff(0.3);
  expect((await st()).keys.length === 2, 'two keys earned');

  // ── 54 (18 three times), then the dash of island F ──
  await bridge(4, 'g54', 54, 4, 6);
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

  // ══════════════════════════ forge 3 🧮 « باقي القسمة » — PEEL ══════════════════════════
  expect((await st()).stage === 6 && (await st()).overlay === 'forge', 'island G « البقايا » opens the third forge');
  await opensOnQuestion('baqi-qisma', 'peel');
  {
    const s0 = await iq();
    expect(
      s0.stage === 'start' && s0.a === 735 && s0.b === 280 && (await page.locator('[data-iq-peel]').count()) === 1,
      'it starts on the long gap 735 and the bridges of 280: one button lays them',
    );
    await inquiryFits('peel-start');
    let n = 0;
    for (let guard = 0; guard < 20; guard += 1) {
      const s = await iq();
      if (s.stage === 'start') {
        const heard = await hear(async () => {
          await page.click('[data-iq-peel]');
          await page.waitForSelector('[data-iq-say]');
        });
        const t = await iq();
        expect(
          t.q === Math.floor(t.a / t.b) && t.r === t.a % t.b,
          `peel ${t.a} by ${t.b}: ${t.q} bridges laid, a piece of ${t.r} left (${t.a} = ${t.b} × ${t.q} + ${t.r})`,
        );
        check(
          heard.filter((x) => x === 'plank').length === t.q && heard.at(-1) === 'gate',
          `peel ${t.a}: a sound per bridge laid, a chime when the piece is left (${heard.join(', ')})`,
        );
        await inquiryFits(`peel-${t.a}-piece`);
        continue;
      }
      if (s.stage === 'guess') {
        const truth = s.r % s.d === 0;
        const say = n === 0 ? !truth : truth; // the first plank (5 on 175): he says « no » — it fills the piece
        await page.click(`[data-iq-say="${say ? 'yes' : 'no'}"]`);
        await page.waitForSelector('[data-iq-next]');
        const r = await page.getAttribute(`[data-iq-row="${s.a}:${s.b}:${s.d}"] [data-iq-r]`, 'data-iq-r');
        expect(r === (truth ? '1' : '0'), `plank ${s.d} on the piece ${s.r}: the table writes ${truth ? '✓' : '✗'}`);
        if (n === 0) {
          expect(
            (await fact()).includes('لم يكن هذا توقّعك') && (await page.locator('.iq-pcol .is-missed').count()) === 1,
            'he said « no » for the plank 5: the piece is filled — the fact beside his prediction, the cell marked',
          );
          await inquiryFits('peel-wrong-pick');
        }
        n += 1;
        await page.click('[data-iq-next]');
        continue;
      }
      break;
    }
    expect(
      (await iq()).stage === 'claim' && n === 9,
      `nine planks judged on two gaps (${n}); now he builds his claim from the columns`,
    );
    await inquiryFits('peel-claim-empty');
    // a wrong claim: « if the plank fills the gap, it fills the piece » — the table outlines the planks that refute it
    await page.click('[data-iq-col="a"]');
    const f0 = await fact();
    const intruders = [
      [735, 280, [5, 10, 21, 7, 14, 35]],
      [100, 42, [2, 5, 3]],
    ].flatMap(([a, b, ds]) => ds.filter((d) => a % d === 0 && (a % b) % d !== 0));
    expect(
      (await page.getAttribute('[data-iq-fact]', 'data-iq-ok')) === '0' &&
        (await page.locator('.iq-pcol.is-intruder').count()) === intruders.length &&
        (await page.locator('[data-iq-seal]').count()) === 0,
      `« fills the gap » takes in planks that do not fill the piece (${intruders.join(', ')}): outlined in the table, no seal [ok=${await page.getAttribute('[data-iq-fact]', 'data-iq-ok')} outlined=${await page.locator('.iq-pcol.is-intruder').count()} seal=${await page.locator('[data-iq-seal]').count()}]`,
    );
    expect(
      intruders.every((d) => f0.includes(String(d))),
      `the table names them (« ${f0.trim().slice(0, 70)} »), never « wrong »`,
    );
    await inquiryFits('peel-claim-wrong');
    await page.click('[data-iq-col="b"]');
    await page.click('[data-iq-link="or"]');
    expect(
      (await page.getAttribute('[data-iq-fact]', 'data-iq-ok')) === '0',
      '« the gap OR the bridge »: still planks that do not fill the piece',
    );
    await page.click('[data-iq-link="and"]');
    expect(
      (await page.getAttribute('[data-iq-fact]', 'data-iq-ok')) === '1' &&
        (await page.locator('.iq-pcol.is-intruder').count()) === 0 &&
        (await page.locator('[data-iq-seal]').count()) === 1,
      '« the gap AND the bridge »: every plank it takes fills the piece — he may seal it',
    );
    await inquiryFits('peel-claim-right');
    await page.click('[data-iq-seal]');
    expect(
      (await page.locator('[data-rf-tile]').count()) === 0,
      'what he claimed IS his rule: no tile is offered, the mirror attacks it at once',
    );
    await forgeTools('forge 3, the attack');
    await attackToTablet('forge3', async (u) => {
      const [q, r] = [Math.floor(u.A / u.B), u.A % u.B];
      expect(
        (await fillUse({ q, r, k: r / u.d + 1 })) === 'k',
        `the last step: the division ${u.A} = ${u.B} × ${q} + ${r} is right, the count of planks in the piece is not`,
      );
      await shot('forge3-use');
      expect(
        (await fillUse({ q, r, k: r / u.d })) === 'ok',
        `${r} = ${u.d} × ${r / u.d}: the piece read before it is built`,
      );
    });
  }
  await shot('tablet-3');
  expect((await page.textContent('.di-card')).includes('باقي القسمة'), 'the tablet: « باقي القسمة »');
  await page.click('[data-di-tablet]');
  await ff(0.3);

  // ── the bridge the third key READS: the piece 175 laid on the bridge 280 leaves 105. Of the moulds, 10 and 14 fill
  //    280 only (the lesson's trap); 35 fills 280 and 175 — so it fills what is left ──
  {
    const next = 280 % (735 % 280);
    const moulds = await page.evaluate(() => {
      const g = window.__world;
      return { a: g.segs[6].a, id: g.segs[6].id, b: g.isl[6].pedestals.map((p) => p.b) };
    });
    expect(
      next === 105 && moulds.a === next && moulds.id === 'g105',
      `the gap after the key is what 280 leaves under the piece 175: 280 = 175 × 1 + ${next}`,
    );
    const fillsBoth = moulds.b.filter((b) => 280 % b === 0 && 175 % b === 0);
    expect(
      moulds.b.length === 3 &&
        fillsBoth.length === 1 &&
        moulds.b.filter((b) => next % b === 0).join() === fillsBoth.join(),
      `its moulds are ${moulds.b.join(', ')}: ONE fills the bridge and the piece (${fillsBoth.join()}) — and it alone fills ${next}`,
    );
    const said =
      ((await page.locator('.di-say').count()) ? await page.locator('.di-say').first().textContent() : '') ?? '';
    check(
      ['175', '280', String(next)].every((x) => said.includes(x)),
      `the robot says where the gap comes from — the piece 175 on the bridge 280 — so the key can read it (« ${said.trim().slice(0, 70)} »)`,
    );
    // a mould that fills the bridge ONLY (14: 280 = 14 × 20, 175 = 14 × 12 + 7) leaves cells; the mould of both holds
    await bridge(6, 'g105', next, 14, fillsBoth[0]);
    await shot('g105');
  }
  await cross(6);
  await ff(2.5);
  await page.waitForTimeout(400);
  {
    const s = await st();
    expect(
      s.stage === 7 && s.overlay === 'quiz' && s.o.id === 'harbour',
      'island H « الحجر »: the stone asks the harbour’s question first',
    );
    const opts = await page
      .locator('[data-di-option]')
      .evaluateAll((els) => els.map((e) => Number(e.dataset.diOption)));
    // the walk's own arithmetic: what is made of 735 and 280 by gluing, cutting, repeating or what a division leaves
    const right = [735 + 280, 735 - 280, 2 * 280, 735 % 280];
    expect(
      opts.length === 5 &&
        right.every((v) => opts.includes(v)) &&
        opts.every((v) => (v % 35 === 0) === right.includes(v)),
      `the stone offers ${opts.join(', ')}: exactly those made of the two bridges are filled by 35`,
    );
    await shot('stone');
    const odd = opts.find((v) => !right.includes(v));
    await page.click(`[data-di-option="${odd}"]`);
    await page.click('[data-di-check]');
    await page.waitForTimeout(250);
    expect(
      (await page.textContent('.di-feedback')).includes(String(odd)),
      `${odd} chosen: the stone says what ${odd} is made of — never the answer`,
    );
    await shot('stone-wrong');
    await page.click(`[data-di-option="${odd}"]`);
    for (const v of right) await page.click(`[data-di-option="${v}"]`);
    await page.click('[data-di-check]');
    await page.waitForTimeout(500);
  }

  // ══════════════════════════ forge 4 ✍️ « البرهان » — LETTERS ══════════════════════════
  expect((await st()).overlay === 'forge', 'the stone answered: its mirror opens');
  await opensOnQuestion('burhan', 'letters');
  {
    const v0 = await page.locator('[data-iq-values]').textContent();
    expect(
      (await iq()).stage === 'numbers' && (await iq()).si === 0 && ['7', '21', '35'].every((x) => v0.includes(x)),
      'it starts from island A: d = 7, a = 21, b = 35',
    );
    // the word that names what he is about to find is NOT on screen before he finds it: the island, the mirror, the stone
    const beforeProof = await page.evaluate(() => document.body.innerText);
    check(
      !/حروف|بالحروف|برهان|البرهان/.test(beforeProof) && beforeProof.includes('الحجر'),
      'during the experiment nothing on screen says « حروف » or « برهان »: the island is « جزيرة الحجر »',
    );
    await inquiryFits('letters-numbers');
    // a wrong press, then the right one — computed here: (a + b) ÷ d
    const sample = async () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-iq-values] .iq-val annotation')].map((x) => x.textContent),
      );
    const valueOf = (list, k) => {
      const m = list.map((t) => t.match(new RegExp(`^(?:\\\\displaystyle )?${k} = (\\d+)`))).find(Boolean);
      return m ? Number(m[1]) : null;
    };
    {
      const s = await sample();
      const [d, a, b] = ['d', 'a', 'b'].map((k) => valueOf(s, k));
      expect(d === 7 && a === 21 && b === 35, `the numbers are read from the screen (${s.join(' · ')})`);
      const q = (a + b) / d;
      const heard = await hear(async () => {
        await page.click(`[data-iq-q="${q - 1}"]`);
      });
      expect(
        (await fact()).includes(String(d * (q - 1))) && heard.includes('fail'),
        `${q - 1} pressed: the screen says ${d} × ${q - 1} = ${d * (q - 1)}, beside ${a + b}`,
      );
      await inquiryFits('letters-miss');
      const heard2 = await hear(async () => {
        await page.click(`[data-iq-q="${q}"]`);
        await page.waitForSelector('[data-iq-next]');
      });
      expect(
        heard2.includes('key') && (await page.locator('[data-iq-found] li').count()) === 1,
        `${a} + ${b} = ${d} × ${q}: checked, kept in his list`,
      );
      await page.click('[data-iq-next]');
    }
    {
      const s = await sample();
      const [d, a, b] = ['d', 'a', 'b'].map((k) => valueOf(s, k));
      expect(
        (await fact()).includes('أعداد جديدة'),
        'new numbers: his last line is put against them — it does not carry over',
      );
      await inquiryFits('letters-carry');
      await page.click(`[data-iq-q="${(a + b) / d}"]`);
      await page.waitForSelector('[data-iq-next]');
      await page.click('[data-iq-next]');
    }
    expect(
      (await iq()).hidden && (await page.locator('[data-iq-q]').count()) === 0 && (await fact()).includes('مخفيّ'),
      'then a number is HIDDEN: nothing to compute',
    );
    await inquiryFits('letters-hidden');
    await page.click('[data-iq-next]');
    await page.waitForSelector('[data-iq-deck]');
    expect(
      (await iq()).stage === 'cards' &&
        (await page.locator('[data-iq-card]').count()) === 9 &&
        (await page.locator('[data-iq-slot]').count()) === 5,
      'the cards: nine in the deck, five slots on the sheet',
    );
    await inquiryFits('letters-cards');
    // a false line: answered by numbers where it does not hold
    let heard = await hear(async () => {
      await page.click('[data-iq-card="times"]');
    });
    expect(
      (await page.getAttribute('[data-iq-fact]', 'data-iq-said')) === 'false' &&
        heard.includes('crumble') &&
        (await page.locator('[data-iq-card="times"].is-refuted').count()) === 1,
      '« a + b = d × k × k′ »: the world shows numbers where it is false',
    );
    await inquiryFits('letters-false-card');
    // a line placed too early: it uses k and k′ that no line above has written
    heard = await hear(async () => {
      await page.click('[data-iq-card="sum"]');
    });
    expect(
      (await page.getAttribute('[data-iq-fact]', 'data-iq-said')) === 'early' &&
        heard.includes('fail') &&
        (await page.getAttribute('[data-iq-slot="0"]', 'data-iq-card-in')) === '',
      'the sum line first: refused — it uses what no line above wrote',
    );
    await inquiryFits('letters-early-card');
    for (const [i, id] of ['ka', 'kb', 'sum', 'fact', 'end'].entries()) {
      await page.click(`[data-iq-card="${id}"]`);
      expect(
        (await page.getAttribute(`[data-iq-slot="${i}"]`, 'data-iq-card-in')) === id,
        `line ${i + 1}: « ${id} » placed`,
      );
    }
    expect(
      (await iq()).stage === 'proved' && (await page.locator('[data-iq-done]').count()) === 1,
      'the sheet is complete: every line came from the ones above it',
    );
    await inquiryFits('letters-proved');
    await page.click('[data-iq-done]');
    expect(
      (await page.locator('[data-rf-tile]').count()) === 0,
      'the proof he assembled IS his rule: the mirror attacks it at once',
    );
    await attackToTablet('forge4', async (u) => {
      const [x, y] = [3 * u.k + 2 * u.k2, u.k + u.k2];
      expect((await fillUse({ x: x + 1, y })) === 'mix', `the last step: 3a + 2b = d × ${x + 1} is refused`);
      await shot('forge4-use');
      expect((await fillUse({ x, y })) === 'ok', `3a + 2b = d × ${x} and a + b = d × ${y}, with letters`);
    });
  }
  await shot('tablet-4');
  {
    const card = await page.textContent('.di-card');
    expect(
      card.includes('البرهان') && card.includes('بحروف'),
      'the tablet: « البرهان » — the words « بحروف » come NOW, after he assembled the proof',
    );
    // ONE pair of letters from his cards to his tablet: k and k′ (q is the quotient of the tablet before)
    const formulas = await page.evaluate(() =>
      [...document.querySelectorAll('.di-card annotation')].map((x) => x.textContent),
    );
    check(
      formulas.some((f) => f.includes("k'")) && !formulas.some((f) => /(^|[^a-z\\])[pq]([^a-z]|$)/.test(f)),
      `the tablet writes the proof with the letters of his cards, k and k′ (${formulas.filter((f) => /k/.test(f)).join(' · ')})`,
    );
  }
  await page.click('[data-di-tablet]');
  await ff(0.5);
  expect((await st()).keys.length === 4, 'four keys earned, all forged');

  // ══════════════════════════ the last bridge: 1015 = 735 + 280, planks of 30 or 35 ══════════════════════════
  await toAltar(7);
  await page.waitForTimeout(600);
  await act();
  await page.waitForTimeout(400);
  expect(
    (await st()).overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes('1015'),
    'the store opens on the lesson’s problem: 1015 cells',
  );
  expect(
    (await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => e.dataset.diMould))).join() === '30,35',
    'the store offers the lesson’s two planks — 30 and 35 — and no other',
  );
  await shot('boss');
  await page.click('[data-di-mould="30"]');
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  expect(
    (await page.textContent('[data-di-boss-a]')).trim() === '1015',
    'the division to write starts with the gap of THIS lesson: 1015 = 30 × ▢ + ▢',
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
    const e = await bossErr(34, 0);
    expect(
      e.includes('1020') && e.includes('(1015)'),
      `34 planks of 30: « 1020 cells, longer than the gap (1015) » (${e.trim().slice(0, 60)})`,
    );
  }
  {
    const e = await bossErr(32, 55);
    expect(e.includes('أصغر من 30'), '32 planks and 55 left: « room for another plank »');
  }
  await shot('boss-divide');
  await page.fill('[data-di-q]', String(Math.floor(1015 / 30)));
  await page.fill('[data-di-r]', String(1015 % 30));
  await page.click('[data-di-check]');
  await ff(15);
  await page.waitForTimeout(400);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'choose' && o.tried[30] === 1015 % 30,
      `planks of 30 leave ${1015 % 30} cells: the store shows it tried and lets him choose again`,
    );
  }
  await shot('boss-tried');
  await page.click('[data-di-mould="35"]');
  await page.waitForTimeout(300);
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-q]', String(1015 / 35));
  await page.fill('[data-di-r]', '0');
  await page.click('[data-di-check]');
  await ff(12);
  await page.waitForTimeout(300);
  {
    const o = (await st()).o;
    expect(
      o?.type === 'boss' && o.view === 'cost' && o.q === 29,
      'the bridge of 1015 holds with 29 planks of 35: the store asks their price',
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  {
    const asked = await page.textContent('.di-card h2');
    const price = (await page.textContent('[data-di-boss-price]')).trim();
    expect(
      price === '150' && asked.includes('150') && asked.includes('29'),
      `the price in the sentence and in the equation are the SAME number (150; equation shows ${price})`,
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
      o?.type === 'boss' && o.view === 'cost' && o.q === 29,
      'the store opens again on the price of the 29 planks',
    );
  }
  if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
  await page.fill('[data-di-cost]', String(29 * 150));
  await page.click('[data-di-check]');
  await ff(0.5);
  expect(
    (await st()).overlay == null && (await st()).objective.includes('اعبر إلى المرفأ'),
    `paid ${29 * 150} دج (29 × 150): the objective says to cross to the harbour`,
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
