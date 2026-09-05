// Suite Playwright — 3e « Fonctions linéaires » (fonctions-lineaires-3e).
// Run: node apps/web/e2e/lesson-kit/3e-fonctions-lineaires.mjs
// (dev server on :5214, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5214';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-lineaires-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-lineaires-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/le-prix-au-kilo`,
  m2: `${ROOT}/le-coefficient`,
  m3: `${ROOT}/la-droite-a-pivot`,
  m4: `${ROOT}/retrouver-le-coefficient`,
  m5: `${ROOT}/le-labo-lineaire`,
  boss: `${ROOT}/mission-finale-le-marche`,
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
    await page.screenshot({ path: `${SHOT_DIR}fl-index.png`, fullPage: true });
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

  // ── 3. M1 — la balance du marchand (manipulation signature) ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const plus = page.locator('button[aria-label="Augmenter la masse de cerises"]').first();
    const minus = page.locator('button[aria-label="Diminuer la masse de cerises"]').first();
    const note = () => page.locator('button:has-text("Noter")').first();
    check('M1 : la balance est la première chose proposée', (await plus.count()) > 0 && (await note().count()) > 0);
    await note().click(); await page.waitForTimeout(200);
    await plus.click(); await plus.click(); await page.waitForTimeout(150);
    check('M1 : 2 kg donne 8 € (les pièces suivent la masse)', /2 kg[\s\S]{0,40}8 €/.test(await page.textContent('body')));
    await note().click(); await page.waitForTimeout(200);
    for (let i = 0; i < 4; i += 1) await minus.click();
    await page.waitForTimeout(150);
    check('M1 : 0 kg donne 0 €', /rien à payer/.test(await page.textContent('body')));
    await note().click(); await settle(page);
    check('M1 : trois couples notés terminent l’étape', /Trois couples au tableau/.test(await page.textContent('body')));

    await page.locator('button:has-text("Il coûte 5 €")').first().click();
    await settle(page);
    check('M1 : une prédiction fausse est corrigée par les deux caisses', /Bonne réponse/.test(await page.textContent('body')));
    await page.locator('input[type="text"]').first().fill('11');
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    const after3 = await page.textContent('body');
    check('M1 : l’erreur additive est nommée sans blocage', /ajouté 4/.test(after3) && !/Réessayer/.test(after3));
    check('M1 : la colonne prix ÷ masse est affichée', /Prix ÷ masse/.test(after3));
    await page.locator('button:has-text("Le prix d’un kilo")').first().click();
    await settle(page);
    const svgBefore = await page.locator('svg').count();
    await page.locator('button:has-text("Oui : 0 kg coûte 0 €")').first().click();
    await settle(page);
    const audit5 = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : le repère des couples est lisible', audit5.length === 0, audit5.slice(0, 3).join(' | '));
    check('M1 : un repère est présent avant la réponse', svgBefore >= 1);
    await page.locator('button:has-text("Ajouter 1 € de barquette")').first().click();
    await page.waitForTimeout(300);
    const body6 = await page.textContent('body');
    check('M1 : la barquette casse le passage par O', /ne passe plus par O/.test(body6));
    const audit6 = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : le repère décalé reste lisible', audit6.length === 0, audit6.slice(0, 3).join(' | '));
    await page.locator('button:has-text("Oui : le prix augmente toujours")').first().click();
    await settle(page);
    const end = await page.textContent('body');
    check('M1 : une réponse fausse est corrigée sans blocage', /Bonne réponse/.test(end) && !/Réessayer/.test(end));
    await page.screenshot({ path: `${SHOT_DIR}fl-m1.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M3 — la droite à pivot (manipulation signature) ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0','1','2'], tag: 'm3' });
    // Étape 1 : la prédiction ouvre la manipulation.
    const pred = page.locator('button:has-text("Elle va se redresser")').first();
    if (await pred.count()) { await pred.click(); await settle(page); }

    const slider = page.locator('input[type="range"]').first();
    check('M3 : le réglage de a est présent', await slider.count() > 0);
    check('M3 : aucun réglage de b (fonction linéaire)',
      (await page.locator('input[type="range"]').count()) === 1);

    // Explorer les trois régimes via les boutons ± (chemin tap-first).
    const plus = page.locator('button[aria-label^="Augmenter"]').first();
    const minus = page.locator('button[aria-label^="Diminuer"]').first();
    for (let i = 0; i < 4; i += 1) { if (await plus.count()) await plus.click(); await page.waitForTimeout(120); }
    const audit1 = await layoutAudit(page);
    check('M3 : mise en page correcte à pente forte', audit1.length === 0, audit1.join(' | '));
    for (let i = 0; i < 12; i += 1) { if (await minus.count()) await minus.click(); await page.waitForTimeout(90); }
    const audit2 = await layoutAudit(page);
    check('M3 : mise en page correcte à pente négative', audit2.length === 0, audit2.join(' | '));
    const body = await page.textContent('body');
    check('M3 : les trois régimes sont reconnus explorés',
      /vu les trois régimes|Il te reste à essayer/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}fl-m3-pivot.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M5 — le labo (curseur + décimales) ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0','1','2','3','4'], tag: 'm5' });
    const svgs = await page.locator('svg').count();
    check('M5 : le repère de la vitesse est affiché', svgs >= 1);
    const input = page.locator('input[type="text"]').first();
    if (await input.count()) {
      await input.fill('42');
      const ok = page.locator('button:has-text("OK")').first();
      if (await ok.count()) await ok.click();
      await settle(page);
    }
    const after = await page.textContent('body');
    check('M5 : la distance décimale est acceptée', /42|Bonne réponse/.test(after));
    const audit = await layoutAudit(page);
    check('M5 : mise en page du repère correcte', audit.length === 0, audit.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fl-m5-labo.png`, fullPage: true });
    await ctx.close();
  }

  // ── 6. Boss ──
  {
    const { ctx, page } = await openSeeded(browser, M.boss, {
      completedModules: ['0','1','2','3','4','5'], tag: 'boss',
    });
    const before = await page.textContent('body');
    check('boss : silencieux avant validation', !/Bonne réponse/.test(before));
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
    const end = await page.textContent('body');
    check('boss : la synthèse est atteignable', /proportionnalité|pivot|coefficient/i.test(end));
    const audit = await layoutAudit(page);
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fl-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 7. Revisite ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, {
      completedModules: ['0','1','2','3','4','5','6'], tag: 'revisit',
    });
    check('revisite : aucune étape verrouillée',
      !/termine l’étape précédente|termine l'étape précédente/.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 8. Mobile ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, {
      completedModules: ['0','1','2'], mobile: true, tag: 'mobile',
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
    const audit = await layoutAudit(page);
    check('mobile : mise en page du repère correcte à 375 px', audit.length === 0, audit.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fl-mobile.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8b. Mobile sur M1 ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    const plus = page.locator('button[aria-label="Augmenter la masse de cerises"]').first();
    for (let i = 0; i < 8; i += 1) { await plus.tap(); await page.waitForTimeout(60); }
    check('mobile M1 : pas de défilement horizontal à la masse maximale',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    const small = await MOBILE_TARGETS(page);
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fl-mobile-m1.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
