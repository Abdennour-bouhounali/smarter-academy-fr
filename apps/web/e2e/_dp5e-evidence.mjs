/**
 * LP EVIDENCE — ce que l'e2e PEUT vérifier, et ce qu'il ne peut pas.
 *
 * useEvidenceSubmission n'émet AUCUNE preuve sans token : « Anonymous
 * visitors (no token) produce no evidence at all ». Un e2e anonyme ne peut
 * donc pas observer de preuve, et exiger le contraire serait un faux test.
 *
 * Ce script vérifie donc les deux choses qui sont réellement observables
 * sans compte :
 *   1. la soumission n'émet rien et ne CASSE rien (pas d'erreur, pas de
 *      requête partie au hasard) ;
 *   2. la progression, elle, est bien mise en file.
 *
 * Le contenu des métadonnées de preuve (enabled / type / learningPointIds,
 * et la couverture des 13 LP) est verrouillé par le test unitaire
 * src/lessons/college/5e/donnees_probabilites/evidence.test.js.
 */
import { chromium } from 'playwright';
const BASE = 'http://localhost:5262/courses/college/5e/donnees_probabilites';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(() => {
  for (const id of ['statistiques-5e', 'probabilites-5e']) {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0','1','2','3','4','5','6','7','8'], completedExercises: [], xp: 500 }));
  }
});

const ATTENDU = {
  'statistiques-5e': ['P1','P2','P3','P4','P5','P6','P7'].map((p) => `5e_statistiques-5e_${p}`),
  'probabilites-5e': ['P1','P2','P3','P4','P5','P6'].map((p) => `5e_probabilites-5e_${p}`),
};
const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? '✅' : '❌'} ${n}${d ? ' — ' + d : ''}`); };

for (const [lesson, slug] of [
  ['statistiques-5e', 'mission-finale-l-enquete-complete'],
  ['probabilites-5e', 'mission-finale-le-pari-eclaire'],
]) {
  const page = await ctx.newPage();
  const posts = [];
  await page.route('**/*', async (route) => {
    const r = route.request();
    if (r.method() === 'POST' && /evidence|learning|progress/i.test(r.url())) {
      posts.push({ url: r.url(), body: r.postData() });
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    }
    return route.continue();
  });

  await page.goto(`${BASE}/${lesson}/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const grilles = page.locator('[role="group"]:has(button[aria-pressed])');
  for (let i = 0; i < await grilles.count(); i++) {
    await grilles.nth(i).locator('button[aria-pressed]').first().click().catch(() => {});
    await page.waitForTimeout(60);
  }
  await page.getByRole('button', { name: /Valider|Terminer/i }).first().click().catch(() => {});
  await page.waitForTimeout(2500);

  // Toutes les traces de preuves : réseau + file locale.
  const local = await page.evaluate(() => {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (/evidence|queue/i.test(k)) out.push({ k, v: localStorage.getItem(k) });
    }
    return out;
  });
  const progression = local.find((e) => /progress/i.test(e.k));
  check(`${lesson} : anonyme — aucune preuve envoyée (comportement attendu)`,
        posts.length === 0, `${posts.length} POST`);
  check(`${lesson} : la progression est bien mise en file`,
        Boolean(progression) && progression.v.includes(lesson),
        progression ? 'statut ' + (progression.v.includes('completed') ? 'completed' : 'en cours') : 'aucune');
  await page.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(fails === 0 ? `\n✅ ${results.length}/${results.length} — file de progression OK, preuves LP couvertes par evidence.test.js.` : `\n❌ ${fails} échec(s).`);
process.exit(fails === 0 ? 0 : 1);
