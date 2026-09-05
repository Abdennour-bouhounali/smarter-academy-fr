// Suite Playwright — 3e « Statistiques » (statistiques-3e).
// Run: node apps/web/e2e/lesson-kit/3e-statistiques.mjs
// (dev server on :5218, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5218';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/statistiques-3e`;
const KEY = 'u_anon_smarter_lesson_statistiques-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  m1: `${ROOT}/lancer-le-de`,
  m2: `${ROOT}/le-point-dequilibre`,
  m3: `${ROOT}/la-valeur-du-milieu`,
  m4: `${ROOT}/la-serie-elastique`,
  m5: `${ROOT}/trois-indicateurs`,
  m6: `${ROOT}/deux-classes`,
  m7: `${ROOT}/le-labo-des-donnees`,
  boss: `${ROOT}/mission-finale-le-journal-du-college`,
};

/**
 * Balaye la valeur pilotée d'un bout à l'autre de l'axe, en auditant chaque
 * cran. C'est là que moyenne et médiane se croisent — l'état où deux
 * étiquettes pourraient se chevaucher.
 */
async function sweepAxis(page, steps, audit) {
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

const run = async () => {
  const browser = await chromium.launch();

  // ── 1. Index ──
  {
    const { ctx, page } = await openSeeded(browser, M.index, { tag: 'index' });
    const body = await page.textContent('body');
    check('index se charge', body.length > 200);
    check('index sans NaN', !body.includes('NaN'));
    check('carte du module 0 présente', /Mission de départ/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}st-index.png`, fullPage: true });
    await ctx.close();
  }

  // ── 2. Diagnostic non bloquant ──
  {
    const { ctx, page } = await openSeeded(browser, M.diag, { tag: 'diag' });
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    check('diagnostic : bouton suivant actif avant toute réponse',
      (await nextBtn.count()) > 0 && (await nextBtn.isEnabled()));
    const groups = page.locator('div[role="group"]');
    const n = await groups.count();
    for (let i = 0; i < n; i += 1) {
      const o = groups.nth(i).locator('button[aria-pressed]').first();
      if (await o.count()) await o.click().catch(() => {});
      await page.waitForTimeout(120);
    }
    const sub = page.locator('button:has-text("Voir mon résultat")').first();
    if (await sub.count()) await sub.click().catch(() => {});
    await settle(page);
    check('diagnostic : un résultat s’affiche',
      /\/\s*10|Ton score|bases|Revoir|correction/i.test((await page.textContent('body')).replace(/\s+/g, ' ')));
    await ctx.close();
  }

  // ── 3. M1 — le laboratoire du dé : prédire, lancer, relancer, stabiliser ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], tag: 'm1' });
    const issues = [];
    const audit = async () => { issues.push(...await layoutAudit(page)); };
    const body = async () => (await page.textContent('body')).replace(/\s+/g, ' ');

    // Étape 1 — la prédiction ouvre le module ; Lancer n'existe qu'après.
    const predict = page.locator('button[aria-label^="Prédire la face"]');
    check('M1 : six faces à prédire ouvrent le module', (await predict.count()) === 6, `${await predict.count()} chips`);
    check('M1 : pas de bouton Lancer avant la prédiction',
      (await page.locator('button[aria-label="Lancer le dé"]').count()) === 0);
    await predict.nth(3).click();
    await page.waitForTimeout(120);
    const lancer = page.locator('button[aria-label="Lancer le dé"]').first();
    check('M1 : Lancer apparaît après la prédiction', (await lancer.count()) > 0 && (await lancer.isEnabled()));
    await lancer.click();
    await page.waitForTimeout(150);
    check('M1 : le résultat n’est pas révélé pendant le roulement (settle-then-number)',
      /🎲 …/.test(await body()));
    await page.waitForTimeout(800);
    await audit();
    check('M1 : le résultat est annoncé et la barre porte un effectif',
      /🎲 → [1-6]/.test(await body()) && /Tu avais dit 4/.test(await body()));
    for (let i = 0; i < 2; i += 1) { await lancer.click(); await page.waitForTimeout(950); await audit(); }
    check('M1 : trois lancers → l’expérience aléatoire est nommée', /expérience aléatoire/.test(await body()));
    check('M1 : le pari et le résultat ne sont pas confondus (tally)', /tu as deviné [0-3] fois/.test(await body()));

    // Étape 2 — on continue la même série jusqu'à 10.
    const dix = page.locator('button[aria-label="Lancer 10 fois"]').first();
    check('M1 : ×10 s’ouvre à l’étape 2', (await dix.count()) > 0);
    await dix.click();
    await page.waitForTimeout(1100);
    await audit();
    const q2 = page.locator('button:has-text("trop peu pour juger")').first();
    check('M1 : à 10 lancers, la question « trop peu » apparaît', (await q2.count()) > 0);
    const wrong2 = page.locator('button:has-text("rattraper son retard")').first();  // erreur volontaire
    if (await wrong2.count()) await wrong2.click();
    await settle(page);
    check('M1 : l’erreur « rattrapage » est corrigée et le vocabulaire posé après le geste',
      /Bonne réponse/.test(await body()) && /effectif/.test(await body()) && /valeurs/.test(await body()));

    // Étape 3 — une série neuve de 100, puis la fréquence en %.
    const s100 = page.locator('button[aria-label="Nouvelle série de 100 lancers"]').first();
    check('M1 : la série de 100 s’ouvre à l’étape 3', (await s100.count()) > 0);
    await s100.click();
    await page.waitForTimeout(1100);
    await audit();
    const txt3 = await body();
    const m3 = txt3.match(/la face ([1-6]) est sortie (\d+) fois\. Est-ce beaucoup/);
    check('M1 : la question de fréquence cite la face en tête et son effectif', !!m3, txt3.slice(0, 80));
    const input = page.locator('input[type="text"]').first();
    await input.fill('6');   // erreur volontaire : le nombre de faces
    await page.locator('button:has-text("OK")').first().click();
    await settle(page);
    check('M1 : la fréquence erronée est corrigée nommément',
      /Bonne réponse/.test(await body()) && /nombre de faces/.test(await body()));
    check('M1 : les fréquences en % apparaissent après la découverte', /\d,\d %/.test(await body()));

    // Étape 4 — parier, trois séries de 1 000, la face en tête change.
    const bet = page.locator('button[aria-label^="Parier sur la face"]');
    check('M1 : le pari précède la série de 1 000', (await bet.count()) === 6
      && (await page.getByRole('button', { name: /Nouvelle série de 1.000 lancers/ }).count()) === 0);
    await bet.nth(5).click();
    await page.waitForTimeout(120);
    for (let i = 0; i < 3; i += 1) {
      const s1000 = page.getByRole('button', { name: /Nouvelle série de 1.000 lancers/ }).first();
      check(`M1 : série ${i + 1} de 1 000 disponible`, (await s1000.count()) > 0);
      await s1000.click();
      await page.waitForTimeout(1100);
      await audit();
    }
    check('M1 : le pari est confronté au résultat', /Tu avais parié sur 6 : (gagné|raté)/.test(await body()));
    check('M1 : les faces en tête de chaque série sont journalisées', /Série 3 : face/.test(await body()));
    const q4 = page.locator('button:has-text("Aucune face ne domine")').first();
    check('M1 : la question sur la face en tête apparaît après trois séries', (await q4.count()) > 0);
    await q4.click();
    await settle(page);

    // Étape 5 — les trois séries côte à côte.
    check('M1 : trois instantanés comparés (10, 100, 1 000)',
      /écart/.test(await body()) && (await page.locator('[aria-label="Comparaison de trois séries de lancers"] svg').count()) === 3);
    await audit();
    await page.locator('button:has-text("deviennent exactement égales")').first().click();  // erreur volontaire
    await settle(page);
    check('M1 : « exactement égales » est corrigé avec les écarts de l’élève',
      /Bonne réponse/.test(await body()) && /stabilisent/.test(await body()));

    // Étape 6 — retour au jeu.
    await page.locator('button:has-text("Faux : sur 1 000 lancers")').first().click();
    await settle(page);
    await page.locator('button:has-text("Trois lancers ne prouvent rien")').first().click();
    await settle(page);
    check('M1 : le dé n’a pas de mémoire', /pas de mémoire/.test(await body()));

    // Étape 7 — 1/6 se révèle SUR la série de 1 000.
    check('M1 : aucun repère théorique avant l’étape 7', !/probabilité du modèle/.test(await body()));
    await page.locator('#step-7 [role="group"] button').first().click();
    await settle(page);
    check('M1 : le repère 1/6 apparaît sur la série de l’élève, après la réponse',
      /probabilité du modèle, dé équilibré/.test(await body()) && /P\(6\) = 1\/6/.test(await body()));
    await audit();

    // Étape 8 — fréquence ≠ probabilité, avec le nombre de l'élève.
    check('M1 : la carte « expérience » cite la fréquence du 6 sur 100 lancers', /Face 6 → \d+,\d %/.test(await body()));
    await page.locator('button:has-text("La fréquence vient de l’expérience")').first().click();
    await settle(page);

    // Étape 9 — le dé truqué.
    await page.locator('#step-9 button[aria-label="Alourdir la face 6"]').click();
    await page.waitForTimeout(120);
    const sl = page.locator('#step-9').getByRole('button', { name: /Nouvelle série de 1.000 lancers/ }).first();
    check('M1 : la série truquée s’ouvre après le choix de la face', (await sl.count()) > 0);
    await sl.click();
    await page.waitForTimeout(1100);
    await audit();
    check('M1 : le dé truqué est annoncé et ses repères diffèrent',
      /dé truqué \(face 6\)/.test(await body()) && /3\/8 = 37,5 %/.test(await body()));
    await page.locator('button:has-text("Non : 1/6 suppose")').first().click();
    await settle(page);
    check('M1 : la fréquence de la face alourdie est citée', /la face 6 est sortie à \d+,\d %/.test(await body()));

    // Étape 10 — sans manipulation.
    await page.locator('#step-10 [role="group"] button').first().click();
    await settle(page);
    await page.locator('button:has-text("22 % est la fréquence observée")').first().click();
    await settle(page);
    const nextBtn = page.locator('button:has-text("Module suivant")').first();
    check('M1 : le module se termine sur la compréhension, pas sur un clic', (await nextBtn.count()) > 0 && (await nextBtn.isEnabled()));

    // Labo libre — les grands totaux restent lisibles.
    const k1000 = page.getByRole('button', { name: /Lancer 1.000 fois/ }).first();
    check('M1 : le labo libre ouvre ×1 000', (await k1000.count()) > 0);
    for (let i = 0; i < 5; i += 1) { await k1000.click(); await page.waitForTimeout(1000); await audit(); }
    check('M1 : 6 000 lancers affichés (1 000 truqués + 5 × 1 000)', /6.000 lancers/.test(await body()));
    await page.locator('button[aria-label="Alourdir la face 1"]').last().click();
    await page.locator('button[aria-label="Lancer 100 fois"]').first().click();
    await page.waitForTimeout(1000);
    await audit();
    check('M1 : mise en page correcte à chaque état du laboratoire',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}st-m1-de.png`, fullPage: true });
    await ctx.close();
  }

  // ── 4. M2 — le point d'équilibre, avec échappée ──
  {
    const { ctx, page } = await openSeeded(browser, M.m2, { completedModules: ['0','1'], tag: 'm2' });
    check('M2 : le pivot est déplaçable', (await page.locator('rect[role="slider"]').count()) > 0);
    const issues = await sweepAxis(page, 9, layoutAudit);
    check('M2 : mise en page correcte sur tout l’axe', issues.length === 0, issues.slice(0, 3).join(' | '));
    const body = await page.textContent('body');
    check('M2 : le déséquilibre est orienté et quantifié',
      /penche (à droite|à gauche)|Équilibre atteint/.test(body));
    const escape = page.locator('button:has-text("montre-moi")').first();
    if (await escape.count()) { await escape.click(); await settle(page); }
    check('M2 : l’équilibre est atteint ou révélé',
      /pivot est en|Équilibre atteint/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}st-m2-equilibre.png`, fullPage: true });
    await ctx.close();
  }

  // ── 5. M3 — la médiane, avec le décompte de part et d'autre ──
  {
    const { ctx, page } = await openSeeded(browser, M.m3, { completedModules: ['0','1','2'], tag: 'm3' });
    const issues = await sweepAxis(page, 9, layoutAudit);
    check('M3 : mise en page correcte sur tout l’axe', issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M3 : le décompte de part et d’autre est annoncé',
      /en dessous|au-dessus|médiane/i.test(await page.textContent('body')));
    const escape = page.locator('button:has-text("montre-moi")').first();
    if (await escape.count()) { await escape.click(); await settle(page); }
    await page.screenshot({ path: `${SHOT_DIR}st-m3-mediane.png`, fullPage: true });
    await ctx.close();
  }

  // ── 6. M4 — la série élastique : moyenne et médiane divergent ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, { completedModules: ['0','1','2','3'], tag: 'm4' });
    const pred = page.locator('button:has-text("La moyenne augmente, la médiane ne bouge pas")').first();
    if (await pred.count()) { await pred.click(); await settle(page); }
    check('M4 : les trois lectures sont affichées',
      /Moyenne/.test(await page.textContent('body')) && /Médiane/.test(await page.textContent('body')));
    // Tirer la valeur extrême sur tout l'axe : c'est l'état où moyenne et
    // médiane peuvent se rejoindre, donc où les étiquettes risquent de se toucher.
    const issues = await sweepAxis(page, 9, layoutAudit);
    check('M4 : mise en page correcte quand on tire la valeur',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M4 : la divergence des indicateurs est reconnue',
      /médiane restait|Déplace une valeur/i.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}st-m4-elastique.png`, fullPage: true });
    await ctx.close();
  }

  // ── 7. M5 — les trois indicateurs sur un même axe ──
  {
    const { ctx, page } = await openSeeded(browser, M.m5, { completedModules: ['0','1','2','3','4'], tag: 'm5' });
    const audit = await layoutAudit(page);
    check('M5 : les trois repères cohabitent sans se chevaucher',
      audit.length === 0, audit.slice(0, 3).join(' | '));
    check('M5 : la synthèse des trois indicateurs est présente',
      /À retenir/.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}st-m5-trois.png`, fullPage: true });
    await ctx.close();
  }

  // ── 8. M6 — deux classes, même moyenne ──
  {
    const { ctx, page } = await openSeeded(browser, M.m6, { completedModules: ['0','1','2','3','4','5'], tag: 'm6' });
    const svgs = await page.locator('svg').count();
    check('M6 : les deux séries sont affichées', svgs >= 2, `${svgs} svg`);
    const audit = await layoutAudit(page);
    check('M6 : mise en page correcte des deux axes', audit.length === 0, audit.slice(0, 3).join(' | '));
    const input = page.locator('input[type="text"]').first();
    if (await input.count()) {
      await input.fill('4');   // l'étendue de A, pas de B : erreur volontaire
      const ok = page.locator('button:has-text("OK")').first();
      if (await ok.count()) await ok.click();
      await settle(page);
    }
    check('M6 : l’erreur d’étendue est corrigée nommément',
      /classe A|Bonne réponse/i.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}st-m6-classes.png`, fullPage: true });
    await ctx.close();
  }

  // ── 9. M7 — viser une moyenne ──
  {
    const { ctx, page } = await openSeeded(browser, M.m7, { completedModules: ['0','1','2','3','4','5','6'], tag: 'm7' });
    const issues = await sweepAxis(page, 10, layoutAudit);
    check('M7 : mise en page correcte pendant le réglage',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    check('M7 : l’écart à la cible est quantifié',
      /il manque|Atteinte|montre-moi/i.test(await page.textContent('body')));
    await page.screenshot({ path: `${SHOT_DIR}st-m7-labo.png`, fullPage: true });
    await ctx.close();
  }

  // ── 10. Boss ──
  {
    const { ctx, page } = await openSeeded(browser, M.boss, {
      completedModules: ['0','1','2','3','4','5','6','7'], tag: 'boss',
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
    check('boss : la synthèse est atteignable',
      /Trois façons de résumer|choix de l’indicateur/i.test(await page.textContent('body')));
    const audit = await layoutAudit(page);
    check('boss : mise en page de la synthèse correcte', audit.length === 0, audit.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}st-boss.png`, fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    check('boss : le rechargement montre la revue', /Refaire|score|résultat/i.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 11. Revisite ──
  {
    const { ctx, page } = await openSeeded(browser, M.m4, {
      completedModules: ['0','1','2','3','4','5','6','7','8'], tag: 'revisit',
    });
    check('revisite : aucune étape verrouillée',
      !/termine l’étape précédente|termine l\'étape précédente/.test(await page.textContent('body')));
    await ctx.close();
  }
  {
    const { ctx, page } = await openSeeded(browser, M.m1, {
      completedModules: ['0','1','2','3','4','5','6','7','8'], tag: 'revisit-m1',
    });
    check('revisite M1 : toutes les étapes ouvertes et le labo libre présent',
      !/termine l’étape précédente/.test(await page.textContent('body')) && /Labo libre/.test(await page.textContent('body')));
    await ctx.close();
  }

  // ── 12. Mobile ──
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
    // L'étape 2 est verrouillée tant que la prédiction n'est pas faite : sans
    // elle, la zone tactile n'existe pas encore.
    const predM = page.locator('button:has-text("La moyenne augmente, la médiane ne bouge pas")').first();
    if (await predM.count()) { await predM.click(); await settle(page); }
    check('mobile : la manipulation est déverrouillée après la prédiction',
      (await page.locator('rect[role="slider"]').count()) > 0);
    const issues = await sweepAxis(page, 9, layoutAudit);
    check('mobile : mise en page correcte sur tout l’axe à 375 px',
      issues.length === 0, issues.slice(0, 3).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}st-mobile.png`, fullPage: true });
    await ctx.close();
  }

  // ── 13. Mobile — le laboratoire du dé à 375 px ──
  {
    const { ctx, page } = await openSeeded(browser, M.m1, { completedModules: ['0'], mobile: true, tag: 'mobile-m1' });
    check('mobile M1 : pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    await page.locator('button[aria-label="Prédire la face 2"]').tap();
    await page.waitForTimeout(120);
    const lancer = page.locator('button[aria-label="Lancer le dé"]').first();
    const issues = [];
    for (let i = 0; i < 3; i += 1) { await lancer.tap(); await page.waitForTimeout(950); issues.push(...await layoutAudit(page)); }
    await page.locator('button[aria-label="Lancer 10 fois"]').first().tap();
    await page.waitForTimeout(1100);
    issues.push(...await layoutAudit(page));
    check('mobile M1 : mise en page correcte pendant les lancers', issues.length === 0, issues.slice(0, 3).join(' | '));
    const small = await page.evaluate(() => {
      const bad = [];
      for (const b of document.querySelectorAll('main button')) {
        if (b.disabled) continue;
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20));
      }
      return bad;
    });
    check('mobile M1 : cibles tactiles ≥ 40 px', small.length === 0, small.join(' | '));
    check('mobile M1 : toujours pas de défilement horizontal',
      await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
    await page.screenshot({ path: `${SHOT_DIR}st-m1-mobile.png`, fullPage: true });
    await ctx.close();
  }

  check('aucune erreur console/page sur toute la suite', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
};

run().then(() => process.exit(summary() ? 1 : 0), (e) => { console.error('RUNNER CRASH', e); process.exit(2); });
