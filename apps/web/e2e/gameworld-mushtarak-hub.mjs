// « فضاء التدريب » of lesson `qasim-mushtarak-akbar` (lesson 4), as a STUDENT — copied from lesson 3's gameworld-khawass-hub.mjs
// (itself the equivalent of the pilot's gameworld-practice.mjs). Every door of the title screen opens and comes back (« خريطة المعارف », the practice hub, « تقدّمي »,
// « مختبري », « عُدّتي »); the hub shows the lesson's OWN mind map (five nodes, its rules, its level names), each node and its
// rule tablet, the exam space; a run of the gate dash opens from « واصل التدريب », its rule, a wrong gate and its guidance,
// « خروج » back to the hub; then two wrong gates in one run (the rule comes by itself). A student with no key sees it all locked.
// No rule is named before it is forged: a student with no key reads « ؟ ؟ ؟ » on every key node (kit/PracticeHub.jsx).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-mushtarak-hub.mjs [outDir]
import { createWalk, PHONE } from './lib/walk.mjs';
import { readLadder, rungShows, ladderFromDisk, bankOnDisk } from './lib/bankSheet.mjs';
import { ID, URL, KEYS, WORLD_MODULE, MUSHTARAK_FOREIGN, MUSHTARAK_NUMBERS, gcd, divisors } from './lib/mushtarak.mjs';
import { TEXT } from '../src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar/world/text.js';

const WAVE_TYPES = [
  'commonDivisor',
  'pgcd',
  'longest',
  'possibleBouquets',
  'mostBouquets',
  'perBouquet',
  'divisorOfPgcd',
  'countCommon',
];
/** What each rung of the exam ladder must write, computed from the bank ON DISK (never the product's own numbers). */
const DISK_LADDER = ladderFromDisk(bankOnDisk('4am', ID));
// the 12 px floor is on by default (lib/walk.mjs), the knowledge map included
const w = createWalk('gameworld-mushtarak-hub', { foreign: MUSHTARAK_FOREIGN, foreignNumbers: MUSHTARAK_NUMBERS });
const { expect, check, shot, ff } = w;
const TOP = { exit: ['.di-top a.di-icon', '[data-di-exit]'], sound: true };

/** The lesson's own data, as the dev server serves its module (what the screens must show — never what they compute). */
const lessonData = (page) =>
  page.evaluate(async (path) => {
    const { lesson } = await import(path);
    return {
      titles: Object.fromEntries(Object.entries(lesson.rules).map(([k, v]) => [k, v.title])),
      root: lesson.practiceMap.root,
      edges: lesson.practiceMap.edges.map((e) => e[2]).filter(Boolean),
    };
  }, WORLD_MODULE);

const st = (page) =>
  page.evaluate(() => {
    const s = window.__world.getState();
    return { phase: s.phase, overlay: s.overlay?.type ?? null, o: s.overlay, dash: s.dash };
  });
/** The wave of the run now on screen (read only: the walk decides with its own arithmetic). */
const wave = (page) =>
  page.evaluate(() => {
    const d = window.__world.dash;
    const x = d?.waves[d.wave];
    return x ? { ...x, lane: d.lane, index: d.wave } : null;
  });
/**
 * Is gate value n right for this wave? Computed HERE, from the wave's numbers: a divisor of both, the PGCD (also « the
 * longest plank », « the most bouquets »), the roses of one of g bouquets, a divisor of the given PGCD, how many it has.
 */
const right = (x, n) =>
  ({
    commonDivisor: () => n >= 1 && x.a % n === 0 && x.b % n === 0,
    possibleBouquets: () => n >= 1 && x.a % n === 0 && x.b % n === 0,
    pgcd: () => n === gcd(x.a, x.b),
    longest: () => n === gcd(x.a, x.b),
    mostBouquets: () => n === gcd(x.a, x.b),
    perBouquet: () => n * x.g === x.a,
    divisorOfPgcd: () => n >= 1 && x.g % n === 0,
    countCommon: () => n === divisors(x.g).length,
  })[x.type]?.();
/** Moves the board to `lane` with the arrow buttons of the screen, one tap at a time. */
const toLane = async (page, lane) => {
  for (let k = 0; k < 6; k += 1) {
    const cur = (await wave(page)).lane;
    if (cur === lane) return;
    await page
      .locator('.di-lanes button')
      .nth(cur > lane ? 0 : 1)
      .click();
    await ff(page, 0.08);
  }
};
/** Rides to the gate in the lane of the gate value `pick`; stops at the guidance card or the next wave. */
const rideTo = async (page, pick) => {
  const x = await wave(page);
  await toLane(page, x.gates.indexOf(pick));
  for (let i = 0; i < 80; i += 1) {
    await ff(page, 0.25);
    const s = await st(page);
    const now = await wave(page);
    if (s.overlay || !s.dash || !now || now.index !== x.index) break;
  }
  return x;
};

/** The words of the mind map never print on each other: a link's label, a node's name or icon, the root (the 12 px floor is
 * `shot`'s; this is what it cannot see). */
const mapApart = async (page, where) => {
  const hits = await page.evaluate(() => {
    const box = (el) => ({ t: el.textContent.trim() || el.className, r: el.getBoundingClientRect() });
    const items = [...document.querySelectorAll('.di-map__edge, .di-map__root, .di-node strong, .di-node__icon')].map(
      box,
    );
    const out = [];
    for (let i = 0; i < items.length; i += 1)
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i].r;
        const b = items[j].r;
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
        )
          out.push(`« ${items[i].t} » / « ${items[j].t} »`);
      }
    return out;
  });
  check(
    hits.length === 0,
    `${where}: no label of the mind map covers another${hits.length ? ' — ' + hits.join(' | ') : ''}`,
  );
};

await w.run(async () => {
  // ── 1. a student with no key: the doors open on locked nodes and a locked exam space ──
  {
    const { page, ctx } = await w.student({ uid: 9851, lessonId: ID, url: URL });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.click('[data-di-map]');
    await page.waitForSelector('[data-di-mapcard]');
    await page.waitForTimeout(500);
    expect(
      (await page.locator('[data-di-node]').count()) === 5 &&
        (await page.locator('[data-di-node][data-open="true"]').count()) === 0,
      'a new student: five nodes on the map, all locked',
    );
    expect(
      (await page.locator('[data-di-level]:not([disabled])').count()) === 0 &&
        (await page.locator('[data-di-next]').count()) === 0,
      '…and no level can be played before a key is earned',
    );
    {
      // « no rule is told »: a locked key node shows « ؟ ؟ ؟ », never its rule's name (GAME_WORLD.md, 2026-11-19)
      const names = await page
        .locator('[data-di-node]')
        .evaluateAll((els) => els.map((e) => [e.dataset.diNode, e.querySelector('strong').textContent.trim()]));
      expect(
        names.every(([id, t]) => id === 'exam' || t === '؟ ؟ ؟'),
        `no rule is named before it is forged: each locked key reads « ؟ ؟ ؟ » (${names.map((n) => n[1]).join(' · ')})`,
      );
    }
    await mapApart(page, 'hub-locked');
    await shot(page, 'hub-locked', { exit: ['[data-di-map-close]'], numbers: true });
    await page.click('[data-di-space="exam"]');
    await page.waitForSelector('[data-di-ladder="locked"]');
    await shot(page, 'exam-locked', { exit: ['[data-di-map-close]'], numbers: true });
    await page.click('[data-di-map-close]');
    expect(
      (await st(page)).phase === 'title' && (await page.locator('[data-di-start]').isVisible()),
      'closing the hub returns to the title screen',
    );
    await ctx.close();
  }

  // ── 2. a student who finished the story and passed level 1 of each key ──
  const practice = Object.fromEntries(KEYS.map((k) => [`${k}:1`, { stars: 2, best: 800 }]));
  const save = {
    v: 1,
    stage: 8,
    stars: {},
    gems: [],
    keys: KEYS,
    keysEver: KEYS,
    falls: 0,
    flags: {},
    finished: true,
    practice,
  };
  const { page } = await w.student({
    uid: 9852,
    lessonId: ID,
    url: URL,
    seed: { [`u_9852_smarter_world_${ID}`]: save },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(800);
  const L2 = await lessonData(page);
  expect(
    (await page.textContent('.di-title h1')).includes('سوق الزهور') &&
      (await page.textContent('.di-title__eyebrow')).includes('القاسم المشترك الأكبر لعددين طبيعيين'),
    'the home of the lesson: its own title screen (« سوق الزهور », « القاسم المشترك الأكبر لعددين طبيعيين »)',
  );
  await shot(page, 'title', { ...TOP, numbers: true });

  // the doors of the title screen: each opens, and its way out comes back to the title
  const backToTitle = async (what) => {
    await page.waitForSelector('[data-di-start]', { timeout: 10000 });
    expect(
      (await st(page)).phase === 'title' && !(await st(page)).overlay,
      `${what}: its way out comes back to the title screen`,
    );
  };
  await page.click('[data-di-know-open]');
  await page.waitForSelector('[data-di-know]');
  await page.waitForTimeout(800);
  {
    const k = await page.textContent('[data-di-know]');
    expect(
      k.includes('لوح يملأ هوّتين') || k.includes('القاسم المشترك الأكبر لعددين طبيعيين'),
      '« خريطة المعارف » opens on the lesson’s own first card (« لوح يملأ هوّتين » / its title)',
    );
  }
  await shot(page, 'door-know', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
  await page.click('[data-di-know-close]');
  await backToTitle('« خريطة المعارف »');

  await page.click('[data-di-progress-open]');
  await page.waitForSelector('[data-di-progress]');
  await page.waitForTimeout(500);
  {
    const rows = await page
      .locator('[data-di-prow]')
      .evaluateAll((els) => els.map((e) => [e.dataset.diProw, e.querySelector('strong').textContent.trim()]));
    expect(
      JSON.stringify(rows) === JSON.stringify(KEYS.map((k) => [k, L2.titles[k]])),
      `« تقدّمي » opens on the four الكفاءات of THIS lesson (${rows.map((r) => r[1]).join(' · ')})`,
    );
  }
  await shot(page, 'door-progress', { exit: ['[data-di-progress-close]'], sound: true, numbers: true });
  await page.click('[data-di-progress-close]');
  await backToTitle('« تقدّمي »');

  await page.click('[data-di-lab-open]');
  await page.waitForSelector('[data-ll-close]', { timeout: 15000 });
  await page.waitForTimeout(800);
  await shot(page, 'door-lab', {
    exit: ['[data-ll-close]'],
    sound: ['[data-ll-sound]', '[data-di-sound]'],
    numbers: true,
  });
  await page.click('[data-ll-close]');
  await backToTitle('« مختبري »');

  await page.click('[data-di-launch-open]');
  await page.waitForSelector('[data-lk-close]', { timeout: 15000 });
  await page.waitForTimeout(800);
  await shot(page, 'door-launch', { exit: ['[data-lk-close]'], sound: ['[data-lk-sound]', '[data-di-sound]'] });
  await page.click('[data-lk-close]');
  if (await page.locator('[data-lk-quit-yes]').count()) {
    await page.waitForTimeout(200);
    await page.click('[data-lk-quit-yes]');
  }
  await backToTitle('« عُدّتي »');

  // ── 3. the practice hub: the lesson's own mind map ──
  await page.click('[data-di-map]');
  await page.waitForSelector('[data-di-mapcard]');
  await page.waitForTimeout(600);
  expect((await page.locator('[data-di-space="game"].is-on').count()) === 1, 'the hub opens on « فضاء اللعب »');
  expect(
    (await page.locator('[data-di-node]').count()) === 5 &&
      (await page.locator('[data-di-node][data-open="true"]').count()) === 5,
    'five nodes: the four keys and the exam challenge, all open (the four first runs are passed)',
  );
  {
    const nodes = await page
      .locator('[data-di-node]')
      .evaluateAll((els) =>
        els.map((e) => ({ id: e.dataset.diNode, title: e.querySelector('strong').textContent.trim() })),
      );
    expect(
      nodes.every((x) => x.title === (x.id === 'exam' ? TEXT.summary.title : L2.titles[x.id])),
      `each node bears the name of THIS lesson’s rule (${nodes.map((x) => x.title).join(' · ')})`,
    );
    const map = await page.textContent('.di-map');
    expect(
      map.includes(L2.root) && L2.edges.every((e) => map.includes(e)),
      `the map is the lesson’s mind map: « ${L2.root} » and its links (${L2.edges.join('، ')})`,
    );
  }
  await mapApart(page, 'hub');
  await shot(page, 'hub', { exit: ['[data-di-map-close]'], numbers: true });
  // each node: its panel, its rule, its level names — those of this lesson
  for (const id of [...KEYS, 'exam']) {
    await page.click(`[data-di-node="${id}"]`);
    await page.waitForTimeout(250);
    const panel = await page.textContent(`[data-di-panel="${id}"]`);
    const names = await page.locator('.di-levels .di-level__name small').allTextContents();
    expect(
      JSON.stringify(names) === JSON.stringify(TEXT.levels[id]),
      `node ${id}: its levels are the lesson’s (${names.join(' · ')})`,
    );
    expect(panel.includes(id === 'exam' ? TEXT.summary.title : L2.titles[id]), `node ${id}: the panel names it`);
    await shot(page, `hub-node-${id}`, { exit: ['[data-di-map-close]'], numbers: true });
    if (id !== 'exam') {
      await page.click(`[data-di-panel="${id}"] .di-map__rule .di-link`);
      await page.waitForSelector('[data-di-tablet]');
      await page.waitForTimeout(300);
      expect(
        (await page.textContent('.di-veil')).includes(L2.titles[id]),
        `node ${id}: « ذكّرني بالقاعدة » opens THIS rule’s tablet`,
      );
      if (id === KEYS[3] || id === KEYS[0])
        await shot(page, `hub-rule-${id}`, { exit: ['[data-di-tablet]', '[data-di-exit]'], numbers: true });
      await page.click('[data-di-tablet]');
      await page.waitForSelector('[data-di-mapcard]');
      const back = await page.locator('[data-di-panel]').getAttribute('data-di-panel');
      check(back === id, `node ${id}: closing the tablet comes back to the hub ON THE SAME NODE (it shows ${back})`);
    }
  }
  // the exam space: five levels, the first lit
  await page.click('[data-di-space="exam"]');
  await page.waitForSelector('[data-di-ladder="open"]');
  await page.waitForTimeout(400);
  {
    const rungs = await readLadder(page);
    expect(
      rungs.length === 5 && rungs.every((r, i) => rungShows(r, DISK_LADDER[i], i)),
      `« فضاء الامتحان »: the bank's five levels, the practice space's names, their minutes and points (${rungs.map((r) => `${r.title}: ${r.small.trim()}`).join(' · ')})`,
    );
    expect(
      !rungs[0].disabled &&
        rungs.slice(1).every((r) => r.disabled) &&
        (await page.locator('.di-rungs li.is-next [data-di-exam-level="1"]').count()) === 1,
      'level 1 is open and lit, the four others locked',
    );
  }
  await shot(page, 'hub-exam', { exit: ['[data-di-map-close]'], numbers: true });
  await page.click('[data-di-space="game"]');
  await page.waitForSelector('.di-map');
  // the hub’s door to the knowledge page, and back
  await page.click('[data-di-hub-know]');
  await page.waitForSelector('[data-di-know]');
  {
    const o = (await st(page)).overlay;
    const k = await page.textContent('[data-di-know]');
    expect(
      o === 'know' &&
        (await page.locator('[data-di-mapcard]').count()) === 0 &&
        (k.includes('لوح يملأ هوّتين') || k.includes('القاسم المشترك الأكبر لعددين طبيعيين')),
      `the hub’s « خريطة المعارف » opens the lesson’s knowledge page in place of the hub (overlay ${o})`,
    );
  }
  await page.click('[data-di-know-hub]');
  await page.waitForSelector('[data-di-mapcard]');
  {
    const o = (await st(page)).overlay;
    expect(
      o === 'map' && (await page.locator('[data-di-know]').count()) === 0,
      `…and its « فضاء التدريب » comes back to the hub (overlay ${o})`,
    );
  }

  // ── 4. a run of the gate dash: « واصل التدريب » ──
  const nextName = (await page.textContent('[data-di-next]')).trim();
  expect(
    Object.values(TEXT.levels)
      .flat()
      .some((x) => nextName.includes(x)),
    `« واصل التدريب » proposes one of the lesson’s levels (« ${nextName} »)`,
  );
  await page.click('[data-di-next]');
  await ff(page, 0.6);
  let s = await st(page);
  expect(
    s.phase === 'dash' && s.dash?.mode === 'practice' && s.dash.total === 6 && s.dash.hearts === 3,
    'the run starts: 6 gates, 3 shields',
  );
  await ff(page, 2.2);
  await page.waitForTimeout(400);
  {
    const x = await wave(page);
    const say = await page.textContent('.di-dash__say');
    expect(
      WAVE_TYPES.includes(x.type) && x.gates.filter((g) => right(x, g)).length === 1,
      `the gate is one of the lesson’s kinds (${x.type}), and exactly ONE of its three gates is right (${x.gates.join(', ')})`,
    );
    expect(
      [x.a, x.b].filter((v) => v != null).some((v) => say.includes(String(v))),
      `the sentence over the rail says the wave’s own numbers (« ${say.trim().slice(0, 60)} »)`,
    );
    expect(x.a == null || x.a <= 100, 'a gate is mental arithmetic: the number stays within the tables (≤ 100)');
  }
  await shot(page, 'run', { exit: ['[data-di-quit]', '.di-top a.di-icon'], sound: true });
  await page.click('[data-di-rule]');
  await page.waitForSelector('[data-di-tablet]');
  await page.waitForTimeout(300);
  {
    const k = (await wave(page)).key;
    expect(
      (await st(page)).overlay === 'rule' && (await page.textContent('.di-veil')).includes(L2.titles[k]),
      '« القاعدة » during the run pauses it on the tablet of the rule the gate uses',
    );
  }
  await shot(page, 'run-rule', { exit: ['[data-di-tablet]', '[data-di-exit]'] });
  await page.click('[data-di-tablet]');
  await ff(page, 0.2);
  expect((await st(page)).phase === 'dash', 'closing the tablet resumes the run');
  // a WRONG gate, chosen with the arrows of the screen
  {
    const x = await wave(page);
    const bad = x.gates.find((g) => !right(x, g));
    await rideTo(page, bad);
    await page.waitForTimeout(500);
    s = await st(page);
    expect(
      s.overlay === 'guide' && s.o.picked === bad && s.dash.hearts === 2,
      `a wrong gate (${bad}) STOPS the run on a guidance card; a shield is lost (${JSON.stringify({ ph: s.phase, o: s.overlay, picked: s.o?.picked, hearts: s.dash?.hearts, wave: s.dash?.wave, lane: s.dash?.lane, gates: x.gates })})`,
    );
    const g = await page.textContent('[data-di-guide]');
    const good = x.gates.find((v) => right(x, v));
    expect(
      g.includes(String(bad)) && g.includes(String(good)),
      `the card says why ${bad} does not fit and why ${good} does`,
    );
    await shot(page, 'run-guide', { exit: ['[data-di-exit]'] });
    await page.click('[data-di-remind]');
    await page.waitForSelector('[data-di-tablet]');
    expect(
      (await page.textContent('.di-veil')).includes(L2.titles[x.key]),
      '« ذكّرني بالقاعدة » on the card: the tablet of THIS lesson’s rule',
    );
    await page.click('[data-di-tablet]');
    await ff(page, 0.3);
    expect((await st(page)).phase === 'dash', '…and the run goes on');
  }
  // « خروج » leaves the run: back to the hub
  await page.click('[data-di-quit]');
  await page.waitForSelector('[data-di-mapcard]');
  expect(
    !(await st(page)).dash && (await st(page)).overlay === 'map',
    '« خروج » ends the run and comes back to the hub, nothing recorded',
  );
  // two wrong gates in one run: the second card brings the rule by itself (GAME_WORLD.md § « فضاء التدريب »)
  await page.click('[data-di-next]');
  await ff(page, 2.8);
  for (let k = 0; k < 2; k += 1) {
    const x = await wave(page);
    await rideTo(
      page,
      x.gates.find((g) => !right(x, g)),
    );
    await page.waitForTimeout(500);
    if (k === 0) {
      expect((await st(page)).overlay === 'guide', 'first wrong gate of the run: its card');
      await page.click('[data-di-resume]');
      await ff(page, 0.3);
    }
  }
  s = await st(page);
  expect(
    s.overlay === 'guide' && s.o.lost,
    'second wrong gate: the guidance card is marked « lost » (the rule shown by itself)',
  );
  const shown = await page.locator('[data-di-guide-rule]').count();
  check(shown === 1, 'after two mistakes the card SHOWS the rule of THIS lesson by itself (`[data-di-guide-rule]`)');
  check(
    shown === 1 && (await page.textContent('[data-di-guide-rule]')).includes(L2.titles[s.o.wave.key]),
    'the rule shown is the lesson’s own',
  );
  await shot(page, 'run-guide-lost', { exit: ['[data-di-exit]', '[data-di-resume]'] });
  // the guidance card always carries « واصل » (DivisorIsles.jsx › the guide card: `[data-di-resume]`, lost or not)
  expect((await page.locator('[data-di-resume]').count()) === 1, 'the « lost » card keeps its « واصل » button');
  await page.click('[data-di-resume]');
  await ff(page, 0.3);
  expect(
    (await st(page)).phase === 'dash' && !(await st(page)).overlay,
    '« واصل » after the second mistake resumes the run',
  );
  await page.click('[data-di-quit]');
  await page.waitForSelector('[data-di-mapcard]');
  expect(!(await st(page)).dash && (await st(page)).overlay === 'map', '« خروج » leaves the run: back on the hub');
  await page.click('[data-di-map-close]');
  await page.waitForSelector('[data-di-start]');
  {
    const s2 = await st(page);
    expect(
      s2.phase === 'title' && !s2.overlay && !s2.dash && (await page.locator('[data-di-start]').isVisible()),
      `the run is left, the hub closed: back on the title screen (phase ${s2.phase}, overlay ${s2.overlay})`,
    );
  }
  if (PHONE) console.log('    (phone held sideways: the hub is checked in its two-column layout)');
});
