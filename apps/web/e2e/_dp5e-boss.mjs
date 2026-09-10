/**
 * Test final + Knowledge Map : le BossFinal se soumet, produit un profil et
 * une synthèse, et le tiroir « Ma carte » affiche les connaissances.
 */
import { chromium } from 'playwright';
const BASE = 'http://localhost:5262/courses/college/5e/donnees_probabilites';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(() => {
  for (const id of ['statistiques-5e', 'probabilites-5e']) {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0','1','2','3','4','5','6','7','8'], completedExercises: [], xp: 500, }));
  }
});

const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? '✅' : '❌'} ${n}${d ? ' — ' + d : ''}`); };

for (const [lesson, slug, n] of [
  ['statistiques-5e', 'mission-finale-l-enquete-complete', 10],
  ['probabilites-5e', 'mission-finale-le-pari-eclaire', 10],
]) {
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${BASE}/${lesson}/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);

  // Répondre à CHAQUE épreuve : une option (aria-pressed) par grille.
  // Le moteur n'active « Valider » qu'une fois les dix répondues, ce qui est
  // exactement ce qu'on veut vérifier.
  const grilles = page.locator('[role="group"]:has(button[aria-pressed])');
  const nbGrilles = await grilles.count();
  let repondues = 0;
  for (let i = 0; i < nbGrilles; i++) {
    const opt = grilles.nth(i).locator('button[aria-pressed]').first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ timeout: 3000 }).catch(() => {});
      repondues++;
      await page.waitForTimeout(80);
    }
  }
  check(`${lesson} : les ${n} épreuves acceptent une réponse`, repondues >= n, `${repondues}/${nbGrilles} grilles`);

  // Soumettre.
  const submit = page.getByRole('button', { name: /Valider|Terminer|Soumettre|Corriger/i }).first();
  const actif = await submit.isEnabled().catch(() => false);
  check(`${lesson} : « Valider » s’active une fois tout répondu`, actif);
  if (actif) { await submit.click({ timeout: 5000 }).catch(() => {}); await page.waitForTimeout(1500); }

  const corrige = await page.locator('text=/score|résultat|Bilan|réussi|bonnes réponses|\\/ 10/i').first().isVisible().catch(() => false);
  check(`${lesson} : la correction s’affiche après soumission`, corrige);
  check(`${lesson} : aucune erreur JS au montage/soumission`, errs.length === 0, errs.slice(0, 1).join('').slice(0, 90));
  await page.close();
}

/* Knowledge Map : le tiroir s'ouvre et contient les items de la leçon. */
for (const [lesson, slug, attendu] of [
  ['statistiques-5e', 'ce-que-la-moyenne-cache', /moyenne|fréquence|effectif/i],
  ['probabilites-5e', 'de-l-impossible-au-certain', /probabilit|issue|événement/i],
]) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${lesson}/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const trigger = page.getByRole('button', { name: /Ma carte/i }).first();
  const ouvrable = await trigger.isVisible().catch(() => false);
  if (ouvrable) { await trigger.click(); await page.waitForTimeout(700); }
  const corps = await page.locator('body').textContent();
  check(`${lesson} : la carte des connaissances s’ouvre et est peuplée`, ouvrable && attendu.test(corps));
  await page.close();
}

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(fails === 0 ? `\n✅ ${results.length}/${results.length}.` : `\n❌ ${fails} échec(s).`);
process.exit(fails === 0 ? 0 : 1);
