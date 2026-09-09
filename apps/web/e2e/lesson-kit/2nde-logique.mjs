// End-to-end smoke test for the 2nde lesson « Logique et raisonnement ».
// Run: node apps/web/e2e/lesson-kit/2nde-logique.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/logique-et-raisonnement-2nde`;
const KEY = 'u_anon_smarter_lesson_logique-et-raisonnement-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/la-formule-qui-tombe`, m2: `${LESSON}/et-ou-non`,
  m3: `${LESSON}/implication-et-reciproque`, m4: `${LESSON}/equivalence`,
  m5: `${LESSON}/labsurde`, boss: `${LESSON}/mission-finale-le-tribunal`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 67 min', /formule qui tombe/i.test(b) && /Mission finale/.test(b) && /67\s*min/.test(b) && !/NaN/.test(b));
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M.diag, null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]');
  const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")');
  if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*\d+/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}

/* M1 — the conjecture */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once', (await page.locator('#step-1 button[aria-label="Tester n égale 0"]').count()) === 1);
  await tap(page, 'Oui, toujours');                                   // prediction, no verdict
  for (let i = 0; i < 6; i += 1) { await page.locator('#step-1 button[aria-label^="Tester n égale"]').first().click(); await page.waitForTimeout(120); }
  await audit(page, issues);
  let b = await body(page);
  check('M1: six primes in a row, streak shown', /d’affilée/.test(b) && /premier ✓/.test(b));
  check('M1: no counterexample yet', !/tombée/.test(b));
  await page.locator('#step-1 button[aria-label="Sauter à n égale 40"]').click(); await settle(page); await audit(page, issues);
  b = await body(page);
  check('M1: the formula falls at 40 with its factorisation', /tombée.*n = 40/s.test(b) && /41 × 41/.test(b));
  await tapOption(page, '#step-1', 1);                                // wrong on purpose
  check('M1: universal claim refuted by one case', /un seul échec réfute|1 681 = 41 × 41/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                                // wrong on purpose
  check('M1: what a proposition is', /vrai ou faux|AFFIRME/.test(await body(page)));
  await tapOption(page, '#step-3', 1);                                // wrong on purpose
  check('M1: refute vs prove distinguished', /contre-exemple sert à réfuter|raisonnement général/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe (44 rows)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}lg-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — connectors */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  const issues = [];
  await audit(page, issues);
  let b = await body(page);
  check('M2: ET filter computed', /P ET Q laisse passer 4 nombres/.test(b) && /6 · 8 · 10 · 12/.test(b));
  await page.locator('#step-1 button[aria-label="Filtre P OU Q"]').click(); await settle(page); await audit(page, issues);
  b = await body(page);
  check('M2: OU is inclusive (9 numbers pass)', /P OU Q laisse passer 9 nombres/.test(b));
  await page.locator('#step-1 button[aria-label="Filtre NON P"]').click(); await settle(page); await audit(page, issues);
  check('M2: NON P keeps the odds', /NON P laisse passer 6 nombres/.test(await body(page)));
  await tapOption(page, '#step-1', 1);                                // wrong on purpose
  check('M2: inclusive OU explained', /INCLUSIF/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                                // wrong (n < 5)
  check('M2: the boundary case explained', /5 n’est pas > 5|oublie 5|exclut à tort/.test(await body(page)));
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M2: complete', await nextEnabled(page));
  check('M2: filter grid lays out', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}lg-m2.png`, fullPage: true });
  await ctx.close();
}

/* M3 — implication */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await audit(page, issues);
  let b = await body(page);
  check('M3: direct sense holds (forbidden box empty)', /l’implication tient/.test(b));
  await page.locator('#step-1 button[aria-label^="Tester la réciproque"]').click(); await settle(page); await audit(page, issues);
  b = await body(page);
  check('M3: the converse falls on 2', /Contre-exemple : 2/.test(b) && /est fausse/.test(b));
  await tapOption(page, '#step-1', 1);                                // wrong on purpose
  check('M3: converse ≠ implication', /sa réciproque est fausse|case « P vraie, Q fausse » est vide/.test(await body(page)));
  await page.locator('#step-2 button[aria-label^="Tester la réciproque"]').click(); await settle(page); await audit(page, issues);
  check('M3: prime/odd converse falls on 9', /Contre-exemple : 9/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                                // wrong
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M3: contraposée named in the batch feedback', /contraposée/i.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: four-case grid lays out', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M4 — equivalence */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  await tap(page, 'Oui, c’est équivalent');                           // prediction
  await page.locator('#step-1 button[aria-label^="Tester la réciproque"]').click(); await settle(page);
  let b = await body(page);
  check('M4: x² = 9 ⇒ x = 3 falls on −3', /Contre-exemple : −3/.test(b));
  await tapOption(page, '#step-1', 1);                                // wrong
  check('M4: both senses needed', /besoin des deux sens|tombe sur −3/.test(await body(page)));
  await page.locator('#step-2 button[aria-label^="Tester la réciproque"]').click(); await settle(page);
  b = await body(page);
  check('M4: the repaired equivalence holds both ways', /l’implication tient/.test(b));
  await tapOption(page, '#step-2', 1);                                // wrong
  check('M4: ⇔ justified', /si et seulement si|ÉQUIVALENCE|deux sens/.test(await body(page)));
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M4: complete', await nextEnabled(page));
  await ctx.close();
}

/* M5 — absurd */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const issues = [];
  const add = page.locator('#step-1 button[aria-label="Ajouter un élève"]');
  for (let i = 0; i < 12; i += 1) { await add.click(); await page.waitForTimeout(60); }
  await settle(page); await audit(page, issues);
  let b = await body(page);
  check('M5: 12 pupils, no share yet', /Douze élèves, douze mois/.test(b));
  await add.click(); await settle(page); await audit(page, issues);
  b = await body(page);
  check('M5: the 13th forces a shared month', /Au 13e élève/.test(b));
  await tapOption(page, '#step-1', 1);                                // wrong
  check('M5: the absurd structure named', /supposé le CONTRAIRE|suppose le contraire/i.test(await body(page)));
  const place = async (t) => { await page.locator(`#step-2 button[aria-label^="Placer : ${t}"]`).click(); await page.waitForTimeout(100); };
  await place('Or la classe'); await place('Supposons le contraire'); await place('Donc deux élèves'); await place('Comme il y a 12 mois'); await place('Alors chaque mois');
  await page.locator('#step-2 button:has-text("Vérifier l’ordre")').click(); await settle(page);
  check('M5: break point named', /L’ordre casse à la ligne 1/.test(await body(page)));
  for (const t of ['Or la classe', 'Supposons le contraire', 'Donc deux élèves', 'Comme il y a 12 mois', 'Alors chaque mois']) await page.locator(`#step-2 button[aria-label^="Retirer : ${t}"]`).click().catch(() => {});
  await place('Supposons le contraire'); await place('Alors chaque mois'); await place('Comme il y a 12 mois'); await place('Or la classe'); await place('Donc deux élèves');
  await page.locator('#step-2 button:has-text("Vérifier l’ordre")').click(); await settle(page);
  check('M5: proof in order', /Démonstration en ordre/.test(await body(page)));
  await tapOption(page, '#step-3', 1);                                // wrong
  check('M5: disjunction of cases explained', /deux cas suffisent|couvrent tout/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  check('M5: month grid lays out', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}lg-m5.png`, fullPage: true });
  await ctx.close();
}

/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, null, { tag: 'boss' });
  check('boss: reachable and silent', /Épreuve 1/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes")').click(); await settle(page);
  check('boss: score', /\/ \d+/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page);
  check('boss: synthèse IS the complete knowledge map', /Ma carte des connaissances/.test(await body(page)) && (await page.locator('[data-knowledge-snapshot="complete"] [data-km-item]').count()) === 18);
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('6'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'mobile', mobile: true });
  const issues = [];
  for (let i = 0; i < 5; i += 1) { await page.locator('#step-1 button[aria-label^="Tester n égale"]').first().tap(); await page.waitForTimeout(100); }
  await page.locator('#step-1 button[aria-label="Sauter à n égale 41"]').tap(); await settle(page);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: the table stays inside at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}lg-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
