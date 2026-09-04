// Smoke test for the 3e "théorème de Thalès" lesson (ported to the kit).
// Run: node apps/web/e2e/lesson-kit/3e-thales.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/thales-3e`;
const KEY = 'u_anon_smarter_lesson_thales-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  soleil: `${ROOT}/lombre-au-soleil`,
  config: `${ROOT}/reconnaitre-la-configuration`,
  rapports: `${ROOT}/les-rapports-qui-ne-bougent-pas`,
  calculer: `${ROOT}/calculer-une-longueur`,
  parallele: `${ROOT}/et-si-ce-nest-pas-parallele`,
  rediger: `${ROOT}/rediger`,
  kheops: `${ROOT}/de-kheops-au-chantier`,
  boss: `${ROOT}/mission-finale-larpenteur`,
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
  watchErrors(page, opts.tag || 'th');
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
    await page.waitForTimeout(90);
  }
}

/** Slides M (or N) via its keyboard handle. */
async function slide(page, which, key, times) {
  const label = which === 'M' ? 'Point M sur la droite AB' : 'Point N sur la droite AC';
  const h = page.locator(`circle[aria-label^="${label}"]`).first();
  if (!(await h.count())) return false;
  await h.focus();
  for (let i = 0; i < times; i += 1) {
    await page.keyboard.press(key);
    await page.waitForTimeout(55);
  }
  return true;
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: has a module 0 (the pre-kit lesson had none)', /Mission de départ/i.test(body));
    check('index: signature module', /rapports qui ne bougent pas/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}th-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Trigger: the constant shadow ratio ────────────────────── */
  {
    const { ctx, page } = await open(browser, M.soleil, ['0'], { tag: 'soleil' });
    let body = await page.locator('body').innerText();
    check('M1: uses parallel sun rays, not a lamp', /rayons parallèles/i.test(body));

    for (let i = 0; i < 3; i += 1) {
      const btn = page.locator('button:has-text("Relever ce rapport")').first();
      if (!(await btn.count())) break;
      await btn.click({ force: true });
      await page.waitForTimeout(280);
      if (await page.locator('button:has-text("Relever ce rapport")').count()) {
        await press(page, 'Monter le piquet', 1);
      }
    }
    body = await page.locator('body').innerText();
    check('M1: the ratio is the same for every height',
      /toujours le même rapport|même rapport/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}th-m1-soleil.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 3. Signature: the three ratios stay equal ────────────────── */
  {
    const { ctx, page } = await open(browser, M.rapports, ['0', '1', '2'], { tag: 'rap' });
    let body = await page.locator('body').innerText();
    check('M3: the three ratios are DISPLAYED (the pre-kit lesson never showed them)',
      /AM \/ AB[\s\S]*AN \/ AC[\s\S]*MN \/ BC/.test(body), body.slice(0, 600));
    check('M3: reports that they coincide', /coïncident/i.test(body));

    for (let i = 0; i < 3; i += 1) {
      const btn = page.locator('button:has-text("Relever ces rapports")').first();
      if (!(await btn.count())) break;
      await btn.click({ force: true });
      await page.waitForTimeout(280);
      if (await page.locator('button:has-text("Relever ces rapports")').count()) {
        // Always slide the SAME way: going back would revisit a stamped
        // position, and a repeat reading proves nothing.
        await slide(page, 'M', 'ArrowRight', 12);
      }
    }
    body = await page.locator('body').innerText();
    check('M3: three readings collected, ratios always equal',
      /trois positions très différentes|3\/3/i.test(body), body.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}th-m3-rapports.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. Calculating, wrong on purpose (inverted cross product) ── */
  {
    const { ctx, page } = await open(browser, M.calculer, ['0', '1', '2', '3'], { tag: 'calc' });
    // Step 1's options are KaTeX-rendered, so the visible text is the
    // formula, not the plain label. The first option is the correct pair.
    const opts = page.locator('main button').filter({ hasText: /AM|AB|MN|BC/ });
    const n = await opts.count();
    check('M4: renders the ratio-pair options', n >= 4, `${n} options`);
    if (n) { await opts.first().click({ force: true }); await page.waitForTimeout(700); }
    let body = await page.locator('body').innerText();
    check('M4: explains why the other pairs are unusable',
      /trois longueurs connues|ne sait rien/i.test(body), body.slice(0, 700));

    // Step 2 unlocks only once step 1 is answered.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.count()) {
      await field.fill('36');       // inverted cross product
      await field.press('Enter');
      await page.waitForTimeout(700);
      body = await page.locator('body').innerText();
    }
    check('M4: intercepts the inverted cross product',
      /inversé|plus LONG|plus long/i.test(body), body.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}th-m4-calculer.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. The converse: ratios and parallelism move together ────── */
  {
    const { ctx, page } = await open(browser, M.parallele, ['0', '1', '2', '3', '4'], { tag: 'par' });
    let body = await page.locator('body').innerText();
    check('M5: N is free in this module', /N .n.est plus construit|déplaces toi-même/i.test(body));

    await slide(page, 'N', 'ArrowLeft', 14);
    body = await page.locator('body').innerText();
    check('M5: ratios and parallelism agree at every step',
      /rapports (coïncident|diffèrent)/i.test(body), body.slice(0, 700));
    await slide(page, 'N', 'ArrowRight', 8);
    body = await page.locator('body').innerText();
    check('M5: both situations reachable', /Situations rencontrées|équivalence/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}th-m5-parallele.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. Writing both proofs ───────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.rediger, ['0', '1', '2', '3', '4', '5'], { tag: 'red' });
    const order = [
      'Les points A, M, B sont alignés',
      'Les droites (MN) et (BC) sont parallèles',
      'D’après le théorème de Thalès',
      'Donc MN = (AM × BC) / AB',
    ];
    for (const label of order) {
      const b = page.locator(`button:has-text("${label.slice(0, 30)}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(200); }
    }
    const body = await page.locator('body').innerText();
    check('M6: accepts the direct-theorem proof',
      /Rédaction correcte/i.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}th-m6-rediger.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. Kheops, with a decimal answer ─────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.kheops, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'kh' });
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('140,6');
    await field.press('Enter');
    await page.waitForTimeout(600);
    const body = await page.locator('body').innerText();
    check('M7: accepts the decimal height (no irreducible-fraction demand)',
      /140,6/.test(body), body.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}th-m7-kheops.png`, fullPage: true });
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
      'Deux droites sécantes en un même point',
      'Non : le parallélisme est la condition',
      'AM/AB = AN/AC = MN/BC',
      'Les trois rapports, qui restent égaux',
      'AM/AB = MN/BC',
      '6',
      'C’est faux : avec un rapport de 0,25',
      'Oui : 3/12 = 0,25 et 5/20 = 0,25',
      'Les rapports diffèrent',
      '140,6 m',
    ];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(1200); }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}th-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Revisit + mobile ──────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.rapports, ['0', '1', '2', '3'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, M.rapports, ['0', '1', '2'], { tag: 'mobile', mobile: true });
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
    await page.screenshot({ path: `${SHOT_DIR}th-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
