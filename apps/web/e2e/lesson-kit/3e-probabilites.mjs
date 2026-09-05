// Suite Playwright — 3e « Probabilités » (probabilites-3e).
// Run: node apps/web/e2e/lesson-kit/3e-probabilites.mjs
// (dev server on :5219, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5219';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/probabilites-3e`;
const KEY = 'u_anon_smarter_lesson_probabilites-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/le-laboratoire-du-de`,
  m2: `${ROOT}/issues-et-evenements`,
  m3: `${ROOT}/le-sac-de-billes`,
  m4: `${ROOT}/deux-des`,
  m5: `${ROOT}/le-langage-des-probabilites`,
  m6: `${ROOT}/le-labo-des-situations`,
  boss: `${ROOT}/mission-finale-le-tournoi`,
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
  // Graine fixée : la suite rejoue toujours les mêmes lancers (probaUtils.sessionSeed).
  window.__SMARTER_RNG_SEED = 42;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] }));
  }
}

const NOISE = /favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/;
const errs = [];
const watchErrors = (page, tag) => {
  page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(`[${tag}] ${m.text()}`); });
  page.on('pageerror', (e) => errs.push(`[${tag}] ${e.message}`));
};
const settle = (page) => page.waitForTimeout(1200);

async function openSeeded(browser, url, { completedModules = [], mobile = false, tag = 'x' } = {}) {
  const ctx = await browser.newContext(
    mobile ? { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true }
           : { viewport: { width: 1280, height: 1400 } }
  );
  const page = await ctx.newPage();
  watchErrors(page, tag);
  await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

/** Aucun <text> hors de son viewBox, aucun chevauchement d'étiquettes. */
const layoutAudit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (!vb || !vb.width) continue;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      let bb; try { bb = t.getBBox(); } catch { continue; }
      if (bb.width === 0) continue;
      if (bb.x < -0.5 || bb.y < -0.5 || bb.x + bb.width > vb.width + 0.5 || bb.y + bb.height > vb.height + 0.5)
        out.push(`hors cadre "${t.textContent}"`);
      boxes.push({ t: t.textContent, ...bb });
    }
    for (let i = 0; i < boxes.length; i += 1)
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i], c = boxes[j];
        if (a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height)
          out.push(`chevauchement "${a.t}" ↔ "${c.t}"`);
      }
  }
  return out;
});
/** Aucun descendant d'un laboratoire (pistes DOM) ne déborde de son cadre. */
const domOverflow = (page) => page.evaluate(() => {
  const out = [];
  for (const box of document.querySelectorAll('[aria-label^="Laboratoire du dé"], [aria-label^="Deux dés"], [aria-label^="Composer un événement"]')) {
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

const run = async () => {
  const browser = await chromium.launch();

  // ── 1. Index ──
  {
    const { ctx, page } = await openSeeded(browser, M.index, { tag: 'index' });
    const b = await body(page);
    check('index se charge', b.length > 200);
    check('index sans NaN', !b.includes('NaN'));
    check('carte du module 0 présente', /Mission de départ/.test(b));
    check('huit modules listés', /Le laboratoire du dé/.test(b) && /le tournoi/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}pb-index.png`, fullPage: true });
    await ctx.close();
  }

  // ── 2. Diagnostic non bloquant ──
  {
    const { ctx, page } = await openSeeded(browser, M.diag, { tag: 'diag' });
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    check('diagnostic : bouton suivant actif avant toute réponse', (await nextBtn.count()) > 0 && (await nextBtn.isEnabled()));
    const groups = page.locator('div[role="group"]');
    const n = await groups.count();
    for (let i = 0; i < n; i += 1) {
      const o = groups.nth(i).locator('button[aria-pressed]').first();
      if (await o.count()) await o.click().catch(() => {});
      await page.waitForTimeout(100);
    }
    const sub = page.locator('button:has-text("Voir mon résultat")').first();
    if (await sub.count()) await sub.click().catch(() => {});
    await settle(page);
    check('diagnostic : un résultat s’affiche', /\/\s*10|Ton score|bases|Revoir|correction/i.test(await body(page)));
    await ctx.close();
  }

  // ── 3. M1 — le laboratoire du dé ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const issues = [];
    const audit = async () => { issues.push(...await layoutAudit(page), ...await domOverflow(page)); };

    const predict = page.locator('button[aria-label^="Prédire la face"]');
    check('M1 : six faces à prédire ouvrent le module', (await predict.count()) === 6);
    check('M1 : pas de bouton Lancer avant la prédiction', (await page.locator('button[aria-label="Lancer le dé"]').count()) === 0);
    await predict.nth(5).click();
    await page.waitForTimeout(120);
    const lancer = page.locator('button[aria-label="Lancer le dé"]').first();
    check('M1 : Lancer apparaît après la prédiction', (await lancer.count()) > 0);
    await lancer.click();
    await page.waitForTimeout(150);
    check('M1 : le résultat n’est pas révélé pendant le roulement', /🎲 …/.test(await body(page)));
    await page.waitForTimeout(800);
    check('M1 : la bande des derniers résultats apparaît', (await page.locator('[aria-label^="Derniers résultats"]').count()) > 0);
    for (let i = 0; i < 2; i += 1) { await lancer.click(); await page.waitForTimeout(950); await audit(); }
    check('M1 : après trois lancers, issues et expérience aléatoire sont nommées', /expérience aléatoire/.test(await body(page)) && /issues/.test(await body(page)));

    await page.locator('button[aria-label="Lancer 10 fois"]').first().click();
    await page.waitForTimeout(1100);
    await audit();
    await page.locator('button:has-text("rattraper son retard")').first().click();   // erreur volontaire
    await settle(page);
    check('M1 : « rattrapage » corrigé, effectif nommé', /Bonne réponse/.test(await body(page)) && /effectif/.test(await body(page)));

    await page.locator('button[aria-label="Nouvelle série de 100 lancers"]').first().click();
    await page.waitForTimeout(1100);
    await audit();
    const m3 = (await body(page)).match(/la face ([1-6]) est sortie (\d+) fois/);
    check('M1 : la question de fréquence cite la face en tête', !!m3);
    await page.locator('input[type="text"]').first().fill('6');   // erreur volontaire
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    check('M1 : fréquence erronée corrigée nommément', /nombre de faces/.test(await body(page)));

    await page.locator('button[aria-label^="Parier sur la face"]').nth(2).click();
    await page.waitForTimeout(120);
    for (let i = 0; i < 3; i += 1) {
      await page.getByRole('button', { name: /Nouvelle série de 1.000 lancers/ }).first().click();
      await page.waitForTimeout(1100);
      await audit();
    }
    check('M1 : trois séries journalisées', /Série 3 : face/.test(await body(page)));
    await page.locator('button:has-text("Aucune face ne domine")').first().click();
    await settle(page);

    check('M1 : trois instantanés comparés', (await page.locator('[aria-label="Comparaison de trois séries de lancers"] svg').count()) === 3);
    await audit();
    await page.locator('button:has-text("deviennent exactement égales")').first().click();  // erreur volontaire
    await settle(page);
    check('M1 : « exactement égales » corrigé avec les écarts', /stabilisent/.test(await body(page)) && /points/.test(await body(page)));

    // Étape 6 — la mémoire du dé : prédiction SANS verdict, puis l'expérience répond.
    const exp0 = page.getByRole('button', { name: /Faire l.expérience/ });
    check('M1 : l’expérience n’existe pas avant la prédiction', (await exp0.count()) === 0);
    await page.locator('button:has-text("PLUS probable")').first().click();   // prédiction fausse, volontairement
    await page.waitForTimeout(150);
    check('M1 : la prédiction n’a pas de verdict textuel', !/Bonne réponse : Rien ne change/.test(await body(page)));
    const exp = page.getByRole('button', { name: /Faire l.expérience/ }).first();
    check('M1 : le bouton d’expérience apparaît après la prédiction', (await exp.count()) > 0);
    await exp.click();
    await page.waitForTimeout(1200);
    await audit();
    const streakQ = (await body(page)).match(/Il a fallu ([\d ]+) lancers pour obtenir 300 fois trois 6/);
    check('M1 : l’expérience cite le nombre de lancers nécessaires', !!streakQ);
    await page.locator('button:has-text("le dé n’a pas de mémoire")').first().click();
    await settle(page);
    check('M1 : la correction confronte la prédiction de l’élève', /L’expérience te contredit/.test(await body(page)));

    check('M1 : aucun repère théorique avant l’étape 7', !/probabilité du modèle/.test(await body(page)));
    await page.locator('#step-7 [role="group"] button').first().click();
    await settle(page);
    check('M1 : 1/6 se révèle sur la série de 1 000', /probabilité du modèle, dé équilibré/.test(await body(page)) && /P\(6\) = 1\/6/.test(await body(page)));
    await audit();
    await page.locator('button:has-text("La fréquence vient de l’expérience")').first().click();
    await settle(page);

    await page.locator('#step-9 button[aria-label="Alourdir la face 6"]').click();
    await page.waitForTimeout(120);
    await page.locator('#step-9').getByRole('button', { name: /Nouvelle série de 1.000 lancers/ }).first().click();
    await page.waitForTimeout(1100);
    await audit();
    check('M1 : dé truqué annoncé avec ses repères', /dé truqué \(face 6\)/.test(await body(page)) && /3\/8 = 37,5 %/.test(await body(page)));
    await page.locator('button:has-text("Non : 1/6 suppose")').first().click();
    await settle(page);
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    check('M1 : le module se termine', (await nextBtn.count()) > 0 && (await nextBtn.isEnabled()));
    const k1000 = page.getByRole('button', { name: /Lancer 1.000 fois/ }).first();
    for (let i = 0; i < 5; i += 1) { await k1000.click(); await page.waitForTimeout(1000); await audit(); }
    check('M1 : 6 000 lancers restent lisibles', /6.000 lancers/.test(await body(page)));
    check('M1 : la bande garde au plus 12 résultats', (await page.locator('[aria-label^="Derniers résultats"]').last().locator('svg').count()) <= 12);
    check('M1 : mise en page correcte à chaque état', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m1.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M2 — issues et événements ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0', '1'], tag: 'm2' });
    const issues = [];
    const face = (n) => page.locator(`#step-1 button[aria-label^="Retenir la face ${n}"]`);
    await face(2).click(); await face(3).click();          // erreur volontaire : 3 au lieu de 4 et 6
    await page.locator('button:has-text("Vérifier mon événement")').first().click();
    await settle(page);
    check('M2 : l’écart est nommé (faces manquantes / en trop)', /Il manque/.test(await body(page)) && /ne réalise pas/.test(await body(page)));
    await face(3).click(); await face(4).click(); await face(6).click();
    await page.locator('button:has-text("Vérifier mon événement")').first().click();
    await settle(page);
    check('M2 : l’événement « pair » est validé et nommé', /ensemble d’issues/.test(await body(page)));
    const f2 = (n) => page.locator(`#step-2 button[aria-label^="Retenir la face ${n}"]`);
    await f2(4).click(); await f2(5).click(); await f2(6).click();   // erreur : inclut le 4
    const v2 = page.locator('#step-2 button:has-text("Vérifier mon événement")').first();
    await v2.click(); await settle(page);
    await f2(4).click(); await v2.click(); await settle(page);
    issues.push(...await layoutAudit(page));
    check('M2 : la fréquence sur 1 000 lancers apparaît après la composition', /1.000 lancers/.test(await body(page)));
    await page.locator('button:has-text("Environ 500 fois")').first().click();   // erreur volontaire
    await settle(page);
    check('M2 : la prédiction erronée cite l’effectif observé', /est arrivé \d+ fois/.test(await body(page)) && /Bonne réponse/.test(await body(page)));
    const rows = page.locator('#step-3 [role="group"]');
    const nr = await rows.count();
    for (let i = 0; i < nr; i += 1) { await rows.nth(i).locator('button').nth(i === 1 ? 2 : 0).click(); await page.waitForTimeout(80); }
    await settle(page);
    check('M2 : tri impossible/certain corrigé', /Bonne|sur 4|Quatre/.test(await body(page)));
    await page.locator('#step-4 button:has-text("Obtenir un nombre pair")').first().click();
    await settle(page);
    await page.locator('button:has-text("beaucoup de chances")').first().click();
    await settle(page);
    check('M2 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M2 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m2.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M3 — le sac de billes ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0', '1', '2'], tag: 'm3' });
    const issues = [];
    check('M3 : l’objectif n’est pas atteint au départ', /Pour l’instant : 1\/3/.test(await body(page)));
    await page.locator('#step-1 button[aria-label="Ajouter une bille bleue"]').click();
    await page.waitForTimeout(300);
    check('M3 : le sac 1/4 complète sur l’objectif réel, la fraction apparaît', /P\(rouge\)/.test(await body(page)) && /nombre de billes favorables/.test(await body(page)));
    issues.push(...await layoutAudit(page));
    await page.locator('button:has-text("double")').first().click();   // erreur volontaire (option « double »)
    await settle(page);
    await page.locator('button[aria-label="Doubler le sac"]').click();
    await page.waitForTimeout(300);
    check('M3 : le sac doublé garde 1/4', /les deux fractions sont égales/.test(await body(page)));
    await page.locator('input[type="text"]').first().fill('25');   // erreur volontaire (le pourcentage)
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    check('M3 : attendu 50 révélé', /Bonne réponse/.test(await body(page)) && /50/.test(await body(page)));
    await page.locator('button[aria-label="Tirer 200 fois"]').click();
    await page.waitForTimeout(300);
    check('M3 : observé vs attendu', /Observé/.test(await body(page)) && /attendu/.test(await body(page)));
    // Étape 4 : deux contraintes — 6 bleues, 2 vertes, 4 rouges.
    const s4 = (l) => page.locator(`#step-4 button[aria-label="${l}"]`);
    for (let i = 0; i < 3; i += 1) await s4('Ajouter une bille bleue').click();
    await s4('Retirer une bille verte').click();
    await s4('Ajouter une bille rouge').click();
    await page.waitForTimeout(300);
    check('M3 : deux contraintes atteintes', /1 − 1\/2 − 1\/6 = 1\/3/.test(await body(page)));
    issues.push(...await layoutAudit(page));
    await page.locator('#step-5 [role="group"] button').nth(1).click();  // erreur volontaire 2/8
    await settle(page);
    check('M3 : correction 1/5 avec le total', /Bonne réponse/.test(await body(page)) && /nombre TOTAL/.test(await body(page)));
    check('M3 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m3.png`, fullPage: true });
    await ctx.close();
  }

  // ── 6. M4 — deux dés ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], tag: 'm4' });
    const issues = [];
    await page.locator('button[aria-label="Parier sur la somme 7"]').click();
    await page.waitForTimeout(120);
    await page.locator('button[aria-label="Lancer les deux dés"]').click();
    await page.waitForTimeout(950);
    await page.getByRole('button', { name: /Lancer 1.000 fois les deux dés/ }).click();
    await page.waitForTimeout(1100);
    issues.push(...await layoutAudit(page));
    check('M4 : 1 001 lancers, une somme en tête', /En tête : la somme/.test(await body(page)) && /1.001 lancers/.test(await body(page)));
    const cell = (a, b) => page.locator(`#step-2 rect[role="button"][aria-label^="Case dé 1 = ${a}, dé 2 = ${b},"]`);
    await cell(1, 6).click({ force: true }); await cell(2, 5).click({ force: true }); await cell(3, 4).click({ force: true });  // oublie les symétriques
    await page.locator('#step-2 button:has-text("Vérifier mes cases")').click();
    await settle(page);
    check('M4 : les cases manquantes sont comptées', /Il manque 3 cases/.test(await body(page)));
    await cell(4, 3).click({ force: true }); await cell(5, 2).click({ force: true }); await cell(6, 1).click({ force: true });
    await page.locator('#step-2 button:has-text("Vérifier mes cases")').click();
    await settle(page);
    check('M4 : 6/36 = 1/6 relié à la fréquence observée', /6 cases sur 36/.test(await body(page)));
    issues.push(...await layoutAudit(page));
    await page.locator('#step-3 [role="group"] button').nth(1).click();   // erreur volontaire 1/11
    await settle(page);
    check('M4 : le modèle apparaît sur les barres', /probabilité du modèle/.test(await body(page)));
    issues.push(...await layoutAudit(page));
    const c4 = (a, b) => page.locator(`#step-4 rect[role="button"][aria-label^="Case dé 1 = ${a}, dé 2 = ${b},"]`);
    for (const [a, b] of [[4, 6], [5, 5], [6, 4], [5, 6], [6, 5], [6, 6]]) await c4(a, b).click({ force: true });
    await page.locator('#step-4 button:has-text("Vérifier mes cases")').click();
    await settle(page);
    await page.locator('#step-4 [role="group"] button').last().click();   // erreur volontaire 10/36
    await settle(page);
    await page.locator('button:has-text("Faux : les 11 sommes")').first().click();
    await settle(page);
    check('M4 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M4 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m4.png`, fullPage: true });
    await ctx.close();
  }

  // ── 7. M5 — le langage ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });
    const issues = [];
    const place = async (letter, t) => {
      await page.locator(`button[aria-label^="Placer l'événement ${letter}"]`).click();
      await page.locator(`rect[aria-label^="Graduation ${t} douzième"]`).click({ force: true });
      await page.waitForTimeout(80);
    };
    await place('A', 6); await place('B', 3); await place('C', 3); await place('D', 0); await place('E', 12);   // B faux (1/6 = 2 douzièmes)
    issues.push(...await layoutAudit(page));
    await page.locator('button:has-text("Vérifier mes placements")').click();
    await settle(page);
    check('M5 : 4 sur 5 bien placés, correction visible', /4 sur 5 bien placés/.test(await body(page)));
    issues.push(...await layoutAudit(page));
    const rows = page.locator('#step-2 [role="group"]');
    const nr = await rows.count();
    for (let i = 0; i < nr; i += 1) { await rows.nth(i).locator('button').first().click(); await page.waitForTimeout(80); }
    await settle(page);
    check('M5 : vrai/faux corrigé', /sur 4|Quatre/.test(await body(page)));
    await page.locator('button:has-text("7 chances sur 10")').first().click();
    await settle(page);
    await page.locator('input[type="text"]').first().fill('200');   // erreur volontaire
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    check('M5 : 0,02 × 1 000 corrigé', /pas 20 %/.test(await body(page)));
    check('M5 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m5.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8. M6 — le labo des situations ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });
    const issues = [];
    await page.locator('button[aria-label="Un secteur rouge de plus"]').click();
    await page.locator('button[aria-label="Un secteur rouge de plus"]').click();
    await page.waitForTimeout(300);
    check('M6 : la roue complète sur 4/12 = 1/3', /P\(rouge\) = 4\/12 = 1\/3/.test(await body(page)));
    await page.locator('button[aria-label="Tourner 120 fois"]').click();
    await page.waitForTimeout(1200);
    issues.push(...await layoutAudit(page));
    check('M6 : 120 tours comparés à 40', /Sur 120 tours/.test(await body(page)) && /environ 40/.test(await body(page)));
    await page.locator('input[type="text"]').first().fill('15');   // erreur volontaire (l'effectif)
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    check('M6 : effectif pris pour fréquence corrigé', /15 est l’effectif/.test(await body(page)));
    await page.locator('input[type="text"]').first().fill('90');
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    await page.locator('#step-3 [role="group"] button').nth(2).click();   // erreur volontaire 1/2
    await settle(page);
    check('M6 : le piège 1/2 est corrigé', /ce sont les élèves qui ont la même chance/.test(await body(page)));
    await page.locator('#step-3 [role="group"]').last().locator('button').first().click();
    await settle(page);
    const rows = page.locator('#step-4 [role="group"]');
    const nr = await rows.count();
    for (let i = 0; i < nr; i += 1) { await rows.nth(i).locator('button').nth(1).click(); await page.waitForTimeout(80); }
    await settle(page);
    check('M6 : terminé', await page.locator('button:has-text("Module suivant")').first().isEnabled());
    check('M6 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m6.png`, fullPage: true });
    await ctx.close();
  }

  // ── 9. Boss ──
  {
    const { ctx, page } = await openSeeded(browser, M.boss, { completedModules: ['0', '1', '2', '3', '4', '5', '6'], tag: 'boss' });
    check('boss : silencieux avant validation', !/Bonne réponse/.test(await body(page)));
    const groups = page.locator('div[role="group"]');
    const g = await groups.count();
    check('boss : dix épreuves présentes', g >= 10, `${g} groupes`);
    for (let i = 0; i < g; i += 1) {
      const o = groups.nth(i).locator('button').first();
      if (await o.count()) await o.click().catch(() => {});
    }
    const sub = page.locator('button:has-text("Valider")').first();
    if (await sub.count()) await sub.click();
    await settle(page);
    check('boss : un score apparaît', /\/\s*10|score|résultat/i.test(await body(page)));
    check('boss : la correction des fractions est lisible en texte', /3\/6 = 1\/2/.test(await body(page)) || /Bonne réponse/.test(await body(page)));
    const prof = page.locator('button:has-text("profil"), button:has-text("Mon profil")').first();
    if (await prof.count()) { await prof.click(); await settle(page); }
    const syn = page.locator('button:has-text("synthèse"), button:has-text("Synthèse")').first();
    if (await syn.count()) { await syn.click(); await settle(page); }
    check('boss : la synthèse est atteignable', /Ce que le hasard cachait/.test(await body(page)));
    const audit = await layoutAudit(page);
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await body(page)));
    await ctx.close();
  }

  // ── 10. Revisite ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], tag: 'revisit' });
    check('revisite : aucune étape verrouillée', !/termine l’étape précédente/.test(await body(page)));
    await ctx.close();
  }

  // ── 11. Mobile — M1 et M4 à 375 px ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    check('mobile M1 : pas de défilement horizontal', await noHScroll(page));
    await page.locator('button[aria-label="Prédire la face 2"]').tap();
    await page.waitForTimeout(120);
    const lancer = page.locator('button[aria-label="Lancer le dé"]').first();
    const issues = [];
    for (let i = 0; i < 3; i += 1) { await lancer.tap(); await page.waitForTimeout(950); issues.push(...await layoutAudit(page), ...await domOverflow(page)); }
    await page.locator('button[aria-label="Lancer 10 fois"]').first().tap();
    await page.waitForTimeout(1100);
    issues.push(...await layoutAudit(page), ...await domOverflow(page));
    check('mobile M1 : mise en page correcte pendant les lancers', issues.length === 0, issues.slice(0, 3).join(' | '));
    const small = await smallTargets(page);
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    check('mobile M1 : toujours pas de défilement horizontal', await noHScroll(page));
    await page.screenshot({ path: `${SHOT_DIR}pb-m1-mobile.png`, fullPage: true });
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], mobile: true, tag: 'mobile-m4' });
    await page.locator('button[aria-label="Parier sur la somme 8"]').tap();
    await page.waitForTimeout(120);
    await page.getByRole('button', { name: /Lancer 1.000 fois les deux dés/ }).tap();
    await page.waitForTimeout(1100);
    const cellSize = await page.evaluate(() => {
      const r = document.querySelector('#step-2 rect[role="button"]');
      if (!r) return 0;
      const b = r.getBoundingClientRect();
      return Math.min(b.width, b.height);
    });
    check('mobile M4 : les cases de la grille font ≥ 40 px', cellSize >= 40, `${cellSize.toFixed(1)} px`);
    const issues = await layoutAudit(page);
    check('mobile M4 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('mobile M4 : pas de défilement horizontal', await noHScroll(page));
    const small = await smallTargets(page);
    check('mobile M4 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}pb-m4-mobile.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
