// « فضاء التدريب » of lesson `qawaid-qabiliyat-qisma` (1AM « قواعد قابلية القسمة »), as a STUDENT — copied from lesson 3's
// gameworld-khawass-hub.mjs. Every door of the title screen opens and comes back (« خريطة المعارف », the practice hub,
// « تقدّمي », « مختبري », « عُدّتي »); the hub shows the lesson's OWN mind map (five nodes, its rules, its level names),
// each node and its rule tablet, the exam space; a run of the gate dash opens from « واصل التدريب », its rule, a wrong gate
// and its guidance, « خروج » back to the hub; then two wrong gates in one run (the rule comes by itself). A student with no
// key sees it all locked. Every gate is judged by the walk's OWN arithmetic (lib/qawaid.mjs › gateRight); the exam ladder is
// compared with the bank ON DISK (lib/bankSheet.mjs › ladderFromDisk), never with the product's own numbers. (The cards of
// « خريطة المعارف » are opened and checked as cards in gameworld-qawaid-trainer.mjs.)
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/gameworld-qawaid-hub.mjs [outDir]
import { createWalk, PHONE } from './lib/walk.mjs';
import { readLadder, rungShows, ladderFromDisk, bankOnDisk } from './lib/bankSheet.mjs';
import {
  GRADE,
  KEYS,
  pageOf,
  QAWAID_FOREIGN,
  QAWAID_FOREIGN_NUMBERS,
  READING,
  WORLD_MODULE,
  gateRight,
  wordsOf,
} from './lib/qawaid.mjs';
import { TEXT } from '../src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma/world/text.js';

const ID = 'qawaid-qabiliyat-qisma';
const URL = pageOf(ID);
/** Every kind of wave this lesson's ladder draws (world/practice.js). */
const WAVE_TYPES = [
  'unitsBy',
  'notBy',
  'sumBy',
  'sum3not9',
  'last2By',
  'digitFor',
  'remainder',
  'divisibleBy',
  'multipleOf',
  'dividesNum',
];
/** What each rung of the exam ladder must write: computed from the bank on disk, never read from the product. */
const DISK_LADDER = ladderFromDisk(bankOnDisk(GRADE, ID));
const w = createWalk('gameworld-qawaid-hub', { foreign: QAWAID_FOREIGN, foreignNumbers: QAWAID_FOREIGN_NUMBERS });
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
const right = (x, n) => gateRight(x, n);
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

await w.run(async () => {
  // ── 1. a student with no key: the doors open on locked nodes and a locked exam space ──
  {
    const { page, ctx } = await w.student({ uid: 9861, lessonId: ID, url: URL, grade: GRADE });
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
    uid: 9862,
    lessonId: ID,
    url: URL,
    grade: GRADE,
    seed: { [`u_9862_smarter_world_${ID}`]: save },
  });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.waitForTimeout(800);
  const L2 = await lessonData(page);
  expect(
    (await page.textContent('.di-title h1')).includes('الآلة المعطّلة') &&
      (await page.textContent('.di-title__eyebrow')).includes('قواعد قابلية القسمة'),
    'the home of the lesson: its own title screen (« الآلة المعطّلة », « قواعد قابلية القسمة »)',
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
      k.includes('نعرف دون أن نقسم') || k.includes('قواعد قابلية القسمة'),
      '« خريطة المعارف » opens on the lesson’s own first card (« نعرف دون أن نقسم » / its title)',
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
      // the tablets with a formula in a sentence (« $a$ … $b$ ») and the longest one are looked at
      if (id === 'baqi-sifr' || id === KEYS[0])
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
      `« فضاء الامتحان »: the five levels of the bank ON DISK — the practice space's names, their minutes and points (${rungs.map((r) => `${r.title}: ${r.small.trim()}`).join(' · ')})`,
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
  expect(
    (await page.locator('[data-di-mapcard]').count()) === 0 && (await page.locator('[data-di-know]').isVisible()),
    '« خريطة المعارف » opens from the hub, in its place',
  );
  await page.click('[data-di-know-hub]');
  await page.waitForSelector('[data-di-mapcard]');
  expect(
    (await st(page)).overlay === 'map' && (await page.locator('[data-di-know]').count()) === 0,
    '…and its « فضاء التدريب » comes back to the hub',
  );

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
    const say = (await page.textContent('.di-dash__say')).replace(/\s+/g, ' ');
    expect(
      WAVE_TYPES.includes(x.type) && x.gates.filter((g) => right(x, g)).length === 1,
      `the gate is one of the lesson’s kinds (${x.type}), and exactly ONE of its three gates is right by the walk’s arithmetic (${x.gates.join(', ')})`,
    );
    // a wave of a reading key carries its own sentence (`say`); the others are the world's sentences, with their numbers
    expect(
      x.say
        ? wordsOf(x.say).every((t) => say.includes(t))
        : [x.a, x.b].filter((v) => v != null).some((v) => say.includes(String(v))),
      `the sentence over the rail is the wave’s own (« ${say.trim().slice(0, 60)} »)`,
    );
    if (READING.includes(x.type))
      check(
        x.gates.every((g) => g >= 100),
        `a reading gate shows a number of three or four digits — the key reads it, dividing would not (${x.gates.join(', ')})`,
      );
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
      `a wrong gate (${bad}) STOPS the run on a guidance card; a shield is lost (${JSON.stringify({ ph: s.phase, o: s.overlay, picked: s.o?.picked, hearts: s.dash?.hearts, gates: x.gates })})`,
    );
    const g = await page.textContent('[data-di-guide]');
    const good = x.gates.find((v) => right(x, v));
    check(
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
  expect(
    (await page.locator('[data-di-guide-rule]').count()) === 1,
    'after two mistakes the card SHOWS the rule of THIS lesson by itself (`[data-di-guide-rule]`)',
  );
  check(
    (await page.textContent('[data-di-guide-rule]')).includes(L2.titles[s.o.wave.key]),
    `the rule shown is the lesson’s own (« ${L2.titles[s.o.wave.key]} »)`,
  );
  await shot(page, 'run-guide-lost', { exit: ['[data-di-exit]', '[data-di-resume]'] });
  expect((await page.locator('[data-di-resume]').count()) === 1, 'the card of the second mistake lets him go on');
  await page.click('[data-di-resume]');
  await ff(page, 0.3);
  expect((await st(page)).phase === 'dash', '…and the run goes on');
  await page.click('[data-di-quit]');
  await page.waitForSelector('[data-di-mapcard]');
  await page.click('[data-di-map-close]');
  await page.waitForSelector('[data-di-start]');
  expect(
    (await st(page)).phase === 'title' && !(await st(page)).overlay && !(await st(page)).dash,
    'the run is left, the hub closed: back on the title screen',
  );
  if (PHONE) console.log('    (phone held sideways: the hub is checked in its two-column layout)');
});
