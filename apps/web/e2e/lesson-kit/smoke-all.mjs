// SMOKE — chaque page de leçon rend-elle sans erreur ?
//
// Les portes existantes (validate:lessons, audit:knowledge, check:katex) lisent
// le SOURCE. Aucune ne charge la page : une exception au rendu, un import mort
// ou un composant absent leur échappent complètement. Cette suite ouvre chaque
// module de chaque leçon et écoute la console.
//
//   node apps/web/e2e/lesson-kit/smoke-all.mjs [6e|3e|seconde]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.KIT_BASE || 'http://localhost:5250';
const ROOT = new URL('../../src/lessons/', import.meta.url).pathname;
const only = process.argv[2];

/** Toutes les pages déclarées par les lesson.config.js. */
function lessons() {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (!statSync(p).isDirectory()) continue;
      const cfg = join(p, 'lesson.config.js');
      try { statSync(cfg); } catch { walk(p); continue; }
      const src = readFileSync(cfg, 'utf8');
      const base = src.match(/LESSON_BASE_PATH = '([^']+)'/)?.[1];
      const id = src.match(/\bid: '([^']+)'/)?.[1];
      const grade = src.match(/grade: '([^']+)'/)?.[1];
      if (!base || !id) continue;
      if (only && grade !== only) continue;
      const slugs = [...src.matchAll(/slug: '([^']*)'/g)].map((m) => m[1]);
      out.push({ id, grade, base, slugs });
    }
  };
  walk(ROOT);
  return out;
}

const all = lessons();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
let pages = 0; let broken = 0; const failures = [];

for (const L of all) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Toutes les étapes débloquées : on veut voir chaque module, pas l'écran de
  // verrouillage. `completedModules` est stocké en CHAÎNES (piège connu).
  // Les ids de module sont ZÉRO-PADDÉS dans lesson.config.js ('00', '01'…)
  // mais certaines leçons stockent la forme courte. On sème les DEUX, sinon
  // `sequentialUnlock` laisse la page sur « Module verrouillé » — que le
  // contrôle prendrait à tort pour un défaut de rendu.
  const seeded = [];
  for (let i = 0; i < L.slugs.length + 2; i += 1) {
    seeded.push(String(i), String(i).padStart(2, '0'));
  }
  // La clé est scopée par utilisateur ; un visiteur anonyme n'a pas de préfixe.
  for (const key of [`smarter_lesson_${L.id}`, `u_anon_smarter_lesson_${L.id}`]) {
    await ctx.addInitScript(([k, mods]) => {
      localStorage.setItem(k, JSON.stringify({ completedModules: mods, completedExercises: [] }));
    }, [key, seeded]);
  }
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

  for (const slug of L.slugs) {
    errs.length = 0;
    const url = `${BASE}${L.base}/${slug}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(450);
      const text = (await page.textContent('body')) || '';
      pages += 1;
      // Une page vide est un rendu cassé, même sans erreur console.
      if (text.replace(/\s+/g, ' ').trim().length < 200) {
        broken += 1;
        failures.push({ url, why: 'page vide', detail: `${text.trim().length} caractères` });
      } else if (!(await page.locator('#app-header, [data-lesson-shell], main').count())
                 || /Les mathématiques ne sont pas fa/.test(text)) {
        // PIÈGE : une leçon absente d'App.jsx n'est pas une 404 — le routeur
        // retombe sur la page d'accueil commerciale. La page « rend » donc
        // parfaitement, sans la moindre erreur, et le contrôle passerait.
        // On refuse explicitement ce cas : une URL de leçon doit servir une
        // leçon (17 leçons de 2nde étaient dans cet état, 2026-09-07).
        broken += 1;
        failures.push({ url, why: 'non routée (retombe sur la landing)', detail: 'absente de src/App.jsx ?' });
      } else if (errs.length) {
        broken += 1;
        failures.push({ url, why: 'erreur console', detail: errs[0] });
      }
    } catch (e) {
      pages += 1; broken += 1;
      failures.push({ url, why: 'navigation', detail: String(e).slice(0, 160) });
    }
  }
  await ctx.close();
}
await browser.close();

console.log(`\n${pages} page(s) visitée(s) · ${broken} en défaut`);
for (const f of failures) console.log(`  ✗ ${f.url}\n      ${f.why} : ${f.detail}`);
process.exit(broken ? 1 : 0);
