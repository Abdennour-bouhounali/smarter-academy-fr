/**
 * Fumée « Seconde » : chaque module de chaque leçon de 2de s'ouvre vraiment.
 *
 * Pourquoi ce harnais existe : le 2026-09-07, neuf leçons de 2nde étaient
 * vertes à toutes les portes avec une carte des connaissances MORTE — le
 * provider n'était monté nulle part (KNOWLEDGE_MAP_MIGRATION_2NDE.md). La
 * règle qui en est sortie : « ne jamais cocher une ligne sans avoir ouvert la
 * page ». C'est ce que fait ce script, pour l'audit des Learning Points.
 *
 * Il ne rejoue pas les suites 2nde-*.mjs (qui asservissent #app-header et ne
 * s'exécutent plus) : il ouvre, il regarde, il rapporte.
 *
 *   node apps/web/e2e/_2de-smoke.mjs --base http://localhost:5271 \
 *        [--domains a,b] [--lessons id,id] --out docs/audits/2de-smoke.a.json
 *
 * Les comptages de briques sont des MINORANTS : une brique ne se rend qu'après
 * le geste de son étape. On les rapporte, on n'en déduit rien.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const list = (n) => (flag(n) ? flag(n).split(',').map((s) => s.trim()).filter(Boolean) : null);

const BASE = flag('base', 'http://localhost:5271');
const OUT = flag('out', 'docs/audits/2de-smoke.json');
const MATRIX = flag('matrix', 'docs/audits/2de-lp-matrix.json');
const REPO = resolve(new URL('../../..', import.meta.url).pathname);
const abs = (p) => (p.startsWith('/') ? p : resolve(REPO, p));

const matrix = JSON.parse(readFileSync(abs(MATRIX), 'utf-8'));
const onlyDomains = list('domains');
const onlyLessons = list('lessons');
const targets = matrix.lessons.filter((l) => (!onlyDomains || onlyDomains.includes(l.domain)) && (!onlyLessons || onlyLessons.includes(l.id)));

const NOISE = /favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource|ResizeObserver/;
const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 900 }, mobile: false },
  { name: 'mobile', viewport: { width: 375, height: 667 }, mobile: true },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const results = [];
let failures = 0;

for (const lesson of targets) {
  const base = lesson.routes.basePath || `/courses/lycee/seconde/${lesson.domain}/${lesson.id}`;
  const pagesToVisit = [
    { path: base, module: null, title: lesson.title },
    ...lesson.modules.map((m) => ({ path: `${base}/${m.slug}`, module: m.number, title: m.title })),
  ];
  const completed = lesson.modules.map((m) => String(m.number));
  const pages = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: vp.viewport, hasTouch: vp.mobile, isMobile: vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1 });
    // Toutes les portes ouvertes : la clé de progression est PORTÉE PAR
    // UTILISATEUR (u_anon_…), la clé nue est ignorée.
    await ctx.addInitScript(([key, mods]) => {
      localStorage.setItem(key, JSON.stringify({ completedModules: mods, completedExercises: [], xp: 500 }));
    }, [`u_anon_smarter_lesson_${lesson.id}`, completed]);

    for (const target of pagesToVisit) {
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
      page.on('pageerror', (e) => { if (!NOISE.test(e.message)) errors.push(`pageerror: ${e.message}`); });

      const t0 = Date.now();
      const url = BASE + target.path;
      await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
      // Vite compile la route paresseuse à la première visite : la médiane est
      // à 1,4 s, mais une compilation à froid a déjà dépassé 25 s. Un délai
      // large + UN rechargement d'essai évitent qu'une latence du serveur de
      // développement ne se lise comme « leçon non rendue » — le défaut le
      // plus grave que cette fumée doit détecter.
      const WAIT = 45000;

      // Le fil d'Ariane du module est la PREUVE que la bonne route paresseuse
      // a été montée : un h1 peut être celui de la page d'accueil commerciale,
      // qui se rend quand la leçon n'est pas routée.
      let arrived = false;
      let retried = false;
      let why = '';
      if (target.module == null) {
        arrived = await page.locator('main h1').first().waitFor({ timeout: WAIT }).then(() => true).catch(() => false);
        if (arrived && !page.url().includes(target.path)) { arrived = false; why = `redirigé vers ${page.url()}`; }
      } else {
        const crumb = page.locator('nav[aria-label="Fil d\'Ariane"] [aria-current="page"]');
        arrived = await crumb.waitFor({ timeout: WAIT }).then(() => true).catch(() => false);
        if (!arrived) {
          await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
          arrived = await crumb.waitFor({ timeout: WAIT }).then(() => true).catch(() => false);
          if (arrived) retried = true;
        }
        if (arrived) {
          const text = (await crumb.textContent()) ?? '';
          const expected = String(target.module).padStart(2, '0');
          if (!text.trim().startsWith(`${expected}.`)) { arrived = false; why = `fil d'Ariane « ${text.trim().slice(0, 40)} » ≠ module ${expected}`; }
        } else why = 'fil d\'Ariane absent (leçon non rendue)';
      }
      await page.waitForTimeout(350);

      const count = (sel) => page.locator(sel).count().catch(() => 0);
      const kmTrigger = await count('button[data-km-trigger]');
      const bricks = await count('[data-knowledge-brick]');
      const snapshots = await count('[data-knowledge-snapshot]');
      const questionButtons = await count('main div[role="group"] button[aria-pressed]');
      const hScroll = vp.mobile
        ? !(await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1).catch(() => true))
        : false;

      if (!why && errors.length) why = `console: ${errors[0].slice(0, 120)}`;
      if (!why && hScroll) why = 'défilement horizontal à 375 px';
      if (!why && target.module != null && kmTrigger === 0) why = 'carte des connaissances non montée (data-km-trigger absent)';
      const ok = arrived && errors.length === 0 && !hScroll && (target.module == null || kmTrigger > 0);
      if (!ok) failures += 1;

      pages.push({
        path: target.path, module: target.module, viewport: vp.name, ok, why: why || undefined, retried: retried || undefined,
        arrived, consoleErrors: errors.slice(0, 3), kmTrigger, bricksRendered: bricks,
        snapshotRendered: snapshots, questionButtons, hScroll, ms: Date.now() - t0,
      });
      console.log(`${ok ? '✅' : '❌'} [${vp.name}] ${target.path}${ok ? '' : ` — ${why}`}`);
      await page.close();
    }
    await ctx.close();
  }
  results.push({ id: lesson.id, domain: lesson.domain, pages });
}

await browser.close();
mkdirSync(dirname(abs(OUT)), { recursive: true });
const total = results.reduce((n, l) => n + l.pages.length, 0);
writeFileSync(abs(OUT), `${JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), lessons: results }, null, 2)}\n`);
console.log(`\n== ${total - failures}/${total} pages montées — ${OUT}`);
process.exit(failures ? 1 : 0);
