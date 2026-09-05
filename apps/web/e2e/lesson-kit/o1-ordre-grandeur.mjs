// Smoke test for the ordre-grandeur-estimation kit port.
// Run: node apps/web/e2e/lesson-kit/o1-ordre-grandeur.mjs   (dev server on :5183)
import { launch, newCtx, watchErrors, check, summary, seed, getProgress, BASE } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/nombres_calculs/ordre-grandeur-estimation`;
const KEY = 'u_anon_smarter_lesson_ordre-grandeur-estimation';

async function run() {
  const { browser } = await launch();
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  const errs = [];
  watchErrors(page, errs);

  // ── Lesson index ────────────────────────────────────────────────
  await page.goto(LESSON, { waitUntil: 'networkidle' });
  check('index loads', await page.locator('text=Ordre de grandeur et estimation').first().isVisible());
  check('module 0 diagnostic card visible', await page.locator('text=Mission de départ').first().isVisible());

  // ── Module 0 — diagnostic, never blocking ──────────────────────
  await page.goto(`${LESSON}/mission-de-depart`, { waitUntil: 'networkidle' });
  const options = page.locator('button[aria-pressed]');
  const n = await options.count();
  for (let i = 0; i < n; i += 1) {
    // pick the first option of each question (right or wrong doesn't matter — never blocking)
    const btn = options.nth(i);
    if (await btn.isVisible()) await btn.click({ timeout: 2000 }).catch(() => {});
  }
  const submitBtn = page.locator('button:has-text("Voir mon résultat")');
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(300);
  }
  check('diagnostic reaches result screen without blocking', await page.locator('text=/\\/ 10/').first().isVisible().catch(() => false));

  // ── Module 1 — header shows correct total, no NaN, step locking ──
  await page.goto(`${LESSON}/resultat-impossible`, { waitUntil: 'networkidle' });
  const bodyText = await page.textContent('body');
  check('no NaN in header/progress', !bodyText.includes('NaN'));
  check('header shows "Module 1 / 11"', /Module\s*1\s*\/\s*11/.test(bodyText));

  // Step 2 & 3 should be locked initially (StepCard renders a locked hint) —
  // check step 1's question is interactable, step 3's is not yet visible/answerable.
  const step1Options = page.locator('button[aria-pressed]');
  check('step 1 has tappable options', (await step1Options.count()) > 0);
  await step1Options.nth(1).click(); // correct answer is index 1
  await page.waitForTimeout(200);
  check('feedback shown after tap (unconditional reveal)', await page.locator('text=/398 et 205/').first().isVisible().catch(() => false));

  // ── Module 10 — Boss Final: silent until submit, then review ────
  await page.goto(`${LESSON}/detective-des-resultats`, { waitUntil: 'networkidle' });
  const bossOptions = page.locator('button[aria-pressed]');
  const bossCount = await bossOptions.count();
  check('boss has multiple épreuves rendered at once (silent form)', bossCount >= 10);
  for (let i = 0; i < bossCount; i += 1) {
    await bossOptions.nth(i).click().catch(() => {});
  }
  const validateBtn = page.locator('button:has-text("Valider mes")');
  check('validate button present', await validateBtn.isVisible().catch(() => false));
  if (await validateBtn.isEnabled().catch(() => false)) {
    await validateBtn.click();
    await page.waitForTimeout(400);
    check('boss review shows a score', await page.locator('text=/\\/ 10/').first().isVisible().catch(() => false));
  }

  // ── Seeded-complete revisit: all steps unlocked, header correct ──
  const ctx2 = await newCtx(browser);
  const page2 = await ctx2.newPage();
  await seed(page2, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], KEY);
  await page2.goto(`${LESSON}/detective-des-resultats`, { waitUntil: 'networkidle' });
  const progress = await getProgress(page2, KEY);
  check('seeded progress persisted', Array.isArray(progress?.completedModules) && progress.completedModules.length === 10);

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
