// Smoke test for the resolution-problemes kit port.
// Run: node apps/web/e2e/lesson-kit/r1-resolution-problemes.mjs   (dev server on :5184)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const LESSON = `${BASE}/courses/college/6e/nombres_calculs/resolution-problemes`;
const KEY = 'u_anon_smarter_lesson_resolution-problemes';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

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

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
    errs.push(`console: ${t}`);
  });
  page.on('pageerror', (err) => errs.push(`pageerror: ${err.message}`));

  await page.goto(LESSON, { waitUntil: 'networkidle' });
  check('index loads', await page.locator('text=Résolution de problèmes').first().isVisible());
  check('module 0 diagnostic card visible', await page.locator('text=Mission de départ').first().isVisible());

  // Module 0 — diagnostic, never blocking
  await page.goto(`${LESSON}/mission-de-depart`, { waitUntil: 'networkidle' });
  let opts = page.locator('button[aria-pressed]');
  let n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 2000 }).catch(() => {});
  const submitBtn = page.locator('button:has-text("Voir mon résultat")');
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(300);
  }
  check('diagnostic reaches result screen without blocking', await page.locator('text=/\\/ 10/').first().isVisible().catch(() => false));

  // Module 1 — header total, no NaN, tap reveals unconditionally
  await page.goto(`${LESSON}/1`, { waitUntil: 'networkidle' });
  const bodyText = await page.textContent('body');
  check('no NaN in header/progress', !bodyText.includes('NaN'));
  check('header shows "Module 1 / 12"', /Module\s*1\s*\/\s*12/.test(bodyText));

  // Module 2 — verify a NumericQuestion + TapQuestion flow (seed module 1 complete to bypass sequential lock)
  const ctxM2 = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  const pageM2 = await ctxM2.newPage();
  await pageM2.addInitScript(([k]) => {
    localStorage.setItem(k, JSON.stringify({ completedModules: ['0', '1'], completedExercises: [] }));
  }, [KEY]);
  await pageM2.goto(`${LESSON}/2`, { waitUntil: 'networkidle' });
  check('module 2 loads with billes manipulation', await pageM2.locator('text=/18 billes/').first().isVisible().catch(() => false));

  // Module 11 — Boss Final: silent until submit, then review, then Terminer
  await page.addInitScript(([k]) => {
    localStorage.setItem(k, JSON.stringify({ completedModules: ['0','1','2','3','4','5','6','7','8','9','10'], completedExercises: [] }));
  }, [KEY]);
  await page.goto(`${LESSON}/11`, { waitUntil: 'networkidle' });
  opts = page.locator('button[aria-pressed]');
  n = await opts.count();
  check('boss has multiple épreuves rendered at once (silent form)', n >= 10);
  for (let i = 0; i < n; i += 1) await opts.nth(i).click().catch(() => {});
  const validateBtn = page.locator('button:has-text("Valider mes")');
  check('validate button present', await validateBtn.isVisible().catch(() => false));
  if (await validateBtn.isEnabled().catch(() => false)) {
    await validateBtn.click();
    await page.waitForTimeout(400);
    check('boss review shows a score', await page.locator('text=/\\/ 10/').first().isVisible().catch(() => false));
    const body2 = await page.textContent('body');
    check('Terminer button appears on last module', body2.includes('Terminer'));
  }

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
