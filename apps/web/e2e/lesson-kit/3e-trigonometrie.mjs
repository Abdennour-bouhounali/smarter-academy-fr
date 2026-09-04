// Smoke test for the 3e "trigonométrie dans le triangle rectangle" lesson.
// Run: node apps/web/e2e/lesson-kit/3e-trigonometrie.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e`;
const KEY = 'u_anon_smarter_lesson_trigonometrie-triangle-rectangle-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  rampes: `${ROOT}/deux-rampes`,
  cotes: `${ROOT}/nommer-les-cotes`,
  rapport: `${ROOT}/le-rapport-ne-depend-que-de-langle`,
  noms: `${ROOT}/trois-rapports-trois-noms`,
  calculer: `${ROOT}/calculer-une-longueur`,
  resoudre: `${ROOT}/choisir-puis-resoudre`,
  pentes: `${ROOT}/angles-et-pentes`,
  boss: `${ROOT}/mission-finale-les-pentes`,
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
  watchErrors(page, opts.tag || 'tg');
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

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: module 0 card', /Mission de départ/i.test(body));
    check('index: signature module', /ne dépend que de l.angle/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tg-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Trigger: two ramps, one slope ─────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.rampes, ['0'], { tag: 'rampes' });
    let body = await page.locator('body').innerText();
    check('M1: shows both ramps', /Rampe A[\s\S]*Rampe B/.test(body));

    await page.locator('button:has-text("Elles ont la même inclinaison")').first().click({ force: true });
    await page.waitForTimeout(500);
    body = await page.locator('body').innerText();
    check('M1: explains that length says nothing about steepness',
      /pas plus raide|même angle/i.test(body), body.slice(0, 600));

    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.count()) {
      await field.fill('0,75');
      await field.press('Enter');
      await page.waitForTimeout(600);
      body = await page.locator('body').innerText();
    }
    check('M1: both ramps give exactly the same quotient (0,75)',
      /0,75/.test(body), body.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}tg-m1-rampes.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 3. Roles swap when the studied angle changes ─────────────── */
  {
    const { ctx, page } = await open(browser, M.cotes, ['0', '1'], { tag: 'cotes' });
    let body = await page.locator('body').innerText();
    check('M2: starts on angle A', /Opposé : \[BC\]/.test(body), body.slice(0, 700));

    await page.locator('button:has-text("Étudier l’angle en C")').first().click({ force: true });
    await page.waitForTimeout(600);
    body = await page.locator('body').innerText();
    check('M2: opposite and adjacent SWAP when the angle changes',
      /échangé leurs rôles|Opposé : \[AB\]/.test(body), body.slice(0, 800));
    check('M2: the hypotenuse never changes', /hypoténuse \[AC\]|Hypoténuse : \[AC\]/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tg-m2-cotes.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. Signature: scaling changes nothing ────────────────────── */
  {
    const { ctx, page } = await open(browser, M.rapport, ['0', '1', '2'], { tag: 'rap' });
    let body = await page.locator('body').innerText();
    check('M3: shows the three quotients', /opposé \/ hyp\.[\s\S]*adjacent \/ hyp\./i.test(body));

    for (let i = 0; i < 3; i += 1) {
      const btn = page.locator('button:has-text("Relever les trois quotients")').first();
      if (!(await btn.count())) break;
      await btn.click({ force: true });
      await page.waitForTimeout(280);
      if (await page.locator('button:has-text("Relever les trois quotients")').count()) {
        await press(page, 'Augmenter Taille (hypoténuse)', 1);
      }
    }
    body = await page.locator('body').innerText();
    check('M3: three sizes, identical quotients',
      /toutes différentes|exactement les mêmes trois quotients/i.test(body), body.slice(0, 900));

    // Step 2: changing the ANGLE does move them.
    await press(page, 'Augmenter Angle étudié', 3);
    body = await page.locator('body').innerText();
    check('M3: changing the angle moves the quotients',
      /dépendent de l.angle|différents de ceux/i.test(body), body.slice(0, 900));
    await page.screenshot({ path: `${SHOT_DIR}tg-m3-signature.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. Choosing the ratio is deduced, not guessed ────────────── */
  {
    const { ctx, page } = await open(browser, M.calculer, ['0', '1', '2', '3', '4'], { tag: 'calc' });
    // Wrong on purpose first: adjacent instead of opposite.
    await page.locator('button:has-text("hypoténuse")').first().click({ force: true });
    await page.waitForTimeout(200);
    await page.locator('button:has-text("côté adjacent")').last().click({ force: true });
    await page.waitForTimeout(400);
    let body = await page.locator('body').innerText();
    check('M4: the ratio is DEDUCED from the two chosen sides',
      /cosinus|sinus|tangente/i.test(body), body.slice(0, 700));

    // Now the correct pair.
    await page.locator('button:has-text("côté opposé")').last().click({ force: true });
    await page.waitForTimeout(500);
    body = await page.locator('body').innerText();
    check('M4: hypotenuse + opposite gives the sine',
      /sinus/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}tg-m5-calculer.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. The inverse operation ─────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.resoudre, ['0', '1', '2', '3', '4', '5'], { tag: 'res' });
    await page.locator('button:has-text("Le cosinus")').first().click({ force: true });
    await page.waitForTimeout(500);
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.count()) {
      await field.fill('0,44');       // gives the ratio instead of the angle
      await field.press('Enter');
      await page.waitForTimeout(600);
    }
    const body = await page.locator('body').innerText();
    check('M6: intercepts giving the ratio instead of the angle',
      /RAPPORT|arccos/i.test(body), body.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}tg-m6-resoudre.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. Practice lab: the percent-slope trap ──────────────────── */
  {
    const { ctx, page } = await open(browser, M.pentes, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'pen' });
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('5');            // reading 5 % as 5°
    await field.press('Enter');
    await page.waitForTimeout(600);
    const body = await page.locator('body').innerText();
    check('M7: intercepts reading a percent slope as an angle',
      /RAPPORT|arctan/i.test(body), body.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}tg-m7-pentes.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. Boss ──────────────────────────────────────────────────── */
  {
    const seeded = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seeded, { tag: 'boss' });
    let body = await page.locator('body').innerText();
    check('boss: loads', /Mission finale/i.test(body));
    check('boss: silent before submit', !/Bonne réponse|Corrigé/i.test(body));

    const correct = [
      '[RT]', '[BC]', 'L’hypoténuse : elle est définie par l’angle droit',
      'Ils sont inchangés', 'adjacent / hypoténuse',
      'Il a inversé la fraction', 'Le cosinus', '8,7 m',
      'arcsin (ou sin⁻¹) appliqué à 0,5', 'Environ 5,7°',
    ];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(1200); }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}tg-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Revisit + mobile ──────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.rapport, ['0', '1', '2', '3'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, M.rapport, ['0', '1', '2'], { tag: 'mobile', mobile: true });
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
    await page.screenshot({ path: `${SHOT_DIR}tg-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
