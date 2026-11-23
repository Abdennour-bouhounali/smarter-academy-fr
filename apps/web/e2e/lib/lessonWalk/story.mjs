// THE STORY of a lesson on the world « L’archipel des diviseurs », played from its title to its end screen from the lesson's own
// `story.segments` (lessons 5–6's story walks, made data). Island by island:
//   a CONVOY (segments sharing `convoy`): the plank is taken on its head island's pedestals or MADE in its workshop; the
//     right plank is COMPUTED (it fills every gap of the convoy within its purse; several: the longest); a wrong try first
//     where the descriptor asks (`story.wrongFirst`, default the first convoy): a plank that fills the first gap only — the
//     second refuses it, the ✕ of the world there, he WALKS BACK; a plank whose first gap costs more than the purse
//     (`story.purseOut`); the workshop's bench is played by its experiment kind; a gap of 0 cells is crossed unbuilt;
//   a page RELOADED on the island `story.reloadOn` (an island index, inside a convoy): the convoy restored;
//   the FORGES the world opens on an island, in the order it opens them (lib/lessonWalk/forge.mjs);
//   the RAIL: the gate dash, each wave's gate computed by `descriptor.dash(say, gate)`;
//   the STORE (the last bridge): the plank that fills each lane computed, the other tried first, the price, the end.
// Every world screen: the instruction there, uncovered, naming no rule not forged yet (checks.mjs › worldShot).
// Hooks: `descriptor.steps['island:<id>:before' | 'convoy:<name>:before' | 'forge:<key>:before' | 'forge:<key>:after' |
// 'dash:before' | 'boss:before']` = async (ctx) => {} — run at that moment, ctx holds the page and the gestures.
import { createWalk } from '../walk.mjs';
import { worldShot, wordsRe } from './checks.mjs';
import { playExperiment } from './experiments.mjs';
import { playForge } from './forge.mjs';
import { worldOf } from './world.mjs';
import { worldOfLesson } from './worlds/index.mjs';

const fills = (n, d) => n % d === 0;
const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
/** The value of a product written with raised exponents, « 2³ × 3² × 7 » → 504 (the walk's own reading of a label). */
export const labelValue = (text) =>
  String(text)
    .split('×')
    .map((t) => t.replace(/\s/g, ''))
    .reduce((v, t) => {
      const m = t.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/);
      if (!m) return NaN;
      const e = m[2] ? Number([...m[2]].map((c) => SUP[c]).join('')) : 1;
      return v * Number(m[1]) ** e;
    }, 1);
const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

/**
 * A BRIDGE WITH A LIT STRETCH (`seg.mark`, lesson 8 — divisorIsles/mark.js), the walk's own arithmetic: planks of b
 * hold when b fills the gap AND a joint falls on the post (b divides the mark).
 */
const holdsMark = (seg, b) => fills(seg.a, b) && (!seg.mark || fills(seg.mark, b));
/** The sign of a marked bridge, as the walk writes it: the fraction in cells, then once per plank that held. */
export function signChainOf(seg, planks) {
  const chain = [[seg.mark, seg.a]];
  for (const b of planks) {
    if (!holdsMark(seg, b)) continue;
    const p = [seg.mark / b, seg.a / b];
    if (!chain.some(([n, d]) => n === p[0] && d === p[1])) chain.push(p);
  }
  return chain.map((c) => c.join('/')).join('=');
}

export async function storyWalk(L, D, opts) {
  // a lesson of another world than the islands is played by its world's own story (worlds/<world>.mjs)
  const other = worldOfLesson(L);
  if (other) return other.story(L, D, opts);
  const w = createWalk(`lesson-${L.id}-story`, opts);
  const { expect, check } = w;
  const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
  const segs = L.lesson.story.segments;
  const islands = L.lesson.story.islands;
  const convoys = L.lesson.story.convoys ?? {};
  const keys = L.lesson.keys;
  const S = D.story ?? {};
  const T0 = Date.now();
  const lap = (what) => console.log(`TIME  ${what}: ${Math.round((Date.now() - T0) / 1000)} s`);
  const waits = [];

  await w.run(async () => {
    const { page } = await w.student({ uid: D.uid ?? 9900, lessonId: L.id, url: L.url, grade: L.grade });
    const W = worldOf(w, page, L);
    /** The words of a key that no screen may show before its tablet (the descriptor's, and its tablet's title). */
    const wordsOf = (key) => [...(D.forbidden?.[key] ?? []), L.lesson.rules[key].title];
    let earned = [];
    const forbid = () =>
      wordsRe([
        ...keys.filter((k) => !earned.includes(k)).flatMap(wordsOf),
        ...(earned.length < keys.length ? (D.benchForbidden ?? []) : []),
      ]);
    const islandsForbid = () => wordsRe(keys.filter((k) => !earned.includes(k)).flatMap(wordsOf));
    const shotWorld = (label) => worldShot(w, page, label, islandsForbid(), OUT);
    const ctx = {
      w,
      page,
      W,
      L,
      D,
      OUT,
      forbid,
      forbidOf: (key) => wordsRe(wordsOf(key)),
      startLabel: null,
      first: true,
    };
    ctx.hook = async (name) => {
      const step = D.steps?.[name];
      if (step) {
        console.log(`NOTE  the lesson's own step « ${name} »`);
        await step(ctx);
      }
    };
    let facingBack = false;
    let leftWorld = false;
    let firstWorkshop = true;
    let folded = false;
    /** The planks that held each marked bridge, in his order (the walk's own record, for the sign). */
    const heldOn = {};

    /** The sign shown is the one of marked bridge i, with the planks that held it (and its strokes). */
    const sign = async (i, label) => {
      const seg = segs[i];
      const want = signChainOf(seg, heldOn[i] ?? []);
      const got = await page.evaluate(() => {
        const el = document.querySelector('[data-di-sign]');
        const s = window.__world.getState().sign;
        return {
          dom: el?.dataset.diSign ?? null,
          state: s ? s.chain.map((c) => c.join('/')).join('=') : null,
          strokes: s?.strokes ?? null,
        };
      });
      check(
        (got.dom ?? got.state) === want && JSON.stringify(got.strokes ?? null) === JSON.stringify(seg.strokes ?? null),
        `${label}: the bridge's sign reads ${want}${seg.strokes ? ` (opened on the strokes ${seg.strokes.join(' + ')})` : ''} — the world: ${got.dom ?? got.state}`,
      );
    };
    /** The instruction folds and opens again (once, on the first island). */
    const foldOnce = async (h) => {
      if (folded) return;
      folded = true;
      await page.click('[data-di-instruction-fold]');
      await page.waitForTimeout(200);
      check(
        (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'folded',
        'the instruction folds',
      );
      await shotWorld(`island-${islands[h].id}-folded`);
      await page.click('[data-di-instruction-fold]');
      await page.waitForTimeout(200);
      check(
        (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) === 'open',
        'the same button opens it again',
      );
    };
    /**
     * Planks of b, in hand, fired on marked bridge i: they fill the gap and the post stands in the middle of a plank —
     * refused (`verdict.mark`), the stretch's own division on screen (`data-di-eq-mark` = its remainder).
     */
    const postMiss = async (i, b, label) => {
      const seg = segs[i];
      const stood = (await W.road()).segs[i];
      await W.fire(i, async () => {
        expect(await W.until((r) => r.verdict != null, 60), `the world shows its verdict on ${seg.a}`);
        const v = (await W.road()).verdict;
        const eqMark = await page.getAttribute('[data-di-eq-mark]', 'data-di-eq-mark').catch(() => null);
        check(
          !v.holds && v.r === 0 && v.mark?.r === seg.mark % b && eqMark === String(seg.mark % b),
          `${seg.a} = ${b} × ${seg.a / b}, but ${seg.mark} = ${b} × ${Math.floor(seg.mark / b)} + ${seg.mark % b}: the gap is filled and the post stands in a plank — refused (verdict ${JSON.stringify(v)}, the stretch's line ${eqMark})`,
        );
        const said = ((await page.textContent('.di-verdict').catch(() => '')) ?? '').trim();
        check(said.includes(String(seg.mark)), `the verdict says where the post stands (« ${said} »)`);
        await shotWorld(label);
        return 0;
      });
      const now = (await W.road()).segs[i];
      check(
        now.complete === stood.complete && now.builtWith === stood.builtWith,
        `planks of ${b} refused: the bridge is as it was (${stood.complete ? `standing with ${stood.builtWith}` : 'unbuilt'})`,
      );
      await sign(i, `after ${b} missed the post`);
    };
    /** Planks of b fired on marked bridge i hold: the equation's second line shown while it is built; the sign grows. */
    const markHold = async (i, b, label) => {
      const seg = segs[i];
      let lines = null;
      const t = await W.fire(i, async () => {
        // the stretch's own division, once the planks have passed the post
        let s = 0;
        for (let k = 0; k < 120; k += 1) {
          const eq = await page.evaluate(() => window.__world.getState().equation);
          if (eq?.mark?.shown || !eq) break;
          await W.ff(0.25);
          s += 0.25;
        }
        lines = await page.evaluate(() => ({
          main: Boolean(document.querySelector('.di-eq')),
          mark: document.querySelector('[data-di-eq-mark]')?.dataset.diEqMark ?? null,
        }));
        if (label) await shotWorld(label);
        return s;
      });
      if (seg.a / b > 30) waits.push(`${b} on ${seg.a} (${seg.a / b} planks): ${t.toFixed(1)} s`);
      check(
        lines?.main && lines.mark === '0',
        `${seg.a} = ${b} × ${seg.a / b} and ${seg.mark} = ${b} × ${seg.mark / b}: the equation shows the stretch's line too (${JSON.stringify(lines)})`,
      );
      expect(await W.standsWith(i, b), `${seg.a} = ${b} × ${seg.a / b}, a joint on ${seg.mark}: the bridge holds`);
      heldOn[i] = [...(heldOn[i] ?? []).filter((x) => x !== b), b];
      await sign(i, `held with ${b}`);
    };

    // ══ the title ══
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    const title =
      typeof L.lesson.story.text?.title === 'string' ? L.lesson.story.text.title.replace(/^.*?:\s*/, '') : null;
    expect(
      !title || ((await page.textContent('.di-title h1')) ?? '').includes(title),
      `the title screen is this lesson's own story (« ${title} »)`,
    );
    if (L.config?.title)
      check(
        ((await page.textContent('.di-title__eyebrow').catch(() => '')) ?? '').includes(L.config.title),
        `the title names the lesson « ${L.config.title} »`,
      );
    await w.shot(page, 'title', OUT);
    ctx.startLabel = await W.start();
    expect((await W.st()).phase === 'play', 'the game starts in play phase');
    lap('title');

    /** Every forge the world opens on this island, in its order. */
    const forges = async () => {
      for (let n = 0; n < keys.length && (await W.st()).overlay === 'forge'; n += 1) {
        const key = await page.evaluate(() => window.__forge?.key ?? null);
        if (!key) {
          await page.waitForSelector('.rf-root', { timeout: 15000 });
          continue;
        }
        await playForge(ctx, key);
        ctx.first = false;
        earned = (await W.st()).keys;
        await W.ff(0.6);
        await page.waitForTimeout(300);
        lap(`forge ${key}`);
      }
    };

    /** The plank b in his hand, on head island h: made in its workshop, or taken from its pedestal. */
    const hold = async (h, b, how) => {
      if (segs[h].workshop) {
        await W.openWorkshop(h);
        await W.craft(b, how);
      } else await W.take(b);
    };

    /** A bench of a workshop: opened from it, played, back to it. */
    const bench = async (h, spec) => {
      await W.openWorkshop(h);
      const state = await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open');
      check(['new', 'kept'].includes(state), `the workshop of « ${islands[h].name} » offers its bench (${state})`);
      const open = async () => {
        await page.click('[data-di-bench-open]');
        await page.waitForSelector(`[data-di-bench="${spec.kind}"] .iq`, { timeout: 8000 });
        await page.waitForTimeout(300);
      };
      await open();
      const reopen = async () => {
        await page.click('[data-di-bench-back]');
        await page.waitForSelector('[data-di-workshop="typed"]');
        check(
          (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'kept',
          'back to the workshop half-way: the bench says it is KEPT',
        );
        await open();
      };
      await playExperiment({ w, page, name: `bench-${islands[h].id}`, where: 'bench', forbid, reopen }, spec);
      await page.waitForSelector('[data-di-workshop="typed"]', { timeout: 8000 });
      check(
        (await page.getAttribute('[data-di-bench-open]', 'data-di-bench-open')) === 'kept',
        'the bench closes back to the workshop, what he did KEPT',
      );
    };

    /**
     * A workshop LOCKED until the first bridge has fallen twice (lesson 7, island I): the locked anvil refuses, two planks of
     * the island that leave a piece of the first gap fall on it, the workshop opens (`flags.anvil`).
     */
    const unlock = async (h, gaps, pedestals) => {
      check(
        !pedestals.some((b) => gaps.every((a) => fills(a, b))),
        `island « ${islands[h].name} » offers ${pedestals.join(', ')}: none builds ${gaps.join(' and ')} — computed here`,
      );
      check(
        (await page.evaluate(() => !window.__world.flags.anvil)) && /\batelier\b/i.test((await W.road()).objective),
        `« ${islands[h].name} »: its workshop is LOCKED and the instruction says so`,
      );
      await W.toAnvil(h);
      await W.act();
      await page.waitForTimeout(200);
      check(
        (await page.locator('[data-di-workshop]').count()) === 0 && (await W.st()).overlay == null,
        `the locked workshop does not open (« ${(await W.road()).say} »)`,
      );
      const misses = pedestals.filter((b) => !fills(gaps[0], b)).slice(0, 2);
      expect(misses.length === 2, `two planks of the island leave a piece of ${gaps[0]} (${misses.join(', ')})`);
      for (const [n, b] of misses.entries()) {
        await W.take(b);
        const t = await W.fire(h, async () => {
          expect(await W.until((r) => r.verdict != null, 30), `the world shows its verdict on ${gaps[0]}`);
          const v = (await W.road()).verdict;
          check(
            !v.holds && v.r === gaps[0] % b,
            `${gaps[0]} = ${b} × ${Math.floor(gaps[0] / b)} + ${gaps[0] % b}: the first bridge falls (${JSON.stringify(v)})`,
          );
          return 0;
        });
        waits.push(`${b} on ${gaps[0]} (${Math.floor(gaps[0] / b)} planks, refused): ${t.toFixed(1)} s`);
        check(!(await W.road()).segs[h].complete, `the bridge of ${b} goes back (fall ${n + 1})`);
      }
      expect(
        await page.evaluate(() => window.__world.flags.anvil === true),
        'the first bridge fell twice: the workshop OPENS',
      );
      await W.ff(3);
      check(
        /\batelier\b/i.test((await W.road()).objective),
        `the workshop open, the instruction says it at once (« ${(await W.road()).objective.slice(0, 90)} »)`,
      );
      await shotWorld(`island-${islands[h].id}-open`);
    };

    /**
     * A convoy whose head is island h — or a SINGLE BRIDGE (a segment with no `convoy`, first French lesson
     * `decomposer-en-facteurs-premiers`: every bridge built with the planks of its own island, its pedestals or its typed
     * workshop). Returns the island he stands on after its last bridge.
     */
    const convoy = async (h) => {
      const head = segs[h];
      const single = !head.convoy;
      const group = single ? [{ s: head, i: h }] : segs.map((s, i) => ({ s, i })).filter((x) => x.s.convoy === head.convoy);
      const gaps = group.filter((x) => !x.s.standing).map((x) => x.s.a);
      const purse = single ? Infinity : (convoys[head.convoy]?.purse ?? Infinity);
      const ws = head.workshop;
      // a workshop LOCKED (`open: false`) beside planks on pedestals: it opens once the first bridge fell twice
      const locked = Boolean(ws && ws.open === false);
      await ctx.hook(single ? `bridge:${head.id}:before` : `convoy:${head.convoy}:before`);
      const pedestals = locked || !ws ? await W.pedestals(h) : [];
      const offered = ws ? range(ws.min ?? 1, ws.max) : pedestals;
      const costs = (b) => gaps.reduce((t, a) => t + a / b, 0);
      const built = group.filter((x) => !x.s.standing);
      // a marked bridge holds only when a joint falls on its post too (holdsMark)
      const fit = offered.filter((b) => built.every((x) => holdsMark(x.s, b)) && costs(b) <= purse);
      // planks that fill every gap, within the purse, and leave a post in the middle of a plank (the cheapest such)
      const marked = built.some((x) => x.s.mark);
      const missPost = marked
        ? (offered.find(
            (b) => gaps.every((a) => fills(a, b)) && costs(b) <= purse && built.some((x) => !holdsMark(x.s, b)),
          ) ?? null)
        : null;
      const markMiss =
        missPost != null && (S.markMiss ?? [segs.find((s) => s.convoy && s.mark)?.convoy]).includes(head.convoy);
      const what = single ? `bridge « ${head.id} »` : `convoy « ${head.convoy} »`;
      expect(
        fit.length >= 1,
        `${what} (${gaps.join(', ')}${purse < Infinity ? `, ${purse} coins` : ''}): a plank of ${ws ? 'the workshop' : offered.join(', ')} builds every gap (${fit.length > 12 ? `${fit.length} lengths` : fit.join(', ')}) — computed here`,
      );
      if (!ws && !single)
        check(fit.length === 1, `${what}: ONE plank of the island builds every gap (${fit.join(', ')})`);
      // a convoy: the longest plank that builds it; a single bridge (several planks may hold — a composite one too): the
      // shortest plank longer than 1 that fills it, as a student who tries the short planks first (1 when none does)
      const right = single ? ([...fit].sort((x, y) => x - y).find((b) => b > 1) ?? fit[0]) : Math.max(...fit);
      // a single bridge where the descriptor asks a FALL first (`story.fallFirst: [segment id]`): a plank of the island that
      // leaves cells (the first such mould; in a workshop the shortest such length)
      const fallFirst = single && (S.fallFirst ?? []).includes(head.id);
      const falls = fallFirst ? (offered.find((b) => b > 1 && !fills(head.a, b)) ?? null) : null;
      // a plank that fills the first gap and not the second, that the purse pays (the longest such, shorter than the gap)
      const firstOnly =
        gaps.length >= 2
          ? (offered
              .filter((b) => fills(gaps[0], b) && !fills(gaps[1], b) && gaps[0] / b <= purse && b < gaps[0])
              .at(-1) ?? null)
          : null;
      // a plank of every gap whose FIRST gap already costs more than the purse
      const tooCheap = offered.filter((b) => gaps.every((a) => fills(a, b)) && gaps[0] / b > purse).at(-1) ?? null;
      const wrongFirst =
        (S.wrongFirst ?? [segs.find((s) => s.convoy)?.convoy]).includes(head.convoy) && firstOnly != null;
      const purseOut = (S.purseOut ?? []).includes(head.convoy) && tooCheap != null;
      console.log(
        `NOTE  ${what}: right ${right}${falls != null ? `, falls first ${falls}` : ''}${wrongFirst ? `, first only ${firstOnly}` : ''}${purseOut ? `, purse out ${tooCheap}` : ''}${markMiss ? `, misses the post ${missPost}` : ''} (computed)`,
      );
      for (const x of built) if (x.s.mark) await sign(x.i, `island « ${islands[h].name} », before he builds`);

      {
        const r = await W.road();
        // a French number is written with a narrow no-break space between its thousands (« 1 400 »): read without it (C11)
        const said = r.objective.replace(/\s/g, '');
        check(
          gaps.every((a) => said.includes(String(a))),
          `island « ${islands[h].name} »: the instruction names the gaps ${gaps.join(', ')}`,
        );
        if (purse < Infinity)
          check(
            (await W.chip()) === String(purse),
            `island « ${islands[h].name} »: the purse chip shows ${purse} coins (${await W.chip()})`,
          );
        await shotWorld(`island-${islands[h].id}`);
        if (locked) await unlock(h, gaps, pedestals);
        if (h === 0) await foldOnce(h);
      }
      if (ws) {
        await W.openWorkshop(h);
        check(
          (await page.getAttribute('[data-di-gaps]', 'data-di-gaps')) === gaps.join(','),
          `the workshop of « ${islands[h].name} » names ${gaps.join(' and ')}`,
        );
        check(
          (await page.locator('[data-di-workshop="typed"] [data-di-in]').count()) === 1 &&
            /\bcases?\b/.test(
              (await page.textContent('[data-di-workshop="typed"] .di-template').catch(() => '')) ?? '',
            ),
          "ONE box to type the plank's length, its unit « cases » printed (divisorIsles/strings.js › unit)",
        );
        await w.shot(page, `workshop-${islands[h].id}`, { exit: ['.di-veil [data-di-exit]'], numbers: true });
        if (firstWorkshop) {
          firstWorkshop = false;
          await page.click('[data-di-workshop="typed"] [data-di-craft]');
          const e0 = (await W.workshopError()) ?? '';
          check(
            e0.trim().length > 5 && (await W.st()).held == null,
            `an empty box is answered by a sentence (« ${e0.trim()} »)`,
          );
          // a length longer than every gap, and no number of another lesson (2026-11-19: 259 + 7 = 266, lesson 4's crown)
          let long = ws.max + 1;
          while ((opts?.foreignNumbers ?? []).includes(long)) long += 1;
          await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', String(long));
          await page.click('[data-di-workshop="typed"] [data-di-craft]');
          const e1 = (await W.workshopError()) ?? '';
          check(
            e1.includes(String(long)) && (await W.st()).held == null,
            `${long} is longer than every gap: refused (« ${e1.trim()} »)`,
          );
          await w.shot(page, `workshop-${islands[h].id}-error`, { exit: ['.di-veil [data-di-exit]'], numbers: true });
          await page.fill('[data-di-workshop="typed"] [data-di-in="plank"]', '0');
          await page.click('[data-di-workshop="typed"] [data-di-craft]');
          check((await W.st()).held == null, '0 makes no plank');
        }
      }

      // ── a single bridge: a plank of the island that leaves cells falls first ──
      if (falls != null) {
        await hold(h, falls);
        await W.ff(0.6);
        await W.fire(h, async () => {
          expect(await W.until((r) => r.verdict != null, 30), `the world shows its verdict on ${head.a}`);
          const v = (await W.road()).verdict;
          check(
            !v.holds && v.r === head.a % falls,
            `${head.a} = ${falls} × ${Math.floor(head.a / falls)} + ${head.a % falls}: the bridge of ${falls} falls (${JSON.stringify(v)})`,
          );
          await shotWorld(`g${head.a}-falls-${falls}`);
          return 0;
        });
        check(!(await W.road()).segs[h].complete, `the bridge of ${falls} goes back: ${head.a} still to cross`);
        await shotWorld(`g${head.a}-after-fall`);
      }
      // ── a plank that fills the first gap only: the second refuses it, he walks back ──
      if (wrongFirst) {
        await hold(h, firstOnly);
        await shotWorld(`${islands[h].id}-holds-${firstOnly}`);
        await W.fire(h);
        expect(
          await W.standsWith(h, firstOnly),
          `${gaps[0]} = ${firstOnly} × ${gaps[0] / firstOnly}: the first bridge holds`,
        );
        await W.cross(h);
        await page.waitForTimeout(300);
        const next = group[1];
        {
          const r = await W.road();
          expect(
            r.island === next.i && r.held === firstOnly,
            `island « ${islands[next.i].name} »: he carries the planks ${firstOnly}`,
          );
          await shotWorld(`island-${islands[next.i].id}`);
        }
        await W.fire(next.i, async () => {
          expect(await W.until((r) => r.verdict != null, 12), `the world shows its verdict on ${next.s.a}`);
          const v = (await W.road()).verdict;
          expect(
            !v.holds && v.r === next.s.a % firstOnly,
            `${next.s.a} = ${firstOnly} × ${Math.floor(next.s.a / firstOnly)} + ${next.s.a % firstOnly}: refused (${JSON.stringify(v)})`,
          );
          await shotWorld(`g${next.s.a}-refused`);
          return 0;
        });
        {
          const r = await W.road();
          check(
            !r.segs[next.i].complete && r.objective.includes(r.names[h]),
            `${next.s.a} fell; the instruction sends him back to « ${r.names[h]} »`,
          );
        }
        if (!leftWorld) {
          leftWorld = true;
          await W.leaveAndReturn(
            `in the world, on « ${islands[next.i].name} »`,
            ['.di-top a.di-icon', '.di-top [data-di-exit]'],
            ctx.startLabel,
          );
          const s = await W.st();
          expect(
            s.phase === 'play' &&
              s.stage === next.i &&
              s.overlay == null &&
              (await W.standsWith(h, firstOnly)) &&
              s.held === firstOnly,
            `back from the world's ✕: he is where he was, the bridge of ${firstOnly} standing, the planks in hand (${JSON.stringify({ stage: s.stage, held: s.held })})`,
          );
          await shotWorld(`back-on-${islands[next.i].id}`);
        }
        await W.walkBack(h, `walk-back-to-${islands[h].id}`, (label) => shotWorld(label));
        facingBack = true;
      }
      if (ws?.bench) await bench(h, ws.bench);
      // ── a marked bridge: planks that fill the gap and leave the post in the middle of a plank ──
      if (markMiss) {
        await hold(h, missPost);
        await W.ff(1.2);
        const i = built.find((x) => !holdsMark(x.s, missPost)).i;
        await postMiss(i, missPost, `post-missed-${segs[i].a}-${missPost}`);
      }
      // ── a plank of every gap that the purse cannot pay on the first gap ──
      if (purseOut) {
        await hold(h, tooCheap);
        await W.ff(1.2);
        const t = await W.fire(h, async () => {
          let s = 0;
          for (let k = 0; k < 400 && !(await W.road()).verdict; k += 1) {
            await W.ff(0.5);
            s += 0.5;
          }
          check(
            (await W.road()).verdict?.purse === true,
            `${tooCheap} on ${gaps[0]}: ${gaps[0] / tooCheap} planks, ${purse} coins — the purse runs out`,
          );
          await shotWorld(`purse-out-${gaps[0]}`);
          return s;
        });
        waits.push(`${tooCheap} on ${gaps[0]} (the purse runs out): ${t.toFixed(1)} s`);
        check(!(await W.road()).segs[h].complete, `the bridge of ${tooCheap} goes back`);
      }
      // ── the right plank: every bridge of the convoy ──
      await hold(h, right, ws && firstWorkshop === false && wrongFirst ? 'enter' : 'button');
      if (wrongFirst || purseOut || markMiss || falls != null) {
        const r = await W.road();
        check(
          !r.segs[h].complete || r.segs[h].builtWith === right,
          `planks of ${right} in hand: the bridges of other planks go back`,
        );
        if (purse < Infinity) check((await W.chip()) === String(purse), `the purse is full again (${await W.chip()})`);
      }
      await W.ff(1.2);
      for (const [n, { s, i }] of group.entries()) {
        if (s.standing) {
          const r = await W.road();
          expect(r.stage === i && r.segs[i].complete, `the gap of ${s.a} cells stands from the start`);
          const before = await page.evaluate(
            (k) => ({
              left: window.__world.purseOf(window.__world.segs[k])?.left ?? null,
              log: window.__world.log.length,
            }),
            i,
          );
          await W.toAltar(i);
          await W.ff(0.3);
          check(!(await W.promptShown()), `at the altar of the gap of ${s.a}: no « Appuie sur E » prompt — nothing to build`);
          await shotWorld(`gap-${s.a}`);
          await W.cross(i);
          await page.waitForTimeout(300);
          const after = await page.evaluate(
            (k) => ({
              left: window.__world.purseOf(window.__world.segs[k])?.left ?? null,
              log: window.__world.log.length,
            }),
            i,
          );
          check(
            after.left === before.left && after.log === before.log,
            `the gap of ${s.a} is crossed without building: the purse untouched, nothing logged`,
          );
          continue;
        }
        if (s.mark) await markHold(i, right, `building-${s.a}-${right}`);
        else {
          const t = await W.fire(i);
          if (s.a / right > 30) waits.push(`${right} on ${s.a} (${s.a / right} planks): ${t.toFixed(1)} s`);
          expect(await W.standsWith(i, right), `${s.a} = ${right} × ${s.a / right}: the bridge holds`);
        }
        if (purse < Infinity) {
          // the coins left as the world counts them (its chip hides once the purse is empty)
          const left = await page.evaluate((k) => window.__world.purseOf(window.__world.segs[k])?.left ?? null, i);
          const spent = group.slice(0, n + 1).reduce((t, x) => t + (x.s.standing ? 0 : x.s.a / right), 0);
          check(
            left === purse - spent,
            `${spent} coin(s) spent of ${purse}: ${purse - spent} left (the world: ${left})`,
          );
        }
        if (facingBack) {
          await W.crossAgain(i, `${islands[i].id} → ${islands[i + 1].id} with ${right}`);
          facingBack = false;
        } else await W.cross(i);
        await page.waitForTimeout(300);
        const to = i + 1;
        if (S.reloadOn === to && (single || group.some((x) => x.i === to))) {
          await W.reload();
          const r = await W.road();
          expect(
            r.phase === 'play' &&
              r.stage === to &&
              r.island === to &&
              (await W.standsWith(i, right)) &&
              // the planks in hand are kept only inside a convoy (Game.js › restore: elsewhere the island gives them again)
              r.held === (single ? null : right),
            `after a reload he is on « ${islands[to].name} », the bridge of ${right} behind him${single ? ', his hand empty (a single bridge: the next island gives its planks)' : ', the planks in hand'} (stage ${r.stage}, held ${r.held})`,
          );
          await shotWorld(`reload-on-${islands[to].id}`);
        } else if (n < group.length - 1) await shotWorld(`island-${islands[to].id}`);
      }
      lap(what);
      return group.at(-1).i + 1;
    };

    /**
     * A MARKED BRIDGE whose planks lie on its island's pedestals (no convoy, no purse — lesson 8, islands A and B). Played:
     * a plank that fills the gap and misses the post (refused); then the planks that hold, in increasing length — the
     * sign rewritten after each. When more than one holds: he crosses with the first writing only, the world sends him
     * back (the instruction names this island, no mirror opens), he WALKS BACK, a plank that does not fill fails on the
     * standing bridge (it stands again as it was, the sign unchanged), the other planks rebuild it, the forges the
     * world opens there are played, and he crosses again. Returns the island he stands on.
     */
    const markedBridge = async (k) => {
      const seg = segs[k];
      const name = islands[k].name;
      const moulds = await W.pedestals(k);
      const holders = moulds.filter((b) => holdsMark(seg, b)).sort((x, y) => x - y);
      const misses = moulds.filter((b) => fills(seg.a, b) && !holdsMark(seg, b));
      const open = moulds.filter((b) => !fills(seg.a, b));
      expect(
        holders.length >= 1,
        `island « ${name} » offers ${moulds.join(', ')}: ${holders.join(', ')} hold ${seg.a} cells with a joint on ${seg.mark} — computed here`,
      );
      console.log(
        `NOTE  marked bridge ${seg.a} (${seg.mark} lit) on « ${name} »: holds ${holders.join(', ')}; misses the post ${misses.join(', ') || '—'}; does not fill ${open.join(', ') || '—'} (computed)`,
      );
      const r0 = await W.road();
      check(
        r0.objective.includes(String(seg.a)) && r0.objective.includes(String(seg.mark)),
        `island « ${name} »: the instruction names the bridge, ${seg.a} cells, ${seg.mark} lit`,
      );
      await sign(k, `island « ${name} », before he builds`);
      await shotWorld(`island-${islands[k].id}`);
      await foldOnce(k);
      if (misses.length) {
        await W.take(misses[0]);
        await W.ff(0.6);
        await postMiss(k, misses[0], `post-missed-${seg.a}-${misses[0]}`);
      }
      await W.take(holders[0]);
      await W.ff(0.6);
      await markHold(k, holders[0], `building-${seg.a}-${holders[0]}`);
      await shotWorld(`${islands[k].id}-sign-${holders[0]}`);
      if (holders.length > 1) {
        // ── he crosses with ONE writing on the sign: the world sends him back ──
        await W.cross(k);
        await page.waitForTimeout(400);
        await W.ff(1);
        const r = await W.road();
        expect(r.island === k + 1, `with one writing he can cross to « ${islands[k + 1].name} »`);
        check(
          r.overlay == null && r.objective.includes(name),
          `on « ${islands[k + 1].name} » no mirror opens; the instruction sends him back to « ${name} » (« ${r.objective.slice(0, 80)} »)`,
        );
        await shotWorld(`island-${islands[k + 1].id}-sent-back`);
        await W.walkBack(k, `walk-back-to-${islands[k].id}`, (label) => shotWorld(label));
        facingBack = true;
        await sign(k, `back on « ${name} », the sign is this bridge's own`);
        await shotWorld(`island-${islands[k].id}-back`);
        if (open.length) {
          const b = open[0];
          await W.take(b);
          await W.ff(0.6);
          await W.fire(k, async () => {
            expect(await W.until((x) => x.verdict != null, 30), `the world shows its verdict on ${seg.a}`);
            const v = (await W.road()).verdict;
            check(
              !v.holds && v.r === seg.a % b,
              `${seg.a} = ${b} × ${Math.floor(seg.a / b)} + ${seg.a % b}: the rebuild with ${b} fails (${JSON.stringify(v)})`,
            );
            return 0;
          });
          check(
            await W.standsWith(k, holders[0]),
            `a failed rebuild: the bridge stands again with ${holders[0]}, as it was`,
          );
          await sign(k, `after the failed rebuild with ${b}`);
        }
        for (const b of holders.slice(1)) {
          await W.take(b);
          await W.ff(0.6);
          await markHold(k, b, null);
        }
        // the last hold opens the mirror the sign was waiting for (it covers the island): its forges first
        await forges();
        const s = await W.road();
        if (s.island === k) {
          await sign(k, `after the mirror, back on « ${name} »`);
          await shotWorld(`${islands[k].id}-sign-all`);
          if (s.facing === -1 || facingBack) await W.crossAgain(k, `${islands[k].id} → ${islands[k + 1].id} again`);
          else await W.cross(k);
          facingBack = false;
        } else {
          // the forge's ✕ reopened the world on the save's island (defects.md C9): the card on the right recalls the sign
          facingBack = false;
          const card = ((await page.textContent('[data-di-recall]').catch(() => '')) ?? '').replace(/\s+/g, '');
          const want = signChainOf(seg, heldOn[k]).split(/[=/]/);
          check(
            want.every((x) => card.includes(x)),
            `on « ${islands[k + 1].name} » the card on the right recalls the sign ${signChainOf(seg, heldOn[k])}`,
          );
          await shotWorld(`${islands[k + 1].id}-recall-sign-all`);
        }
      } else {
        await W.cross(k);
      }
      await page.waitForTimeout(300);
      expect((await W.road()).island === k + 1, `he stands on « ${islands[k + 1].name} »`);
      lap(`marked bridge ${seg.a}`);
      return k + 1;
    };

    /** The gate dash, from island k: each wave's right gate computed by the descriptor. */
    const dash = async (k) => {
      await ctx.hook('dash:before');
      const p = await page.evaluate(() => [window.__world.boardHome.x, window.__world.boardHome.z]);
      await W.tp(p[0], p[1] + 0.2);
      await W.ff(0.3);
      await W.act();
      await W.ff(0.6);
      expect(Boolean(await page.evaluate(() => window.__world.getState().dash)), 'the board moves');
      await W.ff(1.5);
      await w.shot(page, 'dash', OUT);
      const waves = await page.evaluate(() => window.__world.dash.waves.map((x) => ({ say: x.say, gates: x.gates })));
      const lanes = waves.map((x) => {
        const ok = x.gates.map((g) => Boolean(D.dash(x.say, g)));
        check(
          ok.filter(Boolean).length === 1,
          `wave « ${x.say} »: exactly one gate is right (${x.gates.join(', ')}) — computed here`,
        );
        return ok.indexOf(true);
      });
      for (let n = 0; n < 400 && (await page.evaluate(() => Boolean(window.__world.getState().dash))); n += 1) {
        await page.evaluate((ls) => {
          const d = window.__world.dash;
          if (d && d.waves[d.wave]) d.lane = ls[d.wave];
        }, lanes);
        await W.ff(0.25);
      }
      for (let n = 0; n < 30 && (await W.st()).stage !== k + 1; n += 1) await W.ff(1);
      await page.waitForTimeout(500);
      expect(
        (await W.st()).stage === k + 1,
        `island « ${islands[k + 1].name} »: the dash is ridden (stage ${(await W.st()).stage})`,
      );
      lap('dash');
    };

    /** The store of the last bridge (segment k): the lanes from the descriptor or the lesson's NUMBERS. */
    /** The store opened at the last bridge's altar: its mission names the gap. */
    const openStore = async (k) => {
      await shotWorld(`island-${islands[k].id}`);
      await W.toAltar(k);
      await page.waitForTimeout(600);
      await W.act();
      await page.waitForTimeout(400);
      expect(
        (await W.st()).overlay === 'boss' &&
          ((await page.textContent('[data-di-boss-mission]')) ?? '').includes(String(segs[k].a)),
        `the store opens on the lesson's problem: ${segs[k].a} cells`,
      );
      return page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
    };
    /** Planks of b chosen in the store, their division typed: the world builds them. */
    const storeBuild = async (b, A) => {
      await page.click(`[data-di-mould="${b}"]`);
      await page.waitForTimeout(300);
      if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
      await page.fill('[data-di-q]', String(Math.floor(A / b)));
      await page.fill('[data-di-r]', String(A % b));
      await page.click('[data-di-check]');
    };
    /** The bridge holds: its price typed wrong then right, paid; he crosses; the end screen. */
    const storePay = async (k, Q) => {
      if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
      // a price written the French way (« 1 850 »: a narrow no-break space between the thousands) is read without its spaces
      const price = Number(((await page.textContent('[data-di-boss-price]')) ?? '').replace(/\s/g, ''));
      // the unit the lesson's story prints after the amount (`story.text.boss.unit`: « € » for money)
      const unit = L.lesson.story.text?.boss?.unit ?? null;
      check(
        Boolean(unit) && ((await page.textContent('.di-template').catch(() => '')) ?? '').includes(unit),
        `the amount is typed in its own shape: « ${unit ?? '(the story names no unit)'} » printed`,
      );
      await w.shot(page, 'boss-cost', OUT);
      await page.fill('[data-di-cost]', String(Q * price + 1));
      await page.click('[data-di-check]');
      await page.waitForTimeout(300);
      check(
        ((await page.textContent('[data-di-boss-error]').catch(() => '')) ?? '').trim().length > 5,
        'a wrong price is refused with a sentence',
      );
      await page.fill('[data-di-cost]', String(Q * price));
      await page.click('[data-di-check]');
      await W.ff(0.5);
      expect((await W.st()).overlay == null, `paid ${Q * price} ${unit ?? ''} (${Q} × ${price})`);
      await W.cross(k);
      await W.ff(3);
      await page.waitForTimeout(500);
      await w.shot(page, 'finale', OUT);
      await W.ff(6);
      await page.waitForTimeout(600);
      await w.shot(page, 'end', OUT);
      expect((await W.st()).overlay === 'end', 'the landing is reached and the end screen shows');
      lap('the end');
    };
    /**
     * The store of a MARKED last bridge (lesson 8): every option is judged by the walk — it holds (fills the gap, a joint
     * on the post) and the purse pays it. Each wrong option is tried first: the world builds it, refuses it (cells left,
     * the post in a plank, or the coins run out at the purse's last plank) and the store REOPENS by itself, its card
     * saying why; then the one option that holds within the purse, its sign, its price.
     */
    const markedStore = async (k) => {
      const seg = segs[k];
      const A = seg.a;
      const purse = convoys[seg.convoy]?.purse ?? Infinity;
      const moulds = await openStore(k);
      const good = moulds.filter((b) => holdsMark(seg, b) && A / b <= purse);
      const bad = moulds.filter((b) => !good.includes(b));
      expect(
        good.length === 1 && bad.length >= 1,
        `the store offers ${moulds.join(' and ')}: only ${good} holds ${A} cells with a joint on ${seg.mark} within ${purse} coins — computed here`,
      );
      await w.shot(page, 'boss', OUT);
      for (const b of bad) {
        const why = !fills(A, b)
          ? { cells: A % b }
          : !fills(seg.mark, b)
            ? { mark: seg.mark % b }
            : { purse: true, laid: purse, need: A / b };
        await storeBuild(b, A);
        let s = 0;
        for (
          let n = 0;
          n < 160 && !((await W.st()).overlay === 'boss' && (await W.st()).o?.view === 'choose');
          n += 1
        ) {
          await W.ff(0.5);
          s += 0.5;
        }
        waits.push(`the store's ${b} refused: ${s.toFixed(1)} s`);
        const o = (await W.st()).o;
        const tried = o?.tried?.[b];
        expect(o?.type === 'boss' && o.view === 'choose', `planks of ${b} refused: the store REOPENS by itself`);
        const card = ((await page.textContent(`[data-di-mould="${b}"] em`).catch(() => '')) ?? '').trim();
        if (why.purse)
          check(
            tried?.purse === true &&
              tried.laid === why.laid &&
              tried.need === why.need &&
              // « Plus de pièces : 5 sur 8 » (divisorIsles/strings.js › boss.triedPurse)
              new RegExp(`(^|[^0-9])${why.laid}\\s+sur\\s+${why.need}([^0-9]|$)`).test(card),
            `${A} = ${b} × ${A / b}: the purse pays ${purse} planks of ${A / b} — the card says so (« ${card} »)`,
          );
        else if (why.mark != null)
          check(
            tried?.mark === why.mark,
            `${b} misses the post: ${seg.mark} = ${b} × ${Math.floor(seg.mark / b)} + ${why.mark} (« ${card} »)`,
          );
        else check(tried === why.cells, `${b} leaves ${why.cells} cells (« ${card} »)`);
        await w.shot(page, `boss-reopened-${b}`, OUT);
      }
      await storeBuild(good[0], A);
      let s = 0;
      for (let n = 0; n < 160 && (await W.st()).o?.view !== 'cost'; n += 1) {
        await W.ff(0.5);
        s += 0.5;
      }
      const Q = A / good[0];
      waits.push(`the last bridge, ${Q} planks of ${good[0]}: ${s.toFixed(1)} s`);
      expect(
        (await W.st()).o?.view === 'cost',
        `the bridge of ${A} holds with ${Q} planks: the store asks their price`,
      );
      heldOn[k] = [good[0]];
      await sign(k, `the store's bridge held with ${good[0]}`);
      await storePay(k, Q);
    };

    /**
     * The store of a last bridge announced by a LABEL (`boss.label`, first French lesson: « 2³ × 3² × 7 cases », never its
     * count): the walk reads the gap from the label ITSELF (its own arithmetic of the powers), and the store's step asks
     * ONE box — how many planks (`[data-di-boss-count]`, `[data-di-q]`, no remainder box). Each option that does not fill
     * the gap is tried first: the world builds it whatever count he typed and it FALLS (the store reopens with the cells
     * left); the one that fills is asked a wrong count first (refused with its sentence), then the right one; the price.
     */
    const labelStore = async (k) => {
      const seg = segs[k];
      const label = seg.boss.label;
      const A = labelValue(label.text);
      expect(
        A === seg.a,
        `the last bridge's label « ${label.text} » is ${A} cells — computed here from its powers (the world's gap ${seg.a})`,
      );
      await shotWorld(`island-${islands[k].id}`);
      await W.toAltar(k);
      await W.ff(1.2);
      await page.waitForTimeout(600);
      // the gap ahead, its sign written with the label (a sprite of the 3D scene: seen on the screenshot, not in the DOM)
      await shotWorld(`boss-sign-${islands[k].id}`);
      await W.act();
      await page.waitForTimeout(400);
      const mission =((await page.textContent('[data-di-boss-mission]').catch(() => '')) ?? '').replace(/\s/g, '');
      expect(
        (await W.st()).overlay === 'boss' && mission.includes(label.text.replace(/\s/g, '')),
        `the store opens on the lesson's problem: the bridge of « ${label.text} » cells`,
      );
      check(
        !new RegExp(`(^|[^0-9])${A}([^0-9]|$)`).test(mission),
        `the mission never writes the gap's count (${A}): only its decomposition`,
      );
      const moulds = await page
        .locator('[data-di-mould]')
        .evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
      const good = moulds.filter((b) => fills(A, b));
      const bad = moulds.filter((b) => !fills(A, b));
      expect(
        good.length === 1 && bad.length >= 1,
        `the store offers ${moulds.join(' and ')}: only ${good} fills ${label.text} = ${A} cells — computed here`,
      );
      await w.shot(page, 'boss', OUT);
      const pick = async (b) => {
        await page.click(`[data-di-mould="${b}"]`);
        await page.waitForTimeout(300);
        if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
        await page.waitForSelector('[data-di-boss-count] [data-di-q]', { timeout: 8000 });
        const form = await page.evaluate(() => ({
          r: document.querySelectorAll('[data-di-r]').length,
          label: document.querySelector('[data-di-boss-label]')?.textContent ?? '',
          a: document.querySelectorAll('[data-di-boss-a]').length,
        }));
        check(
          form.r === 0 && form.a === 0 && form.label.length > 0,
          `planks of ${b}: ONE box, how many planks — the label written in place of the count, no remainder box (${JSON.stringify(form)})`,
        );
      };
      for (const b of bad) {
        await pick(b);
        await page.fill('[data-di-q]', String(Math.floor(A / b)));
        await w.shot(page, `boss-count-${b}`, OUT);
        await page.click('[data-di-check]');
        // the planks of b are laid on the gap and it falls: the moment it is being built, then the store again
        let shotFall = false;
        let s = 0;
        for (let n = 0; n < 160; n += 1) {
          const o = (await W.st()).o;
          if ((await W.st()).overlay === 'boss' && o?.view === 'choose') break;
          if (!shotFall && (await W.road()).verdict) {
            shotFall = true;
            await shotWorld(`boss-falls-${b}`);
          }
          await W.ff(0.5);
          s += 0.5;
        }
        waits.push(`the store's ${b} built and fallen: ${s.toFixed(1)} s`);
        const o = (await W.st()).o;
        expect(o?.type === 'boss' && o.view === 'choose', `planks of ${b} fell: the store REOPENS`);
        check(
          o.tried?.[b] === A % b,
          `${A} = ${b} × ${Math.floor(A / b)} + ${A % b}: the card of ${b} says ${A % b} cells left (${JSON.stringify(o.tried)})`,
        );
        const say = (await W.road()).say;
        check(
          say.includes(String(A % b)) && !new RegExp(`(^|[^0-9])${A}([^0-9]|$)`).test(say),
          `the world says what is left, never the gap's count (« ${say.slice(0, 120)} »)`,
        );
        await w.shot(page, `boss-tried-${b}`, OUT);
      }
      const b = good[0];
      const Q = A / b;
      await pick(b);
      await page.fill('[data-di-q]', String(Q - 1));
      await page.click('[data-di-check]');
      await page.waitForTimeout(300);
      check(
        ((await page.textContent('[data-di-boss-error]').catch(() => '')) ?? '').trim().length > 5 &&
          (await W.st()).o?.view === 'divide',
        `${Q - 1} planks of ${b} do not fill the bridge: refused with a sentence, the store waits`,
      );
      await w.shot(page, `boss-count-${b}-short`, OUT);
      await page.fill('[data-di-q]', String(Q));
      await w.shot(page, `boss-count-${b}`, OUT);
      await page.click('[data-di-check]');
      let s = 0;
      for (let n = 0; n < 160 && (await W.st()).o?.view !== 'cost'; n += 1) {
        await W.ff(0.5);
        s += 0.5;
      }
      waits.push(`the last bridge, ${Q} planks of ${b}: ${s.toFixed(1)} s`);
      expect((await W.st()).o?.view === 'cost', `the bridge of ${label.text} holds with ${Q} planks of ${b}: the store asks their price`);
      await storePay(k, Q);
    };

    const boss = async (k) => {
      await ctx.hook('boss:before');
      const seg = segs[k];
      if (seg.mark) {
        await markedStore(k);
        return;
      }
      if (seg.boss?.label) {
        await labelStore(k);
        return;
      }
      const A = seg.a;
      const parts =
        D.bossParts ??
        Object.values(L.numbers?.boss ?? {}).find(
          (v) => Array.isArray(v) && v.length >= 2 && v.reduce((t, x) => t + x, 0) === A,
        );
      expect(
        parts,
        `the last bridge's lanes (${A} cells): the descriptor's \`bossParts\` or an array of NUMBERS.boss that sums to ${A}`,
      );
      await shotWorld(`island-${islands[k].id}`);
      await W.toAltar(k);
      await page.waitForTimeout(600);
      await W.act();
      await page.waitForTimeout(400);
      expect(
        (await W.st()).overlay === 'boss' &&
          ((await page.textContent('[data-di-boss-mission]')) ?? '').includes(String(A)),
        `the store opens on the lesson's problem: ${A} cells`,
      );
      const moulds = await page
        .locator('[data-di-mould]')
        .evaluateAll((els) => els.map((e) => Number(e.dataset.diMould)));
      const good = moulds.filter((b) => parts.every((p) => fills(p, b)));
      const bad = moulds.find((b) => !good.includes(b));
      expect(
        good.length === 1 && bad != null,
        `the store offers ${moulds.join(' and ')}: ${good} fills each lane ${parts.join(' and ')}, ${bad} does not — computed here`,
      );
      await w.shot(page, 'boss', OUT);
      await page.click(`[data-di-mould="${bad}"]`);
      await page.waitForTimeout(300);
      if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
      await page.fill('[data-di-q]', String(Math.floor(A / bad)));
      await page.fill('[data-di-r]', String(A % bad));
      await page.click('[data-di-check]');
      await W.ff(15);
      await page.waitForTimeout(400);
      {
        const o = (await W.st()).o;
        check(
          o?.type === 'boss' && o.view === 'choose' && o.tried?.[bad] === A % bad,
          `planks of ${bad} leave ${A % bad} cells: he chooses again`,
        );
        const open = parts.find((p) => !fills(p, bad));
        const say = (await W.road()).say;
        check(
          say.includes(String(open)) && say.includes(String(open % bad)),
          `the world says WHICH lane is not filled: ${open}, ${open % bad} cells left`,
        );
      }
      await w.shot(page, 'boss-tried', OUT);
      await page.click(`[data-di-mould="${good[0]}"]`);
      await page.waitForTimeout(300);
      if (await page.locator('[data-di-pgate-go]').count()) await page.click('[data-di-pgate-go]');
      await page.fill('[data-di-q]', String(A / good[0]));
      await page.fill('[data-di-r]', '0');
      await page.click('[data-di-check]');
      let s = 0;
      for (let n = 0; n < 120 && (await W.st()).o?.view !== 'cost'; n += 1) {
        await W.ff(0.5);
        s += 0.5;
      }
      waits.push(`the last bridge, ${A / good[0]} planks of ${good[0]}: ${s.toFixed(1)} s`);
      const Q = A / good[0];
      expect(
        (await W.st()).o?.view === 'cost',
        `the bridge of ${A} holds with ${Q} planks: the store asks their price`,
      );
      await storePay(k, Q);
    };

    // ══ the road, island by island ══
    let k = 0;
    try {
      for (let guard = 0; guard < segs.length + 2; guard += 1) {
        await ctx.hook(`island:${islands[k]?.id}:before`);
        await forges();
        const seg = segs[k];
        if (!seg) break;
        if (seg.kind === 'rail') {
          expect(
            earned.length === keys.length,
            `before the dash every key is forged (${earned.length} of ${keys.length})`,
          );
          await shotWorld(`island-${islands[k].id}`);
          await dash(k);
          k += 1;
        } else if (seg.boss) {
          await boss(k);
          break;
        } else if (seg.kind === 'bridge' && (seg.convoy || !seg.mark)) {
          // a convoy, or a single bridge built with its own island's planks
          k = await convoy(k);
        } else if (seg.kind === 'bridge' && seg.mark) {
          k = await markedBridge(k);
        } else {
          expect(
            false,
            `segment ${k} (« ${seg.id} », ${seg.kind}) has no player in the library: write it as a hook \`island:${islands[k].id}:before\` or add it (README)`,
          );
        }
      }
    } catch (e) {
      // the screen the walk stopped on, kept for the report (no check is made on it)
      await page.screenshot({ path: `${w.out}/99-STOPPED.png` }).catch(() => {});
      console.log(`NOTE  stopped near island ${k}; screen kept: ${w.out}/99-STOPPED.png`);
      throw e;
    }
    expect((await W.st()).overlay === 'end', 'the story is played to its end');
    for (const x of waits) console.log(`WAIT  ${x}`);
  });
  return w;
}
