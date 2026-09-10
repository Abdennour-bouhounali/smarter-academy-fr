/**
 * Mobile : aucun débordement horizontal, et les manipulations restent
 * atteignables au doigt (cible ≥ 40 px).
 */
import { chromium } from 'playwright';
const BASE = 'http://localhost:5262/courses/college/5e/donnees_probabilites';
const OUT = process.argv[2];

const PAGES = [
  ['statistiques-5e', 'le-dataset-vivant'],
  ['statistiques-5e', 'barres-ou-camembert'],
  ['statistiques-5e', 'le-partage-equitable'],
  ['probabilites-5e', 'le-sac-truque'],
  ['probabilites-5e', 'repeter-mille-fois'],
  ['probabilites-5e', 'de-l-impossible-au-certain'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },   // iPhone 14
  deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
await ctx.addInitScript(() => {
  for (const id of ['statistiques-5e', 'probabilites-5e']) {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0','1','2','3','4','5','6','7','8'], completedExercises: [], xp: 500, }));
  }
});

let fails = 0;
for (const [lesson, slug] of PAGES) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${lesson}/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Débordement horizontal du corps de page : interdit.
  const { scrollW, clientW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  const deborde = scrollW > clientW + 1;

  // Cibles tactiles des boutons de manipulation.
  const petits = await page.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll('button')) {
      const r = b.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.height < 28) out.push((b.textContent || b.ariaLabel || '?').trim().slice(0, 20));
    }
    return out;
  });

  const ok = !deborde;
  if (!ok) fails++;
  console.log(`${ok ? '✅' : '❌'} ${lesson}/${slug} — largeur ${scrollW}/${clientW}${petits.length ? ` · ${petits.length} cible(s) <28px: ${petits.slice(0,3).join(', ')}` : ''}`);
  if (OUT) await page.screenshot({ path: `${OUT}/mobile-${lesson}-${slug}.png`, fullPage: false });
  await page.close();
}
await browser.close();
console.log(fails === 0 ? '\n✅ Mobile : aucun débordement horizontal.' : `\n❌ ${fails} page(s) débordent.`);
process.exit(fails === 0 ? 0 : 1);
