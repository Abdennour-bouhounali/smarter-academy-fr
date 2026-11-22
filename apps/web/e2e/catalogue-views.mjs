// QA — les VUES du catalogue de leçons (CatalogueBrowser / catalogueView.js).
//
// Lancement (Vite sur 5173 et l'API sur 8000 en marche) :
//   node apps/web/e2e/catalogue-views.mjs
// /courses exige un compte depuis le 2026-10-07 (RequireAccount) : le script se connecte UNE fois en élève
// de QA (qa-eleve@smarter.dz ; /auth/login est limité à 6/min) et pose le jeton dans chaque contexte.
//
// Sur /courses (4AM, tous les ميادين), bureau 1440 et téléphone 390, pour
// chacune des 3 organisations × 2 dispositions : la vue rendue est la bonne
// (`data-catalogue-view`), la page ne déborde pas horizontalement, le nombre
// de leçons affichées correspond à l'organisation (unités : cartes d'unité ;
// ميادين et كل الدروس : chaque leçon du niveau une fois), aucune erreur
// console. Puis le choix fait au clic SURVIT au rechargement, et une
// recherche désactive l'organisation sans désactiver la disposition.
// Captures dans /tmp/catalogue-views-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/catalogue-views-qa';
const URL = `${BASE}/courses?level=moyen&grade=4am&chapter=all`;
const KEY = 'sa.catalogue.view';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: process.env.QA_PASSWORD || 'QaPass2026!' };
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(STUDENT) });
const loginData = await login.json().catch(() => ({}));
const TOKEN = loginData.token ?? loginData.access_token ?? loginData.data?.token;
if (!TOKEN) throw new Error(`login ${STUDENT.email}: ${login.status}`);

const browser = await chromium.launch();
for (const [vpName, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  let totalLessons = null;
  for (const group of ['units', 'chapters', 'all']) {
    for (const layout of ['grid', 'rows']) {
      const ctx = await browser.newContext({ viewport, locale: 'ar' });
      await ctx.addInitScript(([k, v, tk]) => { localStorage.setItem(k, v); localStorage.setItem('token', tk); }, [KEY, JSON.stringify({ group, layout }), TOKEN]);
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.waitForSelector(`[data-catalogue-view="${group}"]`, { timeout: 15000 });
      const tag = `${vpName} ${group}/${layout}`;

      const m = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rows: document.querySelectorAll('[data-lesson-row]').length,
        cards: document.querySelectorAll('[data-catalogue-view] a[href*="/courses/"]:not([data-unit-group]), [data-catalogue-view] [data-hidden-by-teacher]').length,
        units: document.querySelectorAll('[data-catalogue-view] [data-unit-group]').length,
        count: document.querySelector('[data-catalogue-count]')?.textContent ?? '',
        pressed: [...document.querySelectorAll('[data-catalogue-view-toolbar] [aria-pressed="true"]')].map((b) => b.dataset.catalogueGroup || b.dataset.catalogueLayout),
      }));
      check(m.overflow <= 1, `${tag}: pas de débordement horizontal (${m.overflow}px)`);
      check(m.pressed.includes(group) && m.pressed.includes(layout), `${tag}: la barre montre le choix (${m.pressed.join(',')})`);
      check(errors.length === 0, `${tag}: aucune erreur console${errors.length ? ` — ${errors[0]}` : ''}`);
      if (group === 'units') check(m.units > 0, `${tag}: des cartes d'unité (${m.units})`);
      if (group !== 'units') {
        const shown = layout === 'rows' ? m.rows : m.cards;
        totalLessons ??= shown;
        check(shown > 0 && shown === totalLessons, `${tag}: chaque leçon une fois (${shown})`);
      }
      await page.screenshot({ path: `${OUT}/${vpName}-${group}-${layout}.png`, fullPage: false });
      await ctx.close();
    }
  }
}

// Le choix au clic survit au rechargement ; la recherche n'organise plus.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ar' });
  await ctx.addInitScript((tk) => localStorage.setItem('token', tk), TOKEN);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.click('[data-catalogue-group="chapters"]');
  await page.click('[data-catalogue-layout="rows"]');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-catalogue-view="chapters"]');
  check(await page.locator('[data-catalogue-layout="rows"][aria-pressed="true"]').count() === 1, 'le choix survit au rechargement');
  await page.fill('[data-lesson-search]', 'القاسم');
  check(await page.locator('[data-catalogue-group="units"]').isDisabled(), 'recherche : organisation désactivée');
  check(await page.locator('[data-catalogue-layout="grid"]').isEnabled(), 'recherche : disposition toujours active');
  check(await page.locator('[data-lesson-row]').count() > 0, 'recherche : résultats en lignes');
  await page.screenshot({ path: `${OUT}/search-rows.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\nTout est vert.');
process.exit(failures.length ? 1 : 0);
