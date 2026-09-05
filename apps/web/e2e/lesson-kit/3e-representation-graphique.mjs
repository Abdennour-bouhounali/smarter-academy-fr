// Suite Playwright — 3e « Représentation graphique » (representation-graphique-3e).
// Run: node apps/web/e2e/lesson-kit/3e-representation-graphique.mjs
// (dev server on :5216, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5216';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/representation-graphique-3e`;
const KEY = 'u_anon_smarter_lesson_representation-graphique-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/une-image-vaut-douze-lignes`,
  m2: `${ROOT}/lechelle-qui-change-tout`,
  m3: `${ROOT}/entre-deux-graduations`,
  m4: `${ROOT}/latelier-du-graphique`,
  m5: `${ROOT}/quatre-graphiques-quatre-histoires`,
  m6: `${ROOT}/quatre-graphiques-a-reparer`,
  boss: `${ROOT}/mission-finale-le-bureau-detudes`,
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
    await page.screenshot({ path: `${SHOT_DIR}rg-index.png`, fullPage: true });
    await ctx.close();
  }

  // ── 2. Diagnostic non bloquant ──
  {
    const { ctx, page } = await openSeeded(browser, M.diag, { tag: 'diag' });
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    check('diagnostic : bouton suivant actif avant toute réponse',
      (await nextBtn.count()) > 0 && (await nextBtn.isEnabled()));
    for (let i = 0; i < 5; i += 1) {
      const o = page.locator('div[role="group"]').nth(i).locator('button[aria-pressed]').first();
      if (await o.count()) await o.click();
    }
    const sub = page.locator('button:has-text("Voir mon résultat")');
    if (await sub.count()) await sub.first().click();
    await settle(page);
    check('diagnostic : un résultat s’affiche', /sur 10|point/i.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 3. M1 — construire l'image : prédire, poser, relier, prolonger ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    await page.locator('button:has-text("Éparpillés au hasard")').first().click();
    await settle(page);
    const b1 = await page.textContent('body');
    check('M1 : une prédiction fausse est corrigée sans blocage', /Bonne réponse/.test(b1) && !/Réessayer/.test(b1));
    const zone = page.locator('rect[role="slider"]').first();
    check('M1 : le point est déplaçable', (await zone.count()) > 0);
    const poser = () => page.locator('button:has-text("Poser le point")').first();
    await poser().click(); await page.waitForTimeout(300);
    check('M1 : un point mal posé est décrit en mots', /vers le haut/.test(await page.textContent('body')));
    await zone.focus();
    for (let i = 0; i < 5; i += 1) await page.keyboard.press('ArrowUp');
    await poser().click(); await page.waitForTimeout(250);
    for (let p = 1; p < 5; p += 1) {
      await zone.focus();
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown');
      await poser().click(); await page.waitForTimeout(250);
    }
    const body2 = await page.textContent('body');
    check('M1 : les cinq relevés sont posés', /Les cinq points sont posés/.test(body2));
    await page.locator('button:has-text("Relier les points")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("À 6 h")').first().click();
    await settle(page);
    check('M1 : la prédiction de la panne est corrigée', /Bonne réponse/.test(await page.textContent('body')));
    await page.locator('button:has-text("Prolonger le trait")').first().click();
    await page.waitForTimeout(300);
    check('M1 : le trait prolongé prévoit la panne', /prévoit/.test(await page.textContent('body')));
    const audit = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : mise en page correcte (deux repères, trait prolongé)', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.locator('button:has-text("Parce que la charge dépend du temps")').first().click();
    await settle(page);
    await page.screenshot({ path: `${SHOT_DIR}rg-m1-batterie.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M2 — les deux échelles de la MÊME série ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0','1'], tag: 'm2' });
    const zero = page.locator('button:has-text("Axe partant de 0")').first();
    const trunc = page.locator('button:has-text("Axe partant de 17")').first();
    check('M2 : les deux échelles sont proposées',
      (await zero.count()) > 0 && (await trunc.count()) > 0);
    const issues = [];
    for (const btn of [trunc, zero, trunc]) {
      if (await btn.count()) { await btn.click(); await page.waitForTimeout(400); }
      issues.push(...await layoutAudit(page));
    }
    check('M2 : mise en page correcte aux deux échelles', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M2 : la bascule est reconnue faite', /deux images opposées|Essaie aussi/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}rg-m2-echelle.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M3 — placer entre deux graduations, avec échappée ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0','1','2'], tag: 'm3' });
    const poser = page.locator('button:has-text("Poser le point")').first();
    check('M3 : le bouton de placement est présent', (await poser.count()) > 0);
    // Trois placements volontairement faux : l'écart doit être dit en mots.
    for (let i = 0; i < 3; i += 1) {
      if (await poser.count()) { await poser.click(); await page.waitForTimeout(250); }
    }
    check('M3 : l’écart est décrit en mots, pas jugé',
      /vers la (droite|gauche)|vers le (haut|bas)/.test(await page.textContent('body')));
    const escape = page.locator('button:has-text("montre-moi")').first();
    check('M3 : échappée disponible après trois essais', (await escape.count()) > 0);
    if (await escape.count()) { await escape.click(); await settle(page); }
    check('M3 : l’échappée termine l’étape', /On te les montre|quatre points sont posés/.test(await page.textContent('body')));
    const audit = await layoutAudit(page);
    check('M3 : mise en page correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}rg-m3-graduations.png`, fullPage: true });
    await ctx.close();
  }

  // ── 6. M4 — l'atelier : toutes les échelles balayées ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0','1','2','3'], tag: 'm4' });
    const axis = page.locator('button:has-text("Le temps, car le volume en dépend")').first();
    if (await axis.count()) { await axis.click(); await settle(page); }
    const chips = page.locator('button[aria-label^="Échelle"]');
    const n = await chips.count();
    check('M4 : plusieurs échelles sont proposées', n >= 2, `${n} pastilles`);
    const issues = [];
    for (let i = 0; i < n; i += 1) {
      await chips.nth(i).click().catch(() => {});
      await page.waitForTimeout(300);
      issues.push(...await layoutAudit(page));
    }
    check('M4 : mise en page correcte à toutes les échelles', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M4 : une échelle trop fine fait sortir des valeurs',
      /ne rentre|trop fine/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}rg-m4-atelier.png`, fullPage: true });
    await ctx.close();
  }

  // ── 7. M5 — quatre allures comparées ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0','1','2','3','4'], tag: 'm5' });
    check('M5 : les quatre graphiques sont affichés', (await page.locator('svg').count()) >= 4);
    const audit = await layoutAudit(page);
    check('M5 : mise en page correcte des quatre repères', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}rg-m5-quatre.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8. M6 — les quatre défauts ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0','1','2','3','4','5'], tag: 'm6' });
    const body = await page.textContent('body');
    check('M6 : le premier défaut est présenté', /axe tronqué|surchauffe/.test(body));
    const audit = await layoutAudit(page);
    check('M6 : mise en page correcte des graphiques défectueux', audit.length === 0, audit.slice(0, 3).join(' | '));
    const first = page.locator('button:has-text("L’axe vertical ne part pas de 0")').first();
    if (await first.count()) { await first.click(); await settle(page); }
    check('M6 : le défaut est expliqué avec sa réparation',
      /Réparation|signaler/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}rg-m6-reparer.png`, fullPage: true });
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
    check('boss : la synthèse est atteignable', /quatre décisions|Avant de croire/i.test(await page.textContent('body')));
    const audit = await layoutAudit(page);
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}rg-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 10. Revisite ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, {
      completedModules: ['0','1','2','3','4','5','6','7'], tag: 'revisit',
    });
    check('revisite : aucune étape verrouillée',
      !/termine l’étape précédente|termine l'étape précédente/.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 11. Mobile ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, {
      completedModules: ['0','1','2','3'], mobile: true, tag: 'mobile',
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
    const axis = page.locator('button:has-text("Le temps, car le volume en dépend")').first();
    if (await axis.count()) { await axis.click(); await settle(page); }
    const chips = page.locator('button[aria-label^="Échelle"]');
    const issues = [];
    for (let i = 0; i < await chips.count(); i += 1) {
      await chips.nth(i).click().catch(() => {});
      await page.waitForTimeout(250);
      issues.push(...await layoutAudit(page));
    }
    check('mobile : mise en page correcte à toutes les échelles à 375 px',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}rg-mobile.png`, fullPage: true });
    await ctx.close();
  }

  // ── 11b. Mobile sur M1 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    await page.locator('button:has-text("Alignés, en descendant")').first().tap();
    await settle(page);
    const zone = page.locator('rect[role="slider"]').first();
    const issues = [];
    if (await zone.count()) {
      await zone.focus();
      for (const seq of [['End', 'PageUp'], ['Home', 'PageDown'], ['End', 'PageDown'], ['Home', 'PageUp']]) {
        for (const k of seq) await page.keyboard.press(k);
        await page.waitForTimeout(150);
        issues.push(...await layoutAudit(page));
      }
    } else issues.push('pas de zone tactile');
    check('mobile M1 : le point mobile aux quatre coins reste lisible', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('mobile M1 : pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    const small = await MOBILE_TARGETS(page);
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}rg-mobile-m1.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
