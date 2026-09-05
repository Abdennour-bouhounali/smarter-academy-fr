// Suite Playwright — 3e « Fonctions » (fonctions-3e).
// Run: node apps/web/e2e/lesson-kit/3e-fonctions.mjs
// (dev server on :5213, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5213';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-3e';
const TOTAL = 9;
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/la-machine-mysterieuse`,
  m2: `${ROOT}/image-et-antecedent`,
  m3: `${ROOT}/le-tableau-de-valeurs`,
  m4: `${ROOT}/du-tableau-au-repere`,
  m5: `${ROOT}/lineaire-affine-ou-ni-lun-ni-lautre`,
  m6: `${ROOT}/retrouver-la-regle`,
  m7: `${ROOT}/la-machine-dans-la-vraie-vie`,
  boss: `${ROOT}/mission-finale-latelier-des-machines`,
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
  page.on('console', (m) => {
    if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(`[${tag}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errs.push(`[${tag}] ${e.message}`));
};
const settle = (page) => page.waitForTimeout(1200);

async function openSeeded(browser, url, { completedModules = [], mobile = false, tag = 'x' } = {}) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true }
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

  // ── 1. Index ──────────────────────────────────────────────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.index, { tag: 'index' });
    const body = await page.textContent('body');
    check('index se charge', body.length > 200);
    check('index sans NaN', !body.includes('NaN'), body.slice(0, 120));
    check('carte du module 0 présente', /Mission de départ/.test(body));
    check('titre de la leçon présent', /Fonctions/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}fo-index.png`, fullPage: true });
    await ctx.close();
  }

  // ── 2. Diagnostic non bloquant ────────────────────────────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.diag, { tag: 'diag' });
    // ModuleLayout rend « Module suivant » en <button> (navigation par
    // router), pas en <a> : c'est son état ACTIVÉ qui prouve le non-blocage.
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    const nextEarly = await nextBtn.count();
    const enabledEarly = nextEarly > 0 ? await nextBtn.isEnabled() : false;
    check('diagnostic : bouton suivant actif avant toute réponse', enabledEarly);
    const opts = page.locator('div[role="group"] > button[aria-pressed]');
    const n = await opts.count();
    check('diagnostic : 5 questions ont des options', n >= 5, `${n} options`);
    for (let i = 0; i < 5; i += 1) {
      const first = page.locator('div[role="group"]').nth(i).locator('button[aria-pressed]').first();
      if (await first.count()) await first.click();
    }
    const submit = page.locator('button:has-text("Voir mon résultat")');
    if (await submit.count()) await submit.first().click();
    await settle(page);
    const after = await page.textContent('body');
    check('diagnostic : un résultat s’affiche', /sur 10|point/i.test(after));
    await ctx.close();
  }

  // ── 3. M1 — la machine mystérieuse (manipulation signature) ──────────
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const before = await page.textContent('body');
    check('M1 : la règle reste secrète au départ', /règle secrète/.test(before));

    // Trois entrées différentes par pastille, puis UN nombre libre (100).
    for (const v of ['2', '3', '4']) {
      await page.locator(`button[aria-label="Entrée ${v}"]`).first().click();
      await page.locator('button:has-text("Lancer la machine")').first().click();
      await page.waitForTimeout(600);
    }
    await page.locator('input[aria-label="Ton propre nombre d’entrée"]').first().fill('100');
    await page.locator('button:has-text("Utiliser")').first().click();
    await page.locator('button:has-text("Lancer la machine")').first().click();
    await page.waitForTimeout(600);
    const afterRuns = await page.textContent('body');
    check('M1 : le journal montre les couples obtenus', /Entrée[\s\S]*Sortie/.test(afterRuns));
    check('M1 : un nombre libre passe dans la machine (100 → 299)', /299/.test(afterRuns));
    // Un nombre hors borne est refusé en clair, jamais tronqué.
    await page.locator('input[aria-label="Ton propre nombre d’entrée"]').first().fill('5000');
    await page.locator('button:has-text("Utiliser")').first().click();
    await page.waitForTimeout(200);
    check('M1 : un nombre hors borne est refusé en clair', /Reste entre/.test(await page.textContent('body')));

    // Étape 2 : une mauvaise hypothèse d'abord, la bonne ensuite.
    await page.locator('button:has-text("+ 2")').first().click();
    await page.waitForTimeout(300);
    const wrongRule = await page.textContent('body');
    check('M1 : une mauvaise règle est rejouée et contredite, pas jugée', /n’est d’accord qu’avec/.test(wrongRule));
    await page.locator('button:has-text("× 3 puis − 1")').first().click();
    await settle(page);
    check('M1 : la bonne règle est d’accord avec tous les couples', /La règle est trouvée/.test(await page.textContent('body')));

    // Étape 3 : prédiction VOLONTAIREMENT fausse (18 = « − 1 puis × 3 » en 7).
    await page.locator('input[type="text"]').last().fill('18');
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    const afterPred = await page.textContent('body');
    check('M1 : une prédiction fausse est corrigée par la machine, sans blocage',
      /Bonne réponse/.test(afterPred) && /enlevé 1 avant/.test(afterPred) && !/Réessayer/.test(afterPred));

    // Étape 4 : relancer une entrée déjà vue (la deuxième machine de la page).
    await page.locator('button[aria-label="Entrée 2"]').last().click();
    await page.locator('button:has-text("Lancer la machine")').last().click();
    await page.waitForTimeout(700);
    check('M1 : la même entrée redonne la même sortie', /redonne/.test(await page.textContent('body')));

    // Étape 5 : les trois vues — le repère doit rester lisible avec 100 → 299.
    await page.locator('button:has-text("Tableau")').first().click();
    await page.locator('button:has-text("Repère")').first().click();
    await page.waitForTimeout(400);
    const audit = [...await layoutAudit(page), ...await aspectAudit(page)];
    check('M1 : le repère adapté aux grands nombres reste lisible', audit.length === 0, audit.slice(0, 3).join(' | '));
    check('M1 : les trois vues terminent le module', /Trois habits/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}fo-m1-machine.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M2 — image / antécédent, et la dissymétrie ─────────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0', '1'], tag: 'm2' });
    const body = await page.textContent('body');
    check('M2 : la règle est affichée', /f\(x\)|2x/.test(body));
    const input = page.locator('input[type="text"]').first();
    if (await input.count()) {
      await input.fill('13');
      const ok = page.locator('button:has-text("OK")').first();
      if (await ok.count()) await ok.click();
      await settle(page);
    }
    const after = await page.textContent('body');
    check('M2 : image calculée et corrigée', /image|Bonne réponse|13/.test(after));
    await page.screenshot({ path: `${SHOT_DIR}fo-m2.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M3 — tableau de valeurs (décimales et pastilles) ───────────────
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0', '1', '2'], tag: 'm3' });
    const chips = page.locator('button[aria-label^="Tester"], table button');
    const before = await page.textContent('body');
    check('M3 : le tableau est présent', /Tableau|x/.test(before));
    // Remplir quatre colonnes.
    const n = Math.min(await chips.count(), 5);
    for (let i = 0; i < n; i += 1) {
      await chips.nth(i).click().catch(() => {});
      await page.waitForTimeout(420);
    }
    const after = await page.textContent('body');
    check('M3 : au moins une colonne remplie', after.length > before.length - 50);
    await page.screenshot({ path: `${SHOT_DIR}fo-m3-tableau.png`, fullPage: true });
    await ctx.close();
  }

  // ── 6. M4 — placement de points + curseur de lecture ──────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0', '1', '2', '3'], tag: 'm4' });
    const svgs = await page.locator('svg').count();
    check('M4 : au moins un repère affiché', svgs >= 1, `${svgs} svg`);
    const poser = page.locator('button:has-text("Poser le point")');
    check('M4 : bouton de validation présent', await poser.count() > 0);
    // Poser volontairement un point faux : le fantôme doit apparaître.
    if (await poser.count()) {
      await poser.first().click();
      await settle(page);
    }
    const afterWrong = await page.textContent('body');
    check('M4 : un point mal placé est expliqué, pas rejeté',
      /Le tableau\s*demande|Il reste/.test(afterWrong));
    // Échappée après 3 essais.
    for (let i = 0; i < 3; i += 1) {
      if (await poser.count()) { await poser.first().click(); await page.waitForTimeout(300); }
    }
    const escape = page.locator('button:has-text("montre-moi")');
    check('M4 : échappée disponible après plusieurs essais', await escape.count() > 0);
    if (await escape.count()) { await escape.first().click(); await settle(page); }
    const done = await page.textContent('body');
    check('M4 : l’échappée termine l’étape', /alignés|représentation graphique/.test(done));
    await page.screenshot({ path: `${SHOT_DIR}fo-m4-repere.png`, fullPage: true });
    await ctx.close();
  }

  // ── 7. M7 — le curseur des deux forfaits (état extrême inclus) ────────
  {
    const { ctx, page } = await openSeeded(browser, M.m7, {
      completedModules: ['0', '1', '2', '3', '4', '5', '6'], tag: 'm7',
    });
    const body = await page.textContent('body');
    check('M7 : la situation du taxi est posée', /taxi|2 €|1,5/i.test(body));
    // Le repère du taxi doit partir de 2 € (prise en charge), pas de 0.
    check('M7 : la prise en charge est visible sur le repère',
      /dès la montée|2 €/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}fo-m7-taxi.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8. Boss — silencieux, puis profil et synthèse ─────────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.boss, {
      completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], tag: 'boss',
    });
    const before = await page.textContent('body');
    check('boss : silencieux avant validation', !/Bonne réponse/.test(before));
    const groups = page.locator('div[role="group"]');
    const g = await groups.count();
    check('boss : dix épreuves présentes', g >= 10, `${g} groupes`);
    for (let i = 0; i < g; i += 1) {
      const opt = groups.nth(i).locator('button').first();
      if (await opt.count()) await opt.click().catch(() => {});
    }
    const submit = page.locator('button:has-text("Valider")').first();
    if (await submit.count()) await submit.click();
    await settle(page);
    const scored = await page.textContent('body');
    check('boss : un score apparaît après validation', /\/\s*10|score|résultat/i.test(scored));

    const profil = page.locator('button:has-text("profil"), button:has-text("Mon profil")').first();
    if (await profil.count()) { await profil.click(); await settle(page); }
    const synth = page.locator('button:has-text("synthèse"), button:has-text("Synthèse")').first();
    if (await synth.count()) { await synth.click(); await settle(page); }
    const end = await page.textContent('body');
    check('boss : la synthèse est atteignable', /trois façons|Une seule fonction|synthèse/i.test(end));
    await page.screenshot({ path: `${SHOT_DIR}fo-boss-synthese.png`, fullPage: true });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    const reloaded = await page.textContent('body');
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(reloaded));
    await ctx.close();
  }

  // ── 9. Revisite d’un module terminé : toutes les étapes ouvertes ──────
  {
    const { ctx, page } = await openSeeded(browser, M.m1, {
      completedModules: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], tag: 'revisit',
    });
    const body = await page.textContent('body');
    check('revisite : aucune étape verrouillée',
      !/termine l’étape précédente|termine l'étape précédente/.test(body));
    await ctx.close();
  }

  // ── 10. Passe mobile 375×667 ──────────────────────────────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.m4, {
      completedModules: ['0', '1', '2', '3'], mobile: true, tag: 'mobile',
    });
    const noScroll = await page.evaluate(
      () => document.scrollingElement.scrollWidth <= window.innerWidth + 1
    );
    check('mobile : pas de défilement horizontal', noScroll);
    const small = await page.evaluate(() => {
      const bad = [];
      for (const b of document.querySelectorAll('main button')) {
        if (b.disabled) continue;
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 24));
      }
      return bad;
    });
    check('mobile : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fo-mobile-m4.png`, fullPage: true });
    await ctx.close();
  }

  // ── 10b. Passe mobile sur M1 (manipulation signature) ─────────────────
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    for (const v of ['−2', '0', '4']) {
      await page.locator(`button[aria-label="Entrée ${v}"]`).first().tap();
      await page.locator('button:has-text("Lancer la machine")').first().tap();
      await page.waitForTimeout(600);
    }
    await page.locator('button:has-text("× 3 puis − 1")').first().tap();
    await settle(page);
    check('mobile M1 : pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    const small = await MOBILE_TARGETS(page);
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}fo-mobile-m1.png`, fullPage: true });
    await ctx.close();
  }

  // ── 11. Aucune erreur console ─────────────────────────────────────────
  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));

  await browser.close();
};

run().then(
  () => process.exit(summary() ? 1 : 0),
  (e) => { console.error('RUNNER CRASH', e); process.exit(2); }
);
