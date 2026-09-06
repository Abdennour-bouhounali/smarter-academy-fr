// End-to-end smoke test for the 2nde lesson « Tests diagnostiques ».
// Run: node apps/web/e2e/lesson-kit/2nde-tests-diagnostiques.mjs   (vite on :5254, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow,
  noHScroll, smallTargets, nextEnabled, tapOption, runBoss, sweepSliders,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5254';
const LESSON = `${BASE}/courses/lycee/seconde/statistiques_probabilites/tests-diagnostiques-probabilites-2nde`;
const KEY = 'u_anon_smarter_lesson_tests-diagnostiques-probabilites-2nde';
const M = {
  m1: `${LESSON}/dix-mille-personnes`,
  m2: `${LESSON}/les-quatre-cases`,
  m3: `${LESSON}/sensibilite-et-specificite`,
  m4: `${LESSON}/le-test-est-positif-et-alors`,
  m5: `${LESSON}/atelier-affirmations`,
  boss: `${LESSON}/mission-finale-le-test`,
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
  const t = await body(page);
  check('index: titre', /Tests diagnostiques/.test(t));
  check('index: pas de scroll horizontal', await noHScroll(page));
  await ctx.close();
}

/* ── M1 : la population révélée (interaction SIGNATURE) ────────────── */
{
  const { ctx, page } = await o(browser, M.m1, seedThrough(0));
  await audit(page, issues);
  let t = await body(page);
  check('m1: avertissement « nombres fictifs »', /aucun conseil médical/.test(t));
  check('m1: étape 1 affichée', /10\s*000 personnes/.test(t));

  await clickRe(page, /2\. Qui est atteint/);
  t = await body(page);
  check('m1: le déséquilibre malades/sains est montré', /9\s*900/.test(t));
  check('m1: étape pas encore validée', !/Voilà la surprise|Tu avais vu juste/.test(t));

  await clickRe(page, /3\. Que dit le test/);
  check('m1: le tableau des 4 cases apparaît', /Faux|495/.test(await body(page)));

  await clickRe(page, /4\. Ne garder que les positifs/);
  t = await body(page);
  check('m1: le paradoxe est révélé', /(Voilà la surprise|Tu avais vu juste)/.test(t));
  check('m1: la VPP 16,7 % est affichée', /16,7/.test(t));

  await tapOption(page, 'main', 0);
  check('m1: module complet', await nextEnabled(page));
  await audit(page, issues);
  check('m1: cibles tactiles ≥ 40px', (await smallTargets(page)).length === 0, (await smallTargets(page)).join(', '));
  await ctx.close();
}

/* ── M2 : les quatre cases ─────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m2, seedThrough(1));
  check('m2: la lecture des noms', /faux positif/.test(await body(page)));
  for (let i = 0; i < 3; i += 1) { await tapOption(page, 'main', 0); await settle(page); }
  check('m2: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M3 : sensibilité / spécificité ────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m3, seedThrough(2));
  check('m3: la formule de sensibilité', /sensibilité/i.test(await body(page)));
  await fillOne(page, '99');
  await fillOne(page, '95');
  await tapOption(page, 'main', 0);
  await settle(page);
  check('m3: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M4 : les curseurs et l'inversion ──────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m4, seedThrough(3));
  check('m4: les trois curseurs sont là', (await page.locator('main input[type="range"]').count()) === 3);

  // prévalence au minimum puis au maximum : c'est la manipulation décisive
  const prev = page.locator('main input[type="range"]').first();
  await prev.focus();
  await page.keyboard.press('Home');
  await settle(page, 400);
  let t = await body(page);
  check('m4: prévalence basse → VPP très faible', /Encore à explorer|2,0 %|1,9 %|2 %/.test(t));
  await audit(page, issues);

  await page.keyboard.press('End');
  await settle(page, 400);
  t = await body(page);
  check('m4: prévalence haute → VPP élevée', /9[0-9],\d %|93/.test(t));
  check('m4: étape validée après les deux extrêmes', /n’est pas une propriété du test/.test(t));

  await fillOne(page, '16,7');
  await tapOption(page, 'main', 0);
  await settle(page);
  check('m4: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M5 : les affirmations ─────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m5, seedThrough(4));
  check('m5: première affirmation', /fiable à 99/.test(await body(page)));
  // a1 faux, a2 faux, a3 faux, a4 VRAI
  for (const idx of [1, 1, 1, 0]) { await tapOption(page, 'main', idx); await settle(page); }
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
  await clickRe(page, /2\. Qui est atteint/);
  check('mobile: la révélation fonctionne', /9\s*900/.test(await body(page)));
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
    check('carte: connaissances cumulées visibles', /sensibilité|prédictive|faux positif/i.test(await body(page)));
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
