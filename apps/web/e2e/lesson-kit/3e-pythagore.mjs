// Smoke test for the 3e "théorème de Pythagore" lesson (ported to the kit).
// Run: node apps/web/e2e/lesson-kit/3e-pythagore.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/pythagore-3e`;
const KEY = 'u_anon_smarter_lesson_pythagore-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  hypo: `${ROOT}/langle-droit-et-son-vis-a-vis`,
  carres: `${ROOT}/les-trois-carres`,
  casse: `${ROOT}/quand-langle-nest-plus-droit`,
  ecrire: `${ROOT}/ecrire-puis-calculer`,
  cote: `${ROOT}/le-cote-manquant`,
  reciproque: `${ROOT}/direct-et-reciproque`,
  echelles: `${ROOT}/echelles-et-diagonales`,
  boss: `${ROOT}/mission-finale-le-chantier`,
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
  watchErrors(page, opts.tag || 'py');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

async function nudge(page, vertex, key, times) {
  const h = page.locator(`circle[aria-label^="Sommet ${vertex}"]`).first();
  if (!(await h.count())) return false;
  await h.focus();
  for (let i = 0; i < times; i += 1) {
    await page.keyboard.press(key);
    await page.waitForTimeout(60);
  }
  return true;
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index — the lesson is on the kit now ──────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: has a module 0 (the pre-kit lesson had none)', /Mission de départ/i.test(body));
    check('index: signature module', /trois carrés/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}py-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Trigger: hypotenuse on tilted triangles ───────────────── */
  {
    const { ctx, page } = await open(browser, M.hypo, ['0'], { tag: 'hypo' });
    let body = await page.locator('body').innerText();
    check('M1: asks where the right angle is', /angle droit/i.test(body));
    await page.locator('button:has-text("En A")').first().click({ force: true });
    await page.waitForTimeout(500);
    body = await page.locator('body').innerText();
    check('M1: explains the mark, not the orientation', /marque carrée/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}py-m1-hypo.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 3. Signature: the balance of squares ─────────────────────── */
  {
    const { ctx, page } = await open(browser, M.carres, ['0', '1'], { tag: 'carres' });
    let body = await page.locator('body').innerText();
    check('M2: balance starts level on a right triangle',
      /équilibre/i.test(body), body.slice(0, 500));
    check('M2: shows both pans', /deux petits carrés[\s\S]*grand carré/i.test(body));

    // Three readings, reshaping between each (the right angle re-snaps).
    for (let i = 0; i < 3; i += 1) {
      const btn = page.locator('button:has-text("Relever la balance")').first();
      if (!(await btn.count())) break;
      await btn.click({ force: true });
      await page.waitForTimeout(300);
      if (await page.locator('button:has-text("Relever la balance")').count()) {
        // C slides along the perpendicular that preserves the right angle, so
        // the VERTICAL arrows reshape the triangle. Each round must land on a
        // genuinely NEW shape — going down then back up would repeat a reading.
        await nudge(page, 'C', 'ArrowDown', 6 + i * 4);
        await page.waitForTimeout(200);
      }
    }
    body = await page.locator('body').innerText();
    check('M2: three readings collected, equality holds',
      /trois triangles rectangles différents|3\/3/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}py-m2-balance.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. The converse: breaking the right angle tips the balance ─ */
  {
    const { ctx, page } = await open(browser, M.casse, ['0', '1', '2'], { tag: 'casse' });
    await nudge(page, 'C', 'ArrowRight', 10);
    let body = await page.locator('body').innerText();
    check('M3: balance tips when the angle is broken',
      /penche/i.test(body), body.slice(0, 500));
    await nudge(page, 'C', 'ArrowLeft', 20);
    body = await page.locator('body').innerText();
    check('M3: names which way it tips', /aigu|obtus|ouvert|fermé|petits|grand/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}py-m3-casse.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. Writing the equality, then the missing-root trap ──────── */
  {
    const { ctx, page } = await open(browser, M.ecrire, ['0', '1', '2', '3'], { tag: 'ecr' });
    // Step 2: answer 225 — the classic "forgot the square root".
    const fields = page.locator('input[type="text"], input[type="number"]');
    if (await fields.count()) {
      await fields.first().fill('225');
      await fields.first().press('Enter');
      await page.waitForTimeout(600);
    }
    const body = await page.locator('body').innerText();
    check('M4: intercepts the forgotten square root',
      /racine carrée/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}py-m4-ecrire.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. Subtraction, and the coherence check ──────────────────── */
  {
    const { ctx, page } = await open(browser, M.cote, ['0', '1', '2', '3', '4'], { tag: 'cote' });
    let body = await page.locator('body').innerText();
    check('M5: asks whether to add or subtract', /soustra|additionn/i.test(body));
    // Wrong on purpose: the "add instead of subtract" option.
    const wrong = page.locator('button:has-text("KM^{2} = LM^{2} + KL^{2}"), button:has-text("KM² = LM² + KL²")').first();
    if (await wrong.count()) {
      await wrong.click({ force: true });
      await page.waitForTimeout(500);
      body = await page.locator('body').innerText();
    }
    check('M5: explains why adding is impossible',
      /plus court|impossible|soustrait/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}py-m5-cote.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. The converse proof, with its trap step ────────────────── */
  {
    const { ctx, page } = await open(browser, M.reciproque, ['0', '1', '2', '3', '4', '5'], { tag: 'rec' });
    let body = await page.locator('body').innerText();
    check('M6: shows the proof scaffold', /Donnée|Calcul|Conclusion/i.test(body));

    const order = [
      'Le plus grand côté est [RT]',
      'D’une part : RT² = 10² = 100',
      'D’autre part : RS² + ST²',
      'Les deux résultats sont égaux',
    ];
    for (const label of order) {
      const b = page.locator(`button:has-text("${label.slice(0, 30)}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(200); }
    }
    body = await page.locator('body').innerText();
    check('M6: accepts the correct converse proof',
      /Rédaction correcte/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}py-m6-reciproque.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. Practice lab: the dynamic ladder ──────────────────────── */
  {
    const { ctx, page } = await open(browser, M.echelles, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'ech' });
    let body = await page.locator('body').innerText();
    check('M7: ladder scene is dynamic (distance control)', /Distance au mur/i.test(body));
    // Move to 3 m, where the answer is exactly 4.
    await page.locator('button[aria-label="Écarter l’échelle du mur"]').first().click({ force: true });
    await page.waitForTimeout(200);
    await page.locator('button[aria-label="Écarter l’échelle du mur"]').first().click({ force: true });
    await page.waitForTimeout(400);
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('4');
    await field.press('Enter');
    await page.waitForTimeout(600);
    body = await page.locator('body').innerText();
    check('M7: the answer follows the chosen distance',
      /25 − 9|SOUSTRAIT|soustrait/i.test(body), body.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}py-m7-echelles.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Boss ──────────────────────────────────────────────────── */
  {
    const seeded = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seeded, { tag: 'boss' });
    let body = await page.locator('body').innerText();
    check('boss: loads', /Mission finale/i.test(body));
    check('boss: silent before submit', !/Bonne réponse|Corrigé/i.test(body));

    const correct = [
      '[AC]', 'toujours le plus grand des trois côtés', '9 + 16 = 25',
      'DF² = DE² + EF²', '15 cm', '15 cm',
      'C’est forcément faux', 'Oui : 9² + 12² = 81 + 144 = 225',
      'On repère le plus grand côté', '4 m',
    ];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(1200); }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}py-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 10. Revisit + mobile ─────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.carres, ['0', '1', '2'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, M.carres, ['0', '1'], { tag: 'mobile', mobile: true });
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
    await page.screenshot({ path: `${SHOT_DIR}py-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
