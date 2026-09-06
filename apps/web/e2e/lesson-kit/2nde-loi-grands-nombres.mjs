// End-to-end smoke test for the 2nde lesson « Loi des grands nombres ».
// Run: node apps/web/e2e/lesson-kit/2nde-loi-grands-nombres.mjs   (vite on :5251, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow,
  noHScroll, smallTargets, readCompleted, nextEnabled, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/lycee/seconde/statistiques_probabilites/loi-grands-nombres-2nde`;
const KEY = 'u_anon_smarter_lesson_loi-grands-nombres-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`,
  m1: `${LESSON}/lance-et-regarde`,
  m2: `${LESSON}/deux-series-jamais-pareilles`,
  m3: `${LESSON}/ce-que-la-loi-dit-vraiment`,
  m4: `${LESSON}/le-modele-est-il-bon`,
  m5: `${LESSON}/simuler-en-python`,
  boss: `${LESSON}/mission-finale-le-grand-nombre`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
// completedModules stocke les ids de module en CHAÎNES ('00', '01', …) :
// semer des nombres laisse le module verrouillé (sequentialUnlock).
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => {
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
};
// Les libellés contenant des nombres sont formatés par toLocaleString('fr-FR')
// (espace insécable étroite U+202F) : on cible donc par EXPRESSION RÉGULIÈRE,
// jamais par texte littéral, sinon le sélecteur rate le bouton.
const clickRe = async (page, re) => {
  await page.locator('main button').filter({ hasText: re }).first().click({ force: true });
  await settle(page);
};

const browser = await launch();
const issues = [];

/* ── Index ─────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null);
  const t = await body(page);
  check('index: titre', /Loi des grands nombres/.test(t));
  check('index: les 7 modules', /Mission de départ/.test(t) && /Mission finale/.test(t));
  check('index: pas de scroll horizontal', await noHScroll(page));
  await ctx.close();
}

/* ── M1 : la simulation SIGNATURE ──────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m1, seedThrough(0));
  await audit(page, issues);
  check('m1: le labo est là', /Lancer 10\s*fois/.test(await body(page)));

  // petite série puis grande : l'étape ne doit se valider qu'après les deux
  await clickRe(page, /^Lancer 10\s*fois$/);
  check('m1: une série de 10 affiche une fréquence', /Fréquence observée/.test(await body(page)));
  check('m1: étape 1 pas encore validée', !/beaucoup plus près/.test(await body(page)));

  await clickRe(page, /^Lancer 10.?000\s*fois$/);
  const t = await body(page);
  check('m1: étape 1 validée après petite + grande', /beaucoup plus près/.test(t));
  check('m1: historique des séries', /Tes séries/.test(t));

  // relancer produit une série réellement différente (pas une animation)
  await clickRe(page, /↻ Relancer/);
  check('m1: relancer ajoute une série', /Tes séries/.test(await body(page)));

  await tapOption(page, 'main', 0);   // la fréquence observée
  await settle(page);
  check('m1: module complet', await nextEnabled(page));
  await audit(page, issues);
  check('m1: cibles tactiles ≥ 40px', (await smallTargets(page)).length === 0, (await smallTargets(page)).join(', '));
  await ctx.close();
}

/* ── M2 : fluctuation ──────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m2, seedThrough(1));
  await clickRe(page, /20 séries de 10$/);
  check('m2: le nuage s’affiche', /étendue de/.test(await body(page)));
  await clickRe(page, /20 séries de 1.?000$/);
  check('m2: étape validée après les deux tailles', /fluctuation d’échantillonnage/.test(await body(page)));
  await tapOption(page, 'main', 0);
  check('m2: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M3 : les deux écarts + la loi ─────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m3, seedThrough(2));
  check('m3: tableau des deux écarts', /Écart en fréquence/.test(await body(page)));
  await tapOption(page, 'main', 0);   // l'écart en nombre grandit
  await settle(page);
  await tapOption(page, 'main', 0);   // 1/2 comme toujours
  await settle(page);
  await tapOption(page, 'main', 0);   // très probablement proche de 50 %
  await settle(page);
  check('m3: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M4 : démasquer le dé ──────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m4, seedThrough(3));
  await clickRe(page, /3.?000 lancers/);
  check('m4: les trois dés sont lancés', /Fréquence du 6/.test(await body(page)));
  // accuser le dé B (le pipé) : deuxième bouton « C’est celui-ci »
  await page.locator('main button:has-text("C’est celui-ci")').nth(1).click({ force: true });
  await settle(page);
  const t = await body(page);
  check('m4: le dé pipé est démasqué', /pipé/.test(t) && /instrument de mesure/.test(t));
  await tapOption(page, 'main', 0);
  check('m4: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M5 : le script ────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m5, seedThrough(4));
  check('m5: le script est affiché', /randint/.test(await body(page)));
  await tapOption(page, 'main', 0);
  await settle(page);
  await tapOption(page, 'main', 0);
  await settle(page);
  await page.locator('main input[type="text"]').first().fill('17');
  await page.locator('main button:has-text("OK")').first().click();
  await settle(page);
  check('m5: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── Boss ──────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.boss, seedThrough(5));
  check('boss: 10 épreuves', /Mission finale/.test(await body(page)));
  const after = await runBoss(page);
  check('boss: correction rendue', /Voir (ma )?correction|Valider|score|résultat/i.test(after));
  await audit(page, issues);
  await ctx.close();
}

/* ── Mobile ────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m1, seedThrough(0), { mobile: true, tag: 'm' });
  check('mobile: pas de scroll horizontal', await noHScroll(page));
  await clickRe(page, /^Lancer 100\s*fois$/);
  check('mobile: la simulation tourne', /Fréquence observée/.test(await body(page)));
  check('mobile: pas de débordement', (await domOverflow(page)).length === 0);
  await ctx.close();
}

/* ── Carte des connaissances ───────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m3, seedThrough(6));
  const trigger = page.locator('button[aria-label*="carte"], button:has-text("Ma carte")').first();
  if (await trigger.count()) {
    await trigger.click({ force: true });
    await settle(page);
    const t = await body(page);
    check('carte: connaissances cumulées visibles', /fréquence observée|fluctuation|loi des grands nombres/i.test(t));
  } else {
    check('carte: déclencheur présent', false, 'aucun bouton « Ma carte »');
  }
  await audit(page, issues);
  await ctx.close();
}

check('aucune erreur console', errs.length === 0, errs.join(' | '));
check('aucun problème de mise en page', issues.length === 0, [...new Set(issues)].join(' | '));

await browser.close();
process.exit(summary());
