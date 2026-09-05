// Suite Playwright — 3e « Fonctions affines » (fonctions-affines-3e).
// Run: node apps/web/e2e/lesson-kit/3e-fonctions-affines.mjs
// (dev server on :5215, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5215';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-affines-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-affines-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/le-taxi-et-le-forfait`,
  m2: `${ROOT}/le-bouton-a`,
  m3: `${ROOT}/le-bouton-b`,
  m4: `${ROOT}/les-deux-boutons`,
  m5: `${ROOT}/deux-points-suffisent`,
  m6: `${ROOT}/la-facture-a-lenvers`,
  boss: `${ROOT}/mission-finale-latelier-des-tarifs`,
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

/** Pousse un réglage d'un bout à l'autre, en auditant chaque cran. */
async function sweepSlider(page, label, steps, audit) {
  const minus = page.locator(`button[aria-label="Diminuer ${label}"]`).first();
  const plus = page.locator(`button[aria-label="Augmenter ${label}"]`).first();
  const issues = [];
  for (let i = 0; i < steps; i += 1) {
    if (await minus.count() && await minus.isEnabled()) await minus.click();
    await page.waitForTimeout(60);
  }
  for (let i = 0; i <= steps; i += 1) {
    issues.push(...await audit(page));
    if (await plus.count() && await plus.isEnabled()) await plus.click();
    await page.waitForTimeout(60);
  }
  return issues;
}


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
    await page.screenshot({ path: `${SHOT_DIR}fa-index.png`, fullPage: true });
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

  // ── 3. M1 — le compteur du taxi (manipulation signature) ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const plus = page.locator('button[aria-label="Augmenter la distance parcourue"]').first();
    const minus = page.locator('button[aria-label="Diminuer la distance parcourue"]').first();
    check('M1 : le compteur est la première chose proposée', (await plus.count()) > 0 && /Compteur/.test(await page.textContent('body')));
    for (let i = 0; i < 3; i += 1) await minus.click();
    await page.waitForTimeout(200);
    const body0 = await page.textContent('body');
    check('M1 : à 0 km on paie déjà la prise en charge', /0 km × 1,5 €/.test(body0) && /2,00 €/.test(body0));
    for (let i = 0; i < 10; i += 1) await plus.click();
    await page.waitForTimeout(250);
    const body1 = await page.textContent('body');
    check('M1 : à 10 km le compteur affiche 17,00 €', /17,00 €/.test(body1));
    check('M1 : l’exploration termine l’étape', /Un seul nombre ne suffit plus/.test(body1));
    const audit1 = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : la trace à 10 km reste lisible', audit1.length === 0, audit1.slice(0, 3).join(' | '));

    await page.locator('input[type="text"]').first().fill('15');
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    const after2 = await page.textContent('body');
    check('M1 : l’oubli de la prise en charge est nommé, sans blocage', /oublié les 2 €/.test(after2) && !/Réessayer/.test(after2));
    await page.locator('button:has-text("Oui : deux fois plus loin")').first().click();
    await settle(page);
    check('M1 : une réponse fausse est corrigée sans blocage', /Bonne réponse/.test(await page.textContent('body')));

    await page.getByRole('button', { name: /^5 €$/ }).first().click();
    await page.waitForTimeout(200);
    check('M1 : changer la prise en charge change le départ', /5,00 €/.test(await page.textContent('body')));
    await page.getByRole('button', { name: /^2 €\/km$/ }).first().click();
    await page.waitForTimeout(300);
    const body4 = await page.textContent('body');
    check('M1 : deux réglages, deux effets — l’étape se termine', /Deux réglages, deux effets/.test(body4));
    check('M1 : le tarif le plus cher à 10 km vaut 25,00 €', /25,00 €/.test(body4));
    const audit4 = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : le repère reste lisible au tarif maximal', audit4.length === 0, audit4.slice(0, 3).join(' | '));
    const rowBtns = page.locator('button:has-text("part fixe")');
    const n = await rowBtns.count();
    check('M1 : le tri des parts fixes est proposé', n >= 8, `${n} boutons`);
    for (let i = 0; i < n; i += 2) await rowBtns.nth(i).click().catch(() => {});
    await settle(page);
    check('M1 : le tri révèle sa correction', /que paie-t-on pour zéro|sur 4/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}fa-m1-taxi.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M2 — le bouton a, b verrouillé ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0','1'], tag: 'm2' });
    const pred = page.locator('button:has-text("Elle va s’incliner davantage")').first();
    if (await pred.count()) { await pred.click(); await settle(page); }
    const sliders = page.locator('input[type="range"]');
    check('M2 : les deux réglages sont visibles', (await sliders.count()) === 2);
    const bMinus = page.locator('button[aria-label="Diminuer l\'ordonnée à l\'origine b"]').first();
    check('M2 : le réglage de b est verrouillé', (await bMinus.count()) > 0 && !(await bMinus.isEnabled()));
    const issues = await sweepSlider(page, 'le coefficient a', 12, layoutAudit);
    check('M2 : mise en page correcte sur toute la plage de a', issues.length === 0, issues.slice(0, 3).join(' | '));
    const body = await page.textContent('body');
    check('M2 : les trois inclinaisons sont suivies',
      /trois inclinaisons|Il te reste à essayer/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}fa-m2-bouton-a.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M3 — le bouton b, a verrouillé ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0','1','2'], tag: 'm3' });
    const pred = page.locator('button:has-text("Elle va monter tout entière")').first();
    if (await pred.count()) { await pred.click(); await settle(page); }
    const aMinus = page.locator('button[aria-label="Diminuer le coefficient a"]').first();
    check('M3 : le réglage de a est verrouillé', (await aMinus.count()) > 0 && !(await aMinus.isEnabled()));
    const issues = await sweepSlider(page, "l'ordonnée à l'origine b", 9, layoutAudit);
    check('M3 : mise en page correcte sur toute la plage de b', issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fa-m3-bouton-b.png`, fullPage: true });
    await ctx.close();
  }

  // ── 6. M4 — les deux réglages, cible et échappée ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0','1','2','3'], tag: 'm4' });
    check('M4 : les deux réglages sont actifs',
      (await page.locator('input[type="range"]').count()) === 2);
    // Balayage croisé : a à fond puis b à fond, l'escalier reste dans le cadre.
    const iA = await sweepSlider(page, 'le coefficient a', 12, layoutAudit);
    const iB = await sweepSlider(page, "l'ordonnée à l'origine b", 8, layoutAudit);
    check('M4 : mise en page correcte aux extrêmes des deux réglages',
      iA.length === 0 && iB.length === 0, [...iA, ...iB].slice(0, 3).join(' | '));
    const escape = page.locator('button:has-text("montre-moi")').first();
    check('M4 : échappée disponible après plusieurs essais', (await escape.count()) > 0);
    if (await escape.count()) { await escape.click(); await settle(page); }
    check('M4 : l’échappée termine l’étape', /On te les montre|Atteinte/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}fa-m4-deux-boutons.png`, fullPage: true });
    await ctx.close();
  }

  // ── 7. M5 — le triangle des deux points, y compris les cas limites ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0','1','2','3','4'], tag: 'm5' });
    check('M5 : deux pastilles de sélection', (await page.locator('button:has-text("Déplacer")').count()) === 2);
    const zone = page.locator('rect[role="slider"]').first();
    check('M5 : la zone tactile du repère existe', (await zone.count()) > 0);
    if (await zone.count()) {
      await zone.focus();
      // Les quatre coins, plus le cas « même abscisse » recherché volontairement.
      const issues = [];
      for (const seq of [['Home','PageDown'], ['End','PageUp'], ['Home','PageUp'], ['End','PageDown']]) {
        for (const k of seq) await page.keyboard.press(k);
        await page.waitForTimeout(200);
        issues.push(...await layoutAudit(page));
      }
      check('M5 : mise en page correcte aux quatre coins', issues.length === 0, issues.slice(0, 3).join(' | '));
    }
    const body = await page.textContent('body');
    check('M5 : le triangle ou son impossibilité est annoncé',
      /Δx|aucune fonction|confondus/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}fa-m5-triangle.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8. M6 — la négociation de l'abonnement ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0','1','2','3','4','5'], tag: 'm6' });
    const input = page.locator('input[type="text"]').first();
    if (await input.count()) {
      await input.fill('0,25');
      const ok = page.locator('button:has-text("OK")').first();
      if (await ok.count()) await ok.click();
      await settle(page);
    }
    check('M6 : le prix à la minute est corrigé', /0,25|Bonne réponse/.test(await page.textContent('body')));
    // L'étape 3 (le curseur d'abonnement) n'apparaît qu'une fois l'étape 2 répondue.
    const bZero = page.locator('button:has-text("pas d’abonnement")').first();
    if (await bZero.count()) { await bZero.click(); await settle(page); }
    check('M6 : le curseur d’abonnement est déverrouillé',
      (await page.locator('input[type="range"]').count()) > 0);
    const issues = await sweepSlider(page, "l'ordonnée à l'origine b", 14, layoutAudit);
    check('M6 : mise en page correcte sur toute la plage d’abonnement',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M6 : l’égalité parfaite est reconnue, pas refusée',
      /Égalité parfaite|passe devant|de trop/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}fa-m6-negociation.png`, fullPage: true });
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
    check('boss : huit épreuves présentes', g >= 8, `${g} groupes`);
    for (let i = 0; i < g; i += 1) {
      const o = groups.nth(i).locator('button').first();
      if (await o.count()) await o.click().catch(() => {});
    }
    const sub = page.locator('button:has-text("Valider")').first();
    if (await sub.count()) await sub.click();
    await settle(page);
    check('boss : un score apparaît', /\/\s*8|score|résultat/i.test(await page.textContent('body')));
    const prof = page.locator('button:has-text("profil"), button:has-text("Mon profil")').first();
    if (await prof.count()) { await prof.click(); await settle(page); }
    const syn = page.locator('button:has-text("synthèse"), button:has-text("Synthèse")').first();
    if (await syn.count()) { await syn.click(); await settle(page); }
    check('boss : la synthèse est atteignable', /deux métiers|incline|soulève/i.test(await page.textContent('body')));
    const audit = await layoutAudit(page);
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fa-boss.png`, fullPage: true });
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
    const iA = await sweepSlider(page, 'le coefficient a', 12, layoutAudit);
    check('mobile : mise en page correcte aux extrêmes à 375 px', iA.length === 0, iA.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fa-mobile.png`, fullPage: true });
    await ctx.close();
  }

  // ── 11b. Mobile sur M1 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    const plus = page.locator('button[aria-label="Augmenter la distance parcourue"]').first();
    for (let i = 0; i < 7; i += 1) { await plus.tap(); await page.waitForTimeout(60); }
    check('mobile M1 : pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    const small = await MOBILE_TARGETS(page);
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    const audit = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('mobile M1 : repère lisible à 375 px', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fa-mobile-m1.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
