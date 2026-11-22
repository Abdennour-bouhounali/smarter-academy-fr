// QA des laboratoires à sections du مختبر (الجبر، الاحتمالات والإحصاء، الأعداد والحساب).
//
// Lancement (Vite sur 5173 et l'API sur 8000 en marche, comptes QA importés) :
//   node apps/web/e2e/mathlab-labs-sections.mjs [shots]
//
// Une seule connexion API (l'API limite /auth/login à 6/min) : le jeton de
// l'enseignant QA est posé dans localStorage de chaque contexte. Pour chaque
// route enseignant (/enseignant/atelier/<slug>), à 1280 px puis 390 px, le
// script ouvre CHAQUE section de la barre des laboratoires et vérifie :
//   - l'onglet de la section est sélectionné ;
//   - aucun débordement horizontal de la page ;
//   - aucun « NaN », « Infinity », « undefined » ni clé i18n brute (`tools.…`) visible ;
//   - aucune erreur de page.
// Avec `shots`, une capture par section et par largeur dans QA_OUT.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/mathlab-labs-qa';
const SHOTS = process.argv.includes('shots');
const ROUTES = [
  { slug: 'algebre', name: 'algebra' },
  { slug: 'probabilites-statistiques', name: 'probability' },
  { slug: 'nombres-calcul', name: 'numbers' },
];
const VIEWPORTS = [
  { width: 1280, height: 800, label: 'desktop' },
  { width: 390, height: 844, label: 'phone', hasTouch: true, isMobile: true },
];

mkdirSync(OUT, { recursive: true });

let passed = 0;
let failed = 0;
const check = (ok, label) => {
  if (ok) { passed += 1; console.log(`  ✓ ${label}`); } else { failed += 1; console.log(`  ✗ ${label}`); }
};

async function loginToken(who) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
  return token;
}

const token = await loginToken(TEACHER);
const browser = await chromium.launch();

try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: Boolean(viewport.hasTouch),
      isMobile: Boolean(viewport.isMobile),
      locale: 'ar-DZ',
    });
    await context.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);

    for (const route of ROUTES) {
      console.log(`\n${route.name} — /enseignant/atelier/${route.slug} @ ${viewport.label}`);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      await page.goto(`${BASE}/enseignant/atelier/${route.slug}?lab=secondaire`, { waitUntil: 'networkidle' });

      const tabs = page.locator('.sa-ml-kit-nav [role="tab"]');
      await tabs.first().waitFor({ timeout: 20000 });
      const count = await tabs.count();
      check(count >= 3, `la barre des laboratoires propose ${count} sections`);

      for (let index = 0; index < count; index += 1) {
        const tab = tabs.nth(index);
        const id = await tab.getAttribute('data-kit-tab');
        await tab.evaluate((el) => el.click());
        await page.waitForTimeout(700);
        check(await tab.getAttribute('aria-selected') === 'true', `[${id}] l'onglet est sélectionné`);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        check(overflow <= 1, `[${id}] pas de débordement horizontal (${overflow}px)`);

        const text = await page.locator('main, [data-ml-shell], body').first().innerText();
        const bad = text.match(/\bNaN\b|\bInfinity\b|\bundefined\b|tools\.[a-zA-Z]+\.[a-zA-Z.]+|kit\.[a-z]+\.[a-z]+/);
        check(!bad, `[${id}] aucun NaN/Infinity/clé brute visible${bad ? ` — « ${bad[0]} »` : ''}`);

        if (SHOTS) await page.screenshot({ path: `${OUT}/${route.name}-${viewport.label}-${String(index).padStart(2, '0')}-${id}.png`, fullPage: false });
      }

      check(errors.length === 0, `aucune erreur de page${errors.length ? ` — ${errors.slice(0, 3).join(' | ')}` : ''}`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`\n${passed} ✓ · ${failed} ✗${SHOTS ? ` · captures dans ${OUT}` : ''}`);
process.exit(failed ? 1 : 0);
