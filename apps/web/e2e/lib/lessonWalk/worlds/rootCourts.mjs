// « Le palais des dalles » (`gameworld/rootCourts/`, GAME_WORLD.md §2ter-3) in the lesson walk: its gestures, its STORY played
// from the lesson's own `story.terraces`, its course of gates and its practice levels on the kit's rail (`kit/GateRun.js`,
// `data-gr-*`), the board's `court` station. The islands' code (../story.mjs, ../world.mjs) never reaches this file.
//
// What is done BY HAND (keys and buttons of the screen, as a student does): « Commencer l’aventure », E at a post / a feature / the
// pavilion, ← → held along the wall until the rod's dial shows the mark (and released THERE: a hand stops on a mark),
// the dial's buttons, X and « Pose la toise », the yes/no card of a court that asks it, the key taken with E, the forges and experiments through their buttons, the
// lanes of the rail with ← →, the mission's boxes. What is done BY THE WORLD'S DEV HANDLE (`window.__world`), as the
// islands' walks do: the robot PLACED at a post, a pad, a feature, the pavilion (`hero.pos`); the clock fast-forwarded
// (`step`); the state READ for the question (where he stands, the rod's mark, the run's stage) — never for an answer:
// every verdict is computed by ./exact.mjs from what the screen shows.
import { createWalk } from '../../walk.mjs';
import { namesOf, WORLD_LESSONS } from '../../lessonWords.mjs';
import { worldShot, wordsRe, WRONG_WORD } from '../checks.mjs';
import { playForge } from '../forge.mjs';
import { worldOf } from '../world.mjs';
import { cmp, eq, isqrt, platform, q, sub, write } from './exact.mjs';
import { rcTerracesWalk } from './rootCourtsTerraces.mjs';
import { playRail, railPractice } from '../gateRun.mjs';

/** A sentence that calls an answer wrong (../checks.mjs › WRONG_WORD). */
const WRONG_WORDS = WRONG_WORD;
/**
 * The nouns of the islands (« planche », « pont », « fossé », « île », « archipel », « moule »), whole words only, and the
 * names the tool must not take (rootCourts/strings.js: the tool is « la toise » — not a « baguette », a « tige » nor a
 * « règle graduée »; the word « règle » alone is the forge's rule, so it is not refused). Defects.md D25.
 */
const ISLAND_NOUNS =
  /(?<!\p{L})(?:planches?|ponts?|fossés?|îles?|îlots?|archipels?|moules?|baguettes?|tiges?|règles? graduées?)(?!\p{L})/iu;

/** Every string inside a value (functions left out). */
function stringsOf(v, out = [], seen = new Set()) {
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object' && !seen.has(v)) {
    seen.add(v);
    for (const x of Object.values(v)) stringsOf(x, out, seen);
  }
  return out;
}

export const ROOT_COURTS = {
  id: 'root-courts',
  /** The story's player (../story.mjs hands it a lesson of this world). */
  story: (L, D, opts) => rcStoryWalk(L, D, opts),
  /** The hub's « Continuer l’entraînement » (../hub.mjs, part 4): a practice level on the kit's rail. */
  practice: (args) => railPractice(args),
  /** The names of every lesson of the islands that this lesson's own text never writes (lib/lessonWords.mjs › namesOf). */
  foreignWords(L, extra = []) {
    const own = stringsOf([L.lesson, L.script, L.memo, L.config]).join('\n');
    const out = new Set();
    for (const id of WORLD_LESSONS) for (const n of namesOf(id)) if (!own.includes(n)) out.add(n);
    for (const x of extra) if (!own.includes(x)) out.add(x);
    return [...out];
  },
  /** What no screen of this world's lessons shows (every part's `shot`, lib/walk.mjs › textRules). */
  textRules: [{ re: ISLAND_NOUNS, what: 'no noun of the islands and no other name for the tool (it is « la toise »)' }],
};

// ───────────────────────────── the gestures ─────────────────────────────
export function rcWorld(w, page, L) {
  const base = worldOf(w, page, L); // the world-generic ones: tp, act, start, leaveAndReturn, reload
  const { tp, act } = base;
  /**
   * The world's clock forward — after the kit's flight of a closed tablet to « Mes règles » (`kit/Tablet.jsx › flyToRules`,
   * 0.75 s of REAL time before the tablet is closed and the key earned): the walk lets the flight end first.
   */
  const ff = async (sec) => {
    const flying = await page.evaluate(() =>
      [...document.querySelectorAll('.di-card')].some((c) => c.style.transform.includes('scale(0.05)')),
    );
    if (flying)
      await page
        .waitForFunction(
          () => ![...document.querySelectorAll('.di-card')].some((c) => c.style.transform.includes('scale(0.05)')),
          null,
          { timeout: 3000 },
        )
        .catch(() => {});
    await base.ff(sec);
  };
  const { expect, check } = w;
  const s = () =>
    page.evaluate(() => {
      const g = window.__world;
      const x = g.getState();
      return {
        phase: x.phase,
        at: g.ter[x.at].id,
        overlay: x.overlay?.type ?? null,
        o: x.overlay,
        objective: x.objective ?? '',
        keys: x.keys,
        rod: x.rod ? { s: x.rod.s, a: x.rod.a, step: x.rod.step, steps: x.rod.steps, left: x.rod.left } : null,
        last: x.last,
        verdict: x.verdict,
        run: x.run,
        say: x.say?.text ?? '',
        holding: Boolean(g.hold),
      };
    });
  const blur = () => page.evaluate(() => document.activeElement?.blur?.());
  /** The « E » bubble as the screen shows it (null when none). */
  const prompt = () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-di-wprompt]');
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return b.width > 0 && getComputedStyle(el).visibility !== 'hidden' ? el.textContent.trim() : null;
    });
  /** Places the robot (dev handle) where a thing of the world stands, then lets the world see him there. */
  const placeAt = async (where, label) => {
    const p = await page.evaluate((wh) => {
      const g = window.__world;
      if (wh.court) {
        const c = g.courts.find((x) => x.id === wh.court);
        return wh.pad ? [c.pad.x, c.pad.z] : [c.post.x, c.rail];
      }
      if (wh.yard) return [g.yards[0].post.x, g.yards[0].rail];
      const t = g.ter[g.getState().at];
      if (wh.feature) return [t.featureAt.x, t.featureAt.z + 2.4];
      const e = g.ter[g.endAt];
      return [e.x, e.z + 0.6];
    }, where);
    await tp(p[0], p[1]);
    await ff(0.4);
    await page.waitForTimeout(150);
    return label ? prompt() : null;
  };
  const until = async (test, sec = 20, step = 0.25) => {
    for (let t = 0; t < sec / step; t += 1) {
      if (test(await s())) return true;
      await ff(step);
    }
    return test(await s());
  };
  /** A square says its length on BOTH sides: the bar and its label along the side wall too (3D, read by the dev handle). */
  const sides = async (target) => {
    const x = await page.evaluate(() => {
      const g = window.__world;
      return {
        bar: g.rodBar.visible,
        side: g.sideBar.visible,
        label: g.sideLabel.visible ? g.sideLabel.userData.text : null,
        front: g.rodLabel.visible ? g.rodLabel.userData.text : null,
        lenFront: g.rodBar.scale.x,
        lenSide: g.sideBar.scale.z,
      };
    });
    check(
      x.bar &&
        x.side &&
        x.label === x.front &&
        eq(q(x.label ?? '0'), target) &&
        Math.abs(x.lenFront - x.lenSide) < 1e-6,
      `the rod at ${target}: its length is written on BOTH sides of the square (front « ${x.front} », side « ${x.label} »)`,
    );
  };
  /**
   * How long ← or → is held to pass `n` marks of a fine dial (Game.js › stepWorld: min(3.1 / step, 4 + 45 t²) marks a
   * second, t the time the key has been held) — the walk still stops ON the mark: it releases short and finishes mark by mark.
   */
  const holdFor = (n, step) => {
    const cap = 3.1 / Number(step.replace(',', '.'));
    let [t, done] = [0, 0];
    while (done < n && t < 1.2) {
      done += Math.min(cap, 4 + 45 * t * t) * 0.01;
      t += 0.01;
    }
    return t;
  };
  /** The rod in his hand, walked mark by mark along the wall (← → held) until its dial SHOWS `target`, released there. */
  const walkTo = async (target) => {
    await blur();
    for (let k = 0; k < 900; k += 1) {
      const r = (await s()).rod;
      expect(r, `he holds the rod while he walks to ${target}`);
      if (eq(r.s, target)) {
        await ff(0.08);
        const now = (await s()).rod.s;
        expect(eq(now, target), `released on the mark ${target}, the dial still shows ${now}`);
        if (cmp(target, '0') > 0) await sides(target);
        return;
      }
      const dir = cmp(target, r.s) > 0 ? 'ArrowRight' : 'ArrowLeft';
      const marks =
        Math.abs(Number(write(q(target)).replace(',', '.')) - Number(r.s.replace(',', '.'))) /
        Number(r.step.replace(',', '.'));
      const hold = marks > 8 ? (r.step === '1' ? (marks - 1.5) / 3.1 : holdFor(marks - 1.5, r.step)) : 0.04;
      await page.keyboard.down(dir);
      await ff(Math.max(0.04, Math.min(hold, 1.2)));
      await page.keyboard.up(dir);
      await ff(0.04);
    }
    expect(false, `the rod's dial reaches ${target}`);
  };
  /** Takes the rod at a post (E), once the bubble says so. */
  const grab = async (where, label) => {
    const said = await placeAt(where, true);
    expect(
      said?.includes('Prends la toise'),
      `${label}: at its corner post the screen offers « Prends la toise » (« ${said} »)`,
    );
    await act();
    await ff(0.2);
    expect((await s()).rod != null, `${label}: E — the rod is in his hand`);
  };
  /** The court in his hand as the dev handle sees it (for the QUESTION: its area from the lesson's data, its gate). */
  const held = () =>
    page.evaluate(() => {
      const h = window.__world.hold;
      if (!h) return null;
      const c = h.court;
      return {
        id: c.id,
        yard: Boolean(c.yard),
        a: c.a,
        shown: c.shown !== false,
        plaque: c.parts?.plaque?.userData.text ?? null,
      };
    });
  /** Every number of the page's text, the counter at the top left out (it climbs TO the area: that is the count). */
  const pageText = () =>
    page.evaluate(() => {
      const c = document.body.cloneNode(true);
      c.querySelectorAll('[data-rc-count], script, style').forEach((e) => e.remove());
      return (c.innerText ?? c.textContent).replace(/[⁦⁩]/g, '');
    });
  const numRe = (a) => new RegExp(`(?<![\\d,.])${String(a).replace(',', '[,.]')}(?![\\d]|[,.]\\d)`);
  /**
   * A court nobody wrote (`hide: true`): while he pulls the rod its gate and the HUD say « ? » and no screen shows its
   * area (the page's text read whole, the counter left out).
   */
  const hiddenNow = async (label, area) => {
    const c = await held();
    const chip = await page.evaluate(
      () => document.querySelector('[data-rc-rod] .rc-rod__cell:nth-child(2) b')?.textContent,
    );
    const t = await pageText();
    check(
      c && !c.shown && c.plaque === '?' && chip === '?' && !numRe(area).test(t),
      `${label}: a court nobody wrote — its gate « ${c?.plaque} », the HUD « ${chip} », and no screen shows ${area} while he pulls the rod`,
    );
  };
  /**
   * After E: the platform comes down. A WHOLE rod (1 … 20) is COUNTED from above: the counter `[data-rc-count]` appears and
   * climbs to n × n (a yard's crate: to min(n², crate)), no product is on screen before the count ends; any other rod is
   * not counted. On a hidden court no screen shows its area before the count of a platform that rides has ended. Returns
   * once the world's verdict is set.
   */
  const watchCount = async (label, { rod, area, crate = null, hidden = false, shotName = null, OUT = undefined }) => {
    const n = /^\d+$/.test(rod) && Number(rod) >= 1 && Number(rod) <= 20 ? Number(rod) : 0;
    const total = n ? (crate != null ? Math.min(n * n, Number(crate)) : n * n) : 0;
    const re = numRe(area);
    let max = 0;
    let seen = false;
    let early = null;
    let leak = null;
    let steps = 0;
    let lens = false;
    for (; steps < 2000; steps += 1) {
      const x = await page.evaluate(() => {
        const g = window.__world;
        const st = g.getState();
        const el = document.querySelector('[data-rc-count]');
        return {
          count: el ? Number(el.dataset.rcCount) : null,
          shownNum: el ? el.textContent.trim() : null,
          eq: Boolean(document.querySelector('[data-rc-eq]')),
          verdict: st.verdict != null,
          cine: g.cine ? g.cine.pos.y - g.cine.look.y : null,
          nums: g.cellNums.visible,
        };
      });
      if (x.count != null) {
        seen = true;
        if (x.count > max) max = x.count;
        if (String(x.count) !== x.shownNum) early ??= `the counter shows « ${x.shownNum} » for ${x.count}`;
        if (x.nums && x.cine != null && x.cine > 8) lens = true;
      }
      if (n && x.eq && max < total) early ??= `a product on screen at ${max} of ${total}`;
      if (shotName && n && max >= Math.ceil(total * 0.6) && max < total) {
        await w.shot(page, shotName, OUT);
        shotName = null;
      }
      if (hidden && !x.verdict) {
        const t = await pageText();
        if (re.test(t)) leak ??= `at count ${max}: « ${(t.match(re) ?? [''])[0]} »`;
      }
      if (x.verdict) break;
      await ff(n ? 0.05 : 0.1);
    }
    if (n) {
      check(
        seen && max === total && !early,
        `${label}: ${rod} × ${rod} is COUNTED from above, tile by tile — the counter climbs to ${total}${crate != null ? ` (the crate holds ${crate})` : ''}, computed here (${max}); no product before the count ends${early ? ` — ${early}` : ''}`,
      );
      check(
        lens,
        `${label}: the lens has risen over the court and the tiles carry their numbers while they are counted`,
      );
    } else check(!seen, `${label}: a rod of ${rod} is not counted (no counter)`);
    if (hidden)
      check(
        !leak,
        `${label}: no screen shows the hidden area ${area} before the count has ended${leak ? ` — ${leak}` : ''}`,
      );
    return { counted: seen, max };
  };
  /** E with the rod at a mark: the platform comes down at once (no question), is counted when whole; the world's answer is checked HERE. */
  const lower = async (label, { shotName, forbid, OUT, area: given, countShot = null } = {}) => {
    const before = await s();
    const c = await held();
    const area = given ?? before.rod.a ?? c.a;
    const said = await prompt();
    expect(
      said?.includes(before.rod.s),
      `${label}: the bubble offers to lower the platform of ${before.rod.s} (« ${said} »)`,
    );
    if (!c.shown) await hiddenNow(label, area);
    await act();
    check(
      (await page.locator('[data-rc-predict]').count()) === 0 && (await s()).overlay !== 'predict',
      `${label}: lowering asks nothing — no typed prediction`,
    );
    const want = platform({ q: before.rod.s }, area);
    await watchCount(label, { rod: before.rod.s, area, hidden: !c.shown, shotName: countShot, OUT });
    expect(await until((x) => x.verdict != null, 10, 0.1), `${label}: the platform comes down and the world answers`);
    const v = await page.evaluate(() => {
      const el = document.querySelector('[data-di-verdict]');
      return { kind: el?.dataset.diVerdict ?? null, text: el?.textContent ?? '' };
    });
    const hiddenFact = !c.shown && want.kind !== 'ride';
    check(
      v.kind === want.kind &&
        (want.kind === 'ride' || (hiddenFact ? !numRe(want.diff).test(v.text) : v.text.includes(want.diff))) &&
        !WRONG_WORDS.test(v.text),
      `${label}: ${before.rod.s} × ${before.rod.s} = ${want.covers} on ${area} — ${want.kind}${want.kind === 'ride' ? '' : ` of ${want.diff}`}, computed here; said as a fact${hiddenFact ? ' WITHOUT a number (the court is not written)' : ''} (« ${v.text.trim().slice(0, 110)} »)`,
    );
    if (hiddenFact)
      check(!numRe(area).test(await pageText()), `${label}: a band or a jam on a hidden court leaves it hidden`);
    if (shotName) await worldShot(w, page, shotName, forbid, OUT);
    return want;
  };
  /**
   * After a platform rides: THE KEY OF THE COURT floats beside him, « Prends la clé de la salle » stands, nothing flies before E;
   * E takes it — the platform carries him to `to`, or (a court that stays, a way out that waits) leaves him where he is.
   * `hidden`: the area that the gate writes now. `reload`: the page is reloaded with the key floating instead — the key
   * is not shown again, the platform waits and E at its post boards it.
   */
  const keyed = async (label, { id, to = null, area = null, shotName, forbid, OUT, reload = false, taken = null }) => {
    expect(
      await until((x) => x.phase === 'play' && x.verdict == null, 10, 0.1),
      `${label}: the platform has ridden — the world is his again`,
    );
    const k = await page.evaluate(() => {
      const g = window.__world;
      const h = g.hero.pos;
      const m = g.keyMesh.position;
      return {
        court: g.keyCourt?.id ?? null,
        visible: g.keyMesh.visible,
        near: Math.hypot(m.x - h.x, m.z - h.z),
        at: g.ter[g.getState().at].id,
        plaque: g.keyCourt?.parts.plaque.userData.text ?? null,
      };
    });
    let said = null;
    for (let t = 0; t < 8 && !said; t += 1) {
      await ff(0.15);
      said = await prompt();
    }
    check(
      k.court === id && k.visible && k.near < 3 && said?.includes('Prends la clé de la salle'),
      `${label}: a golden key floats beside him (${k.near.toFixed(1)} m) and the screen says « Prends la clé de la salle » (« ${said} »)`,
    );
    if (area != null)
      check(k.plaque?.includes(area), `${label}: the count has ended — the gate writes the area now (« ${k.plaque} »)`);
    await ff(1.5);
    {
      const x = await s();
      check(
        x.at === k.at &&
          x.phase === 'play' &&
          /(?<!\p{L})clés?(?!\p{L})/iu.test(x.objective) &&
          (await page.evaluate(() => window.__world.keyCourt != null)),
        `${label}: nothing flies before he takes the key (${x.at}, ${x.phase}); the instruction names the key: « ${x.objective} »`,
      );
    }
    if (shotName) await worldShot(w, page, shotName, forbid, OUT);
    if (reload) {
      await base.reload();
      const r = await page.evaluate((cid) => {
        const g = window.__world;
        const c = g.courts.find((x) => x.id === cid);
        return { key: g.keyMesh.visible || g.keyCourt != null, ridden: Boolean(c.ridden), shuttle: c.shuttle };
      }, id);
      check(
        !r.key && r.ridden && r.shuttle === 'home',
        `${label}, reloaded with the key floating: the key is not shown again, the platform waits on its court (${JSON.stringify(r)})`,
      );
      if (to) {
        const p = await placeAt({ court: id }, true);
        check(/Monte sur la plateforme/.test(p ?? ''), `${label}, after the reload: E at its post boards the platform (« ${p} »)`);
        await act();
        await settle(to);
      }
      return;
    }
    await act();
    if (taken) await taken();
    if (to) await settle(to);
    else {
      await ff(0.6);
      const x = await s();
      check(
        x.phase === 'play' && x.at === k.at,
        `${label}: the key taken — a court that stays: he is still on « ${x.at} »`,
      );
    }
  };
  /** After a band or a jam: the platform back over the court, the world his again. After a ride: he lands on `to`. */
  const settle = async (to = null) => {
    expect(
      await until((x) => x.phase === 'play' && (!to || x.at === to), 30, 0.25),
      `the world is his again${to ? ` — he has landed on « ${to} »` : ''} (${JSON.stringify((await s()).at)})`,
    );
    await ff(0.3);
  };
  return {
    ...base,
    ff,
    s,
    prompt,
    placeAt,
    until,
    walkTo,
    grab,
    lower,
    settle,
    blur,
    keyed,
    watchCount,
    held,
    pageText,
    numRe,
    hiddenNow,
  };
}

// ───────────────────────────── the story ─────────────────────────────
const KEY_OF = (L, kind) => L.lesson.story.terraces.find((t) => t.feature?.kind === kind)?.feature.forge;

export async function rcStoryWalk(L, D, opts) {
  // a story without a building yard nor a course of gates — terraces of several courts, courts closed by the world, the
  // yes/no card — is played terrace by terrace from what the world lights (./rootCourtsTerraces.mjs; lesson 2 first)
  if (!L.lesson.story.terraces.some((t) => t.yard || t.feature?.kind === 'run')) return rcTerracesWalk(L, D, opts);
  const w = createWalk(`lesson-${L.id}-story`, opts);
  const { expect, check } = w;
  const OUT = { exit: ['[data-di-exit]', '.di-top a.di-icon'], numbers: true };
  const ST = L.lesson.story;
  const keys = L.lesson.keys;
  const [K1, K2, K3] = [KEY_OF(L, 'mirror'), KEY_OF(L, 'calculator'), KEY_OF(L, 'stations')];
  const court = (id) =>
    ST.terraces.flatMap((t) => t.courts.map((c) => ({ ...c, terrace: t.id }))).find((c) => c.id === id);
  const T0 = Date.now();
  const lap = (what) => console.log(`TIME  ${what}: ${Math.round((Date.now() - T0) / 1000)} s`);

  await w.run(async () => {
    const { page } = await w.student({ uid: D.uid ?? 9900, lessonId: L.id, url: L.url, grade: L.grade });
    const W = rcWorld(w, page, L);
    const { s, ff, act } = W;
    const wordsOf = (key) => [...(D.forbidden?.[key] ?? []), L.lesson.rules[key].title];
    let earned = [];
    const forbid = () =>
      wordsRe([
        ...keys.filter((k) => !earned.includes(k)).flatMap(wordsOf),
        ...(earned.length < keys.length ? (D.benchForbidden ?? []) : []),
      ]);
    const placesForbid = () => wordsRe(keys.filter((k) => !earned.includes(k)).flatMap(wordsOf));
    // every screen of the story: never « wrong »; before key 🔑's tablet, never the sign √ nor « racine » (D.beforeFirst)
    const shot0 = w.shot;
    w.shot = async (pg, label, o) => {
      // the lesson's own name on its title screen (the platform's, « Racine carrée d’un nombre positif ») is not the world telling
      const t = await pg.evaluate(() => {
        const c = document.body.cloneNode(true);
        c.querySelectorAll('.di-title__eyebrow').forEach((e) => e.remove());
        return c.innerText ?? c.textContent;
      });
      const m = t.match(WRONG_WORDS);
      check(!m, `${label}: no screen says « wrong »${m ? ` — « ${m[0]} »` : ''}`);
      // the tablet of 🔑 is where the word and the sign are said first
      if (!earned.includes(K1) && D.beforeFirst && label !== 'tablet-1') {
        const b = t.match(D.beforeFirst);
        check(!b, `${label}: before the first tablet, no « √ » and no « racine »${b ? ` — « ${b[0]} »` : ''}`);
      }
      return shot0(pg, label, o);
    };
    const shotWorld = (label) => worldShot(w, page, label, placesForbid(), OUT);
    const ctx = { w, page, W, L, D, OUT, forbid, forbidOf: (k) => wordsRe(wordsOf(k)), startLabel: null, first: true };
    ctx.hook = async (name) => {
      const step = D.steps?.[name];
      if (step) {
        console.log(`NOTE  the lesson's own step « ${name} »`);
        await step(ctx);
      }
    };
    const forge = async (key, how) => {
      const o = await s();
      expect(o.overlay === 'forge', `${how}: the forge « ${key} » opens (${o.overlay})`);
      await playForge(ctx, key);
      ctx.first = false;
      earned = (await s()).keys;
      await ff(0.6);
      await page.waitForTimeout(300);
      lap(`forge ${key}`);
    };
    const objIs = async (what, re) => {
      const o = (await s()).objective;
      check(re.test(o), `${what}: the instruction says so (« ${o} »)`);
    };
    /** Rides a court: rod to its side mark, E — counted, it rides; the key taken (E), he lands on its terrace. */
    const ride = async (id, side, label, { reload = false, bandFirst = false } = {}) => {
      const c = court(id);
      await W.grab({ court: id }, label);
      if (bandFirst) {
        // a band on a court nobody wrote: said without a number, the court stays « ? »
        const short = String(Number(side) - 1);
        await W.walkTo(short);
        await W.lower(`${label} with ${short}`, { shotName: `${label}-hidden-band`, forbid: placesForbid(), OUT });
        await W.settle();
      }
      await W.walkTo(side);
      await worldShot(w, page, `${label}-rod`, placesForbid(), OUT);
      const out = await W.lower(label, { shotName: label, forbid: placesForbid(), OUT });
      expect(out.kind === 'ride', `${label}: ${side} × ${side} = ${c.a}: the platform rides — computed here`);
      await W.keyed(label, {
        id,
        to: c.to,
        area: c.hide ? c.a : null,
        shotName: `${label}-key`,
        forbid: placesForbid(),
        OUT,
        reload,
      });
      await shotWorld(`landed-${c.to}`);
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
    lap('title');

    // ══ the yard: crates laid as squares — from the number of tiles to the side ══
    const crates = ST.terraces[0].yard?.crates ?? [];
    expect(crates.length >= 1, `the first terrace has a building yard (${crates.join(', ')})`);
    await objIs('the opening', new RegExp(crates[0]));
    {
      const first = ST.terraces[0].courts[0];
      const said = await W.placeAt({ court: first.id }, true);
      check(!said, `the court of ${first.a} offers nothing before the yard is built (« ${said} »)`);
    }
    for (const [ci, crate] of crates.entries()) {
      const side = Number(isqrt(Number(crate)));
      await W.grab({ yard: true }, `crate ${crate}`);
      // the first crate: a side that leaves tiles, one that lacks tiles, then the exact one
      const tries = ci === 0 ? [side - 1, side + 1, side] : [side];
      for (const t of tries) {
        await W.walkTo(String(t));
        const r = (await s()).rod;
        check(
          Number(r.left) === Number(crate) - t * t,
          `crate ${crate}, a side of ${t}: the crate counts ${crate} − ${t * t} = ${Number(crate) - t * t} (${r.left})`,
        );
        if (ci === 0) await worldShot(w, page, `yard-${crate}-side-${t}`, placesForbid(), OUT);
        const said = await W.prompt();
        check(
          said?.includes(String(t)),
          `crate ${crate}: the bubble offers to fix the square of side ${t} (« ${said} »)`,
        );
        await act();
        await W.watchCount(`crate ${crate}, side ${t}`, {
          rod: String(t),
          area: crate,
          crate,
          shotName: ci === 0 && t === side ? `yard-${crate}-count` : null,
          OUT,
        });
        expect(await W.until((x) => x.verdict != null, 8, 0.1), `crate ${crate}, ${t}: the world answers`);
        const want = platform({ q: String(t) }, crate);
        const v = await page.evaluate(() => ({
          kind: document.querySelector('[data-di-verdict]')?.dataset.diVerdict,
          text: document.querySelector('[data-di-verdict]')?.textContent ?? '',
        }));
        check(
          v.kind === want.kind && (want.kind === 'ride' || v.text.includes(want.diff)) && !WRONG_WORDS.test(v.text),
          `crate ${crate}, side ${t}: ${t} × ${t} = ${t * t} — ${want.kind === 'band' ? `${want.diff} tiles left` : want.kind === 'jam' ? `${want.diff} cells open` : 'the crate is empty and no cell open'} (« ${v.text.trim().slice(0, 80)} »)`,
        );
        if (ci === 0 || want.kind === 'ride')
          await worldShot(w, page, `yard-${crate}-${want.kind}`, placesForbid(), OUT);
        await W.settle();
      }
      expect(!(await s()).holding, `crate ${crate} built: the rod has left his hand`);
    }
    lap('the yard');

    // ══ the court of 30: rods 5 (a band) and 6 (a jam), the rod put down at any length ══
    const first = ST.terraces[0].courts[0];
    const small = ST.terraces[0].courts[1];
    const below = Number(isqrt(Number(first.a)));
    await objIs('the yard done', new RegExp(first.a));
    await W.grab({ court: first.id }, `the court of ${first.a}`);
    // D26: whatever he takes he can put down at any moment — the key X, then the button « Pose la toise »
    await W.walkTo('3');
    await page.keyboard.press('KeyX');
    await ff(0.2);
    check(!(await s()).holding && (await s()).rod == null, 'X: the rod is put down half-way (at 3)');
    await W.grab({ court: first.id }, `the court of ${first.a} again`);
    await W.walkTo('2');
    await worldShot(w, page, 'rod-in-hand-drop-button', placesForbid(), OUT);
    await page.click('[data-rc-drop]');
    await ff(0.2);
    check(!(await s()).holding, '« Pose la toise »: the button puts the rod down too (at 2)');
    await W.grab({ court: first.id }, `the court of ${first.a}, a third time`);
    await W.walkTo(String(below));
    await W.lower(`${first.a} with ${below}`, {
      countShot: `court-${first.a}-count-${below}`,
      shotName: `court-${first.a}-band`,
      forbid: placesForbid(),
      OUT,
    });
    await W.settle();
    {
      const x = await s();
      check(
        x.holding && x.last?.kind === 'band',
        `after the band the rod stays in his hand, its last fact beside it (${x.last?.kind})`,
      );
      await worldShot(w, page, `court-${first.a}-band-back`, placesForbid(), OUT);
    }
    await W.walkTo(String(below + 1));
    await W.lower(`${first.a} with ${below + 1}`, {
      shotName: `court-${first.a}-jam`,
      forbid: placesForbid(),
      OUT,
    });
    await W.settle();
    {
      const x = await s();
      check(!x.holding && x.rod == null, `a band AND a jam seen: the rod returns to its post BY ITSELF (D24)`);
      check(
        small.hide
          ? !W.numRe(small.a).test(x.objective) && /\bsalle\b/i.test(x.objective)
          : W.numRe(small.a).test(x.objective),
        `…and the instruction sends him to the next court${small.hide ? ` without writing its area ${small.a}` : ` of ${small.a}`} (« ${x.objective} »)`,
      );
      await worldShot(w, page, `court-${first.a}-released`, placesForbid(), OUT);
    }
    lap('the court of 30');

    // ══ courts 16 and 36: nobody wrote their areas — the count does ══
    await ride(small.id, String(isqrt(Number(small.a))), `court-${small.a}`, { bandFirst: true });
    {
      // D30: the platform already ridden offers NO flight while this terrace is unfinished
      const said = await W.placeAt({ court: small.id, pad: true }, true);
      check(!said, `on « ${small.to} », unfinished, the platform of ${small.a} offers no flight back (« ${said} »)`);
    }
    const palm = ST.terraces.find((t) => t.id === small.to).courts[0];
    await ride(palm.id, String(isqrt(Number(palm.a))), `court-${palm.a}`, { reload: true });
    lap('courts 16 and 36');

    // ══ the third terrace: the gate of light, the course of 14 gates ══
    const runT = ST.terraces.find((t) => t.feature?.kind === 'run');
    expect((await s()).at === runT.id, `he stands on « ${runT.name} »`);
    {
      const c = runT.courts[0];
      const said = await W.placeAt({ court: c.id }, true);
      check(!said, `the court of ${c.a} offers nothing before the course (« ${said} »)`);
    }
    {
      const said = await W.placeAt({ feature: true }, true);
      expect(said?.includes(runT.feature.prompt), `the gate of light offers « ${runT.feature.prompt} » (« ${said} »)`);
      await shotWorld('run-gate');
      await act();
      await page.waitForSelector('[data-gr-run="ready"]');
      await w.shot(page, 'run-ready', { ...OUT, exit: ['[data-gr-leave]'] });
      await page.click('[data-gr-start]');
      await ff(0.3);
      const total = (await s()).run.total;
      const res = await playRail(w, page, ff, D.run, {
        miss: 3,
        label: 'the course',
        OUT: { exit: ['[data-gr-leave]'], numbers: false },
        shots: { 2: 'run-gate-2', fact: 'run-fact', 12: 'run-cube' },
      });
      check(
        res.stage === 'over' && res.won && res.score === total - 1 && res.hearts === 2,
        `the course: ${res.score} of ${total} gates, one missed on purpose, ${res.hearts} hearts left — passed whole (${JSON.stringify(res)})`,
      );
      await w.shot(page, 'run-over', { exit: ['[data-gr-leave]'] });
      await page.click('[data-gr-leave]');
      await ff(0.6);
      expect((await s()).phase === 'play' && (await s()).run == null, 'leaving the rail: back on the terrace');
    }
    lap('the course');
    const wind = runT.courts[0];
    await ride(wind.id, String(isqrt(Number(wind.a))), `court-${wind.a}`);

    // ══ the hall of mirrors: forge 1 ══
    const hall = ST.terraces.find((t) => t.feature?.kind === 'mirror');
    {
      const said = await W.placeAt({ feature: true }, true);
      expect(said?.includes(hall.feature.prompt), `the mirror offers « ${hall.feature.prompt} » (« ${said} »)`);
      await shotWorld('mirror');
      await act();
      await ff(0.3);
      await forge(K1, 'the mirror');
    }
    // the tablet closed: it flew to « Mes règles » in the top bar, which opens the rules sheet (D33)
    {
      expect(
        (await page.locator('[data-di-rules]').count()) === 1,
        'the tablet closed: « Mes règles » stands in the top bar',
      );
      await page.click('[data-di-rules]');
      await page.waitForTimeout(400);
      const o = await s();
      check(
        o.overlay === 'rules' &&
          ((await page.textContent('.di-veil').catch(() => '')) ?? '').includes(L.lesson.rules[K1].title),
        `« Mes règles » opens the rules sheet on « ${L.lesson.rules[K1].title} » (${o.overlay})`,
      );
      await w.shot(page, 'rules-sheet', { exit: ['[data-di-rules-close]'] });
      await page.click('[data-di-rules-close]');
      await ff(0.3);
      expect((await s()).overlay == null, 'closing the sheet: back in the hall');
    }
    // a page RELOADED in the middle of the journey: it resumes where he was, with what he owns
    {
      await W.reload();
      const x = await s();
      check(
        x.at === hall.id && x.keys.includes(K1) && x.phase === 'play',
        `reloaded after forge 1: the journey resumes in « ${hall.name} », the key kept (${x.at}, ${x.keys.join(',')})`,
      );
      await shotWorld('after-reload');
    }
    const back = hall.courts[0];
    await objIs('back to the first terrace', new RegExp(back.a));
    await ride(back.id, String(isqrt(Number(back.a))), `court-${back.a}`);

    // ══ back on the court of 30: the fine marks ══
    {
      const said = await W.placeAt({ feature: true }, true);
      check(!said, `the calculator offers nothing before the nearest mark is found (« ${said} »)`);
    }
    await W.grab({ court: first.id }, `the court of ${first.a}, the fine marks`);
    {
      const r = (await s()).rod;
      check(r.steps.length === 3, `the rod's dial has its finer marks (${r.steps.join(' · ')})`);
    }
    const near = D.nearest(first.a); // the walk's own: the longest rod of two decimals that still leaves a band
    const tenth = near.slice(0, -1);
    await page.click(`[data-rc-set-step="0,1"]`);
    await W.walkTo(tenth);
    await W.lower(`${first.a} with ${tenth}`, { shotName: `fine-${tenth}`, forbid: placesForbid(), OUT });
    await W.settle();
    await page.click(`[data-rc-set-step="0,01"]`);
    const above = write(sub(near, '-0,01'));
    await W.walkTo(above);
    await W.lower(`${first.a} with ${above}`, { shotName: `fine-${above}-jam`, forbid: placesForbid(), OUT });
    await W.settle();
    await W.walkTo(near);
    await worldShot(w, page, `fine-${near}-rod`, placesForbid(), OUT);
    await W.lower(`${first.a} with ${near}`, { shotName: `fine-${near}`, forbid: placesForbid(), OUT });
    await W.settle();
    {
      const x = await s();
      // the lesson's own sentence (`story.text.say.near`) when it writes one; else a word of praise
      const nearSay = L.lesson.story.text?.say?.near;
      check(
        x.say.includes(near) &&
          (typeof nearSay === 'string' ? x.say.trim() === nearSay.trim() : /Bravo|Bien joué|C’est ça/i.test(x.say)),
        `${near}: the success is SAID (« ${x.say.slice(0, 80)} »)`,
      );
      check(!x.holding && x.rod == null, `${near}: the rod has left his hand by itself`);
      const beam = await page.evaluate(() => {
        const g = window.__world;
        return Boolean(g.ter[g.getState().at].beam?.beam.visible);
      });
      check(beam, `${near}: the column of light stands on the calculator now`);
      await shotWorld('beam-on-calculator');
    }
    lap('the fine marks');

    // ══ forge 2 at the calculator ══
    {
      const said = await W.placeAt({ feature: true }, true);
      expect(said?.length > 0, `the calculator calls him (« ${said} »)`);
      await act();
      await ff(0.3);
      await forge(K2, 'the calculator');
    }
    // ══ the rod clamped corner to corner, on a WHOLE mark ══
    await W.grab({ court: first.id }, `the court of ${first.a}, the wall`);
    await objIs('the wall', /\bcoins?\b/i);
    await W.walkTo(String(below - 1));
    {
      const said = await W.prompt();
      check(!/Fixe la toise/.test(said ?? ''), `at ${below - 1}, far from the corner: no clamp offered (« ${said} »)`);
    }
    await W.walkTo(String(below));
    {
      const said = await W.prompt();
      check(
        /Fixe la toise/.test(said ?? ''),
        `stopped ON the whole mark ${below}, at the far corner: « Fixe la toise dans le coin » (« ${said} ») — D29`,
      );
      await worldShot(w, page, 'clamp-prompt', placesForbid(), OUT);
    }
    await act();
    expect(await W.until((x) => x.verdict != null, 8, 0.1), 'the clamped rod: the world answers');
    {
      const v = await page.getAttribute('[data-di-verdict]', 'data-di-verdict');
      check(
        v === platform({ root: first.a }, first.a).kind,
        `the rod taken from the wall of ${first.a} rides — computed here (${v})`,
      );
      await shotWorld('wall-rides');
    }
    await W.keyed('the wall', { id: first.id, to: first.to, shotName: 'wall-key', forbid: placesForbid(), OUT });
    await shotWorld(`landed-${first.to}`);

    // ══ the two stations: forge 3 ══
    {
      if ((await s()).overlay !== 'forge') {
        const said = await W.placeAt({ feature: true }, true);
        expect(said?.length > 0, `the stations call him (« ${said} »)`);
        await shotWorld('stations');
        await act();
        await ff(0.3);
      }
      await forge(K3, 'the stations');
    }
    const last = ST.terraces.find((t) => t.id === first.to).courts[0];
    await ride(last.id, String(isqrt(Number(last.a))), `court-${last.a}`);

    // ══ the pavilion: the final mission ══
    {
      const said = await W.placeAt({ pavilion: true }, true);
      expect(said?.includes(ST.mission.prompt), `the pavilion offers « ${ST.mission.prompt} » (« ${said} »)`);
      await shotWorld('pavilion');
      await act();
      await page.waitForSelector('[data-rc-mission]');
      const lead = await page.locator('.rc-mission__lead').allTextContents();
      const sol = D.mission(lead.join(' '));
      const near1 = { ...sol, side: sol.side - 1 };
      for (const [k, v] of Object.entries(near1)) await page.fill(`[data-rc-mission] [data-rf-use="${k}"]`, String(v));
      await page.click('[data-rc-mission-check]');
      await page.waitForTimeout(250);
      const f = ((await page.textContent('[data-rc-mission-fact]').catch(() => '')) ?? '').trim();
      check(
        f.length > 5 && !WRONG_WORDS.test(f) && f.includes(String(sol.side - 1)),
        `a near miss (${sol.side - 1}): the mission answers with a FACT (« ${f.slice(0, 90)} »)`,
      );
      await w.shot(page, 'mission-fact', OUT);
      await page.fill('[data-rc-mission] [data-rf-use="side"]', String(sol.side));
      await page.click('[data-rc-mission-check]');
      await ff(0.4);
      check((await s()).overlay !== 'mission', `the mission solved (${JSON.stringify(sol)} — computed here)`);
    }
    expect(await W.until((x) => x.overlay === 'end', 20, 0.25), 'the end screen shows');
    await w.shot(page, 'end', OUT);
    lap('the end');
  });
  return w;
}

// ───────────────────────────── the hub: a practice level on the rail ─────────────────────────────
// ───────────────────────────── the board: a `court` station ─────────────────────────────
/**
 * A `court` station of « Séance en classe » (`features/classSession/LessonBoard.jsx › CourtStation`): every card that does NOT
 * ride is lowered first — the world answers each with its fact —, then every card that rides; each card's
 * verdict is computed HERE (./exact.mjs) and read on its card; the proof (`after`) waits until the riding cards were
 * lowered (every card, when none rides).
 */
export async function boardCourt({ page, check, expect, shot, clean, step }) {
  const area = step.area != null ? String(step.area) : null;
  const rodOf = (x) => (typeof x === 'object' ? (x.root != null ? { root: x.root } : { q: x.q }) : { q: String(x) });
  const keyOf = (r) => (r.root != null ? `√${r.root}` : r.q);
  const cards = step.areas
    ? step.areas.map((a) => ({ key: String(a), out: platform(rodOf(step.rod), String(a)) }))
    : step.rods.map((x) => ({ key: keyOf(rodOf(x)), out: platform(rodOf(x), area) }));
  const rides = cards.filter((c) => c.out.kind === 'ride');
  const others = cards.filter((c) => c.out.kind !== 'ride');
  const shown = await page.$$eval('[data-cs-court-card]', (els) => els.map((e) => e.dataset.csCourtCard));
  expect(
    shown.join('|') === cards.map((c) => c.key).join('|'),
    `${step.id}: the cards on the board are ${cards.map((c) => c.key).join(', ')}`,
  );
  await clean(`${step.id}-open`);
  await shot(`court-${step.id}-open`);
  const lowerCard = async (c) => {
    await page.click(`[data-cs-court-card="${c.key}"]`);
    await page.click('[data-cs-court-lower]');
    await page.waitForFunction(
      (k) => document.querySelector(`[data-cs-court-card="${k}"]`)?.dataset.csCourtKind,
      c.key,
      { timeout: 8000 },
    );
    const kind = await page.getAttribute(`[data-cs-court-card="${c.key}"]`, 'data-cs-court-kind');
    check(
      kind === c.out.kind,
      `${step.id}: the card ${c.key} ${step.areas ? `under the rod ${keyOf(rodOf(step.rod))}` : `over ${area}`} — ${c.out.kind}${c.out.kind === 'ride' ? '' : ` (${c.out.diff})`}, computed here (${kind})`,
    );
  };
  // every card: those that do not ride first (each answered by its fact), the riding ones last — the proof comes then
  const order = [...others, ...rides];
  for (const [i, c] of order.entries()) {
    await lowerCard(c);
    const after = (await page.locator('[data-cs-court-after]').count()) > 0;
    const shouldShow = i === order.length - 1;
    check(
      after === shouldShow,
      `${step.id}: the proof ${shouldShow ? 'shows once every riding card was lowered' : 'waits'} (${after})`,
    );
    if (i === 0 && others.length && rides.length) await shot(`court-${step.id}-fact`);
    // the calculator's card: its band is too thin for the eye — the world writes it
    if (/^\d+,\d{6,}$/.test(c.key)) await shot(`court-${step.id}-calculator`);
  }
  check(
    JSON.stringify(rides.map((c) => c.key)) === JSON.stringify(step.answer),
    `${step.id}: the cards that ride are ${rides.map((c) => c.key).join(', ') || 'none'} — the script's answer (${step.answer.join(', ') || 'none'})`,
  );
  await clean(step.id);
  const said = await page.evaluate(() => document.querySelector('.cs-root').innerText);
  for (const rule of ROOT_COURTS.textRules) {
    const m = said.match(rule.re);
    check(!m, `${step.id}: ${rule.what}${m ? ` — « ${m[0].trim()} »` : ''}`);
  }
  await shot(`court-${step.id}`);
}
