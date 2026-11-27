// The gestures of the world « L’archipel des diviseurs » (divisorIsles/Game.js), as lessons 4–6's story walks played them: the dev
// hooks move the hero and the clock (`window.__world`: time, a position — never an answer), the keys and the buttons of
// the screen do the rest. A world mechanic new to the library adds its gestures HERE (README « A world mechanic »).
export function worldOf(w, page, L) {
  const { expect, check } = w;
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
  /** What the world shows of the road (read for the question, never for the answer). */
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
        objective: s.objective ?? '',
        purse: s.purse,
        say: s.say?.text ?? '',
        verdict: s.verdict,
        overlay: s.overlay?.type ?? null,
        segs: g.segs.map((x) => ({
          id: x.id,
          a: x.a,
          complete: x.complete,
          builtWith: x.builtWith,
          standing: Boolean(x.standing),
        })),
        names: g.isl.map((x) => x.name),
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
  const promptShown = () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-di-wprompt]');
      if (!el) return false;
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });

  /** The planks lying on the pedestals of island i (a convoy without a workshop). */
  const pedestals = (i) => page.evaluate((k) => window.__world.isl[k].pedestals.map((p) => p.b), i);
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
    if (await page.locator('[data-di-workshop="typed"]').count()) return;
    await toAnvil(i);
    await act();
    await page.waitForSelector('[data-di-workshop="typed"]', { timeout: 8000 });
    await page.waitForTimeout(150);
  };
  const workshopError = () => page.textContent('[data-di-workshop-error]').catch(() => null);
  /** He types b in the open workshop and makes it (the button, or Enter). */
  const craft = async (b, how = 'button') => {
    await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', String(b));
    if (how === 'enter') await page.press('[data-di-workshop="typed"] [data-di-in="plank"]', 'Enter');
    else await page.click('[data-di-workshop="typed"] [data-di-craft]');
    await ff(0.3);
    const s = await st();
    expect(s.held === b && s.overlay == null, `the workshop makes a plank of ${b} and closes`);
  };
  /** He walks over bridge i, holding « forward ». */
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
   * Fires the held plank on bridge i; returns the GAME seconds he waited until the world was his again — or until
   * `stopOn(state)` holds (a try that opens a mirror: the world is not his again, a forge is on screen).
   */
  const fire = async (i, during, { stopOn = null } = {}) => {
    await toAltar(i);
    await act();
    expect((await st()).overlay !== 'predict', `bridge ${i}: a convoy asks no prediction before it builds`);
    const t0 = Date.now();
    let waited = 0.2;
    if (during) waited += (await during()) ?? 0;
    const busy = async () => {
      const s = await st();
      return s.phase !== 'play' && !(stopOn && stopOn(s));
    };
    for (let k = 0; k < 400 && (await busy()); k += 1) {
      await ff(0.5);
      waited += 0.5;
    }
    await page.waitForTimeout(250);
    const real = (Date.now() - t0) / 1000;
    if (real > 8) console.log(`SLOW  bridge ${i}: ${waited.toFixed(1)} s of game, ${real.toFixed(1)} s of real time`);
    return waited;
  };
  /**
   * HE WALKS BACK over the bridge `to` (GAME_WORLD.md §2ter-1 rule 3): one press on « back » turns the view and the robot;
   * a second turns both to the road ahead; a third turns him round and he holds « forward » over the bridge, steering
   * toward its axis — never a teleport. `onWay(label)` is called once, half-way (a screenshot).
   */
  const walkBack = async (to, label, onWay) => {
    const before = await road();
    const across = () =>
      page.evaluate((k) => {
        const g = window.__world;
        const h = g.hero;
        const s = g.segs[k];
        const u = (h.pos.x - s.sx) * s.dx + (h.pos.z - s.sz) * s.dz;
        const v = (h.pos.x - s.sx) * s.rx + (h.pos.z - s.sz) * s.rz;
        const off = Math.atan2(g.camDir.x, g.camDir.y) - g.heading();
        const roff = g.hero.yaw - g.heading();
        return {
          u,
          v,
          len: s.len,
          lens: Math.abs(Math.atan2(Math.sin(off), Math.cos(off))),
          robot: Math.abs(Math.atan2(Math.sin(roff), Math.cos(roff))),
        };
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
      check(
        a.lens < 0.2 && a.robot < 0.2,
        `${label}: the camera and the robot have turned round (${a.lens.toFixed(2)} / ${a.robot.toFixed(2)} rad off)`,
      );
    }
    await press();
    await ff(1.4);
    expect((await road()).facing === 1, `${label}: a second press turns him to the road ahead`);
    await press();
    await ff(0.3);
    expect((await road()).facing === -1, `${label}: pressed again, he faces back`);
    await page.keyboard.down('ArrowUp');
    let worst = 0;
    let steer = null;
    let shotTaken = !onWay;
    let toward = { pos: 'ArrowRight', neg: 'ArrowLeft' };
    let r = await road();
    // 80 steps cross a bridge; a long segment walked back (the dash's rail, `mission.refill`) gets the steps its length needs
    const steps = Math.max(80, Math.ceil((await across()).len / 0.6) + 20);
    for (let k = 0; k < steps && r.island !== to; k += 1) {
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
        await onWay(label);
        await page.keyboard.down('ArrowUp');
      }
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
    check(worst <= 0.6, `${label}: he stays on the bridge's axis (at most ${worst.toFixed(2)})`);
  };
  /** After walking back: « back » again turns him to the road ahead, then he crosses bridge i. */
  const crossAgain = async (i, label) => {
    const before = (await road()).falls;
    if ((await road()).facing === -1) {
      await page.keyboard.down('ArrowDown');
      await ff(0.1);
      await page.keyboard.up('ArrowDown');
      await ff(1.6);
      expect((await road()).facing === 1, `${label}: « back » again turns him to the road ahead`);
    }
    await cross(i);
    expect((await road()).falls === before, `${label}: he crosses without falling`);
  };
  /** The title screen, then « start » (or « resume »): returns the button's label. */
  const start = async () => {
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    const label = ((await page.textContent('[data-di-start]')) ?? '').trim();
    await page.click('[data-di-start]');
    await page.waitForTimeout(1200);
    return label;
  };
  /**
   * The ✕ is CLICKED: he really leaves the WORLD and lands on his home of the lesson (owner, 2026-11-26 — it used to be
   * the catalogue); he opens the world again and the title offers to RESUME.
   */
  const leaveAndReturn = async (where, exits, firstLabel) => {
    const sel = await w.reachable(page, exits);
    expect(sel !== null, `${where}: the ✕ is on screen and nothing covers it (${exits.join(' / ')})`);
    await page.click(sel);
    const t0 = Date.now();
    await page
      .waitForFunction(
        () => !document.querySelector('.di-root') && document.querySelector('[data-lesson-home]'),
        null,
        {
          timeout: 15000,
        },
      )
      .catch(() => {});
    const gone = await page.evaluate(() => ({
      path: location.pathname + location.search,
      world: Boolean(document.querySelector('.di-root')),
      home: document.querySelector('[data-lesson-home]')?.getAttribute('data-lesson-home') ?? null,
      enter: document.querySelector('[data-lesson-home-enter]')?.getAttribute('href') ?? null,
    }));
    expect(
      !gone.world && gone.home === L.id && !gone.path.includes('monde='),
      `${where}: the ✕ leaves the world for the lesson's home (${gone.path}, home ${gone.home}, after ${Date.now() - t0} ms)`,
    );
    check(
      Boolean(gone.enter) && L.url.endsWith(gone.enter),
      `${where}: the home's huge button goes back into the world (${gone.enter})`,
    );
    await page.goto(L.url, { waitUntil: 'domcontentloaded' });
    const label = await start();
    if (firstLabel)
      check(
        label.length > 0 && label !== firstLabel,
        `${where}: back on the lesson, the title offers to RESUME (« ${label} »)`,
      );
  };
  /** The page is RELOADED: the title, « resume », the world as the save left it. */
  const reload = async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await start();
    await ff(0.5);
  };

  return {
    ff,
    st,
    road,
    tp,
    act,
    toAltar,
    standsWith,
    until,
    chip,
    promptShown,
    pedestals,
    take,
    toAnvil,
    openWorkshop,
    workshopError,
    craft,
    cross,
    fire,
    walkBack,
    crossAgain,
    start,
    leaveAndReturn,
    reload,
  };
}
