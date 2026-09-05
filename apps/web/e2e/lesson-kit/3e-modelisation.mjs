// Suite Playwright — 3e « Modélisation » (modelisation-3e).
// Run: node apps/web/e2e/lesson-kit/3e-modelisation.mjs
// (dev server on :5221, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5221';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/modelisation-3e`;
const KEY = 'u_anon_smarter_lesson_modelisation-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/le-laboratoire-de-modelisation`,
  m2: `${ROOT}/grandeurs-et-representations`,
  m3: `${ROOT}/du-tableau-au-graphique`,
  m4: `${ROOT}/quel-modele`,
  m5: `${ROOT}/modeliser-cest-traduire`,
  m6: `${ROOT}/prevoir-interpreter-douter`,
  m7: `${ROOT}/le-grand-projet`,
  boss: `${ROOT}/mission-finale-le-bureau-detudes`,
};

const results = [];
const check = (name, cond, detail = '') => { results.push({ name, ok: !!cond, detail }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail && !cond ? ` — ${detail}` : ''}`); };
const summary = () => { const bad = results.filter((r) => !r.ok); console.log(`\n== ${results.length - bad.length}/${results.length} passed ==`); for (const b of bad) console.log(`   FAIL ${b.name} ${b.detail}`); return bad.length; };
function seedInit({ key, completedModules }) { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] })); }
const NOISE = /favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/;
const errs = [];
const watchErrors = (page, tag) => { page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(`[${tag}] ${m.text()}`); }); page.on('pageerror', (e) => errs.push(`[${tag}] ${e.message}`)); };
const settle = (page) => page.waitForTimeout(1200);
async function openSeeded(browser, url, { completedModules = [], mobile = false, tag = 'x' } = {}) {
  const ctx = await browser.newContext(mobile ? { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true } : { viewport: { width: 1280, height: 1400 } });
  const page = await ctx.newPage();
  watchErrors(page, tag);
  await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}
const layoutAudit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal; if (!vb || !vb.width) continue;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      let bb; try { bb = t.getBBox(); } catch { continue; }
      if (bb.width === 0) continue;
      if (bb.x < -0.5 || bb.y < -0.5 || bb.x + bb.width > vb.width + 0.5 || bb.y + bb.height > vb.height + 0.5) out.push(`hors cadre "${t.textContent}"`);
      boxes.push({ t: t.textContent, ...bb });
    }
    for (let i = 0; i < boxes.length; i += 1) for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i], c = boxes[j];
      if (a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height) out.push(`chevauchement "${a.t}" ↔ "${c.t}"`);
    }
  }
  return out;
});
const aspectAudit = (page) => page.evaluate(() => { const out = []; for (const svg of document.querySelectorAll('svg')) { const vb = svg.viewBox?.baseVal; if (vb && vb.width > 100 && vb.height / vb.width > 3) out.push(`viewBox ${vb.width}×${vb.height}`); } return out; });
const noHScroll = (page) => page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1);
const smallTargets = (page) => page.evaluate(() => { const bad = []; for (const b of document.querySelectorAll('main button')) { if (b.disabled) continue; const r = b.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20)); } return bad; });
const body = async (page) => (await page.textContent('body')).replace(/\s+/g, ' ');
const fillOk = async (page, value) => { await page.locator('input[type="text"]').first().fill(value); await page.locator('button:has-text("OK")').first().click(); await settle(page); };
/** Trie toutes les cartes d'un InfoSorter (touche la carte, puis l'en-tête du bac), une erreur volontaire possible. */
const USELESS_RE = /verte|Autonomie|Départ|Poids|27 juin|sono|620 élèves/;
async function sortAll(page, scope, wrongOne = null) {
  for (let guard = 0; guard < 12; guard += 1) {
    const pool = page.locator(scope).getByText('Touche une information, puis un bac').locator('..').locator('button');
    if ((await pool.count()) === 0) break;
    const card = pool.first();
    const text = (await card.textContent()).trim();
    await card.click();
    const useful = !USELESS_RE.test(text);
    const flip = !!(wrongOne && text.includes(wrongOne));
    const bin = (useful !== flip) ? 'Données utiles' : 'Informations inutiles';
    await page.locator(scope).getByText(bin, { exact: true }).click();
    await page.waitForTimeout(80);
  }
}

const run = async () => {
  const browser = await chromium.launch();
  {
    const { ctx, page } = await openSeeded(browser, M.index, { tag: 'index' });
    const b = await body(page);
    check('index se charge', b.length > 200 && !b.includes('NaN'));
    check('neuf modules listés', /Le laboratoire de modélisation/.test(b) && /bureau d’études/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}mo-index.png`, fullPage: true });
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.diag, { tag: 'diag' });
    check('diagnostic : suivant actif avant toute réponse', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    const groups = page.locator('div[role="group"]');
    for (let i = 0; i < await groups.count(); i += 1) { const o = groups.nth(i).locator('button[aria-pressed]').first(); if (await o.count()) await o.click().catch(() => {}); }
    const sub = page.locator('button:has-text("Voir mon résultat")').first();
    if (await sub.count()) await sub.click();
    await settle(page);
    check('diagnostic : un résultat s’affiche', /\/\s*10|Ton score|bases|Revoir|correction/i.test(await body(page)));
    await ctx.close();
  }

  // ── M1 — le laboratoire de modélisation ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const issues = [];
    // Étape 1 : InfoSorter formatif — une erreur volontaire (l'autonomie mise en « utile »).
    const sorterButtons = page.locator('#step-1 button');
    check('M1 : le trieur d’informations est présent', (await sorterButtons.count()) >= 7);
    await sortAll(page, '#step-1', 'Autonomie');
    const verify = page.locator('#step-1 button:has-text("Vérifier")').first();
    if (await verify.count()) await verify.click();
    await settle(page);
    check('M1 : le tri erroné est corrigé et l’étape passe', /Trois informations comptent/.test(await body(page)));
    // Étape 2 : deux grandeurs — une fausse volontairement.
    await page.locator('button[aria-label^="Grandeur : la durée"]').click();
    await page.locator('button[aria-label^="Grandeur : le poids"]').click();
    await page.locator('button:has-text("Valider mes deux grandeurs")').click();
    await settle(page);
    check('M1 : la mauvaise grandeur est corrigée', /Pas tout à fait/.test(await body(page)) && /variable/.test(await body(page)));
    // Étape 3 : tester les quatre modèles — le proportionnel d'abord (piège).
    await page.locator('button[aria-label="Tester le modèle prix = 0,15 × durée"]').click();
    await page.waitForTimeout(200);
    check('M1 : le modèle proportionnel est rejoué et refusé sur les trois tickets', /0\/3 tickets d’accord/.test(await body(page)) && /chaque prix manque 1 €/.test(await body(page)));
    await page.locator('button[aria-label="Tester le modèle prix = 0,15 × durée + 1"]').click();
    await page.waitForTimeout(200);
    check('M1 : le bon modèle est d’accord avec 3/3', /3\/3 tickets d’accord/.test(await body(page)));
    await page.locator('button:has-text("Je garde ce modèle")').click();
    await settle(page);
    check('M1 : la part fixe est nommée après le geste', /pas proportionnel à la durée/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("Les trois disent la même chose")').first().click();
    await settle(page);
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await fillOk(page, '5,25');   // erreur volontaire : sans le déblocage
    check('M1 : 5,25 est ciblé (oubli du déblocage)', /oublie le déblocage/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("Le modèle est confirmé")').first().click();
    await settle(page);
    await page.locator('button:has-text("Le modèle a une limite")').first().click();
    await settle(page);
    check('M1 : terminé, la question du plafond est ouverte', await page.locator('button:has-text("Module suivant")').first().isEnabled() && /plafonne à 8 €/.test(await body(page)));
    check('M1 : mise en page et rapport d’aspect des repères corrects', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m1.png`, fullPage: true });
    await ctx.close();
  }

  // ── M2 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0', '1'], tag: 'm2' });
    await page.locator('#step-1 [role="group"] button').nth(1).click();   // erreur volontaire : sens inversé
    await settle(page);
    check('M2 : le sens de la dépendance est corrigé avec des valeurs', /Bonne réponse/.test(await body(page)) && /pour t = 5/.test(await body(page)));
    await page.locator('#step-2 [role="group"] button').first().click(); await settle(page);
    await page.locator('#step-2 [role="group"]').last().locator('button').first().click(); await settle(page);
    let rows = page.locator('#step-3 [role="group"]');
    for (let i = 0; i < await rows.count(); i += 1) { await rows.nth(i).locator('button').first().click(); await page.waitForTimeout(80); }
    await settle(page);
    rows = page.locator('#step-4 [role="group"]');
    for (let i = 0; i < 3; i += 1) { await rows.nth(i).locator('button').nth(i === 0 ? 1 : 0).click(); await page.waitForTimeout(80); }   // une erreur volontaire
    await settle(page);
    check('M2 : la représentation est corrigée selon la question', /la question choisit la plus utile/.test(await body(page)));
    await page.locator('#step-4 [role="group"]').last().locator('button').first().click();
    await settle(page);
    check('M2 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    await page.screenshot({ path: `${SHOT_DIR}mo-m2.png`, fullPage: true });
    await ctx.close();
  }

  // ── M3 — tableau et points ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0', '1', '2'], tag: 'm3' });
    const issues = [];
    for (const x of [0, 4, 8, 12]) { await page.locator(`button[aria-label="Tester t = ${x}"]`).click(); await page.waitForTimeout(120); }
    await page.waitForTimeout(500);
    check('M3 : le tableau annonce le réservoir vide à 12 min', /vide au bout de 12 minutes/.test(await body(page)));
    // Poser les points au clavier : le curseur est un rect role=slider ? on utilise les flèches sur la zone focusable.
    const zone = page.locator('#step-2 svg [role="slider"], #step-2 svg rect[tabindex="0"]').first();
    check('M3 : un curseur déplaçable existe', (await zone.count()) > 0);
    // Poser d'abord un point FAUX (curseur en (0 ; 0)) — le curseur part de (0 ; 0), la cible est (0 ; 60).
    await page.locator('button[aria-label="Poser le point"]').click();
    await settle(page);
    check('M3 : le point mal posé est décrit avec son écart', /trop bas/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await zone.focus();
    // monter de 60 L : le pas vertical est yStep (10) → 6 flèches
    for (let i = 0; i < 6; i += 1) await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(150);
    await page.locator('button[aria-label="Poser le point"]').click();
    await page.waitForTimeout(300);
    check('M3 : le point (0 ; 60) est posé', /1 point posé sur 4/.test(await body(page)));
    // (4 ; 40), (8 ; 20), (12 ; 0) : 2 pas à droite (xStep 2), 2 pas en bas (yStep 10) — en
    // redonnant le focus au repère après chaque « Poser » (le clic l'a déplacé sur le bouton).
    for (let k = 0; k < 3; k += 1) {
      await zone.focus();
      for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowRight');
      for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      await page.locator('button[aria-label="Poser le point"]').click();
      await page.waitForTimeout(200);
    }
    await settle(page);
    check('M3 : les quatre points forment une droite', /Quatre points, une droite/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("Un modèle proportionnel : le volume")').first().click();   // erreur volontaire
    await settle(page);
    await page.locator('button:has-text("Là où la droite coupe l’axe des temps")').first().click();
    await settle(page);
    check('M3 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M3 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m3.png`, fullPage: true });
    await ctx.close();
  }

  // ── M4 — ajuster un modèle ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], tag: 'm4' });
    const issues = [];
    const fam = (scope, l) => page.locator(`${scope} button[aria-label="Famille : ${l}"]`);
    const up = (scope, p, n) => page.locator(`${scope} button[aria-label="Augmenter le paramètre ${p}"]`).click({ clickCount: 1 }).then(async () => { for (let i = 1; i < n; i += 1) await page.locator(`${scope} button[aria-label="Augmenter le paramètre ${p}"]`).click(); });
    // Forfait : en proportionnel, pousser k — jamais 0 d'écart.
    await up('#step-1', 'k', 2);
    await page.waitForTimeout(150);
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    check('M4 : en proportionnel l’écart reste non nul', /Écart total : [1-9]/.test(await body(page)));
    await fam('#step-1', 'y = a × x + b').click();
    await up('#step-1', 'a', 2);        // a : 1 → 2
    await up('#step-1', 'b', 5);        // b : 0 → 5
    await page.waitForTimeout(400);
    check('M4 : le forfait est ajusté (a = 2, b = 5)', /part fixe b = 5/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("Parce que 0 Go coûte déjà 5 €")').first().click();
    await settle(page);
    // Essence : affine → proportionnel, k 1 → 1,8 (8 pas de 0,1)
    await fam('#step-2', 'y = k × x').click();
    await up('#step-2', 'k', 8);
    await page.waitForTimeout(400);
    check('M4 : l’essence est proportionnelle, k = 1,8', /k = 1,8 € par litre/.test(await body(page)));
    // Carré : c = 1 déjà → il suffit de choisir la famille.
    await fam('#step-3', 'y = c × x²').click();
    await page.waitForTimeout(400);
    check('M4 : le carré est reconnu', /croissance est en carré/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    // Température : trois essais puis « aucun modèle simple ».
    await fam('#step-4', 'y = k × x').click();
    await up('#step-4', 'k', 2);
    await fam('#step-4', 'y = c × x²').click();
    await page.waitForTimeout(300);
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("Le modèle affine avec b = 8 convient à peu près")').first().click();   // erreur volontaire
    await settle(page);
    check('M4 : « à peu près » est refusé, « aucun modèle simple » nommé', /Bonne réponse/.test(await body(page)) && /conclusion légitime/.test(await body(page)));
    check('M4 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M4 : mise en page correcte sur tous les réglages', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m4.png`, fullPage: true });
    await ctx.close();
  }

  // ── M5 — expression par cartes ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });
    const card = (scope, c) => page.locator(`${scope} button[aria-label="Carte ${c}"]`).first();
    await card('#step-1', 't').click(); await card('#step-1', '+').click(); await card('#step-1', '1').click();   // t + 1 : erreur volontaire
    await page.locator('#step-1 button:has-text("Vérifier mon expression")').click();
    await settle(page);
    check('M5 : t + 1 est comparé à la situation sur t = 10', /ton expression donne 11/.test(await body(page)) && /donne 2,5/.test(await body(page)));
    for (let i = 0; i < 3; i += 1) await page.locator('#step-1 button[aria-label="Retirer la dernière carte"]').click();
    for (const c of ['0,15', '×', 't', '+', '1']) await card('#step-1', c).click();   // ordre inversé, équivalent
    await page.locator('#step-1 button:has-text("Vérifier mon expression")').click();
    await settle(page);
    check('M5 : l’ordre équivalent est accepté', /c’est la même fonction/.test(await body(page)));
    let rows = page.locator('#step-2 [role="group"]');
    for (let i = 0; i < await rows.count(); i += 1) { await rows.nth(i).locator('button').first().click(); await page.waitForTimeout(80); }
    await settle(page);
    for (const c of ['60', '−', '5', '×', 't']) await card('#step-3', c).click();
    await page.locator('#step-3 button:has-text("Vérifier mon expression")').click();
    await settle(page);
    await page.locator('button:has-text("Le volume restant après 8 minutes")').first().click();
    await settle(page);
    await page.locator('button:has-text("L’interprétation : 6,25 €")').first().click();
    await settle(page);
    check('M5 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    await page.screenshot({ path: `${SHOT_DIR}mo-m5.png`, fullPage: true });
    await ctx.close();
  }

  // ── M6 — limites ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });
    const issues = [];
    for (const x of [10, 30, 50, 60]) { await page.locator(`button[aria-label="Tester t = ${x}"]`).click(); await page.waitForTimeout(100); }
    await page.waitForTimeout(600);
    check('M6 : le plafond fait diverger modèle et facture', /L’application plafonne le prix/.test(await body(page)));
    await page.locator('button:has-text("L’application plafonne le prix à 8 €")').first().click();
    await settle(page);
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("11,50 €")').first().click();   // erreur volontaire : extrapolation
    await settle(page);
    check('M6 : l’extrapolation est nommée', /extrapoler/.test(await body(page)));
    await fillOk(page, '2,67');   // erreur volontaire
    check('M6 : 24 ÷ 9 est ciblé', /compare la carte à une seule séance/.test(await body(page)));
    await page.locator('button:has-text("6,25 séances")').first().click();   // erreur volontaire
    await settle(page);
    check('M6 : « dès la 7e séance » révélé', /dès la 7e séance/.test(await body(page)));
    await page.locator('button:has-text("Une valeur négative est impossible")').first().click(); await settle(page);
    await page.locator('button:has-text("cesse d’être valable")').first().click(); await settle(page);
    const rows = page.locator('#step-4 [role="group"]');
    const n = await rows.count();
    for (let i = 0; i < n; i += 1) { const b = rows.nth(i).locator('button'); if ((await b.count()) === 2) { await b.first().click(); await page.waitForTimeout(80); } }
    await settle(page);
    check('M6 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M6 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m6.png`, fullPage: true });
    await ctx.close();
  }

  // ── M7 — le grand projet ──
  {
    const { ctx, page } = await openSeeded(browser, M.m7, { completedModules: ['0', '1', '2', '3', '4', '5', '6'], tag: 'm7' });
    await sortAll(page, '#step-1');
    const verify = page.locator('#step-1 button:has-text("Vérifier")').first();
    if (await verify.count()) await verify.click();
    await settle(page);
    await page.locator('button:has-text("Salle : 246n")').first().click();   // erreur volontaire
    await settle(page);
    await page.locator('button:has-text("Le graphique des deux modèles")').first().click();
    await settle(page);
    for (const x of [20, 30, 40]) { await page.locator(`button[aria-label="Tester n = ${x}"]`).click(); await page.waitForTimeout(100); }
    await page.waitForTimeout(500);
    const issues = [...await layoutAudit(page), ...await aspectAudit(page)];
    await fillOk(page, '17,14');   // erreur volontaire
    check('M7 : 240 ÷ 14 est ciblé', /compare la location au traiteur pour une personne/.test(await body(page)));
    await page.locator('button:has-text("La salle : 510 €")').first().click();
    await settle(page);
    await page.locator('button:has-text("Elle dépend du nombre réel")').first().click();
    await settle(page);
    check('M7 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M7 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m7.png`, fullPage: true });
    await ctx.close();
  }

  // ── Boss ──
  {
    const { ctx, page } = await openSeeded(browser, M.boss, { completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], tag: 'boss' });
    check('boss : silencieux avant validation', !/Bonne réponse/.test(await body(page)));
    const groups = page.locator('div[role="group"]');
    const g = await groups.count();
    check('boss : dix épreuves', g >= 10, `${g}`);
    for (let i = 0; i < g; i += 1) { const o = groups.nth(i).locator('button').first(); if (await o.count()) await o.click().catch(() => {}); }
    const sub = page.locator('button:has-text("Valider")').first();
    if (await sub.count()) await sub.click();
    await settle(page);
    check('boss : un score apparaît', /\/\s*10|score|résultat/i.test(await body(page)));
    const prof = page.locator('button:has-text("profil"), button:has-text("Mon profil")').first();
    if (await prof.count()) { await prof.click(); await settle(page); }
    const syn = page.locator('button:has-text("synthèse"), button:has-text("Synthèse")').first();
    if (await syn.count()) { await syn.click(); await settle(page); }
    check('boss : la synthèse est atteignable', /Traduire le réel en mathématiques/.test(await body(page)));
    const audit = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await body(page)));
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], tag: 'revisit' });
    check('revisite : aucune étape verrouillée', !/termine l’étape précédente/.test(await body(page)));
    await ctx.close();
  }

  // ── Mobile — M1 et M4 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    check('mobile M1 : pas de défilement horizontal', await noHScroll(page));
    const small = await smallTargets(page);
    check('mobile M1 : cibles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m1-mobile.png`, fullPage: true });
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], mobile: true, tag: 'mobile-m4' });
    const issues = [];
    const up = page.locator('#step-1 button[aria-label="Augmenter le paramètre k"]');
    for (let i = 0; i < 6; i += 1) { if (await up.isEnabled()) await up.tap(); await page.waitForTimeout(100); issues.push(...await layoutAudit(page), ...await aspectAudit(page)); }
    await page.locator('#step-1 button[aria-label="Famille : y = a × x + b"]').tap();
    const upB = page.locator('#step-1 button[aria-label="Augmenter le paramètre b"]');
    for (let i = 0; i < 10; i += 1) { if (await upB.isEnabled()) await upB.tap(); await page.waitForTimeout(80); issues.push(...await layoutAudit(page)); }
    check('mobile M4 : mise en page correcte aux extrêmes de k et b', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('mobile M4 : pas de défilement horizontal', await noHScroll(page));
    const small = await smallTargets(page);
    check('mobile M4 : cibles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}mo-m4-mobile.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
