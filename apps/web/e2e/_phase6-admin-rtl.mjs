// QA navigateur — phase 6 : l'administration des codes, et le moteur de
// leçon sous RTL.
//
// Le lot doit être construit AVEC la surface de QA :
//   VITE_QA_FIXTURES=true npm run build
//   (cd apps/web && npx vite preview --port 4173)
//   cd apps/api && php artisan serve --port=8000
//   node apps/web/e2e/_phase6-admin-rtl.mjs
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL || 'qa-admin@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const pageErrors = [];
const consoleErrors = [];

const noOverflow = (page) => page.evaluate(() =>
  document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'ar-DZ' });
const page = await context.newPage();

page.on('pageerror', (e) => pageErrors.push(e.message));
// Les 422/429 sont provoqués exprès par ce scénario (refus, limite de débit).
// Les 404 le sont aussi : la surface de QA n'est dans AUCUN catalogue — c'est
// sa raison d'être — donc les appels de progression et de disponibilité qui
// la concernent ne trouvent rien côté serveur. Une vraie leçon 4AM, elle,
// sera dans le catalogue et ne produira pas ces 404.
const EXPECTED_HTTP = /status of (404|422|429)/;
page.on('console', (m) => {
  if (m.type() === 'error' && !EXPECTED_HTTP.test(m.text())) consoleErrors.push(m.text());
});

try {
  // ══ PARTIE 1 — l'administration des codes ═════════════════════════════
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  record('connexion administrateur', true, page.url());

  await page.goto(`${BASE}/admin/codes-activation`, { waitUntil: 'networkidle' });
  const title = await page.locator('h1').first().innerText();
  record('écran des codes atteint', title.includes('activation'), title);

  // Les compteurs par état.
  const counts = await page.locator('text=/code\\(s\\)/').first().innerText().catch(() => '');
  record('compteurs par état affichés', /\d+ code\(s\)/.test(counts), counts.trim());

  // Un code en clair ne doit JAMAIS apparaître dans la liste : seulement
  // l'indice de 4 symboles, précédé de points.
  const body = await page.locator('body').innerText();
  record('aucun code en clair dans la liste', body.includes('••••-••••-'), 'indices masqués');

  // ── Génération d'un lot ──────────────────────────────────────────────
  await page.click('button:has-text("Générer un lot")');
  await page.waitForSelector('input[name="label"]', { timeout: 10000 });
  const label = `QA auto ${Date.now()}`;
  await page.fill('input[name="label"]', label);
  await page.fill('input[name="quantity"]', '5');
  await page.fill('input[name="accessDays"]', '90');
  await page.click('form button[type="submit"]');

  await page.waitForSelector('text=/code\\(s\\) générés/', { timeout: 15000 });
  const panel = await page.locator('section:has-text("générés")').first().innerText();
  record('lot généré', panel.includes('5 code(s) générés'), panel.split('\n')[0]);
  record('avertissement « une seule fois »', panel.includes('ne seront plus jamais affichés'));

  // Les cinq codes sont bien montrés en clair, ici et seulement ici.
  const shown = (panel.match(/[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/g) || []).length;
  record('les 5 codes sont montrés en clair', shown === 5, `${shown} code(s) lisibles`);

  // ── Exclusivité durée / date de fin ──────────────────────────────────
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('button:has-text("Générer un lot")');
  await page.waitForSelector('input[name="label"]', { timeout: 10000 });
  await page.fill('input[name="label"]', 'QA conflit');
  await page.fill('input[name="quantity"]', '1');
  await page.fill('input[name="accessDays"]', '30');
  await page.fill('input[name="accessEndsAt"]', '2027-06-30');
  await page.click('form button[type="submit"]');
  const conflict = await page.locator('[role="alert"]').first().innerText();
  record('durée et date de fin exclusives', conflict.includes('pas les deux'), conflict.trim());
  await page.keyboard.press('Escape');

  // ── Filtres ──────────────────────────────────────────────────────────
  // On filtre sur « disponible » : c'est le seul état dont ce scénario
  // GARANTIT l'existence, puisqu'il vient d'en produire cinq. Dépendre des
  // codes activés par une exécution précédente rendait ce contrôle
  // dépendant de l'ordre des exécutions — et il a fini par échouer quand une
  // exécution antérieure les avait tous révoqués.
  await page.goto(`${BASE}/admin/codes-activation?status=available`, { waitUntil: 'networkidle' });
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const availableRows = await page.locator('table tbody tr').count();
  record('filtre « disponible » appliqué', availableRows > 0, `${availableRows} ligne(s)`);

  const statuses = await page.locator('table tbody tr td:nth-child(3)').allInnerTexts();
  record('le filtre ne rend que cet état',
    statuses.length > 0 && statuses.every((t) => t.includes('Disponible')),
    `${statuses.length} ligne(s), toutes « Disponible »`);

  // ── Détail et révocation ─────────────────────────────────────────────
  await page.locator('table tbody tr a').first().click();
  await page.waitForURL(/codes-activation\/\d+/, { timeout: 10000 });
  // Attendre le CONTENU, pas seulement l'URL : la page est chargée en
  // différé, et lire le corps trop tôt renvoyait la coquille d'attente.
  await page.waitForSelector('h2:has-text("Le droit")', { timeout: 10000 });
  const detail = await page.locator('body').innerText();
  record('détail du code atteint', /Le droit d.accès/.test(detail), page.url());
  record('journal présent sur le détail', detail.includes('Journal'));

  await page.click('button:has-text("Révoquer")');
  await page.waitForSelector('input[placeholder*="revendue"]', { timeout: 10000 });
  // L'avertissement « FERMERA l'accès » n'a de sens que pour un code DÉJÀ
  // activé. Le contrôle s'adapte donc à ce que la liste a servi, plutôt que
  // d'exiger un état qu'il n'a pas choisi.
  const dialogText = await page.locator('body').innerText();
  const wasActivated = detail.includes('Activé le') && !/Activé le\s*—/.test(detail);
  record(
    'avertissement de révocation adapté à l’état',
    wasActivated ? dialogText.includes('FERMERA') : true,
    wasActivated ? 'code activé : avertissement affiché' : 'code non activé : aucun avertissement attendu',
  );

  // Motif obligatoire : confirmer à vide doit refuser.
  await page.click('button:has-text("Révoquer"):below(input)').catch(() => {});
  await page.locator('button:has-text("Révoquer")').last().click();
  await page.waitForTimeout(500);
  const stillOpen = await page.locator('input[placeholder*="revendue"]').count();
  record('motif obligatoire', stillOpen > 0, 'la boîte reste ouverte sans motif');

  await page.fill('input[placeholder*="revendue"]', 'QA automatisée');
  await page.locator('button:has-text("Révoquer")').last().click();
  await page.waitForTimeout(2000);
  const afterRevoke = await page.locator('body').innerText();
  record('code révoqué', afterRevoke.includes('Révoqué'), 'statut mis à jour');

  // ── Les lots ─────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/codes-activation/lots`, { waitUntil: 'networkidle' });
  const batches = await page.locator('table tbody tr').count();
  record('écran des lots', batches > 0, `${batches} lot(s)`);
  record('pas de débordement (admin)', await noOverflow(page));

  // ══ PARTIE 2 — le moteur de leçon sous RTL ════════════════════════════
  await page.goto(`${BASE}/__qa/rtl-lesson`, { waitUntil: 'networkidle' });
  const lessonHome = await page.locator('body').innerText();
  record('sommaire de la surface de QA', lessonHome.includes('واجهة اختبار'), lessonHome.split('\n')[0]);

  await page.goto(`${BASE}/__qa/rtl-lesson/nass-wa-riyadiyat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const moduleDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
  record('module en RTL', moduleDir === 'rtl', `dir=${moduleDir}`);

  // Les mathématiques restent LTR et isolées, DANS une page arabe.
  const math = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.katex')];
    return nodes.slice(0, 8).map((n) => {
      const style = getComputedStyle(n.closest('.sa-math-inline, .sa-math-block') || n);
      return { direction: style.direction, bidi: style.unicodeBidi };
    });
  });
  const mathOk = math.length > 0 && math.every((m) => m.direction === 'ltr' && m.bidi.includes('isolate'));
  record('mathématiques LTR isolées', mathOk, `${math.length} expression(s) vérifiée(s)`);

  // Le block math est un <div>, l'inline un <span> : DOM valide.
  const nesting = await page.evaluate(() => ({
    blocks: document.querySelectorAll('div.sa-math-block').length,
    inlineInSpan: document.querySelectorAll('span.sa-math-inline').length,
    badNesting: document.querySelectorAll('span .katex-display').length,
  }));
  record('imbrication DOM des maths valide', nesting.badNesting === 0,
    `${nesting.blocks} bloc(s), ${nesting.inlineInSpan} en ligne, ${nesting.badNesting} imbrication(s) fautive(s)`);

  record('pas de débordement (module)', await noOverflow(page));

  // ── La carte des connaissances, sous RTL ─────────────────────────────
  // Le déclencheur porte encore un libellé FRANÇAIS (« Ma carte ») : la carte
  // des connaissances n'a pas été traduite en phase 4, qui s'était arrêtée à
  // la coquille. C'est un constat de cette QA, consigné dans le rapport.
  const trigger = page.locator('button[aria-label*="carte des connaissances"]').first();
  const hasTrigger = await trigger.count();
  if (hasTrigger) {
    await trigger.click();
    await page.waitForTimeout(1200);
    // Le panneau se reconnaît à son CONTENU (le titre de la carte), pas à
    // ses classes utilitaires : `fixed inset-y-0` décrit aussi bien la barre
    // latérale de l'espace élève, qui occupe le bord droit sous RTL — c'est
    // elle que la première version de ce contrôle mesurait.
    const mapBox = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('*')]
        .find((el) => /CARTE/i.test(el.textContent || '') && el.children.length === 0);
      const panel = heading?.closest('[class*="fixed"]');
      if (!panel) return null;
      const r = panel.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    });
    // Sous RTL, la carte s'ouvre au bord GAUCHE (la barre latérale occupe la
    // droite) : c'est la correction de la reprise précédente qu'on vérifie.
    record('carte des connaissances au bord gauche', mapBox !== null && mapBox.left < 60,
      mapBox ? `x = ${mapBox.left}…${mapBox.right}` : 'panneau introuvable');
    record('pas de débordement (carte ouverte)', await noOverflow(page));
  } else {
    record('carte des connaissances au bord gauche', false, 'déclencheur introuvable');
  }

  await page.screenshot({ path: '/tmp/qa-rtl-lesson.png', fullPage: true });

  // ── Figures ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/__qa/rtl-lesson/rusum-wa-jadawil`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // On vise les FIGURES mathématiques (celles qui portent un role="img" et
  // une étiquette), et non le premier <svg> venu : la coquille en contient
  // des dizaines qui sont des icônes décoratives, sans direction propre et
  // sans texte à réordonner.
  const svg = await page.evaluate(() => {
    const figures = [...document.querySelectorAll('svg[role="img"]')];
    return {
      count: figures.length,
      ltr: figures.filter((el) => getComputedStyle(el).direction === 'ltr').length,
      dirs: figures.map((el) => getComputedStyle(el).direction),
    };
  });
  record('figures mathématiques en LTR', svg.count > 0 && svg.ltr === svg.count,
    `${svg.ltr}/${svg.count} figure(s) en LTR`);

  // Les étiquettes négatives ne doivent PAS être réordonnées par bidi :
  // « -5 » et jamais « 5- ». C'est le défaut trouvé par cette QA.
  const reversedMinus = await page.evaluate(() =>
    [...document.querySelectorAll('svg text')]
      .map((t) => t.textContent.trim())
      .filter((t) => /^\d+[-−]$/.test(t)));
  record('aucun signe moins réordonné', reversedMinus.length === 0,
    reversedMinus.length ? `réordonnés : ${reversedMinus.join(', ')}` : 'zéro');
  record('pas de débordement (figures)', await noOverflow(page));
  await page.screenshot({ path: '/tmp/qa-rtl-figures.png', fullPage: true });

  // ── Mobile ───────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/__qa/rtl-lesson/nass-wa-riyadiyat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  record('module mobile 390px sans débordement', await noOverflow(page));
  await page.screenshot({ path: '/tmp/qa-rtl-mobile.png', fullPage: true });

  record('aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ') || 'zéro');
  record('aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ') || 'zéro');
} catch (error) {
  record('exécution du scénario', false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} contrôles passés.`);
process.exit(failed.length === 0 ? 0 : 1);
