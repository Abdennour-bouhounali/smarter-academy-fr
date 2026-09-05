// Suite Playwright — 3e « Proportionnalité » (proportionnalite-3e).
// Run: node apps/web/e2e/lesson-kit/3e-proportionnalite.mjs
// (dev server on :5220, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5220';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/proportionnalite-3e`;
const KEY = 'u_anon_smarter_lesson_proportionnalite-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/la-recette`,
  m2: `${ROOT}/le-nombre-cache`,
  m3: `${ROOT}/quatre-chemins`,
  m4: `${ROOT}/agrandir-sans-se-tromper`,
  m5: `${ROOT}/pourcentages-et-coefficient`,
  m6: `${ROOT}/le-labo-des-sciences`,
  boss: `${ROOT}/mission-finale-la-grande-tablee`,
};

const results = [];
const check = (name, cond, detail = '') => {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail && !cond ? ` — ${detail}` : ''}`);
};
const summary = () => {
  const bad = results.filter((r) => !r.ok);
  console.log(`\n== ${results.length - bad.length}/${results.length} passed ==`);
  for (const b of bad) console.log(`   FAIL ${b.name} ${b.detail}`);
  return bad.length;
};
function seedInit({ key, completedModules }) {
  if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] }));
}
const NOISE = /favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/;
const errs = [];
const watchErrors = (page, tag) => {
  page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(`[${tag}] ${m.text()}`); });
  page.on('pageerror', (e) => errs.push(`[${tag}] ${e.message}`));
};
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
    const vb = svg.viewBox?.baseVal;
    if (!vb || !vb.width) continue;
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
/** viewBox trop haut = unitY oublié. */
const aspectAudit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (vb && vb.width > 100 && vb.height / vb.width > 3) out.push(`viewBox ${vb.width}×${vb.height}`);
  }
  return out;
});
/** Aucun descendant d'un laboratoire DOM ne déborde de son cadre. */
const domOverflow = (page) => page.evaluate(() => {
  const out = [];
  for (const box of document.querySelectorAll('[aria-label^="Recette pour"], [aria-label^="Prix de départ"], [aria-label^="Rectangle de base"]')) {
    const r = box.getBoundingClientRect();
    for (const el of box.querySelectorAll('*')) {
      const e = el.getBoundingClientRect();
      if (e.width === 0) continue;
      if (e.right > r.right + 1 || e.left < r.left - 1) out.push(`déborde : ${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30)}`);
    }
  }
  return out;
});
const noHScroll = (page) => page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1);
const smallTargets = (page) => page.evaluate(() => {
  const bad = [];
  for (const b of document.querySelectorAll('main button')) {
    if (b.disabled) continue;
    const r = b.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20));
  }
  return bad;
});
const body = async (page) => (await page.textContent('body')).replace(/\s+/g, ' ');
const plus = (page, scope, label) => page.locator(`${scope} button[aria-label="Augmenter ${label}"]`).first();
const fillOk = async (page, value) => {
  await page.locator('input[type="text"]').first().fill(value);
  await page.locator('button:has-text("OK")').first().click();
  await settle(page);
};

const run = async () => {
  const browser = await chromium.launch();

  {
    const { ctx, page } = await openSeeded(browser, M.index, { tag: 'index' });
    const b = await body(page);
    check('index se charge', b.length > 200 && !b.includes('NaN'));
    check('huit modules listés', /La recette pour 7/.test(b) && /la grande tablée/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}pr-index.png`, fullPage: true });
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

  // ── M1 — la recette ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const issues = [];
    const audit = async () => { issues.push(...await layoutAudit(page), ...await domOverflow(page), ...await aspectAudit(page)); };
    check('M1 : le curseur des convives est là', (await page.locator('input[type="range"]').count()) > 0);
    // Balaye tout l'axe des convives : 1 → 12, avec audit à chaque cran.
    const minus = page.locator('#step-1 button[aria-label="Diminuer le nombre de personnes"]').first();
    await minus.click(); await page.waitForTimeout(150); await audit();
    check('M1 : à 1 personne, l’accord est au singulier', /1 personne :/.test(await body(page)) || /1 personne dans le tableau/.test(await body(page)));
    await page.locator('#step-1 button:has-text("Noter 1 personne")').click();
    const p = plus(page, '#step-1', 'le nombre de personnes');
    for (let i = 0; i < 11; i += 1) { await p.click(); await page.waitForTimeout(90); await audit(); }
    check('M1 : 12 personnes → 1 800 g', /1.800 g/.test(await body(page)));
    await page.locator('#step-1 button:has-text("Noter 12 personnes")').click();
    for (let i = 0; i < 5; i += 1) await minus.click();
    await page.locator('#step-1 button:has-text("Noter 7 personnes")').click();
    await page.waitForTimeout(200);
    check('M1 : quatre couples notés ouvrent la suite', /Quatre couples au tableau/.test(await body(page)));
    await page.locator('button:has-text("450 g : 150 g de plus")').first().click();   // erreur volontaire (additif)
    await settle(page);
    check('M1 : l’erreur additive est corrigée avec la recette à 4', /On ne rajoute pas une quantité fixe/.test(await body(page)));
    await audit();
    await fillOk(page, '2100');   // erreur volontaire : oubli du ÷ 2
    check('M1 : 2 100 est ciblé nommément', /300 g, c’est pour 2 personnes/.test(await body(page)));
    check('M1 : la colonne ÷ personnes apparaît à 7', /÷ 7 = 150/.test(await body(page)));
    await page.locator('button:has-text("La farine pour UNE personne")').first().click();
    await settle(page);
    check('M1 : le facteur ×12 est affiché entre les colonnes', /× 12/.test(await body(page)));
    await page.locator('button:has-text("Ils forment une courbe")').first().click();   // erreur volontaire
    await settle(page);
    await audit();
    check('M1 : la droite par O est révélée', /passe exactement par O/.test(await body(page)));
    await page.locator('button:has-text("Oui : plus on est nombreux, plus on cuit")').first().click();   // erreur volontaire
    await settle(page);
    check('M1 : le temps de cuisson est reconnu non proportionnel', /ne bouge pas/.test(await body(page)));
    await page.locator('button:has-text("Le nombre de personnes et la quantité de chaque ingrédient")').first().click();
    await settle(page);
    check('M1 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M1 : mise en page correcte sur tout l’axe des convives', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pr-m1.png`, fullPage: true });
    await ctx.close();
  }

  // ── M2 — le nombre caché ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0', '1'], tag: 'm2' });
    const reveal = page.locator('#step-1 button[aria-label^="Révéler le rapport"]');
    check('M2 : trois rapports à révéler', (await reveal.count()) === 3);
    for (let i = 0; i < 3; i += 1) { await page.locator('#step-1 button[aria-label^="Révéler le rapport"]').first().click(); await page.waitForTimeout(120); }
    check('M2 : le coefficient est nommé après le geste', /coefficient de proportionnalité/.test(await body(page)) && /0,065/.test(await body(page)));
    await page.locator('button:has-text("consomme 6,5 L en tout")').first().click();   // erreur volontaire
    await settle(page);
    await fillOk(page, '46,15');   // erreur volontaire : division
    check('M2 : la division inversée est ciblée', /Tu as divisé 300 par 6,5/.test(await body(page)));
    for (let i = 0; i < 3; i += 1) { await page.locator('#step-3 button[aria-label^="Révéler le rapport"]').first().click(); await page.waitForTimeout(120); }
    check('M2 : les rapports 12, 7, 4 sont visibles', /12/.test(await body(page)) && /Les rapports valent 12, 7 et 4/.test(await body(page)));
    await page.locator('button:has-text("part fixe de 10 €")').first().click();
    await settle(page);
    const rows = page.locator('#step-4 [role="group"]');
    for (let i = 0; i < await rows.count(); i += 1) { await rows.nth(i).locator('button').first().click(); await page.waitForTimeout(80); }
    await settle(page);
    check('M2 : le tri est corrigé (taille/âge non proportionnels)', /13,8/.test(await body(page)));
    check('M2 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    await page.screenshot({ path: `${SHOT_DIR}pr-m2.png`, fullPage: true });
    await ctx.close();
  }

  // ── M3 — quatre chemins ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0', '1', '2'], tag: 'm3' });
    await fillOk(page, '9,5');   // erreur volontaire (additif)
    check('M3 : 9,5 est ciblé', /1 kg coûte 2,50 €/.test(await body(page)));
    const chemins = page.locator('#step-1 button[aria-label^="Chemin :"]');
    check('M3 : trois chemins sans facteur simple (3 → 5)', (await chemins.count()) === 3);
    await chemins.nth(0).click(); await page.waitForTimeout(150);
    await page.locator('#step-1 button[aria-label^="Chemin :"]').nth(2).click(); await page.waitForTimeout(300);
    check('M3 : deux chemins concordent sur 12,5 €', /chemins, un seul résultat/.test(await body(page)) && (await page.locator('#step-1').getByText('12,5 €').count()) >= 2);
    await fillOk(page, '210');   // erreur volontaire
    check('M3 : 210 est ciblé', /confond le prix du lot/.test(await body(page)));
    await page.locator('#step-2 button[aria-label="Chemin : Passer par l’unité"]').click();
    await page.waitForTimeout(200);
    await fillOk(page, '66');
    const fac = page.locator('#step-3 button[aria-label^="Chemin : Multiplier la colonne par 3"]');
    check('M3 : le chemin du facteur ×3 est proposé', (await fac.count()) === 1);
    await fac.click(); await page.waitForTimeout(200);
    check('M3 : la flèche horizontale ×3 est dans le tableau', /× 3 ⟶/.test(await body(page)));
    const rows = page.locator('#step-4 [role="group"]');
    for (let i = 0; i < await rows.count(); i += 1) { await rows.nth(i).locator('button').nth(i === 0 ? 1 : 0).click(); await page.waitForTimeout(80); }
    await settle(page);
    check('M3 : le tableau est corrigé ligne par ligne', /100 ÷ 2 = 50/.test(await body(page)));
    await page.locator('button:has-text("Juste : 120 €")').first().click();   // erreur volontaire
    await settle(page);
    check('M3 : le produit en croix est refusé sans proportionnalité', /aucune des « quatre méthodes »/.test(await body(page)));
    check('M3 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    await page.screenshot({ path: `${SHOT_DIR}pr-m3.png`, fullPage: true });
    await ctx.close();
  }

  // ── M4 — agrandir ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], tag: 'm4' });
    const issues = [];
    await page.locator('#step-1 button:has-text("2")').first().click();   // erreur volontaire : ×2
    await settle(page);
    check('M4 : la prédiction renvoie à la manipulation', /règle k sur 2 et compte/.test(await body(page)));
    const kp = plus(page, '#step-1', "le rapport d'agrandissement k");
    check('M4 : le curseur k apparaît après la prédiction', (await kp.count()) === 1);
    // Balaye k de 0,5 à 3 avec audit à chaque cran.
    const km = page.locator('#step-1 button[aria-label="Diminuer le rapport d\'agrandissement k"]').first();
    await km.click(); await page.waitForTimeout(120); issues.push(...await layoutAudit(page), ...await domOverflow(page));
    for (let i = 0; i < 5; i += 1) { await kp.click(); await page.waitForTimeout(120); issues.push(...await layoutAudit(page), ...await domOverflow(page)); }
    check('M4 : k = 2 a été atteint et l’aire ×4 constatée', /× 4/.test(await body(page)) && /Quatre copies/.test(await body(page)));
    check('M4 : k = 3 affiche aire 72 cm² (× 9)', /72 cm²/.test(await body(page)));
    await fillOk(page, '24');   // erreur volontaire : ×k
    check('M4 : 24 est ciblé', /multiplie l’aire par k/.test(await body(page)));
    await page.locator('#step-3 [role="group"] button').nth(2).click();   // erreur volontaire ×4
    await settle(page);
    check('M4 : le volume ×8 est révélé avec la boîte', /192 cm³/.test(await body(page)));
    issues.push(...await layoutAudit(page), ...await domOverflow(page));
    await fillOk(page, '9,5');   // erreur volontaire (additif)
    check('M4 : Thalès : 12,5 cm révélé, l’erreur additive ciblée', /12,5 cm/.test(await body(page)) && /on MULTIPLIE/.test(await body(page)));
    await page.locator('button:has-text("Non : 40 ÷ 10 = 4")').first().click();
    await settle(page);
    check('M4 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M4 : mise en page correcte sur tout l’axe de k', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pr-m4.png`, fullPage: true });
    await ctx.close();
  }

  // ── M5 — pourcentages ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });
    const issues = [];
    const rate = (scope, l) => page.locator(`${scope} button[aria-label="${l}"]`).first();
    await rate('#step-1', 'Taux plus 100 pour cent').click(); await page.waitForTimeout(150); issues.push(...await domOverflow(page));
    check('M5 : +100 % reste dans le cadre (100 €)', /100 €/.test(await body(page)));
    await rate('#step-1', 'Taux plus 20 pour cent').click(); await page.waitForTimeout(150);
    check('M5 : ×1,2 s’écrit après le geste', /× 1,2/.test(await body(page)));
    await page.locator('#step-1 button:has-text("20")').last().click();   // erreur volontaire : « 20 »
    await settle(page);
    await rate('#step-2', 'Taux moins 25 pour cent').click(); await page.waitForTimeout(150);
    await fillOk(page, '55');   // erreur volontaire
    check('M5 : 55 est ciblé', /25 %, c’est un quart de 80/.test(await body(page)));
    await page.locator('button:has-text("Oui : +20 et −20 s’annulent")').first().click();   // erreur volontaire
    await settle(page);
    await rate('#step-3', 'Taux plus 20 pour cent').click(); await page.waitForTimeout(120);
    await rate('#step-3', 'Taux moins 20 pour cent').click(); await page.waitForTimeout(200);
    issues.push(...await domOverflow(page));
    check('M5 : l’aller-retour donne 48 €, × 0,96', /48 €/.test(await body(page)) && /0,96/.test(await body(page)));
    const rows = page.locator('#step-4 [role="group"]');
    for (let i = 0; i < await rows.count(); i += 1) { await rows.nth(i).locator('button').first().click(); await page.waitForTimeout(80); }
    await settle(page);
    check('M5 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M5 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pr-m5.png`, fullPage: true });
    await ctx.close();
  }

  // ── M6 — sciences ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });
    const issues = [...await layoutAudit(page), ...await aspectAudit(page)];
    await page.locator('button:has-text("315 : la distance totale")').first().click();   // erreur volontaire
    await settle(page);
    await fillOk(page, '92,5');
    check('M6 : 92,5 est ciblé', /additionne la vitesse et le temps/.test(await body(page)));
    await fillOk(page, '36450');
    check('M6 : 36 450 h est ciblé (quatre ans)', /quatre ans/.test(await body(page)));
    await fillOk(page, '195');
    issues.push(...await layoutAudit(page), ...await aspectAudit(page));
    await page.locator('button:has-text("La droite B, la plus basse")').first().click();   // erreur volontaire
    await settle(page);
    check('M6 : la pente lit le coefficient', /la droite la plus raide/.test(await body(page)));
    await fillOk(page, '175000');
    check('M6 : 175 000 cm est converti', /En km : 175 000 ÷ 100 000 = 1,75 km/.test(await body(page)));
    await page.locator('button:has-text("C’est absurde")').first().click();
    await settle(page);
    // Les lignes « Plausible / Absurde » ont deux boutons ; la grille du QCM déjà répondu en a quatre (désactivés).
    const rows = page.locator('#step-4 [role="group"]');
    const nr = await rows.count();
    for (let i = 0; i < nr; i += 1) { const b = rows.nth(i).locator('button'); if ((await b.count()) === 2) { await b.first().click(); await page.waitForTimeout(80); } }
    await settle(page);
    check('M6 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M6 : mise en page des repères correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pr-m6.png`, fullPage: true });
    await ctx.close();
  }

  // ── Boss ──
  {
    const { ctx, page } = await openSeeded(browser, M.boss, { completedModules: ['0', '1', '2', '3', '4', '5', '6'], tag: 'boss' });
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
    check('boss : la synthèse est atteignable', /Ce qui ne change pas quand tout grandit/.test(await body(page)));
    const audit = [...await layoutAudit(page), ...await domOverflow(page)];
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pr-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await body(page)));
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], tag: 'revisit' });
    check('revisite : aucune étape verrouillée', !/termine l’étape précédente/.test(await body(page)));
    await ctx.close();
  }

  // ── Mobile — M1 et M4 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    check('mobile M1 : pas de défilement horizontal', await noHScroll(page));
    const issues = [];
    const p = plus(page, '#step-1', 'le nombre de personnes');
    for (let i = 0; i < 10; i += 1) { await p.tap(); await page.waitForTimeout(90); issues.push(...await domOverflow(page)); }
    check('mobile M1 : les pistes restent dans le cadre jusqu’à 12 convives', issues.length === 0, issues.slice(0, 3).join(' | '));
    const small = await smallTargets(page);
    check('mobile M1 : cibles ≥ 40 px', small.length === 0, small.join(' | '));
    check('mobile M1 : toujours pas de défilement horizontal', await noHScroll(page));
    await page.screenshot({ path: `${SHOT_DIR}pr-m1-mobile.png`, fullPage: true });
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], mobile: true, tag: 'mobile-m4' });
    await page.locator('#step-1 button:has-text("4")').first().tap();
    await settle(page);
    const issues = [];
    const kp = plus(page, '#step-1', "le rapport d'agrandissement k");
    for (let i = 0; i < 4; i += 1) { await kp.tap(); await page.waitForTimeout(120); issues.push(...await layoutAudit(page), ...await domOverflow(page)); }
    check('mobile M4 : mise en page correcte jusqu’à k = 3', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('mobile M4 : pas de défilement horizontal', await noHScroll(page));
    const small = await smallTargets(page);
    check('mobile M4 : cibles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pr-m4-mobile.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
