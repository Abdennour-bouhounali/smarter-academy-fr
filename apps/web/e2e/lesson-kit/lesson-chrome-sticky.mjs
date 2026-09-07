// Contrat de mise en page du bandeau de progression (docs/architecture/LESSON_CONTRACT.md).
//
// Vérifie l'invariant dans les DEUX coquilles et à toutes les largeurs :
// le bandeau se colle immédiatement sous le plus haut élément de navigation
// persistant, et au ras du haut quand il n'y en a aucun (élève connecté ≥ lg).
//
// Lancer : node apps/web/e2e/lesson-kit/lesson-chrome-sticky.mjs
// (serveur vite sur :5299, démarré en setsid depuis apps/web/)
import { chromium } from 'playwright';

const BASE = process.env.KIT_BASE || 'http://localhost:5299';
const LESSON = '/courses/college/6e/espace_geometrie/parallelisme-perpendicularite';
const M1 = `${BASE}${LESSON}/les-rails-qui-ne-se-croisent-jamais`;
const M2 = `${BASE}${LESSON}/l-ecart-constant`;
const M3 = `${BASE}${LESSON}/l-angle-droit`;

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440];
const res = [];
const check = (n, c, d = '') => { res.push({ n, c: !!c, d }); console.log(`${c ? 'PASS' : 'FAIL'} ${n}${!c && d ? ` — ${d}` : ''}`); };

async function asStudent(ctx) {
  // StudentLayout dépend de AuthContext.user, qui vient de GET /auth/me.
  await ctx.route('**/auth/me', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 42, name: 'Test', email: 't@t.fr', grade: '6e', role: 'student' } }),
  }));
  await ctx.addInitScript(() => localStorage.setItem('token', 'fake-jwt'));
}

// Géométrie du bandeau : position réelle après défilement.
async function probe(page) {
  return page.evaluate(() => {
    const bar = document.querySelector('div.sticky');
    if (!bar) return { found: false };
    const r = bar.getBoundingClientRect();
    // Le plus haut élément de navigation persistant (fixed) au-dessus.
    let chromeBottom = 0;
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed') continue;
      const b = el.getBoundingClientRect();
      if (b.width < 100 || b.height === 0) continue;
      if (b.top <= 1 && b.bottom > chromeBottom && b.bottom < window.innerHeight / 2) chromeBottom = b.bottom;
    }
    return {
      found: true,
      top: Math.round(r.top),
      chromeBottom: Math.round(chromeBottom),
      stickyTop: getComputedStyle(bar).top,
      count: document.querySelectorAll('div.sticky').length,
      label: bar.textContent.trim(),
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function scrollDown(page) {
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(250);
}

const browser = await chromium.launch();

for (const mode of ['visitor', 'student']) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    if (mode === 'student') await asStudent(ctx);
    const page = await ctx.newPage();
    await page.goto(M1, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const before = await probe(page);
    if (!before.found) { check(`${mode} ${w}px — bandeau présent`, false, 'aucun .sticky'); await ctx.close(); continue; }
    check(`${mode} ${w}px — bandeau présent`, true);
    check(`${mode} ${w}px — un seul bandeau`, before.count === 1, `count=${before.count}`);
    check(`${mode} ${w}px — pas de débordement horizontal`, before.docOverflow <= 0, `overflow=${before.docOverflow}px`);

    await scrollDown(page);
    const after = await probe(page);

    // L'invariant : collé juste sous le plus haut élément persistant,
    // et au ras du haut quand il n'y en a aucun.
    const gap = after.top - after.chromeBottom;
    check(`${mode} ${w}px — collé sous le chrome (écart ${gap}px)`, Math.abs(gap) <= 1,
      `top=${after.top} chromeBottom=${after.chromeBottom} css-top=${after.stickyTop}`);

    if (mode === 'student' && w >= 1024) {
      check(`student ${w}px — aucun vide de 64px`, after.top <= 1, `top=${after.top} (attendu 0)`);
    }
    if (mode === 'visitor') {
      check(`visitor ${w}px — décalage relatif à l'en-tête (64px)`, after.top === 64, `top=${after.top}`);
    }
    await ctx.close();
  }
}

// Transitions de module + rechargement, en connecté grand écran.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await asStudent(ctx);
  // Cette leçon est à déverrouillage séquentiel : sans progression semée,
  // M2/M3 rendent l'écran « Module verrouillé » (sans bandeau, par design).
  await ctx.addInitScript(() => localStorage.setItem(
    'u_42_smarter_lesson_parallelisme-perpendicularite',
    // Les modules PRÉCÉDENTS seulement : le module visité doit être
    // déverrouillé mais pas terminé (ContentModule masque le bandeau
    // une fois toutes les étapes faites — `{!allDone && …}`).
    JSON.stringify({ completedModules: ['0', '1', '2', '3'], completedExercises: [] }),
  ));
  const page = await ctx.newPage();
  const M4 = `${BASE}${LESSON}/le-chasseur-de-relations`;
  for (const [name, url] of [['M4', M4]]) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await scrollDown(page);
    const p = await probe(page);
    check(`student transition ${name} — top=0 & bandeau unique`, p.found && p.top <= 1 && p.count === 1,
      `top=${p.top} count=${p.count} label="${p.label}"`);
  }
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await scrollDown(page); // sticky ne s'applique qu'une fois le seuil dépassé
  const r = await probe(page);
  check('student rechargement — top=0', r.found && r.top <= 1, `top=${r.top}`);
  await ctx.close();
}

await browser.close();
const fails = res.filter((r) => !r.c);
console.log(`\n== ${res.length - fails.length}/${res.length} passed ==`);
fails.forEach((f) => console.log(` - ${f.n} ${f.d}`));
process.exit(fails.length ? 1 : 0);
