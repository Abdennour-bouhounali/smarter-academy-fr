// End-to-end smoke test for the 2nde lesson « Probabilités conditionnelles ».
// Run: node apps/web/e2e/lesson-kit/2nde-probabilites-conditionnelles.mjs   (vite on :5252, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow,
  noHScroll, smallTargets, nextEnabled, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5252';
const LESSON = `${BASE}/courses/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde`;
const KEY = 'u_anon_smarter_lesson_probabilites-conditionnelles-2nde';
const M = {
  m1: `${LESSON}/eteindre-la-population`,
  m2: `${LESSON}/la-notation-sachant-que`,
  m3: `${LESSON}/ne-jamais-retourner-la-condition`,
  m4: `${LESSON}/des-frequences-aux-probabilites`,
  m5: `${LESSON}/atelier-situations-concretes`,
  boss: `${LESSON}/mission-finale-sachant-que`,
};
// completedModules stocke des CHAÎNES non paddées (cf. mémoire e2e).
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => {
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
};
const clickRe = async (page, re) => {
  await page.locator('main button').filter({ hasText: re }).first().click({ force: true });
  await settle(page);
};
const fillOkLast = async (page, value) => {
  await page.locator('main input[type="text"]').last().fill(value);
  await page.locator('main button:has-text("OK")').last().click();
  await settle(page);
};

const browser = await launch();
const issues = [];

/* ── Index ─────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null);
  const t = await body(page);
  check('index: titre', /Probabilités conditionnelles/.test(t));
  check('index: pas de scroll horizontal', await noHScroll(page));
  await ctx.close();
}

/* ── M1 : éteindre la population (interaction SIGNATURE) ───────────── */
{
  const { ctx, page } = await o(browser, M.m1, seedThrough(0));
  await audit(page, issues);
  let t = await body(page);
  check('m1: le labo est là', /Aucune condition/.test(t));
  check('m1: quotient sans condition 450 / 800', /450 \/ 800/.test(t));

  await clickRe(page, /Sachant qu’il est interne/);
  t = await body(page);
  check('m1: la condition restreint l’univers', /150 \/ 200/.test(t));
  check('m1: étape pas encore validée (2 conditions)', !/Ta prédiction tenait|Surprise/.test(t));

  await clickRe(page, /Sachant qu’il est externe/);
  t = await body(page);
  check('m1: étape validée après 3 univers', /jette une partie/.test(t));

  await tapOption(page, 'main', 0);
  check('m1: module complet', await nextEnabled(page));
  await audit(page, issues);
  check('m1: cibles tactiles ≥ 40px', (await smallTargets(page)).length === 0, (await smallTargets(page)).join(', '));
  await ctx.close();
}

/* ── M2 : la notation ──────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m2, seedThrough(1));
  check('m2: la formule est affichée', /probabilité de B sachant A/.test(await body(page)));
  await tapOption(page, 'main', 0);            // l'indice porte la condition
  await settle(page);
  await fillOkLast(page, '50');                // P_externe(club)
  await tapOption(page, 'main', 0);            // 18,75 %
  await settle(page);
  check('m2: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M3 : l'inversion ──────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m3, seedThrough(2));
  let t = await body(page);
  check('m3: premier sens affiché', /150\s*\/\s*200|\\frac\{150\}\{200\}/.test(t) || /200 internes/.test(t));
  await clickRe(page, /Sachant qu’il est en club/);
  t = await body(page);
  check('m3: bascule vers l’autre univers (450)', /450/.test(t));
  check('m3: étape validée après les deux sens', /aucune raison d’être égaux/.test(t));
  await tapOption(page, 'main', 0);
  check('m3: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M4 : fréquences → probabilités ────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m4, seedThrough(3));
  check('m4: le pont avec les statistiques', /Fréquence conditionnelle/.test(await body(page)));
  await tapOption(page, 'main', 0);
  await settle(page);
  await fillOkLast(page, '12');                // composition
  await tapOption(page, 'main', 0);
  await settle(page);
  check('m4: module complet', await nextEnabled(page));
  await audit(page, issues);
  await ctx.close();
}

/* ── M5 : l'atelier ────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m5, seedThrough(4));
  check('m5: première situation', /natation/.test(await body(page)));
  // Une étape résolue retire son champ du DOM : il n'y a donc jamais qu'UN
  // champ visible à la fois, celui de l'étape courante. On le remplit, puis on
  // attend que le libellé de l'étape suivante apparaisse.
  const steps = [
    ['25', /Situation 2/],
    ['5', /Situation 3/],
    ['78,9', /Situation 4/],
    ['12', null],
  ];
  for (const [v, nextLabel] of steps) {
    await page.locator('main input[type="text"]').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('main input[type="text"]').first().fill(v);
    await page.locator('main button:has-text("OK")').first().click();
    await settle(page);
    if (nextLabel) await page.locator('main').filter({ hasText: nextLabel }).first().waitFor({ timeout: 15000 });
  }
  const t = await body(page);
  check('m5: l’opposition s2/s3 est signalée', /inversion du conditionnement/.test(t));
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
  await clickRe(page, /Sachant qu’il est interne/);
  check('mobile: la condition s’applique', /150 \/ 200/.test(await body(page)));
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
    check('carte: connaissances cumulées visibles', /univers restreint|sachant|inversion/i.test(await body(page)));
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
