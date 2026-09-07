// Barre latérale élève — BASCULE OUVRIR / RÉDUIRE.
//
// Deux raisons de se comprimer, un seul état (WorkspaceLayoutContext) :
//
//   repli MANUEL  — l'élève veut plus de place, carte ou pas
//   mode COLONNE  — « Ma carte » a besoin de la place, et l'emporte
//
// Ce que cette suite verrouille : la bascule fonctionne et persiste, elle
// n'existe pas sur mobile, et surtout elle ne peut PAS casser la mise en page
// à trois colonnes de « Ma carte ».
//
// Run: node apps/web/e2e/lesson-kit/sidebar-toggle.mjs   (vite sur :5273)
import { chromium } from 'playwright';

const B = process.env.KIT_BASE || 'http://localhost:5273';
const LESSON = '/courses/college/3e/donnees_probabilites/fonctions-3e';
const MODULE = `${LESSON}/le-tableau-de-valeurs`;

let pass = 0, fail = 0;
const check = (n, c, d = '') => { c ? pass++ : fail++; console.log((c ? '  ok  ' : 'FAIL  ') + n + (c ? '' : '   << ' + d)); };

const browser = await chromium.launch({ args: ['--no-sandbox'] });

const widths = (page) => page.evaluate(() => ({
  aside: document.querySelector('aside')?.getBoundingClientRect().width ?? null,
  toggle: !!document.querySelector('[data-sidebar-toggle]'),
  disabled: document.querySelector('[data-sidebar-toggle]')?.disabled ?? null,
  label: document.querySelector('[data-sidebar-toggle]')?.getAttribute('aria-label') ?? null,
  map: document.getElementById('km-root')?.getBoundingClientRect().width ?? null,
  hScroll: document.scrollingElement.scrollWidth > window.innerWidth + 1,
}));

async function open(vp, url = MODULE) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 500, isMobile: vp.width < 500 });
  await ctx.addInitScript(() => {
    localStorage.setItem('token', 'fake');
    const d = JSON.stringify({ completedModules: ['0', '1', '2', '3', '4', '5', '6'], completedExercises: [] });
    localStorage.setItem('u_1_smarter_lesson_fonctions-3e', d);
    localStorage.removeItem('sidebarCollapsed');
    localStorage.removeItem('knowledgeMapPrior');
    localStorage.removeItem('knowledgeMapExpanded');
  });
  const page = await ctx.newPage();
  await page.route('**/auth/me', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 1, name: 'T', email: 't@t.fr', role: 'student', grade: { id: 11, name: '3e', slug: '3e' } } }),
  }));
  await page.goto(B + url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2400);
  return { ctx, page };
}

/* ── 1 — la bascule, dans les deux sens ──────────────────────────────────── */
{
  console.log('\n=== toggle: collapse and reopen ===');
  const { ctx, page } = await open({ width: 1440, height: 900 });

  const a = await widths(page);
  check('départ: barre déployée (256)', Math.abs(a.aside - 256) < 2, JSON.stringify(a));
  check('départ: la bascule existe et est active', a.toggle && a.disabled === false);
  check('départ: elle propose de RÉDUIRE', /Réduire/.test(a.label), a.label);

  await page.locator('[data-sidebar-toggle]').click();
  await page.waitForTimeout(600);
  const b = await widths(page);
  check('après clic: barre comprimée (80)', Math.abs(b.aside - 80) < 2, JSON.stringify(b));
  check('après clic: elle propose d\'OUVRIR', /Ouvrir/.test(b.label), b.label);
  check('après clic: les libellés ont disparu', (await page.locator('aside nav').innerText()).trim() === '');
  check('après clic: les icônes restent cliquables (>= 44px)',
    (await page.locator('aside nav a').first().boundingBox()).height >= 43);
  check('après clic: aucun défilement horizontal', !b.hScroll);

  await page.locator('[data-sidebar-toggle]').click();
  await page.waitForTimeout(600);
  const c = await widths(page);
  check('re-clic: la barre se redéploie (256)', Math.abs(c.aside - 256) < 2, JSON.stringify(c));
  check('re-clic: les libellés reviennent', (await page.locator('aside nav').innerText()).includes('Accueil'));
  await ctx.close();
}

/* ── 2 — la préférence survit à la navigation ────────────────────────────── */
{
  console.log('\n=== toggle: the preference persists ===');
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await page.locator('[data-sidebar-toggle]').click();
  await page.waitForTimeout(500);
  check('stockée sous la clé attendue', (await page.evaluate(() => localStorage.getItem('sidebarCollapsed'))) === 'true');

  // Navigation par CLIC, comme un élève. Un `page.goto` rechargerait la page
  // et rejouerait `addInitScript`, qui efface justement la préférence qu'on
  // vient d'écrire : on testerait le harnais, pas le produit.
  await page.locator('aside a[aria-label="Mes cours"]').click();
  await page.waitForTimeout(1800);
  const n = await widths(page);
  check('après navigation: la barre reste comprimée', Math.abs(n.aside - 80) < 2, JSON.stringify(n));
  await ctx.close();
}

/* ── 3 — le clavier ──────────────────────────────────────────────────────── */
{
  console.log('\n=== toggle: keyboard ===');
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await page.locator('[data-sidebar-toggle]').focus();
  check('la bascule prend le focus', await page.evaluate(() => document.activeElement?.dataset?.sidebarToggle === 'true'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  check('Entrée la déclenche', Math.abs((await widths(page)).aside - 80) < 2);
  await ctx.close();
}

/* ── 4 — « Ma carte » l'emporte, et la bascule ne casse rien ─────────────── */
{
  console.log('\n=== prior mode wins over the manual toggle ===');
  const { ctx, page } = await open({ width: 1440, height: 900 });

  await page.locator('[data-km-trigger]').click();
  await page.waitForTimeout(700);
  await page.locator('#km-root [data-km-view="prior"]').click();
  await page.waitForTimeout(900);

  const p = await widths(page);
  check('colonne: la barre est comprimée', Math.abs(p.aside - 80) < 2, JSON.stringify(p));
  check('colonne: la bascule est VERROUILLÉE', p.disabled === true, JSON.stringify(p));
  check('colonne: son libellé explique pourquoi', /Ma carte/.test(p.label), p.label);

  // Le clic verrouillé ne doit RIEN changer : la carte garde sa colonne.
  await page.locator('[data-sidebar-toggle]').click({ force: true });
  await page.waitForTimeout(600);
  const q = await widths(page);
  check('colonne: un clic forcé ne rouvre pas la barre', Math.abs(q.aside - 80) < 2, JSON.stringify(q));
  check('colonne: la carte garde sa colonne', q.map && q.map >= 300, JSON.stringify(q));
  check('colonne: toujours aucun défilement horizontal', !q.hScroll);

  // En fermant la carte, la bascule se déverrouille et la barre revient.
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click();
  await page.waitForTimeout(900);
  const r = await widths(page);
  check('carte fermée: la bascule redevient active', r.disabled === false, JSON.stringify(r));
  check('carte fermée: la barre se redéploie', Math.abs(r.aside - 256) < 2, JSON.stringify(r));
  await ctx.close();
}

/* ── 5 — le repli manuel SURVIT au mode colonne ──────────────────────────── */
{
  console.log('\n=== a manual collapse survives a prior-mode round trip ===');
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await page.locator('[data-sidebar-toggle]').click();   // repli manuel
  await page.waitForTimeout(500);
  await page.locator('[data-km-trigger]').click();
  await page.waitForTimeout(700);
  await page.locator('#km-root [data-km-view="prior"]').click();
  await page.waitForTimeout(900);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click();
  await page.waitForTimeout(900);
  const r = await widths(page);
  check('la barre reste comprimée: c\'était le choix de l\'élève', Math.abs(r.aside - 80) < 2, JSON.stringify(r));
  await ctx.close();
}

/* ── 6 — mobile : rien de tout cela ──────────────────────────────────────── */
for (const vp of [{ width: 820, height: 1180 }, { width: 375, height: 667 }]) {
  console.log(`\n=== mobile ${vp.width}: the tab bar is the navigation ===`);
  const { ctx, page } = await open(vp);
  const m = await widths(page);
  // L'aside entier est `hidden lg:flex` : il mesure 0 et la bascule est
  // invisible, sans qu'aucune règle mobile spécifique n'ait été écrite.
  check(`mobile(${vp.width}): la barre latérale ne s'affiche pas`, !m.aside, JSON.stringify(m));
  check(`mobile(${vp.width}): la barre d'onglets basse est là`,
    (await page.locator('nav.lg\\:hidden a').count()) > 0);
  check(`mobile(${vp.width}): aucun défilement horizontal`, !m.hScroll);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
