/**
 * Porte de visibilité : les deux leçons sont-elles réellement ouvertes dans
 * le catalogue ? (memory « lesson_visibility_gate » : codée + routée + validée
 * ne suffit pas — c'est `status: 'available'` qui ouvre la carte.)
 *
 * Le catalogue montre TOUS les niveaux, et « Statistiques » existe aussi en
 * 3e : on cible donc par le LIEN vers la leçon de 5e, jamais par son titre.
 */
import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
// Le catalogue s'ouvre sur tous les niveaux : on entre dans la 5e par l'URL
// que la page elle-même utilise, sinon les cartes de 5e ne sont pas rendues.
await page.goto('http://localhost:5262/courses?level=college&grade=5e&chapter=all', { waitUntil: 'domcontentloaded' });
// Attendre que les cartes de 5e soient rendues : `domcontentloaded` revient
// avant que le catalogue n'ait construit sa liste.
await page.locator('a[href*="/courses/college/5e/"]').first()
  .waitFor({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(500);

const results = [];
for (const [nom, href] of [
  ['Statistiques 5e', '/courses/college/5e/donnees_probabilites/statistiques-5e'],
  ['Probabilités 5e', '/courses/college/5e/donnees_probabilites/probabilites-5e'],
]) {
  const lien = page.locator(`a[href="${href}"]`).first();
  const present = await lien.count() > 0;
  // Une carte verrouillée porte « Bientôt » DANS la carte elle-même.
  const carte = present ? lien.locator('xpath=ancestor-or-self::*[self::a or self::article or self::div][1]') : null;
  const texte = present ? await carte.textContent().catch(() => '') : '';
  const verrouillee = /Bientôt/i.test(texte);
  const ok = present && !verrouillee;
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} ${nom} — carte ${present ? 'présente' : 'ABSENTE'}${verrouillee ? ', mais « Bientôt »' : ' et ouverte'}`);
}

// Le clic mène-t-il à la bonne leçon ?
const lien = page.locator('a[href="/courses/college/5e/donnees_probabilites/statistiques-5e"]').first();
if (await lien.count() > 0) {
  await lien.click();
  await page.waitForTimeout(1500);
  const ok = /5e\/donnees_probabilites\/statistiques-5e/.test(page.url());
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} le clic ouvre la leçon de 5e — ${page.url().split('/').slice(3).join('/')}`);
}

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(fails === 0 ? '\n✅ Les deux leçons sont visibles et ouvertes dans le catalogue.' : `\n❌ ${fails} échec(s).`);
process.exit(fails === 0 ? 0 : 1);
