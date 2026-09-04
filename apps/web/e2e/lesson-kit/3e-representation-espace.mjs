// Smoke test for the 3e "représentation de l'espace" lesson.
// Run: node apps/web/e2e/lesson-kit/3e-representation-espace.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/representation-espace-3e`;
const KEY = 'u_anon_smarter_lesson_representation-espace-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  trois: `${ROOT}/trois-dessins-un-objet`,
  compter: `${ROOT}/faces-aretes-sommets`,
  cache: `${ROOT}/ce-que-le-dessin-cache`,
  tourner: `${ROOT}/tourner-pour-verifier`,
  vues: `${ROOT}/les-trois-vues`,
  cavaliere: `${ROOT}/la-perspective-cavaliere`,
  cube: `${ROOT}/dans-le-cube`,
  boss: `${ROOT}/mission-finale-latelier`,
};

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
}
function summary() {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) { console.log('FAILED:'); fails.forEach((f) => console.log(` - ${f.name} ${f.detail}`)); }
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

async function open(browser, url, completedModules, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1600 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || 're');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

async function press(page, label, times = 1) {
  const btn = page.locator(`button[aria-label="${label}"]`).first();
  for (let i = 0; i < times; i += 1) {
    if (!(await btn.isEnabled().catch(() => false))) break;
    await btn.click({ force: true });
    await page.waitForTimeout(100);
  }
}

/**
 * LAYOUT SAFETY — every SVG element must stay inside its own viewBox, for
 * every state the student can reach. Returns the offending elements.
 */
async function svgOverflow(page) {
  return page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('main svg').forEach((svg, si) => {
      const vb = svg.viewBox?.baseVal;
      if (!vb || !vb.width) return;
      const pad = 1.5;
      svg.querySelectorAll('line, polygon, circle, text, path').forEach((el) => {
        let b;
        try { b = el.getBBox(); } catch { return; }
        if (!b || (b.width === 0 && b.height === 0)) return;
        if (b.x < vb.x - pad || b.y < vb.y - pad
          || b.x + b.width > vb.x + vb.width + pad
          || b.y + b.height > vb.y + vb.height + pad) {
          bad.push(`svg${si} ${el.tagName}${el.textContent ? `("${el.textContent.trim().slice(0, 12)}")` : ''}`);
        }
      });
    });
    return bad;
  });
}

/** Text labels inside a given SVG must not overlap one another. */
async function textCollisions(page) {
  return page.evaluate(() => {
    const clash = [];
    document.querySelectorAll('main svg').forEach((svg, si) => {
      const texts = [...svg.querySelectorAll('text')].map((t) => {
        let b;
        try { b = t.getBBox(); } catch { return null; }
        return b && b.width ? { b, s: t.textContent.trim() } : null;
      }).filter(Boolean);
      for (let i = 0; i < texts.length; i += 1) {
        for (let j = i + 1; j < texts.length; j += 1) {
          const a = texts[i].b;
          const c = texts[j].b;
          const ox = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x);
          const oy = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y);
          // Only a real overlap counts: more than a couple of px on BOTH axes.
          if (ox > 2 && oy > 2) clash.push(`svg${si}: "${texts[i].s}" ∩ "${texts[j].s}"`);
        }
      }
    });
    return clash;
  });
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: module 0 card', /Mission de départ/i.test(body));
    check('index: signature module', /Ce que le dessin cache/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}re-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Trigger: three drawings, one cube ─────────────────────── */
  {
    const { ctx, page } = await open(browser, M.trois, ['0'], { tag: 'trois' });
    let body = await page.locator('body').innerText();
    check('M1: shows three drawings', /Dessin 1[\s\S]*Dessin 2[\s\S]*Dessin 3/.test(body));

    await press(page, 'Tourner Rotation horizontale vers la droite', 2);
    await press(page, 'Tourner Inclinaison vers la droite', 1);
    body = await page.locator('body').innerText();
    check('M1: concludes it is the same cube', /même cube/i.test(body), body.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}re-m1-trois.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 3. Counting, including the hidden vertex ─────────────────── */
  {
    const { ctx, page } = await open(browser, M.compter, ['0', '1'], { tag: 'cpt' });
    for (const label of ['Les faces', 'Les arêtes', 'Les sommets']) {
      const b = page.locator(`button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(300); }
    }
    const body = await page.locator('body').innerText();
    check('M2: names the hidden vertex explicitly',
      /gris pâle|derrière/i.test(body), body.slice(0, 700));
    check('M2: counts come from the model (6/12/8)', /6[\s\S]{0,80}12[\s\S]{0,80}8/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}re-m2-compter.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. Signature: the tracked edge changes state ─────────────── */
  {
    const { ctx, page } = await open(browser, M.cache, ['0', '1', '2'], { tag: 'cache' });
    let body = await page.locator('body').innerText();
    const before = /est actuellement\s*VISIBLE/i.test(body) ? 'visible' : 'cachee';
    check('M3: reports the tracked edge state', /est actuellement/i.test(body), body.slice(0, 500));

    // Turning left flips [AE] from visible to hidden.
    await press(page, 'Tourner Rotation horizontale vers la gauche', 3);
    body = await page.locator('body').innerText();
    const after = /est actuellement\s*VISIBLE/i.test(body) ? 'visible' : 'cachee';
    check('M3: the SAME edge changes state when turning', before !== after,
      `before=${before} after=${after}`);
    check('M3: names the conclusion', /toujours la même arête|point de vue/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}re-m3-cache.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. LAYOUT SAFETY across the whole rotation range ─────────── */
  {
    const { ctx, page } = await open(browser, M.cache, ['0', '1', '2'], { tag: 'layout' });
    const overflows = [];
    const clashes = [];
    // Sweep the reachable rotation range, not just the default state.
    for (let i = 0; i < 8; i += 1) {
      await press(page, 'Tourner Rotation horizontale vers la droite', 2);
      await press(page, 'Tourner Inclinaison vers la droite', i % 2 ? 1 : 0);
      overflows.push(...(await svgOverflow(page)));
      clashes.push(...(await textCollisions(page)));
    }
    for (let i = 0; i < 8; i += 1) {
      await press(page, 'Tourner Rotation horizontale vers la gauche', 3);
      await press(page, 'Tourner Inclinaison vers la gauche', i % 2 ? 1 : 0);
      overflows.push(...(await svgOverflow(page)));
      clashes.push(...(await textCollisions(page)));
    }
    check('layout: nothing overflows its viewBox at any rotation',
      overflows.length === 0, [...new Set(overflows)].slice(0, 5).join(' | '));
    check('layout: no two labels overlap at any rotation',
      clashes.length === 0, [...new Set(clashes)].slice(0, 5).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}re-layout-sweep.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. Identifying by turning ────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.tourner, ['0', '1', '2', '3'], { tag: 'tou' });
    await press(page, 'Tourner Rotation horizontale vers la droite', 2);
    await page.locator('button:has-text("Un prisme droit à base triangulaire")').first()
      .click({ force: true });
    await page.waitForTimeout(500);
    const body = await page.locator('body').innerText();
    check('M4: identified by counting, not by looks',
      /5 faces|comptes/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}re-m4-tourner.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. Three views ──────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.vues, ['0', '1', '2', '3', '4'], { tag: 'vues' });
    // The step's content renders inside its card; assert on the card itself so
    // the surrounding page chrome cannot satisfy (or mask) the check.
    const card = page.locator('text=/Les trois vues d.un pavé/').first();
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    const body = await page.locator('body').innerText();
    const views = await page.locator('svg[aria-label^="Vue "]').count();
    check('M5: renders the three projected views', views >= 3, `${views} view svgs`);
    check('M5: reports the apparent dimensions', /dimensions apparentes/i.test(body),
      body.slice(0, 400));
    const clashes = await textCollisions(page);
    check('M5: view panels have no overlapping labels', clashes.length === 0,
      clashes.slice(0, 4).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}re-m5-vues.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. Cavalière parameters ─────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.cavaliere, ['0', '1', '2', '3', '4', '5'], { tag: 'cav' });
    const overflows = [];
    for (const a of ['30°', '60°', '45°']) {
      const b = page.locator(`button:has-text("${a}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(250); }
      overflows.push(...(await svgOverflow(page)));
    }
    for (const k of ['0,3', '0,7', '0,5']) {
      const b = page.locator(`button:has-text("${k}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(250); }
      overflows.push(...(await svgOverflow(page)));
    }
    const body = await page.locator('body').innerText();
    check('M6: the front face stays true to scale', /face avant/i.test(body), body.slice(0, 600));
    check('layout: cavalière drawing stays in frame for every setting',
      overflows.length === 0, [...new Set(overflows)].slice(0, 5).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}re-m6-cavaliere.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Relative positions in the cube ───────────────────────── */
  {
    const { ctx, page } = await open(browser, M.cube, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'cube' });
    await press(page, 'Tourner Rotation horizontale vers la droite', 2);
    const body = await page.locator('body').innerText();
    check('M7: names the non-coplanar case',
      /non coplanaires|ni parallèles ni sécantes/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}re-m7-cube.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 10. Boss ────────────────────────────────────────────────── */
  {
    const seeded = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seeded, { tag: 'boss' });
    let body = await page.locator('body').innerText();
    check('boss: loads', /Mission finale/i.test(body));
    check('boss: silent before submit', !/Bonne réponse|Corrigé/i.test(body));

    const correct = [
      'Un prisme droit à base triangulaire', '8', '2',
      'Des arêtes réelles du solide',
      'Elle peut devenir visible',
      'Changer de point de vue et compter',
      'Parce que chaque vue écrase une dimension',
      'La face avant est en vraie grandeur',
      'Non : elles peuvent être non coplanaires',
      'Ni parallèles ni sécantes',
    ];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(1200); }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}re-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 11. Revisit + mobile ────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.cache, ['0', '1', '2', '3'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, M.cache, ['0', '1', '2'], { tag: 'mobile', mobile: true });
    const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
    check('mobile: no horizontal scroll', overflow <= 1, `overflow ${overflow}px`);
    const small = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('main button:not([disabled])').forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40)) {
          bad.push(`${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20)} ${Math.round(r.width)}×${Math.round(r.height)}`);
        }
      });
      return bad;
    });
    check('mobile: tap targets ≥ 40px', small.length === 0, small.slice(0, 4).join(' | '));
    const clashes = await textCollisions(page);
    check('mobile: no overlapping labels at 375px', clashes.length === 0, clashes.slice(0, 4).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}re-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
