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
import { createWalk, SIZE } from '../walk.mjs';
import { worldShot, wordsRe, WRONG_WORD as WRONG_RE } from './checks.mjs';
import { playExperiment } from './experiments.mjs';
import { playForge } from './forge.mjs';
import { walkwayPlayers } from './walkwayStory.mjs';
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
    const postMiss = async (i, b, label, fireOpts) => {
      const seg = segs[i];
      const stood = (await W.road()).segs[i];
      await W.fire(
        i,
        async () => {
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
        },
        fireOpts,
      );
      const now = (await W.road()).segs[i];
      check(
        now.complete === stood.complete && now.builtWith === stood.builtWith,
        `planks of ${b} refused: the bridge is as it was (${stood.complete ? `standing with ${stood.builtWith}` : 'unbuilt'})`,
      );
      await sign(i, `after ${b} missed the post`);
    };
    /**
     * Planks of b fired on marked bridge i leave cells of the gap (b does not fill it): refused, the bridge as it was —
     * unbuilt, or standing again with the plank `standing` — and the sign unchanged.
     */
    const openMiss = async (i, b, label, standing, fireOpts) => {
      const seg = segs[i];
      await W.fire(
        i,
        async () => {
          expect(await W.until((x) => x.verdict != null, 30), `the world shows its verdict on ${seg.a}`);
          const v = (await W.road()).verdict;
          check(
            !v.holds && v.r === seg.a % b,
            `${seg.a} = ${b} × ${Math.floor(seg.a / b)} + ${seg.a % b}: the planks of ${b} do not fill the bridge (${JSON.stringify(v)})`,
          );
          await shotWorld(label);
          return 0;
        },
        fireOpts,
      );
      check(
        standing == null ? !(await W.road()).segs[i].complete : await W.standsWith(i, standing),
        standing == null
          ? `the bridge of ${b} goes back: ${seg.a} still to cross`
          : `a failed rebuild with ${b}: the bridge stands again with ${standing}, as it was`,
      );
      await sign(i, `after ${b} left cells`);
    };
    /**
     * After the mirror a marked bridge was waiting for: back on its island, the sign holds every writing and he crosses
     * again; or the forge's ✕ reopened the world on the save's island — the card on the right recalls the sign.
     */
    const afterMirror = async (k) => {
      const seg = segs[k];
      const name = islands[k].name;
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
    };
    /** Planks of b fired on marked bridge i hold: the equation's second line shown while it is built; the sign grows. */
    const markHold = async (i, b, label, fireOpts) => {
      const seg = segs[i];
      let lines = null;
      const t = await W.fire(
        i,
        async () => {
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
        },
        fireOpts,
      );
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
      const group = single
        ? [{ s: head, i: h }]
        : segs.map((s, i) => ({ s, i })).filter((x) => x.s.convoy === head.convoy);
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
          // the number as SEEN: « 1 787 » is written with its thousands (U+202F) — read without the space (C11)
          check(
            e1.replace(/\s/g, '').includes(String(long)) && (await W.st()).held == null,
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
          check(
            !(await W.promptShown()),
            `at the altar of the gap of ${s.a}: no « Appuie sur E » prompt — nothing to build`,
          );
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
      // a stretch lit in STROKES (`seg.strokes`, fraction-irreductible: « 65 puis 4 ») is named by its strokes, not their sum
      const lit = seg.strokes ?? [seg.mark];
      check(
        r0.objective.includes(String(seg.a)) && lit.every((x) => r0.objective.includes(String(x))),
        `island « ${name} »: the instruction names the bridge, ${seg.a} cells, ${lit.join(' then ')} lit`,
      );
      await sign(k, `island « ${name} », before he builds`);
      await shotWorld(`island-${islands[k].id}`);
      await foldOnce(k);
      // the descriptor's plan of this bridge (`story.marked[seg.id]` = { first, reload, after }): absent, as before
      const plan = S.marked?.[seg.id] ?? null;
      const fired = new Set();
      if (plan?.first) {
        // the planks tried BEFORE any bridge stands, in his order: each misses the post or leaves cells
        for (const b of plan.first) {
          expect(
            moulds.includes(b) && !holdsMark(seg, b),
            `plan of ${seg.id}: ${b} is a plank of « ${name} » that does not hold`,
          );
          await W.take(b);
          await W.ff(0.6);
          if (fills(seg.a, b)) await postMiss(k, b, `post-missed-${seg.a}-${b}`);
          else await openMiss(k, b, `g${seg.a}-falls-${b}`, null);
          fired.add(b);
        }
        if (plan.reload) {
          await W.reload();
          const r = await W.road();
          expect(
            r.phase === 'play' && r.stage === k && r.island === k && !r.segs[k].complete && r.held == null,
            `after a reload he is on « ${name} », the bridge unbuilt, his hand empty (stage ${r.stage}, held ${r.held})`,
          );
          await sign(k, `after the reload on « ${name} »`);
          await shotWorld(`reload-on-${islands[k].id}`);
        }
      } else if (misses.length) {
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
          // with a plan, a plank he has not fired yet (else the first that leaves cells, as before)
          const b = plan ? (open.find((x) => !fired.has(x)) ?? open[0]) : open[0];
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
          // with a plan, the last hold that opens the mirror ends the wait at once (the forge is on screen)
          await markHold(
            k,
            b,
            null,
            plan && b === holders.at(-1) ? { stopOn: (x) => x.overlay === 'forge' } : undefined,
          );
        }
        // the last hold opens the mirror the sign was waiting for (it covers the island): its forges first
        await forges();
        await afterMirror(k);
      } else if (plan?.after) {
        // ── ONE plank holds, and the mirror ahead waits until named planks of this island were ALL fired (lesson 3's
        // `story.onMiss`): he crosses, is sent back, walks back, and fires the planks of `plan.after` on the standing
        // bridge — each refused, the bridge standing again; the mirror opens on the LAST of them, never before ──
        await W.cross(k);
        await page.waitForTimeout(400);
        await W.ff(1);
        const r = await W.road();
        expect(r.island === k + 1, `with the plank ${holders[0]} he can cross to « ${islands[k + 1].name} »`);
        check(
          r.overlay == null && r.objective.includes(name),
          `on « ${islands[k + 1].name} » no mirror opens; the instruction sends him back to « ${name} » (« ${r.objective.slice(0, 80)} »)`,
        );
        await shotWorld(`island-${islands[k + 1].id}-sent-back`);
        await W.walkBack(k, `walk-back-to-${islands[k].id}`, (label) => shotWorld(label));
        facingBack = true;
        await sign(k, `back on « ${name} », the sign is this bridge's own`);
        for (const [n, b] of plan.after.entries()) {
          const last = n === plan.after.length - 1;
          expect(moulds.includes(b), `plan of ${seg.id}: ${b} lies on a pedestal of « ${name} »`);
          await W.take(b);
          await W.ff(0.6);
          const stop = last ? { stopOn: (x) => x.overlay === 'forge' } : {};
          if (holdsMark(seg, b)) await markHold(k, b, null, stop);
          else if (fills(seg.a, b)) await postMiss(k, b, `post-missed-${seg.a}-${b}`, stop);
          else await openMiss(k, b, `g${seg.a}-fails-${b}`, holders[0], stop);
          fired.add(b);
          if (!last)
            check(
              (await W.st()).overlay !== 'forge',
              `« ${name} »: ${[...fired].join(', ')} fired — the mirror ahead is still shut`,
            );
        }
        expect(
          await W.until((x) => x.overlay === 'forge', 10),
          `« ${name} »: ${plan.after.at(-1)}, the last plank of the plan, is fired — the mirror ahead OPENS`,
        );
        await forges();
        await afterMirror(k);
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
      // the gap ahead, its sign written with the label (a sprite of the 3D scene: seen on the screenshot, not in the DOM).
      // At the altar the camera looks over the hero and the instruction covers the sky: he stands at the bridge's head,
      // facing the gap, the instruction folded — the sign must stand on screen, uncovered, its letters 12 px or more
      // (2026-11-23: no screenshot had ever shown the sign of the first French lesson's last bridge)
      await page.evaluate((i) => {
        const g = window.__world;
        const isl = g.isl[i];
        const s = g.segs[i];
        const n = Math.hypot(s.dx, s.dz);
        g.facing = 1;
        g.hero.pos.set(isl.x + (s.dx / n) * (isl.R - 2.2), 0, isl.z + (s.dz / n) * (isl.R - 2.2));
        g.hero.vel.set(0, 0, 0);
        g.hero.grounded = true;
      }, k);
      await W.ff(2.5);
      const unfold = (await page.getAttribute('[data-di-instruction]', 'data-di-instruction')) !== 'folded';
      if (unfold && (await page.locator('[data-di-instruction-fold]').count()))
        await page.click('[data-di-instruction-fold]');
      await page.waitForTimeout(700);
      const sign = await page.evaluate((i) => {
        const g = window.__world;
        const label = g.segs[i].label;
        const cam = g.camera;
        label.updateMatrixWorld(true);
        const at = (dy) => {
          const v = label.position.clone().setFromMatrixPosition(label.matrixWorld);
          v.y += dy;
          v.project(cam);
          return { x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight, z: v.z };
        };
        const c = at(0);
        const h = Math.abs(at(-label.scale.y / 2).y - at(label.scale.y / 2).y);
        const w = h * (label.scale.x / label.scale.y);
        const top = document.elementFromPoint(c.x, c.y);
        return {
          x: Math.round(c.x),
          y: Math.round(c.y),
          h: Math.round(h),
          w: Math.round(w),
          inFront: c.z < 1,
          canvas: top?.tagName === 'CANVAS',
          over: top && top.tagName !== 'CANVAS' ? (top.textContent || top.className || top.tagName).slice(0, 40) : null,
        };
      }, k);
      check(
        sign.inFront &&
          sign.x - sign.w / 2 >= 0 &&
          sign.x + sign.w / 2 <= SIZE[0] &&
          sign.y - sign.h / 2 >= 0 &&
          sign.y + sign.h / 2 <= SIZE[1] &&
          sign.canvas,
        `the last bridge's sign « ${label.text} » stands on screen and nothing covers it, seen from the bridge's head (${JSON.stringify(sign)})`,
      );
      // its pill is 1.5 × the text's line: the letters are about half of its height
      check(sign.h * 0.5 >= 12, `the sign's letters are 12 px or more on screen (the pill ${sign.h} px high)`);
      await shotWorld(`boss-sign-${islands[k].id}`);
      if (unfold) await page.click('[data-di-instruction-fold]');
      await W.toAltar(k);
      await W.ff(1.2);
      await page.waitForTimeout(600);
      await W.act();
      await page.waitForTimeout(400);
      const mission = ((await page.textContent('[data-di-boss-mission]').catch(() => '')) ?? '').replace(/\s/g, '');
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
        // the robot's bubble is under the store's veil: the store itself writes what the world said (the fact and the nudge)
        const written = ((await page.textContent('[data-di-boss-said]').catch(() => '')) ?? '').replace(/\s/g, '');
        check(
          written.includes(String(A % b)) && written.includes(String(b)),
          `the reopened store WRITES what the world said: ${A % b} cells left with the planks of ${b} (« ${written.slice(0, 100)} »)`,
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
      expect(
        (await W.st()).o?.view === 'cost',
        `the bridge of ${label.text} holds with ${Q} planks of ${b}: the store asks their price`,
      );
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

    /**
     * THE PLAQUE (`story.mission` with `write`, `opens`, `plaques`, `refill` — divisorIsles/walkwayGame.js, first played by
     * fraction-irreductible): on island k the keeper's board asks a FRACTION, the calculation read from the plaque's own
     * text (`mission.lead`) and computed here; the road `opens` (segment k) stays SHUT and its lanterns DARK until the
     * right plaque. Played: a writing equal to the result but not finished (the result divided by its smallest common
     * prime, or the result itself), a reload (the plaques left are kept), a writing that is not the result (the slip
     * « across », x + z over y + w) — the run spent, the boxes closed; the walk back to the quay `refill.at` and forward
     * again (two new plaques); the right writing: the road stands, its lanterns lit in the calculation's own proportions,
     * a module marked; he crosses to the next island. Every refusal is read back: a sentence, NO number. Returns the
     * island he stands on.
     */
    const plaque = async (k) => {
      await ctx.hook('mission:before');
      const m = L.lesson.story.mission;
      const seg = segs[k];
      const of = m.plaques ?? m.posters;
      expect(
        m.opens === seg.id && (m.at ?? islands.length - 1) === k && m.write && Number.isInteger(of) && of >= 2,
        `the mission of « ${islands[k].name} » opens the road « ${seg.id} », asks a fraction, gives ${of} plaques`,
      );
      // the calculation, from the plaque's own text: « \dfrac{x}{y} \times \dfrac{z}{w} »
      const texOf = (t) => String(t).replace(/\\,/g, '');
      const calcRe = /\\d?frac\{(\d+)\}\{(\d+)\}\s*(\\times|\+)\s*\\d?frac\{(\d+)\}\{(\d+)\}/;
      const found = m.lead.map((l) => texOf(l).match(calcRe)).find(Boolean);
      expect(found, `the plaque's text writes its calculation (« ${m.lead.join(' ').slice(0, 120)} »)`);
      const [x, y, z, ww] = [1, 2, 4, 5].map((i) => Number(found[i]));
      const times = found[3] !== '+';
      const [A, B] = times ? [x * z, y * ww] : [x * ww + z * y, y * ww];
      const g = (p, q) => (q ? g(q, p % q) : p);
      const G = g(A, B);
      const right = [A / G, B / G];
      const c = m.write.calc;
      check(
        c.x === x && c.y === y && c.z === z && c.w === ww && (c.op === '*') === times,
        `the plaque's text states the calculation the world checks (${x}/${y} ${times ? '×' : '+'} ${z}/${ww})`,
      );
      expect(G > 1, `${x}/${y} ${times ? '×' : '+'} ${z}/${ww} = ${A}/${B} is not finished yet (${G}) — computed here`);
      // the wrong writings, computed here: equal but not finished; not the result
      const p0 = (() => {
        for (let d = 2; d <= G; d += 1) if (G % d === 0) return d;
        return G;
      })();
      const unfinished = g(A / p0, B / p0) > 1 ? [A / p0, B / p0] : [A, B];
      let other = [x + z, y + ww];
      if (other[0] * B === A * other[1]) other = [right[0] + 1, right[1]];
      const wrongs = [unfinished, other];
      while (wrongs.length < of) wrongs.push([right[0], right[1] + wrongs.length]);
      console.log(
        `NOTE  the plaque: ${A}/${B} = ${right.join('/')}; refused first ${wrongs.map((v) => v.join('/')).join(', ')} (computed)`,
      );
      /** The road and its lanterns, as the world draws them (a count of each colour — never a count written). */
      const jetty = () =>
        page.evaluate((i) => {
          const sg = window.__world.segs[i];
          const ls = sg.lanterns ?? [];
          const lit = ls.filter((l) => l.material.emissive && l.material.emissive.getHex() !== 0);
          const red = lit.filter((l) => l.material.color.r > 0.9 && l.material.color.g < 0.5);
          return {
            complete: sg.complete,
            deck: sg.deck ? sg.deck.visible : null,
            n: ls.length,
            lit: lit.length,
            red: red.length,
          };
        }, k);
      const j0 = await jetty();
      check(
        !j0.complete && j0.deck !== true && j0.lit === 0,
        `before the plaque the road « ${seg.id} » is SHUT and its ${j0.n} lanterns dark (${JSON.stringify(j0)})`,
      );
      {
        const o = (await W.road()).objective.replace(/\s/g, '');
        check(
          [x, y, z, ww].every((v) => o.includes(String(v))),
          `island « ${islands[k].name} »: the instruction writes the calculation (${x}/${y}, ${z}/${ww})`,
        );
      }
      await shotWorld(`island-${islands[k].id}`);
      /** He goes to the keeper's board; `open`: E opens the plaque (else nothing must open). */
      const toBoard = async (open) => {
        const p = await page.evaluate((i) => {
          const gw = window.__world;
          const it = gw.missionIt;
          const isl = gw.isl[i];
          return it ? [it.x, it.z, isl.x, isl.z] : null;
        }, k);
        expect(p, `the keeper's board stands on « ${islands[k].name} »`);
        const d = Math.hypot(p[2] - p[0], p[3] - p[1]) || 1;
        await W.tp(p[0] + ((p[2] - p[0]) / d) * 1.6, p[1] + ((p[3] - p[1]) / d) * 1.6);
        await W.ff(0.4);
        // `ff` steps the world without drawing: the « E » bubble React has just mounted is hidden until the runtime's next
        // frame places it (WorldRuntime.placePrompt) — wait for two drawn frames before reading it (2026-11-26: read
        // hidden twice on F, though E opened the plaque)
        await page.evaluate(
          () =>
            new Promise((done) => {
              requestAnimationFrame(() => requestAnimationFrame(done));
              setTimeout(done, 1000);
            }),
        );
        check(
          (await W.promptShown()) === open,
          `at the keeper's board: the « E » prompt is ${open ? 'shown' : 'NOT shown'}`,
        );
        await W.act();
        await page.waitForTimeout(300);
        const s = await W.st();
        if (!open) {
          check(s.overlay == null, 'the run is spent: E opens nothing until he has walked back');
          return;
        }
        expect(s.overlay === 'mission', 'E at the board opens the plaque');
        await page.waitForSelector('[data-di-mission="open"]', { timeout: 8000 });
      };
      const attr = (sel, a) => page.getAttribute(sel, a).catch(() => null);
      const left = async () => Number(await attr('[data-di-posters]', 'data-di-posters'));
      /** One plaque engraved; returns the fact read back (null when it was the right one). */
      const engrave = async (v, label) => {
        await page.fill('[data-di-mission] [data-rf-use="p"]', String(v[0]));
        await page.fill('[data-di-mission] [data-rf-use="q"]', String(v[1]));
        await page.click('[data-di-mission-check]');
        if (v[0] === right[0] && v[1] === right[1]) return null;
        await page.waitForSelector('[data-di-mission-fact]', { timeout: 8000 });
        await page.waitForTimeout(250);
        const f = ((await page.textContent('[data-di-mission-fact]')) ?? '').trim();
        await w.shot(page, label, OUT);
        return f;
      };
      // ── the plaque: the box, the plaques left, nothing to engrave while a box is empty ──
      await toBoard(true);
      {
        const seen = await page.evaluate(() => ({
          frac: document.querySelector('[data-di-mission] [data-rf-frac]')?.dataset.rfFrac ?? null,
          boxes: [...document.querySelectorAll('[data-di-mission] [data-rf-use]')].map((e) => e.dataset.rfUse),
          disabled: document.querySelector('[data-di-mission-check]')?.disabled ?? null,
          lead: (document.querySelector('[data-di-mission]')?.textContent ?? '').replace(/[\s  ]/g, ''),
        }));
        check(
          seen.frac === 'p/q' && seen.boxes.join() === 'p,q' && seen.disabled === true,
          `the plaque: ONE fraction box (p over q), « engrave » waits for both boxes (${JSON.stringify({ ...seen, lead: undefined })})`,
        );
        check(
          [x, y, z, ww].every((v) => seen.lead.includes(String(v))) &&
            (!m.jetty || ![m.jetty.lanterns, m.jetty.lit].some((n) => seen.lead.includes(String(n)))),
          'the plaque writes the calculation, never a count of lanterns',
        );
        check((await left()) === of, `the chip: ${of} blank plaques (${await left()})`);
      }
      await w.shot(page, 'plaque', OUT);
      // ── the first plaques refused ──
      const facts = [];
      for (const [n, v] of wrongs.entries()) {
        if (n === 1) {
          // a reload between two plaques: the plaques left are kept
          await page.click('[data-di-mission-later]');
          await W.ff(0.4);
          check((await W.st()).overlay == null, '« later » closes the plaque');
          await W.reload();
          const r = await W.road();
          expect(
            r.phase === 'play' && r.stage === k,
            `after a reload he is on « ${islands[k].name} » (stage ${r.stage})`,
          );
          await shotWorld(`reload-on-${islands[k].id}`);
          await toBoard(true);
          check((await left()) === of - 1, `after the reload, ${of - 1} blank plaque(s) left (${await left()})`);
        }
        const f = await engrave(v, `plaque-refused-${v.join('-')}`);
        facts.push(f);
        const kind = v[0] * B === A * v[1] ? 'not finished' : 'not the result';
        check(
          f.length > 5 && !/\d/.test(f) && !WRONG_RE.test(f),
          `${v.join('/')} (${kind}): refused with a sentence, NO number, never « faux » (« ${f} »)`,
        );
        check((await left()) === of - n - 1, `${of - n - 1} blank plaque(s) left (${await left()})`);
      }
      check(
        facts[0] !== facts[1],
        `an unfinished writing and a writing that is not the result get two different sentences`,
      );
      // ── the run spent: the boxes closed, the walk back to the quay ──
      check(
        (await attr('[data-di-mission]', 'data-di-mission')) === 'over' &&
          (await page.locator('[data-di-mission-over]').count()) === 1 &&
          (await page.locator('[data-di-mission-check], [data-di-mission] [data-rf-use]').count()) === 0,
        'no blank plaque left: the run is over, its sentence shown, no box, no « engrave »',
      );
      await w.shot(page, 'plaque-spent', OUT);
      await page.click('[data-di-mission-later]');
      await W.ff(0.4);
      const quay = m.refill?.at;
      expect(Number.isInteger(quay) && quay < k, `the mission sends him back to a quay behind him (${quay})`);
      check(
        (await W.road()).objective.includes(islands[quay].name),
        `the instruction sends him back to « ${islands[quay].name} »`,
      );
      await shotWorld(`plaque-spent-${islands[k].id}`);
      await toBoard(false);
      for (let i = k - 1; i >= quay; i -= 1)
        await W.walkBack(i, `walk-back-to-${islands[i].id}`, (label) => shotWorld(label));
      await W.ff(0.6);
      check(
        await page.evaluate(() => window.__world.flags.missionRun == null),
        `on « ${islands[quay].name} »: a new run of plaques`,
      );
      await shotWorld(`quay-${islands[quay].id}`);
      for (let i = quay; i < k; i += 1) await W.crossAgain(i, `${islands[i].id} → ${islands[i + 1].id} again`);
      await page.waitForTimeout(300);
      expect((await W.road()).island === k, `back on « ${islands[k].name} »`);
      // ── the right plaque ──
      await toBoard(true);
      check((await left()) === of, `two new blank plaques (${await left()})`);
      await page.evaluate(() => {
        const gw = window.__world;
        window.__modulesDone = [];
        const real = gw.onModule;
        gw.onModule = (n) => {
          window.__modulesDone.push(String(n));
          return real.call(gw, n);
        };
      });
      await engrave(right, null);
      await W.ff(0.8);
      const j1 = await jetty();
      const mods = await page.evaluate(() => window.__modulesDone ?? []);
      expect(
        (await W.st()).overlay == null && j1.complete,
        `${right.join('/')} is engraved: the plaque closes, the road « ${seg.id} » stands`,
      );
      check(
        j1.n > 0 && j1.red * right[1] === j1.n * right[0] && j1.lit * ww === j1.n * z && j1.red * y === j1.lit * x,
        `the lanterns light: ${j1.lit} of ${j1.n} lit (${z}/${ww}), ${j1.red} of the lit red (${x}/${y}), ${j1.red} of ${j1.n} red = ${right.join('/')} — computed here`,
      );
      check(mods.length >= 1, `solving the plaque marks a module of the lesson (${mods.join(', ') || 'none'})`);
      await shotWorld(`jetty-lit-${islands[k].id}`);
      await W.cross(k);
      await page.waitForTimeout(300);
      expect((await W.road()).island === k + 1, `over the lit road he reaches « ${islands[k + 1].name} »`);
      lap('the plaque');
      return k + 1;
    };

    // the walkway, a lone standing bridge, the mission with a day box (walkwayStory.mjs — lesson 4)
    const lw = walkwayPlayers({
      w,
      page,
      W,
      L,
      D,
      segs,
      islands,
      convoys,
      OUT,
      shotWorld,
      lap,
      hook: ctx.hook,
      forbid,
      islandsForbid,
    });

    // ══ the road, island by island ══
    let k = 0;
    try {
      for (let guard = 0; guard < segs.length + 2; guard += 1) {
        await ctx.hook(`island:${islands[k]?.id}:before`);
        await forges();
        const seg = segs[k];
        // past the last segment: a final mission that is not a plaque (`story.mission` without `write`) waits here
        if (!seg && L.lesson.story.mission && !L.lesson.story.mission.write) await lw.dayMission(k);
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
        } else if (L.lesson.story.mission?.write && L.lesson.story.mission.opens === seg.id) {
          // the road a plaque opens (`story.mission.write` + `opens`): the plaque first
          k = await plaque(k);
        } else if (seg.kind === 'walkway') {
          k = await lw.walkway(k);
        } else if (await lw.isLoneStanding(k)) {
          k = await lw.standing(k);
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
    // a story with NO store (no `boss` segment — trouver-le-pgcd, 2026-11-23): its last convoy lands on the last island,
    // which plays the finale by itself (`Game.js › arrive` → `finale`): the clock runs until the end screen
    if (!segs.some((s) => s.boss) && (await W.st()).overlay !== 'end') {
      let shotFinale = false;
      for (let n = 0; n < 60 && (await W.st()).overlay !== 'end'; n += 1) {
        await W.ff(0.5);
        if (!shotFinale && (await W.st()).phase === 'end') {
          await page.waitForTimeout(300);
          await w.shot(page, 'finale', OUT);
          shotFinale = true;
        }
      }
      check(shotFinale, 'the last convoy lands on the last island: the finale plays (the lighthouse)');
      await page.waitForTimeout(600);
      await w.shot(page, 'end', OUT);
    }
    expect((await W.st()).overlay === 'end', 'the story is played to its end');
    for (const x of waits) console.log(`WAIT  ${x}`);
  });
  return w;
}
