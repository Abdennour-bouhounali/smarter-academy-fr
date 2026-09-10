/**
 * Fumée « Données & hasard » (5e) : les 18 modules des deux leçons se montent,
 * sans erreur console, avec leur titre et leurs étapes.
 *
 * Vérifie aussi la porte de progression : chaque module est atteint par URL
 * directe, ce qui exige de semer la clé de progression PORTÉE PAR UTILISATEUR
 * (u_anon_smarter_lesson_<id>) — la clé nue est ignorée.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5262';
const LESSONS = [
  { id: 'statistiques-5e', slugs: ['mission-de-depart','l-enquete-en-vrac','compter-sans-se-tromper','comparer-au-total','le-dataset-vivant','barres-ou-camembert','le-partage-equitable','ce-que-la-moyenne-cache','mission-finale-l-enquete-complete'] },
  { id: 'probabilites-5e', slugs: ['mission-de-depart','lance-avant-de-savoir','tout-ce-qui-peut-arriver','decrire-un-evenement','le-sac-truque','repeter-mille-fois','mesurer-la-chance','de-l-impossible-au-certain','mission-finale-le-pari-eclaire'] },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

// Débloquer toutes les portes : progression semée avant tout chargement.
await ctx.addInitScript(() => {
  for (const id of ['statistiques-5e', 'probabilites-5e']) {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0','1','2','3','4','5','6','7','8'], completedExercises: [], xp: 500,
    }));
  }
});

let fails = 0;
for (const lesson of LESSONS) {
  for (let i = 0; i < lesson.slugs.length; i++) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
    const url = `${BASE}/courses/college/5e/donnees_probabilites/${lesson.id}/${lesson.slugs[i]}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // Attendre le FIL D'ARIANE de la leçon : c'est lui qui prouve que la
    // bonne route a été rendue. Un h1 peut être celui de la landing page,
    // qui se rend avant que le module paresseux ne soit monté — c'est
    // exactement la panne silencieuse de [[unrouted-lessons-silent-failure]].
    const titreAttendu = new RegExp(lesson.id === 'statistiques-5e' ? 'Statistiques' : 'Probabilit', 'i');
    const arrive = await page
      .locator('nav, [aria-label*="fil"], [class*="breadcrumb"]')
      .filter({ hasText: titreAttendu })
      .first()
      .waitFor({ timeout: 20000 })
      .then(() => true)
      .catch(() => false);
    await page.waitForTimeout(250);

    const h1 = (await page.locator('h1').first().textContent().catch(() => '')) || '';
    const steps = await page.locator('[class*="rounded"]').count();
    const bad = errs.filter((e) => !/favicon|DevTools|Download the React/i.test(e));
    const ok = arrive && bad.length === 0 && steps > 5;
    console.log(`${ok ? '✅' : '❌'} M${i} ${lesson.id}/${lesson.slugs[i]} — h1="${h1.trim().slice(0, 44)}"${bad.length ? ' ERR: ' + bad.slice(0,2).join(' | ').slice(0,160) : ''}${arrive ? '' : ' [LEÇON NON RENDUE]'}`);
    if (!ok) fails++;
    await page.close();
  }
}
await browser.close();
console.log(fails === 0 ? '\n✅ 18/18 modules montés sans erreur.' : `\n❌ ${fails} module(s) en échec.`);
process.exit(fails === 0 ? 0 : 1);
