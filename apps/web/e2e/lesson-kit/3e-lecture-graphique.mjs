// Suite Playwright — 3e « Lecture graphique » (lecture-graphique-3e).
// Run: node apps/web/e2e/lesson-kit/3e-lecture-graphique.mjs
// (dev server on :5217, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5217';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/lecture-graphique-3e`;
const KEY = 'u_anon_smarter_lesson_lecture-graphique-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/la-montgolfiere`,
  m2: `${ROOT}/image-ou-antecedent`,
  m3: `${ROOT}/lechelle-imposee`,
  m4: `${ROOT}/le-curseur-sonde`,
  m5: `${ROOT}/deux-ballons-un-croisement`,
  m6: `${ROOT}/le-labo-de-lecture`,
  boss: `${ROOT}/mission-finale-la-tour-de-controle`,
};

/** Balaye la sonde d'un bout à l'autre de son axe, en auditant chaque cran. */
async function sweepProbe(page, steps, audit) {
  const zone = page.locator('rect[role="slider"]').first();
  const issues = [];
  if (!(await zone.count())) return ['pas de zone tactile'];
  await zone.focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(150);
  for (let i = 0; i <= steps; i += 1) {
    issues.push(...await audit(page));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(70);
  }
  return issues;
}

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


/** Le repère ne doit jamais être démesurément haut (aspect ≤ 3 : un unitY oublié se voit ici). */
const aspectAudit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (!vb || !vb.width) continue;
    if (vb.height / vb.width > 3) out.push(`repère trop haut : ${vb.width}×${vb.height}`);
  }
  return out;
});

const MOBILE_TARGETS = (page) => page.evaluate(() => {
  const bad = [];
  for (const b of document.querySelectorAll('main button')) {
    if (b.disabled) continue;
    const r = b.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20));
  }
  return bad;
});

const run = async () => {
  const browser = await chromium.launch();

  // ── 1. Index ──
  {
    const { ctx, page } = await openSeeded(browser, M.index, { tag: 'index' });
    const body = await page.textContent('body');
    check('index se charge', body.length > 200);
    check('index sans NaN', !body.includes('NaN'));
    check('carte du module 0 présente', /Mission de départ/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}lg-index.png`, fullPage: true });
    await ctx.close();
  }

  // ── 2. Diagnostic non bloquant ──
  {
    const { ctx, page } = await openSeeded(browser, M.diag, { tag: 'diag' });
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    check('diagnostic : bouton suivant actif avant toute réponse',
      (await nextBtn.count()) > 0 && (await nextBtn.isEnabled()));
    // Une option par question : on clique le premier bouton de chaque groupe.
    const groups = page.locator('div[role="group"]');
    const n = await groups.count();
    for (let i = 0; i < n; i += 1) {
      const o = groups.nth(i).locator('button[aria-pressed]').first();
      if (await o.count()) await o.click().catch(() => {});
      await page.waitForTimeout(120);
    }
    // Le bouton d'envoi n'existe qu'une fois toutes les questions répondues.
    const sub = page.locator('button:has-text("Voir mon résultat")').first();
    check('diagnostic : le bouton d’envoi apparaît une fois tout répondu', (await sub.count()) > 0);
    if (await sub.count()) await sub.click().catch(() => {});
    await settle(page);
    // Le diagnostic affiche un bilan chiffré et une correction par question.
    check('diagnostic : un résultat s’affiche',
      /\/\s*10|Ton score|bases|Revoir|correction/i.test((await page.textContent('body')).replace(/\s+/g, ' ')));
    await ctx.close();
  }

  // ── 3. M1 — la MANIPULATION ouvre le module, puis les défis ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const body = await page.textContent('body');
    check('M1 : la sonde est la première chose proposée',
      /Promène la sonde/.test(body) && (await page.locator('rect[role="slider"]').count()) > 0);
    check('M1 : la lecture s’affiche en clair, avec le couple', /l’altitude est/.test(body) && /c’est le point/.test(body));
    const issues = await sweepProbe(page, 13, layoutAudit);
    check('M1 : mise en page correcte sur tout le vol', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M1 : les quatre phases sont reconnues parcourues', /parcouru tout le vol/.test(await page.textContent('body')));
    const z2 = page.locator('rect[role="slider"]').nth(1);
    check('M1 : le défi « 3 h » propose sa propre sonde', (await z2.count()) > 0);
    await z2.focus();
    for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    check('M1 : atteindre 3 h valide le défi', /la courbe répond sans hésiter/.test(await page.textContent('body')));
    await page.locator('button:has-text("Plus haut : il monte")').first().click();
    await settle(page);
    const b3 = await page.textContent('body');
    check('M1 : la prédiction fausse est corrigée par les deux lectures', /Bonne réponse/.test(b3) && !/Réessayer/.test(b3));
    const z4 = page.locator('rect[role="slider"]').nth(2);
    check('M1 : le défi « 400 m » propose sa propre sonde', (await z4.count()) > 0);
    await z4.focus();
    for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const body4 = await page.textContent('body');
    check('M1 : atteindre 400 m valide le défi et annonce les autres heures', /4 fois/.test(body4) && /2 h, 5 h, 9 h, 11 h/.test(body4));
    await page.locator('button:has-text("À 3 h, le ballon était à 600 m")').first().click();
    await page.locator('button:has-text("À 0 h et à 7 h")').first().click();
    await settle(page);
    const audit = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : trois repères lisibles en fin de module', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}lg-m1-sonde.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M2 — la dissymétrie image / antécédent ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0','1'], tag: 'm2' });
    const modes = page.locator('button[aria-pressed]');
    check('M2 : les deux sens de lecture sont proposés', (await modes.count()) >= 2);
    const body = await page.textContent('body');
    check('M2 : le mode altitude compte les passages', /est atteinte/.test(body));
    // On relève le décompte à CHAQUE cran : à la fin du balayage la sonde est
    // au sommet de l'axe, où plus aucune altitude n'est atteinte.
    const zone2 = page.locator('rect[role="slider"]').first();
    await zone2.focus();
    await page.keyboard.press('Home');
    await page.waitForTimeout(150);
    const issues = [];
    let sawMultiple = false;
    for (let i = 0; i <= 10; i += 1) {
      issues.push(...await layoutAudit(page));
      const t = (await page.textContent('body')).replace(/\s+/g, ' ');
      if (/est atteinte [2-9] fois/.test(t)) sawMultiple = true;
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(70);
    }
    check('M2 : mise en page correcte sur toute la plage d’altitude',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M2 : une altitude atteinte plusieurs fois est rencontrée', sawMultiple);
    await page.screenshot({ path: `${SHOT_DIR}lg-m2-dissymetrie.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M3 — l'échelle imposée, avec une erreur volontaire ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0','1','2'], tag: 'm3' });
    const input = page.locator('input[type="text"]').first();
    if (await input.count()) {
      await input.fill('4');   // le piège : compter les carreaux
      const ok = page.locator('button:has-text("OK")').first();
      if (await ok.count()) await ok.click();
      await settle(page);
    }
    check('M3 : l’erreur de carreaux est corrigée nommément',
      /carreau vaut 100|Bonne réponse/.test(await page.textContent('body')));
    const issues = await sweepProbe(page, 12, layoutAudit);
    check('M3 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // ── 6. M4 — extremums et intervalles ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0','1','2','3'], tag: 'm4' });
    const issues = await sweepProbe(page, 13, layoutAudit);
    check('M4 : mise en page correcte pendant la recherche du sommet',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M4 : le sommet est reconnu quand on l’atteint',
      /maximum est|Continue : le ballon/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}lg-m4-sonde.png`, fullPage: true });
    await ctx.close();
  }

  // ── 7. M5 — le croisement de deux courbes ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0','1','2','3','4'], tag: 'm5' });
    const body = await page.textContent('body');
    check('M5 : les deux vols sont affichés', /ballon A/.test(body) && /ballon B/.test(body));
    const issues = await sweepProbe(page, 13, layoutAudit);
    check('M5 : mise en page correcte avec deux courbes',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M5 : la comparaison des deux altitudes est demandée',
      /avant.*après|Avant la rencontre/i.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}lg-m5-croisement.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8. M6 — le labo, avec une confusion instant / durée ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0','1','2','3','4','5'], tag: 'm6' });
    check('M6 : la courbe inconnue est sondable', (await page.locator('rect[role="slider"]').count()) > 0);
    const input = page.locator('input[type="text"]').first();
    if (await input.count()) {
      await input.fill('900');
      const ok = page.locator('button:has-text("OK")').first();
      if (await ok.count()) await ok.click();
      await settle(page);
    }
    check('M6 : l’altitude maximale est corrigée', /Bonne réponse|sommet de la courbe/.test(await page.textContent('body')));
    const issues = await sweepProbe(page, 13, layoutAudit);
    check('M6 : mise en page correcte', issues.length === 0, issues.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // ── 9. Boss ──
  {
    const { ctx, page } = await openSeeded(browser, M.boss, {
      completedModules: ['0','1','2','3','4','5','6'], tag: 'boss',
    });
    check('boss : silencieux avant validation', !/Bonne réponse/.test(await page.textContent('body')));
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
    check('boss : un score apparaît', /\/\s*10|score|résultat/i.test(await page.textContent('body')));
    const prof = page.locator('button:has-text("profil"), button:has-text("Mon profil")').first();
    if (await prof.count()) { await prof.click(); await settle(page); }
    const syn = page.locator('button:has-text("synthèse"), button:has-text("Synthèse")').first();
    if (await syn.count()) { await syn.click(); await settle(page); }
    check('boss : la synthèse est atteignable', /Tout se lit|Ce que le vol raconte/i.test(await page.textContent('body')));
    const audit = await layoutAudit(page);
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}lg-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 10. Revisite ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, {
      completedModules: ['0','1','2','3','4','5','6','7'], tag: 'revisit',
    });
    check('revisite : aucune étape verrouillée',
      !/termine l’étape précédente|termine l'étape précédente/.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 11. Mobile ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, {
      completedModules: ['0','1'], mobile: true, tag: 'mobile',
    });
    check('mobile : pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    const small = await page.evaluate(() => {
      const bad = [];
      for (const b of document.querySelectorAll('main button')) {
        if (b.disabled) continue;
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20));
      }
      return bad;
    });
    check('mobile : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    const issues = await sweepProbe(page, 10, layoutAudit);
    check('mobile : mise en page correcte sur tout le balayage à 375 px',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}lg-mobile.png`, fullPage: true });
    await ctx.close();
  }

  // ── 11b. Mobile sur M1 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    const issues = await sweepProbe(page, 12, layoutAudit);
    check('mobile M1 : mise en page correcte sur tout le vol à 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('mobile M1 : pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    const small = await MOBILE_TARGETS(page);
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}lg-mobile-m1.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
