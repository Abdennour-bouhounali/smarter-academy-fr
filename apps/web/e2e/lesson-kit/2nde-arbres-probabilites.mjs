// End-to-end smoke test for the 2nde lesson « Arbres de probabilités ».
// Run: node apps/web/e2e/lesson-kit/2nde-arbres-probabilites.mjs   (vite on :5253, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow,
  noHScroll, smallTargets, nextEnabled, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5253';
const LESSON = `${BASE}/courses/lycee/seconde/statistiques_probabilites/arbres-probabilites-2nde`;
const KEY = 'u_anon_smarter_lesson_arbres-probabilites-2nde';
const M = {
  m1: `${LESSON}/construis-larbre`,
  m2: `${LESSON}/ce-que-pesent-les-branches`,
  m3: `${LESSON}/multiplier-le-long-dun-chemin`,
  m4: `${LESSON}/additionner-les-chemins`,
  m5: `${LESSON}/atelier-de-larbre-a-la-phrase`,
  boss: `${LESSON}/mission-finale-larbre`,
};
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => {
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
};
const clickRe = async (page, re) => {
  await page.locator('main button').filter({ hasText: re }).first().click({ force: true });
  await settle(page);
};
/** Remplit l'unique champ visible (une étape résolue retire le sien). */
const fillOne = async (page, value) => {
  await page.locator('main input[type="text"]').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('main input[type="text"]').first().fill(value);
  await page.locator('main button:has-text("OK")').first().click();
  await settle(page);
};

const browser = await launch();
const issues = [];

/* ── Index ─────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null);
  check('index: titre', /Arbres de probabilités/.test(await body(page)));
  check('index: pas de scroll horizontal', await noHScroll(page));
  await ctx.close();
}

/* ── M1 : construire l'arbre (interaction SIGNATURE) ───────────────── */
{
  const { ctx, page } = await o(browser, M.m1, seedThrough(0));
  await audit(page, issues);
  check('m1: l’arbre est vide au départ', /L’arbre est vide/.test(await body(page)));

  // l'ordre est contraint : la bille avant le sac doit être refusée
  await clickRe(page, /On tire une bille rouge/);
  check('m1: la bille avant le sac est refusée', /avant d’avoir choisi le sac/.test(await body(page)));

  // un intrus doit être refusé aussi, avec une explication
  await clickRe(page, /On repose la bille/);
  check('m1: l’intrus est refusé', /n’est pas une étape/.test(await body(page)));

  await clickRe(page, /On choisit le sac A/);
  await clickRe(page, /On choisit le sac B/);
  await clickRe(page, /On tire une bille rouge/);
  await clickRe(page, /On tire une bille bleue/);
  const t = await body(page);
  check('m1: l’arbre est complet', /L’arbre est complet/.test(t));
  check('m1: quatre chemins annoncés', /quatre chemins/.test(t));

  await tapOption(page, 'main', 0);
  check('m1: module complet', await nextEnabled(page));
  await audit(page, issues);
  check('m1: cibles tactiles ≥ 40px', (await smallTargets(page)).length === 0, (await smallTargets(page)).join(', '));
  await ctx.close();
}

/* ── M2 : les poids ────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m2, seedThrough(1));
  check('m2: l’arbre pondéré est affiché', /sac/.test(await body(page)));
  await fillOne(page, '25');
  await tapOption(page, 'main', 0);
  await settle(page);
  await tapOption(page, 'main', 0);
  await settle(page);
  check('m2: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M3 : multiplier ───────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m3, seedThrough(2));
  check('m3: le comptage sur 1 000 tirages', /1\s*000 tirages/.test(await body(page)));
  await tapOption(page, 'main', 0);      // 0,6 × 0,5
  await settle(page);
  await fillOne(page, '10');             // chemin B → rouge
  const t = await body(page);
  check('m3: la somme des chemins vaut 1', /somme fait exactement 1/.test(t));
  check('m3: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M4 : additionner ──────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m4, seedThrough(3));
  await clickRe(page, /Montrer les chemins/);
  check('m4: les deux chemins rouges sont signalés', /incompatibles/.test(await body(page)));
  await fillOne(page, '40');
  await tapOption(page, 'main', 0);
  await settle(page);
  check('m4: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M5 : l'atelier ────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m5, seedThrough(4));
  check('m5: première situation (météo)', /pleut 30/.test(await body(page)));
  for (const v of ['19', '2,8', '77,5']) await fillOne(page, v);
  check('m5: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── Boss ──────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.boss, seedThrough(5));
  check('boss: mission finale', /Mission finale/.test(await body(page)));
  const after = await runBoss(page);
  check('boss: correction rendue', /Voir (ma )?correction|Valider|score|résultat/i.test(after));
  await audit(page, issues);
  await ctx.close();
}

/* ── Mobile ────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m1, seedThrough(0), { mobile: true, tag: 'm' });
  check('mobile: pas de scroll horizontal', await noHScroll(page));
  await clickRe(page, /On choisit le sac A/);
  check('mobile: la brique se pose', /départ/.test(await body(page)));
  check('mobile: pas de débordement', (await domOverflow(page)).length === 0);
  await ctx.close();
}

/* ── Carte des connaissances ───────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m4, seedThrough(6));
  const trigger = page.locator('button[aria-label*="carte"], button:has-text("Ma carte")').first();
  if (await trigger.count()) {
    await trigger.click({ force: true });
    await settle(page);
    check('carte: connaissances cumulées visibles', /chemin|arbre|branche/i.test(await body(page)));
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
