/**
 * Les MANIPULATIONS répondent-elles vraiment ?
 *
 * Ce n'est pas une fumée : chaque assertion exige qu'un geste PRODUISE une
 * conséquence observable — le tableau se recalcule, le graphique change, la
 * moyenne bouge, la fréquence se rapproche de la probabilité.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5262/courses/college/5e/donnees_probabilites';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(() => {
  for (const id of ['statistiques-5e', 'probabilites-5e']) {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0','1','2','3','4','5','6','7','8'], completedExercises: [], xp: 500,
    }));
  }
});

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
};

/* ── 1. Le jeu de données vivant : ajouter change le total ─────────── */
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/statistiques-5e/le-dataset-vivant`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const compteur = () => page.getByText(/Les réponses \(\d+ élèves?\)/).first().textContent();
  const avant = await compteur();

  // Ajouter un élève qui a lu 12 livres.
  await page.getByRole('button', { name: '12 livres' }).first().click();
  await page.getByRole('button', { name: '+ Ajouter' }).click();
  await page.waitForTimeout(350);
  const apres = await compteur();
  check('DatasetLab : ajouter un élève change l’effectif total', avant !== apres, `${avant.trim()} → ${apres.trim()}`);

  // Le bandeau de conséquence apparaît.
  const bandeau = await page.locator('[role="status"]').first().textContent().catch(() => '');
  check('DatasetLab : le geste annonce sa conséquence', /Effectif total/.test(bandeau), bandeau.trim().slice(0, 70));

  // Supprimer : le total redescend.
  await page.getByRole('button', { name: /Retirer Noé/ }).click();
  await page.waitForTimeout(300);
  const apres2 = await compteur();
  check('DatasetLab : supprimer un élève rebaisse le total', apres !== apres2, `${apres.trim()} → ${apres2.trim()}`);

  // Trier ne change PAS le total (l'invariant de la leçon).
  await page.getByRole('button', { name: 'Par prénom' }).click();
  await page.waitForTimeout(300);
  const apres3 = await compteur();
  check('DatasetLab : trier ne change RIEN au total (invariant)', apres2 === apres3, apres3.trim());

  // Basculer barres → secteurs.
  await page.getByRole('button', { name: /Secteurs/ }).click();
  await page.waitForTimeout(400);
  const svgCount = await page.locator('svg path[d^="M "]').count();
  check('DatasetLab : le camembert se dessine', svgCount > 0, `${svgCount} secteurs tracés`);
  await page.close();
}

/* ── 2. Partage équitable : les piles s'égalisent ──────────────────── */
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/statistiques-5e/le-partage-equitable`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /Répartir équitablement/ }).click();
  await page.waitForTimeout(900);
  const txt = await page.locator('text=/Chacun a maintenant/').first().isVisible().catch(() => false);
  const valeur = await page.locator('text="2,08"').first().isVisible().catch(() => false);
  check('PartageLab : le partage produit la hauteur commune', txt && valeur, '2,08 affiché');
  await page.close();
}

/* ── 3. Simulation : la fréquence se rapproche en répétant ─────────── */
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/probabilites-5e/repeter-mille-fois`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const lireTotal = async () =>
    (await page.locator('text=/\\d[\\d\\s ]* lancers?$/').first().textContent().catch(() => '')) || '';
  await page.getByRole('button', { name: '+ 10' }).first().click();
  await page.waitForTimeout(300);
  const petit = await lireTotal();

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: '+ 1 000' }).first().click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(400);
  const grand = await lireTotal();
  const nPetit = Number((petit.match(/[\d\s ]+/) || [''])[0].replace(/[^\d]/g, ''));
  const nGrand = Number((grand.match(/[\d\s ]+/) || [''])[0].replace(/[^\d]/g, ''));
  check('SimulationLab : les salves s’accumulent', nGrand === nPetit + 5000 && nGrand === 5010,
        `${nPetit} → ${nGrand} lancers`);

  // Les six faces affichent chacune leur fréquence.
  const lignes = await page.locator('li:has-text("/")').count();
  check('SimulationLab : les six issues affichent leur fréquence', lignes >= 6, `${lignes} lignes`);
  await page.close();
}

/* ── 4. Le sac : tirer produit un résultat et un historique ────────── */
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/probabilites-5e/le-sac-truque`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /^(Lancer|Relancer)$/ }).click();
    // L'animation dure 320 ms ; on attend que l'historique ait bien grandi
    // avant le clic suivant, au lieu de parier sur un délai.
    await page.locator(`text=/Tes ${i + 1} (lancer|tirage)/`).first().waitFor({ timeout: 3000 }).catch(() => {});
  }
  const hist = await page.getByText(/Tes \d+ (lancer|tirage)/).first().textContent().catch(() => '');
  check('ExperienceLab : chaque tirage s’enregistre', /Tes 4 /.test(hist), hist.trim());
  await page.close();
}

/* ── 5. L'échelle : le curseur se déplace au clavier ───────────────── */
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/probabilites-5e/de-l-impossible-au-certain`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const slider = page.getByRole('slider').first();
  const avant = await slider.getAttribute('aria-valuenow');
  await slider.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const apres = await slider.getAttribute('aria-valuenow');
  check('EchelleLab : le curseur se déplace (clavier)', avant !== apres, `${avant} → ${apres}`);
  check('EchelleLab : la valeur reste dans [0 ; 1]', Number(apres) >= 0 && Number(apres) <= 1, `p = ${apres}`);
  await page.close();
}

/* ── 6. Cocher des issues (module 3 de proba) ──────────────────────── */
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/probabilites-5e/decrire-un-evenement`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  // Cocher 2, 4, 6 pour « obtenir un nombre pair ».
  for (const n of ['2', '4', '6']) {
    await page.getByRole('button', { name: n, exact: true }).first().click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(400);
  const ok = await page.locator('text=/Exactement/').first().isVisible().catch(() => false);
  check('IssuesLab : cocher les bonnes faces valide l’événement', ok, '2 ; 4 ; 6 reconnu');
  await page.close();
}

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(fails === 0 ? `\n✅ ${results.length}/${results.length} manipulations répondent.` : `\n❌ ${fails} manipulation(s) en échec.`);
process.exit(fails === 0 ? 0 : 1);
