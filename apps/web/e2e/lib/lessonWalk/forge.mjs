// A FORGE played through its screen (kit/RuleForge.jsx, GAME_WORLD.md §2sexies): its experiment if it has one, its tiles,
// ONE false rule to its refutation (on his evidence, or broken by the mirror's first attack), the rule that holds, every
// attack answered by the walk's OWN arithmetic (`descriptor.truth[key](case)`), the seal, the last step typed wrong then
// right (`descriptor.use[key](case)` computes the answer from the numbers the step shows), the tablet.
// The tiles of the rule that holds are DERIVED: every rule the tiles can write is enumerated and the forge's `isTheRule`
// names the one (exactly one must, or the walk stops). The false rule is the right one with its last slot changed, unless
// the descriptor names one (`falseTiles[key]`).
import { noName, ownTools, pairChecks, tilesFit, lastStepLayout, WRONG_WORD } from './checks.mjs';
import { playExperiment } from './experiments.mjs';
import { q, sub, write } from './worlds/exact.mjs';

/** Every rule the tiles of `forge` can write: [{ rule, tiles }]. */
export function allRules(forge) {
  let out = [{}];
  for (const s of forge.slots) out = out.flatMap((r) => s.options.map((o) => ({ ...r, [s.id]: o.id })));
  return out.map((rule) => ({ rule, tiles: forge.slots.map((s) => `${s.id}:${rule[s.id]}`) }));
}

/** The tiles of the rule that holds, and the false rule the walk plays first. */
export function tilesOf(forge, descriptor) {
  // an experiment that WRITES the rule (`inquiry.writes`): no tile is offered, the mirror attacks his rule at once
  if (forge.inquiry?.writes) return { rule: null, right: [], wrong: [] };
  const right = allRules(forge).filter((x) => forge.isTheRule(x.rule));
  if (right.length !== 1)
    throw new Error(`forge ${forge.key}: ${right.length} rules hold — exactly one must (forges.test.js)`);
  const [{ rule, tiles }] = right;
  let wrong = descriptor.falseTiles?.[forge.key];
  if (!wrong) {
    const last = forge.slots.at(-1);
    const other = last.options.find((o) => o.id !== rule[last.id]);
    wrong = [...tiles.slice(0, -1), `${last.id}:${other.id}`];
  }
  return { rule, right: tiles, wrong };
}

/**
 * Plays the forge open on screen. ctx = { w, page, W (world gestures), L (the lesson), D (the descriptor), forbidOf(key)
 * → RegExp, forbid() → RegExp, first: true for the first forge of the story (its ✕ is clicked), startLabel, hook }.
 */
export async function playForge(ctx, key) {
  const { w, page, W, L, D } = ctx;
  const { expect, check } = w;
  const forge = L.lesson.forges[key];
  const n = L.lesson.keys.indexOf(key) + 1;
  const name = `forge${n}`;
  const fg = () => page.evaluate(() => window.__forge);
  expect(forge, `the lesson has a forge for « ${key} »`);
  const truth = D.truth?.[key];
  expect(typeof truth === 'function', `the descriptor computes the world's verdict of forge « ${key} » (truth.${key})`);
  const { rule: theRule, right, wrong } = tilesOf(forge, D);
  const writes = Boolean(forge.inquiry?.writes);
  console.log(
    writes
      ? `NOTE  forge « ${key} »: its experiment WRITES the rule — no tile, the mirror attacks at once`
      : `NOTE  forge « ${key} »: the rule that holds is ${right.join(' + ')} (derived); the false rule played: ${wrong.join(' + ')}`,
  );
  await ctx.hook(`forge:${key}:before`);

  // ── its experiment, when it has one; else it opens on its tiles ──
  if (forge.inquiry) {
    // the islands' investigation frame `.iq`; « Le palais des dalles »'s `.rq-iq`; the pyramids' `.np-iq` (worlds/*Experiments.mjs)
    await page.waitForSelector('.rf-root .iq, .rf-root .rq-iq, .rf-root .np-iq', { timeout: 15000 });
    await playExperiment(
      { w, page, name: `${name}-${forge.inquiry.mode ?? forge.inquiry.kind}`, where: 'forge', forbid: ctx.forbid },
      forge.inquiry,
    );
    await page.waitForSelector(writes ? '[data-rf="attack"]' : '[data-rf="build"]', { timeout: 15000 });
  } else {
    await page.waitForSelector('[data-rf="build"]', { timeout: 15000 });
    const f = await fg();
    const steps = await page.locator('.rf-steps li').allTextContents();
    expect(
      f.key === key &&
        f.phase === 'build' &&
        (await page.locator('.rf-root .iq').count()) === 0 &&
        (await page.locator('[data-rf-guess]').count()) === 0,
      `${name} « ${key} » opens on its TILES — no experiment screen, no prediction`,
    );
    check(
      // the step « Prédis » (kit/text.js › FORGE.steps.predict) is not shown
      !steps.some((t) => /Prédis/.test(t)),
      `${name}: the steps shown are the steps played (${steps.map((t) => t.trim()).join(' → ')})`,
    );
    check(
      f.rows.length >= 1 && f.rows.every((r) => !r.mirror),
      `${name}: his evidence is what HE did on the islands (${f.rows.length} line(s))`,
    );
  }
  const pairs = (await fg()).rows.every((r) => r.pair);
  const hear = async (fn) => {
    await page.evaluate(() => {
      const a = window.__world.audio;
      window.__heard = [];
      if (!a.__spied) {
        const real = a.play.bind(a);
        a.play = (nm, p) => {
          window.__heard.push(nm);
          return real(nm, p);
        };
        a.__spied = true;
      }
    });
    await fn();
    return page.evaluate(() => window.__heard);
  };
  const caseOf = (c) => JSON.stringify({ A: c.A, B: c.B, d: c.d, kind: c.kind, k: c.k, a: c.a, b: c.b });
  /** The world's verdict, computed HERE; the world's own (`held`) is only cross-checked against it. */
  const verdict = (c, where) => {
    const yes = Boolean(truth(c));
    check(
      yes === Boolean(c.held),
      `${where}: the walk's arithmetic and the world agree on ${caseOf(c)} (${yes ? 'yes' : 'no'})`,
    );
    return yes;
  };

  if (!writes) await tilesPart();
  async function tilesPart() {
    await ownTools(w, page, `${name}, the tiles`);
    await tilesFit(w, page, name);
    await noName(w, page, `${name}, the tiles`, ctx.forbidOf(key));
    if (pairs) await pairChecks(w, page, `${name}, the tiles`);
    if (D.notBridge?.includes(key)) {
      const log = await page.evaluate(() =>
        [...document.querySelectorAll('.rf-root [data-rf-row]')].map((r) => r.textContent.trim()),
      );
      check(
        !log.some((l) => /\bplanches?\b/i.test(l)),
        `${name} is not about a bridge: no line of its log says « planche » (A10) — ${log.join(' | ')}`,
      );
    }
    await w.shot(page, `${name}-tiles`, ctx.OUT);

    // ── the ✕ inside the first forge, a tile picked: back, the same mirror waits ──
    if (ctx.first) {
      await page.click(`[data-rf-tile="${right[0]}"]`);
      await W.leaveAndReturn(`inside ${name}`, ['.rf-root [data-di-exit]'], ctx.startLabel);
      await W.ff(1.5);
      await page.waitForSelector('[data-rf="build"]', { timeout: 15000 });
      const s = await W.st();
      expect(
        s.overlay === 'forge' && (await fg()).key === key,
        `back from the forge's ✕: the same mirror « ${key} » waits, no key skipped`,
      );
    }

    // ── a false rule: refuted on his own evidence, or broken by the mirror's first attack ──
    for (const t of wrong) await page.click(`[data-rf-tile="${t}"]`);
    await tilesFit(w, page, `${name}, a false rule`);
    await w.shot(page, `${name}-false-build`, ctx.OUT);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-refuted], [data-rf-agreed]', { timeout: 20000 });
    if (await page.locator('[data-rf-refuted]').count()) {
      const id = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
      const fb = (await page.textContent('[data-rf-refuted]')) ?? '';
      check(
        (await page.locator(`[data-rf-row="${id}"][data-rf-mark="refute"]`).count()) === 1 && !WRONG_WORD.test(fb),
        `${name}: « ${wrong.join(' + ')} » REFUTED on his own line ${id}, marked; said as a fact (« ${fb.trim().slice(0, 90)} »)`,
      );
      if (pairs) await pairChecks(w, page, `${name}, refuted`);
      await w.shot(page, `${name}-refuted`, ctx.OUT);
    } else {
      await page.click('[data-rf-dare]');
      await page.waitForSelector('[data-rf-say]');
      const c = (await fg()).atk.list[0];
      const yes = verdict(c, `${name}, the false rule's attack`);
      await page.click(`[data-rf-say="${yes ? 'yes' : 'no'}"]`);
      const heard = await hear(async () => {
        await page.click('[data-rf-fire]');
        await page.waitForSelector('[data-rf-broken]', { timeout: 20000 });
      });
      const fb = (await page.textContent('[data-rf-broken]')) ?? '';
      check(
        !WRONG_WORD.test(fb) && (await page.locator('[data-rf-attack-next], [data-rf-seal]').count()) === 0,
        `${name}: « ${wrong.join(' + ')} » agrees with his lines, BROKEN by the mirror's attack ${caseOf(c)} — only « Je corrige ma règle » (« ${fb.trim().slice(0, 90)} »)`,
      );
      check(
        heard.includes(yes ? 'success' : 'crumble'),
        `${name}: the broken rule is heard (${[...new Set(heard)].join(', ')})`,
      );
      if (pairs) await pairChecks(w, page, `${name}, broken`);
      await w.shot(page, `${name}-broken`, ctx.OUT);
    }
    await page.click('[data-rf-fix]');
    await page.waitForSelector('[data-rf="build"]');

    // ── the rule that holds: agreed, attacked, sealed ──
    for (const t of right) await page.click(`[data-rf-tile="${t}"]`);
    await page.click('[data-rf-test]');
    await page.waitForSelector('[data-rf-agreed]', { timeout: 20000 });
    await w.shot(page, `${name}-agreed`, ctx.OUT);
    await page.click('[data-rf-dare]');
    await page.waitForSelector('[data-rf="attack"]');
  }
  // the rule he holds now: the tiles' (derived), or the one his experiment wrote
  const held = writes ? (await fg()).rule : theRule;
  for (let i = 0; i < 8; i += 1) {
    const a = (await fg()).atk;
    const c = a.list[a.i];
    const yes = verdict(c, `${name}, attack ${i + 1}`);
    check(
      Boolean(forge.says(held, c)) === yes,
      `${name}, attack ${i + 1}: the rule that holds says what the world does`,
    );
    await page.click(`[data-rf-say="${yes ? 'yes' : 'no'}"]`);
    const heard = await hear(async () => {
      await page.click('[data-rf-fire]');
      await page.waitForSelector('[data-rf-survived]', { timeout: 20000 });
    });
    check(
      heard.at(-1) === (yes ? 'success' : 'crumble'),
      `${name}: attack ${i + 1} ${caseOf(c)} answered « ${yes ? 'yes' : 'no'} » — the rule survives (${[...new Set(heard)].join(', ')})`,
    );
    if (pairs) await pairChecks(w, page, `${name}, attack ${i + 1} dealt`);
    if (i === 0) await w.shot(page, `${name}-attack`, ctx.OUT);
    const end = a.i + 1 >= a.list.length;
    await page.click('[data-rf-attack-next]');
    if (end) break;
    await page.waitForSelector('[data-rf-say]');
    await page.waitForTimeout(80);
  }
  await page.waitForSelector('[data-rf-sealed]');
  await w.shot(page, `${name}-sealed`, ctx.OUT);
  await page.click('[data-rf-seal]');
  await page.waitForSelector('[data-rf="use"]');
  await page.waitForTimeout(120);

  // ── the last step: typed wrong, then right — computed from the numbers it shows ──
  const u = (await fg()).use.c;
  const solve = D.use?.[key];
  expect(typeof solve === 'function', `the descriptor computes the last step of « ${key} » (use.${key})`);
  const vals = solve(u);
  // a last step may end on two buttons « yes / no » (`use.verdict: true` in the forge, `data-rf-use-verdict`): the
  // descriptor gives it as `verdict: 'yes' | 'no'` beside the boxes
  const boxOf = (v) => Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'verdict'));
  // every box of the last step: a typed one (`data-rf-use`) or a choice among written options (`data-kit-choice`)
  const boxes = await page
    .locator('.rf-root [data-rf-use], .rf-root .rf-uselines [data-kit-choice]')
    .evaluateAll((els) => els.map((e) => e.dataset.rfUse ?? e.dataset.kitChoice));
  // the last step's figure (the kit's slot `data-rf-use-figure`): a world that measures it says so (`data-*-use-figure`)
  const figure = await page.evaluate(() => {
    const slot = document.querySelector('.rf-root [data-rf-use-figure]');
    if (!slot) return null;
    const own = [...slot.querySelectorAll('*')].find((e) =>
      Object.keys(e.dataset).some((k) => /UseFigure$/.test(k) && k !== 'rfUseFigure'),
    );
    const k = own && Object.keys(own.dataset).find((x) => /UseFigure$/.test(x));
    return { said: k ? own.dataset[k] : null, svg: Boolean(slot.querySelector('svg')) };
  });
  if (figure)
    check(
      figure.svg && (figure.said == null || figure.said === 'fits'),
      `${name}: the last step's figure is drawn and fits its room, its labels at 12 px or more (${figure.said ?? 'drawn'})`,
    );
  check(
    boxes.every((b) => b in vals) && Object.keys(boxOf(vals)).every((k) => boxes.includes(k)),
    `${name}: the walk fills every box of the last step (${boxes.join(', ')})`,
  );
  const asksVerdict = (await page.locator('.rf-root [data-rf-use-verdict]').count()) > 0;
  check(
    asksVerdict === 'verdict' in vals,
    `${name}: the descriptor answers the yes / no of the last step exactly when the screen asks it`,
  );
  await lastStepLayout(w, page, `${name}, the last step`);
  const fillUse = async (v) => {
    for (const [nm, x] of Object.entries(boxOf(v)))
      if (await page.locator(`.rf-root [data-rf-use="${nm}"]`).count())
        await page.fill(`.rf-root [data-rf-use="${nm}"]`, String(x));
      else await page.click(`.rf-root [data-kit-choice="${nm}"] [data-kit-option="${x}"]`);
    if (v.verdict) await page.click(`.rf-root [data-rf-use-verdict="${v.verdict}"]`);
    // the answer to THIS check: a feedback element left by the try before is marked first, and an accepted step may go
    // to its tablet at once (read in the page, in one wait — never an element that is gone)
    await page.evaluate(() => document.querySelector('[data-rf-use-fb]')?.setAttribute('data-walk-old', ''));
    await page.click('[data-rf-use-check]');
    const said = await page.waitForFunction(
      () => {
        const fb = document.querySelector('[data-rf-use-fb]:not([data-walk-old])');
        if (fb) return fb.dataset.rfUseFb;
        return document.querySelector('[data-di-my-rule], [data-di-tablet]') ? 'ok' : null;
      },
      null,
      { timeout: 15000 },
    );
    return said.jsonValue();
  };
  // the last TYPED box + 1 (exactly: « 57,5 » → « 58,5 »); a step of choices only answers its last choice otherwise
  const typedKeys = Object.keys(boxOf(vals)).filter((k) => /^-?[\d,./]+$/.test(String(vals[k])));
  const last = typedKeys.at(-1);
  // a step of choices only: its FIRST choice set to another of its options (the reason, before the ratios)
  const firstChoice = Object.keys(boxOf(vals)).find((k) => !typedKeys.includes(k));
  const otherOption = firstChoice
    ? await page.evaluate(
        ([k, x]) =>
          [...document.querySelectorAll(`.rf-root [data-kit-choice="${k}"] [data-kit-option]`)]
            .map((b) => b.dataset.kitOption)
            .find((id) => id !== String(x)),
        [firstChoice, vals[firstChoice]],
      )
    : null;
  const bad =
    D.useWrong?.[key]?.(u) ??
    (last
      ? { ...vals, [last]: write(sub(q(String(vals[last])), '-1')) }
      : otherOption
        ? { ...vals, [firstChoice]: otherOption }
        : { ...vals, verdict: vals.verdict === 'yes' ? 'no' : 'yes' });
  const said = await fillUse(bad);
  check(said !== 'ok', `${name}: a wrong last step is refused with its own sentence (« ${said} »)`);
  await w.shot(page, `${name}-use-wrong`, ctx.OUT);
  expect(
    (await fillUse(vals)) === 'ok',
    `${name}: the last step computed here is accepted (${JSON.stringify(vals).slice(0, 120)})`,
  );
  await page.waitForSelector('[data-di-my-rule]');

  // ── the tablet: its name, only now ──
  await w.shot(page, `tablet-${n}`, ctx.OUT);
  const title = L.lesson.rules[key].title;
  check(((await page.textContent('.di-card')) ?? '').includes(title), `the tablet: « ${title} »`);
  await page.click('[data-di-tablet]');
  // a tablet just received FLIES to « Mes règles » before it closes (kit/Tablet.jsx › flyToRules, about 0.75 s of REAL time —
  // the world's clock does not hurry a CSS transition): wait until it is gone, then let the world settle
  await page.waitForSelector('[data-di-tablet]', { state: 'detached', timeout: 4000 }).catch(() => {});
  await W.ff(0.4);
  expect((await W.st()).keys.includes(key), `the key « ${key} » earned`);
  await ctx.hook(`forge:${key}:after`);
}
