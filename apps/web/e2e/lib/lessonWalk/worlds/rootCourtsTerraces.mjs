// « قصر الساحات » — the STORY of a lesson whose terraces hold SEVERAL courts (`natiqa-ghayr-natiqa`, the first; GAME_WORLD.md
// §2ter-3 « A terrace of several courts »), played terrace by terrace from the lesson's own `story.terraces`, as a student
// who reads only the screen: at each moment he goes where the world SHOWS a light (a court whose corner post is lit, a
// feature under its column of light, the pavilion), takes what it offers, and stops ON each mark of the rod's dial.
// A lesson with a building yard or a course of gates (lesson 1) is played by ./rootCourts.mjs › rcStoryWalk instead.
//
// What is done BY HAND (keys and buttons of the screen): « ابدأ », E at a post / a mirror / the pavilion, the yes/no card of
// a court that asks it (`[data-rc-guess]`), ← → held along the wall until the dial SHOWS the mark (released there), the
// dial's buttons (`[data-rc-set-step]`), X, the key taken with E, the forges and their experiment through their buttons,
// the mission's boxes. BY THE DEV HANDLE (`window.__world`): the robot PLACED at a post or a feature, the clock
// fast-forwarded, the state READ for the question (which lamp is lit, the court in his hand, whether a court was closed,
// its label) — never for an answer: every mark, every verdict, every guess is computed here (./exact.mjs) from the
// court's area, which the gate shows.
import { createWalk } from '../../walk.mjs';
import { worldShot, wordsRe } from '../checks.mjs';
import { playForge } from '../forge.mjs';
import { rcWorld } from './rootCourts.mjs';
import { cmp, eq, isqrt, mul, q, rootOf, sq, write } from './exact.mjs';

const WRONG_WORDS = /خطأ|خاطئ|غلط/;
const SEALED = 'لا علامة تركبها';

/** The two neighbouring marks of a dial of step `s` that the wall of a court of area `a` ends between (exact). */
export function marksAround(a, s) {
  const A = q(a);
  const S = q(s);
  // ⌊√(a / s²)⌋ = ⌊√⌊a / s²⌋⌋
  const m = isqrt((A.n * S.d * S.d) / (A.d * S.n * S.n));
  return { lo: write(mul(String(m), s)), hi: write(mul(String(m + 1n), s)) };
}
/** Does a mark of the dial of step `s` ride the court of area `a`? Its side must be a number AND a multiple of s. */
export function ridesOnDial(a, s) {
  const r = rootOf(a);
  if (!r) return false;
  const S = q(s);
  return (r.n * S.d) % (r.d * S.n) === 0n;
}

/**
 * Every text node of the screen that writes a fraction « p/q » with a slash. A count of the kit spaced « 5 / 6 » (the
 * progress page) and the stars of the top bar (a score in its pill) are not fractions.
 */
export const slashFractions = (page) =>
  page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || el.closest('annotation, script, style, .di-pill, [aria-hidden="true"]')) continue;
      const m = n.textContent.replace(/[⁦⁩]/g, '').match(/(?<![\d,.])\d+\/\d+(?![\d,])/);
      if (!m) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || getComputedStyle(el).visibility === 'hidden') continue;
      out.push(m[0]);
    }
    return out.length ? out : null;
  });

export async function rcTerracesWalk(L, D, opts) {
  const w = createWalk(`lesson-${L.id}-story`, opts);
  const { expect, check } = w;
  const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
  const ST = L.lesson.story;
  const keys = L.lesson.keys;
  const S = D.story ?? {};
  const T0 = Date.now();
  const lap = (what) => console.log(`TIME  ${what}: ${Math.round((Date.now() - T0) / 1000)} s`);

  await w.run(async () => {
    const { page } = await w.student({ uid: D.uid ?? 9900, lessonId: L.id, url: L.url, grade: L.grade });
    const W = rcWorld(w, page, L);
    const { s, ff, act } = W;
    const wordsOf = (key) => [...(D.forbidden?.[key] ?? []), L.lesson.rules[key].title];
    let earned = [];
    const unearned = () => keys.filter((k) => !earned.includes(k));
    const forbid = () => wordsRe(unearned().flatMap(wordsOf));
    // every screen of the story: never « wrong »; no name of a key before its tablet — the lesson's own title on the
    // title screen excepted (the platform's name of the lesson, not the world telling)
    const shot0 = w.shot;
    w.shot = async (pg, label, o) => {
      const t = await pg.evaluate(() => {
        const c = document.body.cloneNode(true);
        c.querySelectorAll('.di-title__eyebrow').forEach((e) => e.remove());
        return c.innerText ?? c.textContent;
      });
      const m = t.match(WRONG_WORDS);
      check(!m, `${label}: no screen says « wrong »${m ? ` — « ${m[0]} »` : ''}`);
      const tablet = /^tablet-(\d)$/.exec(label);
      for (const k of unearned()) {
        if (tablet && keys[Number(tablet[1]) - 1] === k) continue;
        const re = wordsRe(wordsOf(k));
        const b = re && t.match(re);
        check(!b, `${label}: before the tablet of « ${k} », no screen names it${b ? ` — « ${b[0]} »` : ''}`);
      }
      return shot0(pg, label, o);
    };
    const shotWorld = (label) => worldShot(w, page, label, forbid(), OUT);
    const ctx = { w, page, W, L, D, OUT, forbid, forbidOf: (k) => wordsRe(wordsOf(k)), startLabel: null, first: true };
    ctx.hook = async (name) => {
      const step = D.steps?.[name];
      if (step) {
        console.log(`NOTE  the lesson's own step « ${name} »`);
        await step(ctx);
      }
    };
    const courtView = (id) =>
      page.evaluate((cid) => {
        const g = window.__world;
        const c = g.courts.find((x) => x.id === cid);
        return {
          lamp: c.parts.lamp.visible,
          sealed: Boolean(g.sealed[cid]),
          label: c.sealLabel.visible ? c.sealLabel.userData.text : null,
          ridden: Boolean(c.ridden),
          holding: Boolean(g.hold),
          say: g.getState().say?.text ?? '',
        };
      }, id);
    const guessed = {};
    let putDownTried = false;
    let reloaded = false;

    // ══ a forge, opened by its mirror ══
    const forge = async (key, how) => {
      expect((await s()).overlay === 'forge', `${how}: the forge « ${key} » opens`);
      await playForge(ctx, key);
      ctx.first = false;
      earned = (await s()).keys;
      await ff(0.6);
      await page.waitForTimeout(300);
      lap(`forge ${key}`);
      if (earned.length === 1) {
        // the tablet closed: it flew to « قواعدي » in the top bar, which opens the rules sheet (D33)
        expect(
          (await page.locator('[data-di-rules]').count()) === 1,
          'the tablet closed: « قواعدي » stands in the top bar',
        );
        await page.click('[data-di-rules]');
        await page.waitForTimeout(400);
        check(
          (await s()).overlay === 'rules' &&
            ((await page.textContent('.di-veil').catch(() => '')) ?? '').includes(L.lesson.rules[key].title),
          `« قواعدي » opens the rules sheet on « ${L.lesson.rules[key].title} »`,
        );
        await w.shot(page, 'rules-sheet', { exit: ['[data-di-rules-close]'] });
        await page.click('[data-di-rules-close]');
        await ff(0.3);
        expect((await s()).overlay == null, 'closing the sheet: back in the world');
      }
      if (!reloaded && key === (S.reloadAfter ?? keys[0])) {
        // a page RELOADED in the middle of the journey: it resumes where he was, with what he owns
        reloaded = true;
        const at = (await s()).at;
        await W.reload();
        const x = await s();
        check(
          x.at === at && x.keys.includes(key) && x.phase === 'play',
          `reloaded after forge « ${key} »: the journey resumes on « ${at} », the key kept (${x.at}, ${x.keys.join(',')})`,
        );
        await shotWorld('after-reload');
      }
    };

    // ══ what the world says when a court asked « will it ride? » is done ══
    const guessSaid = async (c, rides) => {
      if (guessed[c.id] == null) return;
      const T = { right: 'كما توقّعتَ', rode: 'قلتَ إنّها لا تُركب', sealed: 'قلتَ إنّها تُركب' };
      const want = guessed[c.id] === rides ? T.right : rides ? T.rode : T.sealed;
      // the key flies to him first (about half a second): the sentence comes when it is his
      let said = (await s()).say;
      for (let k = 0; k < 10 && !said.includes(want); k += 1) {
        await ff(0.15);
        said = (await s()).say;
      }
      check(
        said.includes(want),
        `court ${c.a}: he had said « ${guessed[c.id] ? 'تُركب' : 'لا تُركب'} », it ${rides ? 'rode' : 'was closed'} — the robot says so (« ${said.slice(0, 70)} »)`,
      );
    };

    // ══ a court closed by the world: a band and a jam on two neighbouring marks of the finest dial ══
    const closed = async (c, finest, lowered) => {
      const x = await courtView(c.id);
      check(
        x.sealed && x.label === SEALED && !x.holding && !x.lamp,
        `court ${c.a}: a band and a jam on two neighbouring marks of ${finest} (${lowered.join(', ')}) — the world closes it: « ${SEALED} » over it (${x.label}), the rod released, its lamp out`,
      );
      await guessSaid(c, false);
      if (guessed[c.id] == null)
        check(
          /بين/.test(x.say) && !WRONG_WORDS.test(x.say),
          `court ${c.a}: the robot says what closed it (« ${x.say.slice(0, 80)} »)`,
        );
      await shotWorld(`closed-${c.a}`);
      const said = await W.placeAt({ court: c.id }, true);
      check(!said, `court ${c.a} closed: its corner post offers nothing any more (« ${said} »)`);
    };

    // ══ a court: the rod, mark by mark of each dial, until it rides — or the world closes it, or takes the rod back ══
    const playCourt = async (t, c, done) => {
      const label = `court-${c.a}`;
      const said = await W.placeAt({ court: c.id }, true);
      expect(
        said?.includes('أمسك المقياس'),
        `${label}: at its corner post the screen offers « أمسك المقياس » (« ${said} »)`,
      );
      await act();
      await ff(0.2);
      if ((await s()).overlay === 'guess') {
        // the yes/no card, BEFORE the first try: as he would — and once the other way (the descriptor's `story.guess`)
        const steps0 = c.steps ?? ['1'];
        const truth = ridesOnDial(c.a, steps0.at(-1));
        const say = S.guess?.[c.id] ?? (truth ? 'yes' : 'no');
        const card = (await page.textContent('.di-card').catch(() => '')) ?? '';
        check(
          card.includes(c.a) && (await page.locator('[data-rc-guess]').count()) === 2,
          `${label}: before the first try the court asks « will a mark of this terrace ride it? » — two answers (« ${card.trim().slice(0, 80)} »)`,
        );
        if (!Object.keys(guessed).length) await w.shot(page, `guess-${c.a}`, OUT);
        await page.click(`[data-rc-guess="${say}"]`);
        await ff(0.2);
        guessed[c.id] = say === 'yes';
        console.log(
          `NOTE  ${label}: he says « ${say === 'yes' ? 'تُركب' : 'لا تُركب'} » (a mark of ${steps0.at(-1)} ${truth ? 'rides it' : 'does not'} — computed here)`,
        );
      } else if (c.ask === 'rides' && guessed[c.id] == null)
        check(false, `${label}: a court with « ask: 'rides' » asks before its first try`);
      expect((await s()).rod != null, `${label}: E — the rod is in his hand`);
      if (!putDownTried) {
        // D26: whatever he takes he can put down at any moment — X half-way, and the button « ضع المقياس »
        putDownTried = true;
        const half = write(mul(q(c.steps?.[0] ?? '1'), '3'));
        await W.walkTo(half);
        await page.keyboard.press('KeyX');
        await ff(0.2);
        check(!(await s()).holding, `X: the rod is put down half-way (at ${half})`);
        await W.placeAt({ court: c.id }, true);
        await act();
        await ff(0.2);
        await W.walkTo(half);
        await worldShot(w, page, 'rod-in-hand-drop-button', forbid(), OUT);
        await page.click('[data-rc-drop]');
        await ff(0.2);
        check(!(await s()).holding, '« ضع المقياس »: the button puts the rod down too');
        await W.placeAt({ court: c.id }, true);
        await act();
        await ff(0.2);
        expect((await s()).rod != null, `${label}: taken again`);
      }
      const rod0 = (await s()).rod;
      const steps = rod0.steps;
      const finest = steps.at(-1);
      // the clamp: the instruction sends him to the far corner (a court whose wall the story lets him take)
      if (/الركن/.test((await s()).objective)) {
        const { lo } = marksAround(c.a, steps[0]);
        const far = write(mul(steps[0], '3')); // three marks from the post: far from the far corner
        await W.walkTo(far);
        const p0 = await W.prompt();
        check(!/ثبّت/.test(p0 ?? ''), `${label}: far from the corner, no clamp offered (« ${p0} »)`);
        await W.walkTo(lo);
        const p1 = await W.prompt();
        check(
          /ثبّت/.test(p1 ?? ''),
          `${label}: stopped ON the mark ${lo}, at the far corner — « ثبّت المقياس على الركن » (« ${p1} »)`,
        );
        await worldShot(w, page, `clamp-${c.a}`, forbid(), OUT);
        await act();
        expect(await W.until((x) => x.verdict != null, 8, 0.1), `${label}: the clamped rod — the world answers`);
        const v = await page.getAttribute('[data-di-verdict]', 'data-di-verdict');
        check(v === 'ride', `${label}: the rod taken from the wall of ${c.a} rides (${v}) — the wall is its side`);
        await shotWorld(`wall-${c.a}`);
        await rode(t, c, done, 'the wall');
        return;
      }
      const lowered = [];
      for (const step of steps) {
        if ((await s()).rod.step !== step) {
          await page.click(`[data-rc-set-step="${step}"]`);
          await ff(0.15);
          check((await s()).rod.step === step, `${label}: the dial's marks are now ${step}`);
        }
        const { lo, hi } = marksAround(c.a, step);
        const exact = eq(sq(lo), c.a);
        for (const m of exact ? [lo] : [lo, hi]) {
          if (lowered.includes(m) || cmp(m, '0') <= 0) continue;
          await W.walkTo(m);
          const out = await W.lower(`${label} with ${m}`, {
            shotName: lowered.length === 0 && !done.size ? `${label}-${m}` : null,
            forbid: forbid(),
            OUT,
          });
          lowered.push(m);
          if (out.kind === 'ride') {
            await rode(t, c, done, label);
            return;
          }
          await W.settle();
          const x = await courtView(c.id);
          if (x.sealed) {
            await closed(c, finest, lowered);
            done.add(c.id);
            return;
          }
          if (!x.holding) {
            // the story took the rod back: this court has nothing more to give for now — the world says why
            check(
              x.say.length > 10 && !WRONG_WORDS.test(x.say),
              `${label}: the rod returns to its post BY ITSELF and the world says why (« ${x.say.slice(0, 90)} »)`,
            );
            await shotWorld(`${label}-released`);
            return;
          }
        }
      }
      expect(false, `${label}: every dial played (${lowered.join(', ')}) — the court neither rode nor was closed`);
    };

    // ══ after a ride: the key; the platform carries him on when the court is the way out and the terrace is finished ══
    const rode = async (t, c, done, label) => {
      const others = t.courts.filter((x) => x.id !== c.id && !done.has(x.id));
      const leaves = Boolean(c.to) && others.length === 0;
      // what he had said before trying is answered as soon as he takes the key — on a way out too, before « انطلقنا »
      await W.keyed(label, {
        id: c.id,
        to: leaves ? c.to : null,
        shotName: `${label}-key`,
        forbid: forbid(),
        OUT,
        taken: () => guessSaid(c, true),
      });
      done.add(c.id);
      const x = await courtView(c.id);
      if (!leaves) check(!x.lamp, `court ${c.a} ridden: its lamp is out`);
      if (c.to && !leaves) {
        const p = await W.placeAt({ court: c.id }, true);
        check(
          !p,
          `court ${c.a} is the way out, ${others.length} court(s) of « ${t.name} » left: its platform WAITS — no flight offered (« ${p} »)`,
        );
        await shotWorld(`waits-${c.a}`);
      }
      if (leaves) await shotWorld(`landed-${c.to}`);
    };

    // ══ the final mission ══
    const mission = async () => {
      const said = await W.placeAt({ pavilion: true }, true);
      expect(said?.includes(ST.mission.prompt), `the pavilion offers « ${ST.mission.prompt} » (« ${said} »)`);
      await shotWorld('pavilion');
      await act();
      await page.waitForSelector('[data-rc-mission]');
      const lead = await page.locator('.rc-mission__lead annotation').allTextContents();
      const sol = D.mission(lead);
      const fracs = await page.$$eval('[data-rc-mission] [data-rf-frac]', (els) => els.map((e) => e.dataset.rfFrac));
      check(fracs.length >= 1, `the mission's fraction is typed over a real bar (${fracs.join(', ')})`);
      const miss = D.missionMiss(sol);
      for (const [k, v] of Object.entries(miss.values))
        await page.fill(`[data-rc-mission] [data-rf-use="${k}"]`, String(v));
      await w.shot(page, 'mission', OUT);
      await page.click('[data-rc-mission-check]');
      await page.waitForTimeout(250);
      const f = ((await page.textContent('[data-rc-mission-fact]').catch(() => '')) ?? '').trim();
      check(
        f.length > 5 && !WRONG_WORDS.test(f) && miss.fact(f),
        `a near miss (${miss.what}): the mission answers with a FACT (« ${f.slice(0, 100)} »)`,
      );
      await w.shot(page, 'mission-fact', OUT);
      for (const [k, v] of Object.entries(sol)) await page.fill(`[data-rc-mission] [data-rf-use="${k}"]`, String(v));
      await page.click('[data-rc-mission-check]');
      await ff(0.4);
      check((await s()).overlay !== 'mission', `the mission solved (${JSON.stringify(sol)} — computed here)`);
    };

    // ══ the title ══
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    if (L.config?.title)
      check(
        ((await page.textContent('.di-title__eyebrow').catch(() => '')) ?? '').includes(L.config.title),
        `the title names the lesson « ${L.config.title} »`,
      );
    await w.shot(page, 'title', OUT);
    ctx.startLabel = await W.start();
    expect((await s()).phase === 'play', 'the game starts in play phase');
    await ff(0.6);
    await shotWorld('start');
    lap('title');

    // ══ the terraces, in order: at each moment, what the world lights ══
    for (const t of ST.terraces) {
      expect((await s()).at === t.id, `he stands on « ${t.name} » (${(await s()).at})`);
      await ctx.hook(`terrace:${t.id}:before`);
      const done = new Set();
      for (let guard = 0; guard < 20; guard += 1) {
        const view = await page.evaluate((tid) => {
          const g = window.__world;
          const T = g.ter.find((x) => x.id === tid);
          return {
            at: g.ter[g.getState().at].id,
            beam: Boolean(T.beam?.beam.visible),
            open: T.courts.filter((c) => c.parts.lamp.visible).map((c) => c.id),
          };
        }, t.id);
        if (view.at !== t.id) break;
        if (view.beam && t.feature) {
          const p = await W.placeAt({ feature: true }, true);
          expect(p?.includes(t.feature.prompt), `the column of light: « ${t.feature.prompt} » (« ${p} »)`);
          await shotWorld(`feature-${t.feature.id}`);
          await act();
          await ff(0.3);
          await forge(t.feature.forge, `the ${t.feature.kind} of « ${t.name} »`);
          continue;
        }
        if (view.open.length) {
          const order =
            S.order?.[t.id] ?? [...t.courts.filter((c) => !c.to), ...t.courts.filter((c) => c.to)].map((c) => c.id);
          const id = order.find((x) => view.open.includes(x)) ?? view.open[0];
          await playCourt(
            t,
            t.courts.find((c) => c.id === id),
            done,
          );
          continue;
        }
        if (t.id === ST.end) {
          if (ST.mission) await mission();
          break;
        }
        // nothing lit here: the way out's platform waits — he boards it
        const out = t.courts.find((c) => c.to);
        expect(out, `« ${t.name} » finished: a way out`);
        const p = await W.placeAt({ court: out.id }, true);
        expect(
          /اركب المنصّة/.test(p ?? ''),
          `« ${t.name} » finished: the platform of ${out.a} offers the flight (« ${p} »)`,
        );
        await act();
        await W.settle(out.to);
        await shotWorld(`landed-${out.to}`);
        break;
      }
      lap(`« ${t.name} »`);
    }
    expect(await W.until((x) => x.overlay === 'end', 20, 0.25), 'the end screen shows');
    await w.shot(page, 'end', OUT);
    check(reloaded, 'the journey was reloaded once in the middle');
    for (const [id, said] of Object.entries(guessed))
      console.log(`NOTE  ${id}: he said « ${said ? 'تُركب' : 'لا تُركب'} »`);
    lap('the end');
  });
  return w;
}
