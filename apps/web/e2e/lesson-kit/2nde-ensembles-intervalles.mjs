// End-to-end smoke test for the 2nde lesson « Ensembles et intervalles ».
// Run: node apps/web/e2e/lesson-kit/2nde-ensembles-intervalles.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, fillOk, tap, sweepSliders, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/ensembles-et-intervalles-2nde`;
const KEY = 'u_anon_smarter_lesson_ensembles-et-intervalles-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`,
  m1: `${LESSON}/le-manege`,
  m2: `${LESSON}/le-langage-des-ensembles`,
  m3: `${LESSON}/quatre-crochets`,
  m4: `${LESSON}/inegalite-ou-intervalle`,
  m5: `${LESSON}/croiser-deux-intervalles`,
  m6: `${LESSON}/situations`,
  boss: `${LESSON}/mission-finale-la-fete-foraine`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });

const browser = await launch();

/* ── Index ── */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads', b.length > 200);
  check('index: breadcrumb says Lycée', /Lycée/.test(b));
  check('index: all modules listed', /Mission de départ/.test(b) && /manège/i.test(b) && /Mission finale/.test(b));
  check('index: duration 70 min', /70\s*min/.test(b));
  check('index: no NaN', !/NaN/.test(b));
  await ctx.close();
}

/* ── Diagnostic ── */
{
  const { ctx, page } = await o(browser, M.diag, null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]');
  const n = await opts.count();
  check('diag: 5 questions with options', n >= 15, `${n}`);
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")');
  if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  const b = await body(page);
  check('diag: result shown and never blocks', /\/\s*10/.test(b) && !/verrouill/i.test(b));
  check('diag: RealLine renders in a prompt', (await page.locator('svg[aria-label^="Droite graduée de"]').count()) === 1);
  await ctx.close();
}

/* ── M1 — le manège ── */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: header and lab visible at once', /Module\s*1\s*\/\s*8/.test(await body(page)) && (await page.locator('#step-1 button[aria-label="Tester 1,9 m"]').count()) === 1);
  await tap(page, 'Elle passe');                       // wrong prediction on purpose (no verdict)
  check('M1: prediction has no verdict', !/Bonne réponse/.test(await body(page)));
  for (const v of ['1,9', '1,2', '1,899', '2,05']) {
    await page.locator(`button[aria-label="Tester ${v} m"]`).click();
    await page.waitForTimeout(200);
    issues.push(...(await layoutAudit(page)));
  }
  await page.locator('input[aria-label="Une valeur à tester"]').fill('1,3');
  await page.locator('button:has-text("Tester")').last().click(); await settle(page);
  let b = await body(page);
  check('M1: verdicts read from the filter', /1,9 m : refusé/.test(b) && /1,2 m : passe/.test(b) && /1,899 m : passe/.test(b));
  check('M1: prediction is quoted back', /Le panneau te contredit/.test(b));
  await tap(page, 'une par centimètre');                // wrong on purpose
  b = await body(page);
  check('M1: infinity is revealed with the maths', /Une infinité/.test(b) && /1,895/.test(b));
  // step 3: flip brackets
  const lo = page.locator('#step-2 button[aria-label^="Borne de gauche"]').first();
  const hi = page.locator('#step-2 button[aria-label^="Borne de droite"]').first();
  await lo.click(); await page.waitForTimeout(150); issues.push(...(await layoutAudit(page)));
  check('M1: flipping one bracket recolours the tested bound', /1,2 m : refusé/.test(await body(page)));
  await hi.click(); await settle(page);
  b = await body(page);
  check('M1: goal reached on both brackets', /deux panneaux différents/.test(b) && /1,9 m : passe/.test(b));
  await tap(page, ']1,2 ; 1,9]');                       // wrong on purpose
  b = await body(page);
  check('M1: notation corrected with bracket reading', /\[1,2 ; 1,9\[/.test(b) && /tourné vers/.test(b));
  check('M1: module complete', await nextEnabled(page));
  check('M1: layout safe across tests and flips', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}2e-m1.png`, fullPage: true });
  await ctx.close();
}

/* ── M2 — ensembles ── */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  const place = async (n, box) => {
    await page.locator(`button[aria-label="Nombre ${n}"]`).first().click();
    await page.locator(`button[aria-label="Ranger dans ${box}"]`).first().click();
    await page.waitForTimeout(150);
  };
  await place('7', 'ℕ (entiers naturels)');
  await place('−3', 'ℕ (entiers naturels)');            // wrong on purpose
  check('M2: a wrong box is explained', /n’est pas dans ℕ/.test(await body(page)));
  await place('0', 'ℕ (entiers naturels)');
  await place('2,5', 'ℝ (nombres réels)');
  await place('−1,25', 'ℝ (nombres réels)');
  await place('12', 'ℕ (entiers naturels)');
  let b = await body(page);
  check('M2: symbols revealed after sorting', /ℕ ⊂ ℤ ⊂ ℝ/.test(b) && /−3 ∉ ℕ/.test(b));
  const venn = async (n, region) => {
    await page.locator(`button[aria-label="Nombre ${n}"]`).first().click();
    await page.locator(`button[aria-label="Placer ${region}"]`).first().click();
    await page.waitForTimeout(120);
  };
  await venn('1', 'dans A et dans B'); await venn('2', 'dans A et dans B'); await venn('3', 'dans A et dans B');
  await venn('4', 'A seulement'); await venn('6', 'A seulement');     // wrong on purpose
  check('M2: Venn mistake explained', /6 divise 12 ET 18/.test(await body(page)));
  await venn('9', 'B seulement'); await venn('12', 'A seulement'); await venn('18', 'B seulement'); await venn('5', 'ni dans A ni dans B');
  b = await body(page);
  check('M2: ∩ and ∪ named after the gesture', /A ∩ B = \{1 ; 2 ; 3 ; 6\}/.test(b));
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M2: batch reveals ∅', /ensemble vide/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  await ctx.close();
}

/* ── M3 — quatre crochets ── */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await tap(page, ']−2 ; 3[');                          // wrong on purpose
  check('M3: reading corrected', /intervalle fermé/i.test(await body(page)));
  // step 2: build ]−2 ; 3] — first validate wrong on purpose, then right
  await page.locator('#step-2 button:has-text("Valider ma construction")').click(); await settle(page);
  check('M3: a wrong build is described, not blocked', /Pas encore/.test(await body(page)));
  const n = await sweepSliders(page, issues);
  check('M3: two handles present', n >= 2, `${n}`);
  // set from = −2 (exclue), to = 3 (incluse) via steppers
  const sl = page.locator('#step-2 [role="slider"]');
  await sl.nth(0).focus(); await page.keyboard.press('Home'); for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowRight');
  await sl.nth(1).focus(); await page.keyboard.press('End'); for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowLeft');
  await page.locator('#step-2 button[aria-label^="Borne de gauche"]').click();
  await page.locator('#step-2 button:has-text("Valider ma construction")').click(); await settle(page);
  let b = await body(page);
  check('M3: ]−2 ; 3] accepted', /Construction juste : \]−2 ; 3\]/.test(b), b.slice(0, 300));
  // step 3: half-line via +∞ chip
  await page.locator('#step-3 button[aria-label="Étendre vers +∞"]').click();
  const s3 = page.locator('#step-3 [role="slider"]');
  await s3.nth(0).focus(); await page.keyboard.press('Home'); for (let i = 0; i < 8; i += 1) await page.keyboard.press('ArrowRight');
  issues.push(...(await layoutAudit(page)));
  await page.locator('#step-3 button:has-text("Valider ma construction")').click(); await settle(page);
  b = await body(page);
  check('M3: [3 ; +∞[ accepted', /Construction juste : \[3 ; \+∞\[/.test(b), b.slice(0, 300));
  await tap(page, 'les grands nombres ne comptent pas');   // wrong on purpose
  check('M3: infinity explained', /n’est pas un nombre/.test(await body(page)));
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe on slider sweeps', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}2e-m3.png`, fullPage: true });
  await ctx.close();
}

/* ── M4 — inégalité ↔ intervalle ── */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  // step 1: exhaust attempts → reveal → completes (escape hatch)
  await page.locator('#step-1 button:has-text("Valider ma construction")').click(); await settle(page);
  await page.locator('#step-1 button:has-text("montre-moi")').click(); await settle(page);
  let b = await body(page);
  check('M4: reveal completes with the answer', /Il fallait : \]−1 ; 4\]/.test(b));
  // step 2: composer — both signs strict by default → wrong once, then fix left to ≤
  await page.locator('#step-2 button:has-text("Valider mes signes")').click(); await settle(page);
  check('M4: composer wrong attempt described', /Pas encore : tu as construit −3 < x < 2/.test(await body(page)));
  await page.locator('#step-2 button[aria-label^="Signe de gauche"]').click();
  await page.locator('#step-2 button:has-text("Valider mes signes")').click(); await settle(page);
  check('M4: −3 ≤ x < 2 accepted', /Construction juste : −3 ≤ x < 2/.test(await body(page)));
  await tap(page, '[3 ; +∞[');                              // the direction trap, wrong on purpose
  b = await body(page);
  check('M4: direction trap corrected with the drawn half-line', /vers la GAUCHE/.test(b) && (await page.locator('svg[aria-label^="Demi-droite"]').count()) === 1);
  // step 4: decimals — build [2,5 ; 4[
  const s4 = page.locator('#step-4 [role="slider"]');
  await s4.nth(0).focus(); await page.keyboard.press('Home'); for (let i = 0; i < 5; i += 1) await page.keyboard.press('ArrowRight');
  await s4.nth(1).focus(); await page.keyboard.press('End'); for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowLeft');
  await page.locator('#step-4 button[aria-label^="Borne de droite"]').click();
  await page.locator('#step-4 button:has-text("Valider ma construction")').click(); await settle(page);
  b = await body(page);
  check('M4: [2,5 ; 4[ accepted', /Construction juste : \[2,5 ; 4\[/.test(b), b.slice(0, 400));
  const rows = page.locator('#step-5 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M4: complete', await nextEnabled(page));
  await ctx.close();
}

/* ── M5 — croiser ── */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  // step 1: build ]2 ; 4]  (the module opens straight on the intersection —
  // the old « À retenir » card is now the cumulative Knowledge Map footer)
  const s2 = page.locator('#step-1 [role="slider"]');
  await s2.nth(0).focus(); await page.keyboard.press('Home'); for (let i = 0; i < 5; i += 1) await page.keyboard.press('ArrowRight');
  await s2.nth(1).focus(); await page.keyboard.press('End'); for (let i = 0; i < 5; i += 1) await page.keyboard.press('ArrowLeft');
  await page.locator('#step-1 button[aria-label^="Borne de gauche"]').click();
  await page.locator('#step-1 button:has-text("Valider ma construction")').click(); await settle(page);
  check('M5: intersection ]2 ; 4] accepted', /Construction juste : \]2 ; 4\]/.test(await body(page)));
  // step 2: union — wrong twice → reveal
  await page.locator('#step-2 button:has-text("Valider ma construction")').click(); await settle(page);
  await page.locator('#step-2 button:has-text("Valider ma construction")').click(); await settle(page);
  check('M5: union revealed after the cap', /Il fallait : \[−1 ; 7\[/.test(await body(page)));
  await tap(page, '[−5 ; 3]');                            // wrong on purpose
  check('M5: empty intersection explained', /A ∩ B = ∅/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  const lay = await layoutAudit(page);
  check('M5: two-band lines lay out cleanly', lay.length === 0, lay.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}2e-m5.png`, fullPage: true });
  await ctx.close();
}

/* ── M6 — situations ── */
{
  const { ctx, page } = await o(browser, M.m6, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  const s1 = page.locator('#step-1 [role="slider"]');
  await s1.nth(0).focus(); await page.keyboard.press('Home'); for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowRight');
  await s1.nth(1).focus(); await page.keyboard.press('End'); for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowLeft');
  await page.locator('#step-1 button[aria-label^="Borne de gauche"]').click();
  await page.locator('#step-1 button[aria-label^="Borne de droite"]').click();
  await page.locator('#step-1 button:has-text("Valider ma construction")').click(); await settle(page);
  check('M6: both rides = ]1,4 ; 1,9[', /Construction juste : \]1,4 ; 1,9\[/.test(await body(page)));
  await fillOk(page, '6', '#step-2');                     // wrong on purpose (forgot a bound)
  check('M6: 6 is targeted', /oublié une borne/.test(await body(page)));
  await tap(page, 'presque 8', '#step-2');                // wrong on purpose
  check('M6: 8,5 out of range explained', /8,5 > 8/.test(await body(page)));
  await tap(page, ']−∞ ; 5]', '#step-3');                 // wrong on purpose
  check('M6: x ≥ 0 recalled', /pas de gigaoctets négatifs/.test(await body(page)));
  await fillOk(page, '6', '#step-4');                     // wrong on purpose (3 included)
  check('M6: 3 exclu targeted', /3 est EXCLU/.test(await body(page)));
  check('M6: complete', await nextEnabled(page));
  await ctx.close();
}

/* ── Boss: silent → submit → profil → synthèse → reload shows review ── */
{
  const { ctx, page } = await o(browser, M.boss, null, { tag: 'boss' });
  let b = await body(page);
  check('boss: reachable without progress', /Épreuve 1/.test(b));
  check('boss: silent before submit', !/Bonne réponse/.test(b));
  await runBoss(page);
  const submit = page.locator('button:has-text("Valider mes 10 réponses")');
  check('boss: submit enabled once all answered', await submit.isEnabled());
  await submit.click(); await settle(page);
  b = await body(page);
  check('boss: review shows score', /Résultat du défi/.test(b) && /\/ 10/.test(b));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  b = await body(page);
  check('boss: profile lists skills', /profil de maîtrise/i.test(b) && /Croiser|Intersection et réunion/.test(b));
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page);
  b = await body(page);
  check('boss: synthèse IS the complete knowledge map', /Ma carte des connaissances/.test(b) && (await page.locator('[data-knowledge-snapshot="complete"] [data-km-item]').count()) === 23);
  check('boss: Terminer available', (await page.locator('a:has-text("Terminer")').count()) === 1);
  const completed = await readCompleted(page, KEY);
  check('boss: module 7 completed in storage', Array.isArray(completed) && completed.includes('7'), JSON.stringify(completed));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores the review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* ── Mobile pass: M1 at 375 px ── */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'mobile', mobile: true });
  const issues = [];
  await page.locator('button[aria-pressed]').filter({ hasText: 'Elle est refusée' }).first().tap();
  for (const v of ['1,9', '1,2', '1,899', '2,05', '1,5', '1,89']) {
    await page.locator(`button[aria-label="Tester ${v} m"]`).tap();
    await page.waitForTimeout(150);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: tap targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: six labelled test points lay out without collision', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}2e-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
