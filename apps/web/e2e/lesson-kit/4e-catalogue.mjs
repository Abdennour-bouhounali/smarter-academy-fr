// Le CHEMIN RÉEL de l'élève : la carte est-elle visible et cliquable ?
// Aucune garde de source ne le vérifie (mémoire « lesson_visibility_gate »).
import { launch, open, check, summary, errs, settle, body } from './_2nde-helpers.mjs';
const BASE = process.env.KIT_BASE || 'http://localhost:5406';
const b = await launch();
const { ctx, page } = await open(b, `${BASE}/courses?level=college&grade=4e&chapter=all`, { tag: 'cat' });
const t = await body(page);
const ATTENDUES = [
  'Proportionnalité', 'Fonctions', 'Statistiques', 'Probabilités',
  'Théorème de Pythagore', 'Transformations',
];
for (const nom of ATTENDUES) {
  check(`catalogue 4e : « ${nom} » est listée`, t.includes(nom), '');
}
// Une carte disponible porte « Commencer » ; une carte fermée « En préparation ».
const enPrepa = (t.match(/En préparation/g) || []).length;
const commencer = (t.match(/Commencer/g) || []).length;
console.log(`   cartes « Commencer » : ${commencer} · « En préparation » : ${enPrepa}`);
check('catalogue 4e : au moins 6 cartes ouvertes', commencer >= 6, `${commencer}`);
// Le clic ouvre-t-il vraiment la leçon ?
const lien = page.locator('a[href*="pythagore-4e"], a[href*="proportionnalite-4e"]').first();
if (await lien.count()) {
  await lien.click();
  await settle(page, 1600);
  const u = page.url();
  check('catalogue 4e : le clic ouvre la leçon', /pythagore-4e|proportionnalite-4e/.test(u), u);
}
check('console : aucune erreur', errs.length === 0, errs.slice(0, 3).join(' | '));
await ctx.close(); await b.close();
process.exit(summary());
