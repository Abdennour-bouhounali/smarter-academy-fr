import { chromium } from 'playwright';
const OUT = process.argv[2];
const BASE = 'http://localhost:5262/courses/college/5e/donnees_probabilites';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  for (const id of ['statistiques-5e', 'probabilites-5e']) {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0','1','2','3','4','5','6','7','8'], completedExercises: [], xp: 500 }));
  }
});

// [leçon, slug, nom, actions avant capture]
const SHOTS = [
  ['statistiques-5e', 'le-dataset-vivant', 'dataset', async (p) => {
    await p.getByRole('button', { name: /Secteurs/ }).click(); await p.waitForTimeout(600);
  }],
  ['statistiques-5e', 'le-partage-equitable', 'partage', async (p) => {
    await p.getByRole('button', { name: /Répartir équitablement/ }).click(); await p.waitForTimeout(1100);
  }],
  ['probabilites-5e', 'repeter-mille-fois', 'simulation', async (p) => {
    for (let i = 0; i < 4; i++) { await p.getByRole('button', { name: '+ 1 000' }).first().click(); await p.waitForTimeout(200); }
    await p.waitForTimeout(500);
  }],
  ['probabilites-5e', 'de-l-impossible-au-certain', 'echelle', async () => {}],
];

for (const [lesson, slug, nom, actions] of SHOTS) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${lesson}/${slug}`, { waitUntil: 'networkidle' });
  // Attendre la leçon elle-même, pas un délai : le spinner de chargement
  // avait été capturé à sa place.
  await page.locator('h1').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(600);
  // Cadrer sur la manipulation elle-même, pas sur le bandeau.
  const lab = page.locator('[aria-label]:has(svg), [aria-label*="Jeu de données"], [aria-label*="Simulation"], [aria-label*="Partage"], [aria-label*="Échelle"]').first();
  await lab.scrollIntoViewIfNeeded().catch(() => {});
  await actions(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/lab-${nom}.png`, fullPage: false });
  console.log('📸', nom);
  await page.close();
}
await browser.close();
