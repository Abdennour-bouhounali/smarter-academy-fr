// « L’espace d’entraînement » of a lesson, as a STUDENT (lessons 5–6's hub walks, made data): a new student sees every
// node locked and « ? ? ? » for each key (no rule named before it is forged); a student who finished the story opens every
// door of the title (« Fiche de connaissances », « Ma progression », « Mon labo », « L’échauffement ») and comes back; the hub is the lesson's OWN mind map (its
// root, its links, a node per key and the exam, each node's levels and rule tablet); the exam space is the bank's five
// levels; a run of the gate dash: its rule, a wrong gate and its guidance card, « Quitter », then two wrong gates (the rule
// comes by itself). Every gate is judged by `descriptor.gate[wave.type](wave, n)` — the walk's own arithmetic.
import { createWalk, PHONE } from '../walk.mjs';
import { readLadder, rungShows, ladderFromDisk, bankOnDisk } from '../bankSheet.mjs';
import { mapApart } from './checks.mjs';
import { playLab } from './lab.mjs';
import { worldOfLesson } from './worlds/index.mjs';

export async function hubWalk(L, D, opts) {
  const w = createWalk(`lesson-${L.id}-hub`, opts);
  const { expect, check, shot, ff } = w;
  const KEYS = L.lesson.keys;
  const TEXT = L.lesson.text;
  const titles = Object.fromEntries(KEYS.map((k) => [k, L.lesson.rules[k].title]));
  const root = L.lesson.practiceMap.root;
  const edges = L.lesson.practiceMap.edges.map((e) => e[2]).filter(Boolean);
  const knowFirst =
    L.lesson.knowledge?.graph?.nodes?.find((n) => n.id === L.lesson.knowledge.graph.root)?.title ?? null;
  const story = typeof L.lesson.story.text?.title === 'string' ? L.lesson.story.text.title.replace(/^.*?:\s*/, '') : '';
  const DISK_LADDER = ladderFromDisk(bankOnDisk(L.grade, L.id));
  const TOP = { exit: ['.di-top a.di-icon', '[data-di-exit]'], sound: true };
  const uid = (D.uid ?? 9900) + 50;
  const other = worldOfLesson(L);
  const st = (page) =>
    page.evaluate(() => {
      const s = window.__world.getState();
      return { phase: s.phase, overlay: s.overlay?.type ?? null, o: s.overlay, dash: s.dash };
    });
  const wave = (page) =>
    page.evaluate(() => {
      const d = window.__world.dash;
      const x = d?.waves[d.wave];
      return x ? { ...x, lane: d.lane, index: d.wave } : null;
    });
  /** Is gate n right for this wave? The descriptor's arithmetic (an unknown wave type stops the walk). */
  const right = (x, n) => {
    const judge = D.gate?.[x.type];
    expect(judge, `the descriptor judges the waves « ${x.type} » (gate.${x.type})`);
    return Boolean(judge(x, n));
  };
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
      const { page, ctx } = await w.student({ uid, lessonId: L.id, url: L.url, grade: L.grade });
      await page.waitForSelector('[data-di-start]', { timeout: 30000 });
      await page.click('[data-di-map]');
      await page.waitForSelector('[data-di-mapcard]');
      await page.waitForTimeout(500);
      expect(
        (await page.locator('[data-di-node]').count()) === KEYS.length + 1 &&
          (await page.locator('[data-di-node][data-open="true"]').count()) === 0,
        `a new student: ${KEYS.length + 1} nodes on the map, all locked`,
      );
      expect(
        (await page.locator('[data-di-level]:not([disabled])').count()) === 0 &&
          (await page.locator('[data-di-next]').count()) === 0,
        '…and no level can be played before a key is earned',
      );
      const names = await page
        .locator('[data-di-node]')
        .evaluateAll((els) => els.map((e) => [e.dataset.diNode, e.querySelector('strong').textContent.trim()]));
      expect(
        // kit/text.js › KT.hidden; white space normalised (a no-break space would read the same)
        names.every(([id, t]) => id === 'exam' || t.replace(/\s+/g, ' ') === '? ? ?'),
        `no rule is named before it is forged: each locked key reads « ? ? ? » (${names.map((x) => x[1]).join(' · ')})`,
      );
      await mapApart(w, page, 'hub-locked');
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
      stage: L.lesson.story.legs
        ? L.lesson.story.legs.length
        : (L.lesson.story.segments ?? L.lesson.story.terraces).length - 1,
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
      uid: uid + 1,
      lessonId: L.id,
      url: L.url,
      grade: L.grade,
      seed: { [`u_${uid + 1}_smarter_world_${L.id}`]: save },
    });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.waitForTimeout(800);
    expect(
      ((await page.textContent('.di-title h1')) ?? '').includes(story) &&
        (!L.config?.title || ((await page.textContent('.di-title__eyebrow')) ?? '').includes(L.config.title)),
      `the home of the lesson: its own title screen (« ${story} », « ${L.config?.title} »)`,
    );
    await shot(page, 'title', { ...TOP, numbers: true });
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
        !knowFirst || k.includes(knowFirst) || (L.config?.title && k.includes(L.config.title)),
        `« Fiche de connaissances » opens on the lesson's own first card (« ${knowFirst} »)`,
      );
    }
    await shot(page, 'door-know', { exit: ['[data-di-know-close]'], sound: true, numbers: true });
    await page.click('[data-di-know-close]');
    await backToTitle('« Fiche de connaissances »');
    await page.click('[data-di-progress-open]');
    await page.waitForSelector('[data-di-progress]');
    await page.waitForTimeout(500);
    {
      const rows = await page
        .locator('[data-di-prow]')
        .evaluateAll((els) => els.map((e) => [e.dataset.diProw, e.querySelector('strong').textContent.trim()]));
      expect(
        JSON.stringify(rows) === JSON.stringify(KEYS.map((k) => [k, titles[k]])),
        `« Ma progression » opens on the savoir-faire of THIS lesson (${rows.map((r) => r[1]).join(' · ')})`,
      );
    }
    await shot(page, 'door-progress', { exit: ['[data-di-progress-close]'], sound: true, numbers: true });
    await page.click('[data-di-progress-close]');
    await backToTitle('« Ma progression »');
    await page.click('[data-di-lab-open]');
    await page.waitForSelector('[data-ll-close]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const LAB = { exit: ['[data-ll-close]'], sound: ['[data-ll-sound]', '[data-di-sound]'], numbers: true };
    await shot(page, 'door-lab', LAB);
    // the lesson's own instruments, played (lib/lessonWalk/lab.mjs)
    await playLab({ w, page, shot: (label) => shot(page, label, LAB) });
    await page.click('[data-ll-close]');
    await backToTitle('« Mon labo »');
    await page.click('[data-di-launch-open]');
    await page.waitForSelector('[data-lk-close]', { timeout: 15000 });
    await page.waitForTimeout(800);
    await shot(page, 'door-launch', { exit: ['[data-lk-close]'], sound: ['[data-lk-sound]', '[data-di-sound]'] });
    await page.click('[data-lk-close]');
    if (await page.locator('[data-lk-quit-yes]').count()) {
      await page.waitForTimeout(200);
      await page.click('[data-lk-quit-yes]');
    }
    await backToTitle('« L’échauffement »');

    // ── 3. the practice hub: the lesson's own mind map ──
    await page.click('[data-di-map]');
    await page.waitForSelector('[data-di-mapcard]');
    await page.waitForTimeout(600);
    expect((await page.locator('[data-di-space="game"].is-on').count()) === 1, 'the hub opens on « Espace jeu »');
    expect(
      (await page.locator('[data-di-node]').count()) === KEYS.length + 1 &&
        (await page.locator('[data-di-node][data-open="true"]').count()) === KEYS.length + 1,
      `${KEYS.length + 1} nodes: the ${KEYS.length} keys and the exam challenge, all open`,
    );
    {
      const nodes = await page
        .locator('[data-di-node]')
        .evaluateAll((els) =>
          els.map((e) => ({ id: e.dataset.diNode, title: e.querySelector('strong').textContent.trim() })),
        );
      expect(
        nodes.every((x) => x.title === (x.id === 'exam' ? TEXT.summary.title : titles[x.id])),
        `each node bears the name of THIS lesson's rule (${nodes.map((x) => x.title).join(' · ')})`,
      );
      const map = await page.textContent('.di-map');
      expect(
        map.includes(root) && edges.every((e) => map.includes(e)),
        `the map is the lesson's mind map: « ${root} » and its links (${edges.join(', ')})`,
      );
    }
    await mapApart(w, page, 'hub');
    await shot(page, 'hub', { exit: ['[data-di-map-close]'], numbers: true });
    for (const id of [...KEYS, 'exam']) {
      await page.click(`[data-di-node="${id}"]`);
      await page.waitForTimeout(250);
      const panel = await page.textContent(`[data-di-panel="${id}"]`);
      const names = await page.locator('.di-levels .di-level__name small').allTextContents();
      expect(
        JSON.stringify(names) === JSON.stringify(TEXT.levels[id]),
        `node ${id}: its levels are the lesson's (${names.join(' · ')})`,
      );
      expect(panel.includes(id === 'exam' ? TEXT.summary.title : titles[id]), `node ${id}: the panel names it`);
      await shot(page, `hub-node-${id}`, { exit: ['[data-di-map-close]'], numbers: true });
      if (id !== 'exam') {
        await page.click(`[data-di-panel="${id}"] .di-map__rule .di-link`);
        await page.waitForSelector('[data-di-tablet]');
        await page.waitForTimeout(300);
        expect(
          (await page.textContent('.di-veil')).includes(titles[id]),
          `node ${id}: « Rappelle-moi la règle » opens THIS rule's tablet`,
        );
        await shot(page, `hub-rule-${id}`, { exit: ['[data-di-tablet]', '[data-di-exit]'], numbers: true });
        await page.click('[data-di-tablet]');
        await page.waitForSelector('[data-di-mapcard]');
        const back = await page.locator('[data-di-panel]').getAttribute('data-di-panel');
        check(back === id, `node ${id}: closing the tablet comes back to the hub ON THE SAME NODE (${back})`);
      }
    }
    await page.click('[data-di-space="exam"]');
    await page.waitForSelector('[data-di-ladder="open"]');
    await page.waitForTimeout(400);
    {
      const rungs = await readLadder(page);
      expect(
        rungs.length === 5 && rungs.every((r, i) => rungShows(r, DISK_LADDER[i], i)),
        `« Espace brevet »: the bank's five levels, their minutes and points (${rungs.map((r) => `${r.title}: ${r.small.trim()}`).join(' · ')})`,
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
    await page.click('[data-di-hub-know]');
    await page.waitForSelector('[data-di-know]');
    expect(
      (await st(page)).overlay === 'know' && (await page.locator('[data-di-mapcard]').count()) === 0,
      "the hub's « Fiche de connaissances » opens the knowledge page in place of the hub",
    );
    await page.click('[data-di-know-hub]');
    await page.waitForSelector('[data-di-mapcard]');
    expect(
      (await st(page)).overlay === 'map' && (await page.locator('[data-di-know]').count()) === 0,
      '…and its « Espace d’entraînement » comes back to the hub',
    );

    // ── 4. (another world) a practice level on ITS rail (worlds/<world>.mjs › practice) ──
    if (other) {
      await other.practice({ w, page, L, D, TEXT, titles });
      return;
    }

    // ── 4. a run of the gate dash: « Continuer l’entraînement » ──
    const nextName = (await page.textContent('[data-di-next]')).trim();
    expect(
      Object.values(TEXT.levels)
        .flat()
        .some((x) => nextName.includes(x)),
      `« Continuer l’entraînement » proposes one of the lesson's levels (« ${nextName} »)`,
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
        x.gates.filter((g) => right(x, g)).length === 1,
        `the gate « ${x.type} »: exactly ONE of its three gates is right (${x.gates.join(', ')}) — computed here`,
      );
      expect(
        [x.a, x.b].filter((v) => v != null).some((v) => say.includes(String(v))),
        `the sentence over the rail says the wave's own numbers (« ${say.trim().slice(0, 60)} »)`,
      );
    }
    await shot(page, 'run', { exit: ['[data-di-quit]', '.di-top a.di-icon'], sound: true });
    await page.click('[data-di-rule]');
    await page.waitForSelector('[data-di-tablet]');
    await page.waitForTimeout(300);
    {
      const k = (await wave(page)).key;
      expect(
        (await st(page)).overlay === 'rule' && (await page.textContent('.di-veil')).includes(titles[k]),
        '« La règle » during the run pauses it on the tablet of the rule the gate uses',
      );
    }
    await shot(page, 'run-rule', { exit: ['[data-di-tablet]', '[data-di-exit]'] });
    await page.click('[data-di-tablet]');
    await ff(page, 0.2);
    expect((await st(page)).phase === 'dash', 'closing the tablet resumes the run');
    {
      const x = await wave(page);
      const bad = x.gates.find((g) => !right(x, g));
      await rideTo(page, bad);
      await page.waitForTimeout(500);
      s = await st(page);
      expect(
        s.overlay === 'guide' && s.o.picked === bad && s.dash.hearts === 2,
        `a wrong gate (${bad}) STOPS the run on a guidance card; a shield is lost`,
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
        (await page.textContent('.di-veil')).includes(titles[x.key]),
        "« Rappelle-moi la règle » on the card: the tablet of THIS lesson's rule",
      );
      await page.click('[data-di-tablet]');
      await ff(page, 0.3);
      expect((await st(page)).phase === 'dash', '…and the run goes on');
    }
    await page.click('[data-di-quit]');
    await page.waitForSelector('[data-di-mapcard]');
    expect(
      !(await st(page)).dash && (await st(page)).overlay === 'map',
      '« Quitter » ends the run and comes back to the hub, nothing recorded',
    );
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
    check(
      shown === 1 && (await page.textContent('[data-di-guide-rule]')).includes(titles[s.o.wave.key]),
      'after two mistakes the card SHOWS the rule of THIS lesson by itself',
    );
    await shot(page, 'run-guide-lost', { exit: ['[data-di-exit]', '[data-di-resume]'] });
    await page.click('[data-di-resume]');
    await ff(page, 0.3);
    expect(
      (await st(page)).phase === 'dash' && !(await st(page)).overlay,
      '« J’ai compris, je continue » after the second mistake resumes the run',
    );
    await page.click('[data-di-quit]');
    await page.waitForSelector('[data-di-mapcard]');
    await page.click('[data-di-map-close]');
    await page.waitForSelector('[data-di-start]');
    expect((await st(page)).phase === 'title', 'the run left, the hub closed: back on the title screen');
    if (PHONE) console.log('    (phone held sideways: the hub is checked in its two-column layout)');
  });
  return w;
}
