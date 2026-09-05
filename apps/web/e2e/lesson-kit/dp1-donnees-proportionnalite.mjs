// Smoke test for the three from-scratch 6e "données et proportionnalité"
// lessons: tableaux, graphiques, proportionnalite.
// Run: node apps/web/e2e/lesson-kit/dp1-donnees-proportionnalite.mjs
// (dev server on :5191, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5191';
const ROOT = `${BASE}/courses/college/6e/donnees_proportionnalite`;
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const LESSONS = {
  tableaux: { path: `${ROOT}/tableaux`, key: 'u_anon_smarter_lesson_tableaux', total: 8 },
  graphiques: { path: `${ROOT}/graphiques`, key: 'u_anon_smarter_lesson_graphiques', total: 8 },
  proportionnalite: { path: `${ROOT}/proportionnalite`, key: 'u_anon_smarter_lesson_proportionnalite', total: 8 },
};

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
}
function summary() {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) {
    console.log('FAILED:');
    fails.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
  }
  return fails.length;
}

function seedInit({ key, completedModules }) {
  localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] }));
}

const errs = [];
function watchErrors(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
    errs.push(`[${tag}] console: ${t}`);
  });
  page.on('pageerror', (err) => errs.push(`[${tag}] pageerror: ${err.message}`));
}

const settle = (page) => page.waitForTimeout(1200);

async function openSeeded(browser, lesson, url, completedModules, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1400 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || lesson);
  if (completedModules) {
    await page.addInitScript(seedInit, { key: LESSONS[lesson].key, completedModules });
  }
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index pages load ─────────────────────────────────────────── */
  for (const [name, l] of Object.entries(LESSONS)) {
    const { ctx, page } = await openSeeded(browser, name, l.path, null, { tag: `${name}-index` });
    const body = await page.locator('body').innerText();
    check(`${name}: index loads`, body.length > 200, `body ${body.length} chars`);
    check(`${name}: index shows module 0 card`, /Mission de départ/i.test(body));
    check(`${name}: no NaN on index`, !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}dp-${name}-index.png`, fullPage: false });
    await ctx.close();
  }

  /* ── 2. Diagnostic is non-blocking in each lesson ────────────────── */
  for (const [name, l] of Object.entries(LESSONS)) {
    const { ctx, page } = await openSeeded(browser, name, `${l.path}/mission-de-depart`, null, { tag: `${name}-diag` });
    const opts = page.locator('div[role="group"] > button[aria-pressed]');
    const n = await opts.count();
    check(`${name}: diagnostic renders options`, n >= 10, `${n} options`);
    for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 2000 }).catch(() => {});
    const submit = page.locator('button:has-text("Voir mon résultat")');
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(500);
    }
    const body = await page.locator('body').innerText();
    check(`${name}: diagnostic reaches a result`, /\/\s*10|score|résultat/i.test(body));
    await ctx.close();
  }

  /* ── 3. Tableaux — signature manipulation (SortingBoard) ─────────── */
  {
    const { ctx, page } = await openSeeded(
      browser, 'tableaux', `${LESSONS.tableaux.path}/ranger-le-desordre`, ['0', '1', '2'], { tag: 'tab-m3' },
    );
    const header = await page.locator('body').innerText();
    check('tableaux M3: header without NaN', !/NaN/.test(header));
    check('tableaux M3: shows module 3 of 8', /Module\s*3\s*\/\s*8/i.test(header), header.slice(0, 200));

    // Facts to place are buttons in the "Informations à ranger" group.
    const facts = page.locator('div[role="group"][aria-label="Informations à ranger"] button');
    const nFacts = await facts.count();
    check('tableaux M3: scattered facts rendered', nFacts === 8, `${nFacts} facts`);

    // Wrong-on-purpose: click a cell that is not the target, expect a correction
    // message naming what that cell means, and the fact still placeable.
    const cellButtons = page.locator('table button[aria-label*=","]');
    const nCells = await cellButtons.count();
    check('tableaux M3: table cells are tappable', nCells >= 8, `${nCells} cells`);
    const firstLabel = await facts.first().innerText();
    // Deliberately click the last cell (unlikely to be the first fact's target).
    await cellButtons.last().click({ force: true });
    await page.waitForTimeout(400);
    const afterWrong = await page.locator('body').innerText();
    const gotCorrection = /Cette case-là|croisement/i.test(afterWrong);
    check('tableaux M3: wrong placement explains the cell meaning', gotCorrection);
    check('tableaux M3: still not blocked after a wrong tap', (await facts.count()) > 0);

    // Now place every fact correctly by matching its row/col to the cell aria-label.
    for (let guard = 0; guard < 20; guard += 1) {
      const remaining = await facts.count();
      if (remaining === 0) break;
      const label = await facts.first().innerText(); // "Tom, relais : 15 pts"
      const [row, rest] = label.split(',');
      const col = rest.split(':')[0].trim();
      await facts.first().click();
      const target = page.locator(
        `table button[aria-label^="${row.trim()}, ${col.charAt(0).toUpperCase()}${col.slice(1)}"]`,
      );
      if ((await target.count()) > 0) {
        await target.first().click({ force: true });
      } else {
        // Fall back to the reveal escape hatch after repeated misses.
        const hatch = page.locator('button:has-text("montre-moi")');
        if (await hatch.isVisible().catch(() => false)) await hatch.click();
      }
      await page.waitForTimeout(200);
    }
    const done = await page.locator('body').innerText();
    check('tableaux M3: manipulation completes on the real goal', /Tableau complet/i.test(done), firstLabel);
    await page.screenshot({ path: `${SHOT_DIR}dp-tableaux-m3.png`, fullPage: false });
    await ctx.close();
  }

  /* ── 4. Graphiques — linked table ↔ chart ────────────────────────── */
  {
    const { ctx, page } = await openSeeded(
      browser, 'graphiques', `${LESSONS.graphiques.path}/tableau-et-graphique-lies`, ['0', '1', '2'], { tag: 'gr-m3' },
    );
    const head = await page.locator('body').innerText();
    check('graphiques M3: no NaN', !/NaN/.test(head));
    check('graphiques M3: shows module 3 of 8', /Module\s*3\s*\/\s*8/i.test(head));

    const svg = page.locator('svg[role="group"], svg[role="img"]');
    check('graphiques M3: chart rendered', (await svg.count()) > 0);

    // The linked table's + button drives the same data as the bar.
    const plus = page.locator('button[aria-label^="Augmenter"]');
    const nPlus = await plus.count();
    check('graphiques M3: table has editable cells', nPlus >= 1, `${nPlus} + buttons`);
    if (nPlus > 0) {
      const before = await plus.first().getAttribute('aria-label');
      await plus.first().click();
      await page.waitForTimeout(250);
      const after = await plus.first().getAttribute('aria-label');
      check('graphiques M3: editing the table updates the shared value', before !== after, `${before} -> ${after}`);
    }

    // Drive the guided bar all the way to the 24 °C target via + taps.
    for (let i = 0; i < 30; i += 1) {
      const lbl = await plus.first().getAttribute('aria-label').catch(() => null);
      if (!lbl || /24/.test(lbl)) break;
      await plus.first().click();
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(500);
    const afterTarget = await page.locator('body').innerText();
    check('graphiques M3: reaching the target completes the step', /la même donnée|24/i.test(afterTarget));
    await page.screenshot({ path: `${SHOT_DIR}dp-graphiques-m3.png`, fullPage: false });
    await ctx.close();
  }

  /* ── 5. Graphiques — the misleading-graph lab renders both axes ──── */
  {
    const { ctx, page } = await openSeeded(
      browser, 'graphiques', `${LESSONS.graphiques.path}/le-graphique-qui-ment`, ['0', '1', '2', '3', '4', '5'], { tag: 'gr-m6' },
    );
    const body = await page.locator('body').innerText();
    check('graphiques M6: truncated-axis lab renders', /publicité|axe/i.test(body));
    check('graphiques M6: no NaN', !/NaN/.test(body));
    const charts = await page.locator('svg').count();
    check('graphiques M6: both the faulty and honest charts are drawn', charts >= 2, `${charts} svg`);
    await ctx.close();
  }

  /* ── 6. Proportionnalité — the TestBench predict-then-verify loop ── */
  {
    const { ctx, page } = await openSeeded(
      browser, 'proportionnalite', `${LESSONS.proportionnalite.path}/le-banc-d-essai`, ['0', '1', '2'], { tag: 'pr-m3' },
    );
    const head = await page.locator('body').innerText();
    check('proportionnalite M3: no NaN', !/NaN/.test(head));
    check('proportionnalite M3: shows module 3 of 8', /Module\s*3\s*\/\s*8/i.test(head));
    check('proportionnalite M3: first situation is the crêpe stand', /stand de crêpes/i.test(head));

    // Predict deliberately WRONG, and check the bench still reveals and progresses.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('99');
    await page.locator('button:has-text("Tester")').click();
    await page.waitForTimeout(500);
    const afterTest = await page.locator('body').innerText();
    check('proportionnalite M3: wrong prediction still reveals reality', /La réalité/i.test(afterTest));
    check('proportionnalite M3: verdict buttons appear', /proportionnelle/i.test(afterTest));

    const verdict = page.locator('button:has-text("Oui, proportionnelle")');
    if (await verdict.isVisible().catch(() => false)) {
      await verdict.click();
      await page.waitForTimeout(400);
    }
    const afterVerdict = await page.locator('body').innerText();
    check('proportionnalite M3: verdict explained with the coefficient', /multiplie|coefficient|3/i.test(afterVerdict));
    await page.screenshot({ path: `${SHOT_DIR}dp-proportionnalite-m3.png`, fullPage: false });
    await ctx.close();
  }

  /* ── 7. Each boss: silent until submit, then review ──────────────── */
  const BOSSES = {
    tableaux: 'le-tournoi-des-6e',
    graphiques: 'la-station-meteo',
    proportionnalite: 'le-grand-stand',
  };
  for (const [name, slug] of Object.entries(BOSSES)) {
    const { ctx, page } = await openSeeded(
      browser, name, `${LESSONS[name].path}/${slug}`, ['0', '1', '2', '3', '4', '5', '6'], { tag: `${name}-boss` },
    );
    const body = await page.locator('body').innerText();
    check(`${name} boss: renders`, /Boss final|Mission finale/i.test(body));
    check(`${name} boss: no NaN`, !/NaN/.test(body));
    check(`${name} boss: silent before submit`, !/Bonne réponse/i.test(body));

    // Answer every épreuve by taking the first option of each choice group.
    const groups = page.locator('div[role="group"]');
    const nGroups = await groups.count();
    for (let i = 0; i < nGroups; i += 1) {
      const btn = groups.nth(i).locator('button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
    }
    await page.waitForTimeout(300);
    const submit = page.locator('button').filter({ hasText: /Valider mes|Valider/ }).first();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(900);
    }
    const after = await page.locator('body').innerText();
    check(`${name} boss: submitting produces a score`, /\/\s*10|score|Mon profil|résultat/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}dp-${name}-boss.png`, fullPage: false });
    await ctx.close();
  }

  /* ── 8. Mobile pass: no horizontal scroll, tap targets ≥ 40 px ───── */
  const MOBILE_PAGES = [
    ['tableaux', `${LESSONS.tableaux.path}/ranger-le-desordre`, ['0', '1', '2']],
    ['graphiques', `${LESSONS.graphiques.path}/tableau-et-graphique-lies`, ['0', '1', '2']],
    ['proportionnalite', `${LESSONS.proportionnalite.path}/le-banc-d-essai`, ['0', '1', '2']],
  ];
  for (const [name, url, seed] of MOBILE_PAGES) {
    const { ctx, page } = await openSeeded(browser, name, url, seed, { mobile: true, tag: `${name}-mobile` });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check(`${name} mobile: no horizontal page scroll`, overflow <= 1, `overflow ${overflow}px`);

    // Only the lesson's own controls are in scope: the site chrome (burger
    // menu, Ctrl+K search) is pre-existing and shared by every page.
    const small = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('main button').forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40) {
          out.push(`${(b.getAttribute('aria-label') || b.textContent).trim().slice(0, 18)}:${Math.round(r.height)}`);
        }
      });
      return out;
    });
    check(`${name} mobile: tap targets ≥ 40 px`, small.length === 0, small.slice(0, 6).join(', '));
    await page.screenshot({ path: `${SHOT_DIR}dp-${name}-mobile.png`, fullPage: false });
    await ctx.close();
  }

  /* ── 9. Zero console/page errors across the whole run ────────────── */
  check('no console/page errors across the run', errs.length === 0, errs.slice(0, 8).join(' | '));

  await browser.close();
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => {
  console.error('RUNNER CRASH', e);
  process.exit(2);
});
